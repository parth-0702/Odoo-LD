# GlobeTrotter AI Module — Development Progress

## Project

- Repository: Odoo-LD
- Branch: manav-work
- Module: ai-service
- Purpose: Smart Trip Drafting for GlobeTrotter

---

## Current Status

Status: IN PROGRESS

Current Task:
Task 2 — Gemini provider integration

Completed Through:
Task 2

Next Task:
Task 3 — Chat API (/api/ai/chat)

---

## Architecture

A standalone Express (Node.js, JavaScript, not TypeScript) HTTP service.
Currently it only exposes a health check. There is no AI provider, no
database, and no authentication yet. The app is structured to add those
pieces incrementally without restructuring existing code:

- `routes/` wires URL paths to controllers.
- `controllers/` contains request handlers (currently just health).
- `providers/` now contains `gemini.provider.js`, which wraps the
  `@google/genai` SDK behind a single `generateText(prompt)` function.
  Nothing outside this file knows the Gemini SDK's call shape — a future
  second provider (e.g. OpenAI) can be added as its own file exposing
  the same kind of function, without touching routes/controllers.
- `services/`, `prompts/`, `schemas/` are still empty placeholder
  folders (each has a `.gitkeep`) reserved for future tasks (business
  logic, prompt templates, and request/response schemas respectively).
- `middleware/` (not in the original spec list, added because it was
  needed to implement the required 404 handler and centralized error
  handler cleanly) contains `notFound.js` and `errorHandler.js`.

---

## Current Folder Structure

```text
ai-service/
├── src/
│   ├── controllers/
│   │   ├── ai.controller.js
│   │   └── health.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── providers/
│   │   └── gemini.provider.js
│   ├── prompts/
│   │   └── .gitkeep
│   ├── routes/
│   │   ├── ai.routes.js
│   │   └── health.routes.js
│   ├── schemas/
│   │   └── .gitkeep
│   ├── services/
│   │   └── .gitkeep
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Completed Tasks

### Task 1 — Backend foundation + /health endpoint

Status: COMPLETE

Implemented:
- Express app entrypoint (`src/index.js`) with `dotenv`, `cors`, and
  `express.json()` middleware.
- `GET /health` route returning `{ "status": "ok", "service": "globetrotter-ai" }`.
- Centralized error handler middleware (`src/middleware/errorHandler.js`).
- 404 handler middleware (`src/middleware/notFound.js`).
- `npm run dev` (nodemon) and `npm start` (node) scripts.
- Placeholder folders for future modules: `services/`, `providers/`,
  `prompts/`, `schemas/` (each with `.gitkeep` so they're tracked by git
  while empty).

Files created/modified:
- `ai-service/package.json`
- `ai-service/.env.example`
- `ai-service/.gitignore`
- `ai-service/README.md`
- `ai-service/src/index.js`
- `ai-service/src/routes/health.routes.js`
- `ai-service/src/controllers/health.controller.js`
- `ai-service/src/middleware/notFound.js`
- `ai-service/src/middleware/errorHandler.js`
- `ai-service/src/services/.gitkeep`
- `ai-service/src/providers/.gitkeep`
- `ai-service/src/prompts/.gitkeep`
- `ai-service/src/schemas/.gitkeep`
- `ai-service/AI_PROGRESS.md` (this file)

Dependencies added:
- `express` (^4.19.2) — HTTP server/routing
- `cors` (^2.8.5) — CORS support so other frontends can call the API
- `dotenv` (^16.4.5) — loads `.env` into `process.env`
- `nodemon` (^3.1.4, devDependency) — auto-restart during development

Endpoints added:
- `GET /health`

Testing performed:
- Ran `npm install` — 99 packages installed, no errors.
- Started the server with `node src/index.js`, confirmed console log
  `globetrotter-ai service running on port 5001`.
- `curl -i http://localhost:5001/health` → `200 OK`, body exactly
  `{"status":"ok","service":"globetrotter-ai"}`.
- `curl -i http://localhost:5001/nonexistent` → `404 Not Found`, body
  `{"status":"error","message":"Route not found: GET /nonexistent"}`.
