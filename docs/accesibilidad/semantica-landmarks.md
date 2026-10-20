---
id: A11Y-003
titulo: Semántica y landmarks
criterio_wcag: WCAG 2.2 — 1.3.1, 2.4.1 y 2.4.6 (AA)
prioridad: Alta
---

## Hallazgo

La página tiene un `header`, un `h1` y un `footer`, pero el contenido principal (resumen, notas y mapa/gráfico) no está dentro de un landmark `main`. Tampoco existe un enlace para saltar directamente al contenido principal. El área de migas (`#crumbs`) no anuncia una navegación ni tiene nombre/jerarquía semántica; sus elementos clicables son spans. La organización del título de evolución y su tabla puede resultar más clara con encabezados y nombres explícitos.

## Recomendación

Definir una estructura de landmarks coherente y un enlace «Saltar al contenido» visible al recibir foco. Marcar las migas como navegación con nombre accesible y jerarquía; mantener encabezados en orden y asociar agrupaciones de controles cuando proceda. Consultar [teclado y foco](teclado-foco.md), [formularios y controles](formularios-controles.md) y [alternativas de gráficos](treemap-graficos.md) para sus interacciones y datos.

## Criterios de aceptación

- Hay un único `main` que contiene los datos interactivos y los mensajes relativos a ellos.
- Se puede saltar el bloque repetido de controles de cabecera con un enlace de salto accesible.
- Los landmarks y las migas tienen nombres y roles comprensibles; la jerarquía de encabezados no omite niveles sin motivo.
- La tabla de evolución tiene encabezados asociados a sus filas/columnas.

## Referencias UX relacionadas

- [Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md).
- [Navegación por niveles y migas de pan](../ux/UX-001-navegacion.md).

## Implementación técnica

- [TEC-001 — Arquitectura actual y límites técnicos](../tecnico/TEC-001-arquitectura-actual.md)
- [TEC-003 — Estructura HTML semántica y landmarks](../tecnico/TEC-003-estructura-semantica.md)
- [TEC-005 — Navegación jerárquica, teclado y foco](../tecnico/TEC-005-teclado-y-navegacion.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)
