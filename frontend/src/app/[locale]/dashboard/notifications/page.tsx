"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const t = useTranslations("dashboard.notifications");
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications");
      return response.data.data ?? response.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: () => toast.error("Failed to mark notification as read"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(t("allMarkedRead"));
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? (
              <>
                <Badge variant="default" className="mr-1.5 text-xs">
                  {unreadCount}
                </Badge>
                {t("unread")}
              </>
            ) : (
              t("allCaughtUp")
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !notifications?.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
        </div>
      ) : (
        <ul className="space-y-2" aria-label="Notifications list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "group flex items-start gap-4 rounded-lg border p-4 transition-colors duration-150",
                notification.read
                  ? "border-border bg-card"
                  : "border-violet-500/20 bg-violet-500/5"
              )}
            >
              <div className="mt-0.5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      !notification.read && "text-white"
                    )}
                  >
                    {notification.title}
                  </p>
                  <time
                    dateTime={notification.createdAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => markReadMutation.mutate(notification.id)}
                  aria-label={`${t("markRead")}: "${notification.title}"`}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
