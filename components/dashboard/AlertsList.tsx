export function AlertsList({
  alerts,
}: {
  alerts: { message: string; record_id?: string }[];
}) {
  return (
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <p className="mb-2 text-sm font-medium text-[#3E2723]">Current Alerts</p>
      <div className="max-h-48 space-y-2 overflow-auto">
        {alerts.map((a, i) => (
          <div
            key={i}
            className="rounded border-l-4 border-[#F9A825] bg-[#fff8e6] px-3 py-2 text-sm text-[#3E2723]"
          >
            {a.message}
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-sm text-[#8a7a63]">No alerts</p>
        )}
      </div>
    </div>
  );
}
