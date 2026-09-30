'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const processes=['CNC Turning','CNC Milling / VMC','Investment Casting','Fabrication','Laser Cutting','Sheet Metal','Grinding','Forging','Die Casting','Injection Moulding','Machinery Job Work'];
const menu=['Company profile','RFQ inbox','My quotes','Orders','Machines & capacity','Products & services','Certificates & documents','Payments & payouts','Performance','Support'];

export default function SupplierJoin(){
 const [done,setDone]=useState(false);
 const [form,setForm]=useState({company:'',contact:'',phone:'',email:'',city:'Rajkot',gst:'',process:'CNC Turning',machines:'',capacity:'',about:''});
 const submit=(e:FormEvent)=>{e.preventDefault();try{localStorage.setItem('rfqworks_supplier_profile',JSON.stringify(form))}catch{}setDone(true)};
 if(done)return <main className="app-page"><div className="app-shell"><div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><Link href="/suppliers" className="text-link">Manufacturer network →</Link></div><div className="app-card success-box"><strong>Supplier onboarding started.</strong><span>Your profile details are saved on this device for this preview. In the live workflow, the next stages are business verification, capability review and then access to relevant RFQs.</span><div className="form-actions"><Link href="/dashboard/supplier/demo" className="button button-dark">Open supplier workspace →</Link><Link href="/rfqs" className="button button-outline">See RFQ board</Link></div></div></div></main>;
 return <main className="app-page"><div className="app-shell">
  <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><span className="app-kicker">SUPPLIER ONBOARDING</span></div>
  <div className="app-card"><div className="app-kicker">SUPPLIER ONBOARDING / GUJARAT FIRST</div><h1>Build your factory profile.<br/><em>Then win relevant work.</em></h1><p className="order-note">Tell RFQWorks what your factory can actually produce. Your profile becomes the foundation for matching, quoting and a professional buyer-facing supplier record.</p>
   <div className="supplier-onboarding-layout">
    <form onSubmit={submit} className="form-grid">
     <div className="form-field"><label>Company legal / trade name *</label><input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Your company name"/></div>
     <div className="form-field"><label>Contact person *</label><input required value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Owner / sales / production"/></div>
     <div className="form-field"><label>Business email *</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="sales@company.com"/></div>
     <div className="form-field"><label>Phone / WhatsApp *</label><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91"/></div>
     <div className="form-field"><label>Factory city *</label><input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Rajkot / Ahmedabad / Vadodara"/></div>
     <div className="form-field"><label>GSTIN</label><input value={form.gst} onChange={e=>setForm({...form,gst:e.target.value})} placeholder="GSTIN"/></div>
     <div className="form-field"><label>Primary capability *</label><select value={form.process} onChange={e=>setForm({...form,process:e.target.value})}>{processes.map(x=><option key={x}>{x}</option>)}</select></div>
     <div className="form-field"><label>Machine list</label><input value={form.machines} onChange={e=>setForm({...form,machines:e.target.value})} placeholder="e.g. 8 CNC, 4 VMC, CMM"/></div>
     <div className="form-field full"><label>Available capacity</label><input value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} placeholder="e.g. 10,000 pcs/month or 2 machines available"/></div>
     <div className="form-field full"><label>What do you want to manufacture?</label><textarea value={form.about} onChange={e=>setForm({...form,about:e.target.value})} placeholder="Materials, sizes, tolerances, industries served, special processes, certifications..."/></div>
     <div className="form-actions full"><button className="button button-accent button-large">Create manufacturer profile →</button><Link href="/" className="button button-outline">Back</Link></div>
    </form>
    <aside className="supplier-menu-preview"><div className="app-kicker">YOUR SUPPLIER MENU</div>{menu.map((x,i)=><div key={x} className={i===0?'supplier-menu-item active':'supplier-menu-item'}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span><i>→</i></div>)}</aside>
   </div>
  </div>
 </div></main>
}
