'use client';

import Link from 'next/link';
import { useState } from 'react';

const data=[
 {id:'rajkot-cnc-01',name:'Precision Motion Works',city:'Rajkot, Gujarat',type:'CNC / VMC',tags:['CNC Turning','VMC','EN8','SS304'],machines:'18 machines',capacity:'25k pcs / month',verified:'Capacity + GST verified'},
 {id:'ahmedabad-fab-02',name:'Apex Fabrication Systems',city:'Ahmedabad, Gujarat',type:'Fabrication',tags:['Laser','Bending','Welding','Assembly'],machines:'2 laser lines',capacity:'200 frames / month',verified:'Factory + capacity verified'},
 {id:'rajkot-cast-03',name:'Western Precision Castings',city:'Rajkot, Gujarat',type:'Investment Casting',tags:['SS304','Steel','Wax patterns','Heat treatment'],machines:'5T melting',capacity:'12T / month',verified:'Factory + process verified'},
 {id:'vadodara-mach-04',name:'Core Machinery Works',city:'Vadodara, Gujarat',type:'Machinery Job Work',tags:['Machine build','Shafts','Fixtures','Assembly'],machines:'22 machines',capacity:'Multi-batch',verified:'Business profile verified'},
 {id:'pune-vmc-05',name:'Axis CNC Technologies',city:'Pune, Maharashtra',type:'CNC Milling / VMC',tags:['VMC','Al 6061','SS','Prototype'],machines:'14 VMCs',capacity:'8k pcs / month',verified:'Capacity verified'},
 {id:'surat-sheet-06',name:'LineForm Sheet Metal',city:'Surat, Gujarat',type:'Sheet Metal',tags:['Laser','Bending','Enclosures','MS'],machines:'3 laser lines',capacity:'500 assemblies / month',verified:'Factory verified'},
];

export default function Suppliers(){
 const [filter,setFilter]=useState('All');
 const types=['All','CNC / VMC','Investment Casting','Fabrication','Machinery Job Work','Sheet Metal'];
 const shown=data.filter(x=>filter==='All'||x.type===filter);
 return <main className="app-page"><div className="app-shell">
  <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><Link href="/post-requirement" className="button button-dark">Post requirement →</Link></div>
  <div className="app-card"><div className="app-kicker">MANUFACTURER NETWORK / INDIA</div><h1>Capacity you can<br /><em>actually source.</em></h1><p className="order-note">Example supplier profiles for the RFQWorks workflow. Production profiles can later be connected to verification documents, machine lists, certificates and performance history.</p>
   <div className="demo-nav" style={{marginTop:24}}>{types.map(t=><button key={t} onClick={()=>setFilter(t)} className="demo-nav" style={{border:filter===t?'1px solid #111514':'1px solid #d4dad4',background:filter===t?'#111514':'#fff',color:filter===t?'#fff':'#111514',margin:0}}>{t}</button>)}</div>
   <div className="supplier-list">{shown.map(s=><article key={s.id} className="app-card" style={{marginTop:12,boxShadow:'none'}}><div style={{display:'flex',justifyContent:'space-between',gap:15,alignItems:'start'}}><div><div className="app-kicker">{s.type}</div><h2 style={{margin:'8px 0 3px'}}>{s.name}</h2><div style={{fontSize:10,color:'#7c847f'}}>{s.city}</div></div><span className="status-pill">{s.verified}</span></div><div className="supplier-tags" style={{display:'flex',gap:6,flexWrap:'wrap',margin:'18px 0'}}>{s.tags.map(t=><span key={t} style={{fontSize:9,padding:'6px 8px',background:'#eef1ec',borderRadius:99,color:'#59625d'}}>{t}</span>)}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,borderTop:'1px solid #e1e5df',paddingTop:14}}><div><span className="app-kicker">MACHINES / PROCESS</span><strong style={{display:'block',marginTop:5,fontSize:12}}>{s.machines}</strong></div><div><span className="app-kicker">CAPACITY</span><strong style={{display:'block',marginTop:5,fontSize:12}}>{s.capacity}</strong></div></div><div className="form-actions"><Link href="/post-requirement" className="button button-dark">Request a quote →</Link></div></article>)}</div>
  </div>
 </div></main>;
}
