'use client';

import { useState } from 'react';

const card = { background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 8px 30px #00000010' };
const field = { width: '100%', padding: 11, border: '1px solid #d6dbe5', borderRadius: 10, boxSizing: 'border-box' };
const label = { display: 'block', marginTop: 13, marginBottom: 6, fontWeight: 650 };

export default function SubmitPage() {
  const [state, setState] = useState({ busy: false, result: null });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, result: null });
    const f = new FormData(e.currentTarget);
    const body = {
      website: f.get('website') || '',
      location: f.get('location'),
      price: Number(f.get('price')),
      area: Number(f.get('area')),
      bedrooms: Number(f.get('bedrooms')),
      sellerType: f.get('sellerType'),
      sellerName: f.get('sellerName'),
      contactEmail: f.get('contactEmail'),
      contactPhone: f.get('contactPhone'),
      sourceUrl: f.get('sourceUrl'),
      negotiation: f.get('negotiation'),
      negotiationSignal: f.get('negotiationSignal'),
      notes: f.get('notes'),
      garden: f.get('garden') === 'on',
      land: f.get('land') === 'on',
      expandable: f.get('expandable') === 'on',
      consent: f.get('consent') === 'on'
    };
    try {
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      setState({ busy: false, result: json });
      if (json.ok && json.accepted) e.currentTarget.reset();
    } catch {
      setState({ busy: false, result: { ok: false, error: 'network_error' } });
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: 28 }}>
      <section style={card}>
        <a href="/" style={{ textDecoration: 'none' }}>← Ibiza Housing Mission</a>
        <h1>Enviar una vivienda</h1>
        <p>Buscamos vivienda habitual en Ibiza. Se prioriza la <b>venta directa de propietario</b>, sin comisión al comprador, con 2 dormitorios reales o posibilidad legal de crear el segundo.</p>
        <p style={{ background: '#f7f8fb', padding: 12, borderRadius: 10 }}>Enviar esta ficha <b>no constituye una oferta, reserva ni aceptación</b>. Solo sirve para preseleccionar y solicitar más información si encaja.</p>

        <form onSubmit={submit}>
          <input name="website" tabIndex="-1" autoComplete="off" style={{ position: 'absolute', left: '-10000px' }} aria-hidden="true" />

          <label style={label}>Zona / localidad *</label>
          <input name="location" required maxLength="160" placeholder="Ej. Portinatx, Santa Eulària, Sant Antoni…" style={field} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <div><label style={label}>Precio actual (€) *</label><input name="price" type="number" required min="20000" max="10000000" style={field} /></div>
            <div><label style={label}>Superficie (m²) *</label><input name="area" type="number" required min="10" max="5000" step="0.1" style={field} /></div>
            <div><label style={label}>Dormitorios actuales</label><input name="bedrooms" type="number" min="0" max="20" defaultValue="0" style={field} /></div>
          </div>

          <label style={label}>Quién vende</label>
          <select name="sellerType" defaultValue="private" style={field}>
            <option value="private">Propietario particular</option>
            <option value="agency">Agencia</option>
            <option value="bank_servicer">Banco / servicer</option>
            <option value="developer">Promotor</option>
            <option value="unknown">Otro / no sé</option>
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div><label style={label}>Nombre o alias</label><input name="sellerName" maxLength="140" style={field} /></div>
            <div><label style={label}>Email de contacto</label><input name="contactEmail" type="email" maxLength="220" style={field} /></div>
            <div><label style={label}>Teléfono público/consentido</label><input name="contactPhone" maxLength="80" style={field} /></div>
          </div>

          <label style={label}>Enlace público del anuncio</label>
          <input name="sourceUrl" type="url" maxLength="700" style={field} />

          <label style={label}>¿Hay margen de negociación?</label>
          <select name="negotiation" defaultValue="unknown" style={field}>
            <option value="unknown">No se ha hablado</option>
            <option value="open">Sí, se escuchan ofertas</option>
            <option value="after_visit">Se hablaría después de una visita</option>
            <option value="firm">Precio firme</option>
          </select>

          <label style={label}>Qué se ha dicho sobre el precio</label>
          <textarea name="negotiationSignal" rows="3" maxLength="500" placeholder="Ej. ‘podría estudiar una oferta razonable’" style={field} />

          <div style={{ marginTop: 15, display: 'grid', gap: 7 }}>
            <label><input type="checkbox" name="garden" /> Jardín o espacio exterior</label>
            <label><input type="checkbox" name="land" /> Terreno</label>
            <label><input type="checkbox" name="expandable" /> Existe posible redistribución/ampliación para obtener un segundo dormitorio</label>
          </div>

          <label style={label}>Información adicional</label>
          <textarea name="notes" rows="5" maxLength="2000" placeholder="Estado, planta, comunidad, ocupación, cédula, reforma, disponibilidad de visita…" style={field} />

          <label style={{ display: 'block', marginTop: 16 }}>
            <input type="checkbox" name="consent" required /> Confirmo que los datos de contacto que facilito son míos o tengo permiso para compartirlos para esta operación.
          </label>

          <button disabled={state.busy} type="submit" style={{ marginTop: 18, padding: '12px 18px', border: 0, borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
            {state.busy ? 'Enviando…' : 'Enviar vivienda'}
          </button>
        </form>

        {state.result && <div style={{ marginTop: 18, padding: 14, background: state.result.ok ? '#f2fbf5' : '#fff3f3', borderRadius: 10 }}>
          {state.result.ok && state.result.accepted ? <><b>Recibido.</b> Referencia: <code>{state.result.receiptId}</code></> : <><b>No se ha podido enviar.</b> {state.result.error || 'Inténtalo de nuevo.'}</>}
        </div>}
      </section>
    </main>
  );
}
