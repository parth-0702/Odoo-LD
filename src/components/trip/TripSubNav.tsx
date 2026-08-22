import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function TripSubNav({ tripId }: { tripId: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { label: "Itinerary", to: "/trips/$tripId" as const },
    { label: "Builder", to: "/trips/$tripId/builder" as const },
    { label: "Calendar", to: "/trips/$tripId/calendar" as const },
    { label: "Budget", to: "/trips/$tripId/budget" as const },
  ];

  return (
    <nav className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {items.map((item) => {
        const href = item.to.replace("$tripId", tripId);
        const active = pathname === href;
        return (
          <Link
            key={item.label}
            to={item.to}
            params={{ tripId }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
