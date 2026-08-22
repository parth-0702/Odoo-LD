import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

import {
  activityById,
  buildDays,
  cityById,
  demoUser,
  savedSeed,
  seedTrips,
  uid,
} from "./data";
import type { Trip, TripStop, User } from "./types";

const KEY = "globetrotter:state:v1";

interface Persisted {
  user: User | null;
  trips: Trip[];
  saved: string[];
}

interface StoreValue extends Persisted {
  isAuthed: boolean;
  hydrated: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  tripById: (id: string) => Trip | undefined;
  createTrip: (input: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    coverImage: string;
    plannedBudget: number;
  }) => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  copyTrip: (id: string) => Trip | undefined;
  addStop: (tripId: string, cityId: string, nights: number) => void;
  removeStop: (tripId: string, stopId: string) => void;
  moveStop: (tripId: string, stopId: string, direction: -1 | 1) => void;
  addActivity: (tripId: string, dayId: string, activityId: string, time?: string) => void;
  removeActivity: (tripId: string, dayId: string, itemId: string) => void;
  moveActivity: (tripId: string, dayId: string, itemId: string, direction: -1 | 1) => void;
  toggleSaved: (cityId: string) => void;
  isSaved: (cityId: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

const initial = (): Persisted => ({
  user: null,
  trips: seedTrips(),
  saved: savedSeed,
});

const resequence = (trip: Trip): Trip => {
  let cursor = parseISO(trip.startDate);
  const stops = trip.stops.map((stop) => {
    const nights = Math.max(1, stop.days.length);
    const start = format(cursor, "yyyy-MM-dd");
    const days = stop.days.map((day, i) => ({
      ...day,
      date: format(addDays(cursor, i), "yyyy-MM-dd"),
    }));
    cursor = addDays(cursor, nights);
    return {
      ...stop,
      startDate: start,
      endDate: format(addDays(parseISO(start), nights - 1), "yyyy-MM-dd"),
      days,
    };
  });
  const lastDay = stops.at(-1)?.endDate;
  return {
    ...trip,
    stops,
    endDate: lastDay && lastDay > trip.endDate ? lastDay : trip.endDate,
  };
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial(), ...(JSON.parse(raw) as Persisted) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const patchTrip = useCallback((id: string, fn: (trip: Trip) => Trip) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === id ? resequence(fn(t)) : t)),
    }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    return {
      ...state,
      hydrated,
      isAuthed: Boolean(state.user),
      login: (email) =>
        setState((prev) => ({ ...prev, user: { ...demoUser, email } })),
      signup: (name, email) =>
        setState((prev) => ({
          ...prev,
          user: { ...demoUser, id: uid("u"), name, email, role: "admin" },
        })),
      logout: () => setState((prev) => ({ ...prev, user: null })),
      updateUser: (patch) =>
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...patch } : prev.user,
        })),
      tripById: (id) => state.trips.find((t) => t.id === id),
      createTrip: (input) => {
        const trip: Trip = {
          id: uid("trip"),
          userId: state.user?.id ?? demoUser.id,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          coverImage: input.coverImage,
          plannedBudget: input.plannedBudget,
          isPublic: false,
          stops: [],
          expenses: { transport: 0, accommodation: 0, meals: 0, other: 0 },
          createdAt: format(new Date(), "yyyy-MM-dd"),
        };
        setState((prev) => ({ ...prev, trips: [trip, ...prev.trips] }));
        return trip;
      },
      updateTrip: (id, patch) => patchTrip(id, (trip) => ({ ...trip, ...patch })),
      deleteTrip: (id) =>
        setState((prev) => ({ ...prev, trips: prev.trips.filter((t) => t.id !== id) })),
      copyTrip: (id) => {
        const source = state.trips.find((t) => t.id === id);
        if (!source) return undefined;
        const copy: Trip = {
          ...structuredClone(source),
          id: uid("trip"),
          name: `${source.name} (copy)`,
          isPublic: false,
          userId: state.user?.id ?? demoUser.id,
          createdAt: format(new Date(), "yyyy-MM-dd"),
        };
        setState((prev) => ({ ...prev, trips: [copy, ...prev.trips] }));
        return copy;
      },
      addStop: (tripId, cityId, nights) =>
        patchTrip(tripId, (trip) => {
          const lastEnd = trip.stops.at(-1)?.endDate;
          const start = lastEnd
            ? format(addDays(parseISO(lastEnd), 1), "yyyy-MM-dd")
            : trip.startDate;
          const newStop: TripStop = {
            id: uid("stop"),
            cityId,
            startDate: start,
            endDate: format(addDays(parseISO(start), nights - 1), "yyyy-MM-dd"),
            days: buildDays(start, nights),
          };
          return { ...trip, stops: [...trip.stops, newStop] };
        }),
      removeStop: (tripId, stopId) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          stops: trip.stops.filter((s) => s.id !== stopId),
        })),
      moveStop: (tripId, stopId, direction) =>
        patchTrip(tripId, (trip) => {
          const idx = trip.stops.findIndex((s) => s.id === stopId);
          const target = idx + direction;
          if (idx < 0 || target < 0 || target >= trip.stops.length) return trip;
          const stops = [...trip.stops];
          const [moved] = stops.splice(idx, 1);
          if (moved) stops.splice(target, 0, moved);
          return { ...trip, stops };
        }),
      addActivity: (tripId, dayId, activityId, time) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          stops: trip.stops.map((stop) => ({
            ...stop,
            days: stop.days.map((day) =>
              day.id === dayId
                ? {
                    ...day,
                    activities: [
                      ...day.activities,
                      {
                        id: uid("ia"),
                        activityId,
                        time: time ?? nextSlot(day.activities.length),
                        cost: activityById(activityId)?.cost ?? 0,
                      },
                    ].sort((a, b) => a.time.localeCompare(b.time)),
                  }
                : day,
            ),
          })),
        })),
      removeActivity: (tripId, dayId, itemId) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          stops: trip.stops.map((stop) => ({
            ...stop,
            days: stop.days.map((day) =>
              day.id === dayId
                ? { ...day, activities: day.activities.filter((a) => a.id !== itemId) }
                : day,
            ),
          })),
        })),
      moveActivity: (tripId, dayId, itemId, direction) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          stops: trip.stops.map((stop) => ({
            ...stop,
            days: stop.days.map((day) => {
              if (day.id !== dayId) return day;
              const idx = day.activities.findIndex((a) => a.id === itemId);
              const target = idx + direction;
              if (idx < 0 || target < 0 || target >= day.activities.length) return day;
              const activities = [...day.activities];
              const [moved] = activities.splice(idx, 1);
              if (moved) activities.splice(target, 0, moved);
              return { ...day, activities };
            }),
          })),
        })),
      toggleSaved: (cityId) =>
        setState((prev) => ({
          ...prev,
          saved: prev.saved.includes(cityId)
            ? prev.saved.filter((c) => c !== cityId)
            : [...prev.saved, cityId],
        })),
      isSaved: (cityId) => state.saved.includes(cityId),
    };
  }, [state, patchTrip, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

const nextSlot = (count: number) => {
  const hour = Math.min(21, 9 + count * 3);
  return `${String(hour).padStart(2, "0")}:00`;
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const stopNights = (stop: TripStop) => stop.days.length;
export const nightsBetween = (start: string, end: string) =>
  Math.max(1, differenceInCalendarDays(parseISO(end), parseISO(start)));
export const cityOf = (stop: TripStop) => cityById(stop.cityId);
