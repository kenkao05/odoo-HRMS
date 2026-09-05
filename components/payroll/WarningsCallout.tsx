export function WarningsCallout({
  warnings,
}: {
  warnings: { message: string }[];
}) {
  if (!warnings.length) return null;
  return (
    <div className="mb-4 rounded-md border-2 border-[#C62828] bg-[#fdecea] p-4">
      <p className="mb-2 font-medium text-[#C62828]">Validation warnings</p>
      <ul className="list-disc pl-5 text-sm text-[#7a1e1e]">
        {warnings.map((w, i) => (
          <li key={i}>{w.message}</li>
        ))}
      </ul>
    </div>
  );
}
