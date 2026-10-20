---
id: TEC-008
titulo: Responsive, reflow y ampliación
estado: Implementado
---

# TEC-008 · Responsive, reflow y ampliación

## Origen

- [UX-005 — Diseño adaptable y uso en móvil](../ux/UX-005-responsive.md)
- [UX-002 — Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md)
- [A11Y-007 — Ampliación, reflow y espaciado](../accesibilidad/zoom-reflow.md)
- [A11Y-008 — Formularios y controles](../accesibilidad/formularios-controles.md)

## Diagnóstico

`#map` mide `calc(100vh - 250px)` con mínimo de 380 px y márgenes laterales de 24 px; las celdas son absolutas con `overflow:hidden`; no hay breakpoints.

## Propuesta (`css/styles.css`)

```css
#map { height:min(68vh,44rem); min-height:18rem; margin-inline:clamp(.75rem,3vw,1.5rem); }
.evo-wrap { max-width:100%; overflow-x:auto; }
@media (max-width:40rem) {
 header { padding:1rem .75rem .5rem; }
 .controls { align-items:stretch; flex-direction:column; gap:.75rem; }
 .controls select { max-width:100%; min-height:2.75rem; }
 #map { height:55vh; min-height:16rem; }
}
@media (max-height:40rem) { header { position:static; } }
```

- Mantener el scroll normal de página; la tabla alternativa ([TEC-006](TEC-006-componente-treemap.md)) fluye en el documento y puede ser el contenido principal en pantallas estrechas.
- Selectores y casillas con etiqueta visible y área táctil ≥ 44 px.
- El scroll horizontal solo dentro del contenedor de la tabla de evolución, con su primera columna (`th scope="row"`) fija mediante `position:sticky; left:0` para mantener identificables las categorías ([TEC-009](TEC-009-evolucion-y-tablas.md)).
- En táctil el hover se sustituye por selección y detalle persistente con acción de cerrar o reemplazar ([TEC-007](TEC-007-aria-y-feedback.md)).
- Ninguna cabecera sticky puede tapar el foco (`scroll-padding-top`, [TEC-005](TEC-005-teclado-y-navegacion.md)).
- Texto con unidades relativas (`rem`) para respetar zoom 200 % y espaciado WCAG 1.4.12 sin recortes.

## Ficheros y verificación

`css/styles.css`, `index.html`, `js/app.js`, `js/hacienda.js`. Verificar a 320/375/768/1280 CSS px, zoom 200 % y espaciado de texto: sin scroll horizontal global, sin solapamientos, etiquetas legibles y detalle táctil operativo ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-004](TEC-004-controles-y-contexto.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-009](TEC-009-evolucion-y-tablas.md).
