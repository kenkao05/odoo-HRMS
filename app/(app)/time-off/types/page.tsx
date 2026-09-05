"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/client";

export default function TimeOffTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("time_off_types")
      .select("*")
      .then(({ data }) => setTypes(data ?? []));
  }, []);

  return (
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
  );
}
