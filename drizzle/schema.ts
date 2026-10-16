import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين الأساسي
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
 * جدول طلبات الساعات الذكية
 */
export const smartWatchOrders = mysqlTable("smartWatchOrders", {
  id: int("id").autoincrement().primaryKey(),
  
  // البيانات الشخصية
  fullName: varchar("fullName", { length: 255 }).notNull(),
  nationalId: varchar("nationalId", { length: 14 }).notNull(), // 14 رقم فقط
  idExpiryDate: varchar("idExpiryDate", { length: 10 }).notNull(), // YYYY-MM-DD
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // YYYY-MM-DD
  email: varchar("email", { length: 320 }).notNull(),
  
  // بيانات تسجيل الدخول
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  
  // بيانات التحقق
  otpCode: varchar("otpCode", { length: 6 }),
  otpVerified: boolean("otpVerified").default(false),
  tokenCode: varchar("tokenCode", { length: 6 }),
  tokenVerified: boolean("tokenVerified").default(false),
  
  // معلومات إضافية
  country: varchar("country", { length: 100 }),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 و IPv6
  currentPage: varchar("currentPage", { length: 100 }).default("personalData"),
  
  // حالات الخطوات
  personalDataCompleted: boolean("personalDataCompleted").default(false),
  loginCompleted: boolean("loginCompleted").default(false),
  otpCompleted: boolean("otpCompleted").default(false),
  tokenCompleted: boolean("tokenCompleted").default(false),
  
  // الحالة العامة
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending"),
  
  // الطوابع الزمنية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SmartWatchOrder = typeof smartWatchOrders.$inferSelect;
export type InsertSmartWatchOrder = typeof smartWatchOrders.$inferInsert;

/**
 * جدول الجلسات النشطة لتتبع الزيارات
 */
export const activeSessions = mysqlTable("activeSessions", {
  id: int("id").autoincrement().primaryKey(),
  
  // معرف الجلسة
  sessionId: varchar("sessionId", { length: 255 }).notNull().unique(),
  
  // معلومات الجلسة
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  country: varchar("country", { length: 100 }),
  userAgent: text("userAgent"),
  
  // معرف الطلب إن وجد
  orderId: int("orderId"),
  
  // حالة الجلسة
  isActive: boolean("isActive").default(true),
  
  // الطوابع الزمنية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = typeof activeSessions.$inferInsert;