- Server stopped cleanly after testing.

Test result:
PASS

Important implementation details:
- Default port is `5001` (set via `.env`, falls back to `5001` if unset).
- `middleware/` folder was added beyond the originally listed folder set
  because the task requires both a 404 handler and a centralized error
  handler; keeping them in `middleware/` avoided cluttering
  `controllers/` with non-request-handling logic. This is the only
  structural deviation from the exact folder list in the task spec.
- No AI provider, database, or authentication logic exists yet — all
  deliberately deferred per the task scope.

---

### Task 2 — Gemini provider integration

Status: COMPLETE

Implemented:
- `src/providers/gemini.provider.js` — wraps the `@google/genai` SDK.
  Exposes a single `generateText(prompt)` async function that returns
  Gemini's plain text response. The SDK client is created lazily (on
  first call) so a missing `GEMINI_API_KEY` doesn't crash the server at
  startup, only when the endpoint is actually hit.
- `src/controllers/ai.controller.js` — `testAiConnection` handler. Calls
  `generateText` with a fixed prompt and returns a safe JSON response.
  On failure, logs the error server-side only and returns a generic
  `502` with no provider details or key leaked to the client.
- `src/routes/ai.routes.js` — mounts `GET /test` (combined with the
  `/api/ai` prefix in `index.js`, giving `GET /api/ai/test`).
- `index.js` updated to mount the new router: `app.use("/api/ai",
  aiRoutes)`, added alongside (not replacing) the existing `/health`
  mount.
- `.env.example` updated with `GEMINI_API_KEY=` and `GEMINI_MODEL=`
  (names only, no values).

Files created/modified:
- `ai-service/src/providers/gemini.provider.js` (new)
- `ai-service/src/controllers/ai.controller.js` (new)
- `ai-service/src/routes/ai.routes.js` (new)
- `ai-service/src/index.js` (modified — added `aiRoutes` import and
  `app.use("/api/ai", aiRoutes)`; `/health` mount left untouched)
- `ai-service/.env.example` (modified — added Gemini variable names)
- `ai-service/package.json` / `package-lock.json` (modified — new
  dependency)
- `ai-service/AI_PROGRESS.md` (this update)

Dependencies added:
- `@google/genai` — installed version **2.18.0** (confirmed via `npm ls
  @google/genai` after install)

Gemini model used:
- Default: `gemini-2.5-flash`, defined once in
  `src/providers/gemini.provider.js` as `DEFAULT_MODEL`. Overridable at
  runtime via the `GEMINI_MODEL` environment variable — no model name
  is hard-coded anywhere else in the codebase.

Environment variables (names only):
```env
PORT=
NODE_ENV=
GEMINI_API_KEY=
GEMINI_MODEL=
```

New endpoint:
- `GET /api/ai/test` — sends a fixed prompt to Gemini
  ("Respond with exactly: Gemini connection successful.") and returns
  `{ "success": true, "message": "<gemini's reply>" }` on success, or
  `{ "success": false, "message": "AI provider request failed." }`
  with HTTP 502 on failure.

Testing performed:
- **Test 1 (Health):** `GET /health` → `200 OK`,
  `{"status":"ok","service":"globetrotter-ai"}`. Unchanged from Task 1.
  PASS.
- **Test 2 (Gemini):** `GET /api/ai/test` → returned HTTP `502` with
  `{"success":false,"message":"AI provider request failed."}`. This is
  the *expected safe-failure path*, not a code bug: this development
  sandbox's network egress allowlist does not include
  `generativelanguage.googleapis.com`, so the outbound request to
  Gemini is rejected before it reaches Google (confirmed server-side
  log only: `Host not in allowlist: generativelanguage.googleapis.com`,
  no API key present in that log line). **The Gemini round trip itself
  has not been verified against the live API in this environment.** The
  developer should re-run `GET /api/ai/test` with a real
  `GEMINI_API_KEY` in `.env` on their own machine (which has normal
  internet access) to confirm the live success path returns
  `{"success":true,"message":"Gemini connection successful."}`.
