import { z } from "zod";

export const contractSchema = z
  .object({
    employee_id: z.string().uuid(),
    department_id: z.string().uuid().nullable().optional(),
    job_position: z.string().max(120).optional().or(z.literal("")),
    start_date: z.string().date(),
    end_date: z.string().date().nullable().optional(),
    wage: z.number().positive("Wage must be greater than 0"),
    structure_id: z.string().uuid().nullable().optional(),
    status: z.enum(["active", "expired", "draft"]),
  })
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type ContractInput = z.infer<typeof contractSchema>;
