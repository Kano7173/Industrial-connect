import Link from 'next/link';
import Hero3D from '@/components/hero-3d';

const capabilities = [
  ['01', 'Source', 'Post a drawing, quantity, material and delivery window.'],
  ['02', 'Match', 'Route the requirement to relevant verified manufacturers.'],
  ['03', 'Protect', 'Keep payment, evidence, production and disputes in one order room.'],
  ['04', 'Release', 'Buyer acceptance triggers supplier payout and platform commission.'],
];

const industries = ['CNC / VMC', 'Investment Casting', 'Fabrication', 'Sheet Metal', 'Forging', 'Machinery Job Work'];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="site-nav">
        <Link href="/" className="brand"><span className="brand-mark">IC</span><span>INDUSTRIAL<span>CONNECT</span></span></Link>
        <div className="nav-links"><a href="#how">How it works</a><a href="#network">Network</a><a href="#protection">Protection</a></div>
        <div className="nav-actions"><Link href="/dashboard/buyer/demo" className="nav-login">Sign in</Link><Link href="/dashboard/buyer/demo" className="nav-cta">Post requirement <span>↗</span></Link></div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><i /> INDIA'S INDUSTRIAL PROCUREMENT NETWORK</div>
          <h1>Industrial sourcing,<br /><em>re-engineered.</em></h1>
          <p className="hero-lead">Connect real manufacturing capacity with real buyer requirements — then move the transaction from RFQ to delivery inside one protected workflow.</p>
          <div className="hero-actions"><Link href="/dashboard/buyer/demo" className="button-primary">Start a requirement <span>→</span></Link><a href="#how" className="button-ghost">Explore the network <span>↓</span></a></div>
          <div className="hero-proof"><span><b>₹50K</b> pilot batches</span><span><b>₹50L+</b> contracts</span><span><b>48H</b> inspection</span></div>
        </div>
        <Hero3D />
        <div className="scroll-cue">SCROLL TO DISCOVER <span>↓</span></div>
      </section>

      <section className="ticker" id="network"><div>BUYER REQUIREMENT <b>→</b> SUPPLIER MATCH <b>→</b> QUOTE <b>→</b> PAYMENT <b>→</b> PRODUCTION <b>→</b> QC <b>→</b> DELIVERY <b>→</b> ACCEPTANCE</div></section>

      <section className="manifesto" id="how">
        <div className="section-kicker">01 / THE NEW INDUSTRIAL WORKFLOW</div>
        <div className="manifesto-grid"><h2>Less chasing.<br /><span>More making.</span></h2><p>Industrial procurement still runs through fragmented calls, spreadsheets, WhatsApp threads and uncertain payment cycles. IndustrialConnect turns that fragmentation into a structured transaction layer built around the order itself.</p></div>
      </section>

      <section className="process-section">
        {capabilities.map(([number, title, text]) => <article className="process-item" key={number}><span className="process-number">{number}</span><h3>{title}</h3><p>{text}</p><span className="process-arrow">↗</span></article>)}
      </section>

      <section className="visual-break"><div className="visual-label">CAPACITY / VERIFIED / IN MOTION</div><div className="machine-lines" /><div className="visual-copy"><span>From machine shop</span><strong>to delivered part.</strong></div></section>

      <section className="protection-section" id="protection">
        <div><div className="section-kicker">02 / TRANSACTION PROTECTION</div><h2>The order room<br /><em>is the source of truth.</em></h2></div>
        <div className="protection-copy"><p>Payment state. Production evidence. Quality documents. Dispatch proof. Inspection. Dispute resolution. Every critical step lives against one immutable order timeline.</p><div className="status-stack"><div><span>01</span> Funds secured</div><div><span>02</span> Material verified</div><div><span>03</span> Production evidenced</div><div><span>04</span> Buyer acceptance</div></div></div>
      </section>

      <section className="network-section"><div className="section-kicker">03 / INITIAL CAPACITY NETWORK</div><h2>Built for the factories<br />that <em>actually make things.</em></h2><div className="industry-grid">{industries.map((item, i) => <div key={item}><span>0{i + 1}</span><b>{item}</b><small>GUJARAT / INDIA</small></div>)}</div></section>

      <section className="final-cta"><div className="section-kicker">04 / START A TRANSACTION</div><h2>Have a part to make?<br /><em>Let's move it.</em></h2><p>Upload the requirement. Let the network do the matching.</p><Link href="/dashboard/buyer/demo" className="button-primary">Post your requirement <span>↗</span></Link></section>

      <footer className="site-footer"><div className="brand"><span className="brand-mark">IC</span><span>INDUSTRIAL<span>CONNECT</span></span></div><p>Protected industrial procurement infrastructure.</p><div>© 2026 IndustrialConnect India</div></footer>
    </main>
  );
}
