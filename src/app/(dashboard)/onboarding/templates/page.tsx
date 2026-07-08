import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplateManager } from "@/components/onboarding/template-manager";

export default async function OnboardingTemplatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/onboarding");

  const templates = await prisma.onboardingTemplate.findMany({
    include: { tasks: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Onboarding Templates
        </h1>
        <p className="mt-1 text-muted">
          Templates are assigned to new hires when they&apos;re hired through recruitment.
        </p>
      </div>

      <TemplateManager templates={templates} />
    </div>
  );
}
