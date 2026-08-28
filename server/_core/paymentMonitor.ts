import { getDb } from "../db.js";
import { btcPayments } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { verifyPayment } from "./btcPayment.js";

/**
 * Payment Monitor Service
 * Handles real-time monitoring of Bitcoin payments using polling
 * Updates payment status automatically when confirmations are received
 */

interface PaymentMonitorConfig {
  pollInterval: number; // milliseconds between polls
  maxAttempts: number; // maximum number of poll attempts
  confirmationThreshold: number; // required confirmations for "confirmed" status
}

const DEFAULT_CONFIG: PaymentMonitorConfig = {
  pollInterval: 30000, // 30 seconds
  maxAttempts: 120, // 1 hour total (30s * 120)
  confirmationThreshold: 1, // 1 confirmation is enough for most use cases
};

// Store active monitors to prevent duplicates
const activeMonitors = new Map<string, NodeJS.Timeout>();

/**
 * Start monitoring a payment address
 * Automatically updates database when payment is confirmed
 */
export async function startPaymentMonitor(
  paymentAddress: string,
  expectedBtc: number,
  config: Partial<PaymentMonitorConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Prevent duplicate monitors
  if (activeMonitors.has(paymentAddress)) {
    console.log(`[PaymentMonitor] Monitor already active for ${paymentAddress}`);
    return;
  }

  console.log(
    `[PaymentMonitor] Starting monitor for ${paymentAddress} (expected: ${expectedBtc} BTC)`
  );

  let pollCount = 0;

  const monitorInterval = setInterval(async () => {
    try {
      pollCount++;
      console.log(
        `[PaymentMonitor] Poll #${pollCount} for ${paymentAddress}`
      );

      // Get payment record from database
      const dbInstance = await getDb();
      if (!dbInstance) {
        console.error(`[PaymentMonitor] Database not available for ${paymentAddress}`);
        return;
      }

      const payment = await dbInstance
        .select()
        .from(btcPayments)
        .where(eq(btcPayments.paymentAddress, paymentAddress))
        .limit(1);

      if (!payment || payment.length === 0) {
        console.log(`[PaymentMonitor] Payment record not found for ${paymentAddress}`);
        return;
      }

      const paymentRecord = payment[0];

      // Skip if already confirmed
      if (paymentRecord.status === "confirmed") {
        console.log(`[PaymentMonitor] Payment already confirmed for ${paymentAddress}`);
        stopPaymentMonitor(paymentAddress);
        return;
      }

      // Verify payment on blockchain
      const verification = await verifyPayment(paymentAddress, expectedBtc);
      const isConfirmed = verification.confirmed;

      console.log(`[PaymentMonitor] Verification result:`, {
        address: paymentAddress,
        receivedAmount: verification.receivedAmount,
        confirmations: verification.confirmations,
        confirmed: verification.confirmed,
      });

      // Update payment status if confirmed
      if (verification.confirmed && verification.confirmations >= finalConfig.confirmationThreshold) {
        console.log(`[PaymentMonitor] Payment confirmed! Updating database...`);

        await dbInstance
          .update(btcPayments)
          .set({
            status: "confirmed",
            txHash: verification.txHash,
            confirmations: verification.confirmations,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(btcPayments.paymentAddress, paymentAddress));

        console.log(`[PaymentMonitor] Payment status updated to CONFIRMED`);

        // Stop monitoring
        stopPaymentMonitor(paymentAddress);

        // Emit event for real-time updates (if using WebSocket/SSE)
        emitPaymentUpdate(paymentAddress, {
          status: "confirmed",
          confirmations: verification.confirmations,
          txHash: verification.txHash,
        });
      } else if (verification.receivedAmount && verification.receivedAmount >= expectedBtc) {
        // Payment received but not yet confirmed
        console.log(`[PaymentMonitor] Payment received, waiting for confirmations...`);

        await dbInstance
          .update(btcPayments)
          .set({
            status: "pending",
            confirmations: verification.confirmations,
            updatedAt: new Date(),
          })
          .where(eq(btcPayments.paymentAddress, paymentAddress));

        // Emit update event
        emitPaymentUpdate(paymentAddress, {
          status: "pending",
          confirmations: verification.confirmations,
          received: verification.receivedAmount,
        });
      }

      // Stop monitoring after max attempts
      if (pollCount >= finalConfig.maxAttempts) {
        console.log(`[PaymentMonitor] Max poll attempts reached for ${paymentAddress}`);

        // Mark as expired if still pending
        if (paymentRecord.status === "pending") {
          await dbInstance
            .update(btcPayments)
            .set({
              status: "expired",
              updatedAt: new Date(),
            })
            .where(eq(btcPayments.paymentAddress, paymentAddress));

          emitPaymentUpdate(paymentAddress, {
            status: "expired",
          });
        }

        stopPaymentMonitor(paymentAddress);
      }
    } catch (error) {
      console.error(`[PaymentMonitor] Error monitoring ${paymentAddress}:`, error);

      // Continue monitoring even on error
      if (pollCount >= finalConfig.maxAttempts) {
        stopPaymentMonitor(paymentAddress);
      }
    }
  }, finalConfig.pollInterval);

  activeMonitors.set(paymentAddress, monitorInterval as unknown as NodeJS.Timeout);
}

/**
 * Stop monitoring a payment address
 */
export function stopPaymentMonitor(paymentAddress: string) {
  const monitor = activeMonitors.get(paymentAddress);
  if (monitor) {
    clearInterval(monitor);
    activeMonitors.delete(paymentAddress);
    console.log(`[PaymentMonitor] Stopped monitoring ${paymentAddress}`);
  }
}

/**
 * Stop all active monitors (cleanup on shutdown)
 */
export function stopAllMonitors() {
  console.log(`[PaymentMonitor] Stopping all ${activeMonitors.size} active monitors...`);
  activeMonitors.forEach((monitor) => clearInterval(monitor));
  activeMonitors.clear();
}

/**
 * Get all active monitors
 */
export function getActiveMonitors() {
  return Array.from(activeMonitors.keys());
}

/**
 * Emit payment update event for real-time updates
 * This can be connected to WebSocket or Server-Sent Events
 */
function emitPaymentUpdate(
  paymentAddress: string,
  update: {
    status: string;
    confirmations?: number;
    received?: number;
    txHash?: string;
  }
) {
  // TODO: Implement WebSocket/SSE broadcast
  // For now, just log the update
  console.log(`[PaymentMonitor] Update event: ${paymentAddress}`, update);

  // In production, you would:
  // 1. Broadcast to connected WebSocket clients
  // 2. Send Server-Sent Events
  // 3. Trigger push notifications
}

/**
 * Monitor payment with custom config
 */
export async function monitorPaymentWithConfig(
  paymentAddress: string,
  expectedBtc: number,
  config: Partial<PaymentMonitorConfig>
) {
  startPaymentMonitor(paymentAddress, expectedBtc, config);
}

/**
 * Get payment monitoring status
 */
export function getMonitoringStatus(paymentAddress: string) {
  const isActive = activeMonitors.has(paymentAddress);
  return {
    paymentAddress,
    isMonitoring: isActive,
    activeMonitors: getActiveMonitors().length,
  };
}
