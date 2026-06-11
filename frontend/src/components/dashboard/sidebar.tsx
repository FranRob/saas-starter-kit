"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Package,
  Bell,
  Settings,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/contacts", label: t("contacts"), icon: Users },
    { href: "/dashboard/products", label: t("products"), icon: Package },
    { href: "/dashboard/team", label: t("team"), icon: UsersRound },
    { href: "/dashboard/notifications", label: t("notifications"), icon: Bell },
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ];

  // pathname includes the locale prefix like /es/dashboard — strip it for matching
  const localePrefixRegex = /^\/[a-z]{2}(\/|$)/;
  const pathWithoutLocale = pathname.replace(localePrefixRegex, "/");

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathWithoutLocale === href;
    return pathWithoutLocale.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <Zap className="h-5 w-5 text-violet-400" aria-hidden="true" />
          <span className="text-sm font-semibold">Starter Kit</span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
