import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("milestone123", 12);

  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering" },
  });
  const peopleOps = await prisma.department.upsert({
    where: { name: "People Ops" },
    update: {},
    create: { name: "People Ops" },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@milestone.app" },
    update: {},
    create: { email: "admin@milestone.app", passwordHash, role: "ADMIN" },
  });
  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: "System",
      lastName: "Admin",
      jobTitle: "HR Administrator",
      departmentId: peopleOps.id,
      hireDate: new Date("2022-01-10"),
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "taylor@milestone.app" },
    update: {},
    create: { email: "taylor@milestone.app", passwordHash, role: "MANAGER" },
  });
  const manager = await prisma.employee.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      firstName: "Taylor",
      lastName: "Reyes",
      jobTitle: "Engineering Manager",
      departmentId: engineering.id,
      hireDate: new Date("2022-03-01"),
    },
  });

  const employeeSeeds = [
    { email: "aditya@milestone.app", firstName: "Aditya", lastName: "Sharma" },
    { email: "atul@milestone.app", firstName: "Atul", lastName: "Verma" },
  ];

  for (const e of employeeSeeds) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: { email: e.email, passwordHash, role: "EMPLOYEE" },
    });
    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: "Software Engineer",
        departmentId: engineering.id,
        managerId: manager.id,
        hireDate: new Date("2023-06-15"),
      },
    });
  }

  const cycles = [
    "Phase 1 - Goal Setting",
    "Q1 Check-in",
    "Q2 Check-in",
    "Q3 Check-in",
    "Q4 / Annual Check-in",
  ];
  for (const [i, name] of cycles.entries()) {
    await prisma.reviewCycle.upsert({
      where: { name },
      update: {},
      create: { name, order: i, isActive: i === 0 },
    });
  }

  const annualLeave = await prisma.leaveType.upsert({
    where: { name: "Annual Leave" },
    update: {},
    create: { name: "Annual Leave", defaultAnnualDays: 20 },
  });
  const sickLeave = await prisma.leaveType.upsert({
    where: { name: "Sick Leave" },
    update: {},
    create: { name: "Sick Leave", defaultAnnualDays: 10 },
  });

  const allEmployees = await prisma.employee.findMany({ where: { status: { not: "TERMINATED" } } });
  const year = new Date().getFullYear();
  for (const employee of allEmployees) {
    for (const leaveType of [annualLeave, sickLeave]) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: leaveType.id, year } },
        update: {},
        create: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year,
          allocatedDays: leaveType.defaultAnnualDays,
        },
      });
    }
  }

  await prisma.salaryStructure.upsert({
    where: { employeeId: manager.id },
    update: {},
    create: {
      employeeId: manager.id,
      baseSalary: 9500,
      currency: "USD",
      allowances: [{ label: "Housing", amount: 800 }],
      deductions: [{ label: "Health insurance", amount: 200 }],
      effectiveFrom: new Date(`${year}-01-01`),
    },
  });

  const onboardingTemplate = await prisma.onboardingTemplate.upsert({
    where: { id: "seed-standard-onboarding" },
    update: {},
    create: { id: "seed-standard-onboarding", name: "Standard Onboarding" },
  });
  const onboardingTasks = ["Set up workstation", "Complete HR paperwork", "Meet your team", "Review company handbook"];
  for (const [i, title] of onboardingTasks.entries()) {
    await prisma.onboardingTaskTemplate.upsert({
      where: { id: `seed-onboarding-task-${i}` },
      update: {},
      create: { id: `seed-onboarding-task-${i}`, templateId: onboardingTemplate.id, title, order: i },
    });
  }

  const designPosting = await prisma.jobPosting.upsert({
    where: { id: "seed-product-designer-posting" },
    update: {},
    create: {
      id: "seed-product-designer-posting",
      title: "Product Designer",
      departmentId: engineering.id,
      description: "Own end-to-end design for the Milestone product, from research to polish.",
      isOpen: true,
      createdById: adminUser.id,
    },
  });
  await prisma.candidate.upsert({
    where: { id: "seed-candidate-morgan" },
    update: {},
    create: {
      id: "seed-candidate-morgan",
      jobPostingId: designPosting.id,
      name: "Morgan Blake",
      email: "morgan.blake@example.com",
      stage: "APPLIED",
    },
  });

  console.log("Seed complete. Demo accounts (password: milestone123):");
  console.log("  admin@milestone.app (Admin)");
  console.log("  taylor@milestone.app (Manager)");
  console.log("  aditya@milestone.app / atul@milestone.app (Employee)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
