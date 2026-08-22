import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";

import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { Button } from "@/components/ui/button";
import { activities, cities, images, seedTrips } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GlobeTrotter — Plan the journey. Live the story." },
      {
        name: "description",
        content:
          "Build personalized multi-city trips, discover unforgettable places, manage your budget and share every journey.",
      },
      { property: "og:title", content: "GlobeTrotter — Plan the journey. Live the story." },
      {
        property: "og:description",
        content:
          "Multi-city itineraries, day-by-day activities and budget-aware planning in one editorial workspace.",
      },
    ],
  }),
  component: Landing,
});

const featuredCities = cities.filter((c) =>
  ["tokyo", "paris", "reykjavik", "bali", "swiss-alps", "dubai", "kyoto", "patagonia"].includes(
    c.id,
  ),
);

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "Search cities and experiences by region, cost index and the kind of day you want.",
  },
  {
    n: "02",
    title: "Design",
    body: "Stack cities into a route, assign nights, then fill each day hour by hour.",
  },
  {
    n: "03",
    title: "Balance",
    body: "Every activity carries a cost, so the budget updates as the plan changes.",
  },
  {
    n: "04",
    title: "Share",
    body: "Publish a public itinerary friends can read — or copy into their own account.",
  },
];

function Landing() {
  const sampleTrip = seedTrips()[0]!;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* HERO */}
      <section className="px-4 pt-28 sm:px-8 sm:pt-36">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="eyebrow">Personalized travel planning</p>
            <h1 className="display-hero mt-5">
              Plan the journey.
              <br />
              <em className="italic">Live the story.</em>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Build personalized multi-city trips, discover unforgettable places, manage
              your budget and share every journey with the people who matter.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/signup">
                  Plan Your Trip <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-foreground/15 px-7"
              >
                <Link to="/explore/cities">Explore Destinations</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
              {[
                ["12,000+", "Explorers planning"],
                ["300+", "Cities & regions"],
                ["₹0", "To start planning"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl sm:text-3xl">{value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="image-zoom relative aspect-[4/5] overflow-hidden rounded-[2.5rem]">
              <img
                src={images.hero}
                alt="Coastal road winding along cliffs at golden hour"
                width={1400}
                height={1750}
                className="size-full object-cover"
              />
            </div>
            <span className="float-label absolute -left-2 top-10 sm:-left-6">
              12,000+ explorers
            </span>
            <span className="float-label absolute -right-1 top-1/3 sm:-right-5">
              300+ destinations
            </span>
            <span className="float-label absolute bottom-24 -left-1 sm:-left-8">
              Personalized journeys
            </span>
            <span className="float-label absolute bottom-8 right-4 sm:right-0">
              Budget-aware planning
            </span>
          </div>
        </div>
      </section>

      {/* DESTINATION DISCOVERY */}
      <section className="px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="eyebrow">Destination discovery</p>
              <h2 className="display-section mt-4 max-w-xl">Where will you go next?</h2>
            </div>
            <Link
              to="/explore/cities"
              className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
            >
              Browse all cities <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-6">
            <DestinationCard
              city={featuredCities[0]!}
              className="sm:col-span-4"
              ratio="aspect-[16/11]"
              size="lg"
            />
            <DestinationCard city={featuredCities[1]!} className="sm:col-span-2" />
            <DestinationCard city={featuredCities[2]!} className="sm:col-span-2" />
            <DestinationCard
              city={featuredCities[3]!}
              className="sm:col-span-2"
              ratio="aspect-[4/5]"
            />
            <DestinationCard
              city={featuredCities[4]!}
              className="sm:col-span-2"
              ratio="aspect-[4/5]"
            />
            <DestinationCard
              city={featuredCities[5]!}
              className="sm:col-span-3"
              ratio="aspect-[16/11]"
            />
            <DestinationCard
              city={featuredCities[6]!}
              className="sm:col-span-3"
              ratio="aspect-[16/11]"
            />
          </div>
        </div>
      </section>

      {/* GLOBE + STATS */}
      <section className="border-y border-border bg-secondary/50 px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <span className="float-label">Real trips, real numbers</span>
          <h2 className="display-section mx-auto mt-6 max-w-2xl">
            Travelers planning their next adventure
          </h2>
          <p className="display-stat mt-8 text-primary">22,000+</p>

          <div className="relative mx-auto mt-10 max-w-3xl">
            <img
              src={images.globe}
              alt="Illustrated globe rising out of clouds"
              loading="lazy"
              width={1200}
              height={912}
              className="mx-auto w-full"
            />
            <span className="float-label absolute left-0 top-8 -rotate-6 sm:left-4">
              Popular destinations
            </span>
            <span className="float-label absolute right-0 top-16 rotate-6 sm:right-4">
              Trending cities
            </span>
            <span className="float-label absolute bottom-24 left-2 -rotate-3">
              Adventure escapes
            </span>
            <span className="float-label absolute bottom-16 right-2 rotate-3">
              Budget-friendly trips
            </span>
          </div>

          <div className="mt-4 grid gap-4 text-left sm:grid-cols-3">
            {[
              ["300+", "Destinations", "Cities, regions and multi-stop routes ready to plan."],
              ["12K+", "Explorers", "Travellers building itineraries every month."],
              ["100%", "Personalized", "No fixed packages — every day is yours to shape."],
            ].map(([stat, title, body]) => (
              <div key={title} className="panel p-6">
                <p className="font-display text-4xl">{stat}</p>
                <p className="mt-2 font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">How GlobeTrotter works</p>
          <h2 className="display-section mt-4 max-w-2xl">
            Four moves from a vague idea to a day-by-day plan
          </h2>

          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="relative border-t border-foreground/20 pt-6">
                <p className="font-display text-5xl text-foreground/25">{step.n}</p>
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EXPERIENCES */}
      <section className="px-4 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="eyebrow">Featured experiences</p>
              <h2 className="display-section mt-4 max-w-xl">
                Days worth building a trip around
              </h2>
            </div>
            <Link
              to="/explore/activities"
              className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
            >
              All experiences <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {["paraglide", "aurora", "fushimi"].map((id) => {
              const activity = activities.find((a) => a.id === id)!;
              return <ActivityCard key={id} activity={activity} />;
            })}
          </div>
        </div>
      </section>

      {/* TRIP PLANNING PREVIEW */}
      <section className="px-4 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Inside the planner</p>
            <h2 className="display-section mt-4">
              Your itinerary, honest about what it costs
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Add a city, assign nights, and drop activities into any day. GlobeTrotter
              keeps the timeline, the calendar and the budget in sync so you always know
              where the money is going.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link to="/signup">Start planning</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/share/european-summer-escape">See a shared trip</Link>
              </Button>
            </div>
          </div>

          <div className="panel p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">Sample itinerary</p>
                <h3 className="truncate font-display text-2xl">{sampleTrip.name}</h3>
              </div>
              <span className="float-label shrink-0">8 days · 3 cities</span>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                ["Day 01", "Paris", "Montmartre food walk", "09:30", 3400],
                ["Day 02", "Paris", "Eiffel Tower summit", "10:00", 2800],
                ["Day 04", "Zurich", "Lake Zurich boat loop", "15:30", 1900],
                ["Day 06", "Interlaken", "Paragliding flight", "11:00", 12500],
              ].map(([day, city, name, time, cost]) => (
                <li
                  key={String(day) + String(name)}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-3.5"
                >
                  <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
                    {day}
                  </span>
                  <span className="w-12 shrink-0 font-display">{time}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-semibold">{name}</span>
                    <span className="text-muted-foreground"> · {city}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">
                    {inr(Number(cost))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <span className="text-sm text-muted-foreground">Estimated trip total</span>
              <span className="font-display text-2xl">₹1,52,700</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRAVEL STORIES */}
      <section className="border-y border-border bg-secondary/50 px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="image-zoom overflow-hidden rounded-[2.5rem]">
            <img
              src={images.story}
              alt="Traveller looking out over a misty valley"
              loading="lazy"
              width={1200}
              height={900}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">Travel stories</p>
            <h2 className="display-section mt-4">Plans that turned into good stories</h2>
            <div className="mt-8 space-y-6">
              {[
                [
                  "We planned eight days across France and Switzerland in one evening. The budget page stopped two arguments before they started.",
                  "Aarav Mehta · European Summer Escape",
                ],
                [
                  "I copied a shared Japan itinerary, swapped two days for Kyoto gardens and it was ready.",
                  "Nikita Rao · Japan Discovery",
                ],
              ].map(([quote, who]) => (
                <blockquote key={who} className="panel p-6">
                  <Quote className="size-5 text-primary" />
                  <p className="mt-3 text-base leading-relaxed">{quote}</p>
                  <footer className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {who}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY + CTA */}
      <section className="px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="display-section mt-4">
                Borrow a route. Make it your own.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Every public itinerary can be copied in one click — dates, cities and
                activities included. Edit what you like, keep what works.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {seedTrips()
                .filter((t) => t.isPublic)
                .map((trip) => (
                  <Link
                    key={trip.id}
                    to="/share/$tripId"
                    params={{ tripId: trip.id }}
                    className="panel image-zoom overflow-hidden"
                  >
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="font-display text-xl">{trip.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trip.stops.length} cities · shared by Aarav
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div className="panel mt-20 overflow-hidden">
            <div className="grid gap-8 p-8 sm:p-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="display-section">
                  Your world. Your route. Your story.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Create a free account and turn a shortlist of places into a plan you can
                  actually follow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link to="/signup">Create your account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
