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
    <div className="card pad">
      <div className="section-title">Monthly Net Salary Trend</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--paper-raised)",
              border: "1px solid var(--rule)",
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#B9812C"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
