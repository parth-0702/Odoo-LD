import { addDays, format, parseISO } from "date-fns";

import paris from "@/assets/paris.jpg";
import zurich from "@/assets/zurich.jpg";
import interlaken from "@/assets/interlaken.jpg";
import tokyo from "@/assets/tokyo.jpg";
import kyoto from "@/assets/kyoto.jpg";
import iceland from "@/assets/iceland.jpg";
import bali from "@/assets/bali.jpg";
import alps from "@/assets/alps.jpg";
import dubai from "@/assets/dubai.jpg";
import patagonia from "@/assets/patagonia.jpg";
import himalaya from "@/assets/himalaya.jpg";
import story from "@/assets/story.jpg";
import hero from "@/assets/hero.jpg";
import globe from "@/assets/globe.jpg";

import type { Activity, City, Trip, TripStop, User } from "./types";

export const images = {
  hero,
  globe,
  story,
  paris,
  zurich,
  interlaken,
  tokyo,
  kyoto,
  iceland,
  bali,
  alps,
  dubai,
  patagonia,
  himalaya,
};

export const cities: City[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    region: "Western Europe",
    costIndex: "High",
    popularity: 98,
    avgDailyCost: 9200,
    image: paris,
    description:
      "Boulevards, riverside bookstalls and long dinners — a city built for slow, deliberate wandering.",
  },
  {
    id: "zurich",
    name: "Zurich",
    country: "Switzerland",
    region: "Central Europe",
    costIndex: "High",
    popularity: 84,
    avgDailyCost: 11500,
    image: zurich,
    description:
      "Lake swims before work, old-town lanes after — a calm, precise base for alpine detours.",
  },
  {
    id: "interlaken",
    name: "Interlaken",
    country: "Switzerland",
    region: "Central Europe",
    costIndex: "Medium",
    popularity: 88,
    avgDailyCost: 8600,
    image: interlaken,
    description:
      "Two lakes, one valley and a cable car for every mood. The Alps at their most theatrical.",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "East Asia",
    costIndex: "High",
    popularity: 96,
    avgDailyCost: 8800,
    image: tokyo,
    description:
      "Thirteen cities stitched into one. Neon crossings, quiet shrines and the world's best trains.",
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "East Asia",
    costIndex: "Medium",
    popularity: 92,
    avgDailyCost: 7200,
    image: kyoto,
    description:
      "Temple gardens, bamboo groves and tea houses that have not changed their minds in centuries.",
  },
  {
    id: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    region: "Nordics",
    costIndex: "High",
    popularity: 81,
    avgDailyCost: 10400,
    image: iceland,
    description:
      "A small capital with an enormous backyard: black beaches, geysers and winter aurora.",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Southeast Asia",
    costIndex: "Low",
    popularity: 94,
    avgDailyCost: 3900,
    image: bali,
    description:
      "Rice terraces at sunrise, surf in the afternoon, and villages that reward staying longer.",
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    region: "Central Europe",
    costIndex: "High",
    popularity: 90,
    avgDailyCost: 9800,
    image: alps,
    description:
      "Chalet villages under glaciers, with trails that turn a walk into an entire day's story.",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    costIndex: "Medium",
    popularity: 87,
    avgDailyCost: 7600,
    image: dubai,
    description:
      "Dunes on one side, glass towers on the other — a stopover that easily becomes a stay.",
  },
  {
    id: "patagonia",
    name: "Patagonia",
    country: "Argentina",
    region: "South America",
    costIndex: "Medium",
    popularity: 76,
    avgDailyCost: 6400,
    image: patagonia,
    description:
      "Granite spires, glacial lakes and wind that makes every photograph feel earned.",
  },
  {
    id: "manali",
    name: "Manali",
    country: "India",
    region: "South Asia",
    costIndex: "Low",
    popularity: 79,
    avgDailyCost: 2800,
    image: himalaya,
    description:
      "Deodar forests, river cafés and the gateway to high Himalayan passes.",
  },
];

