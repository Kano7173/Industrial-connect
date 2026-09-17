# IndustrialConnect Next.js transaction core

This directory adds a production-oriented Next.js App Router implementation for protected industrial order workflows without replacing the existing static IndustrialConnect site.

## Implemented

- Prisma Order state machine: escrow → evidence → dispatch → completion/dispute/refund.
- OrderMilestone media proof records.
- Supplier-only proof server action with state-transition protection.
- Buyer-only 48-hour release/dispute server action.
- Dispute creation freezes the order; no payout is created by a dispute.
- Razorpay webhook verification using the raw request body, HMAC SHA-256 and `x-razorpay-event-id` idempotency.
- `payment.captured`, `order.paid` and Smart Collect `virtual_account.credited` handling.
- Exact amount reconciliation before escrow is locked.
- Financial/escrow audit ledger.
- Mobile supplier dashboard and buyer inspection dashboard.

## Setup

```bash
cd next-app
npm install
npx prisma generate
npx prisma migrate dev --name industrial_escrow
npm run dev
```

Required environment variables:

```env
DATABASE_URL="postgresql://..."
RAZORPAY_WEBHOOK_SECRET="..."
DEMO_USER_ID="..." # development only
```

### Authentication

`lib/auth.ts` is deliberately a hard production boundary. It refuses the development `DEMO_USER_ID` fallback in production. Connect it to the project's real Auth.js/Clerk/session provider before exposing the routes.

### Razorpay

Configure the webhook endpoint as:

`/api/webhook/razorpay`

Subscribe to the events used by the transaction flow, including `payment.captured` and Smart Collect `virtual_account.credited`. Razorpay requires signature verification against the raw webhook body and documents `x-razorpay-event-id` for duplicate-event handling.

Do not put Razorpay API secrets in GitHub. Use deployment environment secrets.

### Important escrow/legal boundary

The code models a protected marketplace payment state and payout eligibility. It does not claim that IndustrialConnect is legally operating an escrow service, nor does it move supplier funds by itself. The actual collection, split/settlement, refund and payout mechanism must be implemented with a payment provider arrangement and reviewed for the applicable Indian payments, marketplace, GST and contractual requirements.

## Routes

- `/dashboard/supplier/[orderId]`
- `/dashboard/buyer/[orderId]`
- `/api/webhook/razorpay`

The parent repository's existing website remains untouched by this branch.
