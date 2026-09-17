import { prisma } from '@/lib/prisma';
import { buyerAction } from '@/app/actions/buyer-action';
import InspectionCountdown from '@/components/inspection-countdown';
import { requireCurrentUser } from '@/lib/auth';

export default async function BuyerOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireCurrentUser();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { supplier: true, milestones: true, disputes: true } });
  if (!order || order.buyerId !== user.id) return <main className="dashboard"><h1>Order not found</h1></main>;
  const active = order.status === 'DISPATCHED' && order.inspectionDeadlineAt && new Date() < order.inspectionDeadlineAt;
  return <main className="dashboard"><a href="/">← IndustrialConnect</a><div className="dash-head"><div><small>BUYER INSPECTION ROOM</small><h1>{order.orderNumber}</h1></div><div className="secure">{order.status === 'DISPUTED' ? '⚠ Funds Frozen' : '🛡️ Protected payment'}</div></div><div className="dash-card"><span>SUPPLIER</span><strong>{order.supplier.name || order.supplier.email}</strong><label>₹{order.amount.toNumber().toLocaleString('en-IN')} · {order.status.replaceAll('_', ' ')}</label></div>{active && <div className="inspection"><small>48-HOUR QUALITY INSPECTION</small><InspectionCountdown deadline={order.inspectionDeadlineAt!.toISOString()} /></div>}<section className="dash-card"><h2>Supplier evidence</h2>{order.milestones.map(m => <div className="timeline" key={m.id}><b>{m.stepName.replaceAll('_', ' ')}</b>{m.stepName === 'FACTORY_VIDEO' ? <video src={m.fileUrl} controls /> : <a href={m.fileUrl} target="_blank" rel="noreferrer">Open evidence ↗</a>}</div>)}</section>{active && <section className="decision"><form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="APPROVE" /><button className="primary big" type="submit">Approve Quality & Release Payout</button></form><form action={buyerAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="decision" value="DISPUTE" /><textarea name="reason" required placeholder="Describe the quality issue, quantity mismatch, material issue or damage..." /><button className="danger" type="submit">Raise Quality Dispute — Freeze Funds</button></form></section>}</main>;
}
