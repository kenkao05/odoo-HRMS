import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/lib/validation/user-admin";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
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
  const { error } = await admin
    .from("profiles")
    .update(parsed.data)
    .eq("id", params.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.active === false) {
    await admin.auth.admin.updateUserById(params.id, {
      ban_duration: "876000h",
    }); // effectively permanent
  }
  if (parsed.data.active === true) {
    await admin.auth.admin.updateUserById(params.id, { ban_duration: "none" });
  }

  await admin.from("audit_log").insert({
    table_name: "profiles",
    record_id: params.id,
    action: "update_user",
    user_id: user.id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Password reset endpoint -- sends a reset email rather than actually deleting the account
  const admin = createAdminClient();
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", params.id)
    .single();
  if (!targetProfile)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: targetUser } = await admin.auth.admin.getUserById(params.id);
  if (!targetUser.user?.email)
    return NextResponse.json(
      { error: "User has no email on file" },
      { status: 404 },
    );

  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: targetUser.user.email,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    message: "Password reset link generated",
  });
}
