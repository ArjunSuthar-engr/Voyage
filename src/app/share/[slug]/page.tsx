"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Map, MapPin } from "lucide-react";

import { PageHero } from "@/components/layout/page-hero";
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
      <main className="min-h-screen bg-[#14171b] p-4 text-white">
        <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-none bg-white/12" />
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#14171b] p-4 text-white">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Map className="mx-auto h-10 w-10 text-white/40" />
            <h1 className="mt-4 text-xl font-semibold text-white">Itinerary unavailable</h1>
            <p className="mt-2 text-sm text-white/50">This trip is private, deleted, or the share link is incorrect.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#14171b] text-white">
      <header className="border-b border-white/10 bg-[#101216]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 text-xs font-semibold uppercase text-white/72">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center bg-white text-slate-950">
              <Map className="h-4 w-4" />
            </span>
            <span className="font-serif text-2xl font-semibold italic normal-case text-white">Voyage</span>
          </Link>
          <Badge className="border-teal-300/30 bg-teal-400/12 text-teal-100">Public itinerary</Badge>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <PageHero
            eyebrow={`${trip.stops.length} stops · ${displayDateRange(trip.start_date, trip.end_date)}`}
            imageUrl="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1800&q=85"
            title={trip.name}
            description={trip.description ?? "A shared read-only itinerary from Voyage."}
          />
          {trip.stops.map((stop, index) => (
            <Card key={stop.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Stop {index + 1}</Badge>
                  <Badge>{displayDateRange(stop.start_date, stop.end_date)}</Badge>
                </div>
                <CardTitle className="mt-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-200" />
                  {stop.city}, {stop.country}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stop.notes ? <p className="text-sm text-white/60">{stop.notes}</p> : null}
                {(stop.activities ?? []).length ? (
                  (stop.activities ?? []).map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} currency={trip.currency} readOnly />
                  ))
                ) : (
                  <p className="text-sm text-white/50">No public activities listed for this stop yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <aside className="space-y-4">
          <BudgetSummary trip={trip} />
          <Card>
            <CardContent className="flex items-center gap-3 p-4 text-sm text-white/60">
              <CalendarDays className="h-5 w-5 text-teal-200" />
              Shared as a read-only plan.
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
