"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, QrCode, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const orgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type OrgFormData = z.infer<typeof orgSchema>;

function ProfileTab() {
  const t = useTranslations("dashboard.settings");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  async function onSubmit(data: ProfileFormData) {
    try {
      await api.put("/account", data);
      toast.success(t("profileUpdated"));
    } catch {
      toast.error(t("profileError"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("profileTitle")}</CardTitle>
        <CardDescription>{t("profileDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input id="name" placeholder="Your name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p role="alert" className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("saveProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordTab() {
  const t = useTranslations("dashboard.settings");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(data: PasswordFormData) {
    try {
      await api.put("/account/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t("passwordUpdated"));
      reset();
    } catch {
      toast.error(t("passwordError"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("passwordTitle")}</CardTitle>
        <CardDescription>{t("passwordDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p role="alert" className="text-xs text-red-400">{errors.currentPassword.message}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("newPassword")}</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("passwordMin")}
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p role="alert" className="text-xs text-red-400">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p role="alert" className="text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("saveProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TwoFactorTab() {
  const t = useTranslations("dashboard.settings");
  const [enabled, setEnabled] = useState(false);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        const me = res.data.data ?? res.data;
        setEnabled(me.twoFaEnabled ?? false);
      })
      .catch(() => {});
  }, []);

  async function handleEnable() {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/2fa/enable");
      setQrUri(response.data.data?.otpAuthUrl);
    } catch {
      toast.error("Failed to start 2FA setup");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    if (verifyCode.length !== 6) {
      toast.error("Enter a 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/2fa/verify", { code: verifyCode });
      setEnabled(true);
      setQrUri(null);
      setVerifyCode("");
      toast.success(t("twoFactorActivated"));
    } catch {
      toast.error("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisable() {
    setIsLoading(true);
    try {
      await api.post("/auth/2fa/disable");
      setEnabled(false);
      toast.success(t("twoFactorDeactivated"));
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("twoFactorTitle")}</CardTitle>
        <CardDescription>{t("twoFactorDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {enabled ? (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <ShieldCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t("twoFactorEnabled")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-red-400 hover:text-red-300 border-red-500/20"
                onClick={handleDisable}
                disabled={isLoading}
              >
                <ShieldOff className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("disableTwoFactor")}
              </Button>
            </div>
          </div>
        ) : qrUri ? (
          <div className="space-y-4 max-w-sm">
            <p className="text-sm text-muted-foreground">{t("scanQr")}</p>
            <div className="inline-flex rounded-xl bg-white p-4">
              <QRCode value={qrUri} size={180} aria-label="Two-factor authentication QR code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verifyCode">{t("enterCode")}</Label>
              <Input
                id="verifyCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="font-mono tracking-widest text-center"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setQrUri(null); setVerifyCode(""); }}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={isLoading || verifyCode.length !== 6}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {t("verifyAndEnable")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <QrCode className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t("twoFactorDisabled")}</p>
              <Button size="sm" className="mt-4" onClick={handleEnable} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {t("enableTwoFactor")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizationTab() {
  const t = useTranslations("dashboard.settings");
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  async function onSubmit(data: OrgFormData) {
    try {
      await api.put("/org", data);
      queryClient.invalidateQueries({ queryKey: ["org"] });
      toast.success(t("orgUpdated"));
    } catch {
      toast.error(t("orgError"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("orgTitle")}</CardTitle>
        <CardDescription>{t("orgDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="orgName">{t("orgName")}</Label>
            <Input
              id="orgName"
              placeholder="Acme Corp"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p role="alert" className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("saveProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and organization preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="password">{t("password")}</TabsTrigger>
          <TabsTrigger value="two-factor">{t("twoFactor")}</TabsTrigger>
          <TabsTrigger value="organization">{t("organization")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
        <TabsContent value="two-factor">
          <TwoFactorTab />
        </TabsContent>
        <TabsContent value="organization">
          <OrganizationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
