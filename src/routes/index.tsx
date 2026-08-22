import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type CSSProperties } from "react";

import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";

import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { Button } from "@/components/ui/button";
import { activities, cities, images, seedTrips } from "@/lib/data";
import { inr } from "@/lib/format";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

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

// ---------------------------------------------------------------------------
// Count-up animation helper
// ---------------------------------------------------------------------------
function animateCountUp(
  el: HTMLElement,
  target: number,
  suffix: string,
  prefix: string,
  duration: number,
) {
  const start = { val: 0 };
  return gsap.to(start, {
    val: target,
    duration,
    ease: "power2.out",
    onUpdate() {
      el.textContent =
        prefix +
        (target >= 1000 ? Math.round(start.val / 1000) + "K" : Math.round(start.val).toString()) +
        suffix;
    },
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      once: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Landing page component
// ---------------------------------------------------------------------------
function Landing() {
  const sampleTrip = seedTrips()[0]!;
  const reducedMotion = useReducedMotion();

  // Refs for hero sequence
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDListElement>(null);
  const heroImageWrapRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const floatLabelsRef = useRef<HTMLDivElement>(null);

  // Refs for scroll-reveal sections
  const destSectionRef = useRef<HTMLDivElement>(null);
  const destGridRef = useRef<HTMLDivElement>(null);
  const globeSectionRef = useRef<HTMLDivElement>(null);
  const globeImgRef = useRef<HTMLImageElement>(null);
  const globeFloatsRef = useRef<HTMLDivElement>(null);
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const howWorksRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const featuredGridRef = useRef<HTMLDivElement>(null);
  const plannerSectionRef = useRef<HTMLDivElement>(null);
  const plannerTextRef = useRef<HTMLDivElement>(null);
  const plannerCardRef = useRef<HTMLDivElement>(null);
  const storiesSectionRef = useRef<HTMLDivElement>(null);
  const storiesImageRef = useRef<HTMLDivElement>(null);
  const storiesTextRef = useRef<HTMLDivElement>(null);
  const communitySectionRef = useRef<HTMLDivElement>(null);
  const communityCardsRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  // Stat number refs for count-up
  const stat300Ref = useRef<HTMLParagraphElement>(null);
  const stat12kRef = useRef<HTMLParagraphElement>(null);
  const stat100Ref = useRef<HTMLParagraphElement>(null);
  const stat22kRef = useRef<HTMLParagraphElement>(null);

  // ----- Hero entrance sequence -----
  useEffect(() => {
    if (reducedMotion || !heroRef.current) return;
    const context = gsap.context(() => {
      const els = [
        eyebrowRef.current,
        headlineLine1Ref.current,
        headlineLine2Ref.current,
        descRef.current,
        ctaRef.current,
        statsRef.current,
      ].filter(Boolean) as HTMLElement[];

      // Set initial state
      gsap.set(els, { opacity: 0, y: 28 });
      gsap.set(heroImageWrapRef.current, {
        opacity: 0,
        clipPath: "inset(8% 8% 8% 8% round 2.5rem)",
      });
      gsap.set(heroImgRef.current, { scale: 1.1 });
      if (floatLabelsRef.current) {
        gsap.set(floatLabelsRef.current.children, { opacity: 0, scale: 0.88, y: 10 });
      }

      // Timeline
      const tl = gsap.timeline({ delay: 0.1 });

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.55 })
        .to(
          headlineLine1Ref.current,
          { opacity: 1, y: 0, duration: 0.65, ease: "power4.out" },
          "-=0.3",
        )
        .to(
          headlineLine2Ref.current,
          { opacity: 1, y: 0, duration: 0.65, ease: "power4.out" },
          "-=0.4",
        )
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.55 }, "-=0.3")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to(statsRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        // Hero image reveal
        .to(
          heroImageWrapRef.current,
          {
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0% round 2.5rem)",
            duration: 1.0,
            ease: "power3.inOut",
          },
          0.2,
        )
        .to(heroImgRef.current, { scale: 1, duration: 1.4, ease: "power2.out" }, 0.2)
        // Float labels stagger in
        .to(
          floatLabelsRef.current?.children ?? [],
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.4)",
          },
          0.8,
        );

      // Subtle hero image parallax on scroll
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    }, heroRef.current);

    return () => context.revert();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Destination section -----
  useEffect(() => {
    if (reducedMotion || !destSectionRef.current || !destGridRef.current) return;
    const section = destSectionRef.current;
    const grid = destGridRef.current;
    const context = gsap.context(() => {
      const heading = section.querySelector("h2");

      const eyebrow = section.querySelector(".eyebrow");
      const link = section.querySelector("a");

      gsap.set([eyebrow, heading, link], { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });
      tl.to([eyebrow, heading, link], { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 });

      // Card stagger with offset
      const cards = Array.from(grid.children) as HTMLElement[];
      gsap.set(cards, { opacity: 0, y: 40 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          once: true,
        },
      });
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Globe + Stats section -----
  useEffect(() => {
    if (reducedMotion || !globeSectionRef.current) return;
    const section = globeSectionRef.current;
    const context = gsap.context(() => {
      const eyebrow = section.querySelector(".float-label");

      const heading = section.querySelector("h2");
      const statNum = stat22kRef.current;

      gsap.set([eyebrow, heading, statNum], { opacity: 0, y: 24 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
      tl.to([eyebrow, heading], { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }).to(
        statNum,
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3",
      );

      // Globe parallax
      if (globeImgRef.current) {
        gsap.to(globeImgRef.current, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      // Globe float labels stagger
      if (globeFloatsRef.current) {
        gsap.set(globeFloatsRef.current.children, { opacity: 0, scale: 0.85 });
        gsap.to(globeFloatsRef.current.children, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: globeImgRef.current, start: "top 75%", once: true },
        });
      }

      // Stats cards stagger
      if (statsCardsRef.current) {
        gsap.set(statsCardsRef.current.children, { opacity: 0, y: 30 });
        gsap.to(statsCardsRef.current.children, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: statsCardsRef.current, start: "top 85%", once: true },
        });
      }
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Count-up animations -----

  useEffect(() => {
    if (reducedMotion) return;

    const tweens = [
      stat300Ref.current && animateCountUp(stat300Ref.current, 300, "+", "", 1.4),
      stat12kRef.current && animateCountUp(stat12kRef.current, 12000, "+", "", 1.4),
      stat100Ref.current && animateCountUp(stat100Ref.current, 100, "%", "", 1.2),
      stat22kRef.current && animateCountUp(stat22kRef.current, 22000, "+", "", 1.5),
    ].filter(Boolean) as gsap.core.Tween[];

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- How It Works -----
  useEffect(() => {
    if (reducedMotion || !howWorksRef.current || !stepsRef.current) return;
    const section = howWorksRef.current;
    const steps = stepsRef.current;
    const context = gsap.context(() => {
      const heading = section.querySelector("h2");
      const eyebrow = section.querySelector(".eyebrow");
      gsap.set([eyebrow, heading], { opacity: 0, y: 24 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });
      tl.to([eyebrow, heading], { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 });

      const stepEls = Array.from(steps.children) as HTMLElement[];
      gsap.set(stepEls, { opacity: 0, y: 36 });
      gsap.to(stepEls, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: steps, start: "top 85%", once: true },
      });
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Featured experiences -----
  useEffect(() => {
    if (reducedMotion || !featuredSectionRef.current || !featuredGridRef.current) return;
    const section = featuredSectionRef.current;
    const grid = featuredGridRef.current;
    const context = gsap.context(() => {
      const heading = section.querySelector("h2");
      const eyebrow = section.querySelector(".eyebrow");
      gsap.set([eyebrow, heading], { opacity: 0, y: 24 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });
      tl.to([eyebrow, heading], { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 });

      const cards = Array.from(grid.children) as HTMLElement[];
      gsap.set(cards, { opacity: 0, y: 36 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Trip planner preview -----
  useEffect(() => {
    if (reducedMotion || !plannerSectionRef.current) return;
    const context = gsap.context(() => {
      gsap.set([plannerTextRef.current, plannerCardRef.current], { opacity: 0, y: 36 });
      gsap.to([plannerTextRef.current, plannerCardRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: plannerSectionRef.current, start: "top 82%", once: true },
      });
    }, plannerSectionRef.current);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Travel stories -----
  useEffect(() => {
    if (reducedMotion || !storiesSectionRef.current) return;
    const context = gsap.context(() => {
      gsap.set([storiesImageRef.current, storiesTextRef.current], { opacity: 0 });
      gsap.set(storiesImageRef.current, { x: -32 });
      gsap.set(storiesTextRef.current, { x: 32 });

      gsap.to([storiesImageRef.current, storiesTextRef.current], {
        opacity: 1,
        x: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: storiesSectionRef.current, start: "top 80%", once: true },
      });

      // Blockquote stagger
      const quotes = storiesTextRef.current?.querySelectorAll("blockquote");
      if (quotes?.length) {
        gsap.set(quotes, { opacity: 0, y: 20 });
        gsap.to(quotes, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: storiesTextRef.current, start: "top 80%", once: true },
        });
      }
    }, storiesSectionRef.current);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Community -----
  useEffect(() => {
    if (reducedMotion || !communitySectionRef.current) return;
    const section = communitySectionRef.current;
    const context = gsap.context(() => {
      const heading = section.querySelector("h2");
      const eyebrow = section.querySelector(".eyebrow");
      gsap.set([eyebrow, heading], { opacity: 0, y: 24 });
      gsap.to([eyebrow, heading], {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });

      if (communityCardsRef.current) {
        const cards = Array.from(communityCardsRef.current.children) as HTMLElement[];
        gsap.set(cards, { opacity: 0, y: 30 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: communityCardsRef.current, start: "top 85%", once: true },
        });
      }
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // ----- Final CTA -----
  useEffect(() => {
    if (reducedMotion || !finalCtaRef.current) return;
    const section = finalCtaRef.current;
    const context = gsap.context(() => {
      const heading = section.querySelector("h2");
      const body = section.querySelector("p");
      const btns = section.querySelector(".flex");
      gsap.set([heading, body, btns], { opacity: 0, y: 28 });
      gsap.to([heading, body, btns], {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });
    }, section);

    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* ---------------------------------------------------------------- */}
      {/* HERO                                                               */}
      {/* ---------------------------------------------------------------- */}
      <section ref={heroRef} className="px-4 pt-28 sm:px-8 sm:pt-36">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p ref={eyebrowRef} className="eyebrow">
              Personalized travel planning
            </p>
            <h1 className="display-hero mt-5">
              <span ref={headlineLine1Ref} className="block">
                Plan the journey.
              </span>
              <em ref={headlineLine2Ref} className="block italic">
                Live the story.
              </em>
            </h1>
            <p
              ref={descRef}
              className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Build personalized multi-city trips, discover unforgettable places, manage your budget
              and share every journey with the people who matter.
            </p>
            <div ref={ctaRef} className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-tactile rounded-full px-7">
                <Link to="/signup">
                  Plan Your Trip{" "}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="btn-tactile rounded-full border-foreground/15 px-7"
              >
                <Link to="/explore/cities">Explore Destinations</Link>
              </Button>
            </div>
            <dl
              ref={statsRef}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7"
            >
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

          {/* Hero image + float labels */}
          <div className="relative">
            <div
              ref={heroImageWrapRef}
              className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem]"
              style={{ willChange: "clip-path, opacity" }}
            >
              <img
                ref={heroImgRef}
                src={images.hero}
                alt="Coastal road winding along cliffs at golden hour"
                width={1400}
                height={1750}
                className="size-full object-cover"
                style={{ willChange: "transform" }}
              />
            </div>

            {/* Float labels — each gets its own timing via CSS vars */}
            <div ref={floatLabelsRef}>
              <span
                className="float-label absolute -left-2 top-10 sm:-left-6"
                style={{ "--float-dur": "5.2s", "--float-delay": "0s" } as CSSProperties}
              >
                12,000+ explorers
              </span>
              <span
                className="float-label absolute -right-1 top-1/3 sm:-right-5"
                style={{ "--float-dur": "6.1s", "--float-delay": "0.8s" } as CSSProperties}
              >
                300+ destinations
              </span>
              <span
                className="float-label absolute bottom-24 -left-1 sm:-left-8"
                style={{ "--float-dur": "5.7s", "--float-delay": "1.4s" } as CSSProperties}
              >
                Personalized journeys
              </span>
              <span
                className="float-label absolute bottom-8 right-4 sm:right-0"
                style={{ "--float-dur": "6.4s", "--float-delay": "0.4s" } as CSSProperties}
              >
                Budget-aware planning
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* DESTINATION DISCOVERY                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-4 py-24 sm:px-8 sm:py-32">
        <div ref={destSectionRef} className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="eyebrow">Destination discovery</p>
              <h2 className="display-section mt-4 max-w-xl">Where will you go next?</h2>
            </div>
            <Link
              to="/explore/cities"
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary"
            >
              Browse all cities <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div ref={destGridRef} className="mt-12 grid gap-4 sm:grid-cols-6">
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

      {/* ---------------------------------------------------------------- */}
      {/* GLOBE + STATS                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section
        ref={globeSectionRef}
        className="border-y border-border bg-secondary/50 px-4 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-5xl text-center">
          <span
            className="float-label"
            style={{ "--float-dur": "5.8s", "--float-delay": "0s" } as CSSProperties}
          >
            Real trips, real numbers
          </span>
          <h2 className="display-section mx-auto mt-6 max-w-2xl">
            Travelers planning their next adventure
          </h2>
          <p
            ref={stat22kRef}
            className="display-stat mt-8 text-primary"
            aria-label="22,000+ travelers"
          >
            22,000+
          </p>

          <div className="relative mx-auto mt-10 max-w-3xl" style={{ overflow: "hidden" }}>
            <img
              ref={globeImgRef}
              src={images.globe}
              alt="Illustrated globe rising out of clouds"
              loading="lazy"
              width={1200}
              height={912}
              className="mx-auto w-full"
              style={{ willChange: "transform" }}
            />
            <div ref={globeFloatsRef}>
              <span
                className="float-label absolute left-0 top-8 sm:left-4"
                style={
                  {
                    "--float-dur": "5.3s",
                    "--float-delay": "0.2s",
                    "--float-rotate": "-6deg",
                  } as CSSProperties
                }
              >
                Popular destinations
              </span>
              <span
                className="float-label absolute right-0 top-16 sm:right-4"
                style={
                  {
                    "--float-dur": "6.2s",
                    "--float-delay": "0.7s",
                    "--float-rotate": "6deg",
                  } as CSSProperties
                }
              >
                Trending cities
              </span>
              <span
                className="float-label absolute bottom-24 left-2"
                style={
                  {
                    "--float-dur": "5.7s",
                    "--float-delay": "1.1s",
                    "--float-rotate": "-3deg",
                  } as CSSProperties
                }
              >
                Adventure escapes
              </span>
              <span
                className="float-label absolute bottom-16 right-2"
                style={
                  {
                    "--float-dur": "6.5s",
                    "--float-delay": "0.5s",
                    "--float-rotate": "3deg",
                  } as CSSProperties
                }
              >
                Budget-friendly trips
              </span>
            </div>
          </div>

          <div ref={statsCardsRef} className="mt-4 grid gap-4 text-left sm:grid-cols-3">
            {[
              {
                ref: stat300Ref,
                stat: "300+",
                title: "Destinations",
                body: "Cities, regions and multi-stop routes ready to plan.",
                target: 300,
                suffix: "+",
                prefix: "",
              },
              {
                ref: stat12kRef,
                stat: "12K+",
                title: "Explorers",
                body: "Travellers building itineraries every month.",
                target: 12000,
                suffix: "+",
                prefix: "",
              },
              {
                ref: stat100Ref,
                stat: "100%",
                title: "Personalized",
                body: "No fixed packages — every day is yours to shape.",
                target: 100,
                suffix: "%",
                prefix: "",
              },
            ].map(({ ref: statRef, stat, title, body }) => (
              <div key={title} className="panel p-6">
                <p ref={statRef} className="font-display text-4xl">
                  {stat}
                </p>
                <p className="mt-2 font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* HOW IT WORKS                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section id="how-it-works" className="px-4 py-24 sm:px-8 sm:py-32">
        <div ref={howWorksRef} className="mx-auto max-w-6xl">
          <p className="eyebrow">How GlobeTrotter works</p>
          <h2 className="display-section mt-4 max-w-2xl">
            Four moves from a vague idea to a day-by-day plan
          </h2>

          <div ref={stepsRef} className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.n}
                className="relative border-t border-foreground/20 pt-6 transition-colors duration-300 hover:border-primary/50"
              >
                <p className="font-display text-5xl text-foreground/25">{step.n}</p>
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED EXPERIENCES                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-4 pb-24 sm:px-8 sm:pb-32">
        <div ref={featuredSectionRef} className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="eyebrow">Featured experiences</p>
              <h2 className="display-section mt-4 max-w-xl">Days worth building a trip around</h2>
            </div>
            <Link
              to="/explore/activities"
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary"
            >
              All experiences <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div ref={featuredGridRef} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {["paraglide", "aurora", "fushimi"].map((id) => {
              const activity = activities.find((a) => a.id === id)!;
              return <ActivityCard key={id} activity={activity} />;
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* TRIP PLANNING PREVIEW                                              */}
      {/* ---------------------------------------------------------------- */}
      <section ref={plannerSectionRef} className="px-4 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div ref={plannerTextRef}>
            <p className="eyebrow">Inside the planner</p>
            <h2 className="display-section mt-4">Your itinerary, honest about what it costs</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Add a city, assign nights, and drop activities into any day. GlobeTrotter keeps the
              timeline, the calendar and the budget in sync so you always know where the money is
              going.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="btn-tactile rounded-full px-6">
                <Link to="/signup">Start planning</Link>
              </Button>
              <Button asChild variant="outline" className="btn-tactile rounded-full px-6">
                <Link to="/share/european-summer-escape">See a shared trip</Link>
              </Button>
            </div>
          </div>

          <div ref={plannerCardRef} className="panel p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">Sample itinerary</p>
                <h3 className="truncate font-display text-2xl">{sampleTrip.name}</h3>
              </div>
              <span
                className="float-label shrink-0"
                style={{ "--float-dur": "5.5s", "--float-delay": "0.3s" } as CSSProperties}
              >
                8 days · 3 cities
              </span>
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
                  className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-3.5 transition-colors duration-200 hover:bg-secondary"
                >
                  <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
                    {day}
                  </span>
                  <span className="w-12 shrink-0 font-display">{time}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-semibold">{name}</span>
                    <span className="text-muted-foreground"> · {city}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">{inr(Number(cost))}</span>
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

      {/* ---------------------------------------------------------------- */}
      {/* TRAVEL STORIES                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section
        ref={storiesSectionRef}
        className="border-y border-border bg-secondary/50 px-4 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div ref={storiesImageRef} className="image-zoom overflow-hidden rounded-[2.5rem]">
            <img
              src={images.story}
              alt="Traveller looking out over a misty valley"
              loading="lazy"
              width={1200}
              height={900}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div ref={storiesTextRef}>
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
                <blockquote
                  key={who}
                  className="panel p-6 transition-shadow duration-300 hover:shadow-lift"
                >
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

      {/* ---------------------------------------------------------------- */}
      {/* COMMUNITY + CTA                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section ref={communitySectionRef} className="px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="display-section mt-4">Borrow a route. Make it your own.</h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Every public itinerary can be copied in one click — dates, cities and activities
                included. Edit what you like, keep what works.
              </p>
            </div>
            <div ref={communityCardsRef} className="grid gap-4 sm:grid-cols-2">
              {seedTrips()
                .filter((t) => t.isPublic)
                .map((trip) => (
                  <Link
                    key={trip.id}
                    to="/share/$tripId"
                    params={{ tripId: trip.id }}
                    className="panel image-zoom card-lift overflow-hidden"
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

          {/* Final CTA */}
          <div className="panel mt-20 overflow-hidden">
            <div
              ref={finalCtaRef}
              className="grid gap-8 p-8 sm:p-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"
            >
              <div>
                <h2 className="display-section">Your world. Your route. Your story.</h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Create a free account and turn a shortlist of places into a plan you can actually
                  follow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg" className="btn-tactile rounded-full px-7">
                  <Link to="/signup">Create your account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="btn-tactile rounded-full px-7"
                >
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
