import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import {
  InsertUser, users, wizardSubmissions, InsertWizardSubmission, adminSessions,
  availability, InsertAvailability, blockedDates, InsertBlockedDate,
  bookings, InsertBooking,
  questionnaireQuestions, InsertQuestionnaireQuestion,
  bookingAnswers, InsertBookingAnswer,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        ssl: { rejectUnauthorized: false },
      });
      _db = drizzle(pool) as any;
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

export async function createWizardSubmission(data: Omit<InsertWizardSubmission, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(wizardSubmissions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getAllWizardSubmissions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(wizardSubmissions).orderBy(wizardSubmissions.createdAt);
  return result;
}

export async function createAdminSession(token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminSessions).values({ sessionToken: token, expiresAt });
}

export async function getAdminSession(token: string) {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const result = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.sessionToken, token))
    .limit(1);
  if (!result.length) return null;
  // Check expiry
  if (result[0].expiresAt < now) {
    await db.delete(adminSessions).where(eq(adminSessions.sessionToken, token));
    return null;
  }
  return result[0];
}

export async function deleteAdminSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(eq(adminSessions.sessionToken, token));
}

// ─── Scheduling: Availability ──────────────────────────────────────────────

export async function getAllAvailability() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(availability).orderBy(availability.dayOfWeek);
}

export async function upsertAvailabilitySlot(data: InsertAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.id) {
    await db.update(availability).set(data).where(eq(availability.id, data.id));
    return data.id;
  }
  const result = await db.insert(availability).values(data);
  return Number(result[0].insertId);
}

export async function deleteAvailabilitySlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(availability).where(eq(availability.id, id));
}

// ─── Scheduling: Blocked Dates ──────────────────────────────────────────────

export async function getBlockedDates(fromDate: string, toDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(blockedDates)
    .where(and(gte(blockedDates.blockedDate, fromDate), lte(blockedDates.blockedDate, toDate)));
}

export async function getAllBlockedDates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(blockedDates).orderBy(blockedDates.blockedDate);
}

export async function addBlockedDate(data: Omit<InsertBlockedDate, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blockedDates).values(data);
  return Number(result[0].insertId);
}

export async function removeBlockedDate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blockedDates).where(eq(blockedDates.id, id));
}

// ─── Scheduling: Bookings ───────────────────────────────────────────────────

export async function getBookingsForDate(date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.bookingDate, date), eq(bookings.status, "confirmed")));
}

export async function getBookingsInRange(fromDate: string, toDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(bookings)
    .where(and(gte(bookings.bookingDate, fromDate), lte(bookings.bookingDate, toDate)))
    .orderBy(bookings.bookingDate, bookings.startTime);
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(bookings).orderBy(bookings.bookingDate, bookings.startTime);
}

export async function createBooking(data: Omit<InsertBooking, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(data);
  return Number(result[0].insertId);
}

export async function getBookingByConfirmationCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.confirmationCode, code)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBookingStatus(
  id: number,
  status: "confirmed" | "cancelled" | "completed" | "no_show",
  cancelReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({
    status,
    ...(status === "cancelled" ? { cancelledAt: new Date(), cancelReason: cancelReason ?? null } : {}),
  }).where(eq(bookings.id, id));
}

// ─── Questionnaire: Questions ───────────────────────────────────────────────────────────

/** Returns all active questions ordered by sortOrder */
export async function getActiveQuestions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.isActive, 1))
    .orderBy(asc(questionnaireQuestions.sortOrder));
}

/** Returns ALL questions (active + inactive) for admin management */
export async function getAllQuestions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(questionnaireQuestions)
    .orderBy(asc(questionnaireQuestions.sortOrder));
}

export async function createQuestion(data: Omit<InsertQuestionnaireQuestion, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questionnaireQuestions).values(data);
  return Number(result[0].insertId);
}

export async function updateQuestion(
  id: number,
  data: Partial<Omit<InsertQuestionnaireQuestion, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(questionnaireQuestions).set(data).where(eq(questionnaireQuestions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questionnaireQuestions).where(eq(questionnaireQuestions.id, id));
}

// ─── Questionnaire: Answers ──────────────────────────────────────────────────────────

export async function saveBookingAnswers(
  answers: Array<{ bookingId: number; questionId: number; answerText: string | null }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!answers.length) return;
  await db.insert(bookingAnswers).values(answers);
}

/** Returns all answers for a specific booking, joined with question text */
export async function getAnswersForBooking(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const answers = await db
    .select()
    .from(bookingAnswers)
    .where(eq(bookingAnswers.bookingId, bookingId));

  if (!answers.length) return [];

  const questionIds = Array.from(new Set(answers.map((a) => a.questionId)));
  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(inArray(questionnaireQuestions.id, questionIds));

  const qMap = new Map(questions.map((q) => [q.id, q]));

  return answers.map((a) => ({
    ...a,
    question: qMap.get(a.questionId) ?? null,
  }));
}

/** Returns answers for multiple bookings at once (used in admin list view) */
export async function getAnswersForBookings(bookingIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!bookingIds.length) return [];

  const answers = await db
    .select()
    .from(bookingAnswers)
    .where(inArray(bookingAnswers.bookingId, bookingIds));

  if (!answers.length) return [];

  const questionIds = Array.from(new Set(answers.map((a) => a.questionId)));
  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(inArray(questionnaireQuestions.id, questionIds));

  const qMap = new Map(questions.map((q) => [q.id, q]));

  return answers.map((a) => ({
    ...a,
    question: qMap.get(a.questionId) ?? null,
  }));
}
