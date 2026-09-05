"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  // Supabase's client picks up the recovery tokens from the URL hash on
  // load (detectSessionInUrl is on by default) and fires this event once
  // that session is ready -- that's our signal the link was valid.
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { push } = useToast();

  useEffect(() => {
    let sessionFound = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        sessionFound = true;
        setReady(true);
      }
    });

    // If the event already fired before this listener attached, a session
    // will already be present -- treat that as valid too.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        sessionFound = true;
        setReady(true);
      }
    });

    const timeout = setTimeout(() => {
      if (!sessionFound) setInvalid(true);
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.auth.signOut();
    push("Password updated -- sign in with your new password", "success");
    router.push("/login");
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--paper)" }}
    >
      <div className="card pad w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="brand-mark" style={{ color: "var(--ink)" }}>
            People<em style={{ color: "var(--green)" }}>Pay</em>360
          </div>
          <div className="brand-sub" style={{ color: "var(--ink-faint)" }}>
            Set a new password
          </div>
        </div>

        {invalid && !ready ? (
          <p className="text-sm" style={{ color: "var(--brick)" }}>
            This reset link is invalid or has expired. Ask your admin to send
            a new one.
          </p>
        ) : !ready ? (
          <p className="sub text-center">Checking your reset link…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField label="New password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <FormField label="Confirm new password">
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </FormField>
            {error && (
              <p className="mb-4 text-sm" style={{ color: "var(--brick)" }}>
                {error}
              </p>
            )}
            <Button type="submit" className="w-full justify-center" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}