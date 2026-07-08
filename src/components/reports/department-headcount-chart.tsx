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

import { ChartTooltip } from "@/components/reports/chart-tooltip";

export function DepartmentHeadcountChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
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
        <Bar dataKey="count" name="Headcount" fill="var(--color-teal)" radius={[4, 4, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="count" position="top" fill="var(--muted)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
