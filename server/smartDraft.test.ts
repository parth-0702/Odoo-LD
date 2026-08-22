import { describe, expect, it } from "vitest";
import { buildGroundedDraft } from "./smartDraft";
import { applySmartTripDraft, type SmartDraftCatalogDestination } from "./db";
import { tripStops, trips } from "../drizzle/schema";
import { handoffSmartDraft, smartDraftItineraryUrl, smartDraftTripIdFromSearch, validateSmartDraftIntent, voiceIntentGuidance } from "../shared/smartDraft";
import { groundedItineraryDetail } from "../shared/itineraryDetail";

const catalog: SmartDraftCatalogDestination[] = [
  { id: 1, city: "Bangkok", country: "Thailand", region: "Southeast Asia", costIndex: 2, latitude: "13.7563", longitude: "100.5018", description: "Food and river routes.", activities: [{ id: 11, title: "Canal-side food walk", category: "food", description: null, estimatedCost: "18", durationMinutes: 150 }] },
  { id: 2, city: "Phuket", country: "Thailand", region: "Southeast Asia", costIndex: 3, latitude: "7.8804", longitude: "98.3923", description: "Beaches and island routes.", activities: [{ id: 21, title: "Longtail beach hop", category: "beach", description: null, estimatedCost: "38", durationMinutes: 300 }] },
];

