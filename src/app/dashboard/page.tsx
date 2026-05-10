"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHero } from "@/components/layout/page-hero";
import { EnvCallout } from "@/components/setup/env-callout";
import { TripForm } from "@/components/trips/trip-form";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { recommendedCities } from "@/lib/demo-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createDemoTrip, deleteTrip, getTrips, updateTrip } from "@/lib/trips";
import type { Trip, TripInput } from "@/lib/types";
import { getUserDisplayName } from "@/lib/user";

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  async function loadTrips() {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load trips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function guard() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/?auth=login&next=/dashboard");
        return;
      }
      setDisplayName(getUserDisplayName(data.user));
      await loadTrips();
    }

    guard();
  }, [router]);

  async function handleCreateDemo() {
    setDemoLoading(true);
    try {
      const trip = await createDemoTrip();
      toast.success("Demo trip created");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create demo trip");
    } finally {
      setDemoLoading(false);
    }
  }

  async function handleUpdateTrip(input: TripInput) {
    if (!editingTrip) return;
    try {
      await updateTrip(editingTrip.id, input);
      setEditingTrip(null);
      toast.success("Trip updated");
      await loadTrips();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update trip");
    }
  }

  async function handleDeleteTrip(trip: Trip) {
    if (!window.confirm(`Delete "${trip.name}" and all stops/activities?`)) return;
    try {
      await deleteTrip(trip.id);
      toast.success("Trip deleted");
      await loadTrips();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete trip");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {!isSupabaseConfigured ? <EnvCallout /> : null}
        <PageHero
          eyebrow={displayName ? `Welcome, ${displayName}` : "Voyage workspace"}
          imageUrl="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85"
          title="Plan your next city loop"
          description="Build a multi-city itinerary with stops, activity templates, budget tracking, and a public share page."
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button disabled={!isSupabaseConfigured || demoLoading} type="button" variant="secondary" onClick={handleCreateDemo}>
              <Sparkles className="h-4 w-4" />
              {demoLoading ? "Creating..." : "Create demo trip"}
            </Button>
            <Button disabled={!isSupabaseConfigured} type="button" onClick={() => router.push("/trips/new")}>
              <Plus className="h-4 w-4" />
              Plan new trip
            </Button>
          </div>
        </PageHero>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase text-white/40">Saved routes</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold text-white">My trips</h2>
              </div>
              <span className="text-sm text-white/50">{trips.length} total</span>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="h-56 animate-pulse rounded-none bg-white/12" />
                ))}
              </div>
            ) : trips.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onEdit={() => setEditingTrip(trip)} onDelete={() => handleDeleteTrip(trip)} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <MapPin className="h-10 w-10 text-teal-200" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">No trips yet</h3>
                    <p className="mt-1 text-sm text-white/50">Create a fresh trip or generate the demo Japan loop.</p>
                  </div>
                  <Button disabled={!isSupabaseConfigured} onClick={() => router.push("/trips/new")}>
                    Start planning
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended cities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedCities.map((city) => (
                <div key={city.city} className="overflow-hidden border border-white/10 bg-[#181b20]">
                  <Image
                    alt={`${city.city}, ${city.country}`}
                    className="h-32 w-full object-cover"
                    height={160}
                    src={city.imageUrl}
                    width={384}
                  />
                  <div className="min-w-0 p-3">
                    <p className="font-serif text-xl font-semibold text-white">{city.city}</p>
                    <p className="text-xs text-white/50">{city.country} · {city.costIndex}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">{city.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <Modal open={Boolean(editingTrip)} title="Edit trip" description="Update the trip summary used across dashboard and sharing." onClose={() => setEditingTrip(null)}>
        {editingTrip ? <TripForm initialTrip={editingTrip} submitLabel="Save changes" onSubmit={handleUpdateTrip} /> : null}
      </Modal>
    </AppShell>
  );
}
