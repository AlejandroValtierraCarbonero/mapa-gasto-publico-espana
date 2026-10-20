---
id: UX-006
titulo: Feedback, estados vacíos y cambios de selección
prioridad: P1
---

## Hallazgo

La página muestra un mensaje «Sin datos para esta selección» cuando no se generan celdas y publica avisos de rango disponible, partidas negativas y falta de consolidación. Los años sin el desglose elegido se deshabilitan y el selector de año inicial se habilita con la casilla de acumulación. En Hacienda, la nota metodológica queda bajo los controles y puede ser larga. No hay una confirmación persistente breve de los cambios ni un estado de carga, aunque los datos se incluyen localmente. La unidad y las diferencias de fuente se tratan en [textos y unidades](UX-007-textos.md); para la selección del mapa, ver [treemap](UX-003-treemap.md).

## Recomendación

Diseñar estados diferenciados para carga, resultado vacío, dato no disponible, valor excluido y selección activa. Tras cada cambio, actualizar de forma consistente el resumen y el mapa, y comunicar por qué un filtro está deshabilitado. Convertir notas extensas en un resumen con acceso a explicación completa, manteniendo visibles las advertencias que afectan a la interpretación. Si se optimiza la carga, añadir un estado de espera perceptible (ver [rendimiento percibido](UX-009-rendimiento.md)).

## Criterios de aceptación

- Cada cambio de fuente, territorio/sector, desglose y periodo actualiza el resumen con el contexto aplicado.
- «Sin datos», «dato no publicado», «partida negativa no representada» y «cero» no se usan como estados intercambiables.
- Los años deshabilitados explican por qué no están disponibles y el intervalo válido es comprensible.
- Las advertencias sobre consolidación, homogeneidad o comparabilidad son visibles antes de extraer conclusiones.
- Si existe una carga perceptible, se indica qué está ocurriendo y la interfaz no parece congelada.

## Implementación técnica

- [TEC-004 — Controles, grupos, microcopy y contexto de consulta](../tecnico/TEC-004-controles-y-contexto.md)
- [TEC-007 — ARIA, regiones vivas y contenido emergente](../tecnico/TEC-007-aria-y-feedback.md)
- [TEC-010 — Rendimiento, carga y estados de error](../tecnico/TEC-010-rendimiento-estados.md)
