import AiDrawingAnalyzer from '@/components/ai-drawing-analyzer';

export const dynamic = 'force-dynamic';

export default function CapabilityStudioPage() {
  return (
    <main className="dashboard" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <a href="/" style={{ textDecoration: 'none' }}>← Industrial Connect</a>
            <div style={{ marginTop: 18 }}>
              <small style={{ letterSpacing: 1.6, color: '#63b3ff' }}>SUPPLIER AI CAPABILITY STUDIO</small>
              <h1 style={{ margin: '6px 0 8px' }}>Drawing → RFQ in seconds</h1>
              <p style={{ margin: 0, maxWidth: 760, color: '#9fb0c1' }}>
                Upload a technical drawing and Gemini will extract the information a manufacturer needs to review the job and prepare a quote.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="button button-outline" href="/dashboard/supplier/demo">Supplier dashboard</a>
            <a className="button button-dark" href="/post-requirement">Buyer RFQ</a>
          </div>
        </div>

        <AiDrawingAnalyzer />

        <section className="dash-card" style={{ marginTop: 18 }}>
          <h2>How the AI result is used</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
            <div><b>1. Read</b><p>Part name, material, dimensions, tolerances, threads and drawing references.</p></div>
            <div><b>2. Decide</b><p>Likely manufacturing processes and the information that still needs verification.</p></div>
            <div><b>3. Quote</b><p>Supplier checklist plus a concise RFQ-ready summary you can copy into a quote.</p></div>
          </div>
          <small style={{ color: '#788b9f' }}>AI is a quoting aid. Always verify critical engineering information against the original drawing before production.</small>
        </section>
      </div>
    </main>
  );
}
