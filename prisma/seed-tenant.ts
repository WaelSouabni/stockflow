import { PrismaClient, InvoiceStatus, InvoiceType, UserRole, StockMovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("StockFlow123!", 12);
  const company = await prisma.company.create({ data: { name: "StockFlow Demo" } });

  await prisma.companySettings.create({
    data: {
      companyId: company.id,
      companyName: "StockFlow Demo",
      address: "12 rue de la République",
      city: "Lyon",
      zip: "69002",
      country: "France",
      email: "contact@stockflow.test",
      currency: "EUR",
      locale: "fr-FR",
      invoicePrefix: "FAC",
      invoiceNumberPadding: 4,
      defaultTaxRate: 20,
    },
  });

  const admin = await prisma.user.create({ data: { name: "Sophie Martin", email: "admin@stockflow.test", passwordHash, role: UserRole.ADMIN, companyId: company.id } });
  await prisma.user.create({ data: { name: "Thomas Bernard", email: "manager@stockflow.test", passwordHash, role: UserRole.MANAGER, companyId: company.id } });
  await prisma.user.create({ data: { name: "Lucas Petit", email: "user@stockflow.test", passwordHash, role: UserRole.USER, companyId: company.id } });

  const customer = await prisma.customer.create({
    data: { companyId: company.id, name: "Acme Retail", email: "contact@acme.test", phone: "+33 1 40 20 30 40", city: "Paris", zip: "75008", country: "France" },
  });

  const product = await prisma.product.create({
    data: {
      companyId: company.id, sku: "LAP-001", name: "Laptop Pro 14", category: "Informatique",
      price: 1299, costPrice: 920, stock: 14, minStock: 5,
    },
  });

  await prisma.stockMovement.create({
    data: { companyId: company.id, productId: product.id, type: StockMovementType.IN, quantity: 14, reason: "Stock initial" },
  });

  const total = 1299 * 2 * 1.2;
  await prisma.invoice.create({
    data: {
      companyId: company.id,
      number: "FAC-2026-0001",
      type: InvoiceType.INVOICE,
      status: InvoiceStatus.PAID,
      customerId: customer.id,
      currency: "EUR",
      subtotal: 2598,
      discount: 0,
      taxRate: 20,
      taxAmount: 519.6,
      total,
      items: { create: [{ productId: product.id, description: product.name, quantity: 2, unitPrice: 1299, discount: 0, total: 2598 }] },
    },
  });

  await prisma.invoiceSequence.create({
    data: { companyId: company.id, year: new Date().getFullYear(), documentType: InvoiceType.INVOICE, lastNumber: 1 },
  });

  console.log("✓ Multi-tenant demo company seeded");
  console.log("✓ Users: admin@stockflow.test / StockFlow123!");
  console.log(`✓ Admin: ${admin.email}`);
}

main().catch(error => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
