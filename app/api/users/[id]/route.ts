import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/lib/validation/user-admin";
import { siteUrl } from "@/lib/utils/site-url";

export async function PATCH(
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
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.active === false) {
    await admin.auth.admin.updateUserById(id, {
      ban_duration: "876000h",
    }); // effectively permanent
  }
  if (parsed.data.active === true) {
    await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
  }

  await admin.from("audit_log").insert({
    table_name: "profiles",
    record_id: id,
    action: "update_user",
    user_id: user.id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Password reset endpoint -- sends a reset email rather than actually deleting the account
  const admin = createAdminClient();
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();
  if (!targetProfile)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: targetUser } = await admin.auth.admin.getUserById(id);
  if (!targetUser.user?.email)
    return NextResponse.json(
      { error: "User has no email on file" },
      { status: 404 },
    );

  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: targetUser.user.email,
    options: { redirectTo: `${siteUrl()}/reset-password` },
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const resetLink = linkData.properties?.action_link ?? null;

  if (!resetLink) {
    return NextResponse.json(
      { error: "Reset link could not be generated" },
      { status: 500 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    // Degrade gracefully, same as send-payslips: if email isn't configured
    // yet, hand the link back so the admin can share it manually rather
    // than blocking the demo.
    return NextResponse.json({
      ok: true,
      emailed: false,
      email: targetUser.user.email,
      reset_link: resetLink,
      note: "RESEND_API_KEY not set -- link returned instead of emailed",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: targetUser.user.email,
      subject: "Reset your PeoplePay360 password",
      html: `<p>A password reset was requested for your PeoplePay360 account.</p><p><a href="${resetLink}">Click here to set a new password</a>. If you didn't request this, you can ignore this email.</p>`,
    });
  } catch {
    // Email failed to send -- fall back to returning the link so the
    // admin isn't stuck with no way to help the user.
    return NextResponse.json({
      ok: true,
      emailed: false,
      email: targetUser.user.email,
      reset_link: resetLink,
      note: "Email failed to send -- link returned instead",
    });
  }

  return NextResponse.json({
    ok: true,
    emailed: true,
    email: targetUser.user.email,
  });
}