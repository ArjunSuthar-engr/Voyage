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
  flight: "border-sky-300/30 bg-sky-400/12 text-sky-100",
  hotel: "border-indigo-300/30 bg-indigo-400/12 text-indigo-100",
  food: "border-emerald-300/30 bg-emerald-400/12 text-emerald-100",
  transport: "border-amber-300/30 bg-amber-400/12 text-amber-100",
  activity: "border-rose-300/30 bg-rose-400/12 text-rose-100",
  shopping: "border-violet-300/30 bg-violet-400/12 text-violet-100",
  other: "border-white/15 bg-white/10 text-white/72",
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
