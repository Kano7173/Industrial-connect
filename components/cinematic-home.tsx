'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const scenes = [
  { kicker: 'INDUSTRIAL CONNECT / 01', title: 'THE PART', copy: 'A drawing becomes a clear manufacturing requirement.' },
  { kicker: 'INDUSTRIAL CONNECT / 02', title: 'THE NETWORK', copy: 'Relevant Indian manufacturers appear as capacity, not a directory.' },
  { kicker: 'INDUSTRIAL CONNECT / 03', title: 'THE ORDER', copy: 'Quotes, payment, production evidence and quality stay connected.' },
  { kicker: 'INDUSTRIAL CONNECT / 04', title: 'THE DELIVERY', copy: 'Dispatch, inspection and acceptance close the loop.' },
];

function MachinePart() {
  return <div className="machine-part" aria-hidden="true">
    <div className="part-ring part-ring-a" /><div className="part-ring part-ring-b" />
    <div className="part-body">
      <span className="bolt b1" /><span className="bolt b2" /><span className="bolt b3" />
      <span className="bolt b4" /><span className="bolt b5" /><span className="bolt b6" />
      <div className="part-hole" />
    </div><div className="part-shadow" />
  </div>;
}

export default function CinematicHome() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      setProgress(Math.min(1, Math.max(0, scrollY / max)));
    };
    update(); addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, []);

  const active = Math.min(scenes.length - 1, Math.floor(progress * scenes.length * 1.05));
  const scene = scenes[active];

  return <main className="cinematic-site">
    <nav className="cinematic-nav">
      <Link href="/" className="cinematic-brand"><span>IC</span><b>INDUSTRIAL CONNECT</b></Link>
      <div className="cinematic-nav-center"><span>INDIA / 2026</span><span>PROCUREMENT NETWORK</span></div>
      <Link href="/dashboard/buyer/demo" className="nav-cta">POST REQUIREMENT ↗</Link>
    </nav>

    <section className="cinematic-stage">
      <div className="stage-backdrop" /><div className="stage-grain" />
      <div className="stage-number">0{active + 1} / 04</div>
      <div className="stage-copy" key={scene.title}><small>{scene.kicker}</small><h1>{scene.title}</h1><p>{scene.copy}</p></div>
      <div className="stage-visual">
        <div className="machine-glow" /><MachinePart />
        <div className="data-chip chip-a">CNC / VMC</div><div className="data-chip chip-b">±0.01 MM</div><div className="data-chip chip-c">VERIFIED CAPACITY</div>
      </div>
      <div className="stage-caption"><span>FROM DRAWING</span><i>→</i><span>RFQ</span><i>→</i><span>PRODUCTION</span><i>→</i><span>DELIVERY</span></div>
      <div className="stage-progress"><span style={{ transform: `scaleX(${Math.max(.02, progress)})` }} /></div>
      <div className="scroll-hint">SCROLL TO MOVE THROUGH THE NETWORK <b>↓</b></div>
    </section>

    <section className="story-panel panel-requirement">
      <div><small>01 / REQUIREMENT</small><h2>Don't search for<br /><em>factories.</em></h2></div>
      <p>Describe the part once. Upload your drawing, quantity, material and delivery window. IndustrialConnect turns it into a structured RFQ.</p>
    </section>

    <section className="story-panel panel-matching">
      <div className="network-orbit"><span className="orbit-center">RFQ</span>
        {['CNC','CAST','FAB','VMC','LASER','GRIND'].map((x, i) => <span className={`orbit-node on${i}`} key={x}>{x}</span>)}
      </div>
      <div><small>02 / MATCHING</small><h2>Capacity finds<br /><em>you.</em></h2><p>Match by process, material, capability, location and fit — then compare structured quotations.</p></div>
    </section>

    <section className="story-panel panel-order">
      <div className="order-stack"><div>PAYMENT <b>PROTECTED</b></div><div>PRODUCTION <b>LIVE</b></div><div>QUALITY <b>VERIFIED</b></div><div>DELIVERY <b>TRACKED</b></div></div>
      <div><small>03 / ONE ORDER ROOM</small><h2>Every proof.<br /><em>One place.</em></h2><p>Payment state, material evidence, factory video, dispatch proof, inspection and disputes stay attached to the same order.</p></div>
    </section>

    <section className="story-panel panel-finish">
      <div><small>04 / ACCEPTANCE</small><h2>Make it.<br /><em>Move it.</em></h2><p>Delivery is not the finish line. Buyer inspection and acceptance close the transaction before supplier payout becomes eligible.</p><Link href="/dashboard/buyer/demo" className="finish-cta">START A REQUIREMENT ↗</Link></div>
      <div className="finish-metric"><b>₹50K</b><span>PILOT BATCHES</span><b>₹50L+</b><span>INDUSTRIAL CONTRACTS</span><b>48H</b><span>INSPECTION WINDOW</span></div>
    </section>
    <footer className="cinematic-footer"><span>INDUSTRIAL CONNECT</span><span>BUILT FOR INDIAN MANUFACTURING</span><span>© 2026</span></footer>
  </main>;
}
