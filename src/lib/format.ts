import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Trip, TripStatus } from "./types";

export const inr = (value: number) =>
  "₹" + Math.round(value).toLocaleString("en-IN");

export const shortDate = (iso: string) => format(parseISO(iso), "d MMM");
export const longDate = (iso: string) => format(parseISO(iso), "d MMMM yyyy");
export const weekday = (iso: string) => format(parseISO(iso), "EEEE");

export const dateRange = (start: string, end: string) =>
  `${format(parseISO(start), "d MMM")} — ${format(parseISO(end), "d MMM yyyy")}`;

export const tripNights = (trip: Trip) =>
  Math.max(1, differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)));

export const tripStatus = (trip: Trip, today = new Date()): TripStatus => {
  const start = parseISO(trip.startDate);
  const end = parseISO(trip.endDate);
  if (end < today) return "Completed";
  if (start <= today && end >= today) return "Ongoing";
  return "Upcoming";
};

export const activityCostTotal = (trip: Trip) =>
  trip.stops.reduce(
    (sum, stop) =>
      sum +
      stop.days.reduce(
        (daySum, day) => daySum + day.activities.reduce((a, b) => a + b.cost, 0),
        0,
      ),
    0,
  );

export const tripTotalCost = (trip: Trip) => {
  const e = trip.expenses;
  return e.transport + e.accommodation + e.meals + e.other + activityCostTotal(trip);
};

export const tripDayCount = (trip: Trip) =>
  trip.stops.reduce((sum, s) => sum + s.days.length, 0);

export const tripActivityCount = (trip: Trip) =>
  trip.stops.reduce(
    (sum, s) => sum + s.days.reduce((d, day) => d + day.activities.length, 0),
    0,
  );

export const durationLabel = (mins: number) =>
  mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`
    : `${mins}m`;
