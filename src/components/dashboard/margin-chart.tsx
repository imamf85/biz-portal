"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateId, formatPercent } from "@/lib/format";
import type { DailyPoint } from "@/lib/aggregate";

const SERIES = [
  { key: "kebab", label: "Kebab", color: "var(--chart-1)" },
  { key: "lumpia", label: "Lumpia", color: "var(--chart-2)" },
] as const;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-popover-foreground">
        {label ? formatDateId(label) : ""}
      </p>
      <div className="space-y-1">
        {payload.map((p) => {
          const series = SERIES.find((s) => s.key === p.dataKey);
          return (
            <div key={p.dataKey} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: series?.color }}
              />
              <span className="text-muted-foreground">{series?.label}</span>
              <span className="ml-auto font-medium tabular-nums text-popover-foreground">
                {formatPercent(p.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarginChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDateId(d).replace(/ \d{4}$/, "")}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          formatter={(value) => {
            const series = SERIES.find((s) => s.label === value || s.key === value);
            return series?.label ?? value;
          }}
        />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
