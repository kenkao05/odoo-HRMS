import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["employee", "hr_payroll", "admin"]),
  employee_id: z.string().uuid().nullable().optional(),
  can_edit_salary_config: z.boolean().optional().default(false),
});

export const updateUserSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["employee", "hr_payroll", "admin"]).optional(),
  can_edit_salary_config: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
