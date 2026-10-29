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

const models = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: 'AI service is not configured on this deployment. Please redeploy the latest Industrial Connect version after adding GEMINI_API_KEY in Vercel.'
    }, { status: 503 });
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

    const body = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64 } },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    };

    let lastMessage = 'The AI service could not analyze this drawing.';

    for (const model of models) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastMessage = payload?.error?.message || `Gemini ${model} returned HTTP ${response.status}.`;
        console.error(`Gemini drawing analyzer error (${model}):`, payload);
        continue;
      }

      const text = payload?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
      if (!text) {
        lastMessage = 'The AI returned no analysis. Please try again.';
        continue;
      }

      try {
        const analysis = JSON.parse(text);

        // Generate an illustrative 3D-style visual from the original drawing.
        // This is intentionally optional: a visual-generation failure must not block the technical analysis.
        let visualPreview: string | null = null;
        try {
          const visualResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [
                  {
                    text: `Create a clean, photorealistic 3D CAD-style product visualization of the physical component shown in this engineering drawing.
Use the drawing as the visual reference. Preserve the main silhouette, proportions, holes, slots, shoulders, grooves, flanges and other clearly visible features as closely as possible.
Show one isolated component in a three-quarter isometric view, neutral light-grey machined metal, soft studio lighting, plain off-white background, crisp edges, realistic manufacturing surface.
Do not include people, hands, tools, factory scenes, labels, dimensions, annotations, logos or extra components.
Part identified by drawing analysis: ${analysis.partName || 'Unspecified component'}.
Part type: ${analysis.partType || 'Unspecified'}.
Likely process: ${(analysis.manufacturingProcess || []).join(', ') || 'Not specified'}.
Important: this is an illustrative concept preview only. Do not invent hidden geometry or claim engineering accuracy. If the drawing does not clearly establish the shape, show a conservative simplified concept rather than adding complex features.`,
                  },
                  { inlineData: { mimeType: file.type, data: base64 } },
                ],
              }],
              generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: { aspectRatio: '4:3', imageSize: '1K' },
              },
            }),
          });
          if (visualResponse.ok) {
            const visualPayload = await visualResponse.json().catch(() => ({}));
            const imagePart = visualPayload?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.data);
            if (imagePart?.inlineData?.data) {
              const mimeType = imagePart.inlineData.mimeType || 'image/png';
              visualPreview = `data:${mimeType};base64,${imagePart.inlineData.data}`;
            }
          } else {
            const visualError = await visualResponse.text().catch(() => '');
            console.warn('Gemini 3D visual preview unavailable:', visualResponse.status, visualError.slice(0, 300));
          }
        } catch (visualError) {
          console.warn('Gemini 3D visual preview failed:', visualError);
        }

        return NextResponse.json({ analysis, visualPreview, fileName: file.name, model });
      } catch (error) {
        console.error(`Gemini JSON parse error (${model}):`, error, text.slice(0, 500));
        lastMessage = 'The AI returned an incomplete result. Please try again.';
      }
    }

    return NextResponse.json({
      error: `AI analysis failed: ${lastMessage}`
    }, { status: 502 });
  } catch (error) {
    console.error('Drawing analyzer route error:', error);
    return NextResponse.json({ error: 'Could not reach the AI analyzer. Please try again.' }, { status: 500 });
  }
}
