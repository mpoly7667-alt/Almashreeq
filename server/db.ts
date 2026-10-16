import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, smartWatchOrders, activeSessions, SmartWatchOrder, InsertSmartWatchOrder, ActiveSession, InsertActiveSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ طلبات الساعات الذكية ============

export async function createSmartWatchOrder(order: InsertSmartWatchOrder): Promise<SmartWatchOrder> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(smartWatchOrders).values(order);
  const orderId = result[0].insertId;
  
  const created = await db.select().from(smartWatchOrders).where(eq(smartWatchOrders.id, Number(orderId))).limit(1);
  return created[0]!;
}

export async function getSmartWatchOrderById(id: number): Promise<SmartWatchOrder | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(smartWatchOrders).where(eq(smartWatchOrders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSmartWatchOrder(id: number, updates: Partial<SmartWatchOrder>): Promise<SmartWatchOrder | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  await db.update(smartWatchOrders).set(updates).where(eq(smartWatchOrders.id, id));
  return getSmartWatchOrderById(id);
}

export async function getAllSmartWatchOrders(): Promise<SmartWatchOrder[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(smartWatchOrders).orderBy(desc(smartWatchOrders.createdAt));
}

export async function getSmartWatchOrdersByStatus(status: string): Promise<SmartWatchOrder[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(smartWatchOrders).where(eq(smartWatchOrders.status, status as any)).orderBy(desc(smartWatchOrders.createdAt));
}

// ============ الجلسات النشطة ============

export async function createActiveSession(session: InsertActiveSession): Promise<ActiveSession> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(activeSessions).values(session);
  const sessionId = result[0].insertId;
  
  const created = await db.select().from(activeSessions).where(eq(activeSessions.id, Number(sessionId))).limit(1);
  return created[0]!;
}

export async function getActiveSessionBySessionId(sessionId: string): Promise<ActiveSession | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(activeSessions).where(eq(activeSessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateActiveSession(id: number, updates: Partial<ActiveSession>): Promise<ActiveSession | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  await db.update(activeSessions).set(updates).where(eq(activeSessions.id, id));
  
  const result = await db.select().from(activeSessions).where(eq(activeSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(activeSessions).where(eq(activeSessions.isActive, true)).orderBy(desc(activeSessions.createdAt));
}

export async function getActiveSessionsCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const result = await db.select().from(activeSessions).where(eq(activeSessions.isActive, true));
  return result.length;
}

export async function deactivateExpiredSessions(): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  const now = new Date();
  await db.update(activeSessions)
    .set({ isActive: false })
    .where(and(
      eq(activeSessions.isActive, true),
      // جلسات أكبر من ساعة واحدة
    ));
}
