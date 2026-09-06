"use client";
import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types/database.types";
import { SIDEBAR_SECTIONS } from "@/lib/utils/roles";
import {
  DashboardIcon,
  EmployeesIcon,
  ContractsIcon,
  ScheduleIcon,
  AttendanceIcon,
  TimeOffIcon,
  SalaryIcon,
  PayrunIcon,
  PayslipIcon,
  UsersAdminIcon,
} from "./icons";

type NavLink = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
  sub?: boolean;
  /** Restricts this specific link within an otherwise-visible section. Omit to show to everyone the section is shown to. */
  hideFor?: Role[];
};

const SECTION_LINKS: Record<string, NavLink[]> = {
  dashboard: [{ label: "Dashboard", href: "/dashboard", icon: DashboardIcon }],
  employees: [{ label: "Employees", href: "/employees", icon: EmployeesIcon }],
  contracts: [{ label: "Contracts", href: "/contracts", icon: ContractsIcon }],
  "working-schedules": [
    { label: "Working Schedules", href: "/working-schedules", icon: ScheduleIcon },
  ],
  attendance: [{ label: "Attendance", href: "/attendance", icon: AttendanceIcon }],
  "time-off": [
    { label: "Time Off", href: "/time-off/requests", icon: TimeOffIcon },
    { label: "Requests", href: "/time-off/requests", icon: TimeOffIcon, sub: true },
    { label: "Allocations", href: "/time-off/allocations", icon: TimeOffIcon, sub: true },
    {
      label: "Time Off Types",
      href: "/time-off/types",
      icon: TimeOffIcon,
      sub: true,
      hideFor: ["employee"],
    },
  ],
  payroll: [
    { label: "Payroll", href: "/payroll/payruns", icon: SalaryIcon },
    { label: "Payruns", href: "/payroll/payruns", icon: PayrunIcon, sub: true },
    { label: "Payslips", href: "/payroll/payslips", icon: PayslipIcon, sub: true },
    { label: "Salary Structures", href: "/payroll/structures", icon: SalaryIcon, sub: true },
    { label: "Salary Rules", href: "/payroll/rules", icon: SalaryIcon, sub: true },
  ],
  users: [{ label: "User Management", href: "/users", icon: UsersAdminIcon }],
};

export function Sidebar({
  role,
  mobileOpen,
  onNavigate,
}: {
  role: Role;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sections = SIDEBAR_SECTIONS[role] as readonly string[];

  return (
    <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          People<em>Pay</em>360
        </div>
        <div className="brand-sub">HR &amp; Payroll Ledger</div>
      </div>
      <ul className="tabs">
        {sections.map((section) => {
          const links = SECTION_LINKS[section].filter(
            (link) => !link.hideFor?.includes(role),
          );
          if (links.length === 0) return null;
          const isGroup = links.length > 1;
          if (!isGroup) {
            const link = links[0];
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={`tab-btn${active ? " active" : ""}`}
                >
                  <Icon />
                  {link.label}
                </Link>
              </li>
            );
          }
          const [header, ...subLinks] = links;
          return (
            <li key={section}>
              <div className="tab-divider">{header.label}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {subLinks.map((link) => {
                  const active = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className={`tab-btn sub${active ? " active" : ""}`}
                      >
                        <Icon />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-foot">PeoplePay360 · HR &amp; Payroll</div>
    </aside>
  );
}