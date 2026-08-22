const { generateText } = require("../providers/gemini.provider");

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

module.exports = { testAiConnection };