- **Test 3 (Unknown route):** `GET /api/ai/does-not-exist` → `404`,
  `{"status":"error","message":"Route not found: GET /api/ai/does-not-exist"}`.
  Existing 404 handler still works correctly. PASS.
- **Test 4 (Git security):** Ran `git init` + `git add -A` in a
  throwaway local check and confirmed `.env` does not appear in `git
  status --short` output (blocked by `.gitignore`). `.env.example`
  contains only variable names, no values. PASS.

Test result:
PASS for Tests 1, 3, 4. Test 2's error-handling path (safe failure, no
leaked secrets) verified; the live Gemini success path is UNTESTED in
this sandbox due to network egress restrictions and should be verified
by the developer locally before Task 2 is considered fully proven.

Error handling:
- All Gemini SDK calls are wrapped in try/catch inside the controller.
- On failure: logs `err.message` server-side only, returns generic
  `502` JSON with no stack trace, no raw SDK error object, and no API
  key exposed to the client.
- Route-level errors (e.g. missing route) still go through the existing
  404 handler; unexpected thrown errors elsewhere would still reach the
  existing centralized `errorHandler` middleware, which was not
  modified.

Security considerations:
- `GEMINI_API_KEY` is read only from `process.env`, never hard-coded.
- `.env` remains in `.gitignore` (verified, see Test 4).
- `.env.example` contains variable names only.
- The API key is never included in any HTTP response, log line, or
  this progress file.

Known issues:
- Live Gemini connectivity has not been verified in this development
  sandbox because its network egress allowlist blocks
  `generativelanguage.googleapis.com`. This is an environment
  limitation, not an application bug. The developer must confirm the
  live success path locally.

Architecture decisions:
- Kept the provider to a single file (`gemini.provider.js`) exposing
  one function, per the task's explicit "do not over-engineer" and
  "one provider is enough" instructions.
- Client instantiation is lazy (inside `getClient()`) rather than at
  module load time, so importing the provider never throws just because
  `.env` isn't configured yet — the error only surfaces when
  `generateText` is actually called.
- Model name centralized as `DEFAULT_MODEL` inside the provider file,
  overridable via `GEMINI_MODEL`, so no other file needs to know or
  duplicate the model string.

---

## Current API

### GET /health

Purpose:
Confirms the service is running. Used for uptime checks and initial
integration testing by the frontend team.

Request:
No parameters, no body.

Response (200):
```json
{
  "status": "ok",
  "service": "globetrotter-ai"
}
```

### GET /api/ai/test

Purpose:
Verifies the Node backend can successfully reach Gemini through the
provider layer. Sends a fixed test prompt.

Request:
No parameters, no body.

Response (200, success):
```json
{
  "success": true,
  "message": "Gemini connection successful."
}
```

Response (502, failure):
```json
{
  "success": false,
  "message": "AI provider request failed."
}
```

### Unmatched routes

Any request to a route that doesn't exist returns:

Response (404):
```json
{
  "status": "error",
  "message": "Route not found: <METHOD> <path>"
}
```

---

## Environment Variables

```env
PORT=5001
NODE_ENV=development
GEMINI_API_KEY=
GEMINI_MODEL=
```

`GEMINI_API_KEY` is required for `/api/ai/test` to succeed (obtained by
the developer from Google AI Studio). `GEMINI_MODEL` is optional — a
default is used if left blank. `.env` is git-ignored; only
`.env.example` is committed, and it contains variable names only.

---

## Dependencies

- `express` — core HTTP server and routing.
- `cors` — allows browser-based frontends on other origins to call this
  API.
- `dotenv` — loads environment variables from `.env`.
- `nodemon` (dev only) — restarts the server automatically on file
  changes during development.
- `@google/genai` (v2.18.0) — official Google Gen AI SDK, used only
  inside `src/providers/gemini.provider.js`.

No database drivers or auth libraries are installed yet.

---

## Database Status

Current status:
NOT IMPLEMENTED

No database connection, ORM, or schema exists.

---

## AI Provider Status

Current provider:
Gemini (via `@google/genai` v2.18.0)

