import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = {
  type: 'object',
  properties: {
    partName: { type: 'string' }, partType: { type: 'string' },
    manufacturingProcess: { type: 'array', items: { type: 'string' } },
    material: { type: 'string' }, materialStandard: { type: 'string' },
    quantity: { type: 'string' }, dimensions: { type: 'array', items: { type: 'string' } },
    tolerances: { type: 'array', items: { type: 'string' } },
    surfaceFinish: { type: 'array', items: { type: 'string' } },
    threads: { type: 'array', items: { type: 'string' } },
    heatTreatment: { type: 'array', items: { type: 'string' } },
    inspectionRequirements: { type: 'array', items: { type: 'string' } },
    drawingRevision: { type: 'string' }, drawingNumber: { type: 'string' },
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

const model = 'models/gemini-3.5-flash-lite';
const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI analysis is temporarily unavailable because the server AI key is not configured. Please contact Industrial Connect support.' }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please choose an engineering drawing first.' }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Unsupported file type. Upload a PDF, PNG, JPG or WEBP drawing.' }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: 'The selected file is empty. Please choose the drawing again.' }, { status: 400 });
    if (file.size > 4_000_000) return NextResponse.json({ error: 'This analyzer accepts drawings up to 4 MB. Please compress the file or upload a clearer image.' }, { status: 413 });

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const prompt = `You are Industrial Connect AI, a manufacturing drawing and RFQ assistant for industrial suppliers.
Inspect the entire uploaded engineering drawing, including title block, views, notes, dimensions, units, GD&T, tolerances, threads, surface finish, material, heat treatment and inspection notes.
Extract only information clearly visible or strongly supported by the drawing. Never invent dimensions, units, material grades, quantity, standards, tolerances, drawing number or revision. If absent or unreadable, write "Not specified" and list it in missingInformation.
Preserve dimension values and units exactly as written. Do not infer missing dimensions from the drawing scale. Suggest practical manufacturing processes, but mark uncertain suggestions clearly.
Create a concise supplierChecklist and a professional rfqSummary suitable for an RFQ. This is decision support, not certified engineering inspection.`;

    const fileInput = file.type === 'application/pdf'
      ? { type: 'document', mime_type: file.type, data: base64 }
      : { type: 'image', mime_type: file.type, data: base64, resolution: 'ultra_high' };

    const body = {
      model,
      input: [
        { type: 'text', text: prompt },
        fileInput,
      ],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema,
      },
      generation_config: { max_output_tokens: 4096 },
      // Engineering drawings are processed statelessly and are not stored as conversation history.
      store: false,
    };

    const controller = AbortSignal.timeout(48_000);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller,
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage = payload?.error?.message || `AI provider returned HTTP ${response.status}.`;
      console.error('Drawing analysis Interactions API error:', { model, status: response.status, message: providerMessage });
      const safeMessage = response.status === 404 || response.status === 400
        ? 'The AI model or request configuration was rejected. Please contact Industrial Connect support.'
        : response.status === 429
          ? 'The AI service is temporarily busy. Please wait a minute and try again.'
          : 'The AI service could not complete this drawing. Please try again shortly.';
      return NextResponse.json({ error: safeMessage }, { status: response.status === 429 ? 429 : 502 });
    }

    const outputText = Array.isArray(payload?.steps)
      ? payload.steps
          .filter((step: any) => step?.type === 'model_output')
          .flatMap((step: any) => Array.isArray(step?.content) ? step.content : [])
          .filter((item: any) => item?.type === 'text' && typeof item.text === 'string')
          .map((item: any) => item.text)
          .join('\n')
      : '';

    if (!outputText) {
      console.error('Drawing analysis returned no model output:', { model, status: payload?.status });
      return NextResponse.json({ error: 'The AI returned an empty result. Please try again with a clearer drawing.' }, { status: 502 });
    }

    let analysis: any;
    try {
      analysis = JSON.parse(outputText);
    } catch {
      console.error('Drawing analysis returned invalid JSON.');
      return NextResponse.json({ error: 'The AI response was not readable. Please retry with a clearer drawing.' }, { status: 502 });
    }

    if (!analysis || typeof analysis !== 'object' || typeof analysis.partName !== 'string' || !Array.isArray(analysis.dimensions) || !Array.isArray(analysis.missingInformation)) {
      return NextResponse.json({ error: 'The AI response was incomplete. Please retry with a clearer drawing.' }, { status: 502 });
    }

    return NextResponse.json({ analysis, fileName: file.name, model }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    console.error('Drawing analyzer request failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({
      error: timedOut
        ? 'The drawing took too long to process. Try a smaller PDF or a higher-contrast image.'
        : 'The drawing could not be processed. Please retry, or upload it as a PNG/JPG image.',
    }, { status: timedOut ? 504 : 500 });
  }
}
