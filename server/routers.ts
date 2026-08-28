import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { authRouter } from "./routers/auth.js";
import {
  createBtcPayment,
  getBtcPaymentByAddress,
  getUserBtcPayments,
  getAllBtcPayments,
  getDashboardStats,
  logAdminAction,
} from "./admin.js";
import {
  convertUsdToBtc,
  convertBtcToUsd,
  getBtcPrice,
  verifyPayment,
  monitorPaymentAddress,
} from "./_core/btcPayment.js";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,

  // Admin panel routes
  admin: router({
    getDashboardStats: adminProcedure.query(async () => {
      return getDashboardStats();
    }),

    getAllPayments: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getAllBtcPayments(input.limit || 100, input.offset || 0);
      }),
  }),

  // Bitcoin payment routes
  payment: router({
    createPaymentRequest: protectedProcedure
      .input(
        z.object({
          amountUsd: z.number().positive(),
          walletAddress: z.string(),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const amountBtc = await convertUsdToBtc(input.amountUsd);
        const paymentAddress = input.walletAddress;

        await createBtcPayment(
          ctx.user!.id,
          amountBtc,
          input.amountUsd.toString(),
          input.walletAddress,
          paymentAddress,
          input.metadata
        );

        await logAdminAction(
          ctx.user!.id,
          "payment_created",
          undefined,
          "payment",
          { amountBtc, amountUsd: input.amountUsd }
        );

        return {
          success: true,
          amountBtc,
          paymentAddress,
        };
      }),

    checkPaymentStatus: publicProcedure
      .input(z.object({ paymentAddress: z.string() }))
      .query(async ({ input }) => {
        const payment = await getBtcPaymentByAddress(input.paymentAddress);
        if (!payment) {
          return { status: "not_found" };
        }

        const verification = await verifyPayment(
          input.paymentAddress,
          parseFloat(payment.amount || "0")
        );

        return {
          status: payment.status,
          ...verification,
        };
      }),

    monitorPayment: publicProcedure
      .input(z.object({ paymentAddress: z.string(), expectedBtc: z.number() }))
      .query(async ({ input }) => {
        return monitorPaymentAddress(input.paymentAddress, input.expectedBtc);
      }),

    getUserPayments: protectedProcedure.query(async ({ ctx }) => {
      return getUserBtcPayments(ctx.user!.id);
    }),

    getBtcPrice: publicProcedure.query(async () => {
      return getBtcPrice();
    }),

    convertUsdToBtc: publicProcedure
      .input(z.object({ usd: z.number() }))
      .query(async ({ input }) => {
        return convertUsdToBtc(input.usd);
      }),

    convertBtcToUsd: publicProcedure
      .input(z.object({ btc: z.number() }))
      .query(async ({ input }) => {
        return convertBtcToUsd(input.btc);
      }),
  }),
});

export type AppRouter = typeof appRouter;
