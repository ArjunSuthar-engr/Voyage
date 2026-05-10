"use client";

import Link from "next/link";
import { CalendarDays, Edit2, Eye, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { displayDateRange } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Trip } from "@/lib/types";

type TripCardProps = {
  trip: Trip;
  onEdit: () => void;
  onDelete: () => void;
};

export function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-teal-700 via-stone-900 to-amber-500" />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{trip.name}</CardTitle>
            <p className="mt-1 line-clamp-2 text-sm text-stone-500">{trip.description || "Multi-city itinerary"}</p>
          </div>
          <Badge className={trip.is_public ? "border-teal-200 bg-teal-50 text-teal-700" : ""}>
            {trip.is_public ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <CalendarDays className="h-4 w-4 text-stone-400" />
          {displayDateRange(trip.start_date, trip.end_date)}
        </div>
        <div>
          <p className="text-xs text-stone-500">Budget</p>
          <p className="text-xl font-semibold text-stone-950">{formatCurrency(trip.budget_amount, trip.currency)}</p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3">
        <Link className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full")} href={`/trips/${trip.id}`}>
          <Eye className="h-4 w-4" />
          View
        </Link>
        <Button size="sm" type="button" variant="secondary" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
