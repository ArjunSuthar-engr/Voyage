"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { displayDateRange } from "@/lib/dates";
import { buildStopSuggestions, type StopSuggestion } from "@/lib/stop-suggestions";
import type { Stop, StopInput } from "@/lib/types";

type StopFormProps = {
  tripId: string;
  tripName: string;
  tripDescription?: string | null;
  tripStartDate: string;
  tripEndDate: string;
  existingStops: Stop[];
  initialStop?: Stop;
  nextSortOrder: number;
  onSubmit: (input: StopInput) => Promise<void>;
};

export function StopForm({
  tripId,
  tripName,
  tripDescription,
  tripStartDate,
  tripEndDate,
  existingStops,
  initialStop,
  nextSortOrder,
  onSubmit,
}: StopFormProps) {
  const suggestions = useMemo(
    () =>
      buildStopSuggestions({
        tripName,
        tripDescription,
        tripStartDate,
        tripEndDate,
        existingStops,
      }),
    [existingStops, tripDescription, tripEndDate, tripName, tripStartDate],
  );
  const nextSuggestion = !initialStop ? suggestions.find((suggestion) => !suggestion.alreadyAdded) : undefined;
  const [city, setCity] = useState(initialStop?.city ?? nextSuggestion?.city ?? "");
  const [country, setCountry] = useState(initialStop?.country ?? nextSuggestion?.country ?? "");
  const [startDate, setStartDate] = useState(initialStop?.start_date ?? nextSuggestion?.start_date ?? tripStartDate);
  const [endDate, setEndDate] = useState(initialStop?.end_date ?? nextSuggestion?.end_date ?? tripStartDate);
  const [stayCost, setStayCost] = useState(String(initialStop?.stay_cost ?? nextSuggestion?.stay_cost ?? 0));
  const [transportCost, setTransportCost] = useState(String(initialStop?.transport_cost ?? nextSuggestion?.transport_cost ?? 0));
  const [notes, setNotes] = useState(initialStop?.notes ?? nextSuggestion?.notes ?? "");
  const [selectedSuggestionKey, setSelectedSuggestionKey] = useState(nextSuggestion ? `${nextSuggestion.city}-${nextSuggestion.country}` : "");
  const [saving, setSaving] = useState(false);

  function applySuggestion(suggestion: StopSuggestion) {
    const suggestionKey = `${suggestion.city}-${suggestion.country}`;
    if (selectedSuggestionKey === suggestionKey) {
      setSelectedSuggestionKey("");
      setCity("");
      setCountry("");
      setStartDate(tripStartDate);
      setEndDate(tripStartDate);
      setStayCost("0");
      setTransportCost("0");
      setNotes("");
      return;
    }

    setSelectedSuggestionKey(suggestionKey);
    setCity(suggestion.city);
    setCountry(suggestion.country);
    setStartDate(suggestion.start_date);
    setEndDate(suggestion.end_date);
    setStayCost(String(suggestion.stay_cost));
    setTransportCost(String(suggestion.transport_cost));
    setNotes(suggestion.notes);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        trip_id: tripId,
        city,
        country,
        start_date: startDate,
        end_date: endDate,
        stay_cost: Number(stayCost || 0),
        transport_cost: Number(transportCost || 0),
        notes,
        sort_order: initialStop?.sort_order ?? nextSortOrder,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:h-[calc(92vh-170px)] lg:min-h-0 lg:grid-cols-[1fr_1.1fr] lg:overflow-hidden lg:overscroll-contain">
      <form className="grid content-start gap-4 lg:min-h-0" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="stop-city">City</Label>
            <Input id="stop-city" required value={city} onChange={(event) => setCity(event.target.value)} placeholder="Tokyo" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stop-country">Country</Label>
            <Input id="stop-country" required value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Japan" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="stop-start">Start date</Label>
            <Input
              id="stop-start"
              max={tripEndDate}
              min={tripStartDate}
              required
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stop-end">End date</Label>
            <Input
              id="stop-end"
              max={tripEndDate}
              min={startDate}
              required
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="stay-cost">Stay cost</Label>
            <Input id="stay-cost" min="0" type="number" value={stayCost} onChange={(event) => setStayCost(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transport-cost">Transport cost</Label>
            <Input id="transport-cost" min="0" type="number" value={transportCost} onChange={(event) => setTransportCost(event.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stop-notes">Notes</Label>
          <Textarea id="stop-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Hotel area, transit notes, or city goals." />
        </div>
        <Button disabled={saving || !city.trim() || !country.trim()} type="submit">
          {saving ? "Saving..." : initialStop ? "Update stop" : "Add stop"}
        </Button>
      </form>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-none border border-white/10 bg-white/5 p-3">
        {!initialStop && suggestions.length ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0">
              <p className="text-xs font-semibold uppercase text-white/40">Suggested stops</p>
              <p className="mt-1 text-sm text-white/60">Route picks matched to {tripName}.</p>
              {selectedSuggestionKey ? (
                <p className="mt-2 border border-teal-300/25 bg-teal-400/10 px-3 py-2 text-xs font-medium text-teal-100">
                  Stop selected. Review the details on the left, then click Add Stop.
                </p>
              ) : null}
            </div>
            <div className="minimal-scrollbar grid min-h-0 flex-1 gap-2 overflow-y-auto overscroll-contain pr-2">
              {suggestions.map((suggestion, index) => {
                const suggestionKey = `${suggestion.city}-${suggestion.country}`;
                const selected = selectedSuggestionKey === suggestionKey;

                return (
                  <div
                    key={suggestionKey}
                    className={`border p-3 transition ${
                      selected ? "border-teal-300/30 bg-teal-400/[0.04]" : "border-white/10 bg-[#181b20]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={selected ? "border-teal-300/30 bg-teal-400/10 text-teal-100" : ""}>Stop {index + 1}</Badge>
                          <span className="text-xs text-white/50">{displayDateRange(suggestion.start_date, suggestion.end_date)}</span>
                        </div>
                        <p className="mt-2 font-medium text-white">
                          {suggestion.city}, {suggestion.country}
                        </p>
                        <p className="mt-1 text-xs text-white/55">{suggestion.notes}</p>
                        <p className="mt-2 text-xs text-white/35">{suggestion.source}</p>
                      </div>
                      <Button
                        disabled={suggestion.alreadyAdded}
                        size="sm"
                        type="button"
                        variant={suggestion.alreadyAdded ? "ghost" : "secondary"}
                        onClick={() => applySuggestion(suggestion)}
                      >
                        {suggestion.alreadyAdded ? "Added" : "Use"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/15 bg-[#181b20] p-4 text-sm text-white/55">
            No curated stops are available for this trip name yet. Add the stop manually on the left.
          </div>
        )}
      </div>
    </div>
  );
}
