import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/mysql-core";
import { activities, destinations, expenses, favorites, itineraryItems, tripStops, trips } from "../drizzle/schema";

function indexNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).indexes.map(index => index.config.name);
}

describe("performance schema contracts", () => {
  it("indexes high-frequency catalog, ownership, itinerary, and expense lookup paths", () => {
    expect(indexNames(activities)).toContain("activity_destination_idx");
    expect(indexNames(destinations)).toContain("destination_region_cost_idx");
    expect(indexNames(trips)).toContain("trip_owner_updated_idx");
    expect(indexNames(tripStops)).toContain("trip_stop_trip_position_idx");
    expect(indexNames(itineraryItems)).toContain("itinerary_trip_date_position_idx");
    expect(indexNames(expenses)).toContain("expense_trip_created_idx");
  });

  it("prevents duplicate favorites at the schema level", () => {
    expect(indexNames(favorites)).toContain("favorite_user_destination_unq");
  });
});
