import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { upsertUser, getUserByOpenId } from "../db.js";
import { InsertUser } from "../../drizzle/schema.js";

/**
 * Authentication Router
 * Handles user registration, login, and session management
 */

export const authRouter = router({
  /**
   * Register with email and password
   */
  registerWithEmail: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, you would:
        // 1. Hash the password using bcrypt
        // 2. Check if email already exists
        // 3. Store hashed password in a separate table
        // 4. Return JWT token

        // For now, create a mock openId from email
        const openId = `email_${input.email.replace(/[^a-zA-Z0-9]/g, "_")}`;

        const user: InsertUser = {
          openId,
          email: input.email,
          name: input.name,
          loginMethod: "email",
          lastSignedIn: new Date(),
          role: "user",
        };

        await upsertUser(user);

        return {
          success: true,
          message: "Account created successfully",
          user: {
            openId,
            email: input.email,
            name: input.name,
            role: "user",
          },
        };
      } catch (error) {
        console.error("[Auth] Registration error:", error);
        throw new Error("Registration failed");
      }
    }),

  /**
   * Login with email and password
   */
  loginWithEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Invalid password"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, you would:
        // 1. Find user by email
        // 2. Verify password hash
        // 3. Generate JWT token
        // 4. Return token and user info

        // For now, mock successful login
        const openId = `email_${input.email.replace(/[^a-zA-Z0-9]/g, "_")}`;

        const user = await getUserByOpenId(openId);

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Update last signed in
        await upsertUser({
          openId,
          lastSignedIn: new Date(),
        });

        return {
          success: true,
          message: "Logged in successfully",
          user: {
            id: user.id,
            openId: user.openId,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        console.error("[Auth] Login error:", error);
        throw new Error("Login failed");
      }
    }),

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: publicProcedure
    .input(
      z.object({
        idToken: z.string(),
        email: z.string().email(),
        name: z.string(),
        picture: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, you would:
        // 1. Verify the idToken with Google's API
        // 2. Extract user info from token
        // 3. Create or update user in database
        // 4. Generate JWT token

        // For now, mock successful Google login
        const openId = `google_${input.email.replace(/[^a-zA-Z0-9]/g, "_")}`;

        const user: InsertUser = {
          openId,
          email: input.email,
          name: input.name,
          loginMethod: "google",
          lastSignedIn: new Date(),
          role: "user",
        };

        await upsertUser(user);

        return {
          success: true,
          message: "Logged in with Google successfully",
          user: {
            openId,
            email: input.email,
            name: input.name,
            role: "user",
          },
        };
      } catch (error) {
        console.error("[Auth] Google login error:", error);
        throw new Error("Google login failed");
      }
    }),

  /**
   * Get current user info
   */
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        return null;
      }

      const user = await getUserByOpenId(ctx.user.openId);
      return user
        ? {
            id: user.id,
            openId: user.openId,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        : null;
    } catch (error) {
      console.error("[Auth] Get current user error:", error);
      return null;
    }
  }),

  /**
   * Logout (client-side token removal)
   */
  logout: publicProcedure.mutation(async () => {
    // In production, you would invalidate the JWT token server-side
    return {
      success: true,
      message: "Logged out successfully",
    };
  }),

  /**
   * Verify authentication token
   */
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        // In production, verify JWT token
        // For now, return mock verification
        return {
          valid: true,
          message: "Token is valid",
        };
      } catch (error) {
        return {
          valid: false,
          message: "Token is invalid",
        };
      }
    }),
});
