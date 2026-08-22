const { generateText } = require("../providers/gemini.provider");
const { getChatReply } = require("../services/chat.service");

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

module.exports = { testAiConnection, chat };
