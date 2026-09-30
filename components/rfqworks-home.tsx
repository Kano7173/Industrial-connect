'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type RFQ = { id:string; title:string; category:string; location:string; quantity:string; material:string; createdAt:string };

const sampleRfqs:RFQ[]=[
 {id:'RFQ-1048',title:'CNC turned shaft components',category:'CNC Turning',location:'Ahmedabad',quantity:'5,000 pcs',material:'EN8',createdAt:'Today'},
 {id:'RFQ-1047',title:'SS304 investment casting',category:'Investment Casting',location:'Pune',quantity:'2,500 pcs',material:'SS304',createdAt:'Today'},
 {id:'RFQ-1046',title:'Laser-cut fabrication frames',category:'Fabrication',location:'Vadodara',quantity:'200 / month',material:'MS',createdAt:'Yesterday'},
 {id:'RFQ-1045',title:'VMC precision brackets',category:'CNC Milling / VMC',location:'Rajkot',quantity:'1,200 pcs',material:'Al 6061',createdAt:'Yesterday'},
];

const categories=[
 ['CNC','CNC Turning','Shafts, bushings, precision job work'],
 ['VMC','CNC Milling / VMC','3-axis, 4-axis and 5-axis machining'],
 ['CAST','Investment Casting','Steel, stainless and precision castings'],
 ['FAB','Fabrication','Laser, bending, welding and assemblies'],
 ['SHEET','Sheet Metal','Cutting, bending and enclosures'],
 ['GRIND','Grinding','Surface and cylindrical grinding'],
];

