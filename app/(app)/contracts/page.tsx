"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

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
    <Table
      columns={[
        { header: "Employee", render: (c) => c.employees?.name },
        { header: "Start", render: (c) => c.start_date },
        { header: "End", render: (c) => c.end_date ?? "Ongoing" },
        { header: "Wage", render: (c) => c.wage },
        {
          header: "Structure",
          render: (c) => c.salary_structures?.name ?? "--",
        },
        { header: "Status", render: (c) => <Badge status={c.status} /> },
      ]}
      rows={contracts}
      onRowClick={(c) => router.push(`/contracts/${c.id}`)}
    />
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#8a7a63]">Loading...</p>}>
      <ContractsPageInner />
    </Suspense>
  );
}
