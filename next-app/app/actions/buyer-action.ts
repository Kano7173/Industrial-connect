'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';

const schema = z.object({
  orderId: z.string().min(1),
  decision: z.enum(['APPROVE', 'DISPUTE']),
  reason: z.string().trim().max(4000).optional(),
});

export async function buyerAction(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== 'BUYER') throw new Error('Only buyers can make an inspection decision.');

  const input = schema.parse({
    orderId: formData.get('orderId'),
    decision: formData.get('decision'),
    reason: formData.get('reason') || undefined,
  });

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.buyerId !== user.id) throw new Error('Order not found or access denied.');
  if (!order.escrowLockedAt) throw new Error('Escrow is not locked.');
  if (order.status === 'COMPLETED' || order.status === 'REFUNDED') throw new Error('This order is already finalized.');
  if (order.status === 'DISPUTED') throw new Error('This order is already under dispute.');

  const deadline = order.inspectionDeadlineAt;
  if (deadline && new Date() > deadline) throw new Error('The 48-hour inspection window has expired.');

  if (input.decision === 'DISPUTE' && !input.reason) throw new Error('Provide a quality dispute reason.');

  await prisma.$transaction(async (tx) => {
    if (input.decision === 'APPROVE') {
      await tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
      await tx.payout.upsert({ where: { orderId: order.id }, create: { orderId: order.id, supplierId: order.supplierId, amount: order.amount, status: 'ELIGIBLE' }, update: { status: 'ELIGIBLE' } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'BUYER_RELEASE_APPROVED', amount: order.amount, metadata: { buyerId: user.id } } });
    } else {
      await tx.order.update({ where: { id: order.id }, data: { status: 'DISPUTED', disputedAt: new Date() } });
      await tx.dispute.create({ data: { orderId: order.id, raisedById: user.id, reason: 'QUALITY', details: input.reason!, status: 'OPEN' } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'ESCROW_FROZEN_FOR_DISPUTE', amount: order.amount, metadata: { buyerId: user.id } } });
    }
  });

  revalidatePath(`/dashboard/buyer/${order.id}`);
  revalidatePath(`/dashboard/supplier/${order.id}`);
  return { ok: true };
}
