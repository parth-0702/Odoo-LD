export const SMART_DRAFT_MIN_INTENT_LENGTH = 12;

export function validateSmartDraftIntent(intent: string) {
  return intent.trim().length >= SMART_DRAFT_MIN_INTENT_LENGTH
    ? null
    : "Give the planner a little more detail — dates, a region, interests, or budget all help.";
}

export function smartDraftItineraryUrl(tripId: number) {
  return `/app?view=itinerary&trip=${tripId}`;
}

export function smartDraftTripIdFromSearch(search: string) {
  const tripId = Number(new URLSearchParams(search).get("trip"));
  return Number.isSafeInteger(tripId) && tripId > 0 ? tripId : null;
}

export function voiceIntentGuidance(isSupported: boolean) {
  return isSupported
    ? "Voice adds a transcript to your trip idea. Review it before drafting."
    : "Voice capture is supported in Chromium-based browsers; type your idea here if it is unavailable.";
}

export function handoffSmartDraft(tripId: number, actions: { selectTrip: (id: number) => void; showItinerary: () => void; navigate: (url: string) => void }) {
  actions.selectTrip(tripId);
  actions.showItinerary();
  actions.navigate(smartDraftItineraryUrl(tripId));
}
