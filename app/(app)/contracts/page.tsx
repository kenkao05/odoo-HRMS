"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/dates";
import { ListFilters } from "@/components/ui/ListFilters";
import { SearchBar } from "@/components/ui/SearchBar";
import { RequireRole } from "@/components/auth/RequireRole";
import { canManageHR } from "@/lib/utils/roles";

function ContractsPageInner() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
    let query = supabase
      .from("contracts")
      .select("*, employees(name, employee_type, status, department_id), salary_structures(name)");
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
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search contracts…" />
        <ListFilters
          departments={departments}
          type={type}
          status={status}
          department={department}
          onType={setType}
          onStatus={setStatus}
          onDepartment={setDepartment}
          statusOptions={[
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "draft", label: "Draft" },
          ]}
        />
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
          rows={contracts.filter((x: any) => {
            const e = x.employees;
            const q = search.trim().toLowerCase();
            return (
              (!type || e?.employee_type === type) &&
              (!status || x.status === status) &&
              (!department || e?.department_id === department) &&
              (!q ||
                e?.name?.toLowerCase().includes(q) ||
                x.salary_structures?.name?.toLowerCase().includes(q))
            );
          })}
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
    <RequireRole allow={canManageHR}>
      <Suspense fallback={<LoadingBlock label="Loading contracts…" />}>
        <ContractsPageInner />
      </Suspense>
    </RequireRole>
  );
}