"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState<any[] | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("working_schedules")
      .select("*")
      .then(({ data }) => setSchedules(data ?? []));
  }, []);

  if (!schedules) return <LoadingBlock label="Loading schedules…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Working schedules</h2>
          <p className="sub">
            Weekly patterns applied to employees and contracts. Total hours are calculated automatically from each day's start/end/break.
          </p>
        </div>
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Name", render: (s) => s.name },
            { header: "Type", render: (s) => s.type },
            { header: "Weekly Hours", render: (s) => s.weekly_hours, num: true },
          ]}
          rows={schedules}
          onRowClick={(s) => router.push(`/working-schedules/${s.id}`)}
        />
      </div>
    </div>
  );
}
