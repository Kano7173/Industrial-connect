import { prisma } from '@/lib/prisma';
import { uploadProof } from '@/app/actions/upload-proof';
import { requireCurrentUserForRole } from '@/lib/auth';
import { getDemoOrder, isDemoOrder } from '@/lib/demo';

export const dynamic = 'force-dynamic';

export default async function SupplierOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  if (isDemoOrder(orderId)) {
    const user = await requireCurrentUserForRole('SUPPLIER');
    const order: any = getDemoOrder('supplier');
    return (
      <main className="dashboard">
        <a href="/">← IndustrialConnect</a>
        <div className="demo-banner">DEMO — Supplier view. Replace <code>DATABASE_URL</code> to go live.</div>
        <div className="dash-head"><div><small>SUPPLIER ORDER ROOM · DEMO</small><h1>{order.orderNumber}</h1></div><div className="secure">🛡️ Funds Secured · DEMO</div></div>
        <div className="dash-card"><span>ORDER VALUE</span><strong>₹{order.amount.toNumber().toLocaleString('en-IN')}</strong><label>{order.status} · Buyer: {order.buyer.name} ({order.buyer.email})</label><small style={{display:'block',marginTop:8,color:'#8ea0b3'}}>Supplier: {user.email} · Payout will be ELIGIBLE after buyer approval</small></div>
        <section className="dash-card"><h2>Production evidence — submit proof</h2><div className="notice-demo">Demo form — in production calls <code>uploadProof</code> (validates step, writes <code>OrderMilestone</code> + ledger).</div>
          <form action={uploadProof} className="proof-form"><input type="hidden" name="orderId" value={order.id} /><select name="stepName" defaultValue="RAW_MATERIAL_BILL"><option value="RAW_MATERIAL_BILL">Raw material bill</option><option value="FACTORY_VIDEO">10s factory video</option><option value="LR_COPY">LR / dispatch copy</option></select><input name="fileUrl" placeholder="Secure file URL (https://...)" type="url" required /><button className="primary" type="submit">Submit proof → (Demo)</button></form>
        </section>
        <section className="dash-card"><h2>Evidence timeline</h2>{order.milestones.map((m:any) => <div className="timeline" key={m.id}><b>{m.stepName.replaceAll('_', ' ')}</b><a href={m.fileUrl} target="_blank" rel="noreferrer">Open evidence ↗</a><small>{new Date(m.createdAt).toLocaleString('en-IN')}</small></div>)}</section>
      </main>
    );
  }

  const user = await requireCurrentUserForRole('SUPPLIER');
  let order: any = null;
  try {
    order = await prisma.order.findUnique({ where: { id: orderId }, include: { buyer: true, milestones: true, payout: true } });
  } catch {
    return <main className="dashboard"><h1>Database not configured</h1><p>Try <a href="/dashboard/supplier/demo">DEMO</a>.</p></main>;
  }
  if (!order || order.supplierId !== user.id) return <main className="dashboard"><h1>Order not found</h1><p>Try the <a href="/dashboard/supplier/demo">DEMO →</a></p></main>;
  return <main className="dashboard"><a href="/">← IndustrialConnect</a><div className="dash-head"><div><small>SUPPLIER ORDER ROOM</small><h1>{order.orderNumber}</h1></div><div className="secure">🛡️ Funds Secured</div></div><div className="dash-card"><span>ORDER VALUE</span><strong>₹{order.amount.toNumber().toLocaleString('en-IN')}</strong><label>{order.status.replaceAll('_', ' ')}</label></div><section className="dash-card"><h2>Production evidence</h2><form action={uploadProof} className="proof-form"><input type="hidden" name="orderId" value={order.id} /><select name="stepName" defaultValue="RAW_MATERIAL_BILL"><option value="RAW_MATERIAL_BILL">Raw material bill</option><option value="FACTORY_VIDEO">10s factory video</option><option value="LR_COPY">LR / dispatch copy</option></select><input name="fileUrl" placeholder="Secure file URL" type="url" required /><button className="primary" type="submit">Submit proof →</button></form></section><section className="dash-card"><h2>Evidence timeline</h2>{order.milestones.map((m:any) => <div className="timeline" key={m.id}><b>{m.stepName.replaceAll('_', ' ')}</b><a href={m.fileUrl} target="_blank" rel="noreferrer">Open evidence ↗</a><small>{m.createdAt.toLocaleString('en-IN')}</small></div>)}</section></main>;
}
