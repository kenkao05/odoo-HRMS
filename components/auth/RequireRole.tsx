"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types/database.types";
import { useRole } from "@/lib/context/RoleContext";

export function RequireRole({
  allow,
  redirectTo = "/employees",
  children,
}: {
  /** Predicate from lib/utils/roles.ts, e.g. canManageHR, canAccessPayroll, isAdmin */
  allow: (role: Role) => boolean;
  redirectTo?: string;
  children: ReactNode;
}) {
  const role = useRole();
  const router = useRouter();
  const allowed = allow(role);

  useEffect(() => {
    if (!allowed) router.replace(redirectTo);
  }, [allowed, redirectTo, router]);

  if (!allowed) {
    return (
      <div
        className="card pad"
        style={{ maxWidth: 420, margin: "64px auto", textAlign: "center" }}
      >
        <h3>Access restricted</h3>
        <p className="sub">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}