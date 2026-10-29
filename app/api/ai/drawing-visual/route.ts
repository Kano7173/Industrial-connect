import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Visual preview is unavailable because the server AI key is not configured.' }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    const partName = String(form.get('partName') || 'Unspecified component').slice(0, 160);
    const partType = String(form.get('partType') || 'Unspecified').slice(0, 160);
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size === 0 || file.size > 4_000_000) {
      return NextResponse.json({ error: 'Please re-upload the same valid drawing (PDF, PNG, JPG or WEBP, up to 4 MB).' }, { status: 400 });
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { text: `Create one clean isometric concept illustration of the physical part shown in this engineering drawing. Use the uploaded drawing as the primary visual reference. Preserve only clearly visible overall shape and features; do not invent hidden geometry. Component name: ${partName}. Component type: ${partType}. Show a single isolated machined-metal component on a plain light background, three-quarter isometric view. No text, dimensions, annotations, labels, extra parts, people or tools. This is an illustrative concept, not a dimensionally accurate CAD model.` },
          { inlineData: { mimeType: file.type, data: base64 } },
        ] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      signal: AbortSignal.timeout(48_000),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || `Image provider returned HTTP ${response.status}.`;
      console.warn('Drawing visual preview provider error:', response.status, message);
      return NextResponse.json({ error: 'The technical analysis is ready, but the optional visual preview could not be generated.' }, { status: 502 });
    }
    const imagePart = payload?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.data);
    if (!imagePart?.inlineData?.data) return NextResponse.json({ error: 'The technical analysis is ready, but no preview image was returned.' }, { status: 502 });
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    return NextResponse.json({ visualPreview: `data:${mimeType};base64,${imagePart.inlineData.data}` }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.warn('Drawing visual preview request failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'The preview is taking too long. Your technical analysis is still available.' }, { status: 504 });
  }
}
