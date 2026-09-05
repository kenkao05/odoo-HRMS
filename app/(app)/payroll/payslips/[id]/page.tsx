"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

  if (!payslip) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#3E2723]">
            {payslip.employees?.name}
          </h1>
          <p className="text-sm text-[#8a7a63]">
            {payslip.payruns?.salary_structures?.name} --{" "}
            {payslip.payruns?.period_start} -&gt; {payslip.payruns?.period_end}
            {" -- "}
            Worked Days: {payslip.worked_days ?? "--"}
          </p>
        </div>
        <Badge status={payslip.status} />
      </div>

      <PayslipLinesTable
        lines={payslip.payslip_lines ?? []}
        gross={payslip.gross ?? 0}
        net={payslip.net ?? 0}
      />

      <div className="mt-4">
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
