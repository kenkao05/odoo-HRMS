"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

function ArrowIcon() {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      style={{ width: 14, height: 14 }}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
  actions,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="view-head">
      <div>
        <div style={{ marginBottom: 6 }}>
          {backHref ? (
            <Link
              href={backHref}
              className="section-title link"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <ArrowIcon />
              {backLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="section-title link"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <ArrowIcon />
              Back
            </button>
          )}
        </div>
        <h2>{title}</h2>
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
