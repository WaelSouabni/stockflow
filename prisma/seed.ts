import { PrismaClient, InvoiceStatus, InvoiceType, StockMovementType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const YEAR = new Date().getFullYear();
const pad = (n: number) => String(n).padStart(4, "0");
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

function totals(
  items: Array<{ quantity: number; unitPrice: number; discount?: number }>,
  discount = 0,
  taxRate = 20,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - (item.discount ?? 0),
    0,
  );
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = taxable * taxRate / 100;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount,
    taxRate,
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number((taxable + taxAmount).toFixed(2)),
  };
}

async function main() {
  console.log(`Seeding StockFlow demo data for ${YEAR}…`);

  // This seed is intentionally destructive: it creates a clean, coherent demo dataset.
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.invoiceSequence.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();

  await prisma.companySettings.create({
    data: {
      companyName: "StockFlow Demo",
      address: "12 rue de la République",
      city: "Lyon",
      zip: "69002",
      country: "France",
      email: "contact@stockflow.test",
      phone: "+33 4 72 00 00 00",
      website: "https://stockflow.test",
      siret: "12345678900012",
      vatNumber: "FR12123456789",
      bankName: "Banque StockFlow",
      iban: "FR76 3000 4000 5000 6000 7000 890",
      bic: "STKF FR PP",
      currency: "EUR",
      locale: "fr-FR",
      invoicePrefix: "FAC",
      invoiceNumberPadding: 4,
      defaultTaxRate: 20,
    },
  });

  const passwordHash = await bcrypt.hash("StockFlow123!", 12);
  await prisma.user.createMany({
    data: [
      { name: "Sophie Martin", email: "admin@stockflow.test", passwordHash, role: UserRole.ADMIN },
      { name: "Thomas Bernard", email: "manager@stockflow.test", passwordHash, role: UserRole.MANAGER },
      { name: "Lucas Petit", email: "user@stockflow.test", passwordHash, role: UserRole.USER },
    ],
  });

  const customerData = [
    ["Acme Retail", "contact@acme.test", "+33 1 40 20 30 40", "Paris", "75008"],
    ["NovaTech", "hello@novatech.test", "+33 4 78 11 22 33", "Lyon", "69003"],
    ["Atelier Horizon", "bonjour@horizon.test", "+33 3 20 10 20 30", "Lille", "59000"],
    ["Maison & Co", "contact@maisonco.test", "+33 1 55 44 33 22", "Bordeaux", "33000"],
    ["BluePeak", "finance@bluepeak.test", "+33 4 91 20 30 40", "Marseille", "13006"],
    ["GreenOffice", "achats@greenoffice.test", "+33 1 70 80 90 00", "Nanterre", "92000"],
    ["Studio Pixel", "studio@pixel.test", "+33 5 61 22 33 44", "Toulouse", "31000"],
    ["Proxima Services", "contact@proxima.test", "+33 2 40 11 22 33", "Nantes", "44000"],
  ];

  const customers = [];
  for (const [index, [name, email, phone, city, zip]] of customerData.entries()) {
    customers.push(
      await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          address: `${index + 1} avenue de la Liberté`,
          city,
          zip,
          country: "France",
          taxNumber: `FR1234567890${String(index + 1).padStart(2, "0")}`,
        },
      }),
    );
  }

  const productData = [
    { sku: "LAP-001", name: "Laptop Pro 14", category: "Informatique", supplier: "TechSupply", price: 1299, costPrice: 920, stock: 14, minStock: 5, variants: [["16 Go", "16GB", "Gris"], ["32 Go", "32GB", "Noir"]] },
    { sku: "MON-001", name: "Écran 27 pouces 4K", category: "Informatique", supplier: "DisplayCo", price: 499, costPrice: 330, stock: 8, minStock: 4, variants: [["Noir", undefined, "Noir"]] },
    { sku: "KEY-001", name: "Clavier mécanique", category: "Accessoires", supplier: "KeyWorks", price: 119, costPrice: 68, stock: 22, minStock: 8, variants: [["AZERTY", "AZERTY", "Noir"], ["QWERTY", "QWERTY", "Blanc"]] },
    { sku: "MOU-001", name: "Souris sans fil", category: "Accessoires", supplier: "KeyWorks", price: 59, costPrice: 31, stock: 31, minStock: 10, variants: [["Graphite", undefined, "Graphite"]] },
    { sku: "USB-001", name: "Hub USB-C 7-en-1", category: "Accessoires", supplier: "ConnectPro", price: 79, costPrice: 42, stock: 6, minStock: 8 },
    { sku: "WEB-001", name: "Webcam Full HD", category: "Visio", supplier: "VisionTech", price: 89, costPrice: 51, stock: 18, minStock: 6 },
    { sku: "CAS-001", name: "Casque audio", category: "Audio", supplier: "SoundLab", price: 149, costPrice: 91, stock: 4, minStock: 7 },
    { sku: "SSD-001", name: "SSD externe 1 To", category: "Stockage", supplier: "DataStore", price: 109, costPrice: 72, stock: 12, minStock: 5 },
    { sku: "DOC-001", name: "Station d'accueil", category: "Accessoires", supplier: "ConnectPro", price: 199, costPrice: 121, stock: 3, minStock: 5 },
    { sku: "CHA-001", name: "Chaise ergonomique", category: "Mobilier", supplier: "OfficePro", price: 349, costPrice: 235, stock: 9, minStock: 3 },
    { sku: "BUR-001", name: "Bureau réglable", category: "Mobilier", supplier: "OfficePro", price: 599, costPrice: 390, stock: 5, minStock: 3 },
    { sku: "LAM-001", name: "Lampe de bureau LED", category: "Mobilier", supplier: "OfficePro", price: 69, costPrice: 34, stock: 16, minStock: 5 },
    { sku: "CAB-001", name: "Câble USB-C 2 m", category: "Accessoires", supplier: "ConnectPro", price: 19, costPrice: 7, stock: 42, minStock: 15 },
    { sku: "PRI-001", name: "Imprimante laser", category: "Bureautique", supplier: "PrintMax", price: 289, costPrice: 190, stock: 2, minStock: 4 },
    { sku: "TON-001", name: "Toner noir", category: "Bureautique", supplier: "PrintMax", price: 89, costPrice: 55, stock: 10, minStock: 6 },
    { sku: "TAB-001", name: "Tablette 11 pouces", category: "Informatique", supplier: "MobileTech", price: 429, costPrice: 285, stock: 7, minStock: 4 },
    { sku: "TEL-001", name: "Smartphone Pro", category: "Téléphonie", supplier: "MobileTech", price: 799, costPrice: 590, stock: 4, minStock: 5 },
    { sku: "MIC-001", name: "Microphone USB", category: "Audio", supplier: "SoundLab", price: 129, costPrice: 76, stock: 11, minStock: 4 },
    { sku: "SUP-001", name: "Support écran", category: "Mobilier", supplier: "OfficePro", price: 79, costPrice: 43, stock: 13, minStock: 5 },
    { sku: "ETH-001", name: "Adaptateur Ethernet USB-C", category: "Réseau", supplier: "ConnectPro", price: 39, costPrice: 20, stock: 25, minStock: 10 },
  ];

  const products: Record<string, Awaited<ReturnType<typeof prisma.product.create>>> = {};
  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: `Produit de démonstration StockFlow — ${p.name}.`,
        category: p.category,
        supplier: p.supplier,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        minStock: p.minStock,
        variants: p.variants
          ? {
              create: p.variants.map(([name, size, color], index) => ({
                sku: `${p.sku}-V${index + 1}`,
                name: name!,
                size: size ?? null,
                color: color ?? null,
                stock: Math.max(1, Math.floor(p.stock / p.variants!.length)),
                minStock: Math.max(1, Math.floor(p.minStock / p.variants!.length)),
              })),
            }
          : undefined,
      },
    });
    products[p.sku] = product;
  }

  const movementPlan: Array<[string, StockMovementType, number, string, number]> = [
    ["LAP-001", StockMovementType.IN, 20, "Réception fournisseur", 170],
    ["LAP-001", StockMovementType.OUT, 6, "Vente client", 125],
    ["MON-001", StockMovementType.IN, 12, "Réassort", 145],
    ["MON-001", StockMovementType.OUT, 4, "Vente client", 95],
    ["USB-001", StockMovementType.IN, 15, "Réception fournisseur", 80],
    ["USB-001", StockMovementType.OUT, 9, "Ventes B2B", 35],
    ["CAS-001", StockMovementType.IN, 12, "Réception fournisseur", 110],
    ["CAS-001", StockMovementType.OUT, 8, "Vente client", 70],
    ["DOC-001", StockMovementType.IN, 8, "Réassort", 55],
    ["DOC-001", StockMovementType.OUT, 5, "Vente client", 30],
    ["PRI-001", StockMovementType.IN, 7, "Réception fournisseur", 40],
    ["PRI-001", StockMovementType.OUT, 5, "Vente client", 20],
    ["TEL-001", StockMovementType.IN, 10, "Réception fournisseur", 15],
    ["TEL-001", StockMovementType.OUT, 6, "Vente client", 5],
  ];

  for (const [sku, type, quantity, reason, days] of movementPlan) {
    await prisma.stockMovement.create({
      data: {
        productId: products[sku].id,
        type,
        quantity,
        reason,
        createdAt: daysAgo(days),
      },
    });
  }

  const invoicePlans = [
    { customer: 0, days: 8, status: InvoiceStatus.PAID, items: [["LAP-001", 1], ["KEY-001", 2]] },
    { customer: 1, days: 25, status: InvoiceStatus.PAID, items: [["MON-001", 2], ["DOC-001", 1]] },
    { customer: 2, days: 45, status: InvoiceStatus.PAID, items: [["CHA-001", 4], ["LAM-001", 4]] },
    { customer: 3, days: 68, status: InvoiceStatus.PAID, items: [["BUR-001", 2], ["MOU-001", 5]] },
    { customer: 4, days: 92, status: InvoiceStatus.PAID, items: [["SSD-001", 4], ["WEB-001", 3]] },
    { customer: 5, days: 120, status: InvoiceStatus.PAID, items: [["TAB-001", 3], ["TEL-001", 2]] },
    { customer: 6, days: 145, status: InvoiceStatus.PAID, items: [["MIC-001", 2], ["CAS-001", 2]] },
    { customer: 7, days: 175, status: InvoiceStatus.PAID, items: [["ETH-001", 8], ["CAB-001", 10]] },
    { customer: 0, days: 12, status: InvoiceStatus.SENT, items: [["PRI-001", 1], ["TON-001", 2]] },
    { customer: 2, days: 35, status: InvoiceStatus.OVERDUE, items: [["LAP-001", 1], ["SSD-001", 2]] },
    { customer: 4, days: 5, status: InvoiceStatus.DRAFT, items: [["MON-001", 1], ["WEB-001", 1]] },
    { customer: 6, days: 55, status: InvoiceStatus.CANCELLED, items: [["TEL-001", 1]] },
  ] as const;

  let invoiceNo = 0;
  for (const plan of invoicePlans) {
    invoiceNo += 1;
    const items = plan.items.map(([sku, quantity]) => ({
      productId: products[sku].id,
      description: products[sku].name,
      quantity,
      unitPrice: Number(products[sku].price),
      discount: 0,
    }));
    const financials = totals(items);
    await prisma.invoice.create({
      data: {
        number: `FAC-${YEAR}-${pad(invoiceNo)}`,
        type: InvoiceType.INVOICE,
        status: plan.status,
        customerId: customers[plan.customer].id,
        issueDate: daysAgo(plan.days),
        dueDate: new Date(daysAgo(plan.days - 30).getTime()),
        currency: "EUR",
        ...financials,
        items: { create: items.map((item) => ({ ...item, total: item.quantity * item.unitPrice })) },
      },
    });
  }

  const quotePlans = [
    { customer: 1, days: 3, status: InvoiceStatus.DRAFT, items: [["LAP-001", 2], ["DOC-001", 2]] },
    { customer: 3, days: 18, status: InvoiceStatus.SENT, items: [["BUR-001", 5], ["CHA-001", 5]] },
    { customer: 5, days: 40, status: InvoiceStatus.SENT, items: [["MON-001", 4], ["KEY-001", 8]] },
    { customer: 7, days: 75, status: InvoiceStatus.CANCELLED, items: [["TAB-001", 4]] },
  ] as const;

  let quoteNo = 0;
  for (const plan of quotePlans) {
    quoteNo += 1;
    const items = plan.items.map(([sku, quantity]) => ({
      productId: products[sku].id,
      description: products[sku].name,
      quantity,
      unitPrice: Number(products[sku].price),
      discount: 0,
    }));
    const financials = totals(items);
    await prisma.invoice.create({
      data: {
        number: `DEV-${YEAR}-${pad(quoteNo)}`,
        type: InvoiceType.QUOTE,
        status: plan.status,
        customerId: customers[plan.customer].id,
        issueDate: daysAgo(plan.days),
        dueDate: null,
        currency: "EUR",
        ...financials,
        items: { create: items.map((item) => ({ ...item, total: item.quantity * item.unitPrice })) },
      },
    });
  }

  await prisma.invoiceSequence.createMany({
    data: [
      { year: YEAR, documentType: InvoiceType.INVOICE, lastNumber: invoiceNo },
      { year: YEAR, documentType: InvoiceType.QUOTE, lastNumber: quoteNo },
    ],
  });

  console.log("✓ Company settings: 1");
  console.log("✓ Users: 3");
  console.log("✓ Customers: 8");
  console.log("✓ Products: 20");
  console.log("✓ Invoices: 12");
  console.log("✓ Quotes: 4");
  console.log("✓ Stock movements: 14");
  console.log("Demo credentials: admin@stockflow.test / StockFlow123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
