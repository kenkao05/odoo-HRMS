"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { SearchBar } from "@/components/ui/SearchBar";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function SalaryRulesPageInner() {
  const [rules, setRules] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("salary_rules")
      .select("*, salary_structures(name)")
      .order("sequence")
      .then(({ data }) => setRules(data ?? []));
  }, []);

  if (!rules) return <LoadingBlock label="Loading salary rules…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Salary Rules</h2>
          <p className="sub">
            How earnings and deductions are calculated — processed in sequence so totals can build on earlier rules.
          </p>
        </div>
      </div>
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search salary rules…" />
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Name", render: (r) => r.name },
            { header: "Code", render: (r) => r.code },
            { header: "Category", render: (r) => r.category },
            { header: "Sequence", render: (r) => r.sequence, num: true },
            {
              header: "Structure",
              render: (r) => r.salary_structures?.name ?? "--",
            },
          ]}
          rows={rules.filter((r) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
              r.name?.toLowerCase().includes(q) ||
              r.code?.toLowerCase().includes(q) ||
              r.category?.toLowerCase().includes(q) ||
              r.salary_structures?.name?.toLowerCase().includes(q)
            );
          })}
          onRowClick={(r) => router.push(`/payroll/rules/${r.id}`)}
        />
      </div>
    </div>
  );
}

export default function SalaryRulesPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <SalaryRulesPageInner />
    </RequireRole>
  );
}