import { and, asc, avg, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { activities, destinations, expenses, favorites, InsertUser, itineraryItems, tripShares, tripStops, trips, userPreferences, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { groundedItineraryDetail } from "../shared/itineraryDetail";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getTripsByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trips).where(eq(trips.ownerId, ownerId)).orderBy(desc(trips.updatedAt));
}

export async function getTripWorkspace(ownerId: number, tripId: number) {
  const db = await getDb();
  if (!db) return null;
  const [trip] = await db.select().from(trips).where(and(eq(trips.id, tripId), eq(trips.ownerId, ownerId))).limit(1);
  if (!trip) return null;
  const [stops, itinerary, tripExpenses] = await Promise.all([
    db.select().from(tripStops).where(eq(tripStops.tripId, tripId)).orderBy(asc(tripStops.position)),
    db.select().from(itineraryItems).where(eq(itineraryItems.tripId, tripId)).orderBy(asc(itineraryItems.position)),
    db.select().from(expenses).where(eq(expenses.tripId, tripId)).orderBy(desc(expenses.createdAt)),
  ]);
  return { trip, stops, itinerary, expenses: tripExpenses };
}

export async function createTrip(ownerId: number, input: Omit<typeof trips.$inferInsert, "ownerId">) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(trips).values({ ...input, ownerId });
  return Number(result[0].insertId);
}

export async function createTripStops(ownerId: number, tripId: number, stops: { city: string; country: string; latitude: string; longitude: string; position: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const [trip] = await db.select({ id: trips.id }).from(trips).where(and(eq(trips.id, tripId), eq(trips.ownerId, ownerId))).limit(1);
  if (!trip) throw new Error("Trip not found");
  if (stops.length) await db.insert(tripStops).values(stops.map(stop => ({ ...stop, tripId })));
}

export async function createItineraryItem(ownerId: number, tripId: number, input: Omit<typeof itineraryItems.$inferInsert, "tripId" | "position">) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  await db.insert(itineraryItems).values({ ...input, tripId, position: workspace.itinerary.length });
}

export async function deleteItineraryItem(ownerId: number, tripId: number, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  await db.delete(itineraryItems).where(and(eq(itineraryItems.id, itemId), eq(itineraryItems.tripId, tripId)));
}

export async function updateItineraryItem(ownerId: number, tripId: number, itemId: number, input: { title?: string; startTime?: string; itineraryDate?: Date; type?: "activity" | "transport" | "stay"; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  await db.update(itineraryItems).set(input).where(and(eq(itineraryItems.id, itemId), eq(itineraryItems.tripId, tripId)));
}

export async function createExpense(ownerId: number, tripId: number, input: Omit<typeof expenses.$inferInsert, "tripId">) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  await db.insert(expenses).values({ ...input, tripId });
}

export async function createShare(ownerId: number, tripId: number, shareCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  await db.insert(tripShares).values({ tripId, shareCode });
  await db.update(trips).set({ visibility: "public" }).where(eq(trips.id, tripId));
  return shareCode;
}

export async function getPublicTripByShareCode(shareCode: string) {
  const db = await getDb();
  if (!db) return null;
  const [share] = await db.select().from(tripShares).where(eq(tripShares.shareCode, shareCode)).limit(1);
  if (!share) return null;
  const [trip] = await db.select().from(trips).where(and(eq(trips.id, share.tripId), eq(trips.visibility, "public"))).limit(1);
  if (!trip) return null;
  const [stops, itinerary, tripExpenses] = await Promise.all([
    db.select().from(tripStops).where(eq(tripStops.tripId, trip.id)).orderBy(asc(tripStops.position)),
    db.select().from(itineraryItems).where(eq(itineraryItems.tripId, trip.id)).orderBy(asc(itineraryItems.position)),
    db.select().from(expenses).where(eq(expenses.tripId, trip.id)).orderBy(desc(expenses.createdAt)),
  ]);
  return { trip, stops, itinerary, expenses: tripExpenses };
}

