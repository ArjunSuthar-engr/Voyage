import { buildDateRange } from "@/lib/dates";
import type { Stop } from "@/lib/types";

export type OpenDateSlot = {
  id: string;
  start_date: string;
  end_date: string;
  dayCount: number;
};

export type TimelineItem =
  | { type: "slot"; slot: OpenDateSlot }
  | { type: "stop"; stop: Stop };

export type StopSuggestion = {
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  stay_cost: number;
  transport_cost: number;
  notes: string;
  source: string;
  sourceUrl: string;
  routeOrder: number;
  alreadyAdded: boolean;
  disabledReason?: string;
  hotelName: string;
  hotelNightlyCost: number;
  hotelSource: string;
  hotelSourceUrl: string;
  transportSummary: string;
  transportSource: string;
  mapsUrl: string;
  slot?: OpenDateSlot;
};

type StopTemplate = {
  city: string;
  country: string;
  preferredDays: number;
  minDays: number;
  hotelName: string;
  hotelNightlyCost: number;
  hotelSource: string;
  hotelSourceUrl: string;
  transportCost: number;
  transportSummary: string;
  transportSource: string;
  source: string;
  sourceUrl: string;
  notes: string;
};

type RouteTemplate = {
  matches: string[];
  stops: StopTemplate[];
};

type BuildStopSuggestionsInput = {
  tripName: string;
  tripDescription?: string | null;
  tripStartDate: string;
  tripEndDate: string;
  existingStops: Stop[];
  preferredSlot?: OpenDateSlot;
};

const USD_TO_INR = 94;

function usd(value: number) {
  return Math.round(value * USD_TO_INR);
}

