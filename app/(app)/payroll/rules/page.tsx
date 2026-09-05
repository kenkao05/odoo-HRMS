"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/client";

export default function SalaryRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("salary_rules")
      .select("*, salary_structures(name)")
      .order("sequence")
      .then(({ data }) => setRules(data ?? []));
  }, []);

  return (
    <Table
      columns={[
        { header: "Name", render: (r) => r.name },
        { header: "Code", render: (r) => r.code },
        { header: "Category", render: (r) => r.category },
        { header: "Sequence", render: (r) => r.sequence },
        {
          header: "Structure",
          render: (r) => r.salary_structures?.name ?? "--",
        },
      ]}
      rows={rules}
      onRowClick={(r) => router.push(`/payroll/rules/${r.id}`)}
    />
  );
}
