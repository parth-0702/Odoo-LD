const express = require("express");
const { testAiConnection } = require("../controllers/ai.controller");

const router = express.Router();

// GET /api/ai/test
router.get("/test", testAiConnection);

module.exports = router;
