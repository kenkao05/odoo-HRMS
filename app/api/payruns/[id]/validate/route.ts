import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { collectValidationWarnings } from "@/lib/payroll/warnings";

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
  if (!profile || !["hr_payroll", "admin"].includes(profile.role)) {
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
  if (payrun.status !== "computed")
    return NextResponse.json(
      { error: "Payrun must be computed first" },
      { status: 409 },
    );

  const warnings = await collectValidationWarnings(id);

  await admin
    .from("payslips")
    .update({ status: "validated" })
    .eq("payrun_id", id);
  await admin
    .from("payruns")
    .update({ status: "validated" })
    .eq("id", id);
  await admin.from("audit_log").insert({
    table_name: "payruns",
    record_id: id,
    action: "validate",
    user_id: user.id,
  });

  return NextResponse.json({ warnings });
}