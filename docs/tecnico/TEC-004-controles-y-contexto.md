---
id: TEC-004
titulo: Controles, grupos, microcopy y contexto de consulta
estado: Implementado
---

# TEC-004 · Controles, grupos, microcopy y contexto de consulta

## Origen

- [UX-002 — Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md)
- [UX-006 — Feedback, estados vacíos y cambios de selección](../ux/UX-006-feedback-estados.md)
- [UX-007 — Microcopy, unidades y contexto de las fuentes](../ux/UX-007-textos.md)
- [A11Y-008 — Formularios y controles](../accesibilidad/formularios-controles.md)

## Organización y microcopy

En `index.html`, separar tres grupos en el orden de lectura visual: fuente y alcance, vista y periodo, opciones avanzadas (acumulación, evolución). Cada grupo con `fieldset`/`legend`; el periodo/alcance activo permanece junto al mapa en `#sum`.

```html
<fieldset><legend>Consulta Eurostat</legend>
 <label for="selSector">Administración</label>
 <select id="selSector" aria-describedby="sector-help"></select>
 <p id="sector-help">Los subsectores no están consolidados.</p>
</fieldset>
```

- Unidad junto a cada cifra (mapa, tooltip/detalle, evolución y resumen): Eurostat «M€» (millones de euros); Hacienda «miles de €».
- «Total CCAA»: perímetro consolidado de liquidación autonómica, no gasto público total de España ni todo el gasto territorializado.
- Nombrar la clasificación en cada etiqueta de desglose: COFOG/SEC (Eurostat) frente a áreas/políticas/capítulos presupuestarios (Hacienda); no usar «área», «política», «función» y «capítulo» como sinónimos.
- Al cambiar de fuente mostrar un aviso breve: la base y la clasificación cambian y no procede comparar cifras directamente.
- Notas largas: resumen de una o dos frases visible (con las advertencias que afectan a la interpretación) y el detalle completo en `<details><summary>Ver nota metodológica completa</summary>…</details>`.

## Estado de filtros

`app.js` reinicia `path` al cambiar vista o sector; `hacienda.js` al cambiar territorio, vista o año. Aplicar la misma regla al cambiar de fuente. Los años deshabilitados se explican con texto y rango válido («Este desglose no se publica para ese año; disponible 2010–2023») mediante `aria-describedby`, no solo con opacidad (`:disabled` con contraste verificable, [TEC-002](TEC-002-tokens-y-contraste.md)). La casilla de acumulación explica que habilita el año inicial. «Medida» oculta/visible se gestiona con `hidden` y se anuncia ([TEC-007](TEC-007-aria-y-feedback.md)). Ingresos/Gastos reflejan estado con `aria-pressed`. Al cambiar de fuente el foco permanece en el selector de fuente.

## Ficheros

`index.html` (grupos, nombres, ayudas), `js/app.js`, `js/hacienda.js` (etiquetas, contexto, rutas), `css/styles.css` (orden, áreas táctiles ≥ 44 px, [TEC-008](TEC-008-responsive-y-reflow.md)).

## Relacionados

[TEC-002](TEC-002-tokens-y-contraste.md), [TEC-003](TEC-003-estructura-semantica.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md), [TEC-010](TEC-010-rendimiento-estados.md).
