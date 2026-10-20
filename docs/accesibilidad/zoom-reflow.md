---
id: A11Y-007
titulo: Ampliación, reflow y espaciado
criterio_wcag: WCAG 2.2 — 1.4.4, 1.4.10 y 1.4.12 (AA)
prioridad: Alta
---

## Hallazgo

El mapa usa una altura basada en `100vh` con un mínimo de 380 px; cada celda usa posición absoluta y oculta el desbordamiento. Esto puede recortar etiquetas cuando se amplía el texto o se reduce el espacio disponible. La página no declara reglas específicas de reflow/espaciado de texto. La tabla de evolución sí tiene desplazamiento horizontal propio, lo que debe comprobarse para que no provoque desplazamiento bidimensional de toda la página.

## Recomendación

Permitir que el área de mapa se adapte a contenido y tamaño de texto; evitar que el texto de las celdas se trunque sin una alternativa accesible. Probar 200 % de zoom y reflow a 320 CSS px, y el espaciado definido en 1.4.12. Si una tabla requiere desplazamiento horizontal, limitarlo a su contenedor sin impedir el uso del resto de la página. Véanse [gráficos y alternativas textuales](treemap-graficos.md) y [controles](formularios-controles.md).

## Criterios de aceptación

- Al 200 % de zoom, todo el contenido y función siguen disponibles sin pérdida.
- A 320 CSS px de ancho, la página refluye sin desplazamiento horizontal general, salvo contenido que legítimamente requiere dos dimensiones y cuenta con alternativa.
- Con los valores de espaciado de texto WCAG no se recortan ni solapan etiquetas, controles ni avisos.
- Ningún dato se pierde por `overflow: hidden` o por el tamaño fijo de las celdas.

## Referencias UX relacionadas

- [Diseño adaptable y uso en móvil](../ux/UX-005-responsive.md).

## Implementación técnica

- [TEC-006 — Componente treemap y alternativa de datos](../tecnico/TEC-006-componente-treemap.md)
- [TEC-008 — Responsive, reflow y ampliación](../tecnico/TEC-008-responsive-y-reflow.md)
