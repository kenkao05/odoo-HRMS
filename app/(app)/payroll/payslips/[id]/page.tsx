"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { PayslipLinesTable } from "@/components/payroll/PayslipLinesTable";

export default function PayslipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payslip, setPayslip] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("payslips")
      .select(
        "*, employees(name, job_position), payruns(period_start, period_end, salary_structures(name)), payslip_lines(*)",
      )
      .eq("id", id)
      .single()
      .then(({ data }) => setPayslip(data));
  }, [id]);

  if (!payslip) return <LoadingBlock label="Loading payslip…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/payroll/payslips" className="section-title link">
          ← Back to Payslips
        </Link>
      </div>

      <div className="payslip-doc" style={{ maxWidth: 560, marginBottom: 18 }}>
        <div className="payslip-head">
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>
              {payslip.employees?.name}
            </div>
            <div className="person-role">{payslip.employees?.job_position ?? "--"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              {payslip.payruns?.period_start} → {payslip.payruns?.period_end}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              {payslip.payruns?.salary_structures?.name}
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge status={payslip.status} />
            </div>
          </div>
        </div>
      </div>

      <p className="sub" style={{ marginBottom: 12 }}>
        Worked Days: {payslip.worked_days ?? "--"}
      </p>

      <PayslipLinesTable
        lines={payslip.payslip_lines ?? []}
        gross={payslip.gross ?? 0}
        net={payslip.net ?? 0}
      />

      <div style={{ marginTop: 16 }}>
        <Button
          variant="secondary"
          onClick={() => window.open(`/api/payslips/${id}/pdf`, "_blank")}
        >
          Print Payslip
        </Button>
      </div>
    </div>
  );
}