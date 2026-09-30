'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type RFQ = {
  id: string;
  title: string;
  category: string;
  location: string;
  quantity: string;
  material: string;
  createdAt: string;
};

const sampleRfqs: RFQ[] = [
  { id: 'RFQ-1048', title: 'CNC turned shaft components', category: 'CNC Turning', location: 'Ahmedabad', quantity: '5,000 pcs', material: 'EN8', createdAt: 'Today' },
  { id: 'RFQ-1047', title: 'SS304 investment casting', category: 'Investment Casting', location: 'Pune', quantity: '2,500 pcs', material: 'SS304', createdAt: 'Today' },
  { id: 'RFQ-1046', title: 'Laser-cut fabrication frames', category: 'Fabrication', location: 'Vadodara', quantity: '200 / month', material: 'MS', createdAt: 'Yesterday' },
  { id: 'RFQ-1045', title: 'VMC precision brackets', category: 'CNC Milling / VMC', location: 'Rajkot', quantity: '1,200 pcs', material: 'Al 6061', createdAt: 'Yesterday' },
];

const categories = [
  ['CNC', 'CNC Turning', 'Turning, shafts, bushings, precision job work'],
  ['VMC', 'CNC Milling / VMC', '3-axis, 4-axis, 5-axis machining'],
  ['CAST', 'Investment Casting', 'Steel, stainless and precision castings'],
  ['FAB', 'Fabrication', 'Laser, bending, welding and assemblies'],
  ['SHEET', 'Sheet Metal', 'Laser cutting, bending and enclosures'],
  ['GRIND', 'Grinding', 'Surface and cylindrical grinding'],
];

export default function RFQWorksHome() {
  const [query, setQuery] = useState('');
  const [rfqs, setRfqs] = useState<RFQ[]>(sampleRfqs);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rfqworks_rfqs') || '[]') as RFQ[];
      if (Array.isArray(saved) && saved.length) setRfqs([...saved, ...sampleRfqs]);
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rfqs.slice(0, 4);
    return rfqs.filter((r) => [r.title, r.category, r.location, r.material].some((v) => v.toLowerCase().includes(q))).slice(0, 6);
  }, [query, rfqs]);

  const quickSearch = (value: string) => {
    setQuery(value);
    document.getElementById('live-rfqs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewsletter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToast('You are on the RFQWorks updates list.');
    window.setTimeout(() => setToast(''), 2600);
  };

  return <main className="site">
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="brand" aria-label="RFQWorks home"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link>
        <button className="mobile-menu" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">☰</button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
          <a href="#how">How it works</a><a href="#capabilities">Capabilities</a><a href="#live-rfqs">Live RFQs</a><Link href="/suppliers">Suppliers</Link>
        </nav>
        <div className="nav-actions"><Link href="/dashboard/buyer/demo" className="nav-link">Demo</Link><Link href="/post-requirement" className="button button-dark">Post requirement <span>↗</span></Link></div>
      </div>
    </header>

    <section className="hero-section">
      <div className="hero-grid container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> INDIA / INDUSTRIAL SOURCING NETWORK</div>
          <h1>Stop searching.<br /><em>Start sourcing.</em></h1>
          <p className="hero-lead">Turn drawings, quantities and specifications into competitive manufacturing quotes from relevant Indian suppliers.</p>
          <div className="hero-actions"><Link href="/post-requirement" className="button button-accent button-large">Post a requirement <span>→</span></Link><a href="#live-rfqs" className="button button-outline button-large">Explore RFQs</a></div>
          <div className="trust-strip"><div><strong>RFQ → QUOTE</strong><span>Structured sourcing</span></div><div><strong>VERIFIED</strong><span>Supplier profiles</span></div><div><strong>48H</strong><span>Inspection window</span></div></div>
        </div>
        <div className="hero-interface">
          <div className="interface-glow" />
          <div className="hero-console">
            <div className="console-top"><span>RFQ / 1048</span><span className="status-pill">MATCHING</span></div>
            <div className="part-visual"><div className="part-outer"><div className="part-inner" /><i /><i /><i /><i /></div></div>
            <div className="console-data"><div><small>PROCESS</small><b>CNC TURNING</b></div><div><small>MATERIAL</small><b>EN8 STEEL</b></div><div><small>QTY</small><b>5,000 PCS</b></div></div>
            <div className="match-line"><span /><b>8</b> relevant suppliers matched</div>
          </div>
          <div className="floating-card card-verified"><span>✓</span><div><b>Verified capacity</b><small>Rajkot · CNC / VMC</small></div></div>
          <div className="floating-card card-quote"><small>LOWEST QUOTE</small><b>₹ 8.42L</b><span>3 suppliers responding</span></div>
        </div>
      </div>
    </section>

    <div className="process-ticker"><div>REQUIREMENT <i>→</i> MATCH <i>→</i> QUOTE <i>→</i> ORDER <i>→</i> PRODUCTION <i>→</i> QC <i>→</i> DELIVERY</div></div>

    <section className="section intro-section" id="how"><div className="container two-col"><div><div className="section-index">01 / WHY RFQWORKS</div><h2>Industrial sourcing,<br /><em>without the chase.</em></h2></div><div className="section-copy"><p>Instead of calling ten factories and rebuilding the same specification in WhatsApp, publish one structured requirement. RFQWorks routes it to manufacturers based on process, material, capability and location.</p><p className="muted">The platform is designed around the transaction — not just the introduction.</p><Link href="/post-requirement" className="text-link">Create your first RFQ →</Link></div></div></section>

    <section className="section capabilities-section" id="capabilities"><div className="container"><div className="section-heading"><div><div className="section-index">02 / MANUFACTURING NETWORK</div><h2>Built around <em>capability.</em></h2></div><Link href="/suppliers" className="text-link">View supplier network →</Link></div><div className="capability-grid">
      {categories.map(([code, title, copy]) => <button key={title} className="capability-card" onClick={() => quickSearch(title)}><span className="cap-code">{code}</span><div><h3>{title}</h3><p>{copy}</p></div><b>↗</b></button>)}
    </div></div></section>

    <section className="section rfq-section" id="live-rfqs"><div className="container"><div className="section-heading rfq-heading"><div><div className="section-index">03 / BUYER DEMAND</div><h2>Requirements <em>in motion.</em></h2></div><div className="search-control"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search CNC, casting, fabrication..." aria-label="Search RFQs" /></div></div>
      <div className="rfq-list">{filtered.map((rfq) => <article className="rfq-row" key={rfq.id}><div className="rfq-id">{rfq.id}</div><div className="rfq-main"><h3>{rfq.title}</h3><span>{rfq.category} · {rfq.location}</span></div><div className="rfq-meta"><span>{rfq.material}</span><strong>{rfq.quantity}</strong></div><div className="rfq-time">{rfq.createdAt}</div><Link href="/post-requirement" className="row-action" aria-label="Create a requirement">→</Link></article>)}{!filtered.length && <div className="empty-state">No matching requirements. <Link href="/post-requirement">Post this requirement yourself →</Link></div>}</div>
      <div className="section-foot"><span>Showing {filtered.length} requirements</span><Link href="/rfqs" className="button button-outline">Open RFQ board</Link></div>
    </div></section>

    <section className="section workflow-section"><div className="container"><div className="section-index">04 / ONE ORDER ROOM</div><div className="workflow-layout"><div><h2>From first quote<br />to <em>final delivery.</em></h2><p>Every step stays connected to the order: supplier selection, payment state, production proof, dispatch evidence, inspection and acceptance.</p><Link href="/dashboard/buyer/demo" className="button button-accent">Open working demo →</Link></div><div className="workflow-steps">
      {[['01','REQUIREMENT','Drawing + quantity + material'],['02','MATCHING','Relevant suppliers receive the RFQ'],['03','QUOTES','Compare commercial + technical fit'],['04','ORDER','Payment and production milestones'],['05','ACCEPT','Inspection, dispute or release']].map(([n,t,d], i) => <div className={i === 0 ? 'workflow-step active' : 'workflow-step'} key={n}><b>{n}</b><div><strong>{t}</strong><span>{d}</span></div><i>↗</i></div>)}
    </div></div></div></section>

    <section className="section supplier-cta"><div className="container cta-panel"><div><div className="section-index">FOR MANUFACTURERS</div><h2>Bring your capacity<br /><em>to the right RFQs.</em></h2><p>Build a capability profile, receive relevant requirements and quote without buying generic leads.</p></div><Link href="/suppliers" className="button button-light">Join supplier network →</Link></div></section>

    <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><p>India's industrial sourcing and manufacturing network.</p></div><div><h4>PLATFORM</h4><Link href="/post-requirement">Post requirement</Link><Link href="/rfqs">RFQ board</Link><Link href="/suppliers">Supplier network</Link><Link href="/dashboard/buyer/demo">Order room demo</Link></div><div><h4>WORKFLOW</h4><a href="#how">How it works</a><a href="#capabilities">Capabilities</a><a href="#live-rfqs">Live demand</a></div><div><h4>UPDATES</h4><form onSubmit={handleNewsletter} className="footer-form"><input type="email" required placeholder="Work email" aria-label="Work email" /><button type="submit">→</button></form><small>For product updates and network launches.</small></div></div><div className="container footer-bottom"><span>© 2026 RFQWorks</span><span>BUILT FOR INDIAN MANUFACTURING</span><span>DEMO MODE AVAILABLE</span></div></footer>
    {toast && <div className="toast">{toast}</div>}
  </main>;
}
