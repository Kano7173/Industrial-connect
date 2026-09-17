# IndustrialConnect

IndustrialConnect is an India-focused B2B manufacturing marketplace and transaction workflow. This integration branch consolidates the new transaction layer into the same repository and canonical website instead of maintaining a separate public product.

## Implemented
- Premium mobile-first homepage with interactive 3D procurement-network hero.
- Buyer, supplier and admin order-room surfaces.
- Prisma order state machine: pending payment → protected payment → material evidence → production evidence → dispatch → 48-hour buyer inspection → completed/disputed/refunded.
- Supplier proof workflow for raw-material bills, factory video and LR/dispatch proof.
- Buyer release or quality-dispute workflow; dispute freezes settlement.
- Admin dispute resolution with provider refund/transfer adapters.
- Razorpay webhook HMAC verification, event-id idempotency and exact amount reconciliation.
- Protected payout settlement job.
- Order events and financial ledger records for auditability.

## Production configuration
Required server configuration includes `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CRON_SECRET`, and a real authentication/session provider. `DEMO_USER_ID` is development-only.

The payment model is intentionally described as protected marketplace payment rather than legal escrow. Live collection, split settlement, refunds, payouts and applicable Indian regulatory, tax and contractual requirements must use an approved payment-provider arrangement and production credentials.

## Run
`npm install && npx prisma generate && npx prisma migrate dev --name industrialconnect_core && npm run dev`

Legacy static files remain in the repository during deployment migration so the existing public deployment is not destroyed before the Next.js server deployment is configured.