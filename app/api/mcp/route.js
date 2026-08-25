import { createHash } from 'node:crypto';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function evaluateProperty(input) {
  const price = Number(input.price || 0);
  const area = Number(input.area || 0);
  const bedrooms = Number(input.bedrooms || 0);
  const legalStatus = input.legalStatus || 'pending';
  const occupancy = input.occupancy || 'pending';
  const expandable = Boolean(input.expandable);
  const garden = Boolean(input.garden);
  const mortgageable = input.mortgageable !== false;

  const hardReject =
    ['ruin', 'non_residential', 'bare_ownership', 'usufruct'].includes(legalStatus) ||
    ['illegal_occupancy', 'no_possession'].includes(occupancy) ||
    !mortgageable;

  if (hardReject) {
    return {
      score: 0,
      classification: 'DESCARTAR',
      hardReject: true,
      reasons: ['Falla un filtro jurídico, posesorio o de hipotecabilidad obligatorio.']
    };
  }

  const financial = price <= 210000 ? 25 : price <= 230000 ? 22 : price <= 250000 ? 18 : price <= 280000 ? 12 : 5;
  const legal = legalStatus === 'clear' ? 20 : 10;
  const bedroomFit = bedrooms >= 2 ? 15 : bedrooms === 1 && (area >= 50 || expandable || garden) ? 11 : (expandable || garden) ? 8 : 1;
  const market = price && area ? clamp(10 - Math.max(0, (price / Math.max(area, 1) - 4500) / 500), 2, 10) : 5;
  const quality = clamp(area / 7, 2, 10);
  const negotiation = price > 250000 ? 4 : 3;
  const score = Math.round(clamp(financial + legal + bedroomFit + market + quality + 7 + 4 + negotiation, 0, 100));
  const classification = score >= 80 ? 'PRIORIDAD ALTA' : score >= 70 ? 'ACCIONABLE' : score >= 55 ? 'VIGILAR' : 'BAJA PRIORIDAD';

  const reasons = [];
  if (bedrooms >= 2) reasons.push('Cumple dos dormitorios existentes.');
  else if (bedrooms === 1 && (area >= 50 || expandable || garden)) reasons.push('Puede encajar si técnico y urbanismo confirman un segundo dormitorio legal.');
  else reasons.push('No acredita todavía dos dormitorios ni una transformación suficiente.');
  if (legalStatus !== 'clear') reasons.push('Documentación jurídica y urbanística pendiente.');
  if (price > 250000) reasons.push('Necesita negociación relevante para entrar en rango.');
  if (garden || expandable) reasons.push('Existe tesis de reforma o ampliación que debe verificarse legalmente.');

  return { score, classification, hardReject: false, reasons };
}

function monthlyPayment(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (!r) return principal / n;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (host.startsWith('10.') || host.startsWith('192.168.')) return false;
    const m = host.match(/^172\.(\d+)\./);
    if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return false;
    return true;
  } catch {
    return false;
  }
}

function submissionReceipt(input) {
  const canonical = [
    input.listingUrl.trim().toLowerCase(),
    input.price,
    input.area,
    input.bedrooms,
    input.municipality
  ].join('|');
  return createHash('sha256').update(canonical).digest('hex').slice(0, 20);
}

