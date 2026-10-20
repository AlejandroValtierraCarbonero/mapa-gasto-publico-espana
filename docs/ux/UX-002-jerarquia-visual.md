---
id: UX-002
titulo: Jerarquía visual y agrupación de controles
prioridad: P1
---

## Hallazgo

El encabezado agrupa el título, selector de fuente, pestañas de ingresos/gastos, varios filtros y la opción de evolución antes de la visualización. Los controles son funcionales, pero tienen un tratamiento visual bastante uniforme y ocupan varias líneas; no hay una separación clara entre selección de fuente, configuración del mapa y opciones analíticas. El resumen de periodo y saldo aparece después, separado del título y los controles.

## Recomendación

Ordenar la interfaz según la tarea: primero fuente y alcance, después la selección de vista y periodo, y por último las opciones avanzadas. Agrupar los controles relacionados y dar al periodo/alcance activo una ubicación estable junto al mapa. Evitar que las opciones secundarias compitan con la selección principal. Para el comportamiento en pantallas estrechas, consultar [diseño adaptable](UX-005-responsive.md); para el significado de fuente y periodo, ver [textos y unidades](UX-007-textos.md). La estructura y el etiquetado de los controles se relacionan con [formularios y controles accesibles](../accesibilidad/formularios-controles.md).

## Criterios de aceptación

- La persona puede identificar en una lectura rápida qué controles cambian la fuente, qué controles cambian el desglose y cuáles son opciones avanzadas.
- Los filtros activos (incluido el periodo acumulado) permanecen visibles junto a los resultados.
- Los grupos tienen títulos o agrupación visual coherentes y un orden que coincide con el flujo de consulta.
- El encabezado no desplaza el resultado innecesariamente en una ventana de escritorio de altura reducida.
- Al cambiar el tamaño de la ventana, la prioridad visual y el orden de lectura se mantienen.

## Implementación técnica

- [TEC-001 — Arquitectura actual y límites técnicos](../tecnico/TEC-001-arquitectura-actual.md)
- [TEC-003 — Estructura HTML semántica y landmarks](../tecnico/TEC-003-estructura-semantica.md)
- [TEC-004 — Controles, grupos, microcopy y contexto de consulta](../tecnico/TEC-004-controles-y-contexto.md)
- [TEC-008 — Responsive, reflow y ampliación](../tecnico/TEC-008-responsive-y-reflow.md)

