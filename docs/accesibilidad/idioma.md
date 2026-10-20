---
id: A11Y-009
titulo: Idioma de la página y términos
criterio_wcag: WCAG 2.2 — 3.1.1 y 3.1.2 (AA)
prioridad: Baja
---

## Hallazgo

El documento declara correctamente `lang="es"` y el contenido visible, controles y mensajes están principalmente en español. El nombre accesible genérico del gráfico y las abreviaturas de clasificaciones (p. ej., COFOG, SEC) pueden no comunicar suficientemente el propósito a algunos usuarios. No se identifican segmentos de idioma extranjero que requieran una marca propia; si se incorporan más adelante, el idioma del segmento no queda cubierto por el idioma global.

## Recomendación

Mantener el atributo de idioma raíz y etiquetar con `lang` cualquier segmento en otro idioma. Explicar siglas en su primera aparición o en una ayuda textual disponible, y asegurar que nombres y descripciones de gráficos estén en el idioma declarado. Véanse [lectores de pantalla y ARIA](lectores-pantalla-aria.md) y [alternativas de gráficos](treemap-graficos.md).

## Criterios de aceptación

- El idioma predeterminado del documento es español válido y coincide con el contenido principal.
- Todo segmento en otro idioma se marca con su idioma cuando sea necesario para la pronunciación.
- Las siglas y unidades no imprescindibles para comprender el contenido están explicadas o tienen una descripción accesible en contexto.

## Referencias UX relacionadas

- [Microcopy, unidades y contexto de las fuentes](../ux/UX-007-textos.md).

## Implementación técnica

- [TEC-003 — Estructura HTML semántica y landmarks](../tecnico/TEC-003-estructura-semantica.md)
- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)