const municipalityEnum = z.enum([
  'Eivissa',
  'Sant Antoni de Portmany',
  'Santa Eulària des Riu',
  'Sant Josep de sa Talaia',
  'Sant Joan de Labritja'
]);

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get_public_housing_brief',
      'Returns the public housing-search mandate. It intentionally excludes private buyer information.',
      {},
      async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify({
            location: 'Ibiza, Spain',
            purpose: 'habitual residence',
            targetPriceEur: 230000,
            exceptionalCeilingEur: 250000,
            inverseNegotiationSearchCeilingEur: 300000,
            bedroomRequirement: '2 real bedrooms, or a legally and technically plausible path to create the second bedroom',
            acceptedPotential: ['redistribution', 'legal extension', 'garden/land with verifiable buildability'],
            reject: ['ruin', 'illegal occupation', 'non-residential registry use', 'bare ownership/usufruct', 'non-mortgageable property', 'serious unresolved urban-planning issues']
          }, null, 2)
        }]
      })
    );

    server.tool(
      'evaluate_property',
      'Scores an Ibiza property against the public mission criteria. This is pre-screening, not legal or technical due diligence.',
      {
        price: z.number().positive(),
        area: z.number().positive(),
        bedrooms: z.number().int().min(0),
        legalStatus: z.enum(['clear', 'pending', 'ruin', 'non_residential', 'bare_ownership', 'usufruct']).default('pending'),
        occupancy: z.enum(['free', 'pending', 'illegal_occupancy', 'no_possession']).default('pending'),
        expandable: z.boolean().default(false),
        garden: z.boolean().default(false),
        mortgageable: z.boolean().default(true)
      },
      async (input) => ({
        content: [{ type: 'text', text: JSON.stringify(evaluateProperty(input), null, 2) }]
      })
    );

    server.tool(
      'mortgage_scenario',
      'Calculates an illustrative mortgage payment and a +1 percentage-point stress scenario. It is not a bank offer.',
      {
        price: z.number().positive(),
        ltv: z.number().min(1).max(100).default(90),
        annualRate: z.number().min(0).max(20).default(3.25),
        years: z.number().int().min(1).max(40).default(30)
      },
      async ({ price, ltv, annualRate, years }) => {
        const principal = price * ltv / 100;
        const monthly = monthlyPayment(principal, annualRate, years);
        const stressed = monthlyPayment(principal, annualRate + 1, years);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              price,
              ltv,
              principal: Math.round(principal),
              annualRate,
              years,
              monthlyPayment: Math.round(monthly),
              stressRate: annualRate + 1,
              stressedMonthlyPayment: Math.round(stressed),
              disclaimer: 'Illustrative only; excludes taxes, acquisition costs, community fees, insurance and bank underwriting.'
            }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'submit_property',
      'Submits a public or shareable Ibiza property lead to the mission queue. Do not include private buyer data, private owner contact data, credentials, or confidential documents.',
      {
        sourceAgent: z.string().min(2).max(80),
        title: z.string().min(3).max(120),
        listingUrl: z.string().url().max(500).refine(safeHttpsUrl, 'A public/shareable HTTPS URL is required.'),
        municipality: municipalityEnum,
        price: z.number().positive().max(350000),
        area: z.number().min(10).max(1000),
        bedrooms: z.number().int().min(0).max(20),
        landArea: z.number().min(0).max(100000).default(0),
        legalStatus: z.enum(['clear', 'pending', 'ruin', 'non_residential', 'bare_ownership', 'usufruct']).default('pending'),
        occupancy: z.enum(['free', 'pending', 'illegal_occupancy', 'no_possession']).default('pending'),
        expandable: z.boolean().default(false),
        garden: z.boolean().default(false),
        mortgageable: z.boolean().default(true),
        notes: z.string().max(600).default('')
      },
      async (input) => {
        const evaluation = evaluateProperty(input);
        const hasBedroomPath = input.bedrooms >= 2 || input.expandable || input.garden || (input.bedrooms === 1 && input.area >= 50);
        const inSearchEnvelope = input.price <= 300000;
        const accepted = !evaluation.hardReject && hasBedroomPath && inSearchEnvelope;
        const receiptId = submissionReceipt(input);
        const submittedAt = new Date().toISOString();

        const record = {
          event: 'PROPERTY_SUBMISSION',
          schemaVersion: 1,
          receiptId,
          submittedAt,
          status: accepted ? 'queued' : 'screened_out',
          sourceAgent: input.sourceAgent,
          title: input.title,
          listingUrl: input.listingUrl,
          municipality: input.municipality,
          price: input.price,
          area: input.area,
          bedrooms: input.bedrooms,
          landArea: input.landArea,
          expandable: input.expandable,
          garden: input.garden,
          legalStatus: input.legalStatus,
          occupancy: input.occupancy,
          mortgageable: input.mortgageable,
          notes: input.notes,
          evaluation
        };

        console.info(`[PROPERTY_SUBMISSION] ${JSON.stringify(record)}`);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              accepted,
              status: record.status,
              receiptId,
              submittedAt,
              evaluation,
              screening: {
                inSearchEnvelope,
                hasBedroomPath,
                hardReject: evaluation.hardReject
              },
              nextStep: accepted
                ? 'Queued for human/agent review. Receipt ID can be used to deduplicate the same listing.'
                : 'Not queued because it fails the mission envelope or a hard screening rule.',
              privacyNotice: 'Do not submit private buyer information or private owner contact data.'
            }, null, 2)
          }]
        };
      }
    );
  },
  {},
  { basePath: '/api' }
);

export { handler as GET, handler as POST, handler as DELETE };
