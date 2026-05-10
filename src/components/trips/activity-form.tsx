"use client";

import { useState } from "react";

import { ActivitySearch } from "@/components/trips/activity-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { buildDateRange } from "@/lib/dates";
import { categoryLabels } from "@/lib/format";
import type { Activity, ActivityCategory, ActivityInput, Stop } from "@/lib/types";

const categories = Object.keys(categoryLabels) as ActivityCategory[];

type ActivityFormProps = {
  tripId: string;
  stop: Stop;
  currency: string;
  initialActivity?: Activity;
  onSubmit: (input: ActivityInput) => Promise<void>;
};

export function ActivityForm({ tripId, stop, currency, initialActivity, onSubmit }: ActivityFormProps) {
  const dateOptions = buildDateRange(stop.start_date, stop.end_date);
  const [title, setTitle] = useState(initialActivity?.title ?? "");
  const [category, setCategory] = useState<ActivityCategory>(initialActivity?.category ?? "activity");
  const [activityDate, setActivityDate] = useState(initialActivity?.activity_date ?? dateOptions[0]);
  const [startTime, setStartTime] = useState(initialActivity?.start_time?.slice(0, 5) ?? "");
  const [durationMinutes, setDurationMinutes] = useState(String(initialActivity?.duration_minutes ?? 90));
  const [cost, setCost] = useState(String(initialActivity?.cost ?? 0));
  const [notes, setNotes] = useState(initialActivity?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        trip_id: tripId,
        stop_id: stop.id,
        activity_date: activityDate,
        title,
        category,
        start_time: startTime,
        duration_minutes: Number(durationMinutes || 0),
        cost: Number(cost || 0),
        notes,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <form className="grid content-start gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="activity-title">Activity title</Label>
          <Input id="activity-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Neighborhood food walk" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="activity-category">Category</Label>
            <NativeSelect id="activity-category" value={category} onChange={(event) => setCategory(event.target.value as ActivityCategory)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="activity-date">Date</Label>
            <NativeSelect id="activity-date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)}>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="activity-time">Start time</Label>
            <Input id="activity-time" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="activity-duration">Minutes</Label>
            <Input id="activity-duration" min="0" type="number" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="activity-cost">Cost</Label>
            <Input id="activity-cost" min="0" type="number" value={cost} onChange={(event) => setCost(event.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="activity-notes">Notes</Label>
          <Textarea id="activity-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Booking info, meeting point, or backup option." />
        </div>
        <Button disabled={saving || !title.trim()} type="submit">
          {saving ? "Saving..." : initialActivity ? "Update activity" : "Add activity"}
        </Button>
      </form>
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <ActivitySearch
          currency={currency}
          onSelect={(template) => {
            setTitle(template.title);
            setCategory(template.category);
            setDurationMinutes(String(template.duration_minutes));
            setCost(String(template.cost));
            setNotes(template.notes);
          }}
        />
      </div>
    </div>
  );
}
