import { prisma } from '@/lib/prisma';
import { buyerAction } from '@/app/actions/buyer-action';
import InspectionCountdown from '@/components/inspection-countdown';
import { requireCurrentUser } from '@/lib/auth';
import { getDemoOrder, isDemoOrder } from '@/lib/demo';

export const dynamic = 'force-dynamic';

export default async function BuyerOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireCurrentUser();

  // DEMO MODE: render without DB
  if (isDemoOrder(orderId)) {
    const order: any = getDemoOrder('buyer');
    const active = true;
    return (
      <main className="dashboard">
        <a href="/">← IndustrialConnect</a>
        <div className="demo-banner">DEMO — No database required. Connect <code>DATABASE_URL</code> for live transactions.</div>
        <div className="dash-head"><div><small>BUYER INSPECTION ROOM · DEMO</small><h1>{order.orderNumber}</h1></div><div className="secure">🛡️ Protected payment · DEMO</div></div>
        <div className="dash-card"><span>SUPPLIER</span><strong>{order.supplier.name}</strong><label>₹{order.amount.toNumber().toLocaleString('en-IN')} · {order.status} · {order.supplier.email}</label><small style={{display:'block',marginTop:8,color:'#8ea0b3'}}>Order ID: {order.id} · Buyer: {user.email}</small></div>
        <div className="inspection"><small>48-HOUR QUALITY INSPECTION — LIVE COUNTDOWN</small><InspectionCountdown deadline={order.inspectionDeadlineAt!.toISOString()} /><p style={{fontSize:12,color:'#8ea0b3',marginTop:8}}>Dispatched 6 hours ago — inspection window is active. Approve or dispute before it expires.</p></div>
        <section className="dash-card"><h2>Supplier evidence</h2>
          {order.milestones.map((m:any) => <div className="timeline" key={m.id}><b>{m.stepName.replaceAll('_',' ')}</b>{m.stepName === 'FACTORY_VIDEO' ? <video src={m.fileUrl} controls style={{width:'100%',borderRadius:12,marginTop:8}} /> : <a href={m.fileUrl} target="_blank" rel="noreferrer">Open evidence ↗</a>}<small style={{display:'block',color:'#7d8aa0',marginTop:4}}>{new Date(m.createdAt).toLocaleString('en-IN')}</small></div>)}
        </section>
        <section className="decision">
          <div className="notice-demo">Demo form — in production this triggers <code>buyerAction</code> with Prisma transaction (buyer release or dispute). Approve makes payout ELIGIBLE, dispute freezes funds.</div>
          <form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="APPROVE" /><button className="primary big" type="submit">Approve Quality & Release Payout (Demo)</button></form>
          <form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="DISPUTE" /><textarea name="reason" required placeholder="Describe the quality issue, quantity mismatch, material issue or damage..." /><button className="danger" type="submit">Raise Quality Dispute — Freeze Funds (Demo)</button></form>
        </section>
      </main>
    );
  }

  let order: any = null;
  try {
    order = await prisma.order.findUnique({ where: { id: orderId }, include: { supplier: true, milestones: true, disputes: true } });
  } catch {
    return <main className="dashboard"><h1>Database not configured</h1><p>Set <code>DATABASE_URL</code> in .env. Try <a href="/dashboard/buyer/demo">DEMO</a>.</p></main>;
  }
  if (!order || order.buyerId !== user.id) return <main className="dashboard"><h1>Order not found</h1><p>Try the <a href="/dashboard/buyer/demo">DEMO order room →</a></p></main>;
  const active = order.status === 'DISPATCHED' && order.inspectionDeadlineAt && new Date() < order.inspectionDeadlineAt;
  return <main className="dashboard"><a href="/">← IndustrialConnect</a><div className="dash-head"><div><small>BUYER INSPECTION ROOM</small><h1>{order.orderNumber}</h1></div><div className="secure">{order.status === 'DISPUTED' ? '⚠ Funds Frozen' : '🛡️ Protected payment'}</div></div><div className="dash-card"><span>SUPPLIER</span><strong>{order.supplier.name || order.supplier.email}</strong><label>₹{order.amount.toNumber().toLocaleString('en-IN')} · {order.status.replaceAll('_', ' ')}</label></div>{active && <div className="inspection"><small>48-HOUR QUALITY INSPECTION</small><InspectionCountdown deadline={order.inspectionDeadlineAt!.toISOString()} /></div>}<section className="dash-card"><h2>Supplier evidence</h2>{order.milestones.map((m:any) => <div className="timeline" key={m.id}><b>{m.stepName.replaceAll('_', ' ')}</b>{m.stepName === 'FACTORY_VIDEO' ? <video src={m.fileUrl} controls /> : <a href={m.fileUrl} target="_blank" rel="noreferrer">Open evidence ↗</a>}</div>)}</section>{active && <section className="decision"><form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="APPROVE" /><button className="primary big" type="submit">Approve Quality & Release Payout</button></form><form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="DISPUTE" /><textarea name="reason" required placeholder="Describe the quality issue, quantity mismatch, material issue or damage..." /><button className="danger" type="submit">Raise Quality Dispute — Freeze Funds</button></form></section>}</main>;
}
