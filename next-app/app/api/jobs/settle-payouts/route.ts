import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transferToLinkedAccount } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payouts = await prisma.payout.findMany({ where: { status: 'ELIGIBLE' }, include: { supplier: true, order: true }, take: 20, orderBy: { createdAt: 'asc' } });
  const results: Array<{ orderId: string; status: string; providerRef?: string }> = [];
  for (const payout of payouts) {
    if (!payout.supplier.razorpayLinkedAccountId) { results.push({ orderId: payout.orderId, status: 'ON_HOLD' }); await prisma.payout.update({ where: { id: payout.id }, data: { status: 'ON_HOLD' } }); continue; }
    await prisma.payout.update({ where: { id: payout.id }, data: { status: 'PROCESSING' } });
    try {
      const transfer = await transferToLinkedAccount({ linkedAccountId: payout.supplier.razorpayLinkedAccountId, amountRupees: payout.amount.toNumber(), referenceId: payout.idempotencyKey });
      await prisma.$transaction(async tx => {
        await tx.payout.update({ where: { id: payout.id }, data: { status: 'PAID', providerRef: transfer.id } });
        await tx.escrowLedgerEntry.create({ data: { orderId: payout.orderId, type: 'PAYOUT_COMPLETED', amount: payout.amount, referenceId: transfer.id, metadata: { payoutId: payout.id } } });
        await tx.orderEvent.create({ data: { orderId: payout.orderId, type: 'PAYOUT_COMPLETED', referenceId: transfer.id } });
      });
      results.push({ orderId: payout.orderId, status: 'PAID', providerRef: transfer.id });
    } catch (error) {
      await prisma.payout.update({ where: { id: payout.id }, data: { status: 'ELIGIBLE' } });
      results.push({ orderId: payout.orderId, status: 'RETRY', providerRef: error instanceof Error ? error.message : 'provider error' });
    }
  }
  return NextResponse.json({ processed: results.length, results });
}
