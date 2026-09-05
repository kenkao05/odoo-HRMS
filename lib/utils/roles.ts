import type { Role } from "@/lib/types/database.types";

export function canAccessPayroll(role: Role) {
  return role === "hr_payroll" || role === "admin";
}

export function isAdmin(role: Role) {
  return role === "admin";
}

export function landingPageFor(role: Role) {
  return role === "employee" ? "/employees" : "/dashboard";
}

export const SIDEBAR_SECTIONS = {
  employee: ["employees", "attendance", "time-off"],
  hr_payroll: [
    "dashboard",
    "employees",
    "contracts",
    "working-schedules",
    "attendance",
    "time-off",
    "payroll",
  ],
  admin: [
    "dashboard",
    "employees",
    "contracts",
    "working-schedules",
    "attendance",
    "time-off",
    "payroll",
    "users",
  ],
} as const;
