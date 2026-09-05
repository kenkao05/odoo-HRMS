import { ReactNode } from "react";
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
  return (
    <div className="flex min-h-screen bg-[#FAF6EC]">
      <Sidebar role={role} />
      <div className="flex-1">
        <Topbar name={name} role={role} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
