export type ActivityCategory =
  | "flight"
  | "hotel"
  | "food"
  | "transport"
  | "activity"
  | "shopping"
  | "other";

export type MoneyValue = number | string | null;

export type Trip = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  budget_amount: MoneyValue;
  currency: string;
  is_public: boolean;
  public_slug: string;
  created_at: string;
  updated_at: string;
};

export type Stop = {
  id: string;
  trip_id: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  stay_cost: MoneyValue;
  transport_cost: MoneyValue;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  activities?: Activity[];
};

export type Activity = {
  id: string;
  trip_id: string;
  stop_id: string;
  activity_date: string;
  title: string;
  category: ActivityCategory;
  start_time: string | null;
  duration_minutes: number | null;
  cost: MoneyValue;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TripWithStops = Trip & {
  stops: Stop[];
};

export type TripInput = {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget_amount: number;
  currency: string;
};

export type StopInput = {
  trip_id: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  stay_cost: number;
  transport_cost: number;
  notes?: string;
  sort_order: number;
};

export type ActivityInput = {
  trip_id: string;
  stop_id: string;
  activity_date: string;
  title: string;
  category: ActivityCategory;
  start_time?: string;
  duration_minutes?: number;
  cost: number;
  notes?: string;
};
