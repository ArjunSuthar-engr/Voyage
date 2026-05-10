"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHero } from "@/components/layout/page-hero";
import { EnvCallout } from "@/components/setup/env-callout";
import { TripForm } from "@/components/trips/trip-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createTrip } from "@/lib/trips";
import type { TripInput } from "@/lib/types";

export default function NewTripPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function guard() {
      if (!isSupabaseConfigured) {
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.replace("/?auth=login&next=/trips/new");
      else setReady(true);
    }

    guard();
  }, [router]);

  async function handleCreateTrip(input: TripInput) {
    try {
      const trip = await createTrip(input);
      toast.success("Trip created. Add your first stop.");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create trip");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        {!isSupabaseConfigured ? <EnvCallout /> : null}
        <PageHero
          eyebrow="New itinerary"
          imageUrl="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85"
          title="Start with the shape of the trip"
          description="Name the journey, set the dates, and define the budget. Cities and activities come next."
        />
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Plan a new trip</CardTitle>
            <p className="text-sm text-white/50">Start with the trip shell. Cities and activities come next.</p>
          </CardHeader>
          <CardContent>{ready ? <TripForm submitLabel="Create trip" onSubmit={handleCreateTrip} /> : <p className="text-sm text-white/50">Loading...</p>}</CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
