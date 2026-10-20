---
id: TEC-011
titulo: Plan de implementación por fases
estado: Parcial
---

# TEC-011 · Plan de implementación por fases

## Origen

Consolida todos los TEC y las prioridades de [UX](../ux/README.md) y [accesibilidad](../accesibilidad/README.md). Documentos específicos de cada fase:

- [UX-001 — Navegación](../ux/UX-001-navegacion.md), [UX-002 — Jerarquía visual](../ux/UX-002-jerarquia-visual.md), [UX-008 — Evolución](../ux/UX-008-evolucion.md), [UX-009 — Rendimiento](../ux/UX-009-rendimiento.md)
- [A11Y-002 — Teclado y foco](../accesibilidad/teclado-foco.md), [A11Y-004 — Treemap y gráficos](../accesibilidad/treemap-graficos.md), [A11Y-007 — Zoom y reflow](../accesibilidad/zoom-reflow.md)

## Fases

Orden propuesto para reducir riesgo; las diferencias metodológicas entre Hacienda y Eurostat se mantienen explícitas en todo momento.

1. **Estructura (P1)** — landmarks, enlace de salto, grupos, títulos, unidad y contexto de fuente. `index.html`, `css/styles.css`. → [TEC-003](TEC-003-estructura-semantica.md), [TEC-004](TEC-004-controles-y-contexto.md)
2. **Navegación (P1)** — botones semánticos, migas como `nav`, retroceso, `aria-pressed`, foco visible y regla de foco. `js/app.js`, `js/hacienda.js`, `css/styles.css`. → [TEC-005](TEC-005-teclado-y-navegacion.md)
3. **Datos y feedback (P1)** — alternativa sincronizada, detalle persistente, anuncios moderados, estados diferenciados. → [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md)
4. **Legibilidad (P1)** — tokens, ratios, leyenda, móvil, zoom y reflow, movimiento. `css/styles.css` y renderizadores. → [TEC-002](TEC-002-tokens-y-contraste.md), [TEC-008](TEC-008-responsive-y-reflow.md)
5. **Evolución (P2)** — título contextual, tabla semántica, límite de diez series, bases no calculables. `js/evolucion.js`. → [TEC-009](TEC-009-evolucion-y-tablas.md)
6. **Carga (P2, condicionada)** — medir; carga diferida solo si mejora, con caché, progreso, error y reintento. → [TEC-010](TEC-010-rendimiento-estados.md)

La arquitectura base está en [TEC-001](TEC-001-arquitectura-actual.md). Cada fase requiere pruebas automáticas y manuales ([TEC-012](TEC-012-estrategia-pruebas.md)), no solo inspección visual. No cambiar cifras ni convertir categorías o unidades durante la refactorización. La matriz de cobertura está en la [trazabilidad](trazabilidad.md).

## Estado de implementación

Fases 1–5 **implementadas** (`index.html`, `css/styles.css`, `js/ui.js` nuevo módulo compartido, `js/app.js`, `js/hacienda.js`, `js/evolucion.js`). Fase 6 **parcial**: estados, error y reintento hechos; carga diferida descartada tras medir (ver [TEC-010](TEC-010-rendimiento-estados.md)). Cifras, fuentes y metodologías no se modificaron.

## Relacionados

Todos los TEC; ver [índice](README.md).
