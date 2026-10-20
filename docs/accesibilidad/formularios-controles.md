---
id: A11Y-008
titulo: Formularios y controles
criterio_wcag: WCAG 2.2 — 1.3.1, 2.4.6, 3.3.2 y 4.1.2 (AA)
prioridad: Alta
---

## Hallazgo

Los `select` y `checkbox` se asocian con etiquetas visibles que los envuelven, lo cual es una base adecuada. Sin embargo, los controles no están agrupados semánticamente por fuente y conjunto, «Medida» se oculta/visualiza dinámicamente, y los botones Ingresos/Gastos no indican su estado a tecnologías de asistencia. Cuando se cambia la fuente, se ocultan controles y se sustituyen datos/notas sin anuncio accesible. El selector deshabilitado se atenúa mediante opacidad.

## Recomendación

Conservar etiquetas explícitas y nombres únicos; agrupar conjuntos relacionados (por ejemplo con `fieldset`/`legend`) y presentar el estado de pestaña de forma programática. Aclarar el efecto de las casillas de acumulación y evolución y el motivo de controles deshabilitados. Asegurar que el cambio de fuente no altera inesperadamente el foco y se comunica, enlazando con [lectores de pantalla y ARIA](lectores-pantalla-aria.md), [contraste](contraste.md) y [semántica](semantica-landmarks.md).

## Criterios de aceptación

- Cada control tiene nombre accesible inequívoco y propósito claro; los grupos relacionados se identifican como grupos.
- El estado activo/inactivo, marcado/desmarcado y habilitado/deshabilitado se comunica visual y programáticamente.
- Cambiar de fuente mantiene una posición de foco lógica y permite identificar la vista y unidad resultantes.
- No se usa solo la opacidad para expresar el estado deshabilitado sin contraste suficiente.

## Referencias UX relacionadas

- [Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md).
- [Feedback, estados vacíos y cambios de selección](../ux/UX-006-feedback-estados.md).
- [Microcopy, unidades y contexto de las fuentes](../ux/UX-007-textos.md).

## Implementación técnica

- [TEC-004 — Controles, grupos, microcopy y contexto de consulta](../tecnico/TEC-004-controles-y-contexto.md)
- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-008 — Responsive, reflow y ampliación](../tecnico/TEC-008-responsive-y-reflow.md)
