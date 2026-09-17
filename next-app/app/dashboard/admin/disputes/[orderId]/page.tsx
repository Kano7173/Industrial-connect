import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';
import { resolveDispute } from '@/app/actions/resolve-dispute';

export default async function AdminDisputePage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await requireCurrentUser();
  if (user.role !== 'ADMIN') notFound();
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { buyer: true, supplier: true, disputes: { orderBy: { createdAt: 'desc' } }, milestones: { orderBy: { createdAt: 'desc' } } } });
  if (!order) notFound();

  return <main className="min-h-screen bg-paper p-5 sm:p-8"><div className="mx-auto max-w-4xl space-y-5"><header className="rounded-3xl bg-ink p-6 text-white"><p className="text-xs uppercase tracking-[.2em] text-white/50">Admin dispute control</p><h1 className="mt-2 text-3xl font-black">{order.orderNumber}</h1><p className="mt-2 text-white/60">₹{order.amount.toNumber().toLocaleString('en-IN')} · {order.status}</p></header><section className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Dispute evidence</h2>{order.disputes.map(d => <article key={d.id} className="mt-4 rounded-2xl bg-orange/10 p-4"><strong>{d.reason}</strong><p className="mt-2 text-sm">{d.details}</p><p className="mt-2 text-xs text-black/45">Raised {d.createdAt.toLocaleString('en-IN')} · {d.status}</p></article>)}{order.status === 'DISPUTED' && <div className="mt-6 grid gap-3 sm:grid-cols-2"><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="decision" value="REFUND"/><button className="w-full rounded-2xl bg-orange px-5 py-4 font-black text-white">Resolve → Refund Buyer</button></form><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id}/><input type="hidden" name="decision" value="RELEASE"/><button className="w-full rounded-2xl bg-ink px-5 py-4 font-black text-white">Resolve → Release Supplier</button></form></div>}</section></div></main>;
}
