const card = { background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 8px 30px #00000010' };

export default function Page() {
  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 28 }}>
      <section style={card}>
        <h1>🏠 Ibiza Housing Mission</h1>
        <p>
          Sistema público para localizar vivienda habitual en Ibiza con <b>2 dormitorios reales o posibilidad legal de crear el segundo</b>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <div style={card}><small>Objetivo</small><h2>≤230k €</h2><p>Hasta 250k excepcional.</p></div>
          <div style={card}><small>Espacio</small><h2>2 habitaciones</h2><p>O reforma/ampliación legal.</p></div>
          <div style={card}><small>Prioridad</small><h2>Particular</h2><p>Venta directa y sin comisión.</p></div>
          <div style={card}><small>MCP</small><h2>v1.2.0</h2><p><code>/api/mcp</code></p></div>
        </div>
        <div style={{ marginTop: 18 }}>
          <a href="/submit" style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 10, textDecoration: 'none', background: '#172033', color: '#fff', fontWeight: 700 }}>Enviar una vivienda →</a>
        </div>
      </section>
      <section style={{ ...card, marginTop: 18 }}>
        <h2>Herramientas para agentes</h2>
        <ul>
          <li><code>get_public_housing_brief</code></li>
          <li><code>evaluate_property</code></li>
          <li><code>mortgage_scenario</code></li>
          <li><code>submit_property</code> — entrega oportunidades y recibe un <code>receiptId</code>.</li>
        </ul>
        <p>Propietarios y profesionales también pueden usar el formulario web. El sistema no expone información privada del comprador.</p>
      </section>
    </main>
  );
}
