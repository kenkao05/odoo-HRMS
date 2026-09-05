import { z } from "zod";

export const payrunCreateSchema = z
  .object({
    structure_id: z.string().uuid(),
    period_start: z.string().date(),
    period_end: z.string().date(),
    employee_ids: z
      .array(z.string().uuid())
      .min(1, "Select at least one employee"),
  })
  .refine((d) => d.period_end >= d.period_start, {
    message: "Period end must be after period start",
    path: ["period_end"],
  });

export const dashboardQuerySchema = z.object({
  period: z
    .enum(["this_month", "last_month", "this_quarter", "this_year"])
    .optional(),
  department_id: z.string().uuid().optional(),
  employee_type: z.enum(["full_time", "part_time", "contract"]).optional(),
});

export type PayrunCreateInput = z.infer<typeof payrunCreateSchema>;