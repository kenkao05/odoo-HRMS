"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { SearchBar } from "@/components/ui/SearchBar";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/auth/RequireRole";
import { canManageHR } from "@/lib/utils/roles";

function WorkingSchedulesPageInner() {
  const [schedules, setSchedules] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("working_schedules")
      .select("*")
      .then(({ data }) => setSchedules(data ?? []));
  }, []);

  if (!schedules) return <LoadingBlock label="Loading working schedules…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Working Schedules</h2>
          <p className="sub">
            Weekly patterns used to standardize attendance and payroll expectations across employees.
          </p>
        </div>
      </div>
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search schedules…" />
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Name", render: (s) => s.name },
            { header: "Type", render: (s) => s.type ?? "--" },
            {
              header: "Weekly Hours",
              render: (s) => `${Number(s.weekly_hours ?? 0).toFixed(1)}h`,
              num: true,
            },
          ]}
          rows={schedules.filter((s) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return s.name?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q);
          })}
          onRowClick={(s) => router.push(`/working-schedules/${s.id}`)}
        />
      </div>
    </div>
  );
}

export default function WorkingSchedulesPage() {
  return (
    <RequireRole allow={canManageHR}>
      <WorkingSchedulesPageInner />
    </RequireRole>
  );
}