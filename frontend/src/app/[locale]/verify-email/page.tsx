"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Zap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";

type VerifyState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("auth.verifyEmail");
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    async function verify() {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setState("success");
      } catch {
        setState("error");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Loading */}
        {state === "loading" && (
          <>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Zap className="h-5 w-5 text-violet-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-semibold text-white">{t("verifying")}</h1>
            </div>
            <Card>
              <CardContent className="pt-6 flex flex-col items-center gap-4 py-10">
                <Loader2
                  className="h-8 w-8 animate-spin text-violet-400"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground" aria-live="polite" aria-busy="true">
                  {t("pleaseWait")}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Success */}
        {state === "success" && (
          <>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-semibold text-white">{t("successTitle")}</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("successTitle")}</CardTitle>
                <CardDescription>{t("successMessage")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p role="status" className="sr-only">
                  Email successfully verified.
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {t("goToLogin")}
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Error */}
        {state === "error" && (
          <>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-semibold text-white">{t("errorTitle")}</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("errorTitle")}</CardTitle>
                <CardDescription>{t("errorMessage")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p role="alert" className="text-sm text-muted-foreground">
                  {t("contactSupport")}{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-violet-400 hover:text-violet-300 transition-colors duration-200 cursor-pointer"
                  >
                    support@example.com
                  </a>
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {t("goToLogin")}
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
