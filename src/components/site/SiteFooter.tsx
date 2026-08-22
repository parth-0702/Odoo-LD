import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              GlobeTrotter is a planning studio for multi-city journeys — routes, days,
              activities and budgets in one place.
            </p>
          </div>
          <FooterCol
            title="Plan"
            items={[
              { label: "Create a trip", to: "/trips/create" },
              { label: "My trips", to: "/trips" },
              { label: "Cities", to: "/explore/cities" },
              { label: "Experiences", to: "/explore/activities" },
            ]}
          />
          <FooterCol
            title="Account"
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Profile", to: "/profile" },
              { label: "Login", to: "/login" },
              { label: "Sign up", to: "/signup" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "Admin analytics", to: "/admin" },
              { label: "Shared itinerary", to: "/share/european-summer-escape" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GlobeTrotter. Plan the journey. Live the story.</p>
          <p>Made for travellers who like knowing what the day costs.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
