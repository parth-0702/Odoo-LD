const { generateText } = require("../providers/gemini.provider");
const { TRIP_PREFERENCES_SYSTEM_PROMPT } = require("../prompts/trip-preferences.prompt");
const { validateTripPreferences } = require("../schemas/trip-preferences.schema");

// Defensive strip in case the model wraps its JSON in ```json fences despite
// being told not to. Does not change well-formed output.
function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

/**
 * Sends the user's free-text travel request to Gemini and returns a
 * validated, normalized trip-preferences object.
 *
 * Throws an Error (with a `code` of "INVALID_JSON" or "INVALID_SCHEMA")
 * when Gemini's output can't be parsed or doesn't match the expected
 * structure. Provider-level errors (network/auth/etc.) propagate as-is;
 * the controller is responsible for turning any of these into a safe
 * client-facing 502 response.
 *
 * @param {string} message
 * @returns {Promise<{days: number|null, region: string|null, budget: string|null, interests: string[]}>}
 */
async function getTripPreferences(message) {
  const prompt = `${TRIP_PREFERENCES_SYSTEM_PROMPT}\n\nUser message: ${message}`;

  const rawText = await generateText(prompt, { responseMimeType: "application/json" });

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText || ""));
  } catch (err) {
    const parseError = new Error("AI provider returned invalid JSON.");
    parseError.code = "INVALID_JSON";
    throw parseError;
  }

  const result = validateTripPreferences(parsed);
  if (!result.valid) {
    const schemaError = new Error(`AI provider returned an invalid preference structure: ${result.reason}`);
    schemaError.code = "INVALID_SCHEMA";
    throw schemaError;
  }

  return result.value;
}

module.exports = { getTripPreferences };
