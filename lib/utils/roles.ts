import type { Role } from "@/lib/types/database.types";

/** HR Payroll User, HR Payroll Manager, Admin -- dashboard, payruns, payslips. */
export function canAccessPayroll(role: Role) {
  return (
    role === "hr_payroll_user" ||
    role === "hr_payroll_manager" ||
    role === "admin"
  );
}

/** Everyone except a plain Employee -- Employees/Contracts/Schedules/Attendance/Time Off. */
export function canManageHR(role: Role) {
  return role !== "employee";
}

/** Only HR Payroll Manager and Admin get full CRUD on Salary Structures/Rules
 *  and delete rights on Payruns/Payslips. HR Payroll User is CRU-only. */
export function canEditSalaryConfig(role: Role) {
  return role === "hr_payroll_manager" || role === "admin";
}

export function isAdmin(role: Role) {
  return role === "admin";
}

export function landingPageFor(role: Role) {
  // Only the two payroll roles and admin land on the payroll dashboard.
  return canAccessPayroll(role) ? "/dashboard" : "/employees";
}

export const SIDEBAR_SECTIONS = {
  employee: ["employees", "attendance", "time-off"],
  hr_manager: [
    "employees",
    "contracts",
    "working-schedules",
    "attendance",
    "time-off",
  ],
  hr_payroll_user: [
    "dashboard",
    "employees",
    "contracts",
    "working-schedules",
    "attendance",
    "time-off",
    "payroll",
  ],
  hr_payroll_manager: [
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
