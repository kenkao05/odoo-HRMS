"use client";
import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { Role } from "@/lib/types/database.types";

export function AppShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="shell">
      <div
        className={`sidebar-scrim${mobileOpen ? " show" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <Sidebar role={role} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      <div>
        <Topbar name={name} role={role} onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="view-main">{children}</main>
      </div>
    </div>
  );
}
