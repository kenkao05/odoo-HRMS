"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("payslips")
      .select("*, employees(name), payruns(period_start, period_end)")
      .then(({ data }) => setPayslips(data ?? []));
  }, []);

  return (
    <Table
      columns={[
        { header: "Employee", render: (p) => p.employees?.name },
        {
          header: "Period",
          render: (p) =>
            p.payruns
              ? `${p.payruns.period_start} -> ${p.payruns.period_end}`
              : "--",
        },
        { header: "Gross", render: (p) => p.gross ?? "--" },
        { header: "Net", render: (p) => p.net ?? "--" },
        { header: "Status", render: (p) => <Badge status={p.status} /> },
      ]}
      rows={payslips}
      onRowClick={(p) => router.push(`/payroll/payslips/${p.id}`)}
    />
  );
}
