import * as Notifications from "expo-notifications";
import { getDb } from "../db.js";
import { btcPayments, users } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

/**
 * Payment Notification Service
 * Sends notifications to users when their Bitcoin payments are confirmed
 */

interface NotificationPayload {
  paymentId: number;
  status: "confirmed" | "pending" | "failed" | "expired";
  amount: string;
  amountUSD: string;
  txHash?: string;
  confirmations?: number;
}

/**
 * Send payment status notification
 */
export async function sendPaymentNotification(
  userId: number,
  payload: NotificationPayload
) {
  try {
    const title = getNotificationTitle(payload.status);
    const body = getNotificationBody(payload);

    console.log(`[PaymentNotifications] Sending notification to user ${userId}:`, {
      title,
      body,
    });

    // In production, you would:
    // 1. Get user's push notification token from database
    // 2. Send via Firebase Cloud Messaging, OneSignal, or similar
    // 3. Store notification history in database

    // For now, we'll just log it
    // In a real app, integrate with your push notification service
  } catch (error) {
    console.error("[PaymentNotifications] Error sending notification:", error);
  }
}

/**
 * Send payment confirmed notification
 */
export async function notifyPaymentConfirmed(
  paymentId: number,
  userId: number,
  amount: string,
  amountUSD: string,
  txHash?: string,
  confirmations?: number
) {
  await sendPaymentNotification(userId, {
    paymentId,
    status: "confirmed",
    amount,
    amountUSD,
    txHash,
    confirmations,
  });
}

/**
 * Send payment pending notification
 */
export async function notifyPaymentPending(
  paymentId: number,
  userId: number,
  amount: string,
  amountUSD: string,
  confirmations?: number
) {
  await sendPaymentNotification(userId, {
    paymentId,
    status: "pending",
    amount,
    amountUSD,
    confirmations,
  });
}

/**
 * Send payment failed notification
 */
export async function notifyPaymentFailed(
  paymentId: number,
  userId: number,
  amount: string,
  amountUSD: string
) {
  await sendPaymentNotification(userId, {
    paymentId,
    status: "failed",
    amount,
    amountUSD,
  });
}

/**
 * Send payment expired notification
 */
export async function notifyPaymentExpired(
  paymentId: number,
  userId: number,
  amount: string,
  amountUSD: string
) {
  await sendPaymentNotification(userId, {
    paymentId,
    status: "expired",
    amount,
    amountUSD,
  });
}

/**
 * Get notification title based on status
 */
function getNotificationTitle(status: string): string {
  switch (status) {
    case "confirmed":
      return "✓ Payment Confirmed!";
    case "pending":
      return "⏳ Payment Received";
    case "failed":
      return "✗ Payment Failed";
    case "expired":
      return "✗ Payment Expired";
    default:
      return "Payment Update";
  }
}

/**
 * Get notification body based on payload
 */
function getNotificationBody(payload: NotificationPayload): string {
  switch (payload.status) {
    case "confirmed":
      return `Your payment of ${payload.amount} BTC ($${payload.amountUSD}) has been confirmed with ${payload.confirmations || 1} confirmation${(payload.confirmations || 1) !== 1 ? "s" : ""}.`;
    case "pending":
      return `We received your payment of ${payload.amount} BTC ($${payload.amountUSD}). Waiting for blockchain confirmations...`;
    case "failed":
      return `Your payment of ${payload.amount} BTC ($${payload.amountUSD}) could not be verified. Please try again.`;
    case "expired":
      return `Your payment request for ${payload.amount} BTC ($${payload.amountUSD}) has expired. Please create a new one.`;
    default:
      return "Your payment status has been updated.";
  }
}

/**
 * Format notification for display
 */
export function formatNotification(payload: NotificationPayload) {
  return {
    title: getNotificationTitle(payload.status),
    body: getNotificationBody(payload),
    data: {
      paymentId: payload.paymentId.toString(),
      status: payload.status,
      amount: payload.amount,
      amountUSD: payload.amountUSD,
    },
  };
}

/**
 * Log notification to database (for history/audit)
 */
export async function logNotification(
  userId: number,
  paymentId: number,
  status: string,
  title: string,
  body: string
) {
  try {
    console.log(`[PaymentNotifications] Logging notification for user ${userId}:`, {
      paymentId,
      status,
      title,
      body,
    });

    // TODO: Create notifications table in schema and insert here
    // await db.insert(notifications).values({
    //   userId,
    //   paymentId,
    //   status,
    //   title,
    //   body,
    //   createdAt: new Date(),
    // });
  } catch (error) {
    console.error("[PaymentNotifications] Error logging notification:", error);
  }
}
