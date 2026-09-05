export type Role = "employee" | "hr_payroll" | "admin";
export type EmployeeType = "full_time" | "part_time" | "contract";
export type EmployeeStatus = "active" | "inactive";
export type ContractStatus = "active" | "expired" | "draft";
export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "missing_checkout";
export type TimeOffStatus = "pending" | "approved" | "refused";
export type AllocationStatus = "pending" | "approved";
export type SalaryCategory =
  | "basic"
  | "allowance"
  | "deduction"
  | "gross"
  | "net";
export type ComputationType = "fixed" | "percentage" | "formula";
export type PayrunStatus = "draft" | "computed" | "validated" | "paid";

export interface Profile {
  id: string;
  employee_id: string | null;
  role: Role;
  can_edit_salary_config: boolean;
  active: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  manager_id: string | null;
  job_position: string | null;
  schedule_id: string | null;
  employee_type: EmployeeType;
  bank_details: string | null;
  status: EmployeeStatus;
}

export interface Department {
  id: string;
  name: string;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  type: string;
  weekly_hours: number;
}

export interface ScheduleDay {
  id: string;
  schedule_id: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
}

export interface Contract {
  id: string;
  employee_id: string;
  department_id: string | null;
  job_position: string | null;
  start_date: string;
  end_date: string | null;
  wage: number;
  structure_id: string | null;
  status: ContractStatus;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  worked_hours: number | null;
  status: AttendanceStatus;
}

export interface TimeOffType {
  id: string;
  name: string;
  unit: "days" | "hours";
  requires_allocation: boolean;
  requires_approval: boolean;
}

export interface Allocation {
  id: string;
  employee_id: string;
  type_id: string;
  allocated: number;
  taken: number;
  valid_from: string;
  valid_to: string | null;
  status: AllocationStatus;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  type_id: string;
  start_date: string;
  end_date: string;
  duration: number;
  reason: string | null;
  status: TimeOffStatus;
  decided_by: string | null;
  decided_at: string | null;
}

export interface SalaryStructure {
  id: string;
  name: string;
  active: boolean;
}

export interface SalaryRule {
  id: string;
  structure_id: string;
  name: string;
  code: string;
  category: SalaryCategory;
  sequence: number;
  computation_type: ComputationType;
  fixed_amount: number | null;
  percentage: number | null;
  percentage_of_code: string | null;
  formula_expression: string | null;
}

export interface Payrun {
  id: string;
  period_start: string;
  period_end: string;
  structure_id: string;
  status: PayrunStatus;
}

export interface Payslip {
  id: string;
  payrun_id: string;
  employee_id: string;
  contract_id: string | null;
  worked_days: number | null;
  gross: number;
  net: number;
  status: PayrunStatus;
}

export interface PayslipLine {
  id: string;
  payslip_id: string;
  rule_id: string | null;
  name: string;
  category: SalaryCategory;
  amount: number;
}
