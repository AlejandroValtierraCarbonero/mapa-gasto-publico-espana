---
id: A11Y-010
titulo: Contenido al pasar el puntero y tooltips
criterio_wcag: WCAG 2.2 — 1.4.13 (AA)
prioridad: Alta
---

## Hallazgo

El tooltip `#tip` solo se muestra al mover el puntero (`mousemove`) sobre las celdas y desaparece al salir de ellas. No hay disparador de foco ni mecanismo para descartar el contenido, mover el puntero sobre el propio tooltip o mantenerlo visible. Además, como las celdas no reciben foco, el detalle ampliado no es alcanzable con teclado ni lector de pantalla.

## Recomendación

Hacer que cualquier detalle adicional aparezca al recibir foco, permanezca visible mientras el puntero se mueve sobre el contenido y pueda descartarse sin mover foco/puntero (por ejemplo, Escape), conforme a 1.4.13. No ocultar información esencial en el tooltip: ofrecerla también en texto persistente/alternativo. Véanse [teclado y foco](teclado-foco.md), [gráficos y alternativas textuales](treemap-graficos.md) y [lectores de pantalla](lectores-pantalla-aria.md).

## Criterios de aceptación

- El contenido emergente está disponible al hover y al foco, y es persistente hasta que el usuario lo descarta o retira el disparador.
- Se puede mover el puntero sobre el tooltip sin que desaparezca; existe una forma de descartarlo sin desplazar foco/puntero.
- La información del tooltip está disponible también en la alternativa textual, sin depender exclusivamente de hover.

## Referencias UX relacionadas

- [Lectura e interacción del treemap](../ux/UX-003-treemap.md).
- [Diseño adaptable y uso en móvil](../ux/UX-005-responsive.md).

## Implementación técnica

- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
