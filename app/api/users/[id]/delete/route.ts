import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (id === user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .single();
  if (!target)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Can't delete the last remaining admin" },
        { status: 400 },
      );
    }
  }

  // Deleting the auth user cascades to the profiles row (profiles.id
  // references auth.users(id) on delete cascade) -- the linked employee
  // record itself is untouched, so a new account can be created for them.
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("audit_log").insert({
    table_name: "profiles",
    record_id: id,
    action: "delete_user",
    user_id: user.id,
  });

  return NextResponse.json({ ok: true });
}