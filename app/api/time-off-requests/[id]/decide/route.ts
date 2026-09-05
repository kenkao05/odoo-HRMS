import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { timeOffDecisionSchema } from "@/lib/validation/time-off";

export async function POST(
  req: Request,
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

  const body = await req.json();
  const parsed = timeOffDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { data: request_, error: fetchError } = await supabase
    .from("time_off_requests")
    .select("*, time_off_types(requires_allocation)")
    .eq("id", id)
    .single();

  if (fetchError || !request_)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request_.status !== "pending")
    return NextResponse.json(
      { error: "Request already decided" },
      { status: 409 },
    );

  const { error: updateError } = await supabase
    .from("time_off_requests")
    .update({
      status: parsed.data.decision,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (
    parsed.data.decision === "approved" &&
    (request_ as any).time_off_types?.requires_allocation
  ) {
    const { data: allocation } = await supabase
      .from("allocations")
      .select("id, taken")
      .eq("employee_id", request_.employee_id)
      .eq("type_id", request_.type_id)
      .eq("status", "approved")
      .order("valid_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (allocation) {
      await supabase
        .from("allocations")
        .update({ taken: allocation.taken + request_.duration })
        .eq("id", allocation.id);
    }
  }

  return NextResponse.json({ ok: true, status: parsed.data.decision });
}