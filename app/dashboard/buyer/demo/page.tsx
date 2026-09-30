'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DemoOrder={status:string,proofs:string[],dispute?:string};
const initial:DemoOrder={status:'DISPATCHED',proofs:['Raw material bill verified','Factory production video received','LR / dispatch copy received']};

export default function BuyerDemo(){
 const [order,setOrder]=useState<DemoOrder>(initial);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem('rfqworks_demo_order')||'null');if(x)setOrder(x)}catch{}},[]);
 const save=(next:DemoOrder)=>{setOrder(next);try{localStorage.setItem('rfqworks_demo_order',JSON.stringify(next))}catch{}};
 const approve=()=>save({...order,status:'COMPLETED'});
 const dispute=()=>{const reason=window.prompt('Describe the issue');if(reason?.trim())save({...order,status:'DISPUTED',dispute:reason.trim()})};
 const active=order.status==='DISPATCHED';
 return <main className="app-page"><div className="app-shell">
  <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><span className="app-kicker">BUYER DEMO</span></div>
  <nav className="demo-nav"><Link href="/dashboard/buyer/demo">Buyer</Link><Link href="/dashboard/supplier/demo">Supplier</Link><Link href="/dashboard/admin/disputes/demo">Admin</Link><Link href="/post-requirement">New RFQ</Link></nav>
  <div className="demo-banner notice-demo">WORKING DEMO — actions are stored in this browser so you can test the transaction flow without connecting a payment gateway or database.</div>
  <div className="demo-grid">
   <section className="app-card"><div className="app-kicker">BUYER INSPECTION ROOM</div><h1>RFQ-1048</h1><div className={order.status==='DISPUTED'?'status-banner warn':'status-banner'}>{order.status==='DISPATCHED'?'48-hour inspection window is active. Funds remain protected.':order.status==='COMPLETED'?'Buyer accepted quality. Supplier payout is now eligible.':order.status==='DISPUTED'?'Dispute opened. Funds are frozen pending admin resolution.':'Order state: '+order.status}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:20}}><div className="app-card" style={{padding:13,boxShadow:'none'}}><span className="app-kicker">SUPPLIER</span><strong style={{display:'block',marginTop:6,fontSize:12}}>Precision Motion Works</strong></div><div className="app-card" style={{padding:13,boxShadow:'none'}}><span className="app-kicker">VALUE</span><strong style={{display:'block',marginTop:6,fontSize:12}}>₹8.42L</strong></div><div className="app-card" style={{padding:13,boxShadow:'none'}}><span className="app-kicker">PAYMENT</span><strong style={{display:'block',marginTop:6,fontSize:12}}>PROTECTED</strong></div></div>
    <h2 style={{marginTop:30}}>Production evidence</h2><div className="timeline-demo">{order.proofs.map((p,i)=><div className="timeline-item" key={p}><span className="timeline-dot done">✓</span><div><b>{p}</b><span>Received and attached to RFQ-1048</span></div><small>VERIFIED</small></div>)}</div>
   </section>
   <aside className="app-card"><div className="app-kicker">BUYER DECISION</div><h2>Inspect the batch</h2><p className="order-note">In a real order room, buyer acceptance releases the supplier payout eligibility. A quality dispute freezes the funds for admin review.</p>
    {active&&<div className="action-row" style={{marginTop:20}}><button className="button button-accent" onClick={approve}>Approve quality & release →</button><button className="button button-danger" onClick={dispute}>Raise dispute</button></div>}
    {order.status==='COMPLETED'&&<div className="status-banner" style={{marginTop:20}}>✓ Completed — payout eligible</div>}
    {order.status==='DISPUTED'&&<div className="status-banner warn" style={{marginTop:20}}><b>Dispute:</b> {order.dispute}</div>}
    <div style={{marginTop:30}}><span className="app-kicker">QUICK LINKS</span><div className="form-actions"><Link href="/dashboard/supplier/demo" className="button button-outline">Open supplier room</Link><Link href="/dashboard/admin/disputes/demo" className="button button-outline">Open admin room</Link></div></div>
   </aside>
  </div>
 </div></main>;
}