`src/providers/gemini.provider.js` exposes `generateText(prompt)`,
used by `GET /api/ai/test` to prove the round trip works. Model is
configurable via `GEMINI_MODEL` (default `gemini-2.5-flash`, defined in
one place in the provider file). No other endpoints use the provider
yet — this task was scoped to connectivity proof only, not the actual
chatbot or trip drafting logic.

The live success path (real API key, real network) has not been
verified inside this development sandbox — see Known Issues.

---

## Smart Trip Drafting Status

Current status:
NOT IMPLEMENTED

Only the backend skeleton and health check exist. No intent extraction,
city/activity matching, or itinerary generation logic has been written.

---

## Frontend Integration Status

Current status:
PARTIAL

The service runs as a standalone HTTP server with CORS enabled, so any
frontend (React, Next.js, Vue, Angular, plain JS, mobile, or another
backend) can already call `GET /health` over HTTP. There are no
data-returning endpoints yet — nothing for a frontend to build real
features against.

---

## Known Issues

- The live Gemini success path (`GET /api/ai/test` with a real,
  working `GEMINI_API_KEY`) has not been verified in this development
  sandbox — its network egress allowlist blocks
  `generativelanguage.googleapis.com`. The code path that handles
  request/response and errors has been implemented and the *failure*
  path was verified end-to-end (safe error response, no leaked
  secrets). The developer should run `GET /api/ai/test` locally with
  their real key to confirm the success response before relying on
  this integration.

---

## Decisions Made

- JavaScript (not TypeScript) chosen per explicit project requirement,
  to keep the codebase approachable for a beginner/intermediate
  developer.
- Added a `middleware/` folder (not in the original spec) to house the
  404 and centralized error handler cleanly, rather than placing that
  logic in `controllers/` or directly in `index.js`.
- Default port set to `5001` in `.env.example` to avoid common conflicts
  with other local dev servers (e.g. `3000`), but this is easily changed
  by any teammate via `.env`.
- Empty future folders (`services/`, `prompts/`, `schemas/`) were
  created in Task 1 (with `.gitkeep`) so the folder structure matches
  the target architecture from the start, even though they contained no
  code yet. `providers/` now holds real code as of Task 2.
- Task 2: kept the Gemini integration to exactly one file exposing one
  function (`generateText`), per the explicit "don't over-engineer, one
  provider is enough" instruction, so a second provider can be added
  later as a sibling file without touching this one.
- Task 2: chose `gemini-2.5-flash` as the default model — a current,
  fast, low-cost model appropriate for a hackathon prototype test
  endpoint — while keeping it fully overridable via `GEMINI_MODEL`.

---

## Next Steps

- Developer to verify `GET /api/ai/test` against the live Gemini API
  locally (real key, unrestricted network) before Task 3.
- Task 3 — Chat API (`POST /api/ai/chat`), building on the existing
  `generateText` provider function.

---

## Instructions for the Next AI Assistant

- This is a hackathon project (GlobeTrotter / Wanderloom, Odoo
  hackathon). The developer is beginner/intermediate — keep changes
  small, explain decisions, and do not introduce unrequested features or
  dependencies.
- Task 1 and Task 2 are complete: Express server with `GET /health`,
  CORS, dotenv, a 404 handler, a centralized error handler, and a
  working Gemini provider (`src/providers/gemini.provider.js`,
  `generateText(prompt)`) exposed only through `GET /api/ai/test`.
  There is still no database integration — do not assume it exists.
- The live Gemini success path was not verified inside the sandbox that
  built Task 2 (network egress restriction); treat it as
  implemented-but-not-fully-proven until the developer confirms a real
  `200` success response locally.
- Follow the roadmap in the original master prompt (Task 3 through Task
  15) but implement only one task at a time, and stop after each task
  for confirmation before continuing.
- Do not fabricate cities, activities, prices, or IDs when Smart Trip
  Drafting is eventually implemented (Tasks 7+) — those must come from
  the real application database once it exists.
- When building the chat endpoint (Task 3), reuse
  `generateText(prompt)` from the existing provider rather than adding
  a second way to call Gemini.
- Git branch is `manav-work`; never push to `main` or perform
  destructive git operations without explicit request.
