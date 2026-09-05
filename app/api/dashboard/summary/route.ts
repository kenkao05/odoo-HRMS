import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dashboardQuerySchema } from "@/lib/validation/payrun";
import { isContractNeedingAttention, periodToRange } from "@/lib/utils/dates";

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const parsed = dashboardQuerySchema.safeParse({
    period: url.searchParams.get("period") ?? undefined,
    department_id: url.searchParams.get("department_id") ?? undefined,
    employee_type: url.searchParams.get("employee_type") ?? undefined,
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });

  const range = periodToRange(parsed.data.period);

  const { data: payslips } = await supabase
    .from("payslips")
    .select(
      "net, status, employees(department_id, employee_type), payruns(period_start, period_end)",
    );

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
    if (range) {
      const periodStart = p.payruns?.period_start;
      if (!periodStart) return false;
      const start = new Date(periodStart);
      if (start < range.from || start > range.to) return false;
    }
    return true;
  });

  const totalNetPaid = filtered
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + p.net, 0);
  const payslipsGenerated = filtered.length;
  const averageSalary = payslipsGenerated
    ? filtered.reduce((s: number, p: any) => s + p.net, 0) / payslipsGenerated
    : 0;

  const statusCounts = { draft: 0, computed: 0, validated: 0, paid: 0 };
  for (const p of filtered as any[]) {
    if (p.status in statusCounts) {
      statusCounts[p.status as keyof typeof statusCounts]++;
    }
  }
  const payslipStatusBreakdown = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));

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
    .select("status, duration, start_date, end_date");
  const timeOffInRange = (timeOff ?? []).filter((t: any) => {
    if (!range) return true;
    const start = new Date(t.start_date);
    const end = new Date(t.end_date);
    return start <= range.to && end >= range.from;
  });
  const approvedDays = timeOffInRange
    .filter((t) => t.status === "approved")
    .reduce((s, t) => s + t.duration, 0);
  const pendingCount = timeOffInRange.filter(
    (t) => t.status === "pending",
  ).length;

  const { data: attendance } = await supabase
    .from("attendance")
    .select("status, check_in");
  const attendanceInRange = (attendance ?? []).filter((a: any) => {
    if (!range) return true;
    const checkIn = new Date(a.check_in);
    return checkIn >= range.from && checkIn <= range.to;
  });
  const attCounts = { present: 0, late: 0, absent: 0, missing_checkout: 0 };
  for (const a of attendanceInRange)
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
    payslipStatusBreakdown,
    salaryByDept,
    alerts,
    attendanceOverview: attCounts,
    timeOffOverview: { approvedDays, pendingCount },
  });
}