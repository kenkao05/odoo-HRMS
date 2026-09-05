"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-0.5"
      style={{ background: "var(--rule)" }}
    >
      <div className="h-full w-1/3 animate-pulse" style={{ background: "var(--green)" }} />
    </div>
  );
}
