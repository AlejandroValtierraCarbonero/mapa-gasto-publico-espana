---
id: TEC-009
titulo: Evolución temporal, SVG y tablas accesibles
estado: Implementado
---

# TEC-009 · Evolución temporal, SVG y tablas accesibles

## Origen

- [UX-008 — Evolución temporal y lectura del gráfico](../ux/UX-008-evolucion.md)
- [UX-007 — Microcopy, unidades y contexto de las fuentes](../ux/UX-007-textos.md)
- [UX-005 — Diseño adaptable y uso en móvil](../ux/UX-005-responsive.md)
- [A11Y-004 — Treemap y gráficos con alternativas textuales](../accesibilidad/treemap-graficos.md)
- [A11Y-003 — Semántica y landmarks](../accesibilidad/semantica-landmarks.md)
- [A11Y-009 — Idioma de la página y términos](../accesibilidad/idioma.md)

## Diagnóstico

`js/evolucion.js` genera SVG y tabla. El gráfico dibuja como máximo diez series y la tabla todas; el primer año y la base cero se convierten en `null` y salen como guion. El SVG tiene `aria-label="Evolución"` y la tabla no tiene `caption` ni `scope`.

## Aplicación técnica

- **Título y subtítulo**: fuente/perímetro, categoría, rango temporal, unidad y medida (importe, variación o %).
- **Nota**: «El gráfico muestra las diez partidas mayores del último año; la tabla incluye las N series».
- **Valores**: distinguir «no calculable» (primer año, base cero) de «no disponible»; el guion lleva `title`/texto oculto («No calculable») y una nota explicativa.
- **Codificación estable**: mismo color y orden por serie en líneas, leyenda y filas; nombre y signo visibles en texto, no solo color ([TEC-002](TEC-002-tokens-y-contraste.md)).
- **Tabla equivalente completa**:

```html
<table><caption>Importes por categoría, 2000–2024, millones de euros</caption>
<thead><tr><th scope="col">Partida</th><th scope="col">2000</th></tr></thead>
<tbody><tr><th scope="row">Sanidad</th><td>…</td></tr></tbody></table>
```

- **SVG**: `role="img"` con `aria-labelledby` (`<title>`) y `aria-describedby` (`<desc>` con resumen de tendencia y series omitidas); sin duplicar anuncios.
- Contenedor de tabla con scroll horizontal acotado ([TEC-008](TEC-008-responsive-y-reflow.md)); encabezado de sección propio ([TEC-003](TEC-003-estructura-semantica.md)). Siglas explicadas y texto en español.

## Ficheros y pruebas

`js/evolucion.js`, `js/app.js`, `js/hacienda.js`, `css/styles.css`. Probar importe/delta/porcentaje, un solo año, base cero, huecos, unidad por fuente, encabezados y leyenda ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-002](TEC-002-tokens-y-contraste.md), [TEC-003](TEC-003-estructura-semantica.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md).
