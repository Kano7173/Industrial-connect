'use client';

import { useState } from 'react';

type Analysis = {
  partName: string; partType: string; manufacturingProcess: string[]; material: string;
  materialStandard: string; quantity: string; dimensions: string[]; tolerances: string[];
  surfaceFinish: string[]; threads: string[]; heatTreatment: string[];
  inspectionRequirements: string[]; drawingRevision: string; drawingNumber: string;
  estimatedComplexity: string; confidence: number; missingInformation: string[];
  supplierChecklist: string[]; rfqSummary: string;
};

const labels: [keyof Analysis, string][] = [
  ['partName','Part name'], ['partType','Part type'], ['material','Material'], ['materialStandard','Material standard'],
  ['quantity','Quantity'], ['drawingNumber','Drawing number'], ['drawingRevision','Revision'], ['estimatedComplexity','Complexity'],
];

export default function AiDrawingAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!file) return;
    setLoading(true); setError(''); setAnalysis(null);
    const body = new FormData(); body.append('file', file);
    try {
      const res = await fetch('/api/ai/drawing-analyzer', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed'); }
    finally { setLoading(false); }
  }

  const list = (title: string, values?: string[]) => values?.length ? <div style={{marginTop:16}}><b>{title}</b><ul style={{margin:'6px 0 0 18px'}}>{values.map((v,i)=><li key={i}>{v}</li>)}</ul></div> : null;

  return <section className="dash-card" style={{border:'1px solid #26374a', background:'linear-gradient(145deg,#101b29,#0c151f)'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start',flexWrap:'wrap'}}>
      <div><small style={{letterSpacing:1.5,color:'#63b3ff'}}>INDUSTRIALCONNECT AI</small><h2 style={{margin:'5px 0'}}>Drawing → RFQ in seconds</h2><p style={{color:'#9fb0c1',marginTop:0}}>Upload a PDF or photo. Gemini reads the drawing and prepares the information a supplier needs to quote.</p></div>
      <span style={{padding:'6px 10px',borderRadius:999,background:'#12301f',color:'#7ee2a8',fontSize:12}}>FREE-TIER READY</span>
    </div>
    <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginTop:12}}>
      <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)} style={{maxWidth:360}} />
      <button className="primary" type="button" disabled={!file||loading} onClick={analyze}>{loading?'Analyzing drawing…':'Analyze drawing →'}</button>
      {file && <small style={{color:'#91a4b7'}}>{file.name} · {(file.size/1024/1024).toFixed(2)} MB</small>}
    </div>
    {error && <div style={{marginTop:14,padding:12,borderRadius:8,background:'#35191d',color:'#ffb4b4'}}>{error}</div>}
    {analysis && <div style={{marginTop:20,paddingTop:18,borderTop:'1px solid #26374a'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><small>AI IDENTIFICATION</small><h3 style={{margin:'4px 0'}}>{analysis.partName}</h3></div><strong style={{color:'#7ee2a8'}}>{analysis.confidence}% confidence</strong></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:12}}>{labels.map(([k,l])=><div key={String(k)} style={{padding:10,border:'1px solid #26374a',borderRadius:8}}><small>{l}</small><div>{String(analysis[k])}</div></div>)}</div>
      {list('Likely manufacturing process',analysis.manufacturingProcess)}
      {list('Key dimensions',analysis.dimensions)}
      {list('Tolerances / GD&T',analysis.tolerances)}
      {list('Threads',analysis.threads)}
      {list('Surface finish',analysis.surfaceFinish)}
      {list('Heat treatment',analysis.heatTreatment)}
      {list('Inspection requirements',analysis.inspectionRequirements)}
      {list('Supplier checklist',analysis.supplierChecklist)}
      {analysis.missingInformation.length>0 && <div style={{marginTop:16,padding:12,borderRadius:8,background:'#342b12',color:'#ffe29a'}}><b>Missing / verify before quoting</b>{list('',analysis.missingInformation)}</div>}
      <div style={{marginTop:16,padding:14,borderRadius:8,background:'#0b2234'}}><small>RFQ-READY SUMMARY</small><p style={{marginBottom:0}}>{analysis.rfqSummary}</p></div>
      <small style={{display:'block',marginTop:12,color:'#788b9f'}}>AI output is an extraction/quoting aid. Confirm critical dimensions, tolerances and material against the original drawing before production.</small>
    </div>}
  </section>;
}
