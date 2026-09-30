'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DemoOrder={status:string,proofs:string[],dispute?:string};
const initial:DemoOrder={status:'DISPATCHED',proofs:['Raw material bill verified','Factory production video received','LR / dispatch copy received']};

export default function AdminDemo(){
 const [order,setOrder]=useState<DemoOrder>(initial);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem('rfqworks_demo_order')||'null');if(x)setOrder(x)}catch{}},[]);
 const resolve=(status:string)=>{const next={...order,status};setOrder(next);try{localStorage.setItem('rfqworks_demo_order',JSON.stringify(next))}catch{}};
 return <main className="app-page"><div className="app-shell">
  <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><span className="app-kicker">ADMIN CONTROL TOWER</span></div>
  <nav className="demo-nav"><Link href="/dashboard/buyer/demo">Buyer</Link><Link href="/dashboard/supplier/demo">Supplier</Link><Link href="/dashboard/admin/disputes/demo">Admin</Link><Link href="/rfqs">RFQ board</Link></nav>
  <div className="demo-banner notice-demo">WORKING DEMO — this is the dispute-resolution view for the same browser-stored order.</div>
  <div className="demo-grid">
   <section className="app-card"><div className="app-kicker">ORDER / DISPUTE REVIEW</div><h1>RFQ-1048</h1><div className={order.status==='DISPUTED'?'status-banner warn':'status-banner'}>{order.status==='DISPUTED'?'⚠ Funds frozen — buyer dispute requires resolution.':order.status==='COMPLETED'?'✓ Buyer released supplier payout eligibility.':'No open dispute. Order status: '+order.status}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:20}}><div className="app-card" style={{padding:14,boxShadow:'none'}}><span className="app-kicker">BUYER</span><strong style={{display:'block',marginTop:6,fontSize:12}}>Industrial Buyer / Demo Co.</strong></div><div className="app-card" style={{padding:14,boxShadow:'none'}}><span className="app-kicker">SUPPLIER</span><strong style={{display:'block',marginTop:6,fontSize:12}}>Precision Motion Works</strong></div></div>
    <h2 style={{marginTop:30}}>Audit evidence</h2><div className="timeline-demo">{order.proofs.map((p,i)=><div className="timeline-item" key={p+i}><span className="timeline-dot done">✓</span><div><b>{p}</b><span>Order evidence / event</span></div><small>LOGGED</small></div>)}</div>
    {order.dispute&&<div className="status-banner warn" style={{marginTop:18}}><b>Buyer reason:</b> {order.dispute}</div>}
   </section>
   <aside className="app-card"><div className="app-kicker">RESOLUTION</div><h2>Control the funds</h2><p className="order-note">A production implementation would connect these decisions to the payment provider, create immutable audit events and notify both parties.</p>
    {order.status==='DISPUTED'?<div className="action-row" style={{marginTop:20}}><button className="button button-danger" onClick={()=>resolve('REFUNDED')}>Refund buyer →</button><button className="button button-accent" onClick={()=>resolve('COMPLETED')}>Release supplier →</button></div>:<div className="status-banner" style={{marginTop:20}}>No dispute is currently open.</div>}
    {order.status==='REFUNDED'&&<div className="status-banner warn" style={{marginTop:18}}>Refund recorded. Order closed.</div>}
    {order.status==='COMPLETED'&&<div className="status-banner" style={{marginTop:18}}>Release recorded. Supplier payout is eligible.</div>}
    <div className="form-actions"><Link href="/dashboard/buyer/demo" className="button button-outline">Buyer room</Link><Link href="/dashboard/supplier/demo" className="button button-outline">Supplier room</Link></div>
   </aside>
  </div>
 </div></main>;
}
