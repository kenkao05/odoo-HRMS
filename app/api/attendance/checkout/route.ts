import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hoursBetween } from "@/lib/utils/dates";

const WEEKDAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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
    .select("id, check_in")
    .eq("employee_id", profile.employee_id)
    .is("check_out", null)
    .maybeSingle();

  if (!openRow) {
    return NextResponse.json(
      { error: "No open check-in found" },
      { status: 409 },
    );
  }

  const checkOut = new Date();
  const checkIn = new Date(openRow.check_in);
  const workedHours = Math.max(
    0,
    (checkOut.getTime() - checkIn.getTime()) / 3600000,
  );

  // Overtime is worked hours beyond whatever the employee's schedule
  // defines for the check-in's weekday. No schedule, or no row for that
  // day (e.g. a weekend), means no baseline to compare against -- 0
  // overtime rather than guessing.
  let overtimeHours = 0;
  const { data: employee } = await supabase
    .from("employees")
    .select("schedule_id")
    .eq("id", profile.employee_id)
    .single();

  if (employee?.schedule_id) {
    const dayCode = WEEKDAY_CODES[checkIn.getDay()];
    const { data: scheduleDay } = await supabase
      .from("schedule_days")
      .select("start_time, end_time, break_minutes")
      .eq("schedule_id", employee.schedule_id)
      .eq("day", dayCode)
      .maybeSingle();

    if (scheduleDay) {
      const scheduledHours = hoursBetween(
        scheduleDay.start_time,
        scheduleDay.end_time,
        scheduleDay.break_minutes,
      );
      overtimeHours = Math.max(0, workedHours - scheduledHours);
    }
  }

  const { data, error } = await supabase
    .from("attendance")
    .update({
      check_out: checkOut.toISOString(),
      overtime_hours: Math.round(overtimeHours * 100) / 100,
    })
    .eq("id", openRow.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}