"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("ssk_token");
      setIsLoggedIn(!!token);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Large 404 */}
      <p
        className="font-mono text-8xl font-bold tracking-tight sm:text-9xl"
        style={{ color: "rgba(14,165,233,0.25)" }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Message */}
      <h1 className="mt-4 font-mono text-2xl font-bold text-white sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#e0e0e0]/50">
        {t("message")}
      </p>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          className="cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors duration-200"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("goHome")}
          </Link>
        </Button>

        {isLoggedIn && (
          <Button
            variant="outline"
            asChild
            className="cursor-pointer border-white/20 text-[#e0e0e0] hover:border-white/40 hover:bg-white/5 transition-all duration-200"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("goDashboard")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
