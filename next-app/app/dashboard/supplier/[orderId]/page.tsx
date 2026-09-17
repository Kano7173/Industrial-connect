import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireCurrentUser } from '@/lib/auth';
import { uploadProof } from '@/app/actions/upload-proof';

export default async function SupplierOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await requireCurrentUser();
  const { orderId } = await params;
  const order = await prisma.order.findFirst({ where: { id: orderId, supplierId: user.id }, include: { milestones: { orderBy: { createdAt: 'desc' } }, buyer: { select: { name: true } } } });
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-paper px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between rounded-3xl bg-ink px-5 py-4 text-white shadow-xl">
          <div><p className="text-xs uppercase tracking-[.2em] text-white/60">Supplier Order Room</p><h1 className="mt-1 text-xl font-black">{order.orderNumber}</h1></div>
          <span className="rounded-full bg-lime px-3 py-1 text-xs font-black text-ink">{order.status.replaceAll('_',' ')}</span>
        </header>

        <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime text-xl">🛡️</div>
            <div><h2 className="font-black">Funds Secured</h2><p className="mt-1 text-sm text-black/60">Payment is recorded by the marketplace before production evidence is requested. Release is controlled by the buyer inspection workflow.</p></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-paper p-3"><p className="text-black/50">Order value</p><strong>₹{order.amount.toNumber().toLocaleString('en-IN')}</strong></div>
            <div className="rounded-2xl bg-paper p-3"><p className="text-black/50">Buyer</p><strong>{order.buyer.name ?? 'Corporate buyer'}</strong></div>
            <div className="rounded-2xl bg-paper p-3"><p className="text-black/50">Status</p><strong>{order.status.replaceAll('_',' ')}</strong></div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/10">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-black/45">Upload proof</p>
          <h2 className="mt-1 text-2xl font-black">Keep the buyer in the loop.</h2>
          <form action={uploadProof} className="mt-5 space-y-4">
            <input type="hidden" name="orderId" value={order.id} />
            <label className="block text-sm font-bold">Proof type
              <select name="stepName" required className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-cobalt">
                <option value="RAW_MATERIAL_BILL">Raw Material Bill</option>
                <option value="FACTORY_VIDEO">Factory Video</option>
                <option value="LR_COPY">LR Copy</option>
              </select>
            </label>
            <label className="block text-sm font-bold">File URL
              <input name="fileUrl" type="url" required placeholder="https://storage.example.com/proof/..." className="mt-2 w-full rounded-2xl border border-black/15 px-4 py-3 outline-none focus:border-cobalt" />
            </label>
            <button className="w-full rounded-2xl bg-cobalt px-5 py-4 text-sm font-black text-white transition hover:translate-y-[-1px]">Submit proof →</button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[.18em] text-black/50">Evidence timeline</h2>
          {order.milestones.length === 0 ? <div className="rounded-3xl border border-dashed border-black/20 p-8 text-center text-sm text-black/50">No proofs uploaded yet.</div> : order.milestones.map((m) => (
            <article key={m.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10"><div className="flex items-center justify-between gap-3"><strong>{m.stepName.replaceAll('_',' ')}</strong><span className="text-xs text-black/45">{m.createdAt.toLocaleString('en-IN')}</span></div><a className="mt-2 block truncate text-sm text-cobalt underline" href={m.fileUrl} target="_blank" rel="noreferrer">{m.fileUrl}</a></article>
          ))}
        </section>
      </div>
    </main>
  );
}
