# 800.com API Reference Notes

## Base URL
`https://api.800.com`

## Authentication
Bearer token in Authorization header:
```
Authorization: Bearer <token>
```
Token obtained from: 800.com account → User Settings → Personal Access Tokens

## Rate Limit
60 requests/minute (429 returned if exceeded)

## SMS — Send a Message
**POST** `https://api.800.com/message`

Request body (JSON):
```json
{
  "sender": "+18005551234",      // Your 800.com number (E.164 format)
  "recipient": "+18005556789",   // Lead's phone number (E.164 format)
  "message": "Hello, this is a test message",
  "media": ["string"],           // Optional: array of media URLs (MMS)
  "url": "https://example.com/image.jpg"  // Optional: single media URL
}
```
Response: 200 on success, body `{ "data": {} }`

## Calls (Read-Only via API)
The Calls section only exposes:
- GET List Activities
- GET List Calls
- GET Get Activity by Call ID
- GET List Calls By Callee
- GET Export a report containing calls

**Important:** The 800.com API does NOT have an outbound "initiate call" endpoint.
For calling, the best approach is:
1. Use `tel:` links (opens native dialer on mobile/desktop with softphone)
2. Or use 800.com's click-to-call feature if available in their app

## Inbox / Conversations
- GET `https://api.800.com/inbox/conversations` — list conversations
- GET `https://api.800.com/inbox/conversations/{id}` — get single conversation
- GET `https://api.800.com/inbox/conversations/{id}/items` — list messages in conversation

## Numbers
The Numbers API allows listing/managing numbers on the account.
Use GET `/numbers` to fetch the list of 800.com numbers to use as sender.

## Key Integration Points for FlowSites Dashboard
1. **Send SMS**: POST /message with sender (our 800.com number) + recipient (lead phone) + message text
2. **View SMS history**: GET /inbox/conversations filtered by lead phone number
3. **Calling**: Use `tel:` href (no outbound call API available) — 800.com handles calls via their app/forwarding
4. **Webhook for inbound SMS**: Configure webhook in 800.com dashboard to POST to our /api/800com/webhook
