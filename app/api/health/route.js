export async function GET() {
  return Response.json({
    ok: true,
    service: 'ibiza-housing-mission',
    version: '1.1.0',
    mcp: '/api/mcp',
    tools: ['get_public_housing_brief', 'evaluate_property', 'mortgage_scenario', 'submit_property'],
    now: new Date().toISOString()
  });
}