const ROUTES: RouteTemplate[] = [
  {
    matches: ["golden triangle", "delhi", "agra", "jaipur"],
    stops: [
      {
        city: "Delhi",
        country: "India",
        preferredDays: 3,
        minDays: 2,
        hotelName: "Bloomrooms @ New Delhi Railway Station",
        hotelNightlyCost: 4100,
        hotelSource: "MakeMyTrip listed a Value Twin room around INR 4,094/night; Expedia listed low rates from about $28/night.",
        hotelSourceUrl: "https://www.makemytrip.com/hotels/bloomrooms_new_delhi_railway_station-details-delhi.html",
        transportCost: 2500,
        transportSummary: "Arrival/local transfer buffer in Delhi; Connaught Place and India Gate are practical first-day anchors.",
        transportSource: "Incredible India starts the route in Delhi.",
        source: "Incredible India Golden Triangle route",
        sourceUrl:
          "https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/itineraries/pan-india/traversing-the-golden-triangle.html",
        notes: "Start in Delhi for Old Delhi, Connaught Place, India Gate, Humayun's Tomb, and an easy arrival day.",
      },
      {
        city: "Agra",
        country: "India",
        preferredDays: 3,
        minDays: 1,
        hotelName: "Hotel Atulyaa Taj",
        hotelNightlyCost: usd(28),
        hotelSource: "Expedia listed Hotel Atulyaa Taj from about $28/night; Booking showed similar May 2026 rates around $30/night.",
        hotelSourceUrl: "https://www.expedia.com/Agra-Hotels-Hotel-Atulyaa-Taj.h7835798.Hotel-Information",
        transportCost: 5500,
        transportSummary: "Reachable from Delhi by road/rail; use Agra as the Taj Mahal and Agra Fort stop before Jaipur.",
        transportSource: "Incredible India routes Delhi south to Agra, then west to Jaipur.",
        source: "Incredible India Golden Triangle route",
        sourceUrl:
          "https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/itineraries/pan-india/traversing-the-golden-triangle.html",
        notes: "Core heritage stop for the Taj Mahal, Agra Fort, and a compact Mughal-era sightseeing day.",
      },
      {
        city: "Jaipur",
        country: "India",
        preferredDays: 3,
        minDays: 2,
        hotelName: "Umaid Bhawan - A Heritage Style Boutique Hotel",
        hotelNightlyCost: usd(65),
        hotelSource: "Booking.com showed Umaid Bhawan around $65/night for a 3-night 2026 search before taxes.",
        hotelSourceUrl: "https://www.booking.com/hotel/in/umaid-bhawan.html",
        transportCost: 6500,
        transportSummary: "Reachable from Agra by the Golden Triangle road route; Jaipur works best as the final Rajasthan base.",
        transportSource: "Incredible India identifies Jaipur as the route endpoint.",
        source: "Incredible India Golden Triangle route",
        sourceUrl:
          "https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/itineraries/pan-india/traversing-the-golden-triangle.html",
        notes: "Finish in Jaipur for Amber Fort, City Palace, Hawa Mahal, markets, and a relaxed departure buffer.",
      },
    ],
  },
  {
    matches: ["japan city loop", "city loop", "tokyo kyoto osaka"],
    stops: [
      {
        city: "Tokyo",
        country: "Japan",
        preferredDays: 2,
        minDays: 2,
        hotelName: "NOHGA HOTEL UENO TOKYO",
        hotelNightlyCost: usd(197),
        hotelSource: "Expedia listed NOHGA HOTEL UENO TOKYO from about $197/night for a Jun 2026 search.",
        hotelSourceUrl: "https://www.expedia.com/Tokyo-Hotels-NOHGA-HOTEL-UENO-TOKYO.h27140689.Hotel-Information",
        transportCost: 4000,
        transportSummary: "Arrival/local transit base; Ueno keeps rail access simple for first-time Tokyo days.",
        transportSource: "JNTO Golden Route starts with Tokyo.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "Start in Tokyo for arrival logistics, Asakusa, Shibuya, food streets, and rail setup.",
      },
      {
        city: "Hakone",
        country: "Japan",
        preferredDays: 1,
        minDays: 1,
        hotelName: "Mount View Hakone",
        hotelNightlyCost: usd(203),
        hotelSource: "Booking.com showed Mount View Hakone around $203/night for 2 adults in Jun 2026, before local taxes.",
        hotelSourceUrl: "https://www.booking.com/hotel/jp/mount-view-hakone.html",
        transportCost: 6500,
        transportSummary: "Reachable from Tokyo by train/bus connections; useful as the Mt. Fuji and onsen pause before Kyoto.",
        transportSource: "JNTO Golden Route includes Hakone between Tokyo and Kyoto/Kansai.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "Add a slower onsen and Lake Ashi break between Tokyo and Kyoto before the long rail leg.",
      },
      {
        city: "Kyoto",
        country: "Japan",
        preferredDays: 2,
        minDays: 2,
        hotelName: "Hotel Resol Kyoto Kawaramachi Sanjo",
        hotelNightlyCost: usd(111),
        hotelSource: "Expedia listed Hotel Resol Kyoto Kawaramachi Sanjo from about $111/night in 2026; Booking showed Jun 2026 rates from JPY 19,473.",
        hotelSourceUrl: "https://www.expedia.com/Kyoto-Hotels-Hotel-Resol-Kyoto-Kawaramachi-Sanjo.h21926337.Hotel-Information",
        transportCost: 11200,
        transportSummary: "JR Central lists Tokyo-Kyoto Kodama packages from JPY 10,960 and about 3h40m; faster Shinkansen options also exist.",
        transportSource: "JR Central one-way Shinkansen package pricing and Kyoto route guidance.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "Use Kyoto as the culture anchor for temples, gardens, historic lanes, Nishiki Market, and Gion evenings.",
      },
      {
        city: "Nara",
        country: "Japan",
        preferredDays: 1,
        minDays: 1,
        hotelName: "Kyoto base day-trip style",
        hotelNightlyCost: 0,
        hotelSource: "JNTO positions Nara as part of the Kansai trio; use Kyoto or Osaka lodging for a light overnight-cost demo.",
        hotelSourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        transportCost: 2500,
        transportSummary: "Reachable from Kyoto/Osaka by regional rail; best as a compact heritage day.",
        transportSource: "JNTO Kansai Trio.",
        source: "JNTO Kansai Trio",
        sourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        notes: "A compact heritage stop for Nara Park, Todaiji Temple, and sacred-site walking.",
      },
      {
        city: "Osaka",
        country: "Japan",
        preferredDays: 2,
        minDays: 1,
        hotelName: "Hotel around Namba/Umeda",
        hotelNightlyCost: 12000,
        hotelSource: "Demo estimate kept conservative for central Osaka mid-range hotels; verify exact dates before booking.",
        hotelSourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        transportCost: 1800,
        transportSummary: "Reachable from Kyoto/Nara by frequent Kansai rail links; good final food and departure base.",
        transportSource: "JNTO Kansai Trio.",
        source: "JNTO Kansai Trio",
        sourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        notes: "Close with Osaka for Dotonbori, easy Kansai rail access, and a strong food-focused final leg.",
      },
    ],
  },
  {
    matches: ["tokyo", "kyoto", "japan"],
    stops: [
      {
        city: "Tokyo",
        country: "Japan",
        preferredDays: 2,
        minDays: 2,
        hotelName: "NOHGA HOTEL UENO TOKYO",
        hotelNightlyCost: usd(197),
        hotelSource: "Expedia listed NOHGA HOTEL UENO TOKYO from about $197/night for a Jun 2026 search.",
        hotelSourceUrl: "https://www.expedia.com/Tokyo-Hotels-NOHGA-HOTEL-UENO-TOKYO.h27140689.Hotel-Information",
        transportCost: 4000,
        transportSummary: "Arrival/local transit base; Ueno keeps rail access simple for first-time Tokyo days.",
        transportSource: "JNTO Golden Route starts with Tokyo.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "Start in Tokyo for arrival logistics, Asakusa, Shibuya, food streets, and rail setup.",
      },
      {
        city: "Hakone",
        country: "Japan",
        preferredDays: 2,
        minDays: 1,
        hotelName: "Mount View Hakone",
        hotelNightlyCost: usd(203),
        hotelSource: "Booking.com showed Mount View Hakone around $203/night for 2 adults in Jun 2026, before local taxes.",
        hotelSourceUrl: "https://www.booking.com/hotel/jp/mount-view-hakone.html",
        transportCost: 6500,
        transportSummary: "Reachable from Tokyo by train/bus connections; useful as the Mt. Fuji and onsen pause before Kyoto.",
        transportSource: "JNTO Golden Route includes Hakone between Tokyo and Kyoto/Kansai.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "A natural Tokyo-to-Kyoto pause for onsen stays, Hakone Shrine, and Lake Ashi views before continuing west.",
      },
      {
        city: "Kyoto",
        country: "Japan",
        preferredDays: 3,
        minDays: 2,
        hotelName: "Hotel Resol Kyoto Kawaramachi Sanjo",
        hotelNightlyCost: usd(111),
        hotelSource: "Expedia listed Hotel Resol Kyoto Kawaramachi Sanjo from about $111/night in 2026; Booking showed Jun 2026 rates from JPY 19,473.",
        hotelSourceUrl: "https://www.expedia.com/Kyoto-Hotels-Hotel-Resol-Kyoto-Kawaramachi-Sanjo.h21926337.Hotel-Information",
        transportCost: 11200,
        transportSummary: "JR Central lists Tokyo-Kyoto Kodama packages from JPY 10,960 and about 3h40m; faster Shinkansen options also exist.",
        transportSource: "JR Central one-way Shinkansen package pricing and Kyoto route guidance.",
        source: "JNTO Golden Route",
        sourceUrl: "https://www.japan.travel/en/gc/itineraries/long-plan/",
        notes: "Use Kyoto as the culture anchor for temples, gardens, historic lanes, Nishiki Market, and Gion evenings.",
      },
      {
        city: "Nara",
        country: "Japan",
        preferredDays: 1,
        minDays: 1,
        hotelName: "Kyoto base day-trip style",
        hotelNightlyCost: 0,
        hotelSource: "JNTO positions Nara as part of the Kansai trio; use Kyoto lodging for a light overnight-cost demo.",
        hotelSourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        transportCost: 2500,
        transportSummary: "Reachable from Kyoto/Osaka by regional rail; best as a compact heritage day.",
        transportSource: "JNTO Kansai Trio.",
        source: "JNTO Kansai Trio",
        sourceUrl: "https://www.japan.travel/en/itineraries/the-kansai-trio-kyoto-nara-and-osaka/",
        notes: "A practical Kyoto-side heritage extension for Nara Park, Todaiji Temple, and sacred-site walking.",
      },
    ],
  },
];

function inputDateToUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysToInput(date: string, days: number) {
  const value = inputDateToUtc(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function rangeDayCount(startDate: string, endDate: string) {
  return buildDateRange(startDate, endDate).length;
}

function keyFor(city: string, country: string) {
  return `${city},${country}`.toLowerCase();
}

function makeSlot(startDate: string, endDate: string): OpenDateSlot {
  return {
    id: `${startDate}_${endDate}`,
    start_date: startDate,
    end_date: endDate,
    dayCount: rangeDayCount(startDate, endDate),
  };
}

function mapsUrl(origin: string | undefined, destination: string) {
  const destinationQuery = encodeURIComponent(destination);
  if (!origin) return `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${destinationQuery}`;
}

function findRouteTemplates(tripName: string, tripDescription?: string | null) {
  const text = `${tripName} ${tripDescription ?? ""}`.toLowerCase();
  const route = ROUTES.find((candidate) => candidate.matches.some((match) => text.includes(match)));
  return route?.stops ?? [];
}

function allocateTemplateRanges(templates: StopTemplate[], tripStartDate: string, tripEndDate: string) {
  const tripDays = rangeDayCount(tripStartDate, tripEndDate);
  const allocations = templates.map((template) => Math.min(template.preferredDays, template.minDays));
  let remainingDays = Math.max(0, tripDays - allocations.reduce((sum, value) => sum + value, 0));

  while (remainingDays > 0) {
    const index = allocations.findIndex((value, candidateIndex) => value < templates[candidateIndex].preferredDays);
    if (index === -1) break;
    allocations[index] += 1;
    remainingDays -= 1;
  }

  let roundRobin = 0;
  while (remainingDays > 0 && templates.length) {
    allocations[roundRobin % templates.length] += 1;
    roundRobin += 1;
    remainingDays -= 1;
  }

  let cursor = tripStartDate;
  return templates.map((template, index) => {
    const days = Math.max(1, allocations[index] ?? 1);
    const startDate = cursor;
    const endDate = addDaysToInput(startDate, days - 1);
    cursor = addDaysToInput(endDate, 1);

    return {
      ...template,
      target_start_date: startDate,
      target_end_date: endDate > tripEndDate ? tripEndDate : endDate,
    };
  });
}

function rangeIsOpen(startDate: string, endDate: string, openSlots: OpenDateSlot[]) {
  return openSlots.some((slot) => startDate >= slot.start_date && endDate <= slot.end_date);
}

function chooseSlot(
  targetStartDate: string,
  targetEndDate: string,
  minDays: number,
  openSlots: OpenDateSlot[],
  preferredSlot?: OpenDateSlot,
) {
  if (preferredSlot) return preferredSlot;
  if (rangeIsOpen(targetStartDate, targetEndDate, openSlots)) return makeSlot(targetStartDate, targetEndDate);

  return openSlots.find((slot) => slot.dayCount >= minDays) ?? openSlots[0];
}

export function buildOpenSlots(tripStartDate: string, tripEndDate: string, existingStops: Stop[]) {
  const coveredDates = new Set<string>();

  existingStops.forEach((stop) => {
    buildDateRange(stop.start_date, stop.end_date).forEach((date) => {
      if (date >= tripStartDate && date <= tripEndDate) coveredDates.add(date);
    });
  });

  const slots: OpenDateSlot[] = [];
  let slotStart = "";
  let previousOpenDate = "";

  buildDateRange(tripStartDate, tripEndDate).forEach((date) => {
    if (!coveredDates.has(date)) {
      if (!slotStart) slotStart = date;
      previousOpenDate = date;
      return;
    }

    if (slotStart) {
      slots.push(makeSlot(slotStart, previousOpenDate));
      slotStart = "";
      previousOpenDate = "";
    }
  });

  if (slotStart) slots.push(makeSlot(slotStart, previousOpenDate));
  return slots;
}

export function buildTimelineItems(tripStartDate: string, tripEndDate: string, existingStops: Stop[]) {
  const sortedStops = [...existingStops].sort((a, b) => {
    const dateCompare = a.start_date.localeCompare(b.start_date);
    if (dateCompare !== 0) return dateCompare;
    return a.sort_order - b.sort_order;
  });
  const items: TimelineItem[] = [];
  let cursor = tripStartDate;

  sortedStops.forEach((stop) => {
    if (cursor < stop.start_date) {
      items.push({ type: "slot", slot: makeSlot(cursor, addDaysToInput(stop.start_date, -1)) });
    }

    items.push({ type: "stop", stop });
    if (cursor <= stop.end_date) cursor = addDaysToInput(stop.end_date, 1);
  });

  if (cursor <= tripEndDate) {
    items.push({ type: "slot", slot: makeSlot(cursor, tripEndDate) });
  }

  return items;
}

export function buildStopSuggestions({
  tripName,
  tripDescription,
  tripStartDate,
  tripEndDate,
  existingStops,
  preferredSlot,
}: BuildStopSuggestionsInput) {
  const templates = findRouteTemplates(tripName, tripDescription);
  const openSlots = buildOpenSlots(tripStartDate, tripEndDate, existingStops);
  const existingByCity = new Map(existingStops.map((stop) => [keyFor(stop.city, stop.country), stop]));
  const allocatedTemplates = allocateTemplateRanges(templates, tripStartDate, tripEndDate);

  return allocatedTemplates.map((template, index) => {
    const existingStop = existingByCity.get(keyFor(template.city, template.country));
    const chosenSlot = existingStop
      ? makeSlot(existingStop.start_date, existingStop.end_date)
      : chooseSlot(template.target_start_date, template.target_end_date, template.minDays, openSlots, preferredSlot);
    const disabledReason = !existingStop && !chosenSlot
      ? "No open dates are available in this trip."
      : !existingStop && chosenSlot && chosenSlot.dayCount < template.minDays
        ? `Needs at least ${template.minDays} day${template.minDays === 1 ? "" : "s"}, but this slot has ${chosenSlot.dayCount}.`
        : undefined;
    const startDate = existingStop?.start_date ?? chosenSlot?.start_date ?? template.target_start_date;
    const endDate = existingStop?.end_date ?? chosenSlot?.end_date ?? template.target_end_date;
    const stopDays = rangeDayCount(startDate, endDate);
    const previousTemplate = allocatedTemplates[index - 1];

    return {
      city: template.city,
      country: template.country,
      start_date: startDate,
      end_date: endDate,
      stay_cost: template.hotelNightlyCost * stopDays,
      transport_cost: template.transportCost,
      notes: `${template.notes}\n\nStay: ${template.hotelName}, estimate INR ${template.hotelNightlyCost.toLocaleString("en-IN")}/night. ${template.hotelSource}\n\nReachability: ${template.transportSummary}`,
      source: template.source,
      sourceUrl: template.sourceUrl,
      routeOrder: index + 1,
      alreadyAdded: Boolean(existingStop),
      disabledReason,
      hotelName: template.hotelName,
      hotelNightlyCost: template.hotelNightlyCost,
      hotelSource: template.hotelSource,
      hotelSourceUrl: template.hotelSourceUrl,
      transportSummary: template.transportSummary,
      transportSource: template.transportSource,
      mapsUrl: mapsUrl(
        previousTemplate ? `${previousTemplate.city}, ${previousTemplate.country}` : undefined,
        `${template.city}, ${template.country}`,
      ),
      slot: chosenSlot,
    } satisfies StopSuggestion;
  });
}
