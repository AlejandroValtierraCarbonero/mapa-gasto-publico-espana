---
id: UX-003
titulo: Lectura e interacción del treemap
prioridad: P1
---

## Hallazgo

El área principal asigna superficie proporcional a los valores positivos y dibuja las partidas negativas fuera del mapa, con un aviso textual. Las etiquetas muestran nombre, importe y porcentaje del nivel; al pasar el ratón aparece un tooltip con porcentaje del total y una indicación de clic cuando existe desglose. El propio tamaño puede producir rectángulos demasiado pequeños para leer su contenido. La navegación por niveles se apoya en el clic y las migas (ver [navegación](UX-001-navegacion.md)).

## Recomendación

Explicar de forma breve cómo interpretar el área y el porcentaje, y ofrecer una alternativa para consultar valores de celdas estrechas o partidas no dibujadas: por ejemplo, una lista/tabla complementaria ordenable o un panel de detalle persistente al seleccionar. No depender del tooltip como único canal para datos o acciones. Hacer explícito cuándo una categoría se puede abrir y qué significa la categoría residual «Otros / no desglosado». Para alternativas textuales completas, activación por teclado y contenido emergente, véanse [treemap y gráficos accesibles](../accesibilidad/treemap-graficos.md), [teclado y foco](../accesibilidad/teclado-foco.md) y [tooltips](../accesibilidad/tooltips.md). Revisar [feedback y estados](UX-006-feedback-estados.md) para comunicar los casos sin datos o con valores excluidos.

## Criterios de aceptación

- Se explica que el área representa el importe positivo dentro del nivel actual y que el porcentaje visible se calcula respecto a ese nivel.
- Es posible consultar nombre e importe aunque una celda no quepa o no se pueda usar hover.
- Las partidas negativas excluidas del área se enumeran con su importe y se distinguen de los valores ausentes.
- «Otros / no desglosado» se explica como diferencia de conciliación, no como categoría económica homogénea.
- La acción de desplegar una categoría se reconoce antes de activarla y no se confunde con una hoja sin más detalle.

## Implementación técnica

- [TEC-006 — Componente treemap y alternativa de datos](../tecnico/TEC-006-componente-treemap.md)
- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-010 — Rendimiento, carga y estados de error](../tecnico/TEC-010-rendimiento-estados.md)


