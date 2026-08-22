const express = require("express");
const { testAiConnection, chat, extractTripPreferences } = require("../controllers/ai.controller");

const router = express.Router();

// GET /api/ai/test
router.get("/test", testAiConnection);

// POST /api/ai/chat
router.post("/chat", chat);

// POST /api/ai/trip/preferences
router.post("/trip/preferences", extractTripPreferences);

module.exports = router;