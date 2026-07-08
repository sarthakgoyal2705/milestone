import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bell,
  Users,
  Network,
  Target,
  UsersRound,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Wallet,
  Receipt,
  Briefcase,
  ListChecks,
  FolderOpen,
  BarChart3,
} from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
};

// Additional entries are appended here as each HRMS module ships.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Directory", href: "/directory", icon: Users },
  { label: "Org Chart", href: "/org-chart", icon: Network },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Team Goals", href: "/goals/team", icon: UsersRound, roles: ["MANAGER", "ADMIN"] },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Leave Approvals", href: "/leave/approvals", icon: ClipboardCheck, roles: ["MANAGER", "ADMIN"] },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Payroll", href: "/payroll", icon: Wallet, roles: ["ADMIN"] },
  { label: "Payslips", href: "/payslips", icon: Receipt },
  { label: "Recruitment", href: "/recruitment", icon: Briefcase, roles: ["MANAGER", "ADMIN"] },
  { label: "Onboarding", href: "/onboarding", icon: ListChecks },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Notifications", href: "/notifications", icon: Bell },
];
