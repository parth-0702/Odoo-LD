import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { activityCostTotal, inr } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { cityById } from "@/lib/data";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const budgetBreakdown = (trip: Trip) => [
  { name: "Transport", value: trip.expenses.transport },
  { name: "Accommodation", value: trip.expenses.accommodation },
  { name: "Activities", value: activityCostTotal(trip) },
  { name: "Meals", value: trip.expenses.meals },
  { name: "Other", value: trip.expenses.other },
];

export function BudgetPie({ trip }: { trip: Trip }) {
  const data = budgetBreakdown(trip).filter((d) => d.value > 0);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => inr(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetBars({ trip }: { trip: Trip }) {
  const data = budgetBreakdown(trip);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <Tooltip formatter={(v: number) => inr(v)} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyCostChart({ trip }: { trip: Trip }) {
  const data = trip.stops.flatMap((stop) =>
    stop.days.map((day, i) => ({
      label: `${cityById(stop.cityId)?.name.slice(0, 3)} ${i + 1}`,
      cost: day.activities.reduce((a, b) => a + b.cost, 0),
    })),
  );

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <Tooltip formatter={(v: number) => inr(v)} />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
