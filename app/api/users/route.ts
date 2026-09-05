import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validation/user-admin";

export async function GET() {
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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, role, active, employee_id, employees(name, email)",
    );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(req: Request) {
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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: parsed.data.email,
      email_confirm: true,
      password: crypto.randomUUID(), // temp password; user resets via "forgot password"
      user_metadata: { name: parsed.data.name },
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create auth user" },
      { status: 500 },
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    employee_id: parsed.data.employee_id ?? null,
    role: parsed.data.role,
    active: true,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id); // roll back the orphaned auth user
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await admin.from("audit_log").insert({
    table_name: "profiles",
    record_id: created.user.id,
    action: "create_user",
    user_id: user.id,
  });

  return NextResponse.json({ id: created.user.id }, { status: 201 });
}