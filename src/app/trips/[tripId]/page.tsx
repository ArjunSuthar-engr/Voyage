"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Edit2, List, MapPin, Plus, Route, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHero } from "@/components/layout/page-hero";
import { ActivityCard } from "@/components/trips/activity-card";
import { ActivityForm } from "@/components/trips/activity-form";
import { BudgetSummary } from "@/components/trips/budget-summary";
import { ShareControls } from "@/components/trips/share-controls";
import { StopForm } from "@/components/trips/stop-form";
import { TripForm } from "@/components/trips/trip-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { buildDateRange, dayCount, displayDate, displayDateRange } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { buildTimelineItems, type OpenDateSlot } from "@/lib/stop-suggestions";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  createActivity,
  createStop,
  deleteActivity,
  deleteStop,
  deleteTrip,
  getTripWithStops,
  getTrips,
  setTripPublic,
  updateActivity,
  updateStop,
  updateTrip,
} from "@/lib/trips";
import type { Activity, ActivityInput, Stop, StopInput, Trip, TripInput, TripWithStops } from "@/lib/types";

type ActivityModalState = {
  stop: Stop;
  activity?: Activity;
} | null;

export default function TripDetailPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripWithStops | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | undefined>();
  const [stopDraftSlot, setStopDraftSlot] = useState<OpenDateSlot | undefined>();
  const [activityModal, setActivityModal] = useState<ActivityModalState>(null);
  const [tripSettingsOpen, setTripSettingsOpen] = useState(false);

  const loadTrip = useCallback(async () => {
    try {
      const [data, trips] = await Promise.all([getTripWithStops(params.tripId), getTrips()]);
      setTrip(data);
      setAllTrips(trips);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load trip");
      router.replace("/trips");
    } finally {
      setLoading(false);
    }
  }, [params.tripId, router]);

  useEffect(() => {
    async function guard() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace(`/?auth=login&next=/trips/${params.tripId}`);
        return;
      }
      await loadTrip();
    }

    guard();
  }, [loadTrip, params.tripId, router]);

  const listActivities = useMemo(() => {
    if (!trip) return [];
    return trip.stops
      .flatMap((stop) => (stop.activities ?? []).map((activity) => ({ activity, stop })))
      .sort((a, b) => `${a.activity.activity_date}${a.activity.start_time ?? ""}`.localeCompare(`${b.activity.activity_date}${b.activity.start_time ?? ""}`));
  }, [trip]);
  const timelineItems = useMemo(() => (trip ? buildTimelineItems(trip.start_date, trip.end_date, trip.stops) : []), [trip]);
  const stopOrderById = useMemo(() => {
    const order = new Map<string, number>();
    let stopNumber = 1;

    timelineItems.forEach((item) => {
      if (item.type !== "stop") return;
      order.set(item.stop.id, stopNumber);
      stopNumber += 1;
    });

    return order;
  }, [timelineItems]);

  function openStopModal(slot?: OpenDateSlot) {
    setEditingStop(undefined);
    setStopDraftSlot(slot);
    setStopModalOpen(true);
  }

  async function handleSaveTrip(input: TripInput) {
    if (!trip) return;
    try {
      await updateTrip(trip.id, input);
      setTripSettingsOpen(false);
      toast.success("Trip updated");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update trip");
    }
  }

  async function handleSaveStop(input: StopInput) {
    try {
      if (editingStop) await updateStop(editingStop.id, input);
      else await createStop(input);
      setStopModalOpen(false);
      setEditingStop(undefined);
      setStopDraftSlot(undefined);
      toast.success(editingStop ? "Stop updated" : "Stop added");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save stop");
    }
  }

  async function handleDeleteStop(stop: Stop) {
    if (!window.confirm(`Delete ${stop.city} and its activities?`)) return;
    try {
      await deleteStop(stop.id);
      toast.success("Stop deleted");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete stop");
    }
  }

  async function handleSaveActivity(input: ActivityInput) {
    try {
      if (activityModal?.activity) await updateActivity(activityModal.activity.id, input);
      else await createActivity(input);
      setActivityModal(null);
      toast.success(activityModal?.activity ? "Activity updated" : "Activity added");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save activity");
    }
  }

  async function handleDeleteActivity(activity: Activity) {
    if (!window.confirm(`Delete "${activity.title}"?`)) return;
    try {
      await deleteActivity(activity.id);
      toast.success("Activity deleted");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete activity");
    }
  }

  async function handleDeleteTrip() {
    if (!trip) return;
    if (!window.confirm(`Delete "${trip.name}" and all stops/activities?`)) return;
    try {
      await deleteTrip(trip.id);
      toast.success("Trip deleted");
      router.replace("/trips");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete trip");
    }
  }

  async function handleTogglePublic(isPublic: boolean) {
    if (!trip) return;
    try {
      await setTripPublic(trip.id, isPublic);
      toast.success(isPublic ? "Trip is public" : "Trip is private");
      await loadTrip();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update sharing");
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="h-80 animate-pulse rounded-none bg-white/12" />
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell>
        <Card>
          <CardContent className="p-8 text-sm text-white/50">Trip unavailable.</CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell currentTripId={trip.id} trips={allTrips}>
      <div className="space-y-6">
        <PageHero
          eyebrow={`${trip.stops.length} stops · ${dayCount(trip.start_date, trip.end_date)} days · ${trip.is_public ? "Public" : "Private"}`}
          imageUrl="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85"
          title={trip.name}
          description={trip.description || "Add city stops, activities, and cost estimates to build the full route."}
        >
          <Button
            aria-label="Delete trip"
            className="absolute right-4 top-4 h-10 w-10 border border-red-300/40 bg-red-500/90 px-0 text-white hover:bg-red-400"
            type="button"
            variant="destructive"
            onClick={handleDeleteTrip}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="flex flex-col justify-between gap-4 border border-white/15 bg-black/28 p-4 backdrop-blur sm:flex-row sm:items-end">
            <div className="flex flex-wrap gap-4 text-sm text-white/72">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/50" />
                {displayDateRange(trip.start_date, trip.end_date)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Route className="h-4 w-4 text-white/50" />
                {formatCurrency(trip.budget_amount, trip.currency)} budget
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setTripSettingsOpen(true)}>
                <Edit2 className="h-4 w-4" />
                Edit trip
              </Button>
              <Button
                type="button"
                onClick={() => openStopModal()}
              >
                <Plus className="h-4 w-4" />
                Add stop
              </Button>
            </div>
          </div>
        </PageHero>

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <ShareControls trip={trip} onToggle={handleTogglePublic} />
            <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase text-white/40">Route editor</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold text-white">Itinerary builder</h2>
              </div>
              <div className="rounded-none border border-white/10 bg-[#1d2127] p-1">
                <Button size="sm" type="button" variant={viewMode === "timeline" ? "default" : "ghost"} onClick={() => setViewMode("timeline")}>
                  <Route className="h-4 w-4" />
                  Timeline
                </Button>
                <Button size="sm" type="button" variant={viewMode === "list" ? "default" : "ghost"} onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>

            {trip.stops.length ? (
              viewMode === "timeline" ? (
                <div className="space-y-4">
                  {timelineItems.map((item) => {
                    if (item.type === "slot") {
                      return (
                        <Card key={`slot-${item.slot.id}`} className="border-dashed border-teal-300/25 bg-teal-400/[0.03]">
                          <CardContent className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border-teal-300/30 bg-teal-400/12 text-teal-100">Available</Badge>
                                <Badge>{displayDateRange(item.slot.start_date, item.slot.end_date)}</Badge>
                              </div>
                              <h3 className="mt-2 text-lg font-semibold text-white">Open route time</h3>
                              <p className="mt-1 text-sm text-white/55">
                                {item.slot.dayCount} day{item.slot.dayCount === 1 ? "" : "s"} free. Add a reachable stop that fits this slot.
                              </p>
                            </div>
                            <Button type="button" variant="secondary" onClick={() => openStopModal(item.slot)}>
                              <Plus className="h-4 w-4" />
                              Add stop here
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    }

                    const stop = item.stop;
                    const index = (stopOrderById.get(stop.id) ?? 1) - 1;

                    return (
                      <Card key={stop.id} className="overflow-hidden">
                        <CardHeader className="border-b border-white/10 bg-[#1d2127]">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge>Stop {index + 1}</Badge>
                              <Badge>{displayDateRange(stop.start_date, stop.end_date)}</Badge>
                            </div>
                            <CardTitle className="mt-2 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-teal-200" />
                              {stop.city}, {stop.country}
                            </CardTitle>
                            <p className="mt-1 text-sm text-white/50">
                              Stay {formatCurrency(stop.stay_cost, trip.currency)} · Transport {formatCurrency(stop.transport_cost, trip.currency)}
                            </p>
                            {stop.notes ? <p className="mt-2 text-sm text-white/60">{stop.notes}</p> : null}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" type="button" variant="secondary" onClick={() => setActivityModal({ stop })}>
                              <Plus className="h-4 w-4" />
                              Activity
                            </Button>
                            <Button
                              size="icon"
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingStop(stop);
                                setStopDraftSlot(undefined);
                                setStopModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" type="button" variant="ghost" onClick={() => handleDeleteStop(stop)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-5">
                        {(stop.activities ?? []).length ? (
                          (stop.activities ?? []).map((activity) => (
                            <ActivityCard
                              key={activity.id}
                              activity={activity}
                              currency={trip.currency}
                              onDelete={() => handleDeleteActivity(activity)}
                              onEdit={() => setActivityModal({ stop, activity })}
                            />
                          ))
                        ) : (
                          <div className="rounded-none border border-dashed border-white/20 p-5 text-center text-sm text-white/50">
                            No activities yet. Add a transfer, hotel check-in, meal, or sightseeing block.
                          </div>
                        )}
                      </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="space-y-3 p-5">
                    {listActivities.length ? (
                      listActivities.map(({ activity, stop }) => (
                        <div key={activity.id} className="grid gap-2 sm:grid-cols-[160px_1fr]">
                          <div className="text-sm text-white/50">
                            <p className="font-medium text-white/80">{displayDate(activity.activity_date)}</p>
                            <p>{stop.city}</p>
                          </div>
                          <ActivityCard
                            activity={activity}
                            currency={trip.currency}
                            onDelete={() => handleDeleteActivity(activity)}
                            onEdit={() => setActivityModal({ stop, activity })}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/50">No activities to list yet.</p>
                    )}
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <MapPin className="h-10 w-10 text-teal-200" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Add your first city stop</h3>
                    <p className="mt-1 text-sm text-white/50">Stops turn the trip into a real multi-city route.</p>
                  </div>
                  <Button
                    onClick={() => openStopModal()}
                  >
                    Add stop
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <BudgetSummary trip={trip} />
            <Card>
              <CardHeader>
                <CardTitle>Day coverage</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {buildDateRange(trip.start_date, trip.end_date).map((date) => {
                  const activeStop = trip.stops.find((stop) => date >= stop.start_date && date <= stop.end_date);
                  return (
                    <Badge key={date} className={activeStop ? "border-teal-300/30 bg-teal-400/12 text-teal-100" : ""}>
                      {date.slice(5)} {activeStop ? activeStop.city : "Open"}
                    </Badge>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={stopModalOpen}
        title={editingStop ? "Edit stop" : "Add city stop"}
        description="Choose a city, date range, and estimated stay or transport cost."
        className="sm:max-w-5xl"
        onClose={() => {
          setStopModalOpen(false);
          setEditingStop(undefined);
          setStopDraftSlot(undefined);
        }}
      >
        <StopForm
          existingStops={trip.stops}
          initialStop={editingStop}
          nextSortOrder={trip.stops.length + 1}
          preferredSlot={stopDraftSlot}
          tripDescription={trip.description}
          tripEndDate={trip.end_date}
          tripId={trip.id}
          tripName={trip.name}
          tripStartDate={trip.start_date}
          onSubmit={handleSaveStop}
        />
      </Modal>

      <Modal
        open={Boolean(activityModal)}
        title={activityModal?.activity ? "Edit activity" : `Add activity${activityModal?.stop ? ` in ${activityModal.stop.city}` : ""}`}
        description="Use a template or add custom details for this stop."
        className="sm:max-w-5xl"
        onClose={() => setActivityModal(null)}
      >
        {activityModal ? (
          <ActivityForm
            currency={trip.currency}
            initialActivity={activityModal.activity}
            stop={activityModal.stop}
            tripId={trip.id}
            onSubmit={handleSaveActivity}
          />
        ) : null}
      </Modal>

      <Modal open={tripSettingsOpen} title="Edit trip" description="Update top-level trip details." onClose={() => setTripSettingsOpen(false)}>
        <TripForm initialTrip={trip} submitLabel="Save trip" onSubmit={handleSaveTrip} />
      </Modal>
    </AppShell>
  );
}
