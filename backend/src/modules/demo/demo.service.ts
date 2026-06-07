import { prisma } from "../../lib/prisma.js";
import { env } from "../../lib/env.js";

const DEMO_CONTACTS = [
  { name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-0101", notes: "VIP client" },
  { name: "Bob Smith", email: "bob@example.com", phone: "+1 555-0102", notes: null },
  { name: "Carol White", email: "carol@example.com", phone: "+1 555-0103", notes: "Prefers mornings" },
  { name: "David Brown", email: "david@example.com", phone: "+1 555-0104", notes: null },
  { name: "Emma Davis", email: "emma@example.com", phone: "+1 555-0105", notes: "Newsletter subscriber" },
  { name: "Frank Miller", email: "frank@example.com", phone: "+1 555-0106", notes: null },
  { name: "Grace Wilson", email: "grace@example.com", phone: "+1 555-0107", notes: "Referred by Alice" },
  { name: "Henry Moore", email: "henry@example.com", phone: "+1 555-0108", notes: null },
  { name: "Iris Taylor", email: "iris@example.com", phone: "+1 555-0109", notes: "Premium plan" },
  { name: "Jack Anderson", email: "jack@example.com", phone: "+1 555-0110", notes: null },
];

const DEMO_PRODUCTS = [
  { name: "Starter Plan", description: "Up to 5 users, 10 GB storage", price: 29.0, stock: 999 },
  { name: "Pro Plan", description: "Up to 25 users, 50 GB storage", price: 79.0, stock: 999 },
  { name: "Business Plan", description: "Up to 100 users, 200 GB storage", price: 199.0, stock: 999 },
  { name: "Enterprise Plan", description: "Unlimited users, custom storage", price: 499.0, stock: 999 },
  { name: "Add-on: Extra Storage (50 GB)", description: "Expandable storage block", price: 9.99, stock: 500 },
  { name: "Add-on: Priority Support", description: "24/7 dedicated support", price: 49.0, stock: 200 },
  { name: "Add-on: Custom Domain", description: "Use your own domain", price: 15.0, stock: 300 },
  { name: "One-time Setup Fee", description: "Professional onboarding session", price: 199.0, stock: 100 },
];

const DEMO_NOTIFICATIONS = [
  { title: "Welcome to the demo!", message: "This is a demo account. Data resets every hour.", read: false },
  { title: "New contact added", message: "Alice Johnson was added to your contacts.", read: false },
  { title: "Product updated", message: "Pro Plan price has been updated.", read: true },
  { title: "System maintenance", message: "Scheduled maintenance on Sunday at 3 AM UTC.", read: false },
  { title: "Usage report ready", message: "Your monthly usage report is available.", read: true },
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