export async function reorderItinerary(ownerId: number, tripId: number, orderedItemIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const workspace = await getTripWorkspace(ownerId, tripId);
  if (!workspace) throw new Error("Trip not found");
  const ownedIds = new Set(workspace.itinerary.map(item => item.id));
  if (orderedItemIds.length !== ownedIds.size || orderedItemIds.some(id => !ownedIds.has(id))) throw new Error("Invalid itinerary order");
  await Promise.all(orderedItemIds.map((itemId, position) => db.update(itineraryItems).set({ position }).where(and(eq(itineraryItems.id, itemId), eq(itineraryItems.tripId, tripId)))));
}

export async function copyPublicTrip(ownerId: number, shareCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const publicTrip = await getPublicTripByShareCode(shareCode);
  if (!publicTrip) throw new Error("Public trip not found");
  const tripId = await createTrip(ownerId, {
    name: `${publicTrip.trip.name} (copy)`,
    description: publicTrip.trip.description,
    startDate: publicTrip.trip.startDate,
    endDate: publicTrip.trip.endDate,
    travelers: publicTrip.trip.travelers,
    budget: publicTrip.trip.budget,
    currency: publicTrip.trip.currency,
    preferences: publicTrip.trip.preferences,
    visibility: "private",
    coverImage: publicTrip.trip.coverImage,
  });
  if (publicTrip.stops.length) await db.insert(tripStops).values(publicTrip.stops.map(({ id, tripId: _, destinationId, city, country, latitude, longitude, arrivalDate, departureDate, position }) => ({ tripId, destinationId, city, country, latitude, longitude, arrivalDate, departureDate, position })));
  if (publicTrip.itinerary.length) await db.insert(itineraryItems).values(publicTrip.itinerary.map(({ id, tripId: _, stopId: __, itineraryDate, startTime, type, title, notes, estimatedCost, position }) => ({ tripId, itineraryDate, startTime, type, title, notes, estimatedCost, position })));
  if (publicTrip.expenses.length) await db.insert(expenses).values(publicTrip.expenses.map(({ id, tripId: _, category, title, amount, expenseDate }) => ({ tripId, category, title, amount, expenseDate })));
  return tripId;
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return preferences ?? null;
}

export async function saveUserPreferences(userId: number, input: { travelStyle?: string; budgetStyle?: string; favoriteCategories?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const values = { userId, ...input };
  await db.insert(userPreferences).values(values).onDuplicateKeyUpdate({ set: input });
}

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return { users: 0, trips: 0, destinations: 0, activities: 0, publicTrips: 0, averageBudget: 0 };
  const [userCount, tripCount, destinationCount, activityCount, publicTripCount, average] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(trips),
    db.select({ value: count() }).from(destinations),
    db.select({ value: count() }).from(activities),
    db.select({ value: count() }).from(trips).where(eq(trips.visibility, "public")),
    db.select({ value: avg(trips.budget) }).from(trips),
  ]);
  return { users: Number(userCount[0]?.value ?? 0), trips: Number(tripCount[0]?.value ?? 0), destinations: Number(destinationCount[0]?.value ?? 0), activities: Number(activityCount[0]?.value ?? 0), publicTrips: Number(publicTripCount[0]?.value ?? 0), averageBudget: Number(average[0]?.value ?? 0) };
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: favorites.id, destinationId: destinations.id, city: destinations.city, country: destinations.country, latitude: destinations.latitude, longitude: destinations.longitude, coverImage: destinations.coverImage }).from(favorites).innerJoin(destinations, eq(favorites.destinationId, destinations.id)).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
}

export async function toggleFavoriteDestination(userId: number, input: { city: string; country: string; latitude: string; longitude: string; coverImage?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const [existingDestination] = await db.select().from(destinations).where(and(eq(destinations.city, input.city), eq(destinations.country, input.country))).limit(1);
  let destinationId = existingDestination?.id;
  if (!destinationId) {
    const result = await db.insert(destinations).values(input);
    destinationId = Number(result[0].insertId);
  }
  const [existingFavorite] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.destinationId, destinationId))).limit(1);
  if (existingFavorite) {
    await db.delete(favorites).where(eq(favorites.id, existingFavorite.id));
    return { saved: false, destinationId };
  }
  await db.insert(favorites).values({ userId, destinationId });
  return { saved: true, destinationId };
}

export async function getAdminDestinations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(destinations).orderBy(desc(destinations.createdAt));
}

