"use client";

import { useState } from "react";

import { CitySearch } from "@/components/trips/city-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Stop, StopInput } from "@/lib/types";

type StopFormProps = {
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  initialStop?: Stop;
  nextSortOrder: number;
  onSubmit: (input: StopInput) => Promise<void>;
};

export function StopForm({ tripId, tripStartDate, tripEndDate, initialStop, nextSortOrder, onSubmit }: StopFormProps) {
  const [city, setCity] = useState(initialStop?.city ?? "");
  const [country, setCountry] = useState(initialStop?.country ?? "");
  const [startDate, setStartDate] = useState(initialStop?.start_date ?? tripStartDate);
  const [endDate, setEndDate] = useState(initialStop?.end_date ?? tripStartDate);
  const [stayCost, setStayCost] = useState(String(initialStop?.stay_cost ?? 0));
  const [transportCost, setTransportCost] = useState(String(initialStop?.transport_cost ?? 0));
  const [notes, setNotes] = useState(initialStop?.notes ?? "");
  const [saving, setSaving] = useState(false);

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
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <form className="grid content-start gap-4" onSubmit={handleSubmit}>
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
      <div className="rounded-none border border-white/10 bg-white/5 p-3">
        <CitySearch
          onSelect={(option) => {
            setCity(option.city);
            setCountry(option.country);
          }}
        />
      </div>
    </div>
  );
}
