'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const checks = [
  ['GST / business identity', 'Every organization must pass business-identity verification before protected transactions.', 'VERIFIED'],
  ['PAN / legal identity', 'Legal entity and authorized representative information is captured and re-verification is scheduled.', 'VERIFIED'],
  ['Bank beneficiary', 'Payment beneficiary name is checked before payout eligibility; mismatches trigger a hold.', 'LOCKED'],
  ['Factory / capability', 'Machines, capability evidence, certificates and capacity are separated from marketing claims.', 'VERIFIED'],
  ['Risk engine', 'New accounts, duplicate identities, abnormal behaviour and dispute patterns receive risk signals.', 'ACTIVE'],
  ['Transaction passport', 'RFQ, quote, PO, payment, production, QC, logistics, delivery and dispute evidence stay connected.', 'ACTIVE'],
];

const supplierRows = [
  ['Precision Motion Works', 'Rajkot', 'CNC Turning · VMC', '94', 'LOW', '82%'],
  ['Shree CastTech Industries', 'Rajkot', 'Investment Casting', '91', 'LOW', '64%'],
  ['Apex Fab Systems', 'Ahmedabad', 'Laser · Bending · Welding', '88', 'LOW', '71%'],
  ['Vertex Engineering', 'Vadodara', 'CNC Milling · Grinding', '86', 'MEDIUM', '55%'],
];

