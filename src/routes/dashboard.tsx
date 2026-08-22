import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Compass, Map, Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CityCard } from "@/components/cards/CityCard";
import { TripCard } from "@/components/cards/TripCard";
import { RequireAuth } from "@/components/app/RequireAuth";
import { cities, cityById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { inr, tripDayCount, tripTotalCost } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — GlobeTrotter" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const { user, trips, saved } = useStore();

  const myTrips = trips;
  const totalDays = myTrips.reduce((sum, t) => sum + tripDayCount(t), 0);
  const totalBudget = myTrips.reduce((sum, t) => sum + t.plannedBudget, 0);
  const totalSpent = myTrips.reduce((sum, t) => sum + tripTotalCost(t), 0);
  const savedCities = saved.map((id) => cityById(id)).filter(Boolean);

  const recent = myTrips.slice(0, 3);
  const suggested = cities
    .filter((c) => !saved.includes(c.id))
    .slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your travel desk</p>
          <h1 className="display-section mt-2">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pick up where you left off — plan new cities, shape day-by-day itineraries and keep an
            eye on the budget.
          </p>
        </div>
        <Button asChild className="btn-tactile rounded-full px-6">
          <Link to="/trips/create">
            <Plus className="size-4" /> New Trip
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Map} label="Trips planned" value={String(myTrips.length)} />
        <Stat icon={Compass} label="Days on the road" value={String(totalDays)} />
        <Stat icon={Wallet} label="Planned budget" value={inr(totalBudget)} />
        <Stat icon={Bookmark} label="Saved places" value={String(savedCities.length)} />
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Your recent trips</h2>
          <Link
            to="/trips"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            All trips <ArrowRight className="size-4" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyTrips />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-3xl">Saved destinations</h2>
        {savedCities.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No saved destinations yet. Tap the bookmark on any city to keep it here.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {savedCities.map((city) => (
              <CityCard key={city!.id} city={city!} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-3xl">Where to next?</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {suggested.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Map;
  label: string;
  value: string;
}) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyTrips() {
  return (
    <div className="panel mt-6 flex flex-col items-center gap-4 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        You haven't planned a trip yet. Start with a destination or a blank slate.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full px-5">
          <Link to="/trips/create">Plan a trip</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link to="/explore/cities">Explore cities</Link>
        </Button>
      </div>
    </div>
  );
}
