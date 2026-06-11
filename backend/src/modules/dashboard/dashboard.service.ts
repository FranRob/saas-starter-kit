import * as repo from "./dashboard.repository.js";

export async function getStats(tenantId: string) {
  const [contacts, products, unreadNotifications, users, recentContacts] = await Promise.all([
    repo.countContacts(tenantId),
    repo.countProducts(tenantId),
    repo.countUnreadNotifications(tenantId),
    repo.countActiveUsers(tenantId),
    repo.findRecentContacts(tenantId),
  ]);

  return { contacts, products, unreadNotifications, users, recentContacts };
}
