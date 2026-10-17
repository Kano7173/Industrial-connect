'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const stages = [
  ['01','KYC / Verification','Identity, business and bank checks'],
  ['02','Risk Engine','Risk score and transaction limits'],
  ['03','RFQ Quality','Completeness and specification check'],
  ['04','Supplier Matching','Capability + capacity matching'],
  ['05','Controlled Messaging','Masked communication + audit'],
  ['06','Quote','Structured quotation comparison'],
  ['07','PO / Contract','Commercial acceptance + terms'],
  ['08','Transaction Passport','Single evidence chain'],
  ['09','Payment Workflow','Demo protected-payment state'],
  ['10','Production Evidence','Milestones + proof'],
  ['11','QC / Inspection','Quality acceptance evidence'],
  ['12','Logistics','Dispatch + tracking + POD'],
  ['13','Delivery','Acceptance / rejection'],
  ['14','Dispute','Evidence-based resolution'],
  ['15','Payout','Demo release eligibility'],
  ['16','Commission','IC fee ledger'],
  ['17','Reputation','Buyer + supplier scores'],
] as const;

const suppliers = [
  {name:'Precision Motion Works',city:'Rajkot',cap:98,capacity:82,quality:96,delivery:94,risk:'LOW',quote:1820000},
  {name:'Shree CastTech Industries',city:'Rajkot',cap:94,capacity:64,quality:93,delivery:91,risk:'LOW',quote:1890000},
  {name:'Apex Fab Systems',city:'Ahmedabad',cap:87,capacity:71,quality:89,delivery:96,risk:'LOW',quote:1940000},
];

