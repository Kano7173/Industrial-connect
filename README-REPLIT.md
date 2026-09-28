# RFQWorks — Replit deployment

## Run
1. Import this GitHub repository into Replit.
2. Use Node.js 22+.
3. Replit will install dependencies and run Prisma generation through postinstall.
4. Add production secrets in Replit Secrets. Use a PostgreSQL DATABASE_URL.
5. For a demo-only environment, DEMO_USER_ID may be used outside production.
6. Start with `npm run dev -- --hostname 0.0.0.0 --port 3000`.
7. For deployment, use `npm run start -- --hostname 0.0.0.0 --port 3000`.

## Production requirements
- Real authentication/session provider
- PostgreSQL DATABASE_URL
- Private object storage for supplier evidence
- Approved Razorpay marketplace/settlement configuration
- Verified webhook secret and HTTPS endpoint
- Production logging, monitoring, rate limits and backups

Do not put secrets in GitHub.
