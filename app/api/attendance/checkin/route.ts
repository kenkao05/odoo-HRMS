import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("id", user.id)
    .single();
  if (!profile?.employee_id)
    return NextResponse.json(
      { error: "No linked employee record" },
      { status: 400 },
    );

  const { data: openRow } = await supabase
    .from("attendance")
    .select("id")
    .eq("employee_id", profile.employee_id)
    .is("check_out", null)
    .maybeSingle();

  if (openRow) {
    return NextResponse.json(
      { error: "Already checked in -- check out first" },
      { status: 409 },
    );
  }

  const now = new Date();
  const isLate =
    now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      employee_id: profile.employee_id,
      check_in: now.toISOString(),
      status: isLate ? "late" : "present",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}