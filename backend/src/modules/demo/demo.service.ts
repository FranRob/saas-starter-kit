import { prisma } from "../../lib/prisma.js";
import { env } from "../../lib/env.js";

const DEMO_CONTACTS = [
  { name: "Alice Johnson", email: "alice@acmecorp.com", phone: "+1 (555) 234-5678", notes: "Key account manager" },
  { name: "Bob Martinez", email: "bob@acmecorp.com", phone: "+1 (555) 345-6789", notes: null },
  { name: "Carol White", email: "carol@techpartners.io", phone: "+1 (555) 456-7890", notes: "Strategic partner" },
  { name: "David Lee", email: "david@innovate.co", phone: "+1 (555) 567-8901", notes: null },
  { name: "Emma Davis", email: "emma@globalventures.com", phone: "+1 (555) 678-9012", notes: "Newsletter subscriber" },
  { name: "Frank Wilson", email: "frank@acmecorp.com", phone: "+1 (555) 789-0123", notes: null },
  { name: "Grace Kim", email: "grace@startuplab.io", phone: "+1 (555) 890-1234", notes: "Referred by Alice" },
  { name: "Henry Brown", email: "henry@acmecorp.com", phone: "+1 (555) 901-2345", notes: null },
  { name: "Isabella Chen", email: "isabella@digitalworks.com", phone: "+1 (555) 012-3456", notes: "Enterprise prospect" },
  { name: "James Taylor", email: "james@acmecorp.com", phone: "+1 (555) 123-4567", notes: null },
];

const DEMO_PRODUCTS = [
  { name: "Starter Plan", description: "Perfect for small teams getting started", price: 29.0, stock: 999 },
  { name: "Professional Plan", description: "Advanced features for growing businesses", price: 79.0, stock: 999 },
  { name: "Enterprise Plan", description: "Full-featured solution for large organizations", price: 199.0, stock: 999 },
  { name: "API Add-on", description: "Extended API rate limits and webhooks", price: 19.0, stock: 999 },
  { name: "Analytics Dashboard", description: "Advanced reporting and data insights", price: 39.0, stock: 999 },
  { name: "White-label License", description: "Remove branding and use your own", price: 149.0, stock: 50 },
];

const DEMO_NOTIFICATIONS = [
  { title: "New team member joined", message: "Grace Kim accepted your invitation and joined Acme Corp.", read: false },
  { title: "Subscription renewed", message: "Your Professional Plan subscription has been renewed for another month.", read: false },
  { title: "Storage limit warning", message: "You have used 80% of your storage quota. Consider upgrading.", read: false },
  { title: "API usage milestone", message: "Congratulations! You've made 10,000 API calls this month.", read: true },
  { title: "Security alert", message: "A new login was detected from a new device. If this was you, no action is needed.", read: true },
];

export async function resetDemoTenant(): Promise<void> {
  const tenantId = env.DEMO_TENANT_ID;
  if (!tenantId) {
    console.warn("[demo-reset] DEMO_TENANT_ID is not set — skipping reset");
    return;
  }

  console.log(`[demo-reset] Resetting demo tenant ${tenantId}...`);

  // Delete existing data (scoped to tenant)
  await prisma.notification.deleteMany({ where: { tenantId } });
  await prisma.product.deleteMany({ where: { tenantId } });
  await prisma.contact.deleteMany({ where: { tenantId } });

  // Re-create demo data
  await prisma.contact.createMany({
    data: DEMO_CONTACTS.map((c) => ({ ...c, tenantId })),
  });

  await prisma.product.createMany({
    data: DEMO_PRODUCTS.map((p) => ({ ...p, tenantId })),
  });

  await prisma.notification.createMany({
    data: DEMO_NOTIFICATIONS.map((n) => ({ ...n, tenantId })),
  });

  console.log("[demo-reset] Demo tenant reset complete.");
}
