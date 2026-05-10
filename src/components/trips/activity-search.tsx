"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { activityTemplates, type ActivityTemplate } from "@/lib/demo-data";
import { categoryClasses, categoryLabels, formatCurrency } from "@/lib/format";

type ActivitySearchProps = {
  currency: string;
  onSelect: (activity: ActivityTemplate) => void;
};

export function ActivitySearch({ currency, onSelect }: ActivitySearchProps) {
  const [query, setQuery] = useState("");
  const activities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return activityTemplates;
    return activityTemplates.filter((activity) =>
      `${activity.title} ${activity.category} ${activity.tags.join(" ")}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
        <Input className="pl-9" placeholder="Search activity type, cost, or interest" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="grid gap-2">
        {activities.map((activity) => (
          <div
            key={activity.title}
            className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:border-teal-300 hover:shadow-sm"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-stone-950">{activity.title}</p>
                <Badge className={categoryClasses[activity.category]}>{categoryLabels[activity.category]}</Badge>
              </div>
              <p className="line-clamp-1 text-xs text-stone-500">{activity.notes}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium text-stone-700">{formatCurrency(activity.cost, currency)}</span>
              <Button size="sm" type="button" variant="secondary" onClick={() => onSelect(activity)}>
                Use
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
