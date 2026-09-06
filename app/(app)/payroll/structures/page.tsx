"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { SearchBar } from "@/components/ui/SearchBar";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function SalaryStructuresPageInner() {
  const [structures, setStructures] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
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
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search structures…" />
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
          rows={structures.filter((s) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return s.name?.toLowerCase().includes(q);
          })}
          onRowClick={(s) => router.push(`/payroll/structures/${s.id}`)}
        />
      </div>
    </div>
  );
}

export default function SalaryStructuresPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <SalaryStructuresPageInner />
    </RequireRole>
  );
}