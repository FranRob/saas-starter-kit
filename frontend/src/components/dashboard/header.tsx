"use client";

import { useTranslations } from "next-intl";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/language-selector";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { removeToken } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const t = useTranslations("header");

  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: async () => {
      const res = await api.get("/org");
      return res.data.data ?? res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const tenantName = org?.name ?? t("myOrg");
  const initials = tenantName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — still clear local state and redirect
    } finally {
      removeToken();
      router.push("/login");
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label={t("toggleSidebar")}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          {tenantName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={t("openUserMenu")}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-violet-500/20 text-violet-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
              {tenantName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/settings")}
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-400 focus:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
