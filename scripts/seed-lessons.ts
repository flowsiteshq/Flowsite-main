/**
 * Standalone lesson seed script
 * Run with: npx tsx scripts/seed-lessons.ts
 */
import "dotenv/config";
import { seedAllLessons } from "../server/lessonSeed";

async function main() {
  console.log("Seeding lessons...");
  try {
    const result = await seedAllLessons();
    console.log(`Done! Seeded: ${result.seeded}, Skipped: ${result.skipped}`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
