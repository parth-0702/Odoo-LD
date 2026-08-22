const { generateText } = require("../providers/gemini.provider");
const { getChatReply } = require("../services/chat.service");
const { getTripPreferences } = require("../services/trip-preferences.service");

// Simple round-trip check: send a fixed prompt to Gemini and confirm we get
// a response back. Does not expose provider error details to the client.
async function testAiConnection(req, res) {
  try {
    const text = await generateText("Respond with exactly: Gemini connection successful.");

    res.status(200).json({
      success: true,
      message: text ? text.trim() : "Gemini connection successful.",
    });
  } catch (err) {
    // Log server-side only. Never forward the raw error (it can include
    // request details) or the API key to the client.
    console.error("Gemini test request failed:", err.message || err);

    res.status(502).json({
      success: false,
      message: "AI provider request failed.",
    });
  }
}

// Basic, UI-independent chat endpoint. Validates the request body, delegates
// to chat.service for the actual Gemini call, and never leaks provider
// errors, stack traces, or env vars to the client.
async function chat(req, res) {
  const { message } = req.body || {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message is required.",
    });
  }

  try {
    const reply = await getChatReply(message.trim());

    res.status(200).json({
      success: true,
      message: reply || "Sorry, I don't have a response for that right now.",
    });
  } catch (err) {
    console.error("Gemini chat request failed:", err.message || err);

    res.status(502).json({
      success: false,
      message: "AI provider request failed.",
    });
  }
}

// Task 4: POST /api/ai/trip/preferences
// Extracts structured trip preferences (days, region, budget, interests)
// from a free-text travel request. This is preference extraction only —
// no database retrieval, no city/activity matching, no itinerary
// generation. Uses the same message validation rules as /api/ai/chat.
async function extractTripPreferences(req, res) {
  const { message } = req.body || {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message is required.",
    });
  }

  try {
    const preferences = await getTripPreferences(message.trim());

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (err) {
    // Covers Gemini provider failures as well as invalid JSON / invalid
    // schema returned by the model. Never forward raw error details,
    // stack traces, or the API key to the client.
    console.error("Trip preference extraction failed:", err.message || err);

    res.status(502).json({
      success: false,
      message: "AI preference extraction failed.",
    });
  }
}

module.exports = { testAiConnection, chat, extractTripPreferences };
