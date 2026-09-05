"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { CheckInOutWidget } from "@/components/attendance/CheckInOutWidget";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";

function AttendancePageInner() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [myEmployeeId, setMyEmployeeId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("employee_id")
        .eq("id", user.id)
        .single();
      setMyEmployeeId(profile?.employee_id ?? null);

      let query = supabase
        .from("attendance")
        .select("*, employees(name, employee_type, status, department_id)")
        .order("check_in", { ascending: false });
      if (employeeFilter) query = query.eq("employee_id", employeeFilter);
      const { data } = await query;
      setRows(data ?? []);
    })();
  }, [employeeFilter]);

  if (!rows) return <LoadingBlock label="Loading attendance…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Attendance</h2>
          <p className="sub">
            Check-ins, check-outs and worked hours across the team, kept for reporting and payroll insights.
          </p>
        </div>
      </div>

      {myEmployeeId && (
        <div style={{ marginBottom: 18 }}>
          <CheckInOutWidget employeeId={myEmployeeId} />
        </div>
      )}

      <ListFilters
        departments={departments}
        type={type}
        status={status}
        department={department}
        onType={setType}
        onStatus={setStatus}
        onDepartment={setDepartment}
        statusOptions={[
          { value: "present", label: "Present" },
          { value: "late", label: "Late" },
          { value: "missing_checkout", label: "Missing Checkout" },
          { value: "absent", label: "Absent" },
        ]}
      />
      <div className="card">
        <Table
          columns={[
            { header: "Employee", render: (a) => a.employees?.name },
            {
              header: "Check In",
              render: (a) => new Date(a.check_in).toLocaleString(),
            },
            {
              header: "Check Out",
              render: (a) =>
                a.check_out ? new Date(a.check_out).toLocaleString() : "--",
            },
            { header: "Worked Hours", render: (a) => a.worked_hours ?? "--", num: true },
            {
              header: "Status",
              render: (a) => (
                <Badge
                  status={a.status}
                  label={
                    a.status === "missing_checkout"
                      ? "Missing Checkout"
                      : a.status === "late"
                        ? "Late"
                        : a.status === "present"
                          ? "Present"
                          : "Absent"
                  }
                />
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
          onRowClick={(a) => router.push(`/attendance/${a.id}`)}
        />
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading attendance…" />}>
      <AttendancePageInner />
    </Suspense>
  );
}
