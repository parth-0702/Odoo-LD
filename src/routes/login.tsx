import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { images, demoUser } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — GlobeTrotter" },
      { name: "description", content: "Sign in to your GlobeTrotter planning workspace." },
      { property: "og:title", content: "Login — GlobeTrotter" },
      { property: "og:description", content: "Sign in to continue planning your trips." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState("globetrotter");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    login(email.trim());
    toast.success("Welcome back to GlobeTrotter");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-14">
        <Logo />
        <div className="mt-12 max-w-md">
          <h1 className="display-section">Welcome back</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Pick up where you left off — your trips, days and budgets are waiting.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                className="h-11 rounded-xl"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full rounded-full">
              Login
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => toast("Password reset link sent to your email.")}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
            <Link to="/signup" className="font-semibold hover:text-primary">
              Create account
            </Link>
          </div>

          <p className="mt-8 rounded-2xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
            Demo account is pre-filled — sign in as Aarav Mehta to explore three fully
            planned trips.
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img
          src={images.patagonia}
          alt="Mountain peaks reflected in a still lake"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-3xl text-white">
          Plan the journey. Live the story.
        </p>
      </div>
    </div>
  );
}
