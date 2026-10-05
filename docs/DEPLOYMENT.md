# Déploiement

## Local

PostgreSQL local via Docker Compose. Le seed Prisma est réservé au développement/test et ne doit jamais être exécuté contre une base de production.

## Staging

Objectif : valider une version candidate sur une infrastructure proche de la production.

- Application : Vercel
- Base : PostgreSQL dédiée au staging
- Migrations : prisma migrate deploy
- Health check : /api/health
- Validation : smoke tests puis E2E critiques

Procédure : créer la base staging, configurer les variables Vercel, déployer la branche candidate, exécuter les migrations, vérifier /api/health, tester login/onboarding/produits/stock/clients/factures/devis, vérifier les emails et contrôler les logs.

## Production

- Application : Vercel
- Base : PostgreSQL de production dédiée
- Secrets : variables d'environnement uniquement
- Migrations : prisma migrate deploy
- Seed de démonstration : interdit
- Health check : /api/health
- Backups : scripts/backup-postgres.sh
- Restauration : scripts/restore-postgres.sh

Variables obligatoires en production : DATABASE_URL et AUTH_SECRET d'au moins 32 caractères. La configuration SMTP complète est nécessaire si les emails sont activés.

## Procédure de release

1. CI verte.
2. Variables de production vérifiées.
3. PostgreSQL accessible.
4. Migrations exécutées.
5. Déploiement Vercel.
6. Vérification /api/health.
7. Smoke tests critiques.
8. Contrôle des logs.
9. Vérification du backup.

Une migration destructive doit toujours avoir une stratégie de restauration préalable.