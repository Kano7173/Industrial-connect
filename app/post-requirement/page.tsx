'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const categories = ['CNC Turning','CNC Milling / VMC','Investment Casting','Fabrication','Laser Cutting','Sheet Metal','Grinding','Forging','Die Casting','Injection Moulding','Heat Treatment','Machinery Job Work'];

export default function PostRequirement() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [form, setForm] = useState({company:'',name:'',email:'',phone:'',category:'CNC Turning',quantity:'',material:'',location:'',targetDate:'',drawing:'',description:''});

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = 'RFQ-' + Math.floor(1000 + Math.random() * 9000);
    const item = { id, title: form.description || form.category + ' requirement', category: form.category, location: form.location || 'India', quantity: form.quantity || 'To be confirmed', material: form.material || 'To be confirmed', createdAt: 'Just now', company: form.company, contact: form.name, email: form.email, phone: form.phone, targetDate: form.targetDate, drawing: form.drawing, description: form.description };
    try {
      const existing = JSON.parse(localStorage.getItem('rfqworks_rfqs') || '[]');
      localStorage.setItem('rfqworks_rfqs', JSON.stringify([item, ...(Array.isArray(existing) ? existing : [])]));
    } catch {}
    setSubmitted(id);
  };

  if (submitted) return <main className="app-page"><div className="app-shell"><div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><Link href="/rfqs" className="text-link">RFQ board →</Link></div><div className="app-card success-box"><strong>Requirement published: {submitted}</strong><span>Your RFQ is saved in this browser demo and is now visible on the RFQ board. In production, this step would route the requirement to matched suppliers.</span><div className="form-actions"><Link href="/rfqs" className="button button-dark">View RFQ board →</Link><Link href="/dashboard/buyer/demo" className="button button-outline">Open buyer workspace</Link><button className="button button-outline" onClick={() => setSubmitted(null)}>Create another</button></div></div></div></main>;

  return <main className="app-page"><div className="app-shell">
    <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">R</span><span><b>RFQ</b>WORKS</span></Link><Link href="/dashboard/buyer/demo" className="text-link">Working demo →</Link></div>
    <div className="app-card"><div className="app-kicker">BUYER WORKSPACE / NEW REQUIREMENT</div><h1>Tell us what<br /><em>you need made.</em></h1><p className="order-note">Add the commercial and technical information a manufacturer needs to quote accurately. This browser demo stores your requirement locally so you can test the complete flow.</p>
      <form onSubmit={submit} className="form-grid" style={{marginTop:28}}>
        <div className="form-field"><label>Company *</label><input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company name" /></div>
        <div className="form-field"><label>Contact person *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" /></div>
        <div className="form-field"><label>Work email *</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@company.com" /></div>
        <div className="form-field"><label>Phone *</label><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91" /></div>
        <div className="form-field"><label>Manufacturing process *</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="form-field"><label>Quantity / frequency *</label><input required value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="e.g. 5,000 pcs / month" /></div>
        <div className="form-field"><label>Material</label><input value={form.material} onChange={e=>setForm({...form,material:e.target.value})} placeholder="e.g. EN8, SS304, Al 6061" /></div>
        <div className="form-field"><label>Delivery location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Ahmedabad, Gujarat" /></div>
        <div className="form-field"><label>Target delivery</label><input type="date" value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})} /></div>
        <div className="form-field"><label>Drawing / specification link</label><input type="url" value={form.drawing} onChange={e=>setForm({...form,drawing:e.target.value})} placeholder="https://..." /></div>
        <div className="form-field full"><label>Requirement details *</label><textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Dimensions, tolerances, finish, inspection requirements, packaging, commercial notes..." /></div>
        <div className="form-actions full"><button className="button button-dark button-large" type="submit">Publish requirement →</button><Link href="/" className="button button-outline">Cancel</Link></div>
      </form>
    </div>
  </div></main>;
}
