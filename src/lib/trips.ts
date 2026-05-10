import { addDays, toInputDate } from "@/lib/dates";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Activity, ActivityInput, Stop, StopInput, Trip, TripInput, TripWithStops } from "@/lib/types";

async function requireUserId() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You need to sign in first.");
  return data.user.id;
}

function attachActivities(stops: Stop[], activities: Activity[]) {
  return stops.map((stop) => ({
    ...stop,
    activities: activities
      .filter((activity) => activity.stop_id === stop.id)
      .sort((a, b) => `${a.activity_date}${a.start_time ?? ""}`.localeCompare(`${b.activity_date}${b.start_time ?? ""}`)),
  }));
}

export async function getTrips() {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Trip[];
}

export async function createTrip(input: TripInput) {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      owner_id: ownerId,
      name: input.name,
      description: input.description || null,
      start_date: input.start_date,
      end_date: input.end_date,
      budget_amount: input.budget_amount,
      currency: "INR",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Trip;
}

export async function updateTrip(tripId: string, input: TripInput) {
  await requireUserId();
  const { data, error } = await supabase
    .from("trips")
    .update({
      name: input.name,
      description: input.description || null,
      start_date: input.start_date,
      end_date: input.end_date,
      budget_amount: input.budget_amount,
      currency: "INR",
    })
    .eq("id", tripId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Trip;
}

export async function deleteTrip(tripId: string) {
  await requireUserId();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw error;
}

export async function getTripWithStops(tripId: string) {
  await requireUserId();
  return loadTripWithStops("id", tripId);
}

export async function getPublicTripWithStops(publicSlug: string) {
  assertSupabaseConfigured();
  return loadTripWithStops("public_slug", publicSlug, true);
}

async function loadTripWithStops(column: "id" | "public_slug", value: string, publicOnly = false) {
  let tripQuery = supabase.from("trips").select("*").eq(column, value);
  if (publicOnly) tripQuery = tripQuery.eq("is_public", true);

  const { data: trip, error: tripError } = await tripQuery.single();
  if (tripError) throw tripError;

  const { data: stops, error: stopsError } = await supabase
    .from("stops")
    .select("*")
    .eq("trip_id", trip.id)
    .order("sort_order", { ascending: true });
  if (stopsError) throw stopsError;

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", trip.id)
    .order("activity_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (activitiesError) throw activitiesError;

  return {
    ...(trip as Trip),
    stops: attachActivities((stops ?? []) as Stop[], (activities ?? []) as Activity[]),
  } satisfies TripWithStops;
}

export async function createStop(input: StopInput) {
  await requireUserId();
  const { data, error } = await supabase.from("stops").insert(input).select("*").single();
  if (error) throw error;
  return data as Stop;
}

export async function updateStop(stopId: string, input: StopInput) {
  await requireUserId();
  const { data, error } = await supabase
    .from("stops")
    .update({
      city: input.city,
      country: input.country,
      start_date: input.start_date,
      end_date: input.end_date,
      stay_cost: input.stay_cost,
      transport_cost: input.transport_cost,
      notes: input.notes || null,
      sort_order: input.sort_order,
    })
    .eq("id", stopId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Stop;
}

export async function deleteStop(stopId: string) {
  await requireUserId();
  const { error } = await supabase.from("stops").delete().eq("id", stopId);
  if (error) throw error;
}

export async function createActivity(input: ActivityInput) {
  await requireUserId();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      ...input,
      start_time: input.start_time || null,
      duration_minutes: input.duration_minutes || null,
      notes: input.notes || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Activity;
}

export async function updateActivity(activityId: string, input: ActivityInput) {
  await requireUserId();
  const { data, error } = await supabase
    .from("activities")
    .update({
      stop_id: input.stop_id,
      activity_date: input.activity_date,
      title: input.title,
      category: input.category,
      start_time: input.start_time || null,
      duration_minutes: input.duration_minutes || null,
      cost: input.cost,
      notes: input.notes || null,
    })
    .eq("id", activityId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(activityId: string) {
  await requireUserId();
  const { error } = await supabase.from("activities").delete().eq("id", activityId);
  if (error) throw error;
}

export async function setTripPublic(tripId: string, isPublic: boolean) {
  await requireUserId();
  const { data, error } = await supabase
    .from("trips")
    .update({ is_public: isPublic })
    .eq("id", tripId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Trip;
}

export async function createDemoTrip() {
  const start = addDays(new Date(), 21);
  const tokyoStart = toInputDate(start);
  const tokyoEnd = toInputDate(addDays(start, 2));
  const kyotoStart = toInputDate(addDays(start, 3));
  const kyotoEnd = toInputDate(addDays(start, 5));
  const osakaStart = toInputDate(addDays(start, 6));
  const osakaEnd = toInputDate(addDays(start, 7));

  const trip = await createTrip({
    name: "Japan City Loop",
    description: "A polished demo itinerary through Tokyo, Kyoto, and Osaka with transport, stays, food, and sightseeing.",
    start_date: tokyoStart,
    end_date: osakaEnd,
    budget_amount: 350000,
    currency: "INR",
  });

  const { data: stops, error: stopError } = await supabase
    .from("stops")
    .insert([
      {
        trip_id: trip.id,
        city: "Tokyo",
        country: "Japan",
        start_date: tokyoStart,
        end_date: tokyoEnd,
        stay_cost: 52000,
        transport_cost: 15000,
        sort_order: 1,
        notes: "Use Tokyo as the arrival base and keep the first evening flexible.",
      },
      {
        trip_id: trip.id,
        city: "Kyoto",
        country: "Japan",
        start_date: kyotoStart,
        end_date: kyotoEnd,
        stay_cost: 45000,
        transport_cost: 11000,
        sort_order: 2,
        notes: "Group temples by neighborhood to keep days calm.",
      },
      {
        trip_id: trip.id,
        city: "Osaka",
        country: "Japan",
        start_date: osakaStart,
        end_date: osakaEnd,
        stay_cost: 30000,
        transport_cost: 7500,
        sort_order: 3,
        notes: "End with food markets and a relaxed departure morning.",
      },
    ])
    .select("*")
    .order("sort_order", { ascending: true });

  if (stopError) throw stopError;
  const [tokyo, kyoto, osaka] = (stops ?? []) as Stop[];

  const { error: activityError } = await supabase.from("activities").insert([
    {
      trip_id: trip.id,
      stop_id: tokyo.id,
      activity_date: tokyoStart,
      title: "Arrival flight and rail transfer",
      category: "flight",
      start_time: "09:30",
      duration_minutes: 180,
      cost: 77000,
      notes: "Keep luggage storage and transit card pickup in the same block.",
    },
    {
      trip_id: trip.id,
      stop_id: tokyo.id,
      activity_date: toInputDate(addDays(start, 1)),
      title: "Shibuya and Harajuku food walk",
      category: "food",
      start_time: "17:30",
      duration_minutes: 150,
      cost: 9200,
      notes: "Good demo item for food, cost, and time planning.",
    },
    {
      trip_id: trip.id,
      stop_id: kyoto.id,
      activity_date: kyotoStart,
      title: "Shinkansen to Kyoto",
      category: "transport",
      start_time: "10:00",
      duration_minutes: 140,
      cost: 9600,
      notes: "Use this to show transport in the category breakdown.",
    },
    {
      trip_id: trip.id,
      stop_id: kyoto.id,
      activity_date: toInputDate(addDays(start, 4)),
      title: "Arashiyama and temple route",
      category: "activity",
      start_time: "08:30",
      duration_minutes: 240,
      cost: 5400,
      notes: "Start early and keep lunch flexible.",
    },
    {
      trip_id: trip.id,
      stop_id: osaka.id,
      activity_date: osakaStart,
      title: "Dotonbori dinner crawl",
      category: "food",
      start_time: "18:00",
      duration_minutes: 180,
      cost: 7900,
      notes: "A strong final-night story moment for the public itinerary.",
    },
  ]);

  if (activityError) throw activityError;
  return trip;
}
