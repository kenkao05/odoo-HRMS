"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Topbar({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between bg-[#F5EFE0] px-6 py-3 border-b border-[#e8e0cf]">
      <div />
      <div className="flex items-center gap-4 text-sm text-[#3E2723]">
        <span>
          {name} <span className="text-[#8a7a63]">({role})</span>
        </span>
        <button onClick={logout} className="text-[#6B4226] underline">
          Logout
        </button>
      </div>
    </header>
  );
}
