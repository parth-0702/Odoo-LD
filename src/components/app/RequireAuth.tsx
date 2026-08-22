import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your trips…
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="font-display text-3xl">Sign in to keep planning</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your trips, budgets and saved destinations live behind a quick login.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-full px-5">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
