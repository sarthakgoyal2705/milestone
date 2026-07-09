import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddAssetDialog } from "@/components/assets/add-asset-dialog";
import { ExportButton } from "@/components/ui/export-button";

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  AVAILABLE: "success",
  ASSIGNED: "warning",
  MAINTENANCE: "danger",
  RETIRED: "neutral",
};

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  // Only admins can access global assets view. Employees might have a "My Assets" view later, 
  // but this page is intended for IT admin use based on the NAV_ITEMS role restriction.
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [assets, employees] = await Promise.all([
    prisma.asset.findMany({
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    })
  ]);

  const employeeOptions = employees.map((emp) => ({
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`
  }));

  const exportHeaders = ["Name", "Type", "Serial Number", "Status", "Assigned To"];
  const exportRows = assets.map(a => [
    a.name,
    a.type,
    a.serialNumber || "N/A",
    a.status,
    a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : "Unassigned"
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Assets & Inventory
          </h1>
          <p className="mt-1 text-muted">Manage company hardware and equipment.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton 
            filename="assets"
            title="Company Asset Inventory"
            headers={exportHeaders}
            rows={exportRows}
          />
          <AddAssetDialog employees={employeeOptions} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted">
                    No assets in inventory.
                  </TableCell>
                </TableRow>
              )}
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium text-powder-100">{asset.name}</TableCell>
                  <TableCell className="text-muted">{asset.type}</TableCell>
                  <TableCell className="text-muted font-mono text-xs">{asset.serialNumber || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[asset.status]}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">
                    {asset.assignedTo 
                      ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted max-w-[200px] truncate">
                    {asset.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
