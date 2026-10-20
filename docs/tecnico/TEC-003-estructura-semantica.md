---
id: TEC-003
titulo: Estructura HTML semántica y landmarks
estado: Implementado
---

# TEC-003 · Estructura HTML semántica y landmarks

## Origen

- [UX-002 — Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md)
- [A11Y-003 — Semántica y landmarks](../accesibilidad/semantica-landmarks.md)
- [A11Y-009 — Idioma de la página y términos](../accesibilidad/idioma.md)

## Estado actual

`index.html` ya declara `lang="es"` y tiene `header`, `h1` y `footer`, pero resumen, notas y mapa/gráfico quedan fuera de `main`, `#crumbs` es un `div` y no hay enlace de salto.

## Estructura objetivo

```html
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header>…</header>
<main id="contenido" tabindex="-1">
  <nav id="crumbs" aria-label="Ruta de navegación"></nav>
  <section aria-label="Resumen de la selección"><div id="sum"></div></section>
  <div id="note"></div>
  <section aria-labelledby="visual-title"><h2 id="visual-title">Distribución</h2><div id="map"></div></section>
</main>
<footer id="sourceFooter">…</footer>
```

```css
.skip-link { position:absolute; left:.5rem; top:-4rem; }
.skip-link:focus { top:.5rem; }
```

- Un único `main` con datos interactivos y mensajes asociados; encabezados en orden (`h1`, `h2`, `h3` sin saltos).
- Agrupar filtros con `fieldset`/`legend` ([TEC-004](TEC-004-controles-y-contexto.md)); no sustituir etiquetas visibles por placeholders.
- Español como idioma principal; marcar con `lang` cualquier fragmento extranjero y explicar siglas SEC/COFOG en su primera aparición (`<abbr title="…">`).
- La interacción de las migas se define en [TEC-005](TEC-005-teclado-y-navegacion.md).

## Ficheros y validación

`index.html`, `css/styles.css`, y el renderizado dinámico de `js/app.js`, `js/hacienda.js`, `js/evolucion.js`. Comprobar árbol de encabezados y landmarks, salto con teclado, idioma anunciado y que `main` contenga resultados y mensajes.

## Relacionados

[TEC-004](TEC-004-controles-y-contexto.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-009](TEC-009-evolucion-y-tablas.md) (tabla con `caption`).
