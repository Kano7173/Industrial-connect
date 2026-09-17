'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';

const schema = z.object({ orderId: z.string().min(1), decision: z.enum(['APPROVE', 'DISPUTE']), reason: z.string().trim().max(4000).optional() });

export async function buyerAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  if (user.role !== 'BUYER') throw new Error('Only buyers can decide.');
  const input = schema.parse({ orderId: formData.get('orderId'), decision: formData.get('decision'), reason: formData.get('reason') || undefined });
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.buyerId !== user.id) throw new Error('Order not found or access denied.');
  if (order.status !== 'DISPATCHED' || !order.inspectionDeadlineAt) throw new Error('Inspection is available only after dispatch.');
  if (new Date() > order.inspectionDeadlineAt) throw new Error('The 48-hour inspection window has expired.');
  if (['COMPLETED', 'REFUNDED', 'DISPUTED'].includes(order.status)) throw new Error('Order already finalized.');
  if (input.decision === 'DISPUTE' && !input.reason) throw new Error('Provide a dispute reason.');
  await prisma.$transaction(async tx => {
    const now = new Date();
    if (input.decision === 'APPROVE') {
      await tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED', completedAt: now } });
      await tx.payout.upsert({ where: { orderId: order.id }, create: { orderId: order.id, supplierId: order.supplierId, amount: order.amount, status: 'ELIGIBLE', idempotencyKey: `payout-${order.id}` }, update: { status: 'ELIGIBLE' } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'BUYER_RELEASE_APPROVED', amount: order.amount, metadata: { buyerId: user.id } } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'BUYER_RELEASED', actorUserId: user.id } });
    } else {
      await tx.order.update({ where: { id: order.id }, data: { status: 'DISPUTED', disputedAt: now } });
      await tx.dispute.create({ data: { orderId: order.id, raisedById: user.id, reason: 'QUALITY', details: input.reason!, status: 'OPEN' } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'ESCROW_FROZEN_FOR_DISPUTE', amount: order.amount, metadata: { buyerId: user.id } } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'DISPUTE_OPENED', actorUserId: user.id } });
    }
  });
  revalidatePath(`/dashboard/buyer/${order.id}`);
  revalidatePath(`/dashboard/supplier/${order.id}`);
}
