import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dashboardQuerySchema } from "@/lib/validation/payrun";
import { isContractNeedingAttention } from "@/lib/utils/dates";

export async function GET(req: Request) {
  const supabase = createClient();
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
  if (!profile || !["hr_payroll", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const parsed = dashboardQuerySchema.safeParse({
    period: url.searchParams.get("period") ?? undefined,
    department_id: url.searchParams.get("department_id") ?? undefined,
    employee_type: url.searchParams.get("employee_type") ?? undefined,
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });

  const { data: payslips } = await supabase
    .from("payslips")
    .select("net, status, employees(department_id, employee_type)");

  const filtered = (payslips ?? []).filter((p: any) => {
    if (
      parsed.data.department_id &&
      p.employees?.department_id !== parsed.data.department_id
    )
      return false;
    if (
      parsed.data.employee_type &&
      p.employees?.employee_type !== parsed.data.employee_type
    )
      return false;
    return true;
  });

  const totalNetPaid = filtered
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + p.net, 0);
  const payslipsGenerated = filtered.length;
  const averageSalary = payslipsGenerated
    ? filtered.reduce((s: number, p: any) => s + p.net, 0) / payslipsGenerated
    : 0;

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name");
  const salaryByDept = (departments ?? []).map((d) => ({
    department: d.name,
    total: filtered
      .filter((p: any) => p.employees?.department_id === d.id)
      .reduce((s: number, p: any) => s + p.net, 0),
  }));

  const { data: timeOff } = await supabase
    .from("time_off_requests")
    .select("status, duration");
  const approvedDays = (timeOff ?? [])
    .filter((t) => t.status === "approved")
    .reduce((s, t) => s + t.duration, 0);
  const pendingCount = (timeOff ?? []).filter(
    (t) => t.status === "pending",
  ).length;

  const { data: attendance } = await supabase
    .from("attendance")
    .select("status");
  const attCounts = { present: 0, late: 0, absent: 0, missing_checkout: 0 };
  for (const a of attendance ?? [])
    attCounts[a.status as keyof typeof attCounts]++;
  const totalAtt = Object.values(attCounts).reduce((a, b) => a + b, 0) || 1;
  const attendanceHealth = Math.round(
    ((attCounts.present + attCounts.late) / totalAtt) * 100,
  );

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, end_date, status, employees(name)");
  const alerts = (contracts ?? [])
    .filter((c: any) => isContractNeedingAttention(c.end_date, c.status))
    .map((c: any) => ({
      type: "contract_expiring",
      message: `${c.employees?.name}'s contract ends ${c.end_date}`,
      record_id: c.id,
    }));

  return NextResponse.json({
    kpis: {
      totalNetPaid,
      payslipsGenerated,
      averageSalary,
      approvedTimeOffDays: approvedDays,
      attendanceHealth,
    },
    salaryByDept,
    alerts,
    attendanceOverview: attCounts,
    timeOffOverview: { approvedDays, pendingCount },
  });
}
