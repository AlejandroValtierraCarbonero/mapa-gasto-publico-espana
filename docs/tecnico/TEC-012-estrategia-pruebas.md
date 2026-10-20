---
id: TEC-012
titulo: Estrategia de pruebas técnicas y accesibles
estado: Parcial
---

# TEC-012 · Estrategia de pruebas técnicas y accesibles

## Origen

Los criterios de aceptación de cada documento origen siguen siendo la norma. Consulta la [matriz de trazabilidad](trazabilidad.md) para el listado completo; los documentos cubiertos son:

- UX: [UX-001](../ux/UX-001-navegacion.md), [UX-003](../ux/UX-003-treemap.md), [UX-004](../ux/UX-004-color-legibilidad.md), [UX-005](../ux/UX-005-responsive.md), [UX-006](../ux/UX-006-feedback-estados.md), [UX-007](../ux/UX-007-textos.md), [UX-008](../ux/UX-008-evolucion.md), [UX-009](../ux/UX-009-rendimiento.md)
- Accesibilidad: [A11Y-001](../accesibilidad/contraste.md), [A11Y-002](../accesibilidad/teclado-foco.md), [A11Y-003](../accesibilidad/semantica-landmarks.md), [A11Y-004](../accesibilidad/treemap-graficos.md), [A11Y-005](../accesibilidad/lectores-pantalla-aria.md), [A11Y-006](../accesibilidad/movimiento.md), [A11Y-007](../accesibilidad/zoom-reflow.md), [A11Y-008](../accesibilidad/formularios-controles.md), [A11Y-009](../accesibilidad/idioma.md), [A11Y-010](../accesibilidad/tooltips.md)

## Automático

`tests/project.test.js`, con `node --test`, cubre recursos, datos, geometría, render Eurostat/Hacienda, filtros y navegación. Extender con: estados vacío/no publicado/cero/negativo, coincidencia entre tabla alternativa y mapa, `aria-pressed`, estructura de landmarks y `caption`/`scope` en la tabla de evolución. Las pruebas simuladas no sustituyen a las tecnologías de asistencia.

## Manual

- **Teclado** ([TEC-005](TEC-005-teclado-y-navegacion.md)): Tab/Shift+Tab, Enter/Espacio, Escape, foco tras filtro y navegación, sin trampas.
- **Lector de pantalla** ([TEC-007](TEC-007-aria-y-feedback.md)): NVDA con Firefox/Chrome y VoiceOver con Safari si hay equipo; nombres, roles, estado activo, total, errores y tablas.
- **Reflow** ([TEC-008](TEC-008-responsive-y-reflow.md)): 320/375/768/1280 CSS px, zoom 200 %, espaciado WCAG; sin scroll horizontal global.
- **Contraste y movimiento** ([TEC-002](TEC-002-tokens-y-contraste.md)): celdas HSL reales, foco, deshabilitados y avisos; `prefers-reduced-motion`; ninguna señal solo por color.
- **Datos** ([TEC-006](TEC-006-componente-treemap.md), [TEC-009](TEC-009-evolucion-y-tablas.md)): ambas fuentes, unidades y perímetros, año ausente, cero/negativo/residual, acumulación, nivel y evolución; la alternativa coincide con todos los valores.
- **Rendimiento** ([TEC-010](TEC-010-rendimiento-estados.md)): caché fría/caliente, móvil/escritorio, fuente no seleccionada, fallo y reintento.

Ejecutar `node --test` y abrir la web en local (`file://`) y en GitHub Pages.

## Estado de implementación

**Parcial.** Hecho: `tests/project.test.js` cubre estructura/landmarks, `aria-pressed`, migas y foco, tabla alternativa frente al mapa, contraste ≥ 4,5:1 de todas las celdas HSL generadas, anuncios, cambio de fuente, tabla y SVG de evolución. Pendiente (no automatizable aquí): pruebas manuales con NVDA/VoiceOver, zoom 200 % y espaciado WCAG, y GitHub Pages.

## Relacionados

[TEC-002](TEC-002-tokens-y-contraste.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md), [TEC-009](TEC-009-evolucion-y-tablas.md), [TEC-010](TEC-010-rendimiento-estados.md), [TEC-011](TEC-011-fases-implementacion.md).
