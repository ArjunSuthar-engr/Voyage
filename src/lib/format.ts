import type { Activity, ActivityCategory, MoneyValue, Stop, TripWithStops } from "@/lib/types";

export const categoryLabels: Record<ActivityCategory, string> = {
  flight: "Flight",
  hotel: "Hotel",
  food: "Food",
  transport: "Transport",
  activity: "Activity",
  shopping: "Shopping",
  other: "Other",
};

export const categoryClasses: Record<ActivityCategory, string> = {
  flight: "border-sky-200 bg-sky-50 text-sky-700",
  hotel: "border-indigo-200 bg-indigo-50 text-indigo-700",
  food: "border-emerald-200 bg-emerald-50 text-emerald-700",
  transport: "border-amber-200 bg-amber-50 text-amber-800",
  activity: "border-rose-200 bg-rose-50 text-rose-700",
  shopping: "border-violet-200 bg-violet-50 text-violet-700",
  other: "border-stone-200 bg-stone-50 text-stone-700",
};

export function moneyNumber(value: MoneyValue) {
  return Number(value ?? 0);
}

export function formatCurrency(value: MoneyValue, currency = "INR") {
  void currency;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(moneyNumber(value));
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "Flexible";
  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function allActivities(trip: TripWithStops) {
  return trip.stops.flatMap((stop) => stop.activities ?? []);
}

export function calculateTripSpend(trip: TripWithStops) {
  const stopCosts = trip.stops.reduce(
    (total, stop) => total + moneyNumber(stop.stay_cost) + moneyNumber(stop.transport_cost),
    0,
  );
  const activityCosts = allActivities(trip).reduce((total, activity) => total + moneyNumber(activity.cost), 0);
  return stopCosts + activityCosts;
}

export function spendByCategory(stops: Stop[]) {
  const base: Record<ActivityCategory, number> = {
    flight: 0,
    hotel: 0,
    food: 0,
    transport: 0,
    activity: 0,
    shopping: 0,
    other: 0,
  };

  stops.forEach((stop) => {
    base.hotel += moneyNumber(stop.stay_cost);
    base.transport += moneyNumber(stop.transport_cost);
    (stop.activities ?? []).forEach((activity: Activity) => {
      base[activity.category] += moneyNumber(activity.cost);
    });
  });

  return base;
}
