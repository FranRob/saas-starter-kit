"use client";

import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You&apos;re in demo mode. Data resets every hour.</span>
    </div>
  );
}
