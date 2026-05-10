import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryClasses, categoryLabels, calculateTripSpend, formatCurrency, moneyNumber, spendByCategory } from "@/lib/format";
import type { ActivityCategory, TripWithStops } from "@/lib/types";

export function BudgetSummary({ trip }: { trip: TripWithStops }) {
  const plannedSpend = calculateTripSpend(trip);
  const budget = moneyNumber(trip.budget_amount);
  const remaining = budget - plannedSpend;
  const categories = spendByCategory(trip.stops);
  const sortedCategories = (Object.entries(categories) as [ActivityCategory, number][])
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-stone-500">Total</p>
            <p className="text-lg font-semibold text-stone-950">{formatCurrency(budget, trip.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Planned</p>
            <p className="text-lg font-semibold text-stone-950">{formatCurrency(plannedSpend, trip.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">{remaining >= 0 ? "Remaining" : "Over"}</p>
            <p className={remaining >= 0 ? "text-lg font-semibold text-teal-700" : "text-lg font-semibold text-red-700"}>
              {formatCurrency(Math.abs(remaining), trip.currency)}
            </p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className={remaining >= 0 ? "h-full bg-teal-700" : "h-full bg-red-600"}
            style={{ width: `${Math.min(100, budget > 0 ? (plannedSpend / budget) * 100 : 0)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {sortedCategories.length ? (
            sortedCategories.map(([category, value]) => (
              <Badge key={category} className={categoryClasses[category]}>
                {categoryLabels[category]} {formatCurrency(value, trip.currency)}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-stone-500">Add stops and activities to see a breakdown.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
