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
  FolderOpen,
  BarChart3,
  Calendar,
  Award,
  Star,
  Clock8,
  Monitor,
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
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Team Goals", href: "/goals/team", icon: UsersRound, roles: ["MANAGER", "ADMIN"] },
  { label: "Performance", href: "/performance", icon: Star },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Leave Approvals", href: "/leave/approvals", icon: ClipboardCheck, roles: ["MANAGER", "ADMIN"] },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Timesheets", href: "/timesheets", icon: Clock8 },
  { label: "Recognition", href: "/recognition", icon: Award },
  { label: "Payroll", href: "/payroll", icon: Wallet, roles: ["ADMIN"] },
  { label: "Payslips", href: "/payslips", icon: Receipt },
  { label: "Recruitment", href: "/recruitment", icon: Briefcase, roles: ["MANAGER", "ADMIN"] },
  { label: "Onboarding", href: "/onboarding", icon: ListChecks },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Assets", href: "/assets", icon: Monitor, roles: ["ADMIN"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Notifications", href: "/notifications", icon: Bell },
];
