import { describe, expect, it } from "vitest";
import { calculateBudget, isValidTripDates } from "../shared/tripMath";

describe("trip planning utilities", () => {
  it("totals expenses and identifies when a budget is exceeded", () => {
    const result = calculateBudget(
      [
        { category: "transport", amount: 210 },
        { category: "stay", amount: "650" },
        { category: "activities", amount: 190 },
      ],
      900,
    );

    expect(result.total).toBe(1050);
    expect(result.remaining).toBe(-150);
    expect(result.isOverBudget).toBe(true);
    expect(result.byCategory.stay).toBe(650);
  });

  it("requires an end date on or after the start date", () => {
    expect(isValidTripDates("2026-05-10", "2026-05-16")).toBe(true);
    expect(isValidTripDates("2026-05-16", "2026-05-10")).toBe(false);
  });
});
