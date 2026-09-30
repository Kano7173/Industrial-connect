-- RFQWorks PostgreSQL baseline migration
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_ESCROW','ESCROW_LOCKED','MATERIAL_UPLOADED','PRODUCTION_VIDEO_ADDED','DISPATCHED','COMPLETED','DISPUTED','REFUNDED');
CREATE TYPE "ProofUploader" AS ENUM ('SUPPLIER','BUYER');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN','RESOLVED_REFUND','RESOLVED_RELEASE');
CREATE TYPE "DisputeReason" AS ENUM ('QUALITY','DEFECT','WRONG_QUANTITY','WRONG_MATERIAL','LATE_DELIVERY','DAMAGE','OTHER');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','CAPTURED','FAILED','REFUNDED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING','ELIGIBLE','PROCESSING','PAID','ON_HOLD');
CREATE TYPE "UserRole" AS ENUM ('BUYER','SUPPLIER','ADMIN');
CREATE TYPE "OrderEventType" AS ENUM ('ORDER_CREATED','PAYMENT_LOCKED','PROOF_UPLOADED','DISPATCHED','INSPECTION_STARTED','BUYER_RELEASED','DISPUTE_OPENED','REFUND_REQUESTED','REFUND_COMPLETED','PAYOUT_REQUESTED','PAYOUT_COMPLETED','ADMIN_RESOLUTION');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "razorpayLinkedAccountId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_ESCROW',
  "buyerId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "inspectionDeadlineAt" TIMESTAMP(3),
  "escrowLockedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "disputedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "bankReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE INDEX "Order_buyerId_status_idx" ON "Order"("buyerId","status");
CREATE INDEX "Order_supplierId_status_idx" ON "Order"("supplierId","status");
CREATE INDEX "Order_status_inspectionDeadlineAt_idx" ON "Order"("status","inspectionDeadlineAt");

CREATE TABLE "OrderMilestone" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "stepName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "uploadedBy" "ProofUploader" NOT NULL,
  "uploadedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderMilestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderMilestone_orderId_stepName_idx" ON "OrderMilestone"("orderId","stepName");

CREATE TABLE "Dispute" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "raisedById" TEXT NOT NULL,
  "reason" "DisputeReason" NOT NULL,
  "details" TEXT NOT NULL,
  "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Dispute_orderId_status_idx" ON "Dispute"("orderId","status");

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
  "providerEventId" TEXT,
  "providerPaymentId" TEXT,
  "amount" DECIMAL(15,2) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "method" TEXT,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_providerEventId_key" ON "Payment"("providerEventId");
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId","status");

CREATE TABLE "EscrowLedgerEntry" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "referenceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscrowLedgerEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EscrowLedgerEntry_orderId_createdAt_idx" ON "EscrowLedgerEntry"("orderId","createdAt");

CREATE TABLE "OrderEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" "OrderEventType" NOT NULL,
  "actorUserId" TEXT,
  "referenceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId","createdAt");

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "payload" JSONB NOT NULL,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");
CREATE INDEX "WebhookEvent_eventType_receivedAt_idx" ON "WebhookEvent"("eventType","receivedAt");

CREATE TABLE "Payout" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "providerRef" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payout_orderId_key" ON "Payout"("orderId");
CREATE UNIQUE INDEX "Payout_idempotencyKey_key" ON "Payout"("idempotencyKey");

ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderMilestone" ADD CONSTRAINT "OrderMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderMilestone" ADD CONSTRAINT "OrderMilestone_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EscrowLedgerEntry" ADD CONSTRAINT "EscrowLedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
