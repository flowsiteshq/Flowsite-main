// Standalone seed script for lessons
// Run with: node seed-lessons.mjs

import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load dotenv
const dotenv = await import('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// Load the seed function via tsx
import { register } from 'node:module';

// Use tsx to run the seed
import { execSync } from 'child_process';

try {
  const result = execSync(
    'node --import tsx/esm server/lessonSeed.ts --run-seed',
    { cwd: __dirname, env: process.env, encoding: 'utf8' }
  );
  console.log(result);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
