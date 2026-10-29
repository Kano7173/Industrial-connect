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
    return NextResponse.json({ error: 'AI service is not configured. Please contact the Industrial Connect admin.' }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please choose a drawing first.' }, { status: 400 });
    }

    const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: 'Use PDF, PNG, JPG or WEBP.' }, { status: 400 });
    }
    if (file.size > 4_000_000) {
      return NextResponse.json({ error: 'This analyzer accepts drawings up to 4 MB.' }, { status: 413 });
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const prompt = `You are Industrial Connect AI, a manufacturing drawing and RFQ assistant for Indian suppliers.

Analyze the uploaded engineering drawing carefully. Extract only information visible or strongly supported by the drawing. Never invent dimensions, material grades, tolerances, quantity, standards or revision numbers. If information is unreadable or absent, write "Not specified" and include it in missingInformation.

Read the title block, notes, dimensions, units, GD&T/tolerances, threads, surface finish, material, heat treatment and inspection notes. Suggest practical manufacturing processes and rank the most likely first. Keep dimensions and units exactly as shown when possible.

Create a concise supplierChecklist focused on quotation and production readiness. The rfqSummary must be professional, concise and ready to paste into an RFQ.

This is decision support, not certified engineering inspection. Flag anything ambiguous instead of guessing.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
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
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error('Gemini drawing analyzer error:', payload);
      const message = payload?.error?.message || 'The AI service could not analyze this drawing.';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const text = payload?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
    if (!text) return NextResponse.json({ error: 'The AI returned no analysis. Please try again.' }, { status: 502 });

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'The AI returned an incomplete result. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ analysis, fileName: file.name });
  } catch (error) {
    console.error('Drawing analyzer route error:', error);
    return NextResponse.json({ error: 'Could not reach the AI analyzer. Please try again.' }, { status: 500 });
  }
}
