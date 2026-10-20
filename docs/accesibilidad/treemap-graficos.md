---
id: A11Y-004
titulo: Treemap y gráficos con alternativas textuales
criterio_wcag: WCAG 2.2 — 1.1.1 y 1.3.1 (AA)
prioridad: Crítica
---

## Hallazgo

El treemap comunica valores mediante tamaño y color. Sus celdas muestran nombre e importe, pero no forman una alternativa completa, programáticamente navegable ni operable. La vista de evolución dibuja un SVG con `role="img"` y un `aria-label` genérico («Evolución»); la tabla HTML de valores que aparece junto al gráfico sí aporta datos equivalentes, pero carece de `caption` y de asociación explícita de encabezados. No hay un resumen textual de tendencias o de los elementos omitidos en el gráfico (se limita a las diez partidas principales).

## Recomendación

Aportar una representación accesible y completa de todos los datos del treemap (por ejemplo, tabla jerárquica/lista con etiqueta, importe, porcentaje, nivel y acción de profundización), sincronizada con la visualización. En evolución, describir el gráfico con un nombre y resumen útiles y conservar la tabla como alternativa equivalente; indicar claramente unidades, periodo, valores ausentes y series no dibujadas. Asegurar que la tabla se navega con semántica de encabezados. Véanse [lectores de pantalla y ARIA](lectores-pantalla-aria.md), [semántica y landmarks](semantica-landmarks.md) y [contraste y color](contraste.md).

## Criterios de aceptación

- Toda cifra y relación jerárquica disponible visualmente puede obtenerse en texto, sin pérdida de datos.
- La alternativa informa de nombre, unidad, periodo, porcentaje, valores negativos/ausentes y límites del gráfico.
- El SVG tiene descripción específica y la tabla asociada posee título, encabezados correctamente relacionados y navegación usable.
- La interacción para abrir/cerrar un nivel se ofrece en la alternativa textual y es operable con teclado.

## Referencias UX relacionadas

- [Lectura e interacción del treemap](../ux/UX-003-treemap.md).
- [Evolución temporal y lectura del gráfico](../ux/UX-008-evolucion.md).

## Implementación técnica

- [TEC-006 — Componente treemap y alternativa de datos](../tecnico/TEC-006-componente-treemap.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)
