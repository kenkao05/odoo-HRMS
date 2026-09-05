import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  department_id: z.string().uuid().nullable().optional(),
  manager_id: z.string().uuid().nullable().optional(),
  job_position: z.string().max(120).optional().or(z.literal("")),
  schedule_id: z.string().uuid().nullable().optional(),
  employee_type: z.enum(["full_time", "part_time", "contract"]),
  bank_details: z.string().max(255).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
