"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";

function AllocationsPageInner() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
    let query = supabase
      .from("allocations")
      .select("*, employees(name, employee_type, status, department_id), time_off_types(name)");
    if (employeeFilter) query = query.eq("employee_id", employeeFilter);
    query.then(({ data }) => setRows(data ?? []));
  }, [employeeFilter]);

  if (!rows) return <LoadingBlock label="Loading allocations…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Allocations</h2>
          <p className="sub">
            Employee leave balances — taken, remaining and validity, requiring approval before availability.
          </p>
        </div>
      </div>
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
        ]}
      />
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (a) => a.employees?.name },
            { header: "Type", render: (a) => a.time_off_types?.name },
            { header: "Allocated", render: (a) => a.allocated, num: true },
            { header: "Taken", render: (a) => a.taken, num: true },
            {
              header: "Remaining",
              render: (a) => a.allocated - a.taken,
              num: true,
            },
            {
              header: "Status",
              render: (a) => (
                <Badge status={a.status} label={a.status === "approved" ? "Approved" : "Pending"} />
              ),
            },
          ]}
          rows={rows.filter((x: any) => {
            const e = x.employees;
            return (
              (!type || e?.employee_type === type) &&
              (!status || x.status === status) &&
              (!department || e?.department_id === department)
            );
          })}
          onRowClick={(a) => router.push(`/time-off/allocations/${a.id}`)}
        />
      </div>
    </div>
  );
}

export default function AllocationsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading allocations…" />}>
      <AllocationsPageInner />
    </Suspense>
  );
}
