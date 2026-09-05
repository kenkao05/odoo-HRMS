"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types/database.types";
import { SIDEBAR_SECTIONS } from "@/lib/utils/roles";

const LINKS: Record<string, { label: string; href: string }[]> = {
  dashboard: [{ label: "Dashboard", href: "/dashboard" }],
  employees: [{ label: "Employees", href: "/employees" }],
  contracts: [{ label: "Contracts", href: "/contracts" }],
  "working-schedules": [
    { label: "Working Schedules", href: "/working-schedules" },
  ],
  attendance: [{ label: "Attendance", href: "/attendance" }],
  "time-off": [
    { label: "Time Off Requests", href: "/time-off/requests" },
    { label: "Allocations", href: "/time-off/allocations" },
    { label: "Time Off Types", href: "/time-off/types" },
  ],
  payroll: [
    { label: "Payruns", href: "/payroll/payruns" },
    { label: "Payslips", href: "/payroll/payslips" },
    { label: "Salary Structures", href: "/payroll/structures" },
    { label: "Salary Rules", href: "/payroll/rules" },
  ],
  users: [{ label: "User Management", href: "/users" }],
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const sections = SIDEBAR_SECTIONS[role];

  return (
    <aside className="w-64 shrink-0 bg-[#3E2723] p-4 text-[#F5EFE0]">
      <div className="mb-6 px-2 text-lg font-bold">PeoplePay360</div>
      <nav className="space-y-1">
        {sections
          .flatMap((s) => LINKS[s])
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm ${pathname.startsWith(link.href) ? "bg-[#6B4226]" : "hover:bg-[#4d332c]"}`}
            >
              {link.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
