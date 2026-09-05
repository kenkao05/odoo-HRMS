"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { statusColor } from "@/lib/utils/colors";

export function PayslipStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="mb-2 text-sm font-medium text-[#3E2723]">Payslip Status</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={40}
            outerRadius={70}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={statusColor(d.status)} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
