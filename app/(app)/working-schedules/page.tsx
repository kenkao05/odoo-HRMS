"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/client";

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("working_schedules")
      .select("*")
      .then(({ data }) => setSchedules(data ?? []));
  }, []);

  return (
    <Table
      columns={[
        { header: "Name", render: (s) => s.name },
        { header: "Type", render: (s) => s.type },
        { header: "Weekly Hours", render: (s) => s.weekly_hours },
      ]}
      rows={schedules}
      onRowClick={(s) => router.push(`/working-schedules/${s.id}`)}
    />
  );
}
