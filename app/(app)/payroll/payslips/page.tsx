"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[] | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("payslips")
      .select("*, employees(name), payruns(period_start, period_end)")
      .then(({ data }) => setPayslips(data ?? []));
  }, []);

  if (!payslips) return <LoadingBlock label="Loading payslips…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Payslips</h2>
          <p className="sub">Generated breakdown of basic, allowances and deductions per payroll period.</p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (p) => p.employees?.name },
            {
              header: "Period",
              render: (p) =>
                p.payruns
                  ? `${p.payruns.period_start} → ${p.payruns.period_end}`
                  : "--",
            },
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