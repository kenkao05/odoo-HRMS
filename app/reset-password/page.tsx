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
    let settled = false;
    const markReady = () => {
      if (!settled) {
        settled = true;
        setReady(true);
      }
    };

    // The recovery tokens only ever exist in this page's URL hash (they're
    // never sent to the server). Parse and apply them explicitly instead
    // of trusting whatever session already happens to be active in this
    // browser -- previously, an admin who was already logged into their
    // own account in the same browser would have that account's session
    // picked up by getSession() and wrongly treated as a valid recovery
    // session, causing the admin's own password to be changed instead of
    // the target user's.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) setInvalid(true);
          else markReady();
        });
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    const timeout = setTimeout(() => {
      if (!settled) setInvalid(true);
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