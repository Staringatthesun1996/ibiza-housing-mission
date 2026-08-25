# Ibiza Housing Mission

Servicio MCP público para descubrir y evaluar oportunidades de vivienda habitual en Ibiza.

## Objetivo público

- Precio objetivo: hasta 230.000 €.
- Excepcionalmente hasta 250.000 € si la operación es especialmente sólida.
- Requisito esencial: 2 dormitorios reales o posibilidad razonable y legal de crear el segundo mediante redistribución o ampliación.
- Se admiten viviendas con jardín, terraza grande o terreno cuando exista potencial urbanístico verificable para ampliación.
- Se penalizan ruina, ocupación, uso no residencial, no hipotecabilidad y problemas jurídicos graves.

## MCP remoto

Endpoint público de producción:

`https://ibiza-housing-mission-v2-davidperezmastersecundaria-4287.vercel.app/api/mcp`

Transporte: `streamable-http`.

## Herramientas

- `get_public_housing_brief`: devuelve el mandato inmobiliario público.
- `evaluate_property`: puntúa un inmueble con criterios deterministas y auditables.
- `mortgage_scenario`: calcula cuota orientativa y escenario de estrés.
- `submit_property`: permite que otros agentes entreguen una oportunidad de vivienda. Valida municipio, URL HTTPS, precio, superficie, dormitorios, potencial de ampliación y riesgos básicos; genera un `receiptId` estable para deduplicación y coloca los candidatos válidos en la cola operativa.

## Cola de oportunidades

La versión 1.1.0 registra cada envío como un evento estructurado `PROPERTY_SUBMISSION` en los runtime logs de Vercel. Es una capa de ingesta operativa inmediata. La interfaz de `submit_property` está diseñada para que el almacenamiento pueda migrarse posteriormente a una base persistente sin romper compatibilidad con los agentes que ya la utilicen.

Se filtran antes de encolar:

- inmuebles fuera de la isla de Ibiza;
- precios por encima del sobre de búsqueda operativo;
- ruina, ocupación ilegal, nuda propiedad/usufructo, uso no residencial o no hipotecabilidad;
- inmuebles sin dos dormitorios ni una vía razonable hacia el segundo dormitorio.

## Privacidad y anti-spam

Este repositorio y el MCP **no contienen información privada del comprador**. `submit_property` tampoco solicita datos privados del propietario. Solo admite información del inmueble, URL pública o compartible y un identificador textual del agente remitente.

No deben enviarse credenciales, documentos confidenciales, teléfonos/emails privados, datos familiares, laborales o financieros sensibles del comprador, ni información personal no destinada a difusión.

## Registro MCP

Servidor publicado en el Official MCP Registry como:

`io.github.Staringatthesun1996/ibiza-housing-mission`

Versión con ingesta de oportunidades: `1.1.0`.

El archivo `server.json` describe el servidor remoto para el Official MCP Registry.

## Aviso

Las puntuaciones y simulaciones son herramientas de preselección. No sustituyen comprobación registral, urbanística, técnica, jurídica ni aprobación hipotecaria.
