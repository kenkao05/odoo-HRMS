"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { PayrunWizard } from "@/components/payroll/PayrunWizard";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function PayrunsPageInner() {
  const [payruns, setPayruns] = useState<any[] | null>(null);
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
      <div className="view-head">
        <div>
          <h2>Payruns</h2>
          <p className="sub">
            Payroll processing batches for a period — select a scope and eligible employees, then compute and pay.
          </p>
        </div>
        <div className="actions">
          <Button onClick={() => setWizardOpen(true)}>+ New Pay Run</Button>
        </div>
      </div>

      {!payruns ? (
        <LoadingBlock label="Loading payruns…" />
      ) : (
        <div className="card">
          <Table
            columns={[
              {
                header: "Period",
                render: (p) => `${p.period_start} → ${p.period_end}`,
              },
              {
                header: "Structure",
                render: (p) => p.salary_structures?.name ?? "--",
              },
              { header: "Status", render: (p) => <Badge status={p.status} /> },
              {
                header: "# Payslips",
                render: (p) => p.payslips?.[0]?.count ?? 0,
                num: true,
              },
            ]}
            rows={payruns}
            onRowClick={(p) => router.push(`/payroll/payruns/${p.id}`)}
          />
        </div>
      )}

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

export default function PayrunsPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <PayrunsPageInner />
    </RequireRole>
  );
}