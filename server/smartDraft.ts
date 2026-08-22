import { invokeLLM, listLLMModels } from "./_core/llm";
import * as db from "./db";
import { groundedItineraryDetail } from "../shared/itineraryDetail";

export type SmartDraft = {
  days: number;
  budget: number;
  budgetBand: "value" | "moderate" | "premium";
  candidates: { id: number; city: string; country: string; region: string; costIndex: number; description: string | null; reason: string }[];
  schedule: { day: number; destinationId: number; activityId: number; city: string; title: string; category: string; estimatedCost: number; durationMinutes: number | null; startTime: string; slot: "Morning" | "Afternoon" | "Evening"; practicalNote: string; transferNote: string; readinessNote: string }[];
  provider: "ai" | "grounded-fallback";
  catalogStatus: "matched" | "unavailable";
  requestedLocation?: string;
  catalogMessage?: string;
  availableLocations?: string[];
};

type Intent = { days: number; budgetBand: "value" | "moderate" | "premium"; region: string; interests: string[]; destinationIds?: number[]; requestedLocation?: string };

function extractRequestedLocation(text: string) {
  const match = text.match(/\b(?:in|to)\s+([a-z][a-z\s-]{1,40}?)(?=\s+(?:for|with|and|on)\b|[,!.]|$)/i);
  return match?.[1]?.trim().replace(/^(the|my)\s+/i, "") || undefined;
}

function matchCatalogLocation(text: string, catalog: db.SmartDraftCatalogDestination[]) {
  const lower = text.toLowerCase();
  const matches = catalog.flatMap(city => [
    { term: city.city, region: city.region, destinationIds: [city.id] },
    { term: city.country, region: city.region, destinationIds: undefined },
    { term: city.region, region: city.region, destinationIds: undefined },
  ]).filter(match => match.term.length >= 3 && match.term.toLowerCase() !== "global" && lower.includes(match.term.toLowerCase()));
  return matches.sort((a, b) => b.term.length - a.term.length)[0];
}

function parseIntentFallback(text: string, catalog: db.SmartDraftCatalogDestination[]): Intent {
  const lower = text.toLowerCase();
  const days = Math.max(2, Math.min(10, Number(lower.match(/(\d{1,2})\s*(?:day|days|night|nights)/)?.[1] ?? 5)));
  const budgetBand = /(cheap|budget|low cost|value)/.test(lower) ? "value" : /(luxury|premium|high[- ]?end)/.test(lower) ? "premium" : "moderate";
  const interests = ["food", "beach", "culture", "outdoors"].filter(term => lower.includes(term));
  const requestedLocation = extractRequestedLocation(text);
  const match = matchCatalogLocation(text, catalog);
  return { days, budgetBand, region: match?.region ?? "", interests, destinationIds: match?.destinationIds, requestedLocation };
}

export function buildGroundedDraft(intentText: string, catalog: db.SmartDraftCatalogDestination[], parsed: Intent, provider: SmartDraft["provider"] = "grounded-fallback", variation = 0): SmartDraft {
  const targetCost = parsed.budgetBand === "value" ? 2 : parsed.budgetBand === "premium" ? 5 : 3;
  const regionMatches = parsed.region ? catalog.filter(city => city.region.toLowerCase() === parsed.region.toLowerCase()) : catalog;
  const usable = (regionMatches.length ? regionMatches : catalog).filter(city => city.activities.length);
  const requested = parsed.destinationIds?.map(id => usable.find(city => city.id === id)).filter(Boolean) as db.SmartDraftCatalogDestination[] | undefined;
  if (parsed.requestedLocation && !parsed.region && !requested?.length) {
    return {
      days: parsed.days,
      budget: parsed.budgetBand === "value" ? parsed.days * 75 : parsed.budgetBand === "premium" ? parsed.days * 240 : parsed.days * 140,
      budgetBand: parsed.budgetBand,
      candidates: [],
      schedule: [],
      provider,
      catalogStatus: "unavailable",
      requestedLocation: parsed.requestedLocation,
      catalogMessage: `“${parsed.requestedLocation}” is not in the current activity catalog, so no unrelated route was created. Add a destination and activities for it, or choose one of the catalog locations below.`,
      availableLocations: Array.from(new Set(catalog.map(city => city.country))).sort(),
    };
  }
  const cities = (requested?.length ? requested : [...usable].sort((a, b) => Math.abs(a.costIndex - targetCost) - Math.abs(b.costIndex - targetCost))).slice(0, 3);
  if (!cities.length) throw new Error("The city catalog needs at least one destination with activities before drafting a trip.");
  const schedule = Array.from({ length: parsed.days }, (_, index) => {
    const city = cities[(index + variation) % cities.length];
    const preferredActivities = city.activities.filter(activity => parsed.interests.some(interest => activity.category.toLowerCase().includes(interest)));
    const activities = preferredActivities.length ? preferredActivities : city.activities;
    const previousCity = index ? cities[(index - 1 + variation) % cities.length]?.city : undefined;
    return Array.from({ length: Math.min(2, activities.length) }, (_, slotIndex) => {
      const activity = activities[(index + variation + slotIndex) % activities.length];
      return { day: index + 1, destinationId: city.id, activityId: activity.id, city: city.city, title: activity.title, category: activity.category, estimatedCost: Number(activity.estimatedCost), durationMinutes: activity.durationMinutes, ...groundedItineraryDetail({ day: index + 1, city: city.city, category: activity.category, durationMinutes: activity.durationMinutes, previousCity, slotIndex }) };
    });
  }).flat();
  return { days: parsed.days, budget: parsed.budgetBand === "value" ? parsed.days * 75 : parsed.budgetBand === "premium" ? parsed.days * 240 : parsed.days * 140, budgetBand: parsed.budgetBand, candidates: cities.map(city => ({ id: city.id, city: city.city, country: city.country, region: city.region, costIndex: city.costIndex, description: city.description, reason: `Matches your ${parsed.budgetBand} budget and has ${city.activities.length} catalog activities.` })), schedule, provider, catalogStatus: "matched", requestedLocation: parsed.requestedLocation };
}

export async function getSmartTripDraft(intentText: string, variation = 0) {
  const catalog = await db.getSmartDraftCatalog();
  const fallback = parseIntentFallback(intentText, catalog);
  if (!catalog.length) throw new Error("The city catalog is currently empty.");
  try {
    const { data: models } = await listLLMModels();
    const model = models.find(model => model.id === "gpt-5-nano")?.id ?? models.find(model => model.id === "gpt-5-mini")?.id ?? models[0]?.id;
    if (!model) return buildGroundedDraft(intentText, catalog, fallback, "grounded-fallback", variation);
    const catalogSummary = catalog.map(city => ({ id: city.id, city: city.city, country: city.country, region: city.region, costIndex: city.costIndex, activities: city.activities.map(activity => ({ id: activity.id, category: activity.category })) }));
    const response = await invokeLLM({ model, messages: [{ role: "system", content: "Extract travel preferences and choose only destination IDs from the supplied catalog. Never invent IDs, cities, or activities. This is a catalog-grounded planner, not a travel chatbot." }, { role: "user", content: `Intent: ${intentText}\nRoute variation: ${variation}\nCatalog: ${JSON.stringify(catalogSummary)}` }], response_format: { type: "json_schema", json_schema: { name: "grounded_trip_intent", strict: true, schema: { type: "object", properties: { days: { type: "integer", minimum: 2, maximum: 10 }, budgetBand: { type: "string", enum: ["value", "moderate", "premium"] }, region: { type: "string" }, interests: { type: "array", items: { type: "string" }, maxItems: 4 }, destinationIds: { type: "array", items: { type: "integer" }, minItems: 1, maxItems: 3 }, requestedLocation: { type: "string" } }, required: ["days", "budgetBand", "region", "interests", "destinationIds", "requestedLocation"], additionalProperties: false } } } });
    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const preserveExplicitLocation = fallback.requestedLocation ? { region: fallback.region, destinationIds: fallback.destinationIds, requestedLocation: fallback.requestedLocation } : {};
    return buildGroundedDraft(intentText, catalog, { ...fallback, ...parsed, ...preserveExplicitLocation }, "ai", variation);
  } catch {
    return buildGroundedDraft(intentText, catalog, fallback, "grounded-fallback", variation);
  }
}
