"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("employees")
      .select("*, departments(name)")
      .then(({ data }) => setEmployees(data ?? []));
  }, []);

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Employee master</h2>
          <p className="sub">
            Profiles, departments and status. Click a row to open the full record.
          </p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            {
              header: "Employee",
              render: (e) => (
                <div className="person">
                  <div className="avatar">{initials(e.name)}</div>
                  <div>
                    <div className="person-name">{e.name}</div>
                    <div className="person-role">{e.job_position ?? "--"}</div>
                  </div>
                </div>
              ),
            },
            { header: "Department", render: (e) => e.departments?.name ?? "--" },
            { header: "Status", render: (e) => <Badge status={e.status} /> },
          ]}
          rows={employees}
          onRowClick={(e) => router.push(`/employees/${e.id}`)}
        />
      </div>
    </div>
  );
}
