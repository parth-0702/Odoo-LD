import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityCard } from "@/components/cards/CityCard";
import { RequireAuth } from "@/components/app/RequireAuth";
import { cityById } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — GlobeTrotter" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}

const STYLE_OPTIONS = [
  "Slow travel",
  "Mountains",
  "Food-led",
  "City breaks",
  "Beaches",
  "Adventure",
  "Culture",
  "Budget",
];

function Profile() {
  const { user, updateUser, saved, logout } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [language, setLanguage] = useState(user?.language ?? "English (India)");
  const [styles, setStyles] = useState<string[]>(user?.travelStyle ?? []);

  if (!user) return null;

  const savedCities = saved.map((id) => cityById(id)).filter(Boolean);

  const toggleStyle = (style: string) =>
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );

  const save = () => {
    updateUser({ name: name.trim() || user.name, language, travelStyle: styles });
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="display-section mt-2">Your profile</h1>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <UserIcon className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lang">Language</Label>
            <select
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>English (India)</option>
              <option>English (UK)</option>
              <option>English (US)</option>
              <option>हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Travel style</Label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
                    (styles.includes(style)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground")
                  }
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="rounded-full px-5" onClick={save}>
              Save changes
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              onClick={() => {
                logout();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-2">
            <Bookmark className="size-4 text-primary" />
            <h2 className="font-display text-2xl">Saved destinations</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {savedCities.length} place{savedCities.length === 1 ? "" : "s"} saved.
          </p>
          {savedCities.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nothing saved yet. Bookmark a city while exploring to keep it here.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {savedCities.map((city) => (
                <CityCard key={city!.id} city={city!} />
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Want to plan something new?{" "}
        <Link to="/trips/create" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Start a trip
        </Link>
        .
      </p>
    </div>
  );
}
