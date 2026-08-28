import { useEffect, useState, useCallback, useRef } from "react";

export interface PaymentStatus {
  status: "idle" | "pending" | "confirmed" | "failed" | "expired";
  confirmations: number;
  receivedAmount: number;
  txHash?: string;
  lastUpdated: Date;
  isMonitoring: boolean;
  pollCount: number;
}

interface UsePaymentStatusOptions {
  paymentAddress: string;
  expectedBtc: number;
  pollInterval?: number; // milliseconds
  maxAttempts?: number;
  onStatusChange?: (status: PaymentStatus) => void;
  onConfirmed?: () => void;
  onExpired?: () => void;
}

/**
 * Hook for monitoring Bitcoin payment status in real-time
 * Automatically polls the server for payment updates
 */
export function usePaymentStatus({
  paymentAddress,
  expectedBtc,
  pollInterval = 30000, // 30 seconds
  maxAttempts = 120, // 1 hour
  onStatusChange,
  onConfirmed,
  onExpired,
}: UsePaymentStatusOptions) {
  const [status, setStatus] = useState<PaymentStatus>({
    status: "idle",
    confirmations: 0,
    receivedAmount: 0,
    lastUpdated: new Date(),
    isMonitoring: false,
    pollCount: 0,
  });

  const pollCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    try {
      pollCountRef.current++;

      // Call API to check payment status
      // In production, use: const response = await trpc.payment.checkPaymentStatus.query({ paymentAddress });
      
      // Mock API call for demonstration
      const response = await fetch(`/api/payment/check?address=${paymentAddress}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("[PaymentStatus] API error:", response.statusText);
        return;
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      const newStatus: PaymentStatus = {
        status: data.status || "pending",
        confirmations: data.confirmations || 0,
        receivedAmount: data.receivedAmount || 0,
        txHash: data.txHash,
        lastUpdated: new Date(),
        isMonitoring: true,
        pollCount: pollCountRef.current,
      };

      setStatus(newStatus);
      onStatusChange?.(newStatus);

      // Handle status changes
      if (newStatus.status === "confirmed") {
        console.log("[PaymentStatus] Payment confirmed!");
        onConfirmed?.();
        stopMonitoring();
      } else if (newStatus.status === "expired") {
        console.log("[PaymentStatus] Payment expired!");
        onExpired?.();
        stopMonitoring();
      }

      // Stop monitoring after max attempts
      if (pollCountRef.current >= maxAttempts) {
        console.log("[PaymentStatus] Max poll attempts reached");
        stopMonitoring();
      }
    } catch (error) {
      console.error("[PaymentStatus] Error checking payment:", error);
    }
  }, [paymentAddress, onStatusChange, onConfirmed, onExpired, maxAttempts]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      console.log("[PaymentStatus] Monitoring already started");
      return;
    }

    console.log("[PaymentStatus] Starting payment monitoring...");
    pollCountRef.current = 0;

    // Initial check
    checkPaymentStatus();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, pollInterval) as unknown as NodeJS.Timeout;

    setStatus((prev) => ({ ...prev, isMonitoring: true }));
  }, [checkPaymentStatus, pollInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("[PaymentStatus] Stopped payment monitoring");
    }

    setStatus((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    status,
    startMonitoring,
    stopMonitoring,
    checkPaymentStatus,
  };
}

/**
 * Hook for displaying payment status with formatted text
 */
export function usePaymentStatusDisplay(paymentStatus: PaymentStatus) {
  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case "confirmed":
        return "#22C55E"; // green
      case "pending":
        return "#F59E0B"; // amber
      case "expired":
        return "#EF4444"; // red
      case "failed":
        return "#EF4444"; // red
      default:
        return "#6B7280"; // gray
    }
  };

  const getStatusLabel = () => {
    switch (paymentStatus.status) {
      case "confirmed":
        return "✓ Payment Confirmed";
      case "pending":
        return "⏳ Waiting for Confirmation";
      case "expired":
        return "✗ Payment Expired";
      case "failed":
        return "✗ Payment Failed";
      default:
        return "Checking...";
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus.status) {
      case "confirmed":
        return `Payment confirmed with ${paymentStatus.confirmations} confirmation${paymentStatus.confirmations !== 1 ? "s" : ""}`;
      case "pending":
        return `Received ${paymentStatus.receivedAmount.toFixed(8)} BTC (${paymentStatus.confirmations} confirmation${paymentStatus.confirmations !== 1 ? "s" : ""})`;
      case "expired":
        return "Payment request has expired. Please create a new one.";
      case "failed":
        return "Payment verification failed. Please try again.";
      default:
        return "Checking payment status...";
    }
  };

  return {
    color: getStatusColor(),
    label: getStatusLabel(),
    message: getStatusMessage(),
    isComplete: paymentStatus.status === "confirmed",
    isFailed: paymentStatus.status === "failed" || paymentStatus.status === "expired",
  };
}
