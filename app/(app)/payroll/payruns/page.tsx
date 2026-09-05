"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PayrunWizard } from "@/components/payroll/PayrunWizard";
import { createClient } from "@/lib/supabase/client";

export default function PayrunsPage() {
  const [payruns, setPayruns] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("payruns")
      .select("*, salary_structures(name), payslips(count)")
      .order("period_start", { ascending: false });
    setPayruns(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setWizardOpen(true)}>New Pay Run</Button>
      </div>
      <Table
        columns={[
          {
            header: "Period",
            render: (p) => `${p.period_start} -> ${p.period_end}`,
          },
          {
            header: "Structure",
            render: (p) => p.salary_structures?.name ?? "--",
          },
          { header: "Status", render: (p) => <Badge status={p.status} /> },
          {
            header: "# Payslips",
            render: (p) => p.payslips?.[0]?.count ?? 0,
          },
        ]}
        rows={payruns}
        onRowClick={(p) => router.push(`/payroll/payruns/${p.id}`)}
      />
      <PayrunWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          load();
        }}
      />
    </div>
  );
}
