import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type OrgChartPerson = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentName: string | null;
  children: OrgChartPerson[];
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function OrgChartNode({ person }: { person: OrgChartPerson }) {
  return (
    <div className="flex flex-col items-start">
      <Link
        href={`/directory/${person.id}`}
        className="flex items-center gap-3 rounded-md border border-hairline bg-surface px-3 py-2 transition-colors hover:border-teal/40"
      >
        <Avatar>
          <AvatarFallback>{initials(person.firstName, person.lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-powder-100">
            {person.firstName} {person.lastName}
          </p>
          <p className="text-xs text-muted">
            {person.jobTitle}
            {person.departmentName ? ` · ${person.departmentName}` : ""}
          </p>
        </div>
      </Link>

      {person.children.length > 0 && (
        <div className="ml-6 mt-3 flex flex-col gap-3 border-l border-hairline pl-6">
          {person.children.map((child) => (
            <OrgChartNode key={child.id} person={child} />
          ))}
        </div>
      )}
    </div>
  );
}
