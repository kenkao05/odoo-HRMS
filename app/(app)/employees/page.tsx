"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

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
    <Table
      columns={[
        { header: "Name", render: (e) => e.name },
        { header: "Department", render: (e) => e.departments?.name ?? "--" },
        { header: "Job Position", render: (e) => e.job_position ?? "--" },
        { header: "Status", render: (e) => <Badge status={e.status} /> },
      ]}
      rows={employees}
      onRowClick={(e) => router.push(`/employees/${e.id}`)}
    />
  );
}
