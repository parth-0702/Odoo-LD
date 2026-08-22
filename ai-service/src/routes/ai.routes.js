const express = require("express");
const { testAiConnection, chat } = require("../controllers/ai.controller");

const router = express.Router();

// GET /api/ai/test
router.get("/test", testAiConnection);

// POST /api/ai/chat
router.post("/chat", chat);

module.exports = router;