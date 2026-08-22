import { date, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const destinations = mysqlTable("gt_destination", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  region: varchar("region", { length: 80 }).default("Global").notNull(),
  costIndex: int("costIndex").default(3).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  description: text("description"),
  coverImage: varchar("coverImage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("destination_region_cost_idx").on(table.region, table.costIndex)]);

export const activities = mysqlTable("gt_activity", {
  id: int("id").autoincrement().primaryKey(),
  destinationId: int("destinationId").notNull().references(() => destinations.id),
  title: varchar("title", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }).default("0").notNull(),
  durationMinutes: int("durationMinutes"),
}, table => [index("activity_destination_idx").on(table.destinationId)]);

export const trips = mysqlTable("gt_trip", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  travelers: int("travelers").default(1).notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  preferences: text("preferences"),
  visibility: mysqlEnum("visibility", ["private", "friends", "public"]).default("private").notNull(),
  coverImage: varchar("coverImage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("trip_owner_updated_idx").on(table.ownerId, table.updatedAt)]);

export const tripStops = mysqlTable("gt_trip_stop", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull().references(() => trips.id, { onDelete: "cascade" }),
  destinationId: int("destinationId").references(() => destinations.id),
  city: varchar("city", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  arrivalDate: date("arrivalDate"),
  departureDate: date("departureDate"),
  position: int("position").default(0).notNull(),
}, table => [index("trip_stop_trip_position_idx").on(table.tripId, table.position)]);

export const itineraryItems = mysqlTable("gt_itinerary_item", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull().references(() => trips.id, { onDelete: "cascade" }),
  stopId: int("stopId").references(() => tripStops.id, { onDelete: "set null" }),
  itineraryDate: date("itineraryDate"),
  startTime: varchar("startTime", { length: 8 }),
  type: mysqlEnum("type", ["activity", "transport", "stay"]).default("activity").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  notes: text("notes"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }).default("0").notNull(),
  position: int("position").default(0).notNull(),
}, table => [index("itinerary_trip_date_position_idx").on(table.tripId, table.itineraryDate, table.position)]);

export const expenses = mysqlTable("gt_expense", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull().references(() => trips.id, { onDelete: "cascade" }),
  category: mysqlEnum("category", ["transport", "stay", "activities", "meals", "misc"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: date("expenseDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("expense_trip_created_idx").on(table.tripId, table.createdAt)]);

export const userPreferences = mysqlTable("gt_user_preference", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  travelStyle: text("travelStyle"),
  budgetStyle: varchar("budgetStyle", { length: 60 }),
  favoriteCategories: text("favoriteCategories"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tripShares = mysqlTable("gt_trip_share", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull().references(() => trips.id, { onDelete: "cascade" }),
  shareCode: varchar("shareCode", { length: 32 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const favorites = mysqlTable("gt_favorite", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  destinationId: int("destinationId").notNull().references(() => destinations.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("favorite_user_destination_unq").on(table.userId, table.destinationId)]);
