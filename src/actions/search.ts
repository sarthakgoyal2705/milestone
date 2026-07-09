"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export type SearchResult = {
  type: "employee" | "goal" | "document" | "job";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  await requireSession();

  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const results: SearchResult[] = [];

  const [employees, goals, documents, jobs] = await Promise.all([
    prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { jobTitle: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { department: true },
      take: 5,
    }),
    prisma.goal.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { thrustArea: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { employee: true },
      take: 5,
    }),
    prisma.document.findMany({
      where: { fileName: { contains: q, mode: "insensitive" } },
      include: { employee: true },
      take: 5,
    }),
    prisma.jobPosting.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { department: true },
      take: 5,
    }),
  ]);

  for (const e of employees) {
    results.push({
      type: "employee",
      id: e.id,
      title: `${e.firstName} ${e.lastName}`,
      subtitle: `${e.jobTitle}${e.department ? ` · ${e.department.name}` : ""}`,
      href: `/directory/${e.id}`,
    });
  }

  for (const g of goals) {
    results.push({
      type: "goal",
      id: g.id,
      title: g.title,
      subtitle: `${g.thrustArea} · ${g.employee.firstName} ${g.employee.lastName}`,
      href: `/goals`,
    });
  }

  for (const d of documents) {
    results.push({
      type: "document",
      id: d.id,
      title: d.fileName,
      subtitle: `${d.category} · ${d.employee.firstName} ${d.employee.lastName}`,
      href: `/documents`,
    });
  }

  for (const j of jobs) {
    results.push({
      type: "job",
      id: j.id,
      title: j.title,
      subtitle: `${j.isOpen ? "Open" : "Closed"}${j.department ? ` · ${j.department.name}` : ""}`,
      href: `/recruitment/${j.id}`,
    });
  }

  return results;
}
