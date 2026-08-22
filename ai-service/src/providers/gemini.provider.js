const { GoogleGenAI } = require("@google/genai");

// Single place where the default model name lives. Override via
// GEMINI_MODEL in .env if you want to point at a different model.
const DEFAULT_MODEL = "gemini-2.5-flash";

let client = null;

// Lazily creates the SDK client so a missing API key only fails when the
// provider is actually used, not at server startup.
function getClient() {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Sends a single text prompt to Gemini and returns the plain text response.
 * This is the only function the rest of the app should need from this
 * provider — Gemini SDK details stay inside this file.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function generateText(prompt) {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

module.exports = { generateText };
