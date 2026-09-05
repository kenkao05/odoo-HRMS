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
    <div className="flex min-h-screen items-center justify-center bg-[#F5EFE0]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-[#FAF6EC] p-8 shadow"
      >
        <h1 className="mb-6 text-center text-xl font-bold text-[#3E2723]">
          PeoplePay360
        </h1>
        <FormField label="Email">
          <input
            type="email"
            required
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password"
            required
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        {error && <p className="mb-4 text-sm text-[#C62828]">{error}</p>}
        <Button type="submit" className="w-full">
          Sign In
        </Button>
        <p className="mt-4 text-center text-xs text-[#8a7a63]">
          Forgot password? Contact your admin.
        </p>
      </form>
    </div>
  );
}
