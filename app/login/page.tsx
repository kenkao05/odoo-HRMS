"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { landingPageFor } from "@/lib/utils/roles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password },
    );
    if (signInError || !data.user) {
      setError(signInError?.message ?? "Sign-in failed");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", data.user.id)
      .single();
    if (!profile?.active) {
      setError("This account has been deactivated");
      await supabase.auth.signOut();
      return;
    }
    router.push(landingPageFor(profile.role));
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--paper)" }}
    >
      <form onSubmit={handleSubmit} className="card pad w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="brand-mark" style={{ color: "var(--ink)" }}>
            People<em style={{ color: "var(--green)" }}>Pay</em>360
          </div>
          <div className="brand-sub" style={{ color: "var(--ink-faint)" }}>
            HR &amp; Payroll Ledger
          </div>
        </div>
        <FormField label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        {error && (
          <p className="mb-4 text-sm" style={{ color: "var(--brick)" }}>
            {error}
          </p>
        )}
        <Button type="submit" className="w-full justify-center">
          Sign In
        </Button>
        <p
          className="mt-4 text-center text-xs"
          style={{ color: "var(--ink-faint)" }}
        >
          Forgot password? Contact your admin.
        </p>
      </form>
    </div>
  );
}