describe("buildGroundedDraft", () => {
  it("uses only catalog city and activity IDs for a budget-aware itinerary", () => {
    const draft = buildGroundedDraft("5 days in Southeast Asia with food and beaches", catalog, { days: 5, budgetBand: "moderate", region: "Southeast Asia", interests: ["food", "beach"] });
    const cityIds = new Set(catalog.map(city => city.id));
    const activityIds = new Set(catalog.flatMap(city => city.activities.map(activity => activity.id)));

    expect(draft.candidates).toHaveLength(2);
    expect(draft.schedule).toHaveLength(5);
    expect(draft.candidates.every(city => cityIds.has(city.id))).toBe(true);
    expect(draft.schedule.every(entry => cityIds.has(entry.destinationId) && activityIds.has(entry.activityId))).toBe(true);
    expect(draft.schedule.some(entry => entry.title === "Canal-side food walk")).toBe(true);
    expect(draft.schedule[0].startTime).toBe("09:00");
    expect(draft.schedule[0].readinessNote).toContain("verify live availability");
  });

  it("adds practical timing and transfer guidance without inventing activities", () => {
    const detail = groundedItineraryDetail({ day: 2, city: "Phuket", category: "beach", durationMinutes: 300, previousCity: "Bangkok" });
    expect(detail.startTime).toBe("13:30");
    expect(detail.transferNote).toContain("Bangkok to Phuket");
    expect(detail.practicalNote).toContain("300 minutes");
  });

  it("keeps route variations grounded in the catalog", () => {
    const varied = buildGroundedDraft("5 days in Southeast Asia with food and beaches", catalog, { days: 5, budgetBand: "moderate", region: "Southeast Asia", interests: ["food", "beach"] }, "grounded-fallback", 3);
    const activityIds = new Set(catalog.flatMap(city => city.activities.map(activity => activity.id)));

    expect(varied.schedule).toHaveLength(5);
    expect(varied.schedule.every(entry => activityIds.has(entry.activityId))).toBe(true);
    expect(varied.schedule[0].destinationId).toBe(1);
  });

  it("does not substitute unrelated cities when a requested location is not catalogued", () => {
    const draft = buildGroundedDraft("I want to travel in India for 5 days", catalog, { days: 5, budgetBand: "moderate", region: "", interests: [], requestedLocation: "India" });

    expect(draft.catalogStatus).toBe("unavailable");
    expect(draft.candidates).toEqual([]);
    expect(draft.schedule).toEqual([]);
    expect(draft.catalogMessage).toContain("no unrelated route");
  });

  it("matches a requested country to only that country’s catalog when coverage exists", () => {
    const indiaCatalog: SmartDraftCatalogDestination[] = [
      { id: 7, city: "Goa", country: "India", region: "India", costIndex: 3, latitude: "15.2993", longitude: "74.1240", description: null, activities: [{ id: 71, title: "South Goa beach afternoon", category: "beach", description: null, estimatedCost: "18", durationMinutes: 240 }] },
      { id: 8, city: "Jaipur", country: "India", region: "India", costIndex: 2, latitude: "26.9124", longitude: "75.7873", description: null, activities: [{ id: 81, title: "Amber Fort sunrise visit", category: "culture", description: null, estimatedCost: "16", durationMinutes: 210 }] },
      ...catalog,
    ];
    const draft = buildGroundedDraft("I want to travel in India for 5 days", indiaCatalog, { days: 5, budgetBand: "moderate", region: "India", interests: [], requestedLocation: "India" });

    expect(draft.catalogStatus).toBe("matched");
    expect(draft.candidates.map(city => city.country)).toEqual(["India", "India"]);
    expect(draft.schedule.every(entry => [7, 8].includes(entry.destinationId))).toBe(true);
  });

  it("persists selected catalog stops and activities into a new editable trip", async () => {
    const inserts: { table: unknown; values: unknown }[] = [];
    const fakeDb = {
      insert: (table: unknown) => ({ values: (values: unknown) => { inserts.push({ table, values }); return table === trips ? [{ insertId: 77 }] : []; } }),
      select: () => ({ from: () => ({ where: () => ({ orderBy: async () => [{ id: 701, destinationId: 1 }, { id: 702, destinationId: 2 }] }) }) }),
    };
    const tripId = await applySmartTripDraft(9, { intent: "5 days with food and beaches", days: 2, budget: 280, destinationIds: [1, 2], schedule: [{ day: 1, destinationId: 1, activityId: 11 }, { day: 2, destinationId: 2, activityId: 21 }] }, { database: fakeDb, catalog });
    const savedStops = inserts.find(entry => entry.table === tripStops)?.values as { destinationId: number }[];
    const savedItinerary = inserts[inserts.length - 1]?.values as { title: string; stopId: number }[];

    expect(tripId).toBe(77);
    expect(savedStops.map(stop => stop.destinationId)).toEqual([1, 2]);
    expect(savedItinerary).toMatchObject([{ title: "Canal-side food walk", stopId: 701 }, { title: "Longtail beach hop", stopId: 702 }]);
  });

  it("persists detailed same-day entries with practical notes and staggered start times", async () => {
    const inserts: { table: unknown; values: unknown }[] = [];
    const fakeDb = {
      insert: (table: unknown) => ({ values: (values: unknown) => { inserts.push({ table, values }); return table === trips ? [{ insertId: 88 }] : []; } }),
      select: () => ({ from: () => ({ where: () => ({ orderBy: async () => [{ id: 801, destinationId: 1 }] }) }) }),
    };
    const detailedCatalog: SmartDraftCatalogDestination[] = [{ ...catalog[0], activities: [...catalog[0].activities, { id: 12, title: "Night market tasting", category: "food", description: "Taste regional dishes.", estimatedCost: "20", durationMinutes: 120 }] }];
    await applySmartTripDraft(9, { intent: "A detailed one-day food plan", days: 1, budget: 140, destinationIds: [1], schedule: [{ day: 1, destinationId: 1, activityId: 11 }, { day: 1, destinationId: 1, activityId: 12 }] }, { database: fakeDb, catalog: detailedCatalog });
    const savedItinerary = inserts[inserts.length - 1]?.values as { startTime: string; notes: string }[];

    expect(savedItinerary.map(entry => entry.startTime)).toEqual(["09:00", "13:30"]);
    expect(savedItinerary.every(entry => entry.notes.includes("Catalog-backed activity"))).toBe(true);
    expect(savedItinerary[0].notes).toContain("Arrival day");
  });

  it("validates short intents and generates the authenticated itinerary handoff URL", () => {
    expect(validateSmartDraftIntent("beach")).toContain("more detail");
    expect(validateSmartDraftIntent("5 days in Southeast Asia with food")).toBeNull();
    expect(smartDraftItineraryUrl(77)).toBe("/app?view=itinerary&trip=77");
    expect(smartDraftTripIdFromSearch("?view=itinerary&trip=77")).toBe(77);
    expect(smartDraftTripIdFromSearch("?view=itinerary&trip=0")).toBeNull();
    expect(voiceIntentGuidance(false)).toContain("type your idea");
    expect(voiceIntentGuidance(true)).toContain("Review it");
  });

  it("hands an imported trip into the selected editable itinerary route", () => {
    const events: string[] = [];
    handoffSmartDraft(77, { selectTrip: id => events.push(`select:${id}`), showItinerary: () => events.push("view:itinerary"), navigate: url => events.push(`navigate:${url}`) });
    expect(events).toEqual(["select:77", "view:itinerary", "navigate:/app?view=itinerary&trip=77"]);
  });
});
