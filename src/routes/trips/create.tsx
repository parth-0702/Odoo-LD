import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/app/RequireAuth";
import { cities, images } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trips/create")({
  head: () => ({ meta: [{ title: "New Trip — GlobeTrotter" }] }),
  component: CreateTripPage,
});

const coverOptions = [
  images.paris,
  images.tokyo,
  images.iceland,
  images.bali,
  images.alps,
  images.dubai,
  images.patagonia,
  images.himalaya,
];

function CreateTripPage() {
  return (
    <RequireAuth>
      <CreateTrip />
    </RequireAuth>
  );
}

function CreateTrip() {
  const { createTrip, addStop } = useStore();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [budget, setBudget] = useState(50000);
  const [coverImage, setCoverImage] = useState(coverOptions[0]);
  const [cityId, setCityId] = useState("");
  const [nights, setNights] = useState(3);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Give your trip a name.");
    if (endDate < startDate) return setError("End date can't be before the start date.");

    const trip = createTrip({
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      coverImage,
      plannedBudget: Number(budget) || 0,
    });

    if (cityId) {
      addStop(trip.id, cityId, Math.max(1, Number(nights) || 1));
    }

    toast.success("Trip created — start adding days and activities");
    navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/trips"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to trips
      </Link>

      <h1 className="display-section">Plan a new trip</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Set the basics now — you can add cities, days and activities afterwards.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Trip name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="European Summer Escape"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            placeholder="A relaxed two weeks across France and Switzerland."
            className="rounded-xl"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start">Start date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End date</Label>
            <Input
              id="end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Working budget (₹)</Label>
          <Input
            id="budget"
            type="number"
            min={0}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Cover image</Label>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {coverOptions.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setCoverImage(src)}
                className={cn(
                  "aspect-square overflow-hidden rounded-xl border-2 transition",
                  coverImage === src ? "border-primary" : "border-transparent opacity-80",
                )}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border p-5">
          <p className="text-sm font-semibold">Start with a city (optional)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a first stop and number of nights — you can add more later.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— No city yet —</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nights">Nights</Label>
              <Input
                id="nights"
                type="number"
                min={1}
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="btn-tactile h-11 rounded-full px-7">
            <Plus className="size-4" /> Create trip
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-7">
            <Link to="/trips">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
