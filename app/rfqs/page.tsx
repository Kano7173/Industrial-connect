'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const demo = [
  {id:'RFQ-1048',title:'CNC turned shaft components',category:'CNC Turning',location:'Ahmedabad',quantity:'5,000 pcs',material:'EN8',budget:'₹8–10L',matches:8},
  {id:'RFQ-1047',title:'SS304 investment casting',category:'Investment Casting',location:'Pune',quantity:'2,500 pcs',material:'SS304',budget:'₹5–7L',matches:5},
  {id:'RFQ-1046',title:'Laser-cut fabrication frames',category:'Fabrication',location:'Vadodara',quantity:'200 / month',material:'MS',budget:'₹3–5L',matches:12},
  {id:'RFQ-1045',title:'VMC precision brackets',category:'CNC Milling / VMC',location:'Rajkot',quantity:'1,200 pcs',material:'Al 6061',budget:'₹2–3L',matches:6},
];

export default function RFQBoard(){
  const [items,setItems]=useState(demo);
  const [q,setQ]=useState('');
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('rfqworks_rfqs')||'[]');if(Array.isArray(saved)&&saved.length)setItems([...saved.map((x:any)=>({...x,budget:x.budget||'Quote requested',matches:x.matches||0})),...demo]);}catch{}},[]);
  const filtered=useMemo(()=>items.filter(x=>[x.title,x.category,x.location,x.material].join(' ').toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <main className="app-page"><div className="app-shell">
    <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><Link href="/post-requirement" className="button button-dark">Post requirement →</Link></div>
    <div className="app-card"><div className="app-kicker">BUYER DEMAND / RFQ BOARD</div><h1>Requirements in<br /><em>motion.</em></h1><p className="order-note">A working demo board. In production, suppliers only see requirements matched to their verified capabilities.</p>
      <div className="search-control" style={{margin:'28px 0 10px',maxWidth:460}}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search process, material, city..." /></div>
      <div className="rfq-list">{filtered.map((x:any)=><article className="rfq-row" key={x.id}><div className="rfq-id">{x.id}</div><div className="rfq-main"><h3>{x.title}</h3><span>{x.category} · {x.location}</span></div><div className="rfq-meta"><span>{x.material}</span><strong>{x.quantity}</strong></div><div className="rfq-time">{x.matches} matches</div><Link href="/post-requirement" className="row-action">→</Link></article>)}</div>
      {!filtered.length && <div className="empty-state">No requirements match your search.</div>}
    </div>
  </div></main>;
}
