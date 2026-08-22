import { Clock, MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cityById } from "@/lib/data";
import { durationLabel, inr } from "@/lib/format";
import type { Activity } from "@/lib/types";

export function ActivityCard({
  activity,
  onAdd,
  actionLabel = "Add to Day",
}: {
  activity: Activity;
  onAdd?: (activity: Activity) => void;
  actionLabel?: string;
}) {
  const city = cityById(activity.cityId);

  return (
    <article className="panel image-zoom card-lift flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9]">
        <img
          src={activity.image}
          alt={activity.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <Badge className="absolute left-3 top-3 rounded-full bg-card text-foreground hover:bg-card">
          {activity.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight">{activity.name}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {city?.name}, {city?.country}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {activity.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" /> {durationLabel(activity.durationMins)}
          </span>
          <span className="font-semibold">{activity.cost === 0 ? "Free" : inr(activity.cost)}</span>
        </div>
        {onAdd && (
          <Button
            variant="outline"
            className="mt-4 w-full rounded-full"
            onClick={() => onAdd(activity)}
          >
            <Plus className="size-4" /> {actionLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
