"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { CheckInOutWidget } from "@/components/attendance/CheckInOutWidget";
import { createClient } from "@/lib/supabase/client";

function AttendancePageInner() {
  const [rows, setRows] = useState<any[]>([]);
  const [myEmployeeId, setMyEmployeeId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get("employee");
  const supabase = createClient();

  useEffect(() => {
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
        .select("*, employees(name)")
        .order("check_in", { ascending: false });
      if (employeeFilter) query = query.eq("employee_id", employeeFilter);
      const { data } = await query;
      setRows(data ?? []);
    })();
  }, [employeeFilter]);

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Attendance</h2>
          <p className="sub">
            Check-ins, check-outs and worked hours. Corrections are restricted to authorized users.
          </p>
        </div>
      </div>

      {myEmployeeId && (
        <div style={{ marginBottom: 18 }}>
          <CheckInOutWidget employeeId={myEmployeeId} />
        </div>
      )}

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
            { header: "Status", render: (a) => <Badge status={a.status} /> },
          ]}
          rows={rows}
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
