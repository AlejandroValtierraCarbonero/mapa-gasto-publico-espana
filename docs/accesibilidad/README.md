# Auditoría de accesibilidad web

Documentación granular de hallazgos y criterios de aceptación para la interfaz del mapa de gasto público. Prioridades expresan orden sugerido de remediación; la documentación no sustituye una validación manual con tecnologías de asistencia.

| ID | Título | WCAG | Prioridad | Documento |
|---|---|---|---|---|
| A11Y-001 | Contraste y uso del color | 1.4.3, 1.4.11, 1.4.1 (AA) | Alta | [contraste.md](contraste.md) |
| A11Y-002 | Teclado y foco | 2.1.1, 2.1.2, 2.4.7, 2.4.11 (AA) | Crítica | [teclado-foco.md](teclado-foco.md) |
| A11Y-003 | Semántica y landmarks | 1.3.1, 2.4.1, 2.4.6 (AA) | Alta | [semantica-landmarks.md](semantica-landmarks.md) |
| A11Y-004 | Treemap y gráficos con alternativas textuales | 1.1.1, 1.3.1 (AA) | Crítica | [treemap-graficos.md](treemap-graficos.md) |
| A11Y-005 | Lectores de pantalla y ARIA | 1.3.1, 4.1.2, 4.1.3 (AA) | Alta | [lectores-pantalla-aria.md](lectores-pantalla-aria.md) |
| A11Y-006 | Movimiento y animaciones | 2.2.2 (AA, si aplica); 2.3.3 (AAA) | Media | [movimiento.md](movimiento.md) |
| A11Y-007 | Ampliación, reflow y espaciado | 1.4.4, 1.4.10, 1.4.12 (AA) | Alta | [zoom-reflow.md](zoom-reflow.md) |
| A11Y-008 | Formularios y controles | 1.3.1, 2.4.6, 3.3.2, 4.1.2 (AA) | Alta | [formularios-controles.md](formularios-controles.md) |
| A11Y-009 | Idioma de la página y términos | 3.1.1, 3.1.2 (AA) | Baja | [idioma.md](idioma.md) |
| A11Y-010 | Contenido al pasar el puntero y tooltips | 1.4.13 (AA) | Alta | [tooltips.md](tooltips.md) |

## Implementación técnica

Índice general: [docs técnico](../tecnico/README.md) · [trazabilidad](../tecnico/trazabilidad.md) · [documentación](../README.md).

| Documento | Documentos técnicos |
|---|---|
| A11Y-001 | [TEC-002](../tecnico/TEC-002-tokens-y-contraste.md), [TEC-006](../tecnico/TEC-006-componente-treemap.md) |
| A11Y-002 | [TEC-005](../tecnico/TEC-005-teclado-y-navegacion.md) |
| A11Y-003 | [TEC-001](../tecnico/TEC-001-arquitectura-actual.md), [TEC-003](../tecnico/TEC-003-estructura-semantica.md), [TEC-005](../tecnico/TEC-005-teclado-y-navegacion.md), [TEC-009](../tecnico/TEC-009-evolucion-y-tablas.md) |
| A11Y-004 | [TEC-006](../tecnico/TEC-006-componente-treemap.md), [TEC-009](../tecnico/TEC-009-evolucion-y-tablas.md) |
| A11Y-005 | [TEC-001](../tecnico/TEC-001-arquitectura-actual.md), [TEC-005](../tecnico/TEC-005-teclado-y-navegacion.md), [TEC-007](../tecnico/TEC-007-aria-y-feedback.md), [TEC-010](../tecnico/TEC-010-rendimiento-estados.md) |
| A11Y-006 | [TEC-002](../tecnico/TEC-002-tokens-y-contraste.md) |
| A11Y-007 | [TEC-006](../tecnico/TEC-006-componente-treemap.md), [TEC-008](../tecnico/TEC-008-responsive-y-reflow.md) |
| A11Y-008 | [TEC-004](../tecnico/TEC-004-controles-y-contexto.md), [TEC-007](../tecnico/TEC-007-aria-y-feedback.md), [TEC-008](../tecnico/TEC-008-responsive-y-reflow.md) |
| A11Y-009 | [TEC-003](../tecnico/TEC-003-estructura-semantica.md), [TEC-007](../tecnico/TEC-007-aria-y-feedback.md), [TEC-009](../tecnico/TEC-009-evolucion-y-tablas.md) |
| A11Y-010 | [TEC-007](../tecnico/TEC-007-aria-y-feedback.md) |

Pruebas y plan: [TEC-012](../tecnico/TEC-012-estrategia-pruebas.md), [TEC-011](../tecnico/TEC-011-fases-implementacion.md).
