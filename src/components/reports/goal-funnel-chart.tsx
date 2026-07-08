"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTooltip } from "@/components/reports/chart-tooltip";

const STAGE_COLOR: Record<string, string> = {
  Draft: "var(--muted)",
  Pending: "var(--color-warning)",
  Approved: "var(--color-success)",
  Returned: "var(--color-danger)",
};

export function GoalFunnelChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--hairline)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--hairline)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={ChartTooltip} cursor={{ fill: "var(--hairline)" }} />
        <Bar dataKey="count" name="Goals" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STAGE_COLOR[entry.name] ?? "var(--color-teal)"} />
          ))}
          <LabelList dataKey="count" position="top" fill="var(--muted)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
