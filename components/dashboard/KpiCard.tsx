export function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta?: { text: string; direction: "up" | "down" };
}) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value num">{value}</div>
      {delta && <div className={`kpi-delta ${delta.direction}`}>{delta.text}</div>}
    </div>
  );
}
