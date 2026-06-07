"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Package, Bell, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Stats {
  contacts: number;
  products: number;
  unreadNotifications: number;
  users: number;
}

interface DashboardData {
  stats: Stats;
  recentContacts: Contact[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/dashboard");
      return response.data;
    },
  });

  const stats = [
    { title: "Total Contacts", value: data?.stats.contacts, icon: Users },
    { title: "Products", value: data?.stats.products, icon: Package },
    {
      title: "Unread Notifications",
      value: data?.stats.unreadNotifications,
      icon: Bell,
    },
    { title: "Team Members", value: data?.stats.users, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your workspace at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Recent contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Contacts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.recentContacts?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No contacts yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.email}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {contact.phone ?? (
                        <Badge variant="outline" className="text-xs">
                          —
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
