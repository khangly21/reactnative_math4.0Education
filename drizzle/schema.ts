import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bitcoin payments table for tracking transactions
 */
export const btcPayments = mysqlTable("btc_payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: varchar("amount", { length: 64 }).notNull(), // Amount in BTC (e.g., "0.001")
  amountUSD: varchar("amountUSD", { length: 64 }), // USD equivalent at time of payment
  walletAddress: varchar("walletAddress", { length: 255 }).notNull(), // Recipient BTC address
  paymentAddress: varchar("paymentAddress", { length: 255 }).notNull(), // Generated payment address
  txHash: varchar("txHash", { length: 255 }), // Bitcoin transaction hash
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "expired"]).default("pending").notNull(),
  confirmations: int("confirmations").default(0),
  expiresAt: timestamp("expiresAt"),
  confirmedAt: timestamp("confirmedAt"),
  metadata: text("metadata"), // JSON metadata (product, order details, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BtcPayment = typeof btcPayments.$inferSelect;
export type InsertBtcPayment = typeof btcPayments.$inferInsert;

/**
 * Admin logs table for tracking admin actions
 */
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(), // e.g., "user_created", "payment_verified"
  targetId: int("targetId"), // ID of affected resource (user, payment, etc.)
  targetType: varchar("targetType", { length: 64 }), // e.g., "user", "payment"
  details: text("details"), // JSON details of the action
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * Admin sessions table for tracking admin logins
 */
export const adminSessions = mysqlTable("admin_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;
