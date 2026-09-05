import { z } from "zod";

export const salaryStructureSchema = z.object({
  name: z.string().min(2).max(120),
  active: z.boolean(),
});

export const salaryRuleSchema = z
  .object({
    structure_id: z.string().uuid(),
    name: z.string().min(2).max(120),
    code: z
      .string()
      .regex(/^[A-Z_][A-Z0-9_]*$/, "Code must be UPPER_SNAKE_CASE"),
    category: z.enum(["basic", "allowance", "deduction", "gross", "net"]),
    sequence: z.number().int().min(1).max(999),
    computation_type: z.enum(["fixed", "percentage", "formula"]),
    fixed_amount: z.number().optional().nullable(),
    percentage: z.number().min(0).max(1000).optional().nullable(),
    percentage_of_code: z.string().optional().nullable(),
    formula_expression: z.string().max(300).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.computation_type === "fixed" &&
      (data.fixed_amount === null || data.fixed_amount === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fixed_amount"],
        message: 'Fixed amount is required for computation type "fixed"',
      });
    }
    if (
      data.computation_type === "percentage" &&
      (data.percentage == null || !data.percentage_of_code)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["percentage"],
        message:
          'Percentage and target rule code are required for computation type "percentage"',
      });
    }
    if (data.computation_type === "formula" && !data.formula_expression) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["formula_expression"],
        message:
          'Formula expression is required for computation type "formula"',
      });
    }
  });

export type SalaryRuleInput = z.infer<typeof salaryRuleSchema>;
