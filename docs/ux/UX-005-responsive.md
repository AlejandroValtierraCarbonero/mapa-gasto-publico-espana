---
id: UX-005
titulo: Diseño adaptable y uso en móvil
prioridad: P1
---

## Hallazgo

Los controles permiten ajustar su línea mediante `flex-wrap`, pero el mapa usa un alto calculado con el viewport y un mínimo fijo de 380 px, además de márgenes laterales de 24 px. No hay reglas específicas por breakpoint. La vista de evolución incluye gráfico y tabla; esta última admite desplazamiento horizontal, mientras el tooltip del treemap depende del movimiento del puntero. El diseño de controles se relaciona con la [jerarquía visual](UX-002-jerarquia-visual.md) y el acceso a datos con el [treemap](UX-003-treemap.md).

## Recomendación

Diseñar y probar una composición móvil explícita: compactar márgenes, permitir controles a ancho completo y ajustar la altura de la visualización al espacio disponible sin bloquear la página. Para interacción táctil, sustituir la dependencia de hover por selección y detalle persistente. La tabla de evolución debe seguir siendo consultable sin desplazamientos confusos y mantener identificable la columna de categorías. Validar también [ampliación, reflow y espaciado](../accesibilidad/zoom-reflow.md).

## Criterios de aceptación

- En anchos de 320, 375, 768 y 1280 px no hay desbordamiento horizontal de la página ni controles superpuestos.
- Los selectores y opciones conservan etiquetas visibles y áreas de toque cómodas.
- En móvil se puede obtener el detalle de cada categoría mediante toque, y cerrar o sustituir ese detalle con claridad.
- El mapa no queda limitado a una altura mínima que obligue a un desplazamiento excesivo antes de ver resultados útiles.
- La evolución y su tabla siguen siendo legibles en móvil; el desplazamiento horizontal, si existe, está acotado a la tabla y es evidente.

## Implementación técnica

- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-008 — Responsive, reflow y ampliación](../tecnico/TEC-008-responsive-y-reflow.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)

