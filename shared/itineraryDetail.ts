export type GroundedItineraryDetail = {
  startTime: string;
  slot: "Morning" | "Afternoon" | "Evening";
  practicalNote: string;
  transferNote: string;
  readinessNote: string;
};

export function groundedItineraryDetail(input: { day: number; city: string; category: string; durationMinutes: number | null; previousCity?: string; slotIndex?: number }) : GroundedItineraryDetail {
  const slot = (["Morning", "Afternoon", "Evening"] as const)[input.slotIndex ?? ((input.day - 1) % 3)];
  const startTime = slot === "Morning" ? "09:00" : slot === "Afternoon" ? "13:30" : "18:00";
  const duration = input.durationMinutes ? `${input.durationMinutes} minutes` : "a flexible duration";
  const categoryHint = input.category.toLowerCase().includes("food")
    ? "Keep meal timing flexible and confirm any dietary needs directly with the venue."
    : input.category.toLowerCase().includes("beach") || input.category.toLowerCase().includes("outdoor")
      ? "Check local conditions and carry water, sun protection, and a backup indoor option."
      : "Confirm opening hours, ticket requirements, and local access details before departure.";
  const transferNote = !input.previousCity
    ? `Arrival day: leave an unplanned buffer before exploring ${input.city}.`
    : input.previousCity !== input.city
      ? `Travel transition from ${input.previousCity} to ${input.city}: reserve a transfer window before this activity.`
      : `Stay in ${input.city}: allow a 30-minute local transit buffer before this activity.`;
  return {
    startTime,
    slot,
    practicalNote: `Plan for ${duration}. ${categoryHint}`,
    transferNote,
    readinessNote: "Catalog-backed activity — verify live availability, transport, and reservations before travel.",
  };
}
