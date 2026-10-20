---
id: UX-007
titulo: Microcopy, unidades y contexto de las fuentes
prioridad: P1
---

## Hallazgo

El selector distingue «Eurostat — Contabilidad Nacional» y «Hacienda — liquidación presupuestaria CCAA». Eurostat presenta importes en millones de euros; Hacienda, en miles de euros. Las notas advierten de diferencias de base contable, periodo, consolidación y clasificación, pero su extensión dificulta la lectura rápida. «Territorio» y «Total CCAA» en la fuente Hacienda pueden confundirse con gasto público total localizado en esa comunidad; no son equivalentes a los sectores de Eurostat. La interfaz ofrece desgloses COFOG para Eurostat y áreas/políticas/capítulos propios para Hacienda.

## Recomendación

Usar etiquetas concretas y unidades junto a cada total, e introducir la diferencia metodológica en el momento de cambiar de fuente. Aclarar qué representa «Total CCAA» y evitar que «área», «política», «función» y «capítulo» parezcan clasificaciones intercambiables. Convertir las notas largas en una explicación resumida con acceso al detalle, y usar el mismo vocabulario en controles, sumario, notas y pie de fuente. Relacionar los avisos de interpretación con [estados y feedback](UX-006-feedback-estados.md).

## Criterios de aceptación

- Cada cifra visible comunica su unidad (M€ o miles de €) junto a ella, también en el mapa, tooltip, evolución y resumen.
- El cambio de fuente indica que la clasificación y la base de los datos cambian y que no procede comparar directamente las cifras.
- «Total CCAA» se identifica como perímetro de liquidación autonómica consolidada, no como gasto público total de España ni todo el gasto territorializado.
- Las etiquetas de desglose identifican la clasificación usada (COFOG frente a clasificación presupuestaria de Hacienda).
- Las notas se pueden escanear rápidamente y el contenido metodológico completo continúa disponible.

## Implementación técnica

- [TEC-004 — Controles, grupos, microcopy y contexto de consulta](../tecnico/TEC-004-controles-y-contexto.md)
- [TEC-009 — Evolución temporal, SVG y tablas accesibles](../tecnico/TEC-009-evolucion-y-tablas.md)
