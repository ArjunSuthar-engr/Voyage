"use client";

import { ArrowRight, CalendarDays, IndianRupee, MapPin, PencilLine, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { EnvCallout } from "@/components/setup/env-callout";
import { Button } from "@/components/ui/button";
import { addDays, toInputDate } from "@/lib/dates";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createTrip } from "@/lib/trips";
import type { TripInput } from "@/lib/types";

const plannerStyleOptions = [
  "Food, stays, transit, activities",
  "Culture, museums, neighborhoods",
  "Budget saver route",
  "Premium stays and private transfers",
  "Family friendly pacing",
];

const destinationOptions = [
  {
    title: "Tokyo To Kyoto",
    budgetAmount: 95000,
    budgetLabel: "From ₹95k",
    description:
      "A rail-first Japan route with Tokyo food neighborhoods, a Hakone hot spring pause, Kyoto temple days, and an Osaka street-food finish. Balance efficient transit with relaxed mornings, luggage-friendly transfers, and one or two anchor activities per city.",
  },
  {
    title: "Lisbon Coast",
    budgetAmount: 90000,
    budgetLabel: "From ₹90k",
    description:
      "A coastal Portugal itinerary built around Lisbon neighborhoods, Sintra viewpoints, seafood meals, and easy train or rideshare transfers. Keep the pace flexible with scenic day trips, late dinners, and time for viewpoints, tiled streets, and waterfront walks.",
  },
  {
    title: "Barcelona City Break",
    budgetAmount: 65000,
    budgetLabel: "From ₹65k",
    description:
      "A compact Barcelona plan focused on Gaudi architecture, food markets, beach time, museums, and a Montserrat day trip. Prioritize timed-entry sights, walkable neighborhoods, and evenings for tapas, rooftops, and relaxed city wandering.",
  },
  {
    title: "Golden Triangle",
    budgetAmount: 24000,
    budgetLabel: "From ₹24k",
    description:
      "A classic Delhi, Agra, and Jaipur route with monument entries, local food, guided history stops, and practical intercity transport. Build in early starts for major sights, buffer time for transfers, and a mix of markets, forts, museums, and regional meals.",
  },
  {
    title: "Alpine Rail Loop",
    budgetAmount: 190000,
    budgetLabel: "From ₹1.9L",
    description:
      "A scenic rail loop through Zurich, Lucerne, Interlaken, and Milan with alpine viewpoints, lake towns, and comfortable train connections. Leave room for weather-dependent mountain days, slower cafe stops, and one premium experience such as a panoramic rail segment or spa stay.",
  },
  {
    title: "New York Weekend",
    budgetAmount: 140000,
    budgetLabel: "From ₹1.4L",
    description:
      "A high-energy New York weekend covering Manhattan, Brooklyn, and Queens through museums, food stops, subway rides, and skyline views. Group activities by neighborhood to reduce transit time while preserving space for reservations, shows, shopping, and late-night city walks.",
  },
];

