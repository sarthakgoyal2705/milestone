import { Card, CardContent } from "@/components/ui/card";

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 font-sans text-3xl font-semibold text-powder-100">{value}</p>
      </CardContent>
    </Card>
  );
}
