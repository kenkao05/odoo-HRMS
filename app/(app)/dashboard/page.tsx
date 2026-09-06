"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { SalaryByDeptChart } from "@/components/dashboard/SalaryByDeptChart";
import { PayslipStatusChart } from "@/components/dashboard/PayslipStatusChart";
import { NetSalaryTrendChart } from "@/components/dashboard/NetSalaryTrendChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { formatCurrency } from "@/lib/utils/dates";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function DashboardPageInner() {
  const [summary, setSummary] = useState<any>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<{
    period?: string;
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
    if (filters.period) {
      params.set("period", filters.period);
    }
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
    return <LoadingBlock label="Loading dashboard…" />;
  }

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Payroll overview</h2>
          <p className="sub">Live figures aggregated across your HR and payroll data.</p>
        </div>
      </div>

      <FilterBar
        departments={departments}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
      />

      <div className="kpi-row">
        <KpiCard label="Total Net Paid" value={formatCurrency(summary.kpis.totalNetPaid)} />
        <KpiCard label="Payslips Generated" value={summary.kpis.payslipsGenerated} />
        <KpiCard label="Average Salary" value={formatCurrency(summary.kpis.averageSalary)} />
        <KpiCard label="Approved Time Off (days)" value={summary.kpis.approvedTimeOffDays} />
        <KpiCard label="Attendance Health %" value={`${summary.kpis.attendanceHealth}%`} />
      </div>

      <div className="grid-2" style={{ marginBottom: 18 }}>
        <SalaryByDeptChart data={summary.salaryByDept ?? []} />
        <PayslipStatusChart data={summary.payslipStatusBreakdown ?? []} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <NetSalaryTrendChart data={summary.netSalaryTrend ?? []} />
      </div>

      <div className="grid-2">
        <AlertsList alerts={summary.alerts ?? []} />
        <div className="card pad">
          <div className="section-title">Attendance &amp; Time Off</div>
          <div className="dl">
            <dt>Present</dt>
            <dd className="num">{summary.attendanceOverview?.present ?? 0}</dd>
          </div>
          <div className="dl">
            <dt>Late</dt>
            <dd className="num">{summary.attendanceOverview?.late ?? 0}</dd>
          </div>
          <div className="dl">
            <dt>Absent</dt>
            <dd className="num">{summary.attendanceOverview?.absent ?? 0}</dd>
          </div>
          <div className="dl">
            <dt>Missing checkout</dt>
            <dd className="num">{summary.attendanceOverview?.missing_checkout ?? 0}</dd>
          </div>
          <hr className="rule" />
          <div className="dl">
            <dt>Approved days</dt>
            <dd className="num">{summary.timeOffOverview?.approvedDays ?? 0}</dd>
          </div>
          <div className="dl">
            <dt>Pending requests</dt>
            <dd className="num">{summary.timeOffOverview?.pendingCount ?? 0}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <DashboardPageInner />
    </RequireRole>
  );
}