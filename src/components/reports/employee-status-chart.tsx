"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip } from "@/components/reports/chart-tooltip";

const STATUS_COLOR: Record<string, string> = {
  Active: "var(--color-success)",
  "On leave": "var(--color-warning)",
  Terminated: "var(--color-danger)",
};

export function EmployeeStatusChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={64}
          outerRadius={96}
          paddingAngle={2}
          stroke="var(--color-surface)"
          strokeWidth={2}
          isAnimationActive={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
            const RADIAN = Math.PI / 180;
            const midRadius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) / 2;
            const x = Number(cx) + midRadius * Math.cos(-Number(midAngle) * RADIAN);
            const y = Number(cy) + midRadius * Math.sin(-Number(midAngle) * RADIAN);
            const percent = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
            if (percent < 8) return null;
            return (
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-powder-100)"
                fontSize={12}
                fontWeight={600}
              >
                {percent}%
              </text>
            );
          }}
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLOR[entry.name] ?? "var(--color-teal)"} />
          ))}
        </Pie>
        <Tooltip content={ChartTooltip} />
        <Legend
          verticalAlign="bottom"
          height={32}
          formatter={(value) => <span className="text-sm text-muted">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
