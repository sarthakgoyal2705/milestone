"use client";

import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

export function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-hairline bg-ink-800 px-3 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      {label !== undefined && <p className="mb-1 font-medium text-powder-100">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-muted">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>
            {entry.name}: <span className="text-powder-100">{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