export const activities: Activity[] = [
  {
    id: "eiffel",
    name: "Eiffel Tower Summit",
    cityId: "paris",
    category: "Sightseeing",
    durationMins: 150,
    cost: 2800,
    image: paris,
    description: "Timed-entry lift to the summit, best booked for the last slot before sunset.",
  },
  {
    id: "seine",
    name: "Seine River Cruise",
    cityId: "paris",
    category: "Sightseeing",
    durationMins: 90,
    cost: 1600,
    image: paris,
    description: "An hour on the water past Île de la Cité, Orsay and the Louvre facades.",
  },
  {
    id: "montmartre-food",
    name: "Montmartre Food Walk",
    cityId: "paris",
    category: "Food",
    durationMins: 180,
    cost: 3400,
    image: paris,
    description: "Cheese, baguette and bistro stops through the hill's back lanes.",
  },
  {
    id: "louvre",
    name: "Louvre Highlights",
    cityId: "paris",
    category: "Culture",
    durationMins: 210,
    cost: 2200,
    image: paris,
    description: "A curated three-hour route through the Denon and Sully wings.",
  },
  {
    id: "lake-zurich",
    name: "Lake Zurich Boat Loop",
    cityId: "zurich",
    category: "Nature",
    durationMins: 120,
    cost: 1900,
    image: zurich,
    description: "Slow ferry along the gold coast with mountain views on clear days.",
  },
  {
    id: "old-town-zurich",
    name: "Old Town Walking Tour",
    cityId: "zurich",
    category: "Culture",
    durationMins: 100,
    cost: 1200,
    image: zurich,
    description: "Guildhouses, Grossmünster and the Lindenhof terrace.",
  },
  {
    id: "alps-hike",
    name: "Swiss Alps Day Hike",
    cityId: "interlaken",
    category: "Adventure",
    durationMins: 330,
    cost: 3600,
    image: alps,
    description: "Ridge trail with a mountain-hut lunch and cable car descent.",
  },
  {
    id: "paraglide",
    name: "Paragliding Over Interlaken",
    cityId: "interlaken",
    category: "Adventure",
    durationMins: 120,
    cost: 12500,
    image: interlaken,
    description: "Tandem flight from Beatenberg landing beside the Höhematte.",
  },
  {
    id: "jungfrau",
    name: "Jungfraujoch Rail Journey",
    cityId: "interlaken",
    category: "Sightseeing",
    durationMins: 420,
    cost: 9800,
    image: alps,
    description: "Cogwheel train to Europe's highest station and the glacier plateau.",
  },
  {
    id: "shibuya",
    name: "Shibuya & Harajuku Evening",
    cityId: "tokyo",
    category: "Nightlife",
    durationMins: 180,
    cost: 2400,
    image: tokyo,
    description: "Crossing, backstreet listening bars and a late izakaya.",
  },
  {
    id: "tsukiji",
    name: "Toyosu Market Breakfast",
    cityId: "tokyo",
    category: "Food",
    durationMins: 120,
    cost: 2600,
    image: tokyo,
    description: "Early sushi counter breakfast and knife shopping afterwards.",
  },
  {
    id: "teamlab",
    name: "Digital Art Museum",
    cityId: "tokyo",
    category: "Culture",
    durationMins: 150,
    cost: 3100,
    image: tokyo,
    description: "Room-scale light installations — book the first entry slot.",
  },
  {
    id: "fushimi",
    name: "Fushimi Inari Shrine",
    cityId: "kyoto",
    category: "Culture",
    durationMins: 150,
    cost: 0,
    image: kyoto,
    description: "Ten thousand vermilion gates up the mountain; go before 7am.",
  },
  {
    id: "arashiyama",
    name: "Arashiyama Bamboo Grove",
    cityId: "kyoto",
    category: "Nature",
    durationMins: 120,
    cost: 600,
    image: kyoto,
    description: "Grove walk plus the riverside temple garden at Tenryū-ji.",
  },
  {
    id: "tea-ceremony",
    name: "Machiya Tea Ceremony",
    cityId: "kyoto",
    category: "Wellness",
    durationMins: 90,
    cost: 2900,
    image: kyoto,
    description: "Hosted matcha ceremony in a restored townhouse.",
  },
  {
    id: "aurora",
    name: "Northern Lights Tour",
    cityId: "reykjavik",
    category: "Nature",
    durationMins: 240,
    cost: 7400,
    image: iceland,
    description: "Small-group chase away from city light, with a second-night guarantee.",
  },
  {
    id: "golden-circle",
    name: "Golden Circle Drive",
    cityId: "reykjavik",
    category: "Sightseeing",
    durationMins: 480,
    cost: 8900,
    image: iceland,
    description: "Þingvellir, Geysir and Gullfoss in one long, bright day.",
  },
  {
    id: "ubud-terrace",
    name: "Tegallalang Sunrise Walk",
    cityId: "bali",
    category: "Nature",
    durationMins: 150,
    cost: 1400,
    image: bali,
    description: "Terrace paths before the crowds, ending at a valley coffee bar.",
  },
  {
    id: "surf-lesson",
    name: "Canggu Surf Lesson",
    cityId: "bali",
    category: "Adventure",
    durationMins: 120,
    cost: 2200,
    image: bali,
    description: "Beginner-friendly beach break with board and instructor.",
  },
  {
    id: "desert-safari",
    name: "Evening Desert Safari",
    cityId: "dubai",
    category: "Adventure",
    durationMins: 300,
    cost: 5600,
    image: dubai,
    description: "Dune drive, camp dinner and stargazing on the return.",
  },
  {
    id: "souk",
    name: "Gold & Spice Souk",
    cityId: "dubai",
    category: "Shopping",
    durationMins: 120,
    cost: 900,
    image: dubai,
    description: "Creek crossing by abra and a walk through the old trading lanes.",
  },
  {
    id: "torres",
    name: "Torres del Paine Base Trek",
    cityId: "patagonia",
    category: "Adventure",
    durationMins: 540,
    cost: 6800,
    image: patagonia,
    description: "Full-day trek to the base of the towers with a packed lunch.",
  },
  {
    id: "solang",
    name: "Solang Valley Day",
    cityId: "manali",
    category: "Adventure",
    durationMins: 300,
    cost: 2400,
    image: himalaya,
    description: "Ropeway, alpine meadow walk and river-side maggi stop.",
  },
  {
    id: "hadimba",
    name: "Hadimba Temple & Old Manali",
    cityId: "manali",
    category: "Culture",
    durationMins: 150,
    cost: 700,
    image: himalaya,
    description: "Cedar-forest temple followed by cafés along the Manalsu.",
  },
  {
    id: "rohtang",
    name: "Atal Tunnel & Sissu",
    cityId: "manali",
    category: "Sightseeing",
    durationMins: 420,
    cost: 4200,
    image: himalaya,
    description: "Cross into Lahaul for glacier views and the Sissu waterfall.",
  },
];

