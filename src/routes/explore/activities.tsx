import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FerrisWheel, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { RequireAuth } from "@/components/app/RequireAuth";
import { activities } from "@/lib/data";
import type { ActivityCategory } from "@/lib/types";

export const Route = createFileRoute("/explore/activities")({
  head: () => ({ meta: [{ title: "Explore Activities — GlobeTrotter" }] }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  return (
    <RequireAuth>
      <Activities />
    </RequireAuth>
  );
}

const CATEGORIES: (ActivityCategory | "All")[] = [
  "All",
  "Sightseeing",
  "Food",
  "Adventure",
  "Culture",
  "Nature",
  "Nightlife",
  "Shopping",
  "Wellness",
];

function Activities() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActivityCategory | "All">("All");
  const [maxCost, setMaxCost] = useState(20000);
  const [maxDuration, setMaxDuration] = useState(600);

  const filtered = activities.filter((a) => {
    if (query) {
      const text = `${a.name} ${a.description}`.toLowerCase();
      if (!text.includes(query.toLowerCase())) return false;
    }
    if (category !== "All" && a.category !== category) return false;
    if (a.cost > maxCost) return false;
    if (a.durationMins > maxDuration) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Discovery</p>
        <h1 className="display-section mt-2">Explore activities</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Filter experiences by category, cost and duration across every destination.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences…"
            className="h-11 rounded-full pl-9"
          />
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors " +
                (category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max cost</span>
              <span className="font-semibold">₹{maxCost.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20000}
              step={500}
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max duration</span>
              <span className="font-semibold">
                {maxDuration >= 600 ? "Any" : `${Math.floor(maxDuration / 60)}h+`}
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={600}
              step={30}
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 p-12 text-center">
          <FerrisWheel className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No activities match these filters. Loosen a slider to see more.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
