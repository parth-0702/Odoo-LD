import { Link } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";

export function Logo({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Globe2 className="size-4.5" strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="font-display text-xl tracking-tight">GlobeTrotter</span>
      )}
    </Link>
  );
}
