import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CityCard } from "@/components/cards/CityCard";
import { RequireAuth } from "@/components/app/RequireAuth";
import { cities } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { City, CostIndex } from "@/lib/types";

interface Search {
  q?: string;
  cost?: CostIndex | "All";
  region?: string;
}

export const Route = createFileRoute("/explore/cities")({
  head: () => ({ meta: [{ title: "Explore Cities — GlobeTrotter" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cost: (s.cost as Search["cost"]) ?? "All",
    region: typeof s.region === "string" ? s.region : undefined,
  }),
  component: CitiesPage,
});

function CitiesPage() {
  return (
    <RequireAuth>
      <Cities />
    </RequireAuth>
  );
}

const COST_OPTIONS: (CostIndex | "All")[] = ["All", "Low", "Medium", "High"];

function Cities() {
  const { createTrip, addStop } = useStore();
  const navigate = useNavigate();
  const { q, cost, region } = Route.useSearch();

  const [query, setQuery] = useState(q ?? "");
  const [costFilter, setCostFilter] = useState<CostIndex | "All">(cost ?? "All");

  const regions = Array.from(new Set(cities.map((c) => c.region))).sort();

  const filtered = cities.filter((c) => {
    const text = `${c.name} ${c.country} ${c.region}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (costFilter !== "All" && c.costIndex !== costFilter) return false;
    if (region && c.region !== region) return false;
    return true;
  });

  const planFromCity = (city: City) => {
    const trip = createTrip({
      name: `${city.name} Escape`,
      description: `A journey built around ${city.name}, ${city.country}.`,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      coverImage: city.image,
      plannedBudget: city.avgDailyCost * 5,
    });
    addStop(trip.id, city.id, 3);
    toast.success(`Started a trip in ${city.name}`);
    navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Discovery</p>
        <h1 className="display-section mt-2">Explore cities</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Browse real destinations, filter by cost and region, then drop a city straight into a new
          trip.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities or countries…"
            className="h-11 rounded-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {COST_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setCostFilter(opt)}
              className={
                "rounded-full border px-4 py-2 text-sm transition-colors " +
                (costFilter === opt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {opt === "All" ? "All costs" : `${opt} cost`}
            </button>
          ))}
        </div>
      </div>

      {region && (
        <p className="text-sm text-muted-foreground">
          Filtered to <span className="font-semibold text-foreground">{region}</span>.{" "}
          <button className="underline" onClick={() => navigate({ to: "/explore/cities" })}>
            Clear
          </button>
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 p-12 text-center">
          <Compass className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No cities match your filters. Try widening the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((city) => (
            <CityCard key={city.id} city={city} onAdd={planFromCity} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Showing {filtered.length} of {cities.length} destinations · {regions.length} regions
      </p>
    </div>
  );
}
