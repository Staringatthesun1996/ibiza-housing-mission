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

## Privacidad

Este repositorio y el MCP **no contienen información privada del comprador**. Solo exponen requisitos inmobiliarios generales necesarios para que otros agentes puedan colaborar. La información personal, laboral, familiar y financiera sensible se mantiene fuera del proyecto.

## Registro MCP

Namespace previsto:

`io.github.staringatthesun1996/ibiza-housing-mission`

El archivo `server.json` describe el servidor remoto para el Official MCP Registry.

## Aviso

Las puntuaciones y simulaciones son herramientas de preselección. No sustituyen comprobación registral, urbanística, técnica, jurídica ni aprobación hipotecaria.