export async function createAdminDestination(input: typeof destinations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(destinations).values(input);
  return Number(result[0].insertId);
}

export async function createAdminActivity(input: typeof activities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(activities).values(input);
}

export type SmartDraftCatalogDestination = {
  id: number;
  city: string;
  country: string;
  region: string;
  costIndex: number;
  latitude: string;
  longitude: string;
  description: string | null;
  activities: { id: number; title: string; category: string; description: string | null; estimatedCost: string; durationMinutes: number | null }[];
};

export async function getSmartDraftCatalog(): Promise<SmartDraftCatalogDestination[]> {
  const db = await getDb();
  if (!db) return [];
  const [cityRows, activityRows] = await Promise.all([
    db.select().from(destinations).orderBy(asc(destinations.costIndex), asc(destinations.city)),
    db.select().from(activities),
  ]);
  return cityRows.map(city => ({
    ...city,
    costIndex: Number(city.costIndex),
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    activities: activityRows.filter(activity => activity.destinationId === city.id).map(activity => ({ ...activity, estimatedCost: String(activity.estimatedCost) })),
  }));
}

export async function applySmartTripDraft(ownerId: number, input: { intent: string; days: number; budget: number; destinationIds: number[]; schedule: { day: number; destinationId: number; activityId: number }[] }, dependencies?: { database: any; catalog: SmartDraftCatalogDestination[] }) {
  const db = dependencies?.database ?? await getDb();
  if (!db) throw new Error("Database is unavailable");
  const catalog = dependencies?.catalog ?? await getSmartDraftCatalog();
  const selectedDestinations = input.destinationIds.map(id => catalog.find(city => city.id === id)).filter(Boolean) as SmartDraftCatalogDestination[];
  if (selectedDestinations.length < 1 || selectedDestinations.length > 3) throw new Error("Choose between one and three grounded destinations");
  const validActivityIds = new Set(selectedDestinations.flatMap(city => city.activities.map(activity => activity.id)));
  if (input.schedule.some(entry => !validActivityIds.has(entry.activityId) || entry.day < 1 || entry.day > input.days)) throw new Error("Draft includes an activity outside the selected catalog");
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + input.days - 1);
  const result = await db.insert(trips).values({ ownerId, name: `Smart draft · ${selectedDestinations.map(city => city.city).join(" + ")}`, description: `Grounded draft based on: ${input.intent}`, startDate, endDate, travelers: 1, budget: String(input.budget), currency: "USD", preferences: input.intent, visibility: "private" });
  const tripId = Number(result[0].insertId);
  await db.insert(tripStops).values(selectedDestinations.map((city, position) => ({ tripId, destinationId: city.id, city: city.city, country: city.country, latitude: city.latitude, longitude: city.longitude, position })));
  const stopRows = await db.select().from(tripStops).where(eq(tripStops.tripId, tripId)).orderBy(asc(tripStops.position));
  const activityById = new Map(selectedDestinations.flatMap(city => city.activities.map(activity => [activity.id, activity] as const)));
  const stopByDestinationId = new Map(stopRows.map((stop: any) => [stop.destinationId, stop.id]));
  let previousCity: string | undefined;
  const slotsByDay = new Map<number, number>();
  await db.insert(itineraryItems).values(input.schedule.map((entry, position) => {
    const activity = activityById.get(entry.activityId)!;
    const city = selectedDestinations.find(destination => destination.id === entry.destinationId)?.city ?? "your destination";
    const slotIndex = slotsByDay.get(entry.day) ?? 0;
    slotsByDay.set(entry.day, slotIndex + 1);
    const detail = groundedItineraryDetail({ day: entry.day, city, category: activity.category, durationMinutes: activity.durationMinutes, previousCity, slotIndex });
    previousCity = city;
    const itineraryDate = new Date(startDate);
    itineraryDate.setDate(startDate.getDate() + entry.day - 1);
    return { tripId, stopId: stopByDestinationId.get(entry.destinationId), itineraryDate, startTime: detail.startTime, type: "activity" as const, title: activity.title, notes: [activity.description, detail.transferNote, detail.practicalNote, detail.readinessNote].filter(Boolean).join(" "), estimatedCost: activity.estimatedCost, position };
  }));
  return tripId;
}
