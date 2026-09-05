import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingGate } from "@/components/layout/LoadingGate";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active, employees(name)")
    .eq("id", user.id)
    .single();

  if (!profile?.active) redirect("/login");

  return (
    <AppShell
      role={profile.role as any}
      name={(profile as any).employees?.name ?? user.email ?? "User"}
    >
      <LoadingGate>{children}</LoadingGate>
    </AppShell>
  );
}