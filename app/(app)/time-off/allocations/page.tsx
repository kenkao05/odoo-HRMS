"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

function AllocationsPageInner() {
  const [rows, setRows] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
    let query = supabase
      .from("allocations")
      .select("*, employees(name), time_off_types(name)");
    if (employeeFilter) query = query.eq("employee_id", employeeFilter);
    query.then(({ data }) => setRows(data ?? []));
  }, [employeeFilter]);

  return (
    <Table
      columns={[
        { header: "Employee", render: (a) => a.employees?.name },
        { header: "Type", render: (a) => a.time_off_types?.name },
        { header: "Allocated", render: (a) => a.allocated },
        { header: "Taken", render: (a) => a.taken },
        { header: "Remaining", render: (a) => a.allocated - a.taken },
        { header: "Status", render: (a) => <Badge status={a.status} /> },
      ]}
      rows={rows}
      onRowClick={(a) => router.push(`/time-off/allocations/${a.id}`)}
    />
  );
}

export default function AllocationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#8a7a63]">Loading...</p>}>
      <AllocationsPageInner />
    </Suspense>
  );
}
