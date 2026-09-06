"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function PayslipsPageInner() {
  const [payslips, setPayslips] = useState<any[] | null>(null);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
    supabase
      .from("payslips")
      .select("*, employees(name, employee_type, status, department_id), payruns(period_start, period_end)")
      .then(({ data }) => setPayslips(data ?? []));
  }, []);

  if (!payslips) return <LoadingBlock label="Loading payslips…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Payslips</h2>
          <p className="sub">Generated breakdown of basic, allowances and deductions per payroll period.</p>
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
          { value: "draft", label: "Draft" },
          { value: "computed", label: "Computed" },
          { value: "validated", label: "Validated" },
          { value: "paid", label: "Paid" },
        ]}
      />
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (p) => p.employees?.name },
            {
              header: "Period",
              render: (p) =>
                p.payruns
                  ? `${p.payruns.period_start} → ${p.payruns.period_end}`
                  : "--",
            },
            { header: "Gross", render: (p) => p.gross ?? "--", num: true },
            { header: "Net", render: (p) => p.net ?? "--", num: true },
            { header: "Status", render: (p) => <Badge status={p.status} /> },
          ]}
          rows={payslips.filter((x: any) => {
            const e = x.employees;
            return (
              (!type || e?.employee_type === type) &&
              (!status || x.status === status) &&
              (!department || e?.department_id === department)
            );
          })}
          onRowClick={(p) => router.push(`/payroll/payslips/${p.id}`)}
        />
      </div>
    </div>
  );
}

export default function PayslipsPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <PayslipsPageInner />
    </RequireRole>
  );
}