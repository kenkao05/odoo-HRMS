"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";
import { SearchBar } from "@/components/ui/SearchBar";

function TimeOffRequestsPageInner() {
  const [rows, setRows] = useState<any[] | null>(null);
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
      .from("time_off_requests")
      .select("*, employees(name, employee_type, status, department_id), time_off_types(name)")
      .order("created_at", { ascending: false });
    if (employeeFilter) query = query.eq("employee_id", employeeFilter);
    query.then(({ data }) => setRows(data ?? []));
  }, [employeeFilter]);

  if (!rows) return <LoadingBlock label="Loading time off requests…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Time Off Requests</h2>
          <p className="sub">
            Employee leave requests with a simple approval flow. Approving deducts from the assigned allocation.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search requests…" />
        <ListFilters
          departments={departments}
          type={type}
          status={status}
          department={department}
          onType={setType}
          onStatus={setStatus}
          onDepartment={setDepartment}
          statusOptions={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "refused", label: "Refused" },
          ]}
        />
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (r) => r.employees?.name },
            { header: "Type", render: (r) => r.time_off_types?.name },
            { header: "Dates", render: (r) => `${r.start_date} → ${r.end_date}` },
            { header: "Duration", render: (r) => r.duration, num: true },
            { header: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          rows={rows.filter((x: any) => {
            const e = x.employees;
            const q = search.trim().toLowerCase();
            return (
              (!type || e?.employee_type === type) &&
              (!status || x.status === status) &&
              (!department || e?.department_id === department) &&
              (!q ||
                e?.name?.toLowerCase().includes(q) ||
                x.time_off_types?.name?.toLowerCase().includes(q))
            );
          })}
          onRowClick={(r) => router.push(`/time-off/requests/${r.id}`)}
        />
      </div>
    </div>
  );
}

export default function TimeOffRequestsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading time off requests…" />}>
      <TimeOffRequestsPageInner />
    </Suspense>
  );
}
