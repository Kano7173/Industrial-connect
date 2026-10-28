import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const prompt = 'You are an industrial drawing analyst. Inspect the supplied engineering drawing and return only a JSON object with fields: name (short likely component/product name), description (brief evidence-based description), material (only if readable; otherwise Not specified), processes (array of likely manufacturing processes), dimensions (array of readable dimensions/tolerances with units), confidence (High, Medium, or Low), previewType (one of shaft, flange, gear, bracket, housing, plate, bolt, other), notes (array of uncertainty/review notes). Do not invent dimensions, materials, tolerances, or certifications. For unreadable information say Not readable. Choose previewType from visible shape. This is not engineering approval.';

export async function POST(request: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'AI is not configured.' }, { status: 503 });
  try {
    const form = await request.formData();
    const drawing = form.get('drawing');
    if (!(drawing instanceof File)) return NextResponse.json({ error: 'Upload a drawing file.' }, { status: 400 });
    if (!allowedTypes.has(drawing.type)) return NextResponse.json({ error: 'Only PDF, PNG, JPG and WEBP drawings are supported.' }, { status: 400 });
    if (drawing.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File must be 10 MB or smaller.' }, { status: 413 });

    let fileContent: Record<string, unknown>;
    if (drawing.type === 'application/pdf') {
      const uploadForm = new FormData();
      uploadForm.append('file', drawing, drawing.name);
      uploadForm.append('purpose', 'user_data');
      const uploadResponse = await fetch('https://api.openai.com/v1/files', { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: uploadForm, cache: 'no-store' });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded.id) return NextResponse.json({ error: 'Could not send PDF to the AI service. Check API key and file access.' }, { status: 502 });
      fileContent = { type: 'input_file', file_id: uploaded.id };
    } else {
      const bytes = Buffer.from(await drawing.arrayBuffer());
      fileContent = { type: 'input_image', image_url: 'data:' + drawing.type + ';base64,' + bytes.toString('base64'), detail: 'high' };
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        model: process.env.OPENAI_DRAWING_MODEL || 'gpt-4o',
        input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, fileContent] }],
        text: { format: { type: 'json_object' } },
        max_output_tokens: 900
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Drawing analysis provider error:', data?.error?.code || data?.error?.type || response.status);
      return NextResponse.json({ error: 'AI could not analyze this file. Check model access and try a clearer drawing.' }, { status: 502 });
    }
    const outputText = typeof data.output_text === 'string' ? data.output_text : '';
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(outputText); } catch { return NextResponse.json({ error: 'AI returned an unreadable result. Try a clearer drawing.' }, { status: 502 }); }
    const types = new Set(['shaft', 'flange', 'gear', 'bracket', 'housing', 'plate', 'bolt', 'other']);
    const analysis = {
      name: safeText(parsed.name, 'Unclassified component', 100),
      description: safeText(parsed.description, 'Supplier review required.', 500),
      material: safeText(parsed.material, 'Not specified', 120),
      processes: safeList(parsed.processes),
      dimensions: safeList(parsed.dimensions),
      confidence: safeText(parsed.confidence, 'Low', 40),
      previewType: types.has(String(parsed.previewType)) ? String(parsed.previewType) : 'other',
      notes: safeList(parsed.notes)
    };
    return NextResponse.json({ analysis }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Drawing analysis failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Unable to process this drawing right now. Please try again.' }, { status: 500 });
  }
}
function safeText(value: unknown, fallback: string, max: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}
function safeList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 12).map(item => item.slice(0, 180)) : [];
}