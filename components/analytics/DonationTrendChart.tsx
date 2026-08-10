"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/lib/db/analytics";

type TooltipPayload = {
  active?: boolean;
  payload?: Array<{ payload: TrendPoint }>;
};

function TrendTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-brand-ink/12 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-brand-ink">{point.label}</p>
      <p className="numeric mt-0.5 text-sm text-brand-ink/60">
        {point.servings} porsi · {point.donations} donasi
      </p>
    </div>
  );
}

type DonationTrendChartProps = {
  data: TrendPoint[];
};

export function DonationTrendChart({ data }: DonationTrendChartProps) {
  const hasData = data.some((point) => point.servings > 0);

  if (!hasData) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-brand-ink/45">
        Belum ada donasi dalam 30 hari terakhir.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-brand-ink)"
          strokeOpacity={0.08}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
          tick={{ fontSize: 11, fill: "var(--color-brand-ink)", opacity: 0.45 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-brand-ink)", opacity: 0.45 }}
        />
        <Tooltip
          content={<TrendTooltip />}
          cursor={{ fill: "var(--color-brand-ink)", fillOpacity: 0.04 }}
        />
        <Bar
          dataKey="servings"
          fill="var(--color-chart)"
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
