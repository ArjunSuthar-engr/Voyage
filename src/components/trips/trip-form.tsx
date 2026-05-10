"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDays, toInputDate } from "@/lib/dates";
import type { Trip, TripInput } from "@/lib/types";

type TripFormProps = {
  initialTrip?: Trip;
  submitLabel: string;
  onSubmit: (input: TripInput) => Promise<void>;
};

export function TripForm({ initialTrip, submitLabel, onSubmit }: TripFormProps) {
  const defaultStart = toInputDate(addDays(new Date(), 21));
  const defaultEnd = toInputDate(addDays(new Date(), 28));
  const [name, setName] = useState(initialTrip?.name ?? "");
  const [description, setDescription] = useState(initialTrip?.description ?? "");
  const [startDate, setStartDate] = useState(initialTrip?.start_date ?? defaultStart);
  const [endDate, setEndDate] = useState(initialTrip?.end_date ?? defaultEnd);
  const [budgetAmount, setBudgetAmount] = useState(String(initialTrip?.budget_amount ?? 250000));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget_amount: Number(budgetAmount || 0),
        currency: "INR",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="trip-name">Trip name</Label>
        <Input id="trip-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Japan City Loop" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="trip-description">Description</Label>
        <Textarea
          id="trip-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A multi-city route with food, transport, stays, and sightseeing."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="trip-start">Start date</Label>
          <Input id="trip-start" required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="trip-end">End date</Label>
          <Input id="trip-end" required min={startDate} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="grid gap-2">
          <Label htmlFor="trip-budget">Total budget</Label>
          <Input
            id="trip-budget"
            min="0"
            required
            type="number"
            value={budgetAmount}
            onChange={(event) => setBudgetAmount(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="trip-currency">Currency</Label>
          <Input id="trip-currency" readOnly value="INR" />
        </div>
      </div>
      <Button className="w-full sm:w-fit" disabled={saving || !name.trim()} type="submit">
        {saving ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
