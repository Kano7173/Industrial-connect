import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';
import { buyerAction } from '@/app/actions/buyer-action';
import { InspectionCountdown } from '@/components/inspection-countdown';

export default async function BuyerOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await requireCurrentUser();
  const { orderId } = await params;
  const order = await prisma.order.findFirst({ where: { id: orderId, buyerId: user.id }, include: { milestones: { orderBy: { createdAt: 'desc' } }, supplier: { select: { name: true } }, disputes: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!order) notFound();

  const decisionOpen = !!order.inspectionDeadlineAt && new Date() <= order.inspectionDeadlineAt && !['COMPLETED','DISPUTED','REFUNDED'].includes(order.status);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-[2rem] bg-ink p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Buyer Inspection Room</p><h1 className="mt-2 text-3xl font-black tracking-tight">{order.orderNumber}</h1><p className="mt-2 text-white/60">Supplier: {order.supplier.name ?? 'Manufacturing partner'}</p></div>
            <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xs text-white/50">Escrow status</p><strong>{order.status.replaceAll('_',' ')}</strong></div>
          </div>
        </header>

        <section className="rounded-3xl border border-orange/30 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange">48-hour inspection window</p><h2 className="mt-1 text-2xl font-black">Review evidence before release.</h2><p className="mt-1 text-sm text-black/55">Time remaining: <strong><InspectionCountdown deadline={order.inspectionDeadlineAt?.toISOString() ?? null} /></strong></p></div>
            <div className="rounded-2xl bg-paper px-5 py-4 text-right"><p className="text-xs text-black/50">Order value</p><strong className="text-xl">₹{order.amount.toNumber().toLocaleString('en-IN')}</strong></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {order.milestones.length === 0 ? <div className="rounded-3xl border border-dashed border-black/20 bg-white p-8 text-sm text-black/50 sm:col-span-2">No supplier evidence has been uploaded yet.</div> : order.milestones.map((m) => (
            <article key={m.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10">
              <div className="flex items-center justify-between p-4"><strong>{m.stepName.replaceAll('_',' ')}</strong><span className="text-xs text-black/45">{m.createdAt.toLocaleDateString('en-IN')}</span></div>
              {m.stepName === 'FACTORY_VIDEO' ? <video controls preload="metadata" className="aspect-video w-full bg-black" src={m.fileUrl} /> : <a href={m.fileUrl} target="_blank" rel="noreferrer" className="m-4 flex min-h-28 items-center justify-center rounded-2xl bg-paper p-5 text-center text-sm font-bold text-cobalt underline">Open evidence ↗</a>}
            </article>
          ))}
        </section>

        {decisionOpen && (
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/10">
            <h2 className="text-xl font-black">Quality decision</h2>
            <p className="mt-1 text-sm text-black/55">Approve only when the evidence and delivered goods meet the agreed specification. A dispute keeps the funds frozen for resolution.</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <form action={buyerAction} className="rounded-2xl bg-lime/40 p-4">
                <input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="APPROVE" />
                <button className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-black text-white">Approve Quality & Release Payout</button>
                <p className="mt-2 text-center text-xs text-black/55">Creates an eligible supplier payout. Actual transfer should be executed by the configured payout provider.</p>
              </form>
              <form action={buyerAction} className="rounded-2xl bg-orange/10 p-4">
                <input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="DISPUTE" />
                <label className="text-sm font-bold">Quality dispute reason<textarea name="reason" required rows={4} placeholder="Describe the defect, mismatch, damage or quantity issue..." className="mt-2 w-full rounded-2xl border border-black/15 bg-white p-3 outline-none focus:border-orange" /></label>
                <button className="mt-3 w-full rounded-2xl bg-orange px-5 py-4 text-sm font-black text-white">Raise Quality Dispute</button>
              </form>
            </div>
          </section>
        )}

        {order.status === 'DISPUTED' && <section className="rounded-3xl border border-orange/30 bg-orange/10 p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-orange">Funds frozen</p><h2 className="mt-1 text-xl font-black">Dispute is under review.</h2><p className="mt-2 text-sm text-black/60">No supplier release is created by the buyer dispute action. An authorized dispute-resolution workflow must decide refund or release.</p></section>}
      </div>
    </main>
  );
}
