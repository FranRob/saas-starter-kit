"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// --- Schemas ---
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

// --- Profile Tab ---
function ProfileTab() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  async function onSubmit(data: ProfileFormData) {
    try {
      await api.patch("/user/profile", data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Update your display name</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Your name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p role="alert" className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Password Tab ---
function PasswordTab() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(data: PasswordFormData) {
    try {
      await api.patch("/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated");
      reset();
    } catch {
      toast.error("Failed to update password. Check your current password.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Password</CardTitle>
        <CardDescription>Change your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
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
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p role="alert" className="text-xs text-red-400">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
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
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Two-Factor Tab ---
function TwoFactorTab() {
  const [enabled, setEnabled] = useState(false);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleEnable() {
    setIsLoading(true);
    try {
      const response = await api.post("/user/2fa/setup");
      setQrUri(response.data.otpauthUri);
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
      await api.post("/user/2fa/enable", { code: verifyCode });
      setEnabled(true);
      setQrUri(null);
      setVerifyCode("");
      toast.success("Two-factor authentication enabled");
    } catch {
      toast.error("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisable() {
    setIsLoading(true);
    try {
      await api.post("/user/2fa/disable");
      setEnabled(false);
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {enabled ? (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <ShieldCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">2FA is enabled</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is protected with two-factor authentication.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-red-400 hover:text-red-300 border-red-500/20"
                onClick={handleDisable}
                disabled={isLoading}
              >
                <ShieldOff className="mr-2 h-4 w-4" aria-hidden="true" />
                Disable 2FA
              </Button>
            </div>
          </div>
        ) : qrUri ? (
          <div className="space-y-4 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>
            <div className="inline-flex rounded-xl bg-white p-4">
              <QRCode value={qrUri} size={180} aria-label="Two-factor authentication QR code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verifyCode">Verification code</Label>
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
                Verify & enable
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <QrCode className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">2FA is not enabled</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enable two-factor authentication to increase account security.
              </p>
              <Button size="sm" className="mt-4" onClick={handleEnable} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Enable 2FA
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Organization Tab ---
function OrganizationTab() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  async function onSubmit(data: OrgFormData) {
    try {
      await api.patch("/organization", data);
      toast.success("Organization updated");
    } catch {
      toast.error("Failed to update organization");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organization</CardTitle>
        <CardDescription>Manage your organization settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
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
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Page ---
export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and organization preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="two-factor">Two-Factor</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
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
