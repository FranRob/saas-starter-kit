"use client";

import { useTranslations } from "next-intl";
import { FlaskConical, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function DemoBanner() {
  const t = useTranslations("demoBanner");

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div
      role="banner"
      aria-label="Demo environment notice"
      className="flex flex-col items-center justify-between gap-2 bg-amber-400 px-4 py-2.5 text-amber-950 sm:flex-row"
    >
      {/* Left: label */}
      <div className="flex items-center gap-2 shrink-0">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider">
          {t("label")}
        </span>
      </div>

      {/* Center: message */}
      <p className="text-center text-sm font-medium">
        {t("message")}
      </p>

      {/* Right: CTA */}
      <Link
        href="/register"
        className="flex shrink-0 cursor-pointer items-center gap-1 text-sm font-semibold underline underline-offset-2 hover:no-underline transition-all duration-200"
        aria-label="Register your own account"
      >
        {t("cta")}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
