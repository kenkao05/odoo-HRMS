"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function NetSalaryTrendChart({
  data,
}: {
  data: { period: string; net: number }[];
}) {
  return (
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="mb-2 text-sm font-medium text-[#3E2723]">
        Monthly Net Salary Trend
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#7A8450"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
