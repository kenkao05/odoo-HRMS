"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { statusVariant, CHART_COLORS } from "@/lib/utils/colors";

export function PayslipStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <div className="card pad">
      <div className="section-title">Payslip Status</div>
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={40} outerRadius={70}>
            {data.map((d, i) => (
              <Cell key={i} fill={CHART_COLORS[statusVariant(d.status)]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--paper-raised)",
              border: "1px solid var(--rule)",
              borderRadius: 4,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
