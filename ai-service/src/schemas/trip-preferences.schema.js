// Validation for the trip preferences structure produced by Gemini
// (POST /api/ai/trip/preferences, Task 4).
//
// This module does NOT talk to Gemini or the network — it only validates a
// plain JS object against the conceptual schema:
//
// {
//   days: number | null,
//   region: string | null,
//   budget: "low" | "moderate" | "high" | null,
//   interests: string[]
// }

const VALID_BUDGETS = new Set(["low", "moderate", "high"]);

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates (and normalizes) a candidate trip-preferences object.
 *
 * @param {*} candidate Parsed JSON from the AI provider.
 * @returns {{ valid: true, value: Object } | { valid: false, reason: string }}
 */
function validateTripPreferences(candidate) {
  if (!isPlainObject(candidate)) {
    return { valid: false, reason: "Preferences must be a JSON object." };
  }

  const { days, region, budget, interests } = candidate;

  // days: integer or null, positive when present
  let validDays = null;
  if (days !== null && days !== undefined) {
    if (typeof days !== "number" || !Number.isFinite(days) || !Number.isInteger(days)) {
      return { valid: false, reason: "days must be an integer or null." };
    }
    if (days <= 0) {
      return { valid: false, reason: "days must be positive when present." };
    }
    validDays = days;
  }

  // region: string or null
  let validRegion = null;
  if (region !== null && region !== undefined) {
    if (typeof region !== "string" || region.trim().length === 0) {
      return { valid: false, reason: "region must be a non-empty string or null." };
    }
    validRegion = region.trim();
  }

  // budget: only low, moderate, high, or null
  let validBudget = null;
  if (budget !== null && budget !== undefined) {
    if (typeof budget !== "string" || !VALID_BUDGETS.has(budget)) {
      return { valid: false, reason: "budget must be one of low, moderate, high, or null." };
    }
    validBudget = budget;
  }

  // interests: array of strings
  if (!Array.isArray(interests)) {
    return { valid: false, reason: "interests must be an array." };
  }
  const validInterests = [];
  for (const interest of interests) {
    if (typeof interest !== "string" || interest.trim().length === 0) {
      return { valid: false, reason: "interests must contain only non-empty strings." };
    }
    validInterests.push(interest.trim());
  }

  return {
    valid: true,
    value: {
      days: validDays,
      region: validRegion,
      budget: validBudget,
      interests: validInterests,
    },
  };
}

module.exports = { validateTripPreferences };
