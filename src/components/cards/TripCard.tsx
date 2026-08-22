import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  dateRange,
  inr,
  tripActivityCount,
  tripStatus,
  tripTotalCost,
} from "@/lib/format";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TripCard({
  trip,
  variant = "large",
  actions,
}: {
  trip: Trip;
  variant?: "large" | "compact";
  actions?: React.ReactNode;
}) {
  const total = tripTotalCost(trip);
  const pct = trip.plannedBudget
    ? Math.min(140, Math.round((total / trip.plannedBudget) * 100))
    : 0;
  const over = total > trip.plannedBudget && trip.plannedBudget > 0;
  const status = tripStatus(trip);

  if (variant === "compact") {
    return (
      <Link
        to="/trips/$tripId"
        params={{ tripId: trip.id }}
        className="panel image-zoom flex items-center gap-4 overflow-hidden p-3 transition-shadow hover:shadow-lift"
      >
        <img
          src={trip.coverImage}
          alt={trip.name}
          loading="lazy"
          className="size-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{trip.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {dateRange(trip.startDate, trip.endDate)} · {trip.stops.length} cities
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold">{inr(total)}</span>
      </Link>
    );
  }

  return (
    <article className="panel overflow-hidden transition-shadow hover:shadow-lift">
      <Link
        to="/trips/$tripId"
        params={{ tripId: trip.id }}
        className="image-zoom relative block aspect-[16/9]"
      >
        <img
          src={trip.coverImage}
          alt={trip.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl text-white">{trip.name}</h3>
            <p className="text-xs text-white/80">{dateRange(trip.startDate, trip.endDate)}</p>
          </div>
          <Badge className="shrink-0 rounded-full bg-card text-foreground hover:bg-card">
            {status}
          </Badge>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {trip.stops.length} cities
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> {tripActivityCount(trip)} activities
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {trip.stops.reduce((s, st) => s + st.days.length, 0)} days
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Estimated</span>
            <span className="font-semibold">{inr(total)}</span>
          </div>
          <Progress value={Math.min(100, pct)} className="mt-2 h-1.5" />
          <p
            className={cn(
              "mt-2 text-xs",
              over ? "font-semibold text-destructive" : "text-muted-foreground",
            )}
          >
            {trip.plannedBudget === 0
              ? "No budget set yet"
              : over
                ? `${inr(total - trip.plannedBudget)} over the ${inr(trip.plannedBudget)} plan`
                : `${inr(trip.plannedBudget - total)} left of ${inr(trip.plannedBudget)}`}
          </p>
        </div>

        {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>
  );
}
