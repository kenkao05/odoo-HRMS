import { z } from "zod";

export const attendanceCorrectionSchema = z
  .object({
    check_in: z.string().datetime(),
    check_out: z.string().datetime().nullable().optional(),
    status: z.enum(["present", "late", "absent", "missing_checkout"]),
  })
  .refine((d) => !d.check_out || d.check_out > d.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export type AttendanceCorrectionInput = z.infer<
  typeof attendanceCorrectionSchema
>;
