"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function SalaryByDeptChart({
  data,
}: {
  data: { department: string; total: number }[];
}) {
  return (
    <div className="card pad">
      <div className="section-title">Salary Cost by Department</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="department" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--paper-raised)",
              border: "1px solid var(--rule)",
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" fill="#2B6E52" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
