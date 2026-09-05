import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { landingPageFor } from "@/lib/utils/roles";

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  redirect(landingPageFor(profile?.role ?? "employee"));
}
