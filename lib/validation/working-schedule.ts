import { z } from "zod";

export const scheduleDaySchema = z
  .object({
    day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable(),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable(),
    break_minutes: z.number().int().min(0).max(480),
  })
  .refine((d) => !d.start_time || !d.end_time || d.end_time > d.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const workingScheduleSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.string().max(60),
  days: z.array(scheduleDaySchema).min(1, "At least one working day required"),
});

export type WorkingScheduleInput = z.infer<typeof workingScheduleSchema>;
