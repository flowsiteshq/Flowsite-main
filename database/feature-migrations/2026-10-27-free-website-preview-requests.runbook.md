# Free Website Program — Migration Runbook

## Reconciliation result

The legacy Drizzle generator cannot be used as a deployment source in this repository today. Running `pnpm drizzle-kit generate` stops with a snapshot-parent collision between `drizzle/meta/0000_snapshot.json` and `drizzle/meta/0001_snapshot.json`. The committed journal also lists only two duplicate historical migrations, while the connected development database contains later application tables.

**Decision:** preserve the legacy journal and migration files exactly as historical artifacts. New, narrow feature migrations are ledgered under `database/feature-migrations/` until the historical migration chain can be repaired in a separate, backup-verified project.

## Development application record

- **Environment:** connected FlowSites development database
- **Migration:** `2026-10-27-free-website-preview-requests.sql`
- **Method:** metadata check followed by one additive `CREATE TABLE IF NOT EXISTS`
- **Result:** success
- **Verification:** the request table exists with the expected `status`, `internalNotes`, `previewUrl`, `deliveryChecklistComplete`, and `reviewedAt` columns; the lead and status/date indexes exist; no prospect request rows were inserted as part of the migration.

## Production preflight — required before any production apply

1. Obtain the approved production database backup/restore point.
2. Confirm the production database does not already have `free_website_preview_requests`, or compare every existing column and index to the canonical SQL.
3. Apply only the canonical additive migration. Do not run `drizzle-kit migrate`, replay legacy migration files, or use `db:push`.
4. Run the read-only verification queries embedded in the SQL file.
5. Deploy the branch only after application code and the table are verified together.
6. Smoke-test a request with an internal test record only after explicit approval; do not create a charge or send outreach.

## Rollback position

No destructive rollback command is included. The table contains lead and consent evidence; removing it would be a data-loss action and requires a separate, approved recovery plan.
