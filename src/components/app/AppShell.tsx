import { useEffect, useRef, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  FerrisWheel,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", to: "/trips", icon: Map },
  { label: "Cities", to: "/explore/cities", icon: Compass },
  { label: "Experiences", to: "/explore/activities", icon: FerrisWheel },
  { label: "Profile", to: "/profile", icon: UserIcon },
  { label: "Admin", to: "/admin", icon: ShieldCheck },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mainRef = useRef<HTMLElement>(null);

  // Subtle page entrance on route change
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6">
          <Logo to="/dashboard" />
          <nav className="hide-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
            {nav.map((item) => {
              const active =
                pathname === item.to ||
                (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={1.7} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" className="rounded-full px-4">
              <Link to="/trips/create">+ New Trip</Link>
            </Button>
            <button
              type="button"
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate({ to: "/", replace: true });
              }}
              className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <main ref={mainRef} className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
        Signed in as {user?.name ?? "guest"} · GlobeTrotter planning workspace
      </footer>
    </div>
  );
}
