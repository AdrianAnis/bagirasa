"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FoodTypeSlice } from "@/lib/db/analytics";

type TooltipPayload = {
  active?: boolean;
  payload?: Array<{ payload: FoodTypeSlice }>;
};

function FoodTypeTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) {
    return null;
  }

  const slice = payload[0].payload;

  return (
    <div className="rounded-lg border border-brand-ink/12 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-brand-ink">{slice.label}</p>
      <p className="numeric mt-0.5 text-sm text-brand-ink/60">
        {slice.servings} porsi
      </p>
    </div>
  );
}

type FoodTypeChartProps = {
  data: FoodTypeSlice[];
};

export function FoodTypeChart({ data }: FoodTypeChartProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-brand-ink/45">
        Belum ada item makanan tercatat.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--color-brand-ink)"
          strokeOpacity={0.08}
        />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={116}
          tick={{ fontSize: 12, fill: "var(--color-brand-ink)", opacity: 0.7 }}
        />
        <Tooltip
          content={<FoodTypeTooltip />}
          cursor={{ fill: "var(--color-brand-ink)", fillOpacity: 0.04 }}
        />
        <Bar
          dataKey="servings"
          fill="var(--color-chart)"
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
        >
          <LabelList
            dataKey="servings"
            position="right"
            offset={8}
            className="numeric"
            fill="var(--color-brand-ink)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
