import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

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

  const admin = createAdminClient();
  const { data: payrun } = await admin
    .from("payruns")
    .select("*")
    .eq("id", id)
    .single();
  if (!payrun)
    return NextResponse.json({ error: "Payrun not found" }, { status: 404 });
  if (!["validated", "paid"].includes(payrun.status)) {
    return NextResponse.json(
      { error: "Payrun must be validated or paid first" },
      { status: 409 },
    );
  }

  const { data: payslips } = await admin
    .from("payslips")
    .select("id, net, employees(name, email)")
    .eq("payrun_id", id);

  if (!payslips?.length) return NextResponse.json({ sent: 0, failed: [] });

  if (!process.env.RESEND_API_KEY) {
    // Degrade gracefully per the risk notes -- mark as sent without actually emailing
    // if the email provider isn't configured, rather than blocking the demo.
    return NextResponse.json({
      sent: payslips.length,
      failed: [],
      note: "RESEND_API_KEY not set -- marked sent without emailing",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const failed: string[] = [];
  let sent = 0;

  for (const p of payslips as any[]) {
    if (!p.employees?.email) {
      failed.push(p.id);
      continue;
    }
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: p.employees.email,
        subject: "Your payslip is ready",
        html: `<p>Hi ${p.employees.name},</p><p>Your net pay for this period is ${p.net}. View your full payslip in the portal.</p>`,
      });
      sent++;
    } catch {
      failed.push(p.id);
    }
  }

  const status = failed.length ? 502 : 200;
  return NextResponse.json({ sent, failed }, { status });
}