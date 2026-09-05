"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
        setCanDecide(["hr_payroll", "admin"].includes(profile?.role ?? ""));
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

  if (!request) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div className="max-w-md rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="mb-1 text-sm text-[#3E2723]">
        <span className="font-medium">Employee:</span> {request.employees?.name}
      </p>
      <p className="mb-1 text-sm text-[#3E2723]">
        <span className="font-medium">Type:</span>{" "}
        {request.time_off_types?.name}
      </p>
      <p className="mb-1 text-sm text-[#3E2723]">
        <span className="font-medium">Dates:</span> {request.start_date} -&gt;{" "}
        {request.end_date}
      </p>
      <p className="mb-1 text-sm text-[#3E2723]">
        <span className="font-medium">Reason:</span> {request.reason ?? "--"}
      </p>
      <div className="my-3">
        <Badge status={request.status} />
      </div>
      {canDecide && request.status === "pending" && (
        <div className="flex gap-2">
          <Button onClick={() => decide("approved")}>Approve</Button>
          <Button variant="danger" onClick={() => decide("refused")}>
            Refuse
          </Button>
        </div>
      )}
    </div>
  );
}
