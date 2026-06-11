import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_USER_EMAIL = "demo@example.com";
const DEMO_USER_PASSWORD = "demo1234";

const CONTACTS = [
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

const PRODUCTS = [
  { name: "Starter Plan", description: "Perfect for small teams getting started", price: 29.0, stock: 999 },
  { name: "Professional Plan", description: "Advanced features for growing businesses", price: 79.0, stock: 999 },
  { name: "Enterprise Plan", description: "Full-featured solution for large organizations", price: 199.0, stock: 999 },
  { name: "API Add-on", description: "Extended API rate limits and webhooks", price: 19.0, stock: 999 },
  { name: "Analytics Dashboard", description: "Advanced reporting and data insights", price: 39.0, stock: 999 },
  { name: "White-label License", description: "Remove branding and use your own", price: 149.0, stock: 50 },
];

const NOTIFICATIONS = [
  { title: "New team member joined", message: "Grace Kim accepted your invitation and joined Acme Corp.", read: false },
  { title: "Subscription renewed", message: "Your Professional Plan subscription has been renewed for another month.", read: false },
  { title: "Storage limit warning", message: "You have used 80% of your storage quota. Consider upgrading.", read: false },
  { title: "API usage milestone", message: "Congratulations! You've made 10,000 API calls this month.", read: true },
  { title: "Security alert", message: "A new login was detected from a new device. If this was you, no action is needed.", read: true },
];

async function main() {
  console.log("[seed] Starting...");

  // 1. Upsert demo tenant
  await prisma.tenant.upsert({
    where: { id: DEMO_TENANT_ID },
    update: { name: "Acme Corp" },
    create: { id: DEMO_TENANT_ID, name: "Acme Corp", slug: "acme-corp-demo" },
  });

  // 2. Upsert demo user
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      passwordHash,
      role: UserRole.OWNER,
      emailVerified: true,
      tenantId: DEMO_TENANT_ID,
    },
  });

  // 3. Reset demo data (same as cron — idempotent)
  await prisma.notification.deleteMany({ where: { tenantId: DEMO_TENANT_ID } });
  await prisma.product.deleteMany({ where: { tenantId: DEMO_TENANT_ID } });
  await prisma.contact.deleteMany({ where: { tenantId: DEMO_TENANT_ID } });

  await prisma.contact.createMany({ data: CONTACTS.map((c) => ({ ...c, tenantId: DEMO_TENANT_ID })) });
  await prisma.product.createMany({ data: PRODUCTS.map((p) => ({ ...p, tenantId: DEMO_TENANT_ID })) });
  await prisma.notification.createMany({ data: NOTIFICATIONS.map((n) => ({ ...n, tenantId: DEMO_TENANT_ID })) });

  console.log("[seed] Done. Demo tenant ready.");
}

main()
  .catch((e) => { console.error("[seed] Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
