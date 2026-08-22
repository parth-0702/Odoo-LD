import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { label: "Explore", to: "/explore/cities" },
  { label: "Destinations", to: "/explore/cities" },
  { label: "Experiences", to: "/explore/activities" },
  { label: "How It Works", to: "/", hash: "how-it-works" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthed } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border/70 bg-card/85 backdrop-blur-md transition-all duration-300",
          scrolled ? "px-4 py-2 shadow-soft sm:px-5" : "px-4 py-3 sm:px-6",
        )}
      >
        <Logo />

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={"hash" in link ? link.hash : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/signup">Plan a Trip</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-full border border-border md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-card p-4 shadow-lift md:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to={isAuthed ? "/dashboard" : "/login"}>
                {isAuthed ? "Dashboard" : "Login"}
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to={isAuthed ? "/trips/create" : "/signup"}>Plan a Trip</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
