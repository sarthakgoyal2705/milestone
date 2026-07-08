"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type LineItem = { label: string; amount: number };

export function LineItemsEditor({
  name,
  label,
  initial,
}: {
  name: string;
  label: string;
  initial: LineItem[];
}) {
  const [items, setItems] = useState<LineItem[]>(initial.length > 0 ? initial : []);

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", amount: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" size="sm" variant="ghost" onClick={addItem}>
          <Plus className="size-4" />
          Add line
        </Button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length === 0 && <p className="text-sm text-muted">No {label.toLowerCase()} yet.</p>}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Label"
            value={item.label}
            onChange={(e) => updateItem(index, "label", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={item.amount}
            onChange={(e) => updateItem(index, "amount", e.target.value)}
            className="w-32"
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(index)}>
            <Trash2 className="size-4 text-danger" />
          </Button>
        </div>
      ))}
    </div>
  );
}
