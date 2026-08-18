import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import type { TrpcContext } from "../_core/context";

async function requireAdminAccess(ctx: TrpcContext) {
  if (!ctx.user) throw new Error("Unauthorized");
}

export const learningRouter = router({
  /** Get all lessons with step/question counts */
  getLessons: publicProcedure
    .query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { lessons, lessonSteps, quizQuestions } = await import("../../drizzle/schema");
      const { eq, count } = await import("drizzle-orm");
      const allLessons = await db.select().from(lessons).orderBy(lessons.sortOrder);
      const result = await Promise.all(allLessons.map(async (lesson) => {
        const [stepCount] = await db!.select({ count: count() }).from(lessonSteps).where(eq(lessonSteps.lessonId, lesson.id));
        const [questionCount] = await db!.select({ count: count() }).from(quizQuestions).where(eq(quizQuestions.lessonId, lesson.id));
        return { ...lesson, stepCount: stepCount?.count ?? 0, questionCount: questionCount?.count ?? 0 };
      }));
      return result;
    }),

  /** Get a single lesson with all steps and quiz questions */
  getLesson: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { lessons, lessonSteps, quizQuestions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.lessonId));
      if (!lesson) throw new Error("Lesson not found");
      const steps = await db.select().from(lessonSteps)
        .where(eq(lessonSteps.lessonId, input.lessonId))
        .orderBy(lessonSteps.stepNumber);
      const questions = await db.select().from(quizQuestions)
        .where(eq(quizQuestions.lessonId, input.lessonId))
        .orderBy(quizQuestions.questionNumber);
      return { lesson, steps, questions };
    }),

  /** Get the current user's progress across all lessons */
  getMyProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { userLessonProgress } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      return db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, ctx.user.id));
    }),

  /** Mark a lesson step as completed (tracks highest step reached) */
  completeStep: protectedProcedure
    .input(z.object({ lessonId: z.number(), stepNumber: z.number(), totalSteps: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { userLessonProgress } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const existing = await db.select().from(userLessonProgress)
        .where(and(eq(userLessonProgress.userId, ctx.user.id), eq(userLessonProgress.lessonId, input.lessonId)));
      const newCompleted = input.stepNumber;
      const allDone = newCompleted >= input.totalSteps ? 1 : 0;
      if (existing.length === 0) {
        await db.insert(userLessonProgress).values({
          userId: ctx.user.id, lessonId: input.lessonId,
          completedSteps: newCompleted, lessonCompleted: allDone, quizPassed: 0, bestScore: 0,
        });
      } else {
        const cur = existing[0];
        await db.update(userLessonProgress)
          .set({ completedSteps: Math.max(cur.completedSteps, newCompleted), lessonCompleted: allDone })
          .where(and(eq(userLessonProgress.userId, ctx.user.id), eq(userLessonProgress.lessonId, input.lessonId)));
      }
      return { success: true };
    }),

  /** Submit quiz answers and get score */
  submitQuiz: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      answers: z.array(z.object({ questionId: z.number(), selectedOption: z.number() })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { quizQuestions, userLessonProgress } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, input.lessonId));
      if (questions.length === 0) throw new Error("No questions found for this lesson");
      let correct = 0;
      const results = input.answers.map(answer => {
        const q = questions.find(q => q.id === answer.questionId);
        if (!q) return { questionId: answer.questionId, correct: false, correctIndex: -1, explanation: null };
        const isCorrect = answer.selectedOption === q.correctIndex;
        if (isCorrect) correct++;
        return { questionId: answer.questionId, correct: isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
      });
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= 70;
      const existing = await db.select().from(userLessonProgress)
        .where(and(eq(userLessonProgress.userId, ctx.user.id), eq(userLessonProgress.lessonId, input.lessonId)));
      if (existing.length === 0) {
        await db.insert(userLessonProgress).values({
          userId: ctx.user.id, lessonId: input.lessonId,
          completedSteps: 0, lessonCompleted: 0, quizPassed: passed ? 1 : 0, bestScore: score,
        });
      } else {
        const cur = existing[0];
        await db.update(userLessonProgress)
          .set({ bestScore: Math.max(cur.bestScore, score), quizPassed: (cur.quizPassed === 1 || passed) ? 1 : 0 })
          .where(and(eq(userLessonProgress.userId, ctx.user.id), eq(userLessonProgress.lessonId, input.lessonId)));
      }
      return { score, passed, correct, total: questions.length, results };
    }),

  /** Seed lessons into the DB (admin only, idempotent) */
  seedLessons: publicProcedure
    .mutation(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { seedAllLessons } = await import("../lessonSeed");
      return seedAllLessons();
    }),
});
