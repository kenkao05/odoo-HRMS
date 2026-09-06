"use client";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 240px",
        minWidth: 200,
        maxWidth: 360,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--ink-faint, #8a8a8a)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        aria-label="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 12px 8px 30px",
          border: "1px solid var(--rule-strong)",
          borderRadius: "var(--radius-s)",
          background: "var(--paper-raised)",
          fontSize: 13,
        }}
      />
    </div>
  );
}
