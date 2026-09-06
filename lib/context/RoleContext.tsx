"use client";
import { createContext, useContext } from "react";
import type { Role } from "@/lib/types/database.types";

const RoleContext = createContext<Role | null>(null);

export const RoleProvider = RoleContext.Provider;

export function useRole(): Role {
  const role = useContext(RoleContext);
  if (!role) {
    throw new Error("useRole() must be used within <RoleProvider>");
  }
  return role;
}