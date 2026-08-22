import { Clock, MapPin } from "lucide-react";

import { activityById, cityById } from "@/lib/data";
import { durationLabel, inr, longDate, weekday } from "@/lib/format";
import type { Trip } from "@/lib/types";

export function TimelineView({ trip }: { trip: Trip }) {
  let dayNumber = 0;

  return (
    <div className="space-y-14">
      {trip.stops.map((stop, stopIndex) => {
        const city = cityById(stop.cityId);
        return (
          <section key={stop.id}>
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="eyebrow">City {String(stopIndex + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 truncate font-display text-3xl sm:text-4xl">
                  {city?.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" /> {city?.country} · {stop.days.length}{" "}
                  days
                </p>
              </div>
              <img
                src={city?.image}
                alt={city?.name ?? ""}
                loading="lazy"
                className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
              />
            </header>

            <div className="mt-8 space-y-8">
              {stop.days.map((day) => {
                dayNumber += 1;
                const dayTotal = day.activities.reduce((a, b) => a + b.cost, 0);
                return (
                  <div
                    key={day.id}
                    className="grid gap-5 sm:grid-cols-[190px_minmax(0,1fr)]"
                  >
                    <div className="sm:sticky sm:top-24 sm:self-start">
                      <p className="font-display text-2xl">
                        Day {String(dayNumber).padStart(2, "0")}
                      </p>
                      <p className="text-sm text-muted-foreground">{longDate(day.date)}</p>
                      <p className="text-xs text-muted-foreground">{weekday(day.date)}</p>
                      <p className="mt-2 text-sm font-semibold">{inr(dayTotal)}</p>
                    </div>

                    <ol className="space-y-3">
                      {day.activities.length === 0 && (
                        <li className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                          No activities planned — a free day to wander.
                        </li>
                      )}
                      {day.activities.map((item) => {
                        const activity = activityById(item.activityId);
                        if (!activity) return null;
                        return (
                          <li
                            key={item.id}
                            className="panel flex items-center gap-4 p-4"
                          >
                            <span className="w-14 shrink-0 font-display text-lg">
                              {item.time}
                            </span>
                            <img
                              src={activity.image}
                              alt={activity.name}
                              loading="lazy"
                              className="hidden size-14 shrink-0 rounded-xl object-cover sm:block"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{activity.name}</p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {durationLabel(activity.durationMins)} ·{" "}
                                {activity.category}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold">
                              {item.cost === 0 ? "Free" : inr(item.cost)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
