"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Map, MapPin } from "lucide-react";

import { ActivityCard } from "@/components/trips/activity-card";
import { BudgetSummary } from "@/components/trips/budget-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayDateRange } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getPublicTripWithStops } from "@/lib/trips";
import type { TripWithStops } from "@/lib/types";

export default function PublicSharePage() {
  const params = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<TripWithStops | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPublicTripWithStops(params.slug);
        setTrip(data);
      } catch {
        setTrip(null);
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 p-4">
        <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-lg bg-stone-200" />
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Map className="mx-auto h-10 w-10 text-stone-400" />
            <h1 className="mt-4 text-xl font-semibold text-stone-950">Itinerary unavailable</h1>
            <p className="mt-2 text-sm text-stone-500">This trip is private, deleted, or the share link is incorrect.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold text-stone-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
              <Map className="h-4 w-4" />
            </span>
            Voyage
          </div>
          <Badge className="border-teal-200 bg-teal-50 text-teal-700">Public itinerary</Badge>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{trip.stops.length} stops</Badge>
              <Badge>{displayDateRange(trip.start_date, trip.end_date)}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-stone-950">{trip.name}</h1>
            {trip.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{trip.description}</p> : null}
          </section>
          {trip.stops.map((stop, index) => (
            <Card key={stop.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Stop {index + 1}</Badge>
                  <Badge>{displayDateRange(stop.start_date, stop.end_date)}</Badge>
                </div>
                <CardTitle className="mt-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-700" />
                  {stop.city}, {stop.country}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stop.notes ? <p className="text-sm text-stone-600">{stop.notes}</p> : null}
                {(stop.activities ?? []).length ? (
                  (stop.activities ?? []).map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} currency={trip.currency} readOnly />
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No public activities listed for this stop yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <aside className="space-y-4">
          <BudgetSummary trip={trip} />
          <Card>
            <CardContent className="flex items-center gap-3 p-4 text-sm text-stone-600">
              <CalendarDays className="h-5 w-5 text-teal-700" />
              Shared as a read-only plan.
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
