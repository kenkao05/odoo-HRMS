"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ROLE_LABEL: Record<string, string> = {
  employee: "Employee",
  hr_manager: "HR Manager",
  hr_payroll_user: "HR Payroll User",
  hr_payroll_manager: "HR Payroll Manager",
  admin: "Admin",
};

export function Topbar({
  name,
  role,
  onMenuClick,
}: {
  name: string;
  role: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={onMenuClick}>
          <span />
        </button>
        <div className="topbar-greet">
          <h1>Welcome back, {name}</h1>
          <p>{today}</p>
        </div>
      </div>
      <div className="role-stamp">
        <span className="rs-label">VIEWING AS</span>
        <span className="rs-value">{ROLE_LABEL[role] ?? role}</span>
        <button
          className="rs-chevron"
          style={{ border: "none", cursor: "pointer" }}
          title="Log out"
          onClick={logout}
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
