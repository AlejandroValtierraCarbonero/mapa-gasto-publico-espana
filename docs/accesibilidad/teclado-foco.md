---
id: A11Y-002
titulo: Teclado y foco
criterio_wcag: WCAG 2.2 — 2.1.1, 2.1.2, 2.4.7 y 2.4.11 (AA)
prioridad: Crítica
---

## Hallazgo

Los botones y controles nativos sí forman parte del orden de tabulación, pero las celdas del treemap y las migas interactivas son `div`/`span` con manejadores `onclick`, sin foco ni activación por teclado. Por ello no se puede explorar ni profundizar en el mapa con teclado. Los botones de pestaña Ingresos/Gastos cambian su apariencia, pero no exponen el estado seleccionado. No se define un estilo de foco propio que garantice visibilidad en todos los navegadores y fondos.

## Recomendación

Hacer operables las celdas y migas interactivas con teclado (preferiblemente controles semánticos nativos), con orden predecible y acción equivalente con Enter/Espacio. Exponer el estado de pestaña y no eliminar el indicador de foco; mantener visible el indicador conforme a 2.4.7 y evitar que el foco quede completamente oculto conforme a 2.4.11 (Focus Not Obscured — Minimum); este último criterio no sustituye la verificación de contraste. Para la estructura general, véase [semántica y landmarks](semantica-landmarks.md); para los widgets de datos, [treemap y gráficos](treemap-graficos.md).

## Criterios de aceptación

- Tab alcanza todos los controles, elementos accionables del mapa y migas; Shift+Tab permite regresar sin trampas.
- Cada acción disponible por puntero también se realiza con teclado y el foco no se pierde tras actualizar el contenido.
- El indicador de foco es siempre visible, no queda tapado y satisface el contraste requerido.
- La pestaña activa se identifica programáticamente además de visualmente.


## Referencias UX relacionadas

- [Navegación por niveles y migas de pan](../ux/UX-001-navegacion.md).
- [Lectura e interacción del treemap](../ux/UX-003-treemap.md).

## Implementación técnica

- [TEC-005 — Navegación jerárquica, teclado y foco](../tecnico/TEC-005-teclado-y-navegacion.md)

