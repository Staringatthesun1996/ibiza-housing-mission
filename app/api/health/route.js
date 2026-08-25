export async function GET() {
  return Response.json({
    ok: true,
    service: 'ibiza-housing-mission',
    version: '1.0.0',
    mcp: '/api/mcp',
    now: new Date().toISOString()
  });
}
