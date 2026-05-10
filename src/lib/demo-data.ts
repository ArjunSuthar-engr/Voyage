import type { ActivityCategory } from "@/lib/types";

export type CityOption = {
  city: string;
  country: string;
  region: string;
  costIndex: "$" | "$$" | "$$$";
  popularity: string;
  imageUrl: string;
  description: string;
};

export type ActivityTemplate = {
  title: string;
  category: ActivityCategory;
  duration_minutes: number;
  cost: number;
  notes: string;
  tags: string[];
};

export const recommendedCities: CityOption[] = [
  {
    city: "Tokyo",
    country: "Japan",
    region: "East Asia",
    costIndex: "$$$",
    popularity: "Food, design, transit",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    description: "A high-energy base for food streets, galleries, and day trips.",
  },
  {
    city: "Kyoto",
    country: "Japan",
    region: "East Asia",
    costIndex: "$$",
    popularity: "Temples, cafes, gardens",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    description: "Historic districts, slow mornings, and structured sightseeing days.",
  },
  {
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    costIndex: "$$",
    popularity: "Architecture, beaches, tapas",
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
    description: "A compact city for food walks, museums, beaches, and day tours.",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    region: "Europe",
    costIndex: "$$",
    popularity: "Views, seafood, neighborhoods",
    imageUrl:
      "https://images.unsplash.com/photo-1501927023255-9063be98970c?auto=format&fit=crop&w=900&q=80",
    description: "Great value for hilltop viewpoints, tram rides, and coastal escapes.",
  },
];

export const activityTemplates: ActivityTemplate[] = [
  {
    title: "Neighborhood food walk",
    category: "food",
    duration_minutes: 150,
    cost: 55,
    notes: "Add a few flexible stops so the plan still works if one place is crowded.",
    tags: ["food", "walking", "local"],
  },
  {
    title: "Museum or gallery block",
    category: "activity",
    duration_minutes: 120,
    cost: 24,
    notes: "Book tickets ahead if the trip is during a weekend.",
    tags: ["culture", "rainy day", "ticketed"],
  },
  {
    title: "Airport or rail transfer",
    category: "transport",
    duration_minutes: 60,
    cost: 35,
    notes: "Include buffer time around check-in and luggage storage.",
    tags: ["transfer", "arrival", "departure"],
  },
  {
    title: "Hotel check-in",
    category: "hotel",
    duration_minutes: 45,
    cost: 0,
    notes: "Store confirmation number and check-in time here.",
    tags: ["hotel", "arrival"],
  },
  {
    title: "Signature sightseeing route",
    category: "activity",
    duration_minutes: 180,
    cost: 40,
    notes: "Group nearby landmarks to avoid crisscrossing the city.",
    tags: ["sightseeing", "landmarks", "walking"],
  },
  {
    title: "Market and souvenir stop",
    category: "shopping",
    duration_minutes: 90,
    cost: 80,
    notes: "Keep this flexible and move it if weather changes.",
    tags: ["shopping", "market", "gifts"],
  },
];
