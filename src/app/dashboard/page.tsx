"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
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

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [email, setEmail] = useState("");
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
        router.replace("/login");
        return;
      }
      setEmail(data.user.email ?? "");
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
        <section className="flex flex-col justify-between gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-stone-500">Welcome{email ? `, ${email}` : ""}</p>
            <h1 className="mt-1 text-3xl font-semibold text-stone-950">Plan your next city loop</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Build a multi-city itinerary with stops, activity templates, budget tracking, and a public share page.
            </p>
          </div>
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
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-stone-950">My trips</h2>
              <span className="text-sm text-stone-500">{trips.length} total</span>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="h-56 animate-pulse rounded-lg bg-stone-200" />
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
                  <MapPin className="h-10 w-10 text-teal-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-stone-950">No trips yet</h3>
                    <p className="mt-1 text-sm text-stone-500">Create a fresh trip or generate the demo Japan loop.</p>
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
                <div key={city.city} className="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-2">
                  <Image
                    alt={`${city.city}, ${city.country}`}
                    className="h-20 w-24 rounded-md object-cover"
                    height={160}
                    src={city.imageUrl}
                    width={192}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-stone-950">{city.city}</p>
                    <p className="text-xs text-stone-500">{city.country} · {city.costIndex}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-stone-600">{city.description}</p>
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
