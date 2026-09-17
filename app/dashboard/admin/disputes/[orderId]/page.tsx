import { prisma } from '@/lib/prisma';
import { resolveDispute } from '@/app/actions/resolve-dispute';
import { requireCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminDispute({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireCurrentUser();
  if (user.role !== 'ADMIN') return <main className="dashboard"><h1>Access denied</h1></main>;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { buyer: true, supplier: true, disputes: true, milestones: true, payments: true } });
  if (!order) return <main className="dashboard"><h1>Order not found</h1></main>;
  return <main className="dashboard"><a href="/">← IndustrialConnect</a><div className="dash-head"><div><small>ADMIN CONTROL TOWER / DISPUTE</small><h1>{order.orderNumber}</h1></div><div className="secure">Funds frozen</div></div><section className="dash-card"><p>Buyer: {order.buyer.name || order.buyer.email}</p><p>Supplier: {order.supplier.name || order.supplier.email}</p><p>Value: ₹{order.amount.toNumber().toLocaleString('en-IN')}</p>{order.disputes.map(d => <div className="dispute" key={d.id}><b>{d.reason}</b><p>{d.details}</p><small>{d.status}</small></div>)}</section><section className="decision"><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="REFUND" /><button className="danger big" type="submit">Resolve → Refund Buyer</button></form><form action={resolveDispute}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="RELEASE" /><button className="primary big" type="submit">Resolve → Release Supplier</button></form></section></main>;
}
