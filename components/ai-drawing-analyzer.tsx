'use client';

import { useRef, useState } from 'react';

type Analysis = {
  partName: string; partType: string; manufacturingProcess: string[]; material: string;
  materialStandard: string; quantity: string; dimensions: string[]; tolerances: string[];
  surfaceFinish: string[]; threads: string[]; heatTreatment: string[];
  inspectionRequirements: string[]; drawingRevision: string; drawingNumber: string;
  estimatedComplexity: string; confidence: number; missingInformation: string[];
  supplierChecklist: string[]; rfqSummary: string;
};

const labels: [keyof Analysis, string][] = [
  ['partName','Part name'], ['partType','Part type'], ['material','Material'], ['materialStandard','Standard'],
  ['quantity','Quantity'], ['drawingNumber','Drawing number'], ['drawingRevision','Revision'], ['estimatedComplexity','Complexity'],
];

export default function AiDrawingAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  function choose(next: File | null) {
    setError(''); setAnalysis(null); setVisualPreview(null);
    if (!next) return;
    const allowed = ['application/pdf','image/png','image/jpeg','image/webp'];
    if (!allowed.includes(next.type)) return setError('Please upload a PDF, PNG, JPG or WEBP drawing.');
    if (next.size > 4_000_000) return setError('Please keep the drawing below 4 MB.');
    setFile(next);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true); setError(''); setAnalysis(null); setVisualPreview(null);
    const body = new FormData(); body.append('file', file);
    try {
      const res = await fetch('/api/ai/drawing-analyzer', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Analysis failed. Please try again.');
      setAnalysis(data.analysis);
      setVisualPreview(typeof data.visualPreview === 'string' ? data.visualPreview : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  }

  const list = (title: string, values?: string[]) => values?.length ? (
    <div style={{marginTop:18}}><div className="ai-section-title">{title}</div><ul className="ai-list">{values.map((v,i)=><li key={i}>{v}</li>)}</ul></div>
  ) : null;

  return <section className="ai-studio">
    <div className="ai-hero">
      <div>
        <div className="ai-eyebrow">INDUSTRIAL CONNECT AI</div>
        <h2>Turn a drawing into a quote-ready job</h2>
        <p>Upload one engineering drawing. AI reads the title block, dimensions, material, tolerances and manufacturing requirements.</p>
      </div>
      <div className="ai-badge">● AI ONLINE</div>
    </div>

    <div className="ai-steps"><span className="active"><b>01</b> Upload</span><i>→</i><span><b>02</b> Analyze</span><i>→</i><span><b>03</b> Quote</span></div>

    <div
      className={`ai-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0] || null); }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} hidden type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={e => choose(e.target.files?.[0] || null)} />
      <div className="ai-upload-icon">↑</div>
      {file ? <><strong>{file.name}</strong><small>{(file.size/1024/1024).toFixed(2)} MB · Ready to analyze</small></> : <><strong>Drop your drawing here</strong><small>or tap to choose a PDF, PNG, JPG or WEBP · max 4 MB</small></>}
    </div>

    <div className="ai-actions">
      <button className="ai-primary" type="button" disabled={!file || loading} onClick={e => { e.stopPropagation(); analyze(); }}>{loading ? 'Analyzing…' : '✦ Analyze drawing'}</button>
      {file && <button className="ai-secondary" type="button" onClick={() => { setFile(null); setAnalysis(null); setError(''); if (inputRef.current) inputRef.current.value=''; }}>Remove</button>}
    </div>

    {loading && <div className="ai-progress"><span /> Reading drawing and extracting manufacturing data…</div>}
    {error && <div className="ai-error"><b>Analysis could not finish</b><span>{error}</span></div>}

    {analysis && <div className="ai-result">
      <div className="ai-result-head"><div><div className="ai-eyebrow">ANALYSIS COMPLETE</div><h3>{analysis.partName}</h3><p>{analysis.partType} · {analysis.estimatedComplexity} complexity</p></div><div className="ai-confidence"><strong>{analysis.confidence}%</strong><small>confidence</small></div></div>
      <div className="ai-visual">
        <div className="ai-visual-head">
          <div><div className="ai-eyebrow">3D CONCEPT PREVIEW</div><h4>What this part may look like</h4><p>Visual reference to help suppliers understand the component before quoting.</p></div>
          <span>AI GENERATED</span>
        </div>
        {visualPreview ? <img className="ai-visual-image" src={visualPreview} alt={`AI-generated 3D concept preview of ${analysis.partName}`} /> : <div className="ai-visual-fallback">3D preview could not be generated for this drawing. Use the original engineering drawing and extracted details for quotation.</div>}
        <div className="ai-visual-note">Concept visualization only — not a dimensionally accurate CAD model. Verify all geometry and dimensions against the original drawing before quoting or manufacturing.</div>
      </div>
      <div className="ai-grid">{labels.map(([k,l])=><div className="ai-field" key={String(k)}><small>{l}</small><strong>{String(analysis[k])}</strong></div>)}</div>
      {list('Likely manufacturing process',analysis.manufacturingProcess)}
      {list('Key dimensions',analysis.dimensions)}
      {list('Tolerances / GD&T',analysis.tolerances)}
      {list('Threads',analysis.threads)}
      {list('Surface finish',analysis.surfaceFinish)}
      {list('Heat treatment',analysis.heatTreatment)}
      {list('Inspection requirements',analysis.inspectionRequirements)}
      {list('Supplier checklist',analysis.supplierChecklist)}
      {analysis.missingInformation.length > 0 && <div className="ai-warning"><b>Verify before quoting</b>{list('',analysis.missingInformation)}</div>}
      <div className="ai-rfq"><div className="ai-eyebrow">RFQ-READY SUMMARY</div><p>{analysis.rfqSummary}</p><button type="button" onClick={() => navigator.clipboard?.writeText(analysis.rfqSummary)}>Copy RFQ summary</button></div>
      <small className="ai-disclaimer">AI is a quoting aid. Always verify critical dimensions, tolerances and material against the original drawing before production.</small>
    </div>}

    <style jsx>{`
      .ai-studio{margin-top:18px;border:1px solid #dce5e1;border-radius:28px;background:#fff;box-shadow:0 20px 60px rgba(15,35,30,.10);overflow:hidden;color:#17231f}
      .ai-hero{padding:30px 28px 24px;background:linear-gradient(135deg,#0f211c,#19362d);color:white;display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
      .ai-eyebrow{font-size:11px;font-weight:800;letter-spacing:1.8px;color:#9be83f}.ai-hero h2{font-size:30px;line-height:1.08;margin:7px 0 9px;letter-spacing:-.7px}.ai-hero p{max-width:700px;margin:0;color:#c6d5d0;line-height:1.55}.ai-badge{white-space:nowrap;border:1px solid #486e5d;background:#19392f;padding:9px 12px;border-radius:999px;font-size:11px;font-weight:800;color:#b7f16a}
      .ai-steps{display:flex;align-items:center;gap:13px;padding:14px 28px;border-bottom:1px solid #e7eeeb;background:#f8faf9;color:#87958f;font-size:12px;font-weight:700}.ai-steps span{display:flex;align-items:center;gap:7px}.ai-steps b{font-size:10px;color:#65736e}.ai-steps .active{color:#17231f}.ai-steps .active b{color:#5a990d}.ai-steps i{font-style:normal;color:#c0cbc6}
      .ai-dropzone{margin:22px 28px 14px;min-height:190px;border:2px dashed #cbd8d2;border-radius:20px;background:#f7faf8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;transition:.2s}.ai-dropzone:hover,.ai-dropzone.dragging{border-color:#9be83f;background:#fbfff3}.ai-dropzone.has-file{border-style:solid;border-color:#9be83f;background:#fbfff3}.ai-upload-icon{width:52px;height:52px;border-radius:16px;background:#e9f6d2;color:#4f850b;display:grid;place-items:center;font-size:28px;margin-bottom:12px}.ai-dropzone strong{font-size:17px}.ai-dropzone small{display:block;color:#7b8983;margin-top:6px}.ai-actions{display:flex;gap:10px;padding:0 28px 22px}.ai-primary,.ai-secondary{border:0;border-radius:12px;padding:13px 18px;font-weight:800;cursor:pointer}.ai-primary{background:#b9f43d;color:#17200f;box-shadow:0 8px 20px rgba(132,180,35,.18)}.ai-primary:disabled{opacity:.45;cursor:not-allowed}.ai-secondary{background:#eef2f0;color:#52605a}.ai-progress{margin:0 28px 22px;padding:13px 15px;border-radius:12px;background:#f3f8ed;color:#55731f;font-size:13px}.ai-progress span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#8bc52a;margin-right:8px}.ai-error{margin:0 28px 22px;padding:14px 16px;border-radius:13px;background:#fff2f1;border:1px solid #f2c7c3;color:#8d2e29;display:flex;flex-direction:column;gap:4px;font-size:13px}.ai-result{border-top:1px solid #e3ebe7;padding:25px 28px 30px;background:#fbfcfb}.ai-visual{margin-top:20px;padding:18px;border:1px solid #dfe8e3;border-radius:17px;background:#fff}
      .ai-visual-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
      .ai-visual-head h4{font-size:18px;margin:5px 0 4px;letter-spacing:-.2px}
      .ai-visual-head p{font-size:13px;color:#718078;margin:0;line-height:1.45}
      .ai-visual-head>span{white-space:nowrap;padding:7px 9px;border-radius:999px;background:#eef7e4;color:#5c811f;font-size:9px;font-weight:900;letter-spacing:.8px}
      .ai-visual-image{display:block;width:100%;max-height:440px;object-fit:contain;margin-top:14px;border-radius:12px;background:#f4f6f5}
      .ai-visual-fallback{margin-top:14px;padding:34px 20px;text-align:center;border:1px dashed #cbd8d2;border-radius:12px;background:#f7faf8;color:#65736e;font-size:13px;line-height:1.5}
      .ai-visual-note{margin-top:10px;color:#8a6b25;background:#fff9e8;border:1px solid #f0dda0;border-radius:10px;padding:10px 12px;font-size:11px;line-height:1.5}
      .ai-result-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.ai-result h3{font-size:26px;margin:5px 0 3px;letter-spacing:-.4px}.ai-result-head p{margin:0;color:#718078}.ai-confidence{min-width:88px;text-align:center;border:1px solid #d7e5c3;background:#f3f9e9;border-radius:14px;padding:9px}.ai-confidence strong{display:block;font-size:21px;color:#55820e}.ai-confidence small{font-size:10px;color:#718078}.ai-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:18px}.ai-field{padding:11px 12px;border:1px solid #e0e8e4;border-radius:11px;background:white}.ai-field small{display:block;color:#83918b;font-size:10px;text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px}.ai-field strong{font-size:13px;word-break:break-word}.ai-section-title{font-size:13px;font-weight:850}.ai-list{margin:7px 0 0 18px;padding:0;color:#4c5b55;font-size:13px;line-height:1.55}.ai-warning{margin-top:18px;padding:14px 16px;border-radius:13px;background:#fff9e8;border:1px solid #f0dda0}.ai-warning>.ai-section-title{color:#795e08}.ai-rfq{margin-top:20px;padding:18px;border-radius:15px;background:#10251f;color:#edf7f1}.ai-rfq p{line-height:1.6;margin:7px 0 14px}.ai-rfq button{border:0;border-radius:9px;padding:9px 12px;background:#b9f43d;color:#17200f;font-weight:800;cursor:pointer}.ai-disclaimer{display:block;color:#85928c;margin-top:14px;line-height:1.5}
      @media(max-width:700px){.ai-hero{padding:23px 18px 20px;display:block}.ai-hero h2{font-size:25px}.ai-badge{display:inline-block;margin-top:15px}.ai-steps,.ai-actions,.ai-dropzone,.ai-result{margin-left:0;margin-right:0}.ai-steps{padding:13px 18px}.ai-dropzone{margin:18px 18px 12px}.ai-actions{padding:0 18px 18px}.ai-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ai-result{padding:22px 18px 25px}.ai-error,.ai-progress{margin-left:18px;margin-right:18px}.ai-result h3{font-size:22px}}
      @media(max-width:430px){.ai-grid{grid-template-columns:1fr}.ai-steps{gap:7px;font-size:10px}.ai-steps i{font-size:9px}}
    `}</style>
  </section>;
}
