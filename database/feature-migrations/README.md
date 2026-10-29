# Feature Migration Ledger

This ledger is the source of truth for **new, additive FlowSites feature migrations** while the legacy Drizzle journal is reconciled.

## Why this exists

The repository contains many historical SQL files and a Drizzle schema that describe a broad application, but the committed Drizzle journal records only two duplicate `marketing_optins` migrations. The connected development database already contains later application tables (including Cue, video-order, and customer-removal tables) that are absent from that journal.

Replaying or rewriting the legacy `drizzle/meta/_journal.json` would be unsafe because it could re-run old DDL against live data. This ledger therefore follows these rules:

1. Never rewrite, reorder, or replay legacy `drizzle/*.sql` files or the historic journal.
2. Each new product feature receives one narrowly scoped, idempotent SQL artifact here.
3. Apply an artifact only after a read-only metadata check confirms the target table/column is absent or compatible.
4. Record the environment, timestamp, operator, result, and a schema verification query in the deployment runbook after application.
5. Keep the Drizzle TypeScript schema aligned with every applied feature migration.

## Current entries

| ID | Scope | State |
| --- | --- | --- |
| `2026-10-27-free-website-preview-requests` | Free Website Program request, human-review, and preview-delivery checklist table | Development migration applied after metadata verification; production pending explicit release approval |

## Safety boundary

Feature migrations in this directory must be additive. They must not remove application tables, modify historical billing data, cancel subscriptions, send communications, or activate checkout behavior.
