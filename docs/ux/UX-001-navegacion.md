---
id: UX-001
titulo: Navegación por niveles y migas de pan
prioridad: P1
---

## Hallazgo

El treemap permite entrar en categorías haciendo clic y volver mediante las migas de pan (`#crumbs`). No hay un control explícito de «subir un nivel» ni un enlace de retorno visible para quien no descubra que las migas anteriores son interactivas. Las celdas con descendientes se distinguen con cursor, pero la navegación depende del ratón. La navegación actual y la interacción con el [treemap](UX-003-treemap.md) están estrechamente ligadas.

## Recomendación

Hacer reconocible y predecible el recorrido: presentar las migas como navegación jerárquica, indicar qué elementos se pueden activar y añadir una acción «Volver al nivel anterior» cuando haya profundidad. La activación por teclado y el foco visible se detallan en [teclado y foco](../accesibilidad/teclado-foco.md). Mantener el contexto (fuente, territorio/sector, desglose y periodo) al entrar y salir de una categoría; al cambiar un filtro que invalida la jerarquía, reiniciar el recorrido y dejarlo claro.

## Criterios de aceptación

- El nivel actual y la ruta completa se identifican sin depender del color o del cursor.
- Cada nivel anterior de la ruta tiene una acción evidente para volver a él; en la raíz no se muestra una acción de retroceso innecesaria.
- Se puede entrar en una categoría y volver al nivel anterior con ratón, teclado y pantalla táctil.
- Cambiar fuente, tipo de vista, sector o territorio evita conservar una ruta que ya no corresponda.
- La navegación por categorías conserva sin ambigüedad los filtros y el periodo seleccionados.

## Implementación técnica

- [TEC-005 — Navegación jerárquica, teclado y foco](../tecnico/TEC-005-teclado-y-navegacion.md)


