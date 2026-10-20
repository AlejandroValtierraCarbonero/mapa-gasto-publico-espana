---
id: A11Y-005
titulo: Lectores de pantalla y ARIA
criterio_wcag: WCAG 2.2 — 1.3.1, 4.1.2 y 4.1.3 (AA)
prioridad: Alta
---

## Hallazgo

Al cambiar los selectores o pestañas, el mapa, las migas, el total y las notas se reescriben, pero no hay regiones vivas ni foco gestionado que comuniquen el resultado del cambio. El `aria-label` del SVG solo anuncia «Evolución», sin resumir sus datos; el estado visual activo de las pestañas tampoco se expone. El tooltip depende del movimiento del puntero y no tiene asociación accesible. Aunque los controles nativos conservan nombre por sus etiquetas, los elementos dinámicos del mapa no ofrecen rol/estado/nombre de control.

## Recomendación

Proporcionar nombre, rol, estado y valor accesibles para toda interacción. Anunciar con moderación los resultados de cambios relevantes (selección, total, errores/notas), evitando anunciar cada actualización redundante; decidir cuándo conservar foco y cuándo moverlo con una regla consistente. Asociar las descripciones a sus controles sin depender solo de ARIA: preferir HTML semántico nativo. Véanse [treemap y gráficos](treemap-graficos.md), [formularios y controles](formularios-controles.md) y [teclado y foco](teclado-foco.md).

## Criterios de aceptación

- Lector de pantalla identifica el estado seleccionado de cada pestaña y el nombre/valor de cada elemento accionable.
- Los cambios de datos importantes se anuncian una sola vez y en contexto, sin saltos inesperados del foco.
- Ningún dato esencial existe solo en el tooltip o en un atributo ARIA genérico.
- Se comprueba el resultado con lectores de pantalla y navegador representativos; ARIA no duplica ni contradice el texto visible.

## Referencias UX relacionadas

- [Feedback, estados vacíos y cambios de selección](../ux/UX-006-feedback-estados.md).
- [Evolución temporal y lectura del gráfico](../ux/UX-008-evolucion.md).

## Implementación técnica

- [TEC-001 — Arquitectura actual y límites técnicos](../tecnico/TEC-001-arquitectura-actual.md)
- [TEC-005 — Navegación jerárquica, teclado y foco](../tecnico/TEC-005-teclado-y-navegacion.md)
- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-010 — Rendimiento, carga y estados de error](../tecnico/TEC-010-rendimiento-estados.md)
