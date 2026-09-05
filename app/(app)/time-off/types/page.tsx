"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";

export default function TimeOffTypesPage() {
  const [types, setTypes] = useState<any[] | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("time_off_types")
      .select("*")
      .then(({ data }) => setTypes(data ?? []));
  }, []);

  if (!types) return <LoadingBlock label="Loading time off types…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Time Off Types</h2>
          <p className="sub">
            Leave policies — units, allocation requirements and approval workflow per type.
          </p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Type", render: (t) => t.name },
            { header: "Unit", render: (t) => t.unit },
            {
              header: "Requires Allocation?",
              render: (t) => (t.requires_allocation ? "Yes" : "No"),
            },
            {
              header: "Approval Required?",
              render: (t) => (t.requires_approval ? "Yes" : "No"),
            },
          ]}
          rows={types}
          onRowClick={(t) => router.push(`/time-off/types/${t.id}`)}
        />
      </div>
    </div>
  );
}
