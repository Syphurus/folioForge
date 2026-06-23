# FolioForge · Gateway

Owner: **Siddharth**.

The single middleman between the frontend and the Python service. Catches every `/api/*` request, stores files locally, talks to FastAPI, returns clean results.

> ⚠️ This folder is a placeholder. Frontend (Sharav) runs against stub responses
> from `frontend/src/api/client.js` until the real gateway lands.

## Quick start (when implemented)

```bash
npm install
npm run dev          # http://localhost:3000
```

## What to build (from §7.2 of the build plan)

- Express server with every endpoint in [`docs/CONTRACT.md`](../docs/CONTRACT.md) §5.1.
- File upload to `gateway/uploads/`; metadata (`fileId`, `filename`, `pageCount`) in SQLite.
- Simple login → returns a bearer token; verify the token on protected routes.
- For each operation: look up the file path(s), call the matching FastAPI route (§5.2), save any returned file, return the new `fileId` (or the Scan Result).
- **Day 1 stubs** · return hard-coded sample responses so Sharav is unblocked before Srestha and Divya are ready.

## Contract checklist

The frontend already calls every one of these · match the shapes exactly.

```
POST /api/login        → { token }
POST /api/upload       → { fileId, filename, pageCount }
GET  /api/files        → [ { fileId, filename, pageCount } ]
GET  /api/files/:id/raw → PDF bytes
POST /api/merge        → { fileId }
POST /api/compress     → { fileId }
POST /api/split        → { fileIds: [...] }
POST /api/scan         → ScanResult (see CONTRACT.md §5.3)
```

Protected routes expect `Authorization: Bearer <token>`.
