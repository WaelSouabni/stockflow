# StockFlow — Monitoring

## Application

The first monitoring layer is the public health endpoint: GET /api/health.

It checks the application process and performs a lightweight PostgreSQL query.

Recommended alerts:

| Signal | Threshold |
| --- | --- |
| Health endpoint | 2 consecutive failures |
| HTTP 5xx | > 1% over 5 minutes |
| Latency | p95 > 1s |
| Database connections | > 80% pool capacity |
| Disk | > 80% |
| Backup | any failed scheduled backup |

## Logs

Application logs must never contain:
- passwords
- JWTs
- session cookies
- SMTP passwords
- database URLs
- customer secrets

Use the hosting provider's runtime logs for application errors and correlate them with deployment IDs.

## Database

Monitor CPU, memory, storage growth, active connections, slow queries, lock contention, backup success and point-in-time recovery status.

## Incident response

1. Check /api/health.
2. Check application runtime logs.
3. Check PostgreSQL status and connection capacity.
4. Check the latest deployment.
5. Roll back the application if the failure is release-specific.
6. Restore database data only when required.
7. Record the incident and corrective action.

The repository currently provides health checks and operational documentation. A third-party error tracking service can be added later without coupling application code to one vendor.
