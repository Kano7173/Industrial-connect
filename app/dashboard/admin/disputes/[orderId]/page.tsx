import { prisma } from '@/lib/prisma';
import { resolveDispute } from '@/app/actions/resolve-dispute';
import { requireCurrentUserForRole } from '@/lib/auth';
import { getDemoOrder, isDemoOrder } from '@/lib/demo';

export const dynamic = 'force-dynamic';

export default async function AdminDispute({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  if (isDemoOrder(orderId)) {
    const user = await requireCurrentUserForRole('ADMIN');
    const order: any = getDemoOrder('admin');
    const demoDispute = { id: 'dis-demo-1', reason: 'QUALITY', details: 'Surface finish on batch IC-2026-DEMO-4871 does not match approved sample — Ra value 3.2 vs required 1.6. Buyer requests rework or partial refund.', status: 'OPEN' };
    return (
      <main className="dashboard">
        <a href="/">← IndustrialConnect</a>
        <div className="demo-banner">DEMO — Admin control tower. In production this uses Razorpay refund/transfer adapters.</div>
        <div className="dash-head"><div><small>ADMIN CONTROL TOWER / DISPUTE · DEMO</small><h1>{order.orderNumber}</h1></div><div className="secure">Funds frozen · DEMO</div></div>
        <section className="dash-card"><p><b>Buyer:</b> {order.buyer.name} — {order.buyer.email}</p><p><b>Supplier:</b> {order.supplier.name} — {order.supplier.email}</p><p><b>Value:</b> ₹{order.amount.toNumber().toLocaleString('en-IN')} · <b>Status:</b> DISPUTED</p><p style={{color:'#8ea0b3',fontSize:12}}>Admin: {user.email} ({user.role})</p>
          <div className="dispute" style={{marginTop:14,border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:14}}><b>{demoDispute.reason}</b><p>{demoDispute.details}</p><small>{demoDispute.status} · Disputed 2h ago</small></div>
        </section>
        <section className="dash-card"><h2>Milestones & payments</h2>{order.milestones.map((m:any)=><div key={m.id} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.06)'}}><b>{m.stepName.replaceAll('_',' ')}</b> — <a href={m.fileUrl} target="_blank" rel="noreferrer">Open ↗</a></div>)}<p style={{marginTop:12}}><b>Payment:</b> Razorpay {order.payments[0].providerPaymentId} — ₹{order.payments[0].amount.toNumber().toLocaleString('en-IN')} — {order.payments[0].status}</p></section>
        <section className="decision"><div className="notice-demo">Demo controls — in production <code>resolveDispute</code> calls refund/transfer adapters and writes <code>EscrowLedgerEntry</code> + <code>OrderEvent</code>.</div>
          <form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="REFUND" /><button className="danger big" type="submit">Resolve → Refund Buyer (Demo)</button></form>
          <form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="RELEASE" /><button className="primary big" type="submit">Resolve → Release Supplier (Demo)</button></form>
        </section>
      </main>
    );
  }

  const user = await requireCurrentUserForRole('ADMIN');
  if (user.role !== 'ADMIN') return <main className="dashboard"><h1>Access denied</h1><p>Admin only. Try <a href="/dashboard/admin/disputes/demo">DEMO →</a></p></main>;
  let order: any = null;
  try {
    order = await prisma.order.findUnique({ where: { id: orderId }, include: { buyer: true, supplier: true, disputes: true, milestones: true, payments: true } });
  } catch {
    return <main className="dashboard"><h1>Database not configured</h1><p>Try <a href="/dashboard/admin/disputes/demo">DEMO</a>.</p></main>;
  }
  if (!order) return <main className="dashboard"><h1>Order not found</h1><p>Try <a href="/dashboard/admin/disputes/demo">DEMO →</a></p></main>;
  return <main className="dashboard"><a href="/">← IndustrialConnect</a><div className="dash-head"><div><small>ADMIN CONTROL TOWER / DISPUTE</small><h1>{order.orderNumber}</h1></div><div className="secure">Funds frozen</div></div><section className="dash-card"><p>Buyer: {order.buyer.name || order.buyer.email}</p><p>Supplier: {order.supplier.name || order.supplier.email}</p><p>Value: ₹{order.amount.toNumber().toLocaleString('en-IN')}</p>{order.disputes.map((d:any) => <div className="dispute" key={d.id}><b>{d.reason}</b><p>{d.details}</p><small>{d.status}</small></div>)}</section><section className="decision"><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="REFUND" /><button className="danger big" type="submit">Resolve → Refund Buyer</button></form><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="RELEASE" /><button className="primary big" type="submit">Resolve → Release Supplier</button></form></section></main>;
}
