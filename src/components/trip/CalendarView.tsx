import { format, parseISO } from "date-fns";

import { activityById, cityById } from "@/lib/data";
import { inr } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Cell {
  date: string;
  cityName: string;
  count: number;
  cost: number;
}

export function CalendarView({ trip }: { trip: Trip }) {
  const cells: Cell[] = trip.stops.flatMap((stop) => {
    const city = cityById(stop.cityId);
    return stop.days.map((day) => ({
      date: day.date,
      cityName: city?.name ?? "",
      count: day.activities.length,
      cost: day.activities.reduce((a, b) => a + b.cost, 0),
    }));
  });

  if (cells.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Add cities to the trip to see the calendar fill up.
      </p>
    );
  }

  const first = parseISO(cells[0]!.date);
  const leadingBlanks = (first.getDay() + 6) % 7; // Monday-first grid

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 text-center text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} className="rounded-2xl bg-secondary/40" />
        ))}
        {cells.map((cell, i) => (
          <div
            key={cell.date + i}
            className={cn(
              "min-h-24 rounded-2xl border border-border bg-card p-2.5 sm:min-h-28",
              cell.count === 0 && "bg-secondary/50",
            )}
          >
            <p className="text-xs font-semibold">{format(parseISO(cell.date), "d MMM")}</p>
            <p className="truncate text-[0.68rem] text-muted-foreground">
              {cell.cityName}
            </p>
            <p className="mt-2 text-[0.68rem] text-muted-foreground">
              {cell.count} {cell.count === 1 ? "activity" : "activities"}
            </p>
            <p className="text-xs font-semibold">{inr(cell.cost)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayListView({ trip }: { trip: Trip }) {
  return (
    <ul className="space-y-3">
      {trip.stops.flatMap((stop) =>
        stop.days.map((day) => (
          <li key={day.id} className="panel p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">
                {format(parseISO(day.date), "EEE d MMM")} · {cityById(stop.cityId)?.name}
              </p>
              <span className="text-sm font-semibold">
                {inr(day.activities.reduce((a, b) => a + b.cost, 0))}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {day.activities.length === 0
                ? "Free day"
                : day.activities
                    .map((a) => `${a.time} ${activityById(a.activityId)?.name}`)
                    .join(" · ")}
            </p>
          </li>
        )),
      )}
    </ul>
  );
}
