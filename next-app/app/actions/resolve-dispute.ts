'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';

const schema = z.object({ orderId: z.string().min(1), decision: z.enum(['REFUND', 'RELEASE']) });

export async function resolveDispute(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== 'ADMIN') throw new Error('Only authorized administrators can resolve disputes.');
  const input = schema.parse({ orderId: formData.get('orderId'), decision: formData.get('decision') });
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.status !== 'DISPUTED') throw new Error('Open disputed order not found.');

  await prisma.$transaction(async (tx) => {
    const now = new Date();
    if (input.decision === 'REFUND') {
      await tx.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', refundedAt: now } });
      await tx.dispute.updateMany({ where: { orderId: order.id, status: 'OPEN' }, data: { status: 'RESOLVED_REFUND', resolvedAt: now } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'REFUND_REQUESTED', amount: order.amount, metadata: { adminId: user.id } } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'REFUND_REQUESTED', actorUserId: user.id } });
    } else {
      await tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED', completedAt: now } });
      await tx.payout.upsert({ where: { orderId: order.id }, create: { orderId: order.id, supplierId: order.supplierId, amount: order.amount, status: 'ELIGIBLE', idempotencyKey: `payout-${order.id}` }, update: { status: 'ELIGIBLE' } });
      await tx.dispute.updateMany({ where: { orderId: order.id, status: 'OPEN' }, data: { status: 'RESOLVED_RELEASE', resolvedAt: now } });
      await tx.escrowLedgerEntry.create({ data: { orderId: order.id, type: 'DISPUTE_RESOLVED_RELEASE', amount: order.amount, metadata: { adminId: user.id } } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'ADMIN_RESOLUTION', actorUserId: user.id, metadata: { decision: 'RELEASE' } } });
    }
  });
  revalidatePath(`/dashboard/buyer/${order.id}`);
  revalidatePath(`/dashboard/supplier/${order.id}`);
  revalidatePath(`/dashboard/admin/disputes/${order.id}`);
  return { ok: true };
}
