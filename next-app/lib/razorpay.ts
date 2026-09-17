import crypto from 'node:crypto';

function authHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay server credentials are not configured.');
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function request(path: string, init: RequestInit) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, { ...init, headers: { Authorization: authHeader(), 'Content-Type': 'application/json', ...(init.headers ?? {}) }, cache: 'no-store' });
  const body = await response.text();
  let json: any; try { json = JSON.parse(body); } catch { json = { raw: body }; }
  if (!response.ok) throw new Error(`Razorpay ${response.status}: ${JSON.stringify(json)}`);
  return json;
}

export async function refundCapturedPayment(params: { paymentId: string; amountRupees: number; receipt: string }) {
  return request(`/payments/${encodeURIComponent(params.paymentId)}/refund`, { method: 'POST', body: JSON.stringify({ amount: Math.round(params.amountRupees * 100), receipt: params.receipt, speed: 'normal' }) });
}

export async function transferToLinkedAccount(params: { linkedAccountId: string; amountRupees: number; referenceId: string }) {
  if (!process.env.RAZORPAY_ACCOUNT_ID) throw new Error('RAZORPAY_ACCOUNT_ID is required for Route transfers.');
  return request('/transfers', { method: 'POST', headers: { 'X-Transfer-Idempotency': params.referenceId }, body: JSON.stringify({ account: params.linkedAccountId, amount: Math.round(params.amountRupees * 100), currency: 'INR', notes: { order_id: params.referenceId } }) });
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
