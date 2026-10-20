---
id: UX-004
titulo: Color, etiquetas y legibilidad del mapa
prioridad: P1
---

## Hallazgo

Las celdas reciben tonos HSL según la posición de la categoría en la jerarquía; el tono cambia por grupo, mientras las categorías descendientes comparten familias de color. Las hojas residuales son grises y los importes negativos se señalan en rojo/verde en el resumen o en avisos. No se muestra una leyenda que explique la codificación cromática. En cada celda, el texto blanco puede competir con tonos de luminosidad variable y el contenido se recorta por `overflow: hidden`.

## Recomendación

Definir una codificación cromática con significado explícito y leyenda, o usar el color solo como diferenciación decorativa y decirlo. Comprobar contraste y tamaño de texto en todas las familias de tonos; no codificar el estado únicamente con rojo/verde. Adaptar o reducir etiquetas según el espacio disponible y conservar el detalle completo mediante una alternativa textual. Los aspectos de interacción y acceso a la información se desarrollan en [treemap](UX-003-treemap.md) y [navegación](UX-001-navegacion.md); validar los requisitos específicos en [contraste y uso del color](../accesibilidad/contraste.md).

## Criterios de aceptación

- La leyenda aclara si el color identifica categorías, tipos de dato o solo diferencia visualmente las celdas.
- Los nombres e importes mantienen legibilidad en las celdas pequeñas y en cada tono utilizado; no se pierde información de forma silenciosa por recorte.
- Los estados positivos, negativos y residuales se pueden distinguir también por texto, icono o etiqueta, no solo por color.
- La paleta se mantiene consistente al cambiar de nivel, vista y fuente, sin sugerir comparabilidad donde no la hay.
- Contraste y legibilidad se verifican sobre los estados reales del mapa, no únicamente sobre los colores de fondo de la página.

## Implementación técnica

- [TEC-002 — Tokens CSS, color, leyenda y movimiento](../tecnico/TEC-002-tokens-y-contraste.md)
- [TEC-006 — Componente treemap y alternativa de datos](../tecnico/TEC-006-componente-treemap.md)

