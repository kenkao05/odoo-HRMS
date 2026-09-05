export function AlertsList({
  alerts,
}: {
  alerts: { message: string; record_id?: string }[];
}) {
  return (
    <div className="card pad">
      <div className="section-title">Current Alerts</div>
      <div className="max-h-48 space-y-2 overflow-auto">
        {alerts.map((a, i) => (
          <div key={i} className="warn-box" style={{ marginBottom: 0 }}>
            <span>⚠</span>
            <span>{a.message}</span>
          </div>
        ))}
        {alerts.length === 0 && <div className="empty">No alerts</div>}
      </div>
    </div>
  );
}
