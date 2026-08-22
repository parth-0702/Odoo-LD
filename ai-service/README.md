# GlobeTrotter AI Service

AI module for the GlobeTrotter / Wanderloom project. This service is being
built incrementally to eventually power **Smart Trip Drafting**.

This is Task 1: backend foundation only. No AI provider, no database, and
no chatbot functionality are implemented yet.

## Requirements

- Node.js 18+ (developed/tested on Node 22)
- npm

## Setup

```bash
cd ai-service
npm install
cp .env.example .env
```

## Run

Development (auto-restarts on file changes):

```bash
npm run dev
```

Production:

```bash
npm start
```

The service listens on the port set in `.env` (default `5001`).

## Endpoints

### GET /health

Returns service status.

Response:

```json
{
  "status": "ok",
  "service": "globetrotter-ai"
}
```

## Folder Structure

```text
ai-service/
├── src/
│   ├── routes/         # Express route definitions
│   ├── controllers/     # Request handlers
│   ├── services/         # Business logic (empty for now)
│   ├── providers/        # AI provider integrations (empty for now)
│   ├── prompts/           # Prompt templates (empty for now)
│   ├── schemas/            # Validation/response schemas (empty for now)
│   ├── middleware/          # 404 + centralized error handling
│   └── index.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Status

See `AI_PROGRESS.md` in the repository root for the current development
status and roadmap.