export const activityById = (id: string) => activities.find((a) => a.id === id);
export const cityById = (id: string) => cities.find((c) => c.id === id);
export const activitiesForCity = (cityId: string) =>
  activities.filter((a) => a.cityId === cityId);

export const demoUser: User = {
  id: "u_aarav",
  name: "Aarav Mehta",
  email: "aarav@globetrotter.app",
  language: "English (India)",
  travelStyle: ["Slow travel", "Mountains", "Food-led"],
  role: "admin",
};

let seq = 0;
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(seq++).toString(36)}`;

export const buildDays = (start: string, nights: number) =>
  Array.from({ length: nights }, (_, i) => ({
    id: uid("day"),
    date: format(addDays(parseISO(start), i), "yyyy-MM-dd"),
    activities: [],
  }));

const stop = (
  cityId: string,
  start: string,
  nights: number,
  plan: [string, string][][],
): TripStop => {
  const days = buildDays(start, nights).map((day, i) => ({
    ...day,
    activities: (plan[i] ?? []).map(([activityId, time]) => ({
      id: uid("ia"),
      activityId,
      time,
      cost: activityById(activityId)?.cost ?? 0,
    })),
  }));
  return {
    id: uid("stop"),
    cityId,
    startDate: start,
    endDate: format(addDays(parseISO(start), nights - 1), "yyyy-MM-dd"),
    days,
  };
};

export const seedTrips = (): Trip[] => [
  {
    id: "european-summer-escape",
    userId: demoUser.id,
    name: "European Summer Escape",
    description: "Two weeks exploring France and Switzerland at a walkable pace.",
    startDate: "2026-09-12",
    endDate: "2026-09-19",
    coverImage: paris,
    plannedBudget: 145000,
    isPublic: true,
    createdAt: "2026-08-02",
    expenses: { transport: 42000, accommodation: 56000, meals: 21000, other: 8000 },
    stops: [
      stop("paris", "2026-09-12", 3, [
        [
          ["montmartre-food", "09:30"],
          ["louvre", "13:00"],
          ["seine", "18:30"],
        ],
        [
          ["eiffel", "10:00"],
          ["seine", "19:00"],
        ],
        [["louvre", "11:00"]],
      ]),
      stop("zurich", "2026-09-15", 2, [
        [
          ["old-town-zurich", "10:00"],
          ["lake-zurich", "15:30"],
        ],
        [["lake-zurich", "09:30"]],
      ]),
      stop("interlaken", "2026-09-17", 3, [
        [["alps-hike", "08:00"]],
        [
          ["paraglide", "11:00"],
          ["jungfrau", "07:30"],
        ],
        [["jungfrau", "07:00"]],
      ]),
    ],
  },
  {
    id: "himalayan-adventure",
    userId: demoUser.id,
    name: "Himalayan Adventure",
    description: "A week of high passes, cedar forests and river cafés in Himachal.",
    startDate: "2026-10-04",
    endDate: "2026-10-07",
    coverImage: himalaya,
    plannedBudget: 38000,
    isPublic: false,
    createdAt: "2026-08-10",
    expenses: { transport: 12000, accommodation: 14000, meals: 6000, other: 2500 },
    stops: [
      stop("manali", "2026-10-04", 4, [
        [["hadimba", "10:00"]],
        [["solang", "08:30"]],
        [["rohtang", "06:30"]],
        [["hadimba", "16:00"]],
      ]),
    ],
  },
  {
    id: "japan-discovery",
    userId: demoUser.id,
    name: "Japan Discovery",
    description: "Tokyo's energy first, then Kyoto's gardens to slow the trip down.",
    startDate: "2026-04-06",
    endDate: "2026-04-11",
    coverImage: tokyo,
    plannedBudget: 120000,
    isPublic: true,
    createdAt: "2026-02-14",
    expenses: { transport: 38000, accommodation: 41000, meals: 18000, other: 6000 },
    stops: [
      stop("tokyo", "2026-04-06", 3, [
        [
          ["tsukiji", "07:00"],
          ["shibuya", "18:00"],
        ],
        [["teamlab", "10:00"]],
        [["shibuya", "19:00"]],
      ]),
      stop("kyoto", "2026-04-09", 3, [
        [["fushimi", "06:30"]],
        [
          ["arashiyama", "08:00"],
          ["tea-ceremony", "15:00"],
        ],
        [["tea-ceremony", "11:00"]],
      ]),
    ],
  },
];

export const savedSeed = ["reykjavik", "bali", "patagonia"];
