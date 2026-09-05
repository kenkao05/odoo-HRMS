"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/client";

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("salary_structures")
      .select("*, salary_rules(count), contracts(count)")
      .then(({ data }) => setStructures(data ?? []));
  }, []);

  return (
    <Table
      columns={[
        { header: "Name", render: (s) => s.name },
        { header: "# Rules", render: (s) => s.salary_rules?.[0]?.count ?? 0 },
        {
          header: "# Employees Using It",
          render: (s) => s.contracts?.[0]?.count ?? 0,
        },
        { header: "Active", render: (s) => (s.active ? "Yes" : "No") },
      ]}
      rows={structures}
      onRowClick={(s) => router.push(`/payroll/structures/${s.id}`)}
    />
  );
}
