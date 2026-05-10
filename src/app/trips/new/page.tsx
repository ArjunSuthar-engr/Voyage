"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
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
      if (!data.user) router.replace("/login");
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
      <div className="mx-auto max-w-3xl space-y-4">
        {!isSupabaseConfigured ? <EnvCallout /> : null}
        <Card>
          <CardHeader>
            <CardTitle>Plan a new trip</CardTitle>
            <p className="text-sm text-stone-500">Start with the trip shell. Cities and activities come next.</p>
          </CardHeader>
          <CardContent>{ready ? <TripForm submitLabel="Create trip" onSubmit={handleCreateTrip} /> : <p className="text-sm text-stone-500">Loading...</p>}</CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
