"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useToast } from "@/components/ui/Toast";

export default function TimeOffRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<any>(null);
  const [canDecide, setCanDecide] = useState(false);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("time_off_requests")
        .select("*, employees(name), time_off_types(name)")
        .eq("id", id)
        .single();
      setRequest(data);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setCanDecide(
          ["hr_manager", "hr_payroll_user", "hr_payroll_manager", "admin"].includes(
            profile?.role ?? "",
          ),
        );
      }
    })();
  }, [id]);

  async function decide(decision: "approved" | "refused") {
    const res = await fetch(`/api/time-off-requests/${id}/decide`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
    const body = await res.json();
    if (!res.ok) {
      push(body.error ?? "Failed");
      return;
    }
    push(`Request ${decision}`, "success");
    setRequest({ ...request, status: decision });
  }

  if (!request) return <LoadingBlock label="Loading request…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/time-off/requests" className="section-title link">
          ← Back to Requests
        </Link>
      </div>
      <div className="card pad" style={{ maxWidth: 420 }}>
        <div className="dl">
          <dt>Employee</dt>
          <dd>{request.employees?.name}</dd>
        </div>
        <div className="dl">
          <dt>Type</dt>
          <dd>{request.time_off_types?.name}</dd>
        </div>
        <div className="dl">
          <dt>Dates</dt>
          <dd>
            {request.start_date} → {request.end_date}
          </dd>
        </div>
        <div className="dl">
          <dt>Reason</dt>
          <dd>{request.reason ?? "--"}</dd>
        </div>
        <hr className="rule" />
        <div style={{ marginBottom: 14 }}>
          <Badge status={request.status} />
        </div>
        {canDecide && request.status === "pending" && (
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => decide("approved")}>Approve</Button>
            <Button variant="danger" onClick={() => decide("refused")}>
              Refuse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
