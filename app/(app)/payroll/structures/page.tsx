"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<any[] | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("salary_structures")
      .select("*, salary_rules(count), contracts(count)")
      .then(({ data }) => setStructures(data ?? []));
  }, []);

  if (!structures) return <LoadingBlock label="Loading salary structures…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Salary Structures</h2>
          <p className="sub">
            Sequenced sets of salary rules. The structure on a contract dictates how that employee's payslips compute.
          </p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Name", render: (s) => s.name },
            {
              header: "# Rules",
              render: (s) => s.salary_rules?.[0]?.count ?? 0,
              num: true,
            },
            {
              header: "# Employees Using It",
              render: (s) => s.contracts?.[0]?.count ?? 0,
              num: true,
            },
            { header: "Active", render: (s) => (s.active ? "Yes" : "No") },
          ]}
          rows={structures}
          onRowClick={(s) => router.push(`/payroll/structures/${s.id}`)}
        />
      </div>
    </div>
  );
}
