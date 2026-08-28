import { eq, and, gte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminLogs, adminSessions, btcPayments, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { randomBytes } from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Admin DB] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create admin session token
 */
export async function createAdminSession(
  userId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(adminSessions).values({
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
  });

  return token;
}

/**
 * Verify admin session token
 */
export async function verifyAdminSession(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.token, token),
        gte(adminSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return session.length > 0 ? session[0] : null;
}

/**
 * Revoke admin session
 */
export async function revokeAdminSession(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

/**
 * Log admin action
 */
export async function logAdminAction(
  adminId: number,
  action: string,
  targetId?: number,
  targetType?: string,
  details?: Record<string, any>,
  ipAddress?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Admin] Cannot log action: database not available");
    return;
  }

  try {
    await db.insert(adminLogs).values({
      adminId,
      action,
      targetId,
      targetType,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
    });
  } catch (error) {
    console.error("[Admin] Failed to log action:", error);
  }
}

/**
 * Get admin logs
 */
export async function getAdminLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(adminLogs)
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Create BTC payment request
 */
export async function createBtcPayment(
  userId: number,
  amount: string,
  amountUSD: string,
  walletAddress: string,
  paymentAddress: string,
  metadata?: Record<string, any>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const result = await db.insert(btcPayments).values({
    userId,
    amount,
    amountUSD,
    walletAddress,
    paymentAddress,
    status: "pending",
    expiresAt,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  return result;
}

/**
 * Get BTC payment by payment address
 */
export async function getBtcPaymentByAddress(paymentAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const payment = await db
    .select()
    .from(btcPayments)
    .where(eq(btcPayments.paymentAddress, paymentAddress))
    .limit(1);

  return payment.length > 0 ? payment[0] : null;
}

/**
 * Update BTC payment status
 */
export async function updateBtcPaymentStatus(
  paymentId: number,
  status: "pending" | "confirmed" | "failed" | "expired",
  txHash?: string,
  confirmations?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (txHash) updateData.txHash = txHash;
  if (confirmations !== undefined) updateData.confirmations = confirmations;
  if (status === "confirmed") updateData.confirmedAt = new Date();

  await db
    .update(btcPayments)
    .set(updateData)
    .where(eq(btcPayments.id, paymentId));
}

/**
 * Get user BTC payments
 */
export async function getUserBtcPayments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(btcPayments)
    .where(eq(btcPayments.userId, userId))
    .orderBy(desc(btcPayments.createdAt));
}

/**
 * Get all BTC payments (admin)
 */
export async function getAllBtcPayments(
  limit: number = 100,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(btcPayments)
    .orderBy(desc(btcPayments.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalUsers = await db.select().from(users);
  const totalPayments = await db.select().from(btcPayments);
  const confirmedPayments = await db
    .select()
    .from(btcPayments)
    .where(eq(btcPayments.status, "confirmed"));
  const pendingPayments = await db
    .select()
    .from(btcPayments)
    .where(eq(btcPayments.status, "pending"));

  return {
    totalUsers: totalUsers.length,
    totalPayments: totalPayments.length,
    confirmedPayments: confirmedPayments.length,
    pendingPayments: pendingPayments.length,
    totalBtcReceived: confirmedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount || "0"),
      0
    ),
  };
}
