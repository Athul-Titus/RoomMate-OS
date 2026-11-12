# Infra — ROOMMATE OS

## Local development

See `docker-compose.yml` in the repository root.

```bash
# Start all services
docker compose up --build

# Start only infrastructure (postgres, redis, minio)
docker compose up postgres redis minio -d

# Run migrations
docker compose exec backend alembic upgrade head

# Seed demo data
docker compose exec backend python scripts/seed_dev.py

# View logs
docker compose logs -f backend
```

## Production deployment (AWS)

Recommended architecture for MVP:

| Component | AWS Service |
|---|---|
| Container runtime | ECS Fargate |
| Container registry | ECR |
| Database | RDS for PostgreSQL 16 with PostGIS |
| Cache | ElastiCache for Redis |
| Object storage | S3 |
| CDN (public assets) | CloudFront |
| Secrets | Secrets Manager |
| Load balancer | ALB |
| DNS | Route 53 |
| TLS | ACM |
| Logs | CloudWatch Logs |
| Errors | Sentry (or CloudWatch Alarms) |

## Environment separation

Maintain separate resources for:
- `local` — Docker Compose, `.env` file
- `staging` — same infrastructure as prod, separate databases and buckets
- `production` — production databases, secrets, monitoring

**Never share databases or S3 buckets between environments.**
**Never use production secrets in local or staging.**

## Deployment checklist (before first production deploy)

- [ ] RDS instance created with PostGIS extension enabled
- [ ] S3 buckets created (private + public) with appropriate policies
- [ ] ECR repository created
- [ ] ECS cluster, task definition, and service configured
- [ ] ALB configured with HTTPS listener and ACM certificate
- [ ] Custom domain connected to ALB via Route 53
- [ ] All secrets in Secrets Manager, referenced by task definition
- [ ] CloudWatch log groups created
- [ ] Sentry DSN configured
- [ ] `alembic upgrade head` run on production database before service start
- [ ] Health check endpoint verified (`GET /health`)
- [ ] Privacy Policy and Terms pages live
- [ ] Favicon set
- [ ] "Made with AI" tag absent

## Database backups

- RDS automated backups: enabled, 7-day retention
- Manual snapshot before each major migration
- Restore test: monthly

## Migration runbook

```bash
# 1. Take a manual RDS snapshot
# 2. Deploy the new backend image (do not start traffic yet)
# 3. Run migrations in the ECS exec console:
#    aws ecs execute-command ... -- alembic upgrade head
# 4. Verify migration output
# 5. Enable traffic on ALB
# 6. Monitor error rates for 10 minutes
# 7. If errors spike: redirect ALB to previous task definition and rollback migration
```