export default function NewTripPage() {
  const router = useRouter();
  const defaultStart = toInputDate(addDays(new Date(), 21));
  const defaultEnd = toInputDate(addDays(new Date(), 28));
  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState(destinationOptions[0]?.title ?? "");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [tripStyle, setTripStyle] = useState(plannerStyleOptions[0]);
  const [description, setDescription] = useState(destinationOptions[0]?.description ?? "");
  const [budgetAmount, setBudgetAmount] = useState(destinationOptions[0]?.budgetAmount ?? 0);
  const [saving, setSaving] = useState(false);

  const selectedDestination = useMemo(
    () => destinationOptions.find((option) => option.title === destination) ?? destinationOptions[0],
    [destination],
  );

  useEffect(() => {
    function readInitialTripValues() {
      const params = new URLSearchParams(window.location.search);
      const requestedDestination = params.get("destination")?.trim();
      const requestedStyle = params.get("style")?.trim();
      const requestedStart = params.get("start") ?? "";
      const requestedEnd = params.get("end") ?? "";
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const matchingDestination = destinationOptions.find((option) => option.title === requestedDestination);

      if (matchingDestination) {
        setDestination(matchingDestination.title);
        setDescription(matchingDestination.description);
        setBudgetAmount(matchingDestination.budgetAmount);
      }

      if (requestedStyle && plannerStyleOptions.includes(requestedStyle)) {
        setTripStyle(requestedStyle);
      }

      if (datePattern.test(requestedStart)) setStartDate(requestedStart);
      if (datePattern.test(requestedEnd)) setEndDate(requestedEnd);
    }

    async function guard() {
      readInitialTripValues();

      if (!isSupabaseConfigured) {
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const currentPath = `/trips/new${window.location.search}`;
        router.replace(`/?auth=login&next=${encodeURIComponent(currentPath)}`);
      } else {
        setReady(true);
      }
    }

    guard();
  }, [router]);

  function handleDestinationChange(value: string) {
    const option = destinationOptions.find((destinationOption) => destinationOption.title === value);
    setDestination(value);
    if (option) {
      setDescription(option.description);
      setBudgetAmount(option.budgetAmount);
    }
  }

  async function handleCreateTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (!selectedDestination) {
      toast.error("Choose a destination");
      return;
    }

    if (!Number.isFinite(budgetAmount) || budgetAmount <= 0) {
      toast.error("Enter a valid budget");
      return;
    }

    const input: TripInput = {
      name: destination,
      description: description.trim() || `${tripStyle} route for ${destination}.`,
      start_date: startDate,
      end_date: endDate,
      budget_amount: Math.round(budgetAmount),
      currency: "INR",
    };

    setSaving(true);
    try {
      const trip = await createTrip(input);
      toast.success("Trip created. Add your first stop.");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create trip");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!isSupabaseConfigured ? <EnvCallout /> : null}

        <section className="mb-7">
          <p className="text-xs font-semibold uppercase text-white/42">New itinerary</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold italic leading-none text-white sm:text-6xl">Plan a new trip</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
            Choose the route, dates, style, and a short description. Stops and activities come next.
          </p>
        </section>

        <form className="border border-white/12 bg-slate-950/58 p-4 shadow-2xl backdrop-blur-md sm:p-5" onSubmit={handleCreateTrip}>
          {ready ? (
            <div className="grid gap-5">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_1.1fr_1.25fr_0.8fr_auto] lg:items-end">
                <div className="border-b border-white/20 pb-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55" htmlFor="trip-destination">
                    <MapPin className="h-3.5 w-3.5" />
                    Destination
                  </label>
                  <select
                    id="trip-destination"
                    className="w-full cursor-pointer bg-transparent pr-8 text-sm font-medium text-white outline-none [color-scheme:dark]"
                    required
                    value={destination}
                    onChange={(event) => handleDestinationChange(event.target.value)}
                  >
                    {destinationOptions.map((option) => (
                      <option key={option.title} className="bg-slate-950 text-white" value={option.title}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-b border-white/20 pb-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Dates
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      aria-label="Start date"
                      className="min-w-0 bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                      min={toInputDate(new Date())}
                      required
                      type="date"
                      value={startDate}
                      onChange={(event) => {
                        const nextStart = event.target.value;
                        setStartDate(nextStart);
                        if (endDate < nextStart) setEndDate(toInputDate(addDays(new Date(`${nextStart}T00:00:00`), 7)));
                      }}
                    />
                    <input
                      aria-label="End date"
                      className="min-w-0 bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                      min={startDate || toInputDate(new Date())}
                      required
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>

                <div className="border-b border-white/20 pb-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55" htmlFor="trip-style">
                    <Users className="h-3.5 w-3.5" />
                    Style
                  </label>
                  <select
                    id="trip-style"
                    className="w-full cursor-pointer bg-transparent pr-8 text-sm font-medium text-white outline-none [color-scheme:dark]"
                    value={tripStyle}
                    onChange={(event) => setTripStyle(event.target.value)}
                  >
                    {plannerStyleOptions.map((option) => (
                      <option key={option} className="bg-slate-950 text-white" value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-b border-white/20 pb-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Budget
                  </p>
                  <input
                    aria-label="Trip budget"
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/38 [color-scheme:dark]"
                    inputMode="numeric"
                    min={1}
                    required
                    type="number"
                    value={budgetAmount || ""}
                    onChange={(event) => setBudgetAmount(event.target.valueAsNumber || 0)}
                  />
                </div>

                <Button className="h-12 px-6" disabled={saving || !destination.trim()} type="submit">
                  {saving ? "Creating..." : "Create Trip"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-b border-white/20 pb-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55" htmlFor="trip-description">
                  <PencilLine className="h-3.5 w-3.5" />
                  Description
                </label>
                <textarea
                  id="trip-description"
                  className="min-h-20 w-full resize-none bg-transparent text-sm font-medium leading-6 text-white outline-none placeholder:text-white/38"
                  placeholder="Add what this trip should optimize for."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/50">Loading...</p>
          )}
        </form>
      </div>
    </AppShell>
  );
}
