import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActivityIcon, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/app/RequireAuth";
import { activities, cities } from "@/lib/data";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — GlobeTrotter" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <RequireAuth>
      <Admin />
    </RequireAuth>
  );
}

function Admin() {
  const { user, trips, saved } = useStore();

  if (user?.role !== "admin") {
    return (
      <div className="panel mx-auto max-w-md p-10 text-center">
        <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">Admins only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You need admin permissions to view this workspace.
        </p>
      </div>
    );
  }

  const publicTrips = trips.filter((t) => t.isPublic).length;

  const metrics = [
    { label: "Users", value: 1, icon: Users },
    { label: "Trips", value: trips.length, icon: Ticket },
    { label: "Destinations", value: cities.length, icon: MapPin },
    { label: "Activities", value: activities.length, icon: ActivityIcon },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="display-section mt-2">Platform overview</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Destination and activity management. Records are database-backed; creation and editing live
          in the connected backend.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="panel flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
              <m.icon className="size-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="font-display text-2xl">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5 sm:p-7">
          <h2 className="font-display text-2xl">Destinations</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {cities.length} destinations across {new Set(cities.map((c) => c.region)).size} regions.
          </p>
          <div className="max-h-80 overflow-y-auto hide-scrollbar space-y-2">
            {cities.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <img src={c.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.country} · {c.region}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full">
                  {c.costIndex}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 sm:p-7">
          <h2 className="font-display text-2xl">Activities</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {activities.length} experiences · avg cost {inr(
              Math.round(activities.reduce((s, a) => s + a.cost, 0) / activities.length),
            )}
            .
          </p>
          <div className="max-h-80 overflow-y-auto hide-scrollbar space-y-2">
            {activities.slice(0, 40).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.category}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {a.cost === 0 ? "Free" : inr(a.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        {publicTrips} public trip{saved.length === 1 ? "" : "s"} · {saved.length} saved
        destination{saved.length === 1 ? "" : "s"} · demo dataset
      </p>
    </div>
  );
}
