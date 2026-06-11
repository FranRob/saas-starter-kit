"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { UserPlus, Loader2, Trash2, ShieldCheck, User, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  isSelf?: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
}

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

export default function TeamPage() {
  const t = useTranslations("dashboard.team");
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null);

  const { data: members, isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await api.get("/team");
      return res.data.data ?? res.data;
    },
  });

  const { data: invitations } = useQuery<Invitation[]>({
    queryKey: ["team-invites"],
    queryFn: async () => {
      try {
        const res = await api.get("/team/invites");
        return res.data.data ?? res.data;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) return [];
        throw err;
      }
    },
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteFormData) => api.post("/team/invite", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
      toast.success(t("inviteSent"));
      setInviteOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to send invitation"),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "ADMIN" | "MEMBER" }) =>
      api.put(`/team/members/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/team/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Member removed");
      setConfirmRemove(null);
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "MEMBER" },
  });

  async function onInviteSubmit(data: InviteFormData) {
    await inviteMutation.mutateAsync(data);
  }

  function roleBadge(role: Role) {
    if (role === "OWNER") {
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
          <Crown className="mr-1 h-3 w-3" aria-hidden="true" />
          {t("roleOwner")}
        </Badge>
      );
    }
    if (role === "ADMIN") {
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
          <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
          {t("roleAdmin")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
        <User className="mr-1 h-3 w-3" aria-hidden="true" />
        {t("roleMember")}
      </Badge>
    );
  }

  const showInvitations = Array.isArray(invitations) && invitations.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="cursor-pointer">
          <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("invite")}
        </Button>
      </div>

      {/* Members table */}
      <section aria-labelledby="members-heading">
        <h2
          id="members-heading"
          className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider"
        >
          {t("members")}
        </h2>
        <div className="rounded-lg border border-border">
          {membersLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !members?.length ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("noMembers")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("joined")}</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                      {member.isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>{roleBadge(member.role)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    <TableCell>
                      {member.role !== "OWNER" && !member.isSelf && (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              changeRoleMutation.mutate({
                                userId: member.id,
                                role: e.target.value as "ADMIN" | "MEMBER",
                              })
                            }
                            disabled={changeRoleMutation.isPending}
                            aria-label={`Change role for ${member.name}`}
                            className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="ADMIN">{t("roleAdmin")}</option>
                            <option value="MEMBER">{t("roleMember")}</option>
                          </select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmRemove(member)}
                            aria-label={`Remove ${member.name}`}
                            className="cursor-pointer text-muted-foreground hover:text-red-400 transition-colors duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {/* Pending invitations */}
      {showInvitations && (
        <section aria-labelledby="invitations-heading">
          <h2
            id="invitations-heading"
            className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider"
          >
            {t("pendingInvitations")}
          </h2>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("joined")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations!.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-muted-foreground">{inv.email}</TableCell>
                    <TableCell>{roleBadge(inv.role)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatDate(inv.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {t("pending")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) { setInviteOpen(false); reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("invite")}</DialogTitle>
            <DialogDescription>
              They will receive an email with a link to join your workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onInviteSubmit)} noValidate className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">{t("inviteEmail")}</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="invite-email-error" role="alert" className="text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">{t("inviteRole")}</Label>
              <select
                id="invite-role"
                {...register("role")}
                aria-invalid={!!errors.role}
                className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="MEMBER">{t("roleMember")}</option>
                <option value="ADMIN">{t("roleAdmin")}</option>
              </select>
              {errors.role && (
                <p role="alert" className="text-xs text-red-400">
                  {errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setInviteOpen(false); reset(); }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="cursor-pointer"
              >
                {inviteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {t("sendInvite")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm remove dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => { if (!open) setConfirmRemove(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("removeUser")}</DialogTitle>
            <DialogDescription>
              {confirmRemove
                ? t("removeConfirm", { name: confirmRemove.name })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRemove(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => confirmRemove && removeMutation.mutate(confirmRemove.id)}
              className="cursor-pointer"
            >
              {removeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t("removeUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