export default function TrustCenter() {
  const [tab, setTab] = useState<'overview'|'supplier'|'buyer'|'transaction'>('overview');
  const [strict, setStrict] = useState(true);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => supplierRows.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase())), [query]);
  const notify = (message:string) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };

  return <main className="trust-page">
    <header className="trust-nav">
      <Link href="/" className="trust-brand"><span>IC</span><b>INDUSTRIAL CONNECT</b><small>TRUST INFRASTRUCTURE</small></Link>
      <div className="trust-nav-actions"><Link href="/transaction-lab">Transaction Lab</Link><Link href="/control-center">Control Tower</Link><button onClick={() => notify(strict ? 'Strict transaction protection is enabled.' : 'Standard protection is enabled.')}>{strict ? '● Strict mode' : '○ Standard mode'}</button></div>
    </header>

    <section className="trust-hero">
      <div>
        <span className="trust-eyebrow">INDUSTRIAL CONNECT / TRUST & RISK</span>
        <h1>Make every industrial transaction <em>verifiable.</em></h1>
        <p>Identity, capability, capacity, commercial evidence, quality, logistics and dispute history are connected into one controlled transaction graph.</p>
        <div className="trust-hero-actions"><button className="trust-primary" onClick={() => setTab('transaction')}>View transaction protection →</button><Link href="/transaction-lab" className="trust-secondary">Run full transaction demo →</Link></div>
      </div>
      <div className="trust-ring"><div><strong>96</strong><span>TRUST<br/>POSTURE</span></div><i>IDENTITY</i><i>CAPACITY</i><i>QUALITY</i><i>PAYMENT</i><i>DELIVERY</i></div>
    </section>

    <section className="trust-tabs">
      {([['overview','Overview'],['supplier','Supplier protection'],['buyer','Buyer protection'],['transaction','Transaction protection']] as const).map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={() => setTab(key)}>{label}</button>)}
    </section>

    {tab==='overview' && <>
      <section className="trust-stats">
        <Stat value="100%" label="Protected transaction objects" note="RFQ → order → evidence" />
        <Stat value="7" label="Verification dimensions" note="Identity · bank · factory · capability" />
        <Stat value="5" label="Risk levels" note="Low → medium → high → critical → blocked" />
        <Stat value="0" label="Silent status changes" note="Audit trail required" />
      </section>
      <section className="trust-grid">
        <div className="trust-panel"><div className="trust-panel-head"><div><span className="trust-eyebrow">CONTROL LAYER</span><h2>Fraud prevention stack</h2></div><span className="trust-live">● LIVE DESIGN</span></div><div className="trust-checks">{checks.map(([name,desc,status]) => <article key={name}><div className="check-icon">✓</div><div><h3>{name}</h3><p>{desc}</p></div><b>{status}</b></article>)}</div></div>
        <div className="trust-panel risk-panel"><span className="trust-eyebrow">RISK ENGINE</span><h2>Automatic risk response</h2><RiskRow label="Verified identity" score="LOW" width="91%"/><RiskRow label="Bank mismatch" score="BLOCK" width="100%"/><RiskRow label="Repeated disputes" score="REVIEW" width="62%"/><RiskRow label="Capacity inconsistency" score="REVIEW" width="44%"/><RiskRow label="Document expiry" score="REVERIFY" width="28%"/><div className="strict-box"><div><b>Strict transaction protection</b><span>High-risk parties cannot progress to protected orders.</span></div><button className={strict?'on':''} onClick={() => setStrict(!strict)}><i/></button></div></div>
      </section>
    </>}

    {tab==='supplier' && <section className="trust-section"><div className="trust-section-head"><div><span className="trust-eyebrow">SUPPLIER CAPABILITY PASSPORT</span><h2>Trust is earned from transactions, not subscriptions.</h2><p>Commercial plans can unlock workflow tools; they cannot buy verification, quality or delivery reputation.</p></div><div className="trust-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search suppliers..."/></div></div><div className="supplier-table"><div className="supplier-head"><span>SUPPLIER</span><span>LOCATION</span><span>CAPABILITY</span><span>IC SCORE</span><span>RISK</span><span>CAPACITY</span></div>{filtered.map(r=><div className="supplier-row" key={r[0]}><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><b>{r[3]}</b><span className={r[4]==='LOW'?'risk-low':'risk-med'}>{r[4]}</span><span>{r[5]}</span></div>)}</div><div className="passport-grid"><Passport title="Capability Passport" items={['Machines & serial evidence','Materials / tolerances','Certificates & expiry','Historical delivery']} /><Passport title="Anti-fraud controls" items={['Bank beneficiary match','Duplicate identity detection','Factory verification','Risk-based order limits']} /><Passport title="Performance proof" items={['Quality acceptance','On-time delivery','Quote accuracy','Dispute history']} /></div></section>}

    {tab==='buyer' && <section className="trust-section"><div className="trust-section-head"><div><span className="trust-eyebrow">BUYER RELIABILITY ENGINE</span><h2>Protect suppliers from bad demand too.</h2><p>Every buyer gets a reliability profile based on completed transactions, payment behaviour, RFQ quality and fair dispute outcomes.</p></div></div><div className="buyer-grid"><BuyerCard title="Identity" value="98" detail="GST · PAN · authorized user"/><BuyerCard title="RFQ quality" value="93" detail="Specifications are complete"/><BuyerCard title="Payment reliability" value="96" detail="On-time settlement history"/><BuyerCard title="Dispute behaviour" value="91" detail="Evidence-based cases"/></div><div className="two-column"><Policy title="Before supplier access" list={['Verify organization identity','Score RFQ completeness','Apply spend / order limits','Mask direct contact details']} /><Policy title="Before order acceptance" list={['Confirm authorized buyer','Accept commercial terms','Create transaction passport','Record cancellation policy']} /></div></section>}

    {tab==='transaction' && <section className="trust-section"><div className="trust-section-head"><div><span className="trust-eyebrow">TRANSACTION PASSPORT</span><h2>One evidence chain from RFQ to delivery.</h2><p>The platform orchestrates the workflow; regulated payment custody remains with the configured payment provider or financial partner.</p></div></div><div className="passport-flow">{['Buyer verified','RFQ quality 96','Supplier matched','Quote accepted','PO signed','Payment protected','Production evidence','Independent QC','Shipment + POD','Acceptance / payout','Commission ledger'].map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b>{i<10&&<i>→</i>}</div>)}</div><div className="protection-grid"><Protection title="No silent edits" text="Critical state changes require an authenticated actor and an audit event."/><Protection title="No blind payout" text="Supplier payout eligibility depends on payment state, order state and dispute status."/><Protection title="No fake QC" text="Inspection reports, evidence hashes and timestamps remain attached to the order."/><Protection title="No commission ambiguity" text="RFQ, supplier match, PO and transaction passport establish attribution."/></div></section>}

    <footer className="trust-footer"><span>INDUSTRIAL CONNECT</span><p>Fraud-resistant by design. Not a guarantee against every form of fraud; high-value transactions should use appropriate contracts, regulated payment partners and independent inspection where required.</p></footer>
    {toast && <div className="trust-toast">✓ {toast}</div>}
  </main>;
}

function Stat({value,label,note}:{value:string;label:string;note:string}){return <article className="trust-stat"><b>{value}</b><strong>{label}</strong><span>{note}</span></article>}
function RiskRow({label,score,width}:{label:string;score:string;width:string}){return <div className="risk-row"><div><span>{label}</span><b>{score}</b></div><div><i style={{width}}/></div></div>}
function Passport({title,items}:{title:string;items:string[]}){return <article className="passport"><span className="trust-eyebrow">MODULE</span><h3>{title}</h3>{items.map(x=><p key={x}>✓ {x}</p>)}</article>}
function BuyerCard({title,value,detail}:{title:string;value:string;detail:string}){return <article className="buyer-card"><span>{title}</span><b>{value}<small>/100</small></b><p>{detail}</p></article>}
function Policy({title,list}:{title:string;list:string[]}){return <article className="policy"><h3>{title}</h3>{list.map(x=><p key={x}>✓ {x}</p>)}</article>}
function Protection({title,text}:{title:string;text:string}){return <article className="protection"><div>✓</div><h3>{title}</h3><p>{text}</p></article>}
