import { InvoiceStatus, InvoiceType, PrismaClient, StockMovementType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("StockFlow123!", 12);

  await prisma.$transaction(async (tx) => {
    const company =
      (await tx.company.findFirst({ where: { name: "StockFlow Demo" } })) ??
      (await tx.company.create({ data: { name: "StockFlow Demo" } }));

    await tx.companySettings.upsert({
      where: { companyId: company.id },
      update: {
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
      create: {
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

    for (const user of [
      { name: "Sophie Martin", email: "admin@stockflow.test", role: UserRole.ADMIN },
      { name: "Thomas Bernard", email: "manager@stockflow.test", role: UserRole.MANAGER },
      { name: "Lucas Petit", email: "user@stockflow.test", role: UserRole.USER },
    ]) {
      await tx.user.upsert({
        where: { email: user.email },
        update: { name: user.name, passwordHash, role: user.role, active: true, companyId: company.id },
        create: { ...user, passwordHash, companyId: company.id },
      });
    }

    const customer =
      (await tx.customer.findFirst({ where: { companyId: company.id, email: "contact@acme.test" } })) ??
      (await tx.customer.create({
        data: {
          companyId: company.id,
          name: "Acme Retail",
          email: "contact@acme.test",
          phone: "+33 1 40 20 30 40",
          city: "Paris",
          zip: "75008",
          country: "France",
        },
      }));

    const product = await tx.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "LAP-001" } },
      update: { name: "Laptop Pro 14", category: "Informatique", price: 1299, costPrice: 920, stock: 14, minStock: 5, active: true },
      create: {
        companyId: company.id,
        sku: "LAP-001",
        name: "Laptop Pro 14",
        category: "Informatique",
        price: 1299,
        costPrice: 920,
        stock: 14,
        minStock: 5,
      },
    });

    await tx.stockMovement.deleteMany({
      where: { companyId: company.id, productId: product.id, reason: "Stock initial" },
    });
    await tx.stockMovement.create({
      data: {
        companyId: company.id,
        productId: product.id,
        type: StockMovementType.IN,
        quantity: 14,
        reason: "Stock initial",
      },
    });

    const total = 1299 * 2 * 1.2;
    const invoice = await tx.invoice.upsert({
      where: { companyId_number: { companyId: company.id, number: "FAC-2026-0001" } },
      update: {
        type: InvoiceType.INVOICE,
        status: InvoiceStatus.PAID,
        customerId: customer.id,
        currency: "EUR",
        subtotal: 2598,
        discount: 0,
        taxRate: 20,
        taxAmount: 519.6,
        total,
      },
      create: {
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
      },
    });

    await tx.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await tx.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        productId: product.id,
        description: product.name,
        quantity: 2,
        unitPrice: 1299,
        discount: 0,
        total: 2598,
      },
    });

    await tx.invoiceSequence.upsert({
      where: {
        companyId_year_documentType: {
          companyId: company.id,
          year: new Date().getFullYear(),
          documentType: InvoiceType.INVOICE,
        },
      },
      update: { lastNumber: 1 },
      create: {
        companyId: company.id,
        year: new Date().getFullYear(),
        documentType: InvoiceType.INVOICE,
        lastNumber: 1,
      },
    });

    console.log("✓ Multi-tenant demo company seeded");
    console.log("✓ Users: admin@stockflow.test / StockFlow123!");
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
