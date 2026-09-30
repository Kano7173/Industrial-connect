'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DemoOrder={status:string,proofs:string[],dispute?:string};
const initial:DemoOrder={status:'DISPATCHED',proofs:['Raw material bill verified','Factory production video received','LR / dispatch copy received']};

export default function SupplierDemo(){
 const [order,setOrder]=useState<DemoOrder>(initial);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem('rfqworks_demo_order')||'null');if(x)setOrder(x)}catch{}},[]);
 const save=(next:DemoOrder)=>{setOrder(next);try{localStorage.setItem('rfqworks_demo_order',JSON.stringify(next))}catch{}};
 const add=(label:string,status:string)=>{if(order.status==='COMPLETED'||order.status==='REFUNDED')return;save({...order,status,proofs:[...order.proofs,label]})};
 const dispatch=()=>add('LR / dispatch copy received','DISPATCHED');
 return <main className="app-page"><div className="app-shell">
  <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><span className="app-kicker">SUPPLIER DEMO</span></div>
  <nav className="demo-nav"><Link href="/dashboard/buyer/demo">Buyer</Link><Link href="/dashboard/supplier/demo">Supplier</Link><Link href="/dashboard/admin/disputes/demo">Admin</Link><Link href="/suppliers">Supplier network</Link></nav>
  <div className="demo-banner notice-demo">WORKING DEMO — supplier actions update the same browser-stored order used by the buyer and admin rooms.</div>
  <div className="demo-grid">
   <section className="app-card"><div className="app-kicker">SUPPLIER ORDER ROOM</div><h1>RFQ-1048</h1><div className="status-banner">🛡 Funds protected · Order value ₹8.42L</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:20}}><div className="app-card" style={{padding:14,boxShadow:'none'}}><span className="app-kicker">BUYER</span><strong style={{display:'block',marginTop:6,fontSize:12}}>Industrial Buyer / Demo Co.</strong></div><div className="app-card" style={{padding:14,boxShadow:'none'}}><span className="app-kicker">STATUS</span><strong style={{display:'block',marginTop:6,fontSize:12}}>{order.status}</strong></div></div>
    <h2 style={{marginTop:30}}>Milestone evidence</h2><div className="timeline-demo">{order.proofs.map((p,i)=><div className="timeline-item" key={p+i}><span className="timeline-dot done">✓</span><div><b>{p}</b><span>Evidence attached to the order room</span></div><small>DONE</small></div>)}</div>
   </section>
   <aside className="app-card"><div className="app-kicker">SUBMIT PROOF</div><h2>Move production forward</h2><p className="order-note">Each milestone advances the order state. In production, these actions would validate uploaded files in private storage and create an audit event.</p>
    <div className="form-actions" style={{display:'grid'}}><button className="button button-outline" onClick={()=>add('Raw material bill received','MATERIAL_UPLOADED')}>Submit raw material bill ✓</button><button className="button button-outline" onClick={()=>add('Factory production video received','PRODUCTION_VIDEO_ADDED')}>Submit factory video ✓</button><button className="button button-accent" onClick={dispatch}>Submit dispatch / LR →</button></div>
    <div style={{marginTop:28}}><span className="app-kicker">CHECK RESULT</span><p className="order-note">{order.status==='DISPATCHED'?'Buyer inspection is now active.':order.status==='DISPUTED'?'Buyer has opened a dispute — stop and respond through the admin room.':'Next milestone: production evidence.'}</p></div>
    <div className="form-actions"><Link href="/dashboard/buyer/demo" className="button button-dark">View buyer room</Link><Link href="/dashboard/admin/disputes/demo" className="button button-outline">Admin room</Link></div>
   </aside>
  </div>
 </div></main>;
}
