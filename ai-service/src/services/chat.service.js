const { generateText } = require("../providers/gemini.provider");
const { CHAT_SYSTEM_PROMPT } = require("../prompts/chat.prompt");

/**
 * Sends a single user chat message to Gemini, prefixed with the
 * travel-assistant system prompt, and returns the plain text reply.
 *
 * This is intentionally simple: one-shot prompt in, plain text out.
 * No conversation memory/history — that's out of scope for this task.
 *
 * @param {string} message
 * @returns {Promise<string>}
 */
async function getChatReply(message) {
  const prompt = `${CHAT_SYSTEM_PROMPT}\n\nUser: ${message}`;
  const text = await generateText(prompt);
  return text ? text.trim() : "";
}

module.exports = { getChatReply };