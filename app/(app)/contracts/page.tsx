"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/dates";

function ContractsPageInner() {
  const [contracts, setContracts] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
    let query = supabase
      .from("contracts")
      .select("*, employees(name), salary_structures(name)");
    if (employeeFilter) query = query.eq("employee_id", employeeFilter);
    query.then(({ data }) => setContracts(data ?? []));
  }, [employeeFilter]);

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Contract history</h2>
          <p className="sub">
            Historical employment terms. Only one contract is active per employee per period.
          </p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (c) => c.employees?.name },
            { header: "Start", render: (c) => c.start_date },
            { header: "End", render: (c) => c.end_date ?? "Ongoing" },
            { header: "Wage", render: (c) => formatCurrency(c.wage), num: true },
            { header: "Structure", render: (c) => c.salary_structures?.name ?? "--" },
            { header: "Status", render: (c) => <Badge status={c.status} /> },
          ]}
          rows={contracts}
          onRowClick={(c) => router.push(`/contracts/${c.id}`)}
          rowStyle={(c) =>
            c.status === "active" ? { background: "var(--green-wash)" } : undefined
          }
        />
      </div>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading contracts…" />}>
      <ContractsPageInner />
    </Suspense>
  );
}
