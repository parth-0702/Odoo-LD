import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { images } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — GlobeTrotter" },
      {
        name: "description",
        content: "Create a free GlobeTrotter account and start planning multi-city trips.",
      },
      { property: "og:title", content: "Create your account — GlobeTrotter" },
      {
        property: "og:description",
        content: "Free to start. Build multi-city itineraries with real budgets.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setError("");
    signup(form.name.trim(), form.email.trim());
    toast.success("Account created — let's plan something");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden lg:block">
        <img
          src={images.iceland}
          alt="Waterfall over a black sand beach in Iceland"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-3xl text-white">
          Your world. Your route. Your story.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-14">
        <Logo />
        <div className="mt-12 max-w-md">
          <h1 className="display-section">Create your account</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Free to start. Plan as many trips as you like.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={set("name")}
                maxLength={80}
                placeholder="Aarav Mehta"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                maxLength={255}
                placeholder="you@example.com"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  maxLength={72}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  maxLength={72}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full rounded-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
