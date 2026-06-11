"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Zap, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function TwoFactorPage() {
  const router = useRouter();
  const t = useTranslations("auth.twoFactor");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const challengeToken = sessionStorage.getItem("2fa_challenge_token");
      const response = await api.post(
        "/auth/2fa/challenge",
        { code },
        challengeToken ? { headers: { Authorization: `Bearer ${challengeToken}` } } : undefined,
      );
      sessionStorage.removeItem("2fa_challenge_token");
      const { accessToken } = response.data.data;
      setToken(accessToken);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid code. Please try again.");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <ShieldCheck className="h-5 w-5 text-violet-400" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" aria-hidden="true" />
            SaaS Starter Kit
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("code")}</Label>
                <Input
                  id="code"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-xl tracking-[0.4em] font-mono"
                  aria-describedby="code-hint"
                />
                <p id="code-hint" className="text-xs text-muted-foreground">
                  Open your authenticator app and enter the current code.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {isLoading ? t("loading") : t("submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
