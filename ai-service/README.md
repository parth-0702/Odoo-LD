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

### POST /api/ai/trip/preferences

Extracts structured trip preferences (days, region, budget, interests)
from a free-text travel request using Gemini. This is preference
extraction only — no database retrieval, city/activity matching, or
itinerary generation happens here yet.

Request:

```json
{
  "message": "I have 5 days, moderate budget, I love beaches and food, and want to explore Southeast Asia."
}
```

Success response:

```json
{
  "success": true,
  "preferences": {
    "days": 5,
    "region": "Southeast Asia",
    "budget": "moderate",
    "interests": ["beaches", "food"]
  }
}
```

Any field the AI can't confidently determine from the message is `null`
(or an empty array for `interests`) rather than guessed.

Validation failure (missing/empty/non-string `message`) — HTTP 400:

```json
{
  "success": false,
  "message": "Message is required."
}
```

Provider failure (Gemini error, or invalid JSON/structure returned by the
model) — HTTP 502:

```json
{
  "success": false,
  "message": "AI preference extraction failed."
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
