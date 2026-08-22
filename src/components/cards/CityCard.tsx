import { Bookmark, BookmarkCheck, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { City } from "@/lib/types";

export function CityCard({
  city,
  onAdd,
}: {
  city: City;
  onAdd?: (city: City) => void;
}) {
  const { isSaved, toggleSaved } = useStore();
  const saved = isSaved(city.id);

  return (
    <article className="panel image-zoom flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10]">
        <img
          src={city.image}
          alt={`${city.name}, ${city.country}`}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save destination"}
          onClick={() => toggleSaved(city.id)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft"
        >
          {saved ? (
            <BookmarkCheck className="size-4 text-primary" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl">{city.name}</h3>
            <p className="text-sm text-muted-foreground">
              {city.country} · {city.region}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 rounded-full">
            {city.costIndex}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {city.description}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Popularity</dt>
            <dd className="font-semibold">{city.popularity}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Avg / day</dt>
            <dd className="font-semibold">{inr(city.avgDailyCost)}</dd>
          </div>
        </dl>
        {onAdd && (
          <Button
            className="mt-5 w-full rounded-full"
            onClick={() => onAdd(city)}
            variant="outline"
          >
            <Plus className="size-4" /> Add to Trip
          </Button>
        )}
      </div>
    </article>
  );
}