export default function RFQWorksHome(){
 const [query,setQuery]=useState('');
 const [rfqs,setRfqs]=useState<RFQ[]>(sampleRfqs);
 const [menuOpen,setMenuOpen]=useState(false);
 const [toast,setToast]=useState('');

 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('rfqworks_rfqs')||'[]');if(Array.isArray(saved)&&saved.length)setRfqs([...saved,...sampleRfqs])}catch{}},[]);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return rfqs.slice(0,4);return rfqs.filter(r=>[r.title,r.category,r.location,r.material].some(v=>v.toLowerCase().includes(q))).slice(0,6)},[query,rfqs]);
 const quickSearch=(value:string)=>{setQuery(value);document.getElementById('live-rfqs')?.scrollIntoView({behavior:'smooth'})};
 const newsletter=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setToast('Thanks — RFQWorks updates will be sent to your work email.');setTimeout(()=>setToast(''),2600)};

 return <main className="site">
  <header className="site-header">
   <div className="container nav-row">
    <Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link>
    <button className="mobile-menu" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu">☰</button>
    <nav className={menuOpen?'main-nav open':'main-nav'}>
      <a href="#buyers">For Buyers</a><a href="#suppliers">For Suppliers</a><a href="#how">How it works</a><a href="#rfqs">Live RFQs</a><Link href="/suppliers">Manufacturer Network</Link>
    </nav>
    <div className="nav-actions"><Link href="/dashboard/buyer/demo" className="nav-link">Login / Demo</Link><Link href="/post-requirement" className="button button-dark">Post requirement <span>↗</span></Link></div>
   </div>
  </header>

  <section className="hero-section">
   <div className="hero-grid container">
    <div className="hero-copy">
     <div className="eyebrow"><span className="live-dot"/> GUJARAT MANUFACTURERS · PAN-INDIA BUYERS</div>
     <h1>Industrial orders.<br/><em>Matched properly.</em></h1>
     <p className="hero-lead">RFQWorks connects Indian buyers with capable manufacturers — starting with Gujarat's strong CNC, casting, fabrication and job-work ecosystem.</p>
     <div className="hero-actions"><Link href="/post-requirement" className="button button-accent button-large">I need a manufacturer →</Link><Link href="/supplier/join" className="button button-dark button-large">I am a manufacturer →</Link></div>
     <div className="trust-strip"><div><strong>PAN-INDIA DEMAND</strong><span>Buyers from every state</span></div><div><strong>GUJARAT SUPPLY</strong><span>Manufacturing-first network</span></div><div><strong>ORDER WORKFLOW</strong><span>RFQ → quote → order → delivery</span></div></div>
    </div>
    <div className="hero-interface">
     <div className="interface-glow"/>
     <div className="hero-console">
      <div className="console-top"><span>LIVE PROCUREMENT FLOW</span><span className="status-pill">RFQ OPEN</span></div>
      <div className="hero-order-card"><div className="order-top"><span>RFQ-1048</span><b>₹8–10L TARGET</b></div><h3>CNC turned shaft components</h3><p>EN8 · 5,000 pcs · Ahmedabad delivery</p><div className="order-tags"><span>DRAWING</span><span>TOLERANCE</span><span>MONTHLY</span></div></div>
      <div className="quote-stack"><div><b>01</b><span>Precision Motion Works</span><strong>₹8.42L</strong></div><div><b>02</b><span>Verified-capacity supplier</span><strong>₹8.67L</strong></div><div><b>03</b><span>Qualified supplier</span><strong>₹9.05L</strong></div></div>
      <div className="match-line"><span/> <b>8</b> relevant manufacturers can be invited</div>
     </div>
     <div className="floating-card card-verified"><span>✓</span><div><b>Buyer requirement first</b><small>Specs · quantity · delivery · quality</small></div></div>
     <div className="floating-card card-quote"><small>SUPPLIER VIEW</small><b>CHOOSE RFQ</b><span>Quote only when it fits your capacity</span></div>
    </div>
   </div>
  </section>

  <div className="process-ticker"><div>BUYER REQUIREMENT <i>→</i> CAPABILITY MATCH <i>→</i> SUPPLIER QUOTES <i>→</i> ORDER <i>→</i> PRODUCTION <i>→</i> QC <i>→</i> DELIVERY</div></div>

  <section className="supplier-trust-flow">
   <div className="container">
    <div className="supplier-flow-top">
     <div><div className="section-index">01 / FOR MANUFACTURERS</div><h2>Know exactly what happens<br/><em>after you join.</em></h2></div>
     <div><p>RFQWorks is designed around one simple idea: manufacturers should not have to chase random enquiries. You see the requirement, decide if it fits your factory, quote, win the order and manage production from one place.</p><Link href="/supplier/join" className="button button-accent">Join the manufacturer network →</Link></div>
    </div>
    <div className="supplier-flow-grid">
     <div className="supplier-flow-steps">
      <div className="flow-step"><b>01</b><div><strong>Create your factory profile</strong><span>Add your location, processes, machines, materials, capacity and documents.</span></div></div>
      <div className="flow-step"><b>02</b><div><strong>Get matched with relevant RFQs</strong><span>See requirements that fit your manufacturing capability and service area.</span></div></div>
      <div className="flow-step"><b>03</b><div><strong>Review before you quote</strong><span>Check drawing/specification, quantity, delivery target and commercial context first.</span></div></div>
      <div className="flow-step"><b>04</b><div><strong>Submit your quotation</strong><span>Set your price, lead time, terms and production commitment clearly.</span></div></div>
      <div className="flow-step"><b>05</b><div><strong>Convert the quote into an order</strong><span>When the buyer selects you, the order room keeps PO, milestones and evidence together.</span></div></div>
      <div className="flow-step"><b>06</b><div><strong>Produce, dispatch and close</strong><span>Share production/QC/dispatch evidence and complete the buyer acceptance workflow.</span></div></div>
     </div>
     <aside className="supplier-trust-panel">
      <div><span className="panel-label">WHY A FACTORY WOULD JOIN</span><h3>Less noise.<br/>More control.</h3></div>
      <ul><li><span>✓</span><div><b>Relevant opportunities</b><small>Built around process and capacity, not just keywords.</small></div></li><li><span>✓</span><div><b>Technical context</b><small>Review the requirement before spending time on a quote.</small></div></li><li><span>✓</span><div><b>One order room</b><small>Quote, PO, production updates, dispatch and documents stay connected.</small></div></li><li><span>✓</span><div><b>Business visibility</b><small>Build a professional manufacturer profile buyers can understand.</small></div></li><li><span>✓</span><div><b>You decide what to quote</b><small>RFQWorks does not decide your price, capacity or commercial terms.</small></div></li></ul>
      <div className="supplier-panel-note">Designed for Gujarat's CNC, VMC, casting, fabrication and job-work ecosystem — with buyer demand from across India.</div>
     </aside>
    </div>
   </div>
  </section>

  <section className="trust-section" id="buyers">
   <div className="container trust-grid">
    <div><div className="section-index">01 / WHY A BUYER TRUSTS THE FIRST SCREEN</div><h2>One requirement.<br/><em>One clear process.</em></h2><p>Buyers should understand in seconds what happens after they submit a drawing. RFQWorks is built to turn a messy supplier search into a structured procurement journey.</p></div>
    <div className="trust-points"><div><b>01</b><strong>Capability before contact</strong><span>Match by process, material, quantity, location and delivery requirement.</span></div><div><b>02</b><strong>Commercial clarity</strong><span>Compare supplier quotes with the same requirement instead of scattered WhatsApp messages.</span></div><div><b>03</b><strong>Order visibility</strong><span>Keep production proof, dispatch, inspection and acceptance connected to the order.</span></div><div><b>04</b><strong>Gujarat supply, India-wide demand</strong><span>Build the supply side around Gujarat while allowing buyers across India to source through one workflow.</span></div></div>
   </div>
  </section>

  <section className="supplier-benefit-section" id="suppliers">
   <div className="container">
    <div className="section-index">02 / FOR GUJARAT MANUFACTURERS</div>
    <div className="supplier-benefit-head"><div><h2>Don't buy leads.<br/><em>Win the right orders.</em></h2></div><p>RFQWorks should feel useful to a manufacturer from the first minute: see the requirement, check whether it fits your machines, decide whether to quote, and manage the order in one place.</p></div>
    <div className="supplier-benefit-grid">
      <div><span>01</span><h3>See the full requirement</h3><p>Process, material, quantity, delivery city, drawings and commercial context before you spend time quoting.</p></div>
      <div><span>02</span><h3>Quote only what fits</h3><p>Choose RFQs that match your actual machine capacity, current load and production capability.</p></div>
      <div><span>03</span><h3>Get buyers beyond Gujarat</h3><p>Use Gujarat's manufacturing strength to serve OEMs, contractors, traders and industrial buyers across India.</p></div>
      <div><span>04</span><h3>Turn a quote into an order</h3><p>Keep quotation, PO, milestones, evidence, dispatch and buyer acceptance connected.</p></div>
      <div><span>05</span><h3>Build a trusted profile</h3><p>Show capabilities, machines, materials, certificates, service locations and completed order history.</p></div>
      <div><span>06</span><h3>Protect your time</h3><p>No need to chase every enquiry. Work from a structured RFQ inbox designed around manufacturing.</p></div>
    </div>
    <div className="supplier-cta-row"><div><b>MANUFACTURER MENU</b><span>Profile · RFQs · Quotes · Orders · Capacity · Documents · Payouts · Support</span></div><Link href="/supplier/join" className="button button-accent">Build supplier profile →</Link></div>
   </div>
  </section>

  <section className="section capabilities-section" id="how"><div className="container">
   <div className="section-heading"><div><div className="section-index">03 / START WITH WHAT GUJARAT DOES WELL</div><h2>Built around <em>capability.</em></h2></div><Link href="/suppliers" className="text-link">Explore manufacturer network →</Link></div>
   <div className="capability-grid">{categories.map(([code,title,copy])=><button key={title} className="capability-card" onClick={()=>quickSearch(title)}><span className="cap-code">{code}</span><div><h3>{title}</h3><p>{copy}</p></div><b>↗</b></button>)}</div>
  </div></section>

  <section className="section rfq-section" id="rfqs"><div className="container">
   <div className="section-heading rfq-heading"><div><div className="section-index">04 / LIVE BUYER DEMAND</div><h2>Real requirements.<br/><em>Clearer opportunities.</em></h2></div><div className="search-control"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search CNC, casting, fabrication..." aria-label="Search RFQs"/></div></div>
   <div className="rfq-list">{filtered.map(r=><article className="rfq-row" key={r.id}><div className="rfq-id">{r.id}</div><div className="rfq-main"><h3>{r.title}</h3><span>{r.category} · {r.location}</span></div><div className="rfq-meta"><span>{r.material}</span><strong>{r.quantity}</strong></div><div className="rfq-time">{r.createdAt}</div><Link href="/post-requirement" className="row-action">→</Link></article>)}{!filtered.length&&<div className="empty-state">No matching RFQs. <Link href="/post-requirement">Create the requirement →</Link></div>}</div>
   <div className="section-foot"><span>Sample RFQs are clearly marked as demo data in the working environment.</span><Link href="/rfqs" className="button button-outline">Open RFQ board</Link></div>
  </div></section>

  <section className="section workflow-section"><div className="container"><div className="section-index">05 / THE ORDER JOURNEY</div><div className="workflow-layout"><div><h2>Happy buyers.<br/><em>Confident suppliers.</em></h2><p>The platform's job is to make both sides comfortable enough to move from requirement to order without losing technical or commercial context.</p><div className="hero-actions"><Link href="/post-requirement" className="button button-accent">Start as buyer →</Link><Link href="/supplier/join" className="button button-light">Start as supplier →</Link></div></div><div className="workflow-steps">{[['01','REQUIREMENT','Buyer adds drawing, quantity, material and deadline'],['02','MATCH','Relevant manufacturers receive the opportunity'],['03','QUOTE','Supplier submits price, lead time and terms'],['04','ORDER','Buyer selects supplier and confirms the PO'],['05','PRODUCTION','Evidence and milestones stay in the order room'],['06','DELIVERY','Dispatch, inspection, acceptance and closure']].map(([n,t,d])=><div className="workflow-step" key={n}><b>{n}</b><div><strong>{t}</strong><span>{d}</span></div><i>↗</i></div>)}</div></div></div></section>

  <section className="section supplier-menu-section"><div className="container"><div className="section-heading"><div><div className="section-index">06 / MANUFACTURER CONTROL CENTRE</div><h2>Everything a supplier<br/><em>needs in one menu.</em></h2></div><Link href="/supplier/join" className="button button-dark">Supplier onboarding →</Link></div><div className="menu-grid">{[['RFQs','See matched buyer requirements','/rfqs'],['Quotes','Draft, submit and track quotations','#suppliers'],['Orders','Won orders and production status','/dashboard/supplier/demo'],['Capacity','Machines, processes and available load','#suppliers'],['Documents','GST, certificates and technical files','#suppliers'],['Payments','Order value, platform fee and payout status','/dashboard/supplier/demo'],['Performance','Delivery, quality and response history','#suppliers'],['Support','Procurement assistance and issue handling','#how']].map(([t,d,l])=><Link href={l} key={t} className="menu-card"><b>{t}</b><span>{d}</span><i>→</i></Link>)}</div></div></section>

  <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><p>Industrial sourcing built around Gujarat manufacturers and buyers across India.</p></div><div><h4>BUYERS</h4><Link href="/post-requirement">Post requirement</Link><Link href="/rfqs">RFQ board</Link><Link href="/dashboard/buyer/demo">Buyer order room</Link></div><div><h4>SUPPLIERS</h4><Link href="/supplier/join">Join network</Link><Link href="/suppliers">Manufacturer network</Link><Link href="/dashboard/supplier/demo">Supplier demo</Link></div><div><h4>WORKFLOW</h4><a href="#buyers">Trust & benefits</a><a href="#suppliers">Supplier benefits</a><a href="#how">Capabilities</a><a href="#rfqs">Live RFQs</a></div></div><div className="container footer-bottom"><span>© 2026 RFQWorks</span><span>GUJARAT SUPPLY · INDIA-WIDE DEMAND</span><span>WORKING DEMO</span></div></footer>
  {toast&&<div className="toast">{toast}</div>}
 </main>
}
