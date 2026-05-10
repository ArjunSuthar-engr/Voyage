import { buildDateRange } from "@/lib/dates";
import type { Stop } from "@/lib/types";

export type StopSuggestion = {
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  stay_cost: number;
  transport_cost: number;
  notes: string;
  source: string;
};

type StopTemplate = {
  city: string;
  country: string;
  stay_cost: number;
  transport_cost: number;
  notes: string;
  source: string;
};

type BuildStopSuggestionsInput = {
  tripName: string;
  tripDescription?: string | null;
  tripStartDate: string;
  tripEndDate: string;
  existingStops: Stop[];
};

const ROUTES: Array<{ matches: string[]; stops: StopTemplate[] }> = [
  {
    matches: ["golden triangle", "delhi", "agra", "jaipur"],
    stops: [
      {
        city: "Delhi",
        country: "India",
        stay_cost: 32000,
        transport_cost: 6000,
        notes: "Arrival base for Old Delhi, Connaught Place, India Gate, Humayun's Tomb, and first transit setup.",
        source: "Incredible India Golden Triangle route",
      },
      {
        city: "Agra",
        country: "India",
        stay_cost: 22000,
        transport_cost: 8500,
        notes: "Core heritage stop for Taj Mahal, Agra Fort, and a compact Mughal-era sightseeing day.",
        source: "Incredible India Golden Triangle route",
      },
      {
        city: "Jaipur",
        country: "India",
        stay_cost: 30000,
        transport_cost: 9000,
        notes: "Final Rajasthan stop for Amber Fort, City Palace, Hawa Mahal, markets, and relaxed departure buffer.",
        source: "Incredible India Golden Triangle route",
      },
    ],
  },
  {
    matches: ["japan city loop", "city loop", "tokyo kyoto osaka"],
    stops: [
      {
        city: "Tokyo",
        country: "Japan",
        stay_cost: 52000,
        transport_cost: 15000,
        notes: "Start in Tokyo for arrival logistics, food streets, design districts, and flexible first-day pacing.",
        source: "JNTO Golden Route",
      },
      {
        city: "Hakone",
        country: "Japan",
        stay_cost: 38000,
        transport_cost: 9000,
        notes: "Add a slower hot-spring and Mt. Fuji-view break between Tokyo and Kyoto before the long rail leg.",
        source: "JNTO Golden Route",
      },
      {
        city: "Kyoto",
        country: "Japan",
        stay_cost: 45000,
        transport_cost: 11000,
        notes: "Use Kyoto as the culture anchor for temples, gardens, historic lanes, and traditional food.",
        source: "JNTO Kyoto and Kansai guidance",
      },
      {
        city: "Nara",
        country: "Japan",
        stay_cost: 18000,
        transport_cost: 3500,
        notes: "Use Nara as a compact heritage stop for Nara Park, Todaiji Temple, and old-town walking.",
        source: "JNTO Kansai Trio",
      },
      {
        city: "Osaka",
        country: "Japan",
        stay_cost: 30000,
        transport_cost: 7500,
        notes: "Close with Osaka for Dotonbori, easy Kansai rail access, and a strong food-focused final leg.",
        source: "JNTO Kansai Trio",
      },
    ],
  },
  {
    matches: ["tokyo", "kyoto", "japan"],
    stops: [
      {
        city: "Tokyo",
        country: "Japan",
        stay_cost: 52000,
        transport_cost: 15000,
        notes: "Start in Tokyo for arrival logistics, food streets, design districts, and flexible first-day pacing.",
        source: "JNTO Golden Route",
      },
      {
        city: "Hakone",
        country: "Japan",
        stay_cost: 38000,
        transport_cost: 9000,
        notes: "A natural Tokyo-to-Kyoto pause for onsen stays, Hakone Shrine, and Lake Ashi views before continuing west.",
        source: "JNTO Golden Route",
      },
      {
        city: "Kyoto",
        country: "Japan",
        stay_cost: 45000,
        transport_cost: 11000,
        notes: "Use Kyoto as the culture anchor for temples, gardens, historic lanes, and traditional food.",
        source: "JNTO Kyoto guidance",
      },
      {
        city: "Nara",
        country: "Japan",
        stay_cost: 18000,
        transport_cost: 3500,
        notes: "A practical Kyoto-side heritage extension for Nara Park, Todaiji Temple, and sacred-site walking.",
        source: "JNTO Kansai Trio",
      },
    ],
  },
];

function findRouteTemplates(tripName: string, tripDescription?: string | null) {
  const text = `${tripName} ${tripDescription ?? ""}`.toLowerCase();
  const route = ROUTES.find((candidate) => candidate.matches.some((match) => text.includes(match)));
  return route?.stops ?? [];
}

function attachDateRanges(templates: StopTemplate[], tripStartDate: string, tripEndDate: string) {
  const dates = buildDateRange(tripStartDate, tripEndDate);
  const count = templates.length;

  return templates.map((template, index) => {
    const startIndex = Math.min(dates.length - 1, Math.floor((index * dates.length) / count));
    const endIndex = Math.max(startIndex, Math.min(dates.length - 1, Math.floor(((index + 1) * dates.length) / count) - 1));

    return {
      ...template,
      start_date: dates[startIndex],
      end_date: dates[endIndex],
    };
  });
}

export function buildStopSuggestions({
  tripName,
  tripDescription,
  tripStartDate,
  tripEndDate,
  existingStops,
}: BuildStopSuggestionsInput) {
  const existingCities = new Set(existingStops.map((stop) => `${stop.city},${stop.country}`.toLowerCase()));

  return attachDateRanges(findRouteTemplates(tripName, tripDescription), tripStartDate, tripEndDate).map((suggestion) => ({
    ...suggestion,
    alreadyAdded: existingCities.has(`${suggestion.city},${suggestion.country}`.toLowerCase()),
  }));
}
