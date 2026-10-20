---
id: UX-008
titulo: Evolución temporal y lectura del gráfico
prioridad: P2
---

## Hallazgo

La casilla «Ver evolución entre años» sustituye el treemap por un gráfico de líneas y una tabla. Se puede elegir importe, variación unitaria o porcentual; en el gráfico se muestran como máximo las diez partidas mayores del último año, mientras la tabla incluye todas las series. Los primeros años y las variaciones sobre una base cero aparecen como guiones. El gráfico usa una etiqueta accesible genérica («Evolución») y no ofrece interacción de detalle sobre puntos.

## Recomendación

Explicar el periodo efectivamente representado y la regla de selección de series, titular el gráfico con la categoría, fuente, unidad y medida actual, y distinguir con una nota el valor no calculable del dato ausente. Vincular leyenda, líneas y filas de tabla con una codificación estable. La coherencia de unidades y advertencias de interpretación se describe en [textos y unidades](UX-007-textos.md); la presentación en pantallas estrechas, en [diseño adaptable](UX-005-responsive.md). La alternativa textual y el nombre accesible del gráfico se detallan en [treemap y gráficos accesibles](../accesibilidad/treemap-graficos.md).

## Criterios de aceptación

- Título y subtítulo muestran fuente, categoría, rango temporal, unidad y medida seleccionada.
- Se explica que el gráfico limita las series a las diez partidas mayores del último año, sin ocultar que la tabla contiene más.
- Los guiones distinguen de forma comprensible el año inicial, la base cero y datos no disponibles.
- Es posible relacionar cada serie del gráfico con su nombre y consultar todos sus valores en la tabla.
- Los importes y variaciones se formatean con unidad y signo consistentes con la fuente seleccionada.

## Implementación técnica

- [TEC-001 — Arquitectura actual y límites técnicos](../tecnico/TEC-001-arquitectura-actual.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)


