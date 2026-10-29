import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = {
  type: 'object',
  properties: {
    partName: { type: 'string' },
    partType: { type: 'string' },
    manufacturingProcess: { type: 'array', items: { type: 'string' } },
    material: { type: 'string' },
    materialStandard: { type: 'string' },
    quantity: { type: 'string' },
    dimensions: { type: 'array', items: { type: 'string' } },
    tolerances: { type: 'array', items: { type: 'string' } },
    surfaceFinish: { type: 'array', items: { type: 'string' } },
    threads: { type: 'array', items: { type: 'string' } },
    heatTreatment: { type: 'array', items: { type: 'string' } },
    inspectionRequirements: { type: 'array', items: { type: 'string' } },
    drawingRevision: { type: 'string' },
    drawingNumber: { type: 'string' },
    estimatedComplexity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'] },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    missingInformation: { type: 'array', items: { type: 'string' } },
    supplierChecklist: { type: 'array', items: { type: 'string' } },
    rfqSummary: { type: 'string' },
  },
  required: [
    'partName','partType','manufacturingProcess','material','materialStandard','quantity',
    'dimensions','tolerances','surfaceFinish','threads','heatTreatment','inspectionRequirements',
    'drawingRevision','drawingNumber','estimatedComplexity','confidence','missingInformation',
    'supplierChecklist','rfqSummary'
  ],
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API is not configured on this deployment.' }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload a drawing file.' }, { status: 400 });
    }

    const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: 'Supported files: PDF, PNG, JPG or WEBP.' }, { status: 400 });
    }
    if (file.size > 4_000_000) {
      return NextResponse.json({ error: 'Please keep the drawing below 4 MB for the free analyzer.' }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString('base64');
    const prompt = `You are IndustrialConnect AI, a manufacturing drawing/RFQ assistant for Indian suppliers. Analyze the uploaded engineering drawing carefully.

Extract only information that is visible or strongly supported by the drawing. Never invent dimensions, material grades, tolerances, quantity, standards or revision numbers. If something is not visible, use "Not specified" and put it in missingInformation.

For manufacturingProcess, suggest practical processes such as CNC turning, CNC milling/VMC, grinding, fabrication, laser cutting, sheet metal, casting, forging, injection moulding, heat treatment, EDM, etc. Rank the most likely processes first.

Read title block, notes, GD&T/tolerances, threads, surface finish, material and inspection notes. Identify dimensions with units exactly when possible. Give a concise supplierChecklist focused on quoting and production readiness. The rfqSummary must be short, professional and ready to paste into an RFQ/quote request.

This is decision support, not a certified engineering inspection. Flag ambiguous or unreadable information instead of guessing.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1,
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error('Gemini drawing analyzer error:', payload);
      return NextResponse.json({ error: payload?.error?.message || 'Gemini analysis failed.' }, { status: 502 });
    }

    const text = payload?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
    if (!text) return NextResponse.json({ error: 'Gemini returned no analysis.' }, { status: 502 });

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Gemini returned invalid structured data. Please retry.' }, { status: 502 });
    }

    return NextResponse.json({ analysis, fileName: file.name });
  } catch (error) {
    console.error('Drawing analyzer route error:', error);
    return NextResponse.json({ error: 'Could not analyze this drawing. Please retry with a clear PDF or image.' }, { status: 500 });
  }
}
