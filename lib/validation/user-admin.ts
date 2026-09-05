import { z } from "zod";

const roleEnum = z.enum([
  "employee",
  "hr_manager",
  "hr_payroll_user",
  "hr_payroll_manager",
  "admin",
]);

export const createUserSchema = z.object({
  email: z.string().email(),
  roles: z.array(roleEnum).min(1, "Select at least one role"),
  employee_id: z.string().uuid({ message: "Please select an employee" }),
});

export const updateUserSchema = z.object({
  active: z.boolean().optional(),
  roles: z.array(roleEnum).min(1, "Select at least one role").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;