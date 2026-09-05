"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export function CheckInOutWidget({ employeeId }: { employeeId: string }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <div className="flex items-center gap-3 rounded-md bg-[#FAF6EC] px-3 py-2 border border-[#e8e0cf]">
      <span className="text-sm text-[#3E2723]">
        {new Date().toLocaleTimeString()}
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
