import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import type { City } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DestinationCard({
  city,
  className,
  ratio = "aspect-[4/5]",
  size = "md",
}: {
  city: City;
  className?: string;
  ratio?: string;
  size?: "md" | "lg";
}) {
  return (
    <Link
      to="/explore/cities"
      search={{ q: city.name }}
      className={cn("group image-zoom relative block rounded-3xl", ratio, className)}
    >
      <img
        src={city.image}
        alt={`${city.name}, ${city.country}`}
        loading="lazy"
        className="absolute inset-0 size-full rounded-3xl object-cover"
      />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/70">
            {city.country}
          </p>
          <h3
            className={cn(
              "truncate font-display text-white",
              size === "lg" ? "text-4xl" : "text-2xl",
            )}
          >
            {city.name}
          </h3>
          <p className="mt-1 text-xs text-white/75">
            {city.popularity}% popularity · {city.costIndex} cost
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-foreground transition-transform group-hover:-translate-y-0.5">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
