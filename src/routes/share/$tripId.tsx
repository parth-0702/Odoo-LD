import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Copy, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimelineView } from "@/components/trip/TimelineView";
import { useStore } from "@/lib/store";
import { dateRange, inr, tripActivityCount, tripTotalCost } from "@/lib/format";

export const Route = createFileRoute("/share/$tripId")({
  head: () => ({ meta: [{ title: "Shared Trip — GlobeTrotter" }] }),
  component: SharePage,
});

function SharePage() {
  const { tripId } = useParams({ from: "/share/$tripId" });
  const { tripById, isAuthed, copyTrip } = useStore();
  const navigate = useNavigate();

  const trip = tripById(tripId);

  if (!trip) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-10 text-center">
          <h1 className="font-display text-3xl">Trip not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This shared trip may have been removed.
          </p>
          <Button asChild className="mt-6 rounded-full px-5">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const total = tripTotalCost(trip);

  const handleCopy = () => {
    if (!isAuthed) {
      toast("Sign in to copy this trip to your workspace");
      navigate({ to: "/login" });
      return;
    }
    const copy = copyTrip(trip.id);
    if (copy) {
      toast.success("Trip copied to your workspace");
      navigate({ to: "/trips/$tripId", params: { tripId: copy.id } });
    }
  };

  return (
    <Shell>
      <article className="mx-auto max-w-4xl space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
          <div className="relative aspect-[16/7]">
            <img src={trip.coverImage} alt={trip.name} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <Badge className="rounded-full bg-card text-foreground hover:bg-card">
                    Shared trip
                  </Badge>
                  <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">
                    {trip.name}
                  </h1>
                  <p className="mt-2 text-sm text-white/85">
                    {dateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="max-w-xl text-sm text-muted-foreground">{trip.description}</p>
            <Button className="rounded-full px-6 btn-tactile" onClick={handleCopy}>
              <Copy className="size-4" /> {isAuthed ? "Copy to my trips" : "Sign in to copy"}
            </Button>
          </div>
        </header>

        <section className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {trip.stops.length} cities
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4" /> {tripActivityCount(trip)} activities
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />{" "}
            {trip.stops.reduce((s, st) => s + st.days.length, 0)} days
          </span>
          <span className="font-semibold text-foreground">Estimated {inr(total)}</span>
        </section>

        <section>
          <h2 className="font-display text-3xl">The itinerary</h2>
          <div className="mt-6">
            <TimelineView trip={trip} />
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          Planning your own?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Create a free account
          </Link>
          .
        </p>
      </article>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo to="/" />
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/signup">Start planning</Link>
          </Button>
        </div>
      </header>
      <main className="px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
