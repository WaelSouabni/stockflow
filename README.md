# StockFlow

Application SaaS moderne de gestion de stock et de facturation.

## Stack
- Next.js App Router + TypeScript strict
- Tailwind CSS
- Zustand
- Prisma + PostgreSQL
- Recharts
- Docker Compose pour PostgreSQL local

## Démarrage local
```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Puis ouvrir http://localhost:3000.

## Variables d'environnement
- `DATABASE_URL` : URL PostgreSQL.
- `AUTH_SECRET` : secret JWT long et aléatoire. Il est obligatoire en production.

Ne jamais utiliser les valeurs de démonstration ou le secret CI en production.

## Base de données et migrations

Le schéma de production est versionné dans `prisma/migrations`. En production, utiliser uniquement :

```bash
npx prisma migrate deploy
```

Ne pas utiliser `prisma db push` en production : les migrations permettent de tracer et reproduire précisément les changements de schéma.

La CI vérifie automatiquement `prisma validate`, applique les migrations sur PostgreSQL vierge et exécute `prisma migrate status`.

## Architecture
UI → services/actions → Prisma → PostgreSQL. Les montants financiers sont modélisés avec Prisma Decimal. La numérotation des factures est générée côté serveur dans une transaction via InvoiceSequence.

## Branches
- `master` : base du dépôt
- `develop` : branche de développement active

## Données de démonstration

StockFlow inclut un seed Prisma réaliste pour tester le dashboard, le stock, les clients, les factures, les devis et les rôles.

Commandes :

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Le seed est **destructif** en développement : il nettoie les données existantes puis recrée un jeu cohérent.

Comptes de démonstration :
- `admin@stockflow.test / StockFlow123!`
- `manager@stockflow.test / StockFlow123!`
- `user@stockflow.test / StockFlow123!`

**Ne jamais utiliser ces identifiants en production.**