export default function TransactionLab(){
  const [stage,setStage]=useState(0);
  const [role,setRole]=useState<'buyer'|'supplier'|'admin'>('buyer');
  const [rfq,setRfq]=useState({title:'Precision EN8 shaft batch',qty:'10000',material:'EN8',tolerance:'±0.02 mm',city:'Ahmedabad',days:'25'});
  const [selected,setSelected]=useState(0);
  const [messages,setMessages]=useState<string[]>([]);
  const [approved,setApproved]=useState(false);
  const [toast,setToast]=useState('');
  const supplier=suppliers[selected];
  const overall=useMemo(()=>Math.round((supplier.cap+supplier.capacity+supplier.quality+supplier.delivery)/4),[supplier]);
  const notify=(x:string)=>{setToast(x);window.setTimeout(()=>setToast(''),1800)};
  const next=()=>{setStage(s=>Math.min(stages.length-1,s+1));notify(`Stage ${String(Math.min(stages.length,stage+2)).padStart(2,'0')} unlocked`)};
  const previous=()=>setStage(s=>Math.max(0,s-1));
  const reset=()=>{setStage(0);setApproved(false);setMessages([]);notify('Demo transaction reset')};

  return <main className="lab-page">
    <header className="lab-nav"><Link href="/" className="lab-brand"><b>IC</b><span>INDUSTRIAL CONNECT</span><small>TRANSACTION LAB · TEMPORARY MODE</small></Link><div className="lab-nav-actions"><Link href="/trust-center">Trust Center</Link><Link href="/control-center">Control Tower</Link><button onClick={reset}>Reset demo</button></div></header>
    <section className="lab-hero"><div><span>END-TO-END WORKFLOW SIMULATOR</span><h1>Run a complete industrial transaction without risking real money.</h1><p>This temporary environment demonstrates the complete buyer → supplier → QC → logistics → payout lifecycle. No real KYC, payment or bank movement occurs here.</p></div><div className="lab-badge"><b>{stage+1}/17</b><span>ACTIVE STAGE</span></div></section>
    <section className="lab-layout">
      <aside className="lab-steps">{stages.map((s,i)=><button key={s[0]} className={`${i===stage?'active ':''}${i<stage?'done':''}`} onClick={()=>setStage(i)}><b>{s[0]}</b><span>{s[1]}</span><small>{s[2]}</small></button>)}</aside>
      <section className="lab-workspace">
        <div className="lab-toolbar"><div><span>ACTOR MODE</span><div className="role-switch">{(['buyer','supplier','admin'] as const).map(r=><button key={r} className={role===r?'active':''} onClick={()=>setRole(r)}>{r}</button>)}</div></div><div className="lab-score"><span>TRANSACTION RISK</span><b>LOW · 12/100</b></div></div>
        <div className="lab-card">
          {stage===0&&<><StageTitle n="01" title="KYC / Verification" text="Temporary verification simulation. Production mode will connect approved verification providers instead of treating uploaded documents as proof."/><div className="verification-grid"><Verify title="Business identity" value="GST / company details" status="PASS"/><Verify title="Authorized person" value="OTP + authorization" status="PASS"/><Verify title="Bank beneficiary" value="Name match required" status="PASS"/><Verify title="Factory / capability" value="Evidence review" status="REVIEW"/></div></>}
          {stage===1&&<><StageTitle n="02" title="Risk Engine" text="Rules combine identity, behaviour, disputes, document status and transaction value. High-risk users are restricted instead of simply being warned."/><div className="risk-score"><b>12</b><span>/100 RISK</span><i style={{width:'12%'}}/></div><div className="rule-list">{['Verified business identity','No duplicate bank identity','No unresolved disputes','Order value inside temporary limit','No abnormal RFQ behaviour'].map(x=><p key={x}>✓ {x}</p>)}</div></>}
          {stage===2&&<><StageTitle n="03" title="RFQ Quality" text="AI-style temporary scoring checks whether the buyer has provided enough information for a reliable quotation."/><div className="rfq-form"><label>Requirement<input value={rfq.title} onChange={e=>setRfq({...rfq,title:e.target.value})}/></label><label>Quantity<input value={rfq.qty} onChange={e=>setRfq({...rfq,qty:e.target.value})}/></label><label>Material<input value={rfq.material} onChange={e=>setRfq({...rfq,material:e.target.value})}/></label><label>Tolerance<input value={rfq.tolerance} onChange={e=>setRfq({...rfq,tolerance:e.target.value})}/></label><label>Delivery city<input value={rfq.city} onChange={e=>setRfq({...rfq,city:e.target.value})}/></label><label>Days<input value={rfq.days} onChange={e=>setRfq({...rfq,days:e.target.value})}/></label></div><div className="quality-score"><b>96/100</b><span>RFQ QUALITY</span><p>✓ quantity · ✓ material · ✓ tolerance · ✓ delivery · ✓ timeline</p></div></>}
          {stage===3&&<><StageTitle n="04" title="Automatic Supplier Matching" text="Matching is based on technical capability, available capacity, quality history, delivery performance and risk—not paid ranking."/><div className="match-list">{suppliers.map((s,i)=><button key={s.name} className={i===selected?'selected':''} onClick={()=>setSelected(i)}><div><b>{s.name}</b><span>{s.city} · capability {s.cap}% · capacity {s.capacity}%</span></div><strong>{Math.round((s.cap+s.capacity+s.quality+s.delivery)/4)}<small>IC MATCH</small></strong></button>)}</div></>}
          {stage===4&&<><StageTitle n="05" title="Controlled Messaging" text="Temporary mode stores messages in the browser session. Production mode should keep transaction communication inside the platform with contractual anti-circumvention terms."/><div className="chat-box">{messages.length===0?<p className="muted">No messages yet. Contact details remain masked in this demo.</p>:messages.map((m,i)=><p key={i}><b>{i%2?'Supplier':'Buyer'}</b>{m}</p>)}</div><div className="message-row"><input id="demo-message" placeholder="Ask about lead time, capacity or technical clarification..."/><button onClick={()=>{const el=document.getElementById('demo-message') as HTMLInputElement;if(el.value){setMessages([...messages,el.value]);el.value='';notify('Message recorded in transaction audit')}}}>Send & audit</button></div></>}
          {stage===5&&<><StageTitle n="06" title="Structured Quote" text="Every quote carries price, lead time, validity, payment terms, quality terms and delivery assumptions."/><div className="quote-main"><div><span>SELECTED SUPPLIER</span><h2>{supplier.name}</h2><p>Quote validity · 7 days</p></div><b>₹{supplier.quote.toLocaleString('en-IN')}<small>+ applicable taxes</small></b></div><div className="quote-facts"><Fact a="Lead time" b="22 days"/><Fact a="Quality" b={`${supplier.quality}/100`}/><Fact a="Delivery" b={`${supplier.delivery}/100`}/><Fact a="IC match" b={`${overall}/100`}/></div></>}
          {stage===6&&<><StageTitle n="07" title="PO / Contract" text="Temporary mode simulates acceptance. Production mode should generate a versioned PO and legally reviewed terms before order activation."/><div className="contract"><p><b>Buyer:</b> Verified Industrial Buyer</p><p><b>Supplier:</b> {supplier.name}</p><p><b>Scope:</b> {rfq.qty} × {rfq.title}</p><p><b>Commercial:</b> ₹{supplier.quote.toLocaleString('en-IN')} + applicable taxes</p><p><b>Delivery:</b> {rfq.days} days · {rfq.city}</p><button className={approved?'approved':''} onClick={()=>{setApproved(true);notify('Commercial acceptance recorded')}}>{approved?'✓ Accepted':'Accept demo PO'}</button></div></>}
          {stage===7&&<><StageTitle n="08" title="Transaction Passport" text="Every critical event is linked to one transaction ID so evidence cannot be scattered across emails and chats."/><div className="passport-id"><span>TRANSACTION ID</span><b>IC-DEMO-2026-00184</b><small>Created now · Buyer verified · Supplier matched · PO pending/accepted</small></div><div className="event-grid">{['RFQ created','Verification passed','Risk scored','Supplier matched','Quote recorded','PO accepted'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span><small>audited</small></div>)}</div></>}
          {stage===8&&<><StageTitle n="09" title="Payment-Provider Workflow" text="Demo only: no money moves. The real version should use a properly structured payment provider/partner and never pretend Industrial Connect itself is a bank or escrow institution."/><div className="payment-flow"><Pay x="Buyer payment initiated" active/><Pay x="Provider confirms funds state" active/><Pay x="Order milestone reached"/><Pay x="QC / delivery condition"/><Pay x="Supplier payout eligible"/></div></>}
          {stage===9&&<><StageTitle n="10" title="Production Evidence" text="Supplier records manufacturing milestones with timestamps and evidence attached to the transaction passport."/><div className="milestones">{['Raw material received','Production started','50% production','Final production','Packing ready'].map((x,i)=><button key={x} onClick={()=>notify(`${x} recorded with timestamp`)}><b>{i+1}</b><span>{x}</span><small>＋ evidence</small></button>)}</div></>}
          {stage===10&&<><StageTitle n="11" title="QC / Inspection" text="Temporary QC simulation. Production version can connect independent inspectors and structured measurement evidence."/><div className="qc-grid"><Verify title="Quantity" value={`${rfq.qty} pcs`} status="PASS"/><Verify title="Dimension" value={rfq.tolerance} status="PASS"/><Verify title="Material" value={rfq.material} status="PENDING"/><Verify title="Certificate" value="MTC / report" status="PENDING"/></div></>}
          {stage===11&&<><StageTitle n="12" title="Logistics" text="Dispatch, LR/tracking, carrier, estimated arrival and POD are tied to the transaction passport."/><div className="logistics-card"><span>SHIPMENT IC-SHP-00918</span><h2>Rajkot → Ahmedabad</h2><p>Carrier: Demo Industrial Logistics · ETA: 2 days</p><div className="track"><i/><i/><i/><i/></div><small>Booked → Picked up → In transit → Delivered</small></div></>}
          {stage===12&&<><StageTitle n="13" title="Delivery & Acceptance" text="Buyer acceptance is structured. Rejection requires a reason and evidence instead of an unrestricted refund claim."/><div className="accept-grid"><button onClick={()=>notify('Delivery accepted; payout eligibility unlocked')}>✓ Accept delivery</button><button onClick={()=>notify('Rejection requires evidence and opens dispute review')}>Open quality rejection</button></div></>}
          {stage===13&&<><StageTitle n="14" title="Dispute" text="Disputes use specification → evidence → inspection → decision. The system keeps the transaction state visible to both sides."/><div className="dispute-card"><b>DEMO DISPUTE: QUALITY CLAIM</b><p>Buyer alleges dimension variance. Required evidence: drawing, measured sample, inspection report, photos and shipment batch.</p><button onClick={()=>notify('Dispute evidence request created')}>Request evidence</button></div></>}
          {stage===14&&<><StageTitle n="15" title="Payout Eligibility" text="Temporary state only. Real payout release depends on the configured payment provider, contract and applicable legal structure."/><div className="payout"><b>ELIGIBLE</b><span>Order accepted · dispute clear · QC complete</span><strong>₹{supplier.quote.toLocaleString('en-IN')}</strong><button onClick={()=>notify('Demo payout event recorded')}>Record demo release</button></div></>}
          {stage===15&&<><StageTitle n="16" title="Commission Ledger" text="Commission is attributed to the transaction passport rather than a manually editable spreadsheet."/><div className="commission"><span>ORDER VALUE</span><b>₹{supplier.quote.toLocaleString('en-IN')}</b><span>DEMO IC FEE · 2%</span><strong>₹{Math.round(supplier.quote*.02).toLocaleString('en-IN')}</strong><small>Pending provider settlement in production</small></div></>}
          {stage===16&&<><StageTitle n="17" title="Reputation Update" text="Completed outcomes feed buyer and supplier reputation. Paid plans cannot purchase transaction reputation."/><div className="reputation"><div><span>SUPPLIER IC SCORE</span><b>{Math.min(100,overall+1)}</b><p>+ quality · + delivery · + accepted order</p></div><div><span>BUYER RELIABILITY</span><b>94</b><p>+ complete RFQ · + accepted delivery</p></div></div></>}
        </div>
        <div className="lab-footer"><button onClick={previous} disabled={stage===0}>← Previous</button><span>Stage {stage+1} of {stages.length}</span><button onClick={next} disabled={stage===stages.length-1}>{stage===stages.length-1?'Completed':'Next stage →'}</button></div>
      </section>
    </section>
    {toast&&<div className="lab-toast">✓ {toast}</div>}
  </main>
}

function StageTitle({n,title,text}:{n:string;title:string;text:string}){return <div className="stage-title"><span>{n}</span><div><h2>{title}</h2><p>{text}</p></div></div>}
function Verify({title,value,status}:{title:string;value:string;status:string}){return <article className="verify"><b>{status==='PASS'?'✓':'!'}</b><div><strong>{title}</strong><span>{value}</span></div><small>{status}</small></article>}
function Fact({a,b}:{a:string;b:string}){return <div><span>{a}</span><b>{b}</b></div>}
function Pay({x,active}:{x:string;active?:boolean}){return <div className={active?'pay active':'pay'}><b>{active?'✓':'○'}</b><span>{x}</span></div>}
