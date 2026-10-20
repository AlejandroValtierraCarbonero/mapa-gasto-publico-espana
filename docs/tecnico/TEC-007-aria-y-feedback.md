---
id: TEC-007
titulo: ARIA, regiones vivas y contenido emergente
estado: Implementado
---

# TEC-007 · ARIA, regiones vivas y contenido emergente

## Origen

- [UX-006 — Feedback, estados vacíos y cambios de selección](../ux/UX-006-feedback-estados.md)
- [UX-003 — Lectura e interacción del treemap](../ux/UX-003-treemap.md)
- [UX-005 — Diseño adaptable y uso en móvil](../ux/UX-005-responsive.md)
- [A11Y-005 — Lectores de pantalla y ARIA](../accesibilidad/lectores-pantalla-aria.md)
- [A11Y-008 — Formularios y controles](../accesibilidad/formularios-controles.md)
- [A11Y-010 — Contenido al pasar el puntero y tooltips](../accesibilidad/tooltips.md)
- [A11Y-009 — Idioma de la página y términos](../accesibilidad/idioma.md)

## Anuncios

Los cambios reescriben `#map`, migas, total y notas sin anuncio. Añadir una región viva vacía en `index.html` y actualizarla una sola vez por acción relevante; no marcar mapa ni tabla como `aria-live`.

```html
<p id="announcement" class="visually-hidden" aria-live="polite" aria-atomic="true"></p>
```

```css
.visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
```

Ejemplo: «Gastos, 2024, 1.234 M€, nivel Sanidad». `role="status"` para carga y actualización normal; `role="alert"` solo para errores que exijan atención. Los estados vacío, no publicado, cero, negativo excluido y error tienen textos distintos ([TEC-010](TEC-010-rendimiento-estados.md)). Ingresos/Gastos son botones de alternancia con `aria-pressed` actualizado en cada clic (preferible a un patrón `tablist` complejo). El texto ARIA no duplica ni contradice el visible.

## Detalle emergente

`#tip` depende de `mousemove`, no recibe foco y tiene `pointer-events:none`. Preferir un panel de detalle persistente (clic, teclado o toque; se sustituye al elegir otra celda y se cierra con Escape o botón «Cerrar»), especialmente en táctil ([TEC-008](TEC-008-responsive-y-reflow.md)). Si se mantiene tooltip: abrir en hover y foco, asociar con `aria-describedby`, permitir entrar con el puntero (quitar `pointer-events:none`) y descartar con Escape sin mover foco ni puntero. El tooltip no contiene acciones; para contenido interactivo usar el panel. Ningún valor vive solo en el tooltip: está en la tabla de [TEC-006](TEC-006-componente-treemap.md).

## Nombre accesible del gráfico

El SVG de evolución recibe nombre contextual con métrica, unidad, categoría y periodo, y una descripción (detalle en [TEC-009](TEC-009-evolucion-y-tablas.md)); se evita el `aria-label="Evolución"` genérico.

## Ficheros y pruebas

`index.html`, `js/app.js`, `js/hacienda.js`, `js/evolucion.js`, `css/styles.css`. Probar con lector de pantalla: anuncio único, roles/estados, foco estable, apertura y cierre con Escape ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-004](TEC-004-controles-y-contexto.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-008](TEC-008-responsive-y-reflow.md), [TEC-009](TEC-009-evolucion-y-tablas.md), [TEC-010](TEC-010-rendimiento-estados.md).
