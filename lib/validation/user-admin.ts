import { z } from "zod";

const roleEnum = z.enum([
  "employee",
  "hr_manager",
  "hr_payroll_user",
  "hr_payroll_manager",
  "admin",
]);

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: roleEnum,
  employee_id: z.string().uuid().nullable().optional(),
});

export const updateUserSchema = z.object({
  active: z.boolean().optional(),
  role: roleEnum.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
