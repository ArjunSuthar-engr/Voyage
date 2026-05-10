"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recommendedCities, type CityOption } from "@/lib/demo-data";

type CitySearchProps = {
  onSelect: (city: CityOption) => void;
};

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const cities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return recommendedCities;
    return recommendedCities.filter((city) =>
      `${city.city} ${city.country} ${city.region} ${city.popularity}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/40" />
        <Input className="pl-9" placeholder="Search city, country, or travel style" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cities.map((city) => (
          <div
            key={`${city.city}-${city.country}`}
            className="overflow-hidden rounded-none border border-white/10 bg-[#1d2127] text-left transition hover:border-teal-300 hover:shadow-sm"
          >
            <Image
              alt={`${city.city}, ${city.country}`}
              className="h-28 w-full object-cover"
              height={224}
              src={city.imageUrl}
              width={560}
            />
            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{city.city}</p>
                  <p className="text-xs text-white/50">{city.country}</p>
                </div>
                <Badge>{city.costIndex}</Badge>
              </div>
              <p className="line-clamp-2 text-xs text-white/60">{city.description}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white/50">{city.popularity}</span>
                <Button size="sm" type="button" variant="secondary" onClick={() => onSelect(city)}>
                  Use
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
