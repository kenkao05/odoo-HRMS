import { createAdminClient } from "@/lib/supabase/admin";

export interface PayrollWarning {
  type: "missing_bank_details" | "duplicate_payslip";
  employee_id: string;
  message: string;
}

export async function collectValidationWarnings(
  payrunId: string,
): Promise<PayrollWarning[]> {
  const supabase = createAdminClient();
  const warnings: PayrollWarning[] = [];

  const { data: payslips } = await supabase
    .from("payslips")
    .select("id, employee_id, employees(bank_details, name)")
    .eq("payrun_id", payrunId);

  if (!payslips) return warnings;

  const seen = new Set<string>();
  for (const p of payslips as any[]) {
    if (seen.has(p.employee_id)) {
      warnings.push({
        type: "duplicate_payslip",
        employee_id: p.employee_id,
        message: `Duplicate payslip detected for ${p.employees?.name ?? p.employee_id} in this payrun`,
      });
    }
    seen.add(p.employee_id);

    if (!p.employees?.bank_details) {
      warnings.push({
        type: "missing_bank_details",
        employee_id: p.employee_id,
        message: `${p.employees?.name ?? p.employee_id} has no bank details on file`,
      });
    }
  }

  return warnings;
}
