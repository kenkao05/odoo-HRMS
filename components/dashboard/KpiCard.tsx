export function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="text-xs text-[#8a7a63]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#3E2723]">{value}</p>
    </div>
  );
}
