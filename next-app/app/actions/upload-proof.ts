'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';

const schema = z.object({
  orderId: z.string().min(1),
  stepName: z.enum(['RAW_MATERIAL_BILL', 'FACTORY_VIDEO', 'LR_COPY']),
  fileUrl: z.string().url().max(2048),
});

const nextStatus = {
  RAW_MATERIAL_BILL: 'MATERIAL_UPLOADED',
  FACTORY_VIDEO: 'PRODUCTION_VIDEO_ADDED',
  LR_COPY: 'DISPATCHED',
} as const;

export async function uploadProof(formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== 'SUPPLIER') throw new Error('Only suppliers can upload production proofs.');

  const input = schema.parse({
    orderId: formData.get('orderId'),
    stepName: formData.get('stepName'),
    fileUrl: formData.get('fileUrl'),
  });

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.supplierId !== user.id) throw new Error('Order not found or access denied.');
  if (['COMPLETED', 'DISPUTED', 'REFUNDED'].includes(order.status)) throw new Error('This order is locked for further supplier updates.');
  if (order.status === 'PENDING_ESCROW') throw new Error('Escrow is not locked yet.');

  await prisma.$transaction(async (tx) => {
    await tx.orderMilestone.create({
      data: { orderId: order.id, stepName: input.stepName, fileUrl: input.fileUrl, uploadedBy: 'SUPPLIER', uploadedByUserId: user.id },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: nextStatus[input.stepName] },
    });

    await tx.escrowLedgerEntry.create({
      data: { orderId: order.id, type: 'PROOF_UPLOADED', amount: 0, referenceId: input.stepName, metadata: { fileUrl: input.fileUrl } },
    });
  });

  revalidatePath(`/dashboard/supplier/${order.id}`);
  revalidatePath(`/dashboard/buyer/${order.id}`);
  return { ok: true };
}
