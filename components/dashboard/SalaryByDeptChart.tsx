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
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="mb-2 text-sm font-medium text-[#3E2723]">
        Salary Cost by Department
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="department" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#C1652F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
