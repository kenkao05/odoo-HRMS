import { z } from "zod";

export const timeOffTypeSchema = z.object({
  name: z.string().min(2).max(80),
  unit: z.enum(["days", "hours"]),
  requires_allocation: z.boolean(),
  requires_approval: z.boolean(),
});

export const timeOffRequestSchema = z
  .object({
    employee_id: z.string().uuid(),
    type_id: z.string().uuid(),
    start_date: z.string().date(),
    end_date: z.string().date(),
    duration: z.number().positive(),
    reason: z.string().max(500).optional().or(z.literal("")),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

export const timeOffDecisionSchema = z.object({
  decision: z.enum(["approved", "refused"]),
  reason: z.string().max(500).optional(),
});

export const allocationSchema = z.object({
  employee_id: z.string().uuid(),
  type_id: z.string().uuid(),
  allocated: z.number().nonnegative(),
  valid_from: z.string().date(),
  valid_to: z.string().date().nullable().optional(),
  status: z.enum(["pending", "approved"]),
});

export type TimeOffRequestInput = z.infer<typeof timeOffRequestSchema>;
export type TimeOffDecisionInput = z.infer<typeof timeOffDecisionSchema>;
export type AllocationInput = z.infer<typeof allocationSchema>;
