---
id: TEC-006
titulo: Componente treemap y alternativa de datos
estado: Implementado
---

# TEC-006 · Componente treemap y alternativa de datos

## Origen

- [UX-003 — Lectura e interacción del treemap](../ux/UX-003-treemap.md)
- [UX-004 — Color, etiquetas y legibilidad del mapa](../ux/UX-004-color-legibilidad.md)
- [A11Y-004 — Treemap y gráficos con alternativas textuales](../accesibilidad/treemap-graficos.md)
- [A11Y-001 — Contraste y uso del color](../accesibilidad/contraste.md)
- [A11Y-007 — Ampliación, reflow y espaciado](../accesibilidad/zoom-reflow.md)

## Datos y geometría

`js/treemap.js` expone `squarify(items,x,y,w,h)`: descarta importes no positivos, ordena por valor y devuelve rectángulos. `app.js` y `hacienda.js` calculan proporciones y DOM. La geometría se mantiene separada de la accesibilidad; cada fila de datos lleva nombre, importe, unidad, porcentaje, estado residual y acción:

```js
const rows = items.map(({node,val,residual}) => ({
 id: stableId(node), name: node.name, amount: val, unit,
 share: parentValue ? val / parentValue * 100 : null,
 residual: Boolean(residual), drillable: hasChildren(node)
}));
```

## Explicación junto al mapa

Texto breve: el área representa los importes positivos del nivel actual y el porcentaje es la proporción respecto a ese nivel. «Otros / no desglosado» es una diferencia de conciliación, no una categoría económica homogénea. Las partidas negativas, que no se dibujan, se enumeran con su importe; cero y dato ausente son estados distintos ([TEC-010](TEC-010-rendimiento-estados.md)). Las celdas con desglose se reconocen antes de activarlas (icono/etiqueta «Abrir»).

## Alternativa equivalente

Añadir una tabla jerárquica sincronizada con el mapa, con `caption`, `th scope` y columnas: nombre, importe + unidad, porcentaje, tipo (residual/negativa) y botón «Abrir desglose». Permite consultar celdas pequeñas, usar teclado ([TEC-005](TEC-005-teclado-y-navegacion.md)) y táctil sin hover. Se construye con nodos DOM y `textContent`, nunca interpolando datos en `innerHTML`. Las etiquetas del mapa pueden adaptarse u omitirse según el espacio, pero ningún dato se pierde por `overflow:hidden` (valor completo en la tabla y en el detalle persistente, [TEC-007](TEC-007-aria-y-feedback.md)).

## Ficheros y pruebas

`js/treemap.js`, `js/app.js`, `js/hacienda.js`, `index.html`, `css/styles.css`. Ampliar `tests/project.test.js`: coincidencia tabla/mapa, dimensiones, cero/negativo/residual; manualmente contraste, zoom 200 % y reflow a 320 px ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-002](TEC-002-tokens-y-contraste.md), [TEC-005](TEC-005-teclado-y-navegacion.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-008](TEC-008-responsive-y-reflow.md), [TEC-009](TEC-009-evolucion-y-tablas.md).
