"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { SalaryByDeptChart } from "@/components/dashboard/SalaryByDeptChart";
import { PayslipStatusChart } from "@/components/dashboard/PayslipStatusChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { formatCurrency } from "@/lib/utils/dates";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [filters, setFilters] = useState<{
    department_id?: string;
    employee_type?: string;
  }>({});
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("departments")
      .select("id, name")
      .then(({ data }) => setDepartments(data ?? []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.department_id) {
      params.set("department_id", filters.department_id);
    }
    if (filters.employee_type) {
      params.set("employee_type", filters.employee_type);
    }

    setSummary(null);
    fetch(`/api/dashboard/summary?${params}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error || !data.kpis) {
          console.error("Dashboard summary failed", data);
          setSummary(null);
          return;
        }
        setSummary(data);
      })
      .catch((err) => {
        console.error(err);
        setSummary(null);
      });
  }, [filters]);

  if (!summary?.kpis) {
    return <p className="text-sm text-[#8a7a63]">Loading...</p>;
  }

  const statusData = [
    {
      status: "paid",
      count: summary.kpis.payslipsGenerated ? 1 : 0,
    }, // illustrative -- real breakdown comes from payslips.status group-by
  ];

  return (
    <div>
      <FilterBar
        departments={departments}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard
          label="Total Net Paid"
          value={formatCurrency(summary.kpis.totalNetPaid)}
        />
        <KpiCard
          label="Payslips Generated"
          value={summary.kpis.payslipsGenerated}
        />
        <KpiCard
          label="Average Salary"
          value={formatCurrency(summary.kpis.averageSalary)}
        />
        <KpiCard
          label="Approved Time Off (days)"
          value={summary.kpis.approvedTimeOffDays}
        />
        <KpiCard
          label="Attendance Health %"
          value={`${summary.kpis.attendanceHealth}%`}
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SalaryByDeptChart data={summary.salaryByDept ?? []} />
        <PayslipStatusChart data={statusData} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AlertsList alerts={summary.alerts ?? []} />
        <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4 text-sm text-[#3E2723]">
          <p className="mb-2 font-medium">Attendance Overview</p>
          <p>
            Present: {summary.attendanceOverview?.present ?? 0} · Late:{" "}
            {summary.attendanceOverview?.late ?? 0} · Absent:{" "}
            {summary.attendanceOverview?.absent ?? 0} · Missing checkout:{" "}
            {summary.attendanceOverview?.missing_checkout ?? 0}
          </p>
          <p className="mt-3 font-medium">Time Off Overview</p>
          <p>
            Approved days: {summary.timeOffOverview?.approvedDays ?? 0} ·
            Pending requests: {summary.timeOffOverview?.pendingCount ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}