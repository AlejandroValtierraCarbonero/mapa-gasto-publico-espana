# Matriz de trazabilidad

Cada recomendación de UX y accesibilidad y los documentos técnicos que la aplican. Todos los TEC listados enlazan de vuelta a su origen en su sección «Origen». Pruebas de aceptación: [TEC-012](TEC-012-estrategia-pruebas.md); fases: [TEC-011](TEC-011-fases-implementacion.md).

| Recomendación | Documentos técnicos | Estado |
|---|---|---|
| [UX-001 Navegación](../ux/UX-001-navegacion.md) | [TEC-005](TEC-005-teclado-y-navegacion.md) | Implementado |
| [UX-002 Jerarquía visual](../ux/UX-002-jerarquia-visual.md) | [TEC-001](TEC-001-arquitectura-actual.md), [TEC-003](TEC-003-estructura-semantica.md), [TEC-004](TEC-004-controles-y-contexto.md), [TEC-008](TEC-008-responsive-y-reflow.md) | Implementado |
| [UX-003 Treemap](../ux/UX-003-treemap.md) | [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-010](TEC-010-rendimiento-estados.md) | Parcial (TEC-010: sin carga diferida) |
| [UX-004 Color y legibilidad](../ux/UX-004-color-legibilidad.md) | [TEC-002](TEC-002-tokens-y-contraste.md), [TEC-006](TEC-006-componente-treemap.md) | Implementado |
| [UX-005 Responsive](../ux/UX-005-responsive.md) | [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [UX-006 Feedback y estados](../ux/UX-006-feedback-estados.md) | [TEC-004](TEC-004-controles-y-contexto.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-010](TEC-010-rendimiento-estados.md) | Parcial (TEC-010: sin carga diferida) |
| [UX-007 Textos](../ux/UX-007-textos.md) | [TEC-004](TEC-004-controles-y-contexto.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [UX-008 Evolución](../ux/UX-008-evolucion.md) | [TEC-001](TEC-001-arquitectura-actual.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [UX-009 Rendimiento](../ux/UX-009-rendimiento.md) | [TEC-001](TEC-001-arquitectura-actual.md), [TEC-010](TEC-010-rendimiento-estados.md) | Parcial (TEC-010: sin carga diferida) |
| [A11Y-001 Contraste](../accesibilidad/contraste.md) | [TEC-002](TEC-002-tokens-y-contraste.md), [TEC-006](TEC-006-componente-treemap.md) | Implementado |
| [A11Y-002 Teclado y foco](../accesibilidad/teclado-foco.md) | [TEC-005](TEC-005-teclado-y-navegacion.md) | Implementado |
| [A11Y-003 Semántica y landmarks](../accesibilidad/semantica-landmarks.md) | [TEC-001](TEC-001-arquitectura-actual.md), [TEC-003](TEC-003-estructura-semantica.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [A11Y-004 Treemap y gráficos](../accesibilidad/treemap-graficos.md) | [TEC-006](TEC-006-componente-treemap.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [A11Y-005 Lectores de pantalla y ARIA](../accesibilidad/lectores-pantalla-aria.md) | [TEC-001](TEC-001-arquitectura-actual.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-010](TEC-010-rendimiento-estados.md) | Parcial (TEC-010: sin carga diferida) |
| [A11Y-006 Movimiento](../accesibilidad/movimiento.md) | [TEC-002](TEC-002-tokens-y-contraste.md) | Implementado |
| [A11Y-007 Zoom y reflow](../accesibilidad/zoom-reflow.md) | [TEC-006](TEC-006-componente-treemap.md), [TEC-008](TEC-008-responsive-y-reflow.md) | Implementado |
| [A11Y-008 Formularios y controles](../accesibilidad/formularios-controles.md) | [TEC-004](TEC-004-controles-y-contexto.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md) | Implementado |
| [A11Y-009 Idioma](../accesibilidad/idioma.md) | [TEC-003](TEC-003-estructura-semantica.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-009](TEC-009-evolucion-y-tablas.md) | Implementado |
| [A11Y-010 Tooltips](../accesibilidad/tooltips.md) | [TEC-007](TEC-007-aria-y-feedback.md) | Implementado |

Estado: «Parcial» = al menos uno de los TEC enlazados lo está; los TEC-010, TEC-011 y TEC-012 detallan el motivo (carga diferida descartada tras medir; pruebas manuales con lector de pantalla pendientes).
