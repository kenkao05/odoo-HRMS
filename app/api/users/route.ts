import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validation/user-admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { error: "Forbidden", status: 403 as const };

  return { user };
}

export async function GET() {
  const check = await requireAdmin();
  if ("error" in check)
    return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, employee_id, role, roles, active, employees(name, email)")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if ("error" in check)
    return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { email, roles, employee_id } = parsed.data;

  const admin = createAdminClient();

  // Refuse a second account for an employee who already has one -- the
  // schema's one-profile-per-employee_id isn't a DB constraint, so this
  // avoids silently creating a confusing duplicate.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("employee_id", employee_id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "This employee already has a user account" },
      { status: 409 },
    );
  }

  const tempPassword = randomBytes(9).toString("base64url");

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create auth user" },
      { status: 500 },
    );
  }

  // `role` is intentionally omitted -- the profiles_sync_primary_role
  // trigger derives it from `roles` on insert.
  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    employee_id,
    roles,
    active: true,
  });

  if (profileError) {
    // Don't leave an orphaned auth user with no profile behind.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await admin.from("audit_log").insert({
    table_name: "profiles",
    record_id: created.user.id,
    action: "create_user",
    user_id: check.user.id,
  });

  return NextResponse.json({
    ok: true,
    user_id: created.user.id,
    temp_password: tempPassword,
  });
}