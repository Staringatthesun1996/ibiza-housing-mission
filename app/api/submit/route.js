import { randomUUID } from 'node:crypto';

const buckets = new Map();
const SELLERS = new Set(['private', 'agency', 'bank_servicer', 'developer', 'unknown']);
const NEGOTIATION = new Set(['open', 'firm', 'after_visit', 'unknown']);

function text(v, max = 1000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 5;
  const old = buckets.get(ip) || [];
  const recent = old.filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(ip, recent);
  return recent.length > limit;
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: humans never need to fill this field.
  if (text(body.website, 200)) return Response.json({ ok: true, accepted: false });

  const location = text(body.location, 160);
  const price = num(body.price);
  const area = num(body.area);
  const bedrooms = Math.max(0, Math.min(20, Math.trunc(num(body.bedrooms) ?? 0)));
  const sellerType = SELLERS.has(body.sellerType) ? body.sellerType : 'unknown';
  const negotiation = NEGOTIATION.has(body.negotiation) ? body.negotiation : 'unknown';
  const consent = body.consent === true;

  if (!location || !price || price < 20_000 || price > 10_000_000 || !area || area < 10 || area > 5000) {
    return Response.json({ ok: false, error: 'invalid_property_fields' }, { status: 400 });
  }
  if (!consent) return Response.json({ ok: false, error: 'consent_required' }, { status: 400 });

  const receiptId = `web-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const submission = {
    receiptId,
    receivedAt: new Date().toISOString(),
    sourceKind: 'web_form',
    sourceUrl: text(body.sourceUrl, 700) || null,
    location,
    price,
    area,
    bedrooms,
    garden: Boolean(body.garden),
    land: Boolean(body.land),
    expandable: Boolean(body.expandable),
    sellerType,
    sellerName: text(body.sellerName, 140) || null,
    publicContactEmail: text(body.contactEmail, 220) || null,
    publicContactPhone: text(body.contactPhone, 80) || null,
    negotiation,
    negotiationSignal: text(body.negotiationSignal, 500) || null,
    notes: text(body.notes, 2000) || null,
    privacy: 'Contact details supplied voluntarily for this housing lead only. No buyer-private data is exposed.'
  };

  console.info('PROPERTY_SUBMISSION', JSON.stringify(submission));

  return Response.json({
    ok: true,
    accepted: true,
    receiptId,
    message: 'Inmueble recibido para preselección. El envío no implica oferta, reserva ni aceptación.'
  });
}
