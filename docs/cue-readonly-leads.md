# Cue Read-Only Lead Access

Cue connects to FlowSites through a dedicated API key with the single scope `leads:read`. It does not use a FlowSites staff login, dashboard session, database credential, Stripe credential, or OAuth token.

## Create the credential

A FlowSites administrator opens `/flowsites-admin-integrations`, creates a **Cue read-only lead access** key, and copies the secret at creation time. The full secret is intentionally displayed once. FlowSites stores only its SHA-256 hash.

## Configure Cue

Create a Custom API connection in Cue:

- **Method:** `GET`
- **Endpoint:** `https://flow-sites.com/api/integrations/cue/leads`
- **Header:** `Authorization: Bearer YOUR_CUE_KEY`

Optional query parameters:

- `limit` — integer from 1 to 100; defaults to 50
- `cursor` — the `nextCursor` from a preceding response
- `status` — `new`, `contacted`, `in_progress`, `proposal_sent`, `won`, or `lost`

Example request shape (do not place a real key in notes, code, GitHub, or chat):

```http
GET /api/integrations/cue/leads?limit=50&status=new HTTP/1.1
Host: flow-sites.com
Authorization: Bearer fs_cue_REPLACE_WITH_SECRET
```

## Response data

Each response contains `data`, `page.nextCursor`, a read-only access marker, and a request ID. Each lead provides only:

- lead ID, business name, business type, and website
- contact email and phone
- inquiry goal, timeline, source, and niche tag
- lead status, follow-up date, created time, and status-update time

The endpoint intentionally excludes admin notes, design preferences, budgets, reference websites, internal assignment records, customer data, invoices, payment information, staff records, settings, and every write operation.

## Revoke or rotate

To stop Cue immediately, a FlowSites administrator opens `/flowsites-admin-integrations` and clicks **Revoke** on the key. To rotate, revoke the prior key, create a new key, and replace it in Cue. Never share a key in chat or commit one to source control.
