"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { WarningsCallout } from "@/components/payroll/WarningsCallout";
import { useToast } from "@/components/ui/Toast";

export default function PayrunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [payrun, setPayrun] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<{ message: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const supabase = createClient();

  async function load() {
    const { data: p } = await supabase
      .from("payruns")
      .select("*, salary_structures(name)")
      .eq("id", id)
      .single();
    setPayrun(p);
    const { data: ps } = await supabase
      .from("payslips")
      .select("*, employees(name)")
      .eq("payrun_id", id);
    setPayslips(ps ?? []);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function runAction(
    action: "compute" | "validate" | "mark-paid" | "send-payslips",
  ) {
    setBusy(true);
    const res = await fetch(`/api/payruns/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) {
      push(body.error ?? "Action failed");
      return;
    }
    if (action === "validate") setWarnings(body.warnings ?? []);
    if (action === "send-payslips") {
      push(
        body.note ?? `Sent ${body.sent}${body.failed?.length ? `, ${body.failed.length} failed` : ""}`,
        body.failed?.length ? "error" : "success",
      );
    } else {
      push("Done", "success");
    }
    load();
  }

  if (!payrun) return <LoadingBlock label="Loading payrun…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <Link href="/payroll/payruns" className="section-title link">
            ← Back to Payruns
          </Link>
          <h2 style={{ marginTop: 6 }}>
            {payrun.period_start} → {payrun.period_end}
          </h2>
          <p className="sub">{payrun.salary_structures?.name}</p>
        </div>
        <Badge status={payrun.status} />
      </div>

      <WarningsCallout warnings={warnings} />

      <div className="card pad" style={{ marginBottom: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          disabled={busy || payrun.status !== "draft"}
          onClick={() => runAction("compute")}
        >
          Compute
        </Button>
        <Button
          disabled={busy || payrun.status !== "computed"}
          onClick={() => runAction("validate")}
        >
          Validate
        </Button>
        <Button
          disabled={busy || payrun.status !== "validated"}
          onClick={() => runAction("mark-paid")}
        >
          Mark Paid
        </Button>
        <Button
          variant="secondary"
          disabled={busy || !["validated", "paid"].includes(payrun.status)}
          onClick={() => runAction("send-payslips")}
        >
          Send Payslips
        </Button>
      </div>

      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (p) => p.employees?.name },
            { header: "Gross", render: (p) => p.gross ?? "--", num: true },
            { header: "Net", render: (p) => p.net ?? "--", num: true },
            { header: "Status", render: (p) => <Badge status={p.status} /> },
          ]}
          rows={payslips}
          onRowClick={(p) => router.push(`/payroll/payslips/${p.id}`)}
        />
      </div>
    </div>
  );
}