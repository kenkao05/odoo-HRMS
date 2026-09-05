"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export function CheckInOutWidget({ employeeId }: { employeeId: string }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("attendance")
        .select("id")
        .eq("employee_id", employeeId)
        .is("check_out", null)
        .maybeSingle();
      setCheckedIn(!!data);
    })();
  }, [employeeId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  async function toggle() {
    setLoading(true);
    const endpoint = checkedIn
      ? "/api/attendance/checkout"
      : "/api/attendance/checkin";
    const res = await fetch(endpoint, { method: "POST" });
    const body = await res.json();
    if (!res.ok) {
      push(body.error ?? "Something went wrong");
    } else {
      setCheckedIn(!checkedIn);
      push(checkedIn ? "Checked out" : "Checked in", "success");
    }
    setLoading(false);
  }

  return (
    <div className="card pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span className="num" style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
        {now.toLocaleTimeString()}
      </span>
      <span
        className={`pill ${checkedIn ? "green" : "slate"}`}
        style={{ marginRight: "auto" }}
      >
        <span className="pill-dot" />
        {checkedIn ? "Checked in" : "Not checked in"}
      </span>
      <Button
        variant={checkedIn ? "danger" : "primary"}
        onClick={toggle}
        disabled={loading}
      >
        {checkedIn ? "Check Out" : "Check In"}
      </Button>
    </div>
  );
}
