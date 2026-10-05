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


## Données de démonstration

StockFlow inclut un seed Prisma réaliste pour tester le dashboard, le stock, les clients, les factures, les devis et les rôles.

Commandes : npm install ; npm run prisma:generate ; npm run prisma:migrate ; npm run prisma:seed

Le seed est destructif en développement : il nettoie les données existantes puis recrée un jeu cohérent.

Comptes de démonstration : admin@stockflow.test / StockFlow123! ; manager@stockflow.test / StockFlow123! ; user@stockflow.test / StockFlow123!

Ne pas utiliser ces identifiants en production.

## Emails transactionnels

StockFlow utilise Nodemailer avec SMTP afin de rester indépendant d’un fournisseur d’email. Configurez les variables SMTP dans l’environnement de déploiement. Les factures et devis peuvent ensuite être envoyés directement au client avec leur PDF en pièce jointe. Les données SMTP ne sont jamais exposées au navigateur.
