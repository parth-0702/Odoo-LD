// Relational, backend-ready domain models for GlobeTrotter.

export type CostIndex = "Low" | "Medium" | "High";

export type ActivityCategory =
  | "Sightseeing"
  | "Food"
  | "Adventure"
  | "Culture"
  | "Nature"
  | "Nightlife"
  | "Shopping"
  | "Wellness";

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  language: string;
  travelStyle: string[];
  role: "user" | "admin";
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: CostIndex;
  popularity: number; // 0-100
  avgDailyCost: number; // INR
  image: string;
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  cityId: string;
  category: ActivityCategory;
  durationMins: number;
  cost: number; // INR
  image: string;
  description: string;
}

export interface ItineraryActivity {
  id: string;
  activityId: string;
  time: string; // "09:00"
  cost: number;
  note?: string;
}

export interface ItineraryDay {
  id: string;
  date: string; // ISO yyyy-MM-dd
  activities: ItineraryActivity[];
}

export interface TripStop {
  id: string;
  cityId: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
}

export interface TripExpenses {
  transport: number;
  accommodation: number;
  meals: number;
  other: number;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  plannedBudget: number;
  isPublic: boolean;
  stops: TripStop[];
  expenses: TripExpenses;
  createdAt: string;
}

export interface SavedDestination {
  cityId: string;
  savedAt: string;
}

export type TripStatus = "Upcoming" | "Ongoing" | "Completed";
