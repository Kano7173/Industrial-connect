'use client';
import './studio.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Analysis = { name:string; description:string; material:string; processes:string[]; dimensions:string[]; confidence:string; previewType:'shaft'|'flange'|'gear'|'bracket'|'housing'|'plate'|'bolt'|'other'; notes:string[] };

function PartPreview({type}:{type:Analysis['previewType']}) {
  return <svg viewBox="0 0 420 280" className="cap-part-svg" role="img" aria-label={type + ' illustrative 3D preview'}>
    <defs><linearGradient id="capSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef3f0"/><stop offset=".35" stopColor="#aebbb6"/><stop offset=".68" stopColor="#52645a"/><stop offset="1" stopColor="#d5ddd8"/></linearGradient><linearGradient id="capDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b9c7bf"/><stop offset="1" stopColor="#344139"/></linearGradient></defs>
    <ellipse cx="210" cy="225" rx="115" ry="15" fill="#20352a" opacity=".15"/>
    {type==='shaft' && <g transform="translate(42 35) rotate(-15 165 100)"><path d="M35 100 L70 68 L280 68 L315 100 L280 132 L70 132 Z" fill="url(#capSteel)" stroke="#506158" strokeWidth="2"/><path d="M35 100 L35 116 L70 148 L280 148 L315 116 L315 100 L280 132 L70 132 Z" fill="#4d6055"/><path d="M70 68 L70 132 L35 100Z" fill="#d8e1db"/><path d="M280 68 L280 132 L315 100Z" fill="#718379"/><path d="M120 70 L120 134 M140 70 L140 134 M230 70 L230 134" stroke="#f0f4f1" strokeWidth="3" opacity=".55"/></g>}
    {type==='flange' && <g transform="translate(210 135) rotate(-15)"><path d="M-115 -30 L-88 -58 L88 -58 L115 -30 L115 30 L88 58 L-88 58 L-115 30Z" fill="url(#capDark)" transform="translate(0 17)"/><path d="M-115 -30 L-88 -58 L88 -58 L115 -30 L115 30 L88 58 L-88 58 L-115 30Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/><ellipse rx="40" ry="28" fill="#405148" stroke="#e0e7e2" strokeWidth="7"/><ellipse rx="22" ry="15" fill="#17231c"/>{Array.from({length:6},(_,i)=><circle key={i} cx={Math.cos(i*Math.PI/3)*78} cy={Math.sin(i*Math.PI/3)*42} r="6" fill="#34443a" stroke="#e3e9e5" strokeWidth="2"/>)}</g>}
    {type==='gear' && <g transform="translate(210 135) rotate(-15)"><path d="M-20 -95 L20 -95 L27 -70 L48 -60 L70 -72 L90 -48 L77 -25 L85 0 L110 10 L100 40 L73 43 L58 65 L66 90 L40 105 L18 87 L-8 93 L-18 118 L-48 108 L-55 82 L-78 68 L-100 79 L-115 53 L-98 32 L-105 7 L-127 -7 L-114 -34 L-88 -31 L-70 -50 L-74 -76 L-45 -89 L-30 -68Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2" transform="scale(.8)"/><circle r="42" fill="#5a6d61" stroke="#e1e8e3" strokeWidth="7"/><circle r="20" fill="#1c2921" stroke="#aebbb3" strokeWidth="4"/></g>}
    {type==='bracket' && <g transform="translate(105 50)"><path d="M20 15 L160 15 L195 42 L195 154 L160 178 L160 75 L20 75Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/><path d="M20 15 L20 75 L0 96 L0 36Z" fill="#e1e8e3"/><path d="M160 75 L195 42 L195 154 L160 178Z" fill="#53655a"/><ellipse cx="75" cy="45" rx="18" ry="13" fill="#3b4b42" stroke="#d9e2dc" strokeWidth="5"/><ellipse cx="160" cy="128" rx="16" ry="12" fill="#3b4b42" stroke="#d9e2dc" strokeWidth="5"/></g>}
    {type==='housing' && <g transform="translate(210 135)"><path d="M-100 -50 L-65 -82 L50 -82 L100 -50 L100 42 L62 76 L-65 76 L-100 42Z" fill="url(#capDark)" transform="translate(0 15)"/><path d="M-100 -50 L-65 -82 L50 -82 L100 -50 L100 42 L62 76 L-65 76 L-100 42Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/><ellipse cx="-5" cy="-5" rx="46" ry="36" fill="#46584d" stroke="#dce4df" strokeWidth="7"/><ellipse cx="-5" cy="-5" rx="25" ry="18" fill="#1e2922"/><circle cx="-70" cy="38" r="8" fill="#2c3b32" stroke="#e0e7e2" strokeWidth="3"/><circle cx="62" cy="38" r="8" fill="#2c3b32" stroke="#e0e7e2" strokeWidth="3"/></g>}
    {type==='plate' && <g transform="translate(210 135) rotate(-13)"><path d="M-125 -45 L-90 -70 L125 -70 L125 35 L90 60 L-125 60Z" fill="#53655a" transform="translate(0 15)"/><path d="M-125 -45 L-90 -70 L125 -70 L125 35 L90 60 L-125 60Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/>{[-85,85].flatMap(x=>[-35,25].map(y=><circle key={x+'-'+y} cx={x} cy={y} r="9" fill="#33443a" stroke="#e0e7e2" strokeWidth="3"/>))}</g>}
    {type==='bolt' && <g transform="translate(210 135) rotate(-20)"><path d="M-13 -70 L13 -70 L13 70 L-13 70Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/><path d="M-13 25 L13 25 M-13 35 L13 35 M-13 45 L13 45 M-13 55 L13 55" stroke="#4b5d53" strokeWidth="2"/><path d="M-40 -58 L-25 -85 L25 -85 L40 -58 L25 -31 L-25 -31Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/></g>}
    {type==='other' && <g transform="translate(210 135) rotate(-15)"><path d="M-90 -48 L-60 -75 L60 -75 L90 -48 L90 48 L60 75 L-60 75 L-90 48Z" fill="url(#capSteel)" stroke="#52645a" strokeWidth="2"/><circle r="38" fill="#506157" stroke="#dfe7e2" strokeWidth="7"/><circle r="17" fill="#1f2b24"/></g>}
    <text x="210" y="268" textAnchor="middle" fill="#748178" fontSize="9" letterSpacing="2">ILLUSTRATIVE CONCEPT · NOT CAD</text>
  </svg>;
}

export default function CapabilityStudio() {
  const [file,setFile]=useState<File|null>(null);
  const [imageUrl,setImageUrl]=useState('');
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [demo,setDemo]=useState(false);

  useEffect(()=>{if(!file||!file.type.startsWith('image/')){setImageUrl('');return;}const url=URL.createObjectURL(file);setImageUrl(url);return()=>URL.revokeObjectURL(url);},[file]);

  function chooseFile(f?:File) {
    setError('');setAnalysis(null);setDemo(false);
    if(!f)return;
    if(!['application/pdf','image/png','image/jpeg','image/webp'].includes(f.type)){setError('Upload a PDF, PNG, JPG or WEBP drawing.');return;}
    if(f.size>10*1024*1024){setError('File is larger than 10 MB.');return;}
    setFile(f);
  }
  async function analyze() {
    if(!file){setError('Choose a drawing first.');return;}
    setBusy(true);setError('');setAnalysis(null);setDemo(false);
    try {
      const form=new FormData();form.append('drawing',file);
      const res=await fetch('/api/capability/analyze-drawing',{method:'POST',body:form});
      const data=await res.json();
      if(!res.ok)throw new Error(res.status===503?'AI is not connected yet. Add OPENAI_API_KEY to Vercel environment variables and redeploy.':(data.error||'Drawing analysis failed.'));
      setAnalysis(data.analysis as Analysis);
    } catch(e) {setError(e instanceof Error?e.message:'Unable to analyze drawing.');}
    finally{setBusy(false);}
  }
  function previewDemo() {
    if(!file){setError('Choose a drawing first.');return;}
    const label=file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    setAnalysis({name:label||'Precision machined component',description:'Demo only: the name comes from the file name, not AI interpretation of drawing geometry.',material:'Not identified',processes:['Needs drawing analysis'],dimensions:['Not extracted'],confidence:'Demo preview',previewType:'other',notes:['This is a demo label, not a verified engineering interpretation.']});
    setDemo(true);setError('');
  }
  return <main className="app-page cap-studio"><div className="app-shell">
    <div className="app-top"><Link href="/" className="brand"><span className="brand-mark">I</span><span><b>INDUSTRIAL</b> CONNECT</span></Link><span className="app-kicker">AI CAPABILITY STUDIO</span></div>
    <nav className="demo-nav"><Link href="/dashboard/supplier/demo">Supplier dashboard</Link><Link href="/suppliers">Supplier network</Link><Link href="/post-requirement">Buyer RFQ</Link></nav>
    <header className="cap-hero"><div className="app-kicker">DRAWING IN · CAPABILITY OUT</div><h1>Turn old drawings into searchable product profiles.</h1><p>Upload a historical RFQ or engineering drawing. AI identifies the likely component and readable specifications, then creates an illustrative 3D concept for supplier review.</p><div className="cap-steps"><span>01 Upload drawing</span><i>→</i><span>02 Identify part</span><i>→</i><span>03 Review profile</span></div></header>
    <div className="cap-upload-grid">
      <section className="app-card"><div className="app-kicker">01 / SUPPLIER UPLOAD</div><h2>Upload a drawing</h2><p className="cap-muted">PDF, PNG, JPG or WEBP · Maximum 10 MB. The original is not displayed publicly.</p>
        <label className="cap-drop"><input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" onChange={e=>chooseFile(e.target.files?.[0])}/><span className="cap-upload-icon">↑</span><strong>{file?file.name:'Choose technical drawing'}</strong><small>{file?(file.type.split('/').pop()||'FILE').toUpperCase()+' · '+Math.round(file.size/1024)+' KB':'Tap to browse files on your device'}</small></label>
        {file&&<div className="cap-selected"><span>FILE</span><b>{file.name}</b><button type="button" onClick={()=>{setFile(null);setAnalysis(null);setError('');}}>Remove</button></div>}
        {error&&<div className="cap-error" role="alert">{error}</div>}
        <div className="cap-actions"><button className="button button-accent" disabled={!file||busy} onClick={analyze}>{busy?'Analyzing drawing…':'✦ Analyze with AI'}</button><button className="button button-outline" disabled={!file||busy} onClick={previewDemo}>Preview demo UI</button></div>
        <p className="cap-footnote">Real AI analysis requires the server-side OPENAI_API_KEY environment variable. Demo preview only uses the filename.</p>
      </section>
      <section className="app-card"><div className="cap-preview-head"><div><div className="app-kicker">02 / DRAWING PREVIEW</div><h2>Uploaded file</h2></div><span className="cap-status">{file?'READY':'WAITING'}</span></div>
        {imageUrl?<img className="cap-drawing-image" src={imageUrl} alt="Uploaded drawing preview"/>:<div className="cap-drawing-empty"><span>{file?'PDF':'＋'}</span><b>{file?'PDF selected':'Your drawing preview appears here'}</b><small>{file?'PDF page preview is not rendered in this browser preview.':'Original drawings remain private until supplier approval.'}</small></div>}
        {file&&<div className="cap-file-meta"><span>FILE</span><b>{file.name}</b></div>}
      </section>
    </div>
    {analysis&&<section className="cap-results"><div className="cap-result-head"><div><div className="app-kicker">03 / COMPONENT IDENTIFICATION</div><h2>{analysis.name}</h2><p>{analysis.description}</p></div><span className={demo?'cap-status cap-demo':'cap-status cap-ai'}>{demo?'DEMO LABEL':'AI ANALYSIS'}</span></div>
      <div className="cap-result-grid"><section className="app-card"><div className="cap-preview-head"><div><div className="app-kicker">GENERATED VISUAL</div><h2>3D concept preview</h2></div><span className="cap-status">CONCEPT</span></div><PartPreview type={analysis.previewType}/><p className="cap-footnote">Stylized category illustration only—not a dimensionally accurate CAD model. Do not use for manufacturing or quality approval.</p></section>
        <section className="app-card"><div className="app-kicker">EXTRACTED CAPABILITIES</div><div className="cap-detail"><span>Material</span><b>{analysis.material||'Not identified'}</b></div><div className="cap-detail"><span>Manufacturing processes</span><b>{analysis.processes?.join(', ')||'Needs review'}</b></div><div className="cap-detail"><span>Dimensions / tolerances</span><b>{analysis.dimensions?.join(' · ')||'Not extracted'}</b></div><div className="cap-detail"><span>Confidence</span><b>{analysis.confidence||'Needs supplier review'}</b></div><div className="cap-notes"><b>Review before publishing</b><ul>{analysis.notes?.map((n,i)=><li key={i}>{n}</li>)}</ul></div><button className="button button-dark cap-publish" onClick={()=>setError('Preview only: profile saving and publishing require database and supplier-authentication wiring.')}>Review capability profile →</button><p className="cap-footnote">Nothing is published automatically. Saving profiles and buyer matching are not connected yet.</p></section>
      </div>
    </section>}
    <footer className="cap-privacy">PRIVATE BY DEFAULT <span>•</span> SUPPLIER REVIEW REQUIRED <span>•</span> TECHNICAL DRAWINGS STAY CONFIDENTIAL</footer>
  </div></main>;
}
