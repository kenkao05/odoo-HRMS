import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runRuleEngine, RuleEngineError } from "@/lib/payroll/rule-engine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["hr_payroll_user", "hr_payroll_manager", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Uses the admin client because this writes payslips for many employees at
  // once, which the calling user's own RLS-scoped session should not need to
  // do row-by-row -- it's a controlled server-side batch operation.
  const admin = createAdminClient();

  const { data: payrun, error: payrunError } = await admin
    .from("payruns")
    .select("*")
    .eq("id", id)
    .single();
  if (payrunError || !payrun)
    return NextResponse.json({ error: "Payrun not found" }, { status: 404 });
  if (payrun.status !== "draft")
    return NextResponse.json(
      { error: "Payrun already computed" },
      { status: 409 },
    );

  const { data: rules, error: rulesError } = await admin
    .from("salary_rules")
    .select("*")
    .eq("structure_id", payrun.structure_id);
  if (rulesError || !rules?.length)
    return NextResponse.json(
      { error: "No salary rules found for this structure" },
      { status: 400 },
    );

  // Employees are those with an active contract on this structure, already
  // pre-selected into payslip rows by the wizard at creation time.
  const { data: existingPayslips } = await admin
    .from("payslips")
    .select("*")
    .eq("payrun_id", id);
  if (!existingPayslips?.length)
    return NextResponse.json(
      { error: "Payrun has no employees selected" },
      { status: 400 },
    );

  // Resolve each payslip's contract wage. Most payslips already carry a
  // contract_id set at payrun-creation time; the fallback below only
  // matters for rows created without one (e.g. direct inserts, future
  // wizard changes).
  const contractIds = existingPayslips
    .map((p) => p.contract_id)
    .filter((id): id is string => !!id);

  const wageByContractId = new Map<string, number>();
  if (contractIds.length) {
    const { data: contracts } = await admin
      .from("contracts")
      .select("id, wage")
      .in("id", contractIds);
    for (const c of contracts ?? []) wageByContractId.set(c.id, c.wage);
  }

  const missingContractEmployeeIds = existingPayslips
    .filter((p) => !p.contract_id)
    .map((p) => p.employee_id);

  const wageByEmployeeId = new Map<string, number>();
  if (missingContractEmployeeIds.length) {
    const { data: fallbackContracts } = await admin
      .from("contracts")
      .select("id, employee_id, wage")
      .eq("structure_id", payrun.structure_id)
      .eq("status", "active")
      .in("employee_id", missingContractEmployeeIds);
    for (const c of fallbackContracts ?? [])
      wageByEmployeeId.set(c.employee_id, c.wage);
  }

  const results = [];
  for (const payslip of existingPayslips) {
    try {
      const wage = payslip.contract_id
        ? wageByContractId.get(payslip.contract_id)
        : wageByEmployeeId.get(payslip.employee_id);

      if (wage == null) {
        return NextResponse.json(
          {
            error: `Could not resolve a contract wage for payslip ${payslip.id} (employee ${payslip.employee_id})`,
          },
          { status: 400 },
        );
      }

      const { lines, gross, net } = runRuleEngine(rules as any, {
        CONTRACT_WAGE: wage,
      });

      await admin.from("payslip_lines").delete().eq("payslip_id", payslip.id);
      await admin.from("payslip_lines").insert(
        lines.map((l) => ({
          payslip_id: payslip.id,
          rule_id: l.rule_id,
          name: l.name,
          category: l.category,
          amount: l.amount,
        })),
      );
      await admin
        .from("payslips")
        .update({ gross, net, status: "computed" })
        .eq("id", payslip.id);
      results.push({ payslip_id: payslip.id, gross, net });
    } catch (e) {
      const message =
        e instanceof RuleEngineError ? e.message : "Unknown computation error";
      return NextResponse.json(
        { error: `Computation failed for payslip ${payslip.id}: ${message}` },
        { status: 500 },
      );
    }
  }

  await admin
    .from("payruns")
    .update({ status: "computed" })
    .eq("id", id);
  await admin.from("audit_log").insert({
    table_name: "payruns",
    record_id: id,
    action: "compute",
    user_id: user.id,
  });

  return NextResponse.json({ payslips: results });
}