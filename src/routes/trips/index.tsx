import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Map, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/cards/TripCard";
import { RequireAuth } from "@/components/app/RequireAuth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/trips/")({
  head: () => ({ meta: [{ title: "My Trips — GlobeTrotter" }] }),
  component: TripsPage,
});

function TripsPage() {
  return (
    <RequireAuth>
      <Trips />
    </RequireAuth>
  );
}

function Trips() {
  const { trips, copyTrip, deleteTrip } = useStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="display-section mt-2">My trips</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Every journey you've started, copied or sketched. Open one to keep shaping the plan.
          </p>
        </div>
        <Button asChild className="btn-tactile rounded-full px-6">
          <Link to="/trips/create">
            <Plus className="size-4" /> New Trip
          </Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="panel flex flex-col items-center gap-4 p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Map className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">No trips yet — start your first journey.</p>
          <Button asChild className="rounded-full px-5">
            <Link to="/trips/create">Plan a trip</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      const copy = copyTrip(trip.id);
                      if (copy) {
                        toast.success("Trip copied to your workspace");
                        navigate({ to: "/trips/$tripId", params: { tripId: copy.id } });
                      }
                    }}
                  >
                    <Copy className="size-3.5" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      deleteTrip(trip.id);
                      toast.success("Trip deleted");
                    }}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
