---
id: A11Y-001
titulo: Contraste y uso del color
criterio_wcag: WCAG 2.2 — 1.4.3, 1.4.11 y 1.4.1 (AA)
prioridad: Alta
---

## Hallazgo

La interfaz usa texto claro sobre una base oscura; los colores de texto generales parecen legibles, pero no hay una comprobación documentada de ratios. El treemap genera fondos dinámicos HSL y dibuja texto blanco encima: ciertos tonos claros pueden no alcanzar 4,5:1 para texto normal. Los estados «positivo/negativo» y los datos de evolución emplean color; el saldo también lleva texto, pero conviene comprobar que el color no sea la única señal y medir los bordes de los controles y celdas.

## Recomendación

Medir cada combinación efectiva, incluidas todas las variantes de color generadas, etiquetas pequeñas, texto de celdas, estados deshabilitados y foco. Garantizar 4,5:1 en texto normal y 3:1 en texto grande; para límites, indicadores y componentes gráficos necesarios, 3:1 frente a colores adyacentes. Añadir signo/etiqueta explícitos a cualquier dato cuyo significado se exprese por color. Véanse también [teclado y foco](teclado-foco.md) y [gráficos y alternativas textuales](treemap-graficos.md).

## Criterios de aceptación

- Un informe de contraste cubre fondo, controles, avisos, celdas, texto sobre HSL dinámico y estados normales/deshabilitados.
- Todo texto cumple los ratios AA aplicables; todo límite/indicador visual necesario cumple 3:1.
- Ninguna diferencia de datos depende exclusivamente del color.

## Referencias UX relacionadas

- [Color, etiquetas y legibilidad del mapa](../ux/UX-004-color-legibilidad.md).

## Implementación técnica

- [TEC-002 — Tokens CSS, color, leyenda y movimiento](../tecnico/TEC-002-tokens-y-contraste.md)
- [TEC-006 — Componente treemap y alternativa de datos](../tecnico/TEC-006-componente-treemap.md)
