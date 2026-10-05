# StockFlow

Application SaaS moderne de gestion de stock et de facturation.

## Stack
- Next.js App Router + TypeScript strict
- Tailwind CSS
- Zustand
- Prisma + PostgreSQL
- Recharts
- Docker Compose pour PostgreSQL local

## Démarrage
```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Puis ouvrir http://localhost:3000.

## Architecture
UI → services/actions → Prisma → PostgreSQL. Les montants financiers sont modélisés avec Prisma Decimal. La numérotation des factures devra être générée côté serveur dans une transaction via InvoiceSequence.

## Branches
- `master` : base du dépôt
- `develop` : branche de développement active
