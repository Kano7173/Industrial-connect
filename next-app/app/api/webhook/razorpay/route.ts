import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function validSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const eventId = request.headers.get('x-razorpay-event-id');
  if (!signature || !eventId) return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  if (!validSignature(rawBody, signature, secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  let payload: any;
  try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const eventType = String(payload?.event ?? '');
  const supported = new Set(['payment.captured', 'order.paid', 'virtual_account.credited']);
  if (!supported.has(eventType)) return NextResponse.json({ received: true, ignored: true });

  try {
    await prisma.webhookEvent.create({ data: { eventId, eventType, payload } });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ received: true, duplicate: true });
    throw error;
  }

  const payment = payload?.payload?.payment?.entity;
  const virtualAccount = payload?.payload?.virtual_account?.entity;
  const bankTransfer = payload?.payload?.bank_transfer?.entity;
  const notes = payment?.notes ?? virtualAccount?.notes ?? {};
  const orderId = notes?.order_id ?? notes?.orderId;
  const orderNumber = notes?.order_number ?? notes?.orderNumber;
  const razorpayOrderId = payment?.order_id;
  const providerPaymentId = payment?.id;
  const amountPaise = Number(payment?.amount ?? bankTransfer?.amount ?? 0);

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: String(orderId) } })
    : orderNumber
      ? await prisma.order.findUnique({ where: { orderNumber: String(orderNumber) } })
      : razorpayOrderId
        ? await prisma.order.findUnique({ where: { razorpayOrderId: String(razorpayOrderId) } })
        : null;

  if (!order) return NextResponse.json({ received: true, reconciled: false });

  const expectedPaise = Math.round(order.amount.toNumber() * 100);
  if (amountPaise !== expectedPaise) {
    await prisma.payment.create({ data: { orderId: order.id, providerEventId: eventId, providerPaymentId, amount: amountPaise / 100, status: 'FAILED', method: payment?.method ?? 'bank_transfer', rawPayload: payload } });
    return NextResponse.json({ received: true, reconciled: false, reason: 'Amount mismatch' }, { status: 422 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.upsert({
      where: { providerEventId: eventId },
      create: { orderId: order.id, providerEventId: eventId, providerPaymentId, amount: amountPaise / 100, status: 'CAPTURED', method: payment?.method ?? 'bank_transfer', rawPayload: payload },
      update: { status: 'CAPTURED', providerPaymentId, rawPayload: payload },
    });

    const shouldLock = order.status === 'PENDING_ESCROW';
    await tx.order.update({
      where: { id: order.id },
      data: shouldLock
        ? { status: 'ESCROW_LOCKED', escrowLockedAt: new Date(), inspectionDeadlineAt: new Date(Date.now() + 48 * 60 * 60 * 1000), razorpayPaymentId: providerPaymentId, bankReference: bankTransfer?.bank_reference }
        : { razorpayPaymentId: providerPaymentId, bankReference: bankTransfer?.bank_reference },
    });

    if (shouldLock) {
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'ESCROW_LOCKED', amount: order.amount, referenceId: providerPaymentId, metadata: { eventId, eventType } } });
    }
  });

  return NextResponse.json({ received: true, reconciled: true });
}
