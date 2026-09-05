export function WarningsCallout({
  warnings,
}: {
  warnings: { message: string }[];
}) {
  if (!warnings.length) return null;
  return (
    <div className="warn-box" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>⚠ Validation warnings</span>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {warnings.map((w, i) => (
          <li key={i}>{w.message}</li>
        ))}
      </ul>
    </div>
  );
}