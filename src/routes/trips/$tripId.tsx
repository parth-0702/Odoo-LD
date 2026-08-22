import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RequireAuth } from "@/components/app/RequireAuth";
import { BudgetBars, BudgetPie } from "@/components/trip/BudgetCharts";
import { CalendarView } from "@/components/trip/CalendarView";
import { activitiesForCity, activityById, cities, cityById } from "@/lib/data";
import { useStore } from "@/lib/store";
import {
  activityCostTotal,
  dateRange,
  durationLabel,
  inr,
  tripStatus,
  tripTotalCost,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export const Route = createFileRoute("/trips/$tripId")({
  head: () => ({ meta: [{ title: "Trip — GlobeTrotter" }] }),
  component: TripDetailPage,
});

function TripDetailPage() {
  return (
    <RequireAuth>
      <TripDetail />
    </RequireAuth>
  );
}

type Tab = "itinerary" | "calendar" | "budget";

function TripDetail() {
  const { tripId } = useParams({ from: "/trips/$tripId" });
  const {
    tripById,
    updateTrip,
    addStop,
    removeStop,
    moveStop,
    addActivity,
    removeActivity,
  } = useStore();
  const [tab, setTab] = useState<Tab>("itinerary");
  const [addCity, setAddCity] = useState("");
  const [addNights, setAddNights] = useState(3);

  const trip = tripById(tripId);

  if (!trip) {
    return (
      <div className="panel mx-auto max-w-md p-10 text-center">
        <h1 className="font-display text-3xl">Trip not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This trip may have been deleted or never existed.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link to="/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const total = tripTotalCost(trip);
  const over = total > trip.plannedBudget && trip.plannedBudget > 0;
  const status = tripStatus(trip);

  const handleAddStop = () => {
    if (!addCity) return;
    addStop(trip.id, addCity, Math.max(1, Number(addNights) || 1));
    setAddCity("");
  };

  const togglePublic = () => updateTrip(trip.id, { isPublic: !trip.isPublic });

  const tabs: { id: Tab; label: string; icon: typeof Pencil }[] = [
    { id: "itinerary", label: "Itinerary", icon: Pencil },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "budget", label: "Budget", icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All trips
      </Link>

      <header className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
        <div className="relative aspect-[16/7]">
          <img src={trip.coverImage} alt={trip.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6">
            <div className="min-w-0">
              <h1 className="font-display text-4xl text-white sm:text-5xl">{trip.name}</h1>
              <p className="mt-2 text-sm text-white/85">
                {dateRange(trip.startDate, trip.endDate)} · {trip.stops.length} cities ·{" "}
                {trip.stops.reduce((s, st) => s + st.days.length, 0)} days
              </p>
            </div>
            <Badge className="rounded-full bg-card text-foreground hover:bg-card">{status}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-xl text-sm text-muted-foreground">{trip.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={togglePublic}>
              <Share2 className="size-3.5" /> {trip.isPublic ? "Public" : "Make public"}
            </Button>
            {trip.isPublic && (
              <Button asChild size="sm" className="rounded-full" variant="outline">
                <Link to="/share/$tripId" params={{ tripId: trip.id }}>
                  View share page
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
            <p className="font-display text-3xl">{inr(total)}</p>
          </div>
          <div className="min-w-64 flex-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">of {inr(trip.plannedBudget)} planned</span>
              <span className={cn("font-semibold", over && "text-destructive")}>
                {trip.plannedBudget === 0
                  ? "No budget set"
                  : over
                    ? `${inr(total - trip.plannedBudget)} over`
                    : `${inr(trip.plannedBudget - total)} left`}
              </span>
            </div>
            <Progress
              value={trip.plannedBudget ? Math.min(100, (total / trip.plannedBudget) * 100) : 0}
              className="mt-2 h-2"
            />
          </div>
        </div>
      </section>

      <nav className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === "itinerary" && (
        <ItineraryEditor
          trip={trip}
          onAddStop={handleAddStop}
          onRemoveStop={(stopId) => removeStop(trip.id, stopId)}
          onMoveStop={(stopId, dir) => moveStop(trip.id, stopId, dir)}
          onAddActivity={(dayId, activityId) => addActivity(trip.id, dayId, activityId)}
          onRemoveActivity={(dayId, itemId) => removeActivity(trip.id, dayId, itemId)}
          addCity={addCity}
          setAddCity={setAddCity}
          addNights={addNights}
          setAddNights={setAddNights}
        />
      )}

      {tab === "calendar" && (
        <section className="panel p-5 sm:p-7">
          <h2 className="font-display text-2xl">Trip calendar</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Every planned day, mapped to its city and cost.
          </p>
          <CalendarView trip={trip} />
        </section>
      )}

      {tab === "budget" && <BudgetTab trip={trip} />}
    </div>
  );
}

interface EditorProps {
  trip: Trip;
  onAddStop: () => void;
  onRemoveStop: (stopId: string) => void;
  onMoveStop: (stopId: string, dir: -1 | 1) => void;
  onAddActivity: (dayId: string, activityId: string) => void;
  onRemoveActivity: (dayId: string, itemId: string) => void;
  addCity: string;
  setAddCity: (v: string) => void;
  addNights: number;
  setAddNights: (v: number) => void;
}

function ItineraryEditor({
  trip,
  onAddStop,
  onRemoveStop,
  onMoveStop,
  onAddActivity,
  onRemoveActivity,
  addCity,
  setAddCity,
  addNights,
  setAddNights,
}: EditorProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-border p-5">
        <p className="text-sm font-semibold">Add a stop</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="stop-city">
              City
            </label>
            <select
              id="stop-city"
              value={addCity}
              onChange={(e) => setAddCity(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="stop-nights">
              Nights
            </label>
            <input
              id="stop-nights"
              type="number"
              min={1}
              value={addNights}
              onChange={(e) => setAddNights(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <Button className="mt-4 rounded-full px-5" onClick={onAddStop} disabled={!addCity}>
          <Plus className="size-4" /> Add stop
        </Button>
      </div>

      {trip.stops.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No stops yet. Add a city above to start building the route.
        </p>
      )}

      <div className="space-y-6">
        {trip.stops.map((stop, stopIndex) => {
          const city = cityById(stop.cityId);
          const options = activitiesForCity(stop.cityId);
          return (
            <section key={stop.id} className="panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <div className="min-w-0">
                  <p className="eyebrow">City {String(stopIndex + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 truncate font-display text-2xl">{city?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {city?.country} · {stop.days.length} {stop.days.length === 1 ? "day" : "days"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-full"
                    onClick={() => onMoveStop(stop.id, -1)}
                    disabled={stopIndex === 0}
                    aria-label="Move stop up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-full"
                    onClick={() => onMoveStop(stop.id, 1)}
                    disabled={stopIndex === trip.stops.length - 1}
                    aria-label="Move stop down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => onRemoveStop(stop.id)}
                    aria-label="Remove stop"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {stop.days.map((day, dayIndex) => (
                  <div key={day.id} className="rounded-2xl bg-secondary/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        Day {String(dayIndex + 1).padStart(2, "0")}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          · {day.date}
                        </span>
                      </p>
                      <span className="text-sm font-semibold">
                        {inr(day.activities.reduce((a, b) => a + b.cost, 0))}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {day.activities.length === 0 && (
                        <li className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                          Free day — add an activity below.
                        </li>
                      )}
                      {day.activities.map((item) => {
                        const activity = activityById(item.activityId);
                        if (!activity) return null;
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl bg-card p-3"
                          >
                            <span className="w-12 shrink-0 font-display text-sm">{item.time}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{activity.name}</p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {durationLabel(activity.durationMins)} · {activity.category}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold">
                              {item.cost === 0 ? "Free" : inr(item.cost)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveActivity(day.id, item.id)}
                              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Remove activity"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {options.length > 0 && (
                      <AddActivityRow
                        options={options}
                        onAdd={(activityId) => onAddActivity(day.id, activityId)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AddActivityRow({
  options,
  onAdd,
}: {
  options: ReturnType<typeof activitiesForCity>;
  onAdd: (activityId: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 flex-1 rounded-full border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Add an activity in this city…</option>
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} · {a.cost === 0 ? "Free" : inr(a.cost)}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        className="rounded-full px-4"
        disabled={!value}
        onClick={() => {
          if (value) onAdd(value);
          setValue("");
        }}
      >
        <Plus className="size-3.5" /> Add
      </Button>
    </div>
  );
}

function BudgetTab({ trip }: { trip: Trip }) {
  const total = tripTotalCost(trip);
  const activityTotal = activityCostTotal(trip);
  const e = trip.expenses;
  const categories = [
    { name: "Transport", value: e.transport },
    { name: "Accommodation", value: e.accommodation },
    { name: "Activities", value: activityTotal },
    { name: "Meals", value: e.meals },
    { name: "Other", value: e.other },
  ];
  const over = total > trip.plannedBudget && trip.plannedBudget > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="panel p-5 sm:p-7">
        <h2 className="font-display text-2xl">Breakdown</h2>
        <div className="mt-5 space-y-3">
          {categories.map((c) => {
            const pct = total ? Math.round((c.value / total) * 100) : 0;
            return (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-semibold">{inr(c.value)}</span>
                </div>
                <Progress value={pct} className="mt-1.5 h-1.5" />
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-sm text-muted-foreground">Estimated trip total</span>
          <span className="font-display text-2xl">{inr(total)}</span>
        </div>
        {trip.plannedBudget > 0 && (
          <p
            className={cn(
              "mt-2 text-sm",
              over ? "font-semibold text-destructive" : "text-muted-foreground",
            )}
          >
            {over
              ? `${inr(total - trip.plannedBudget)} over the ${inr(trip.plannedBudget)} plan`
              : `${inr(trip.plannedBudget - total)} left of ${inr(trip.plannedBudget)}`}
          </p>
        )}
      </section>

      <section className="panel p-5 sm:p-7">
        <h2 className="font-display text-2xl">By category</h2>
        <div className="mt-5 grid grid-cols-1 gap-6">
          <BudgetPie trip={trip} />
          <BudgetBars trip={trip} />
        </div>
      </section>
    </div>
  );
}
