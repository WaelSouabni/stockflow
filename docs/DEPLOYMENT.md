# StockFlow — Production Deployment

## Architecture

- Next.js App Router deployed on Vercel or another Node-compatible platform.
- PostgreSQL managed database for production.
- Prisma migrations are the only supported production schema mechanism.
- /api/health is the application readiness/health endpoint.
- SMTP is optional but required for transactional invoice/quote emails.

## Required environment variables

Production must define:
- DATABASE_URL
- AUTH_SECRET — at least 32 random characters

If email is enabled, define SMTP_HOST, SMTP_USER, SMTP_PASSWORD and EMAIL_FROM together.

Optional:
- SMTP_PORT
- SMTP_SECURE
- BACKUP_DIR
- RETENTION_DAYS

Never commit .env files or production secrets.

## Database migrations

Development:
npm run prisma:migrate

Production:
npm run prisma:migrate:deploy

Do not use prisma db push in production.

Recommended release sequence:
1. Build and run CI.
2. Apply the reviewed Prisma migration to staging.
3. Run health and smoke tests.
4. Back up production PostgreSQL.
5. Apply prisma migrate deploy.
6. Deploy/promote the application.
7. Check /api/health and application logs.
8. Keep the previous deployment available for rollback.

For destructive or high-risk schema changes, use an expand → migrate data → contract strategy.

## PostgreSQL backups

Create a custom-format backup:
DATABASE_URL="..." BACKUP_DIR="./backups" RETENTION_DAYS=14 ./scripts/backup-postgres.sh

Restore a backup:
DATABASE_URL="..." ./scripts/restore-postgres.sh ./backups/stockflow-YYYYMMDDTHHMMSSZ.dump

Production backups should also be enabled at the managed PostgreSQL provider level with point-in-time recovery where available. Repository scripts are an additional layer, not a replacement for provider backups.

Target policy:
- daily automated backup
- 14–30 days retention
- encrypted storage
- off-site/provider-managed copy
- periodic restore test

## Health and monitoring

Health endpoint:
GET /api/health

Healthy response is HTTP 200 with status=ok and database=ok.
Database failure returns HTTP 503 without exposing connection details.

Use the endpoint with an uptime monitor and alert on HTTP 5xx, latency and repeated database failures.

For Vercel, inspect runtime logs after releases. For PostgreSQL, monitor connection saturation, CPU, memory, storage, slow queries and backup status.

## CI/CD

GitHub Actions verifies:
1. dependency installation
2. environment validation
3. Prisma client generation
4. Prisma schema validation
5. Prisma migration deployment against PostgreSQL 16
6. deterministic seed
7. unit tests
8. TypeScript
9. production build
10. production health endpoint
11. Playwright E2E tests

The CI workflow uses migrations instead of db push.

## Vercel

The repository is prepared for Vercel, but the project must be connected to the intended Vercel account/project before a real production deployment.

Set production environment variables in the Vercel project. Never commit secrets.

Recommended release flow:
tests → build → preview → smoke/E2E → promote.

Database migrations should run as an explicit release step before production promotion.

## Rollback

Application rollback:
- promote the last known-good deployment.

Database rollback:
- do not blindly reverse production migrations.
- prefer a forward fix for backward-compatible migrations.
- restore PostgreSQL from backup only for true data-recovery scenarios.

## Pre-production checklist

- [ ] Production PostgreSQL created
- [ ] TLS/SSL database connection enabled
- [ ] DATABASE_URL configured
- [ ] strong AUTH_SECRET configured
- [ ] SMTP configured and test email sent
- [ ] migration applied successfully
- [ ] backup created
- [ ] restore procedure tested
- [ ] /api/health returns 200
- [ ] E2E smoke tests pass
- [ ] uptime alert configured
- [ ] rollback procedure tested
- [ ] demo credentials disabled/removed from production data
