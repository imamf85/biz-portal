"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateId, formatRupiah } from "@/lib/format";
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
                {formatRupiah(p.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OmzetChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2} margin={{ left: 0, right: 0, top: 4 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="0"
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDateId(d).replace(/ \d{4}$/, "")}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) =>
            v >= 1_000_000 ? `${v / 1_000_000}jt` : `${v / 1000}rb`
          }
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
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
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
