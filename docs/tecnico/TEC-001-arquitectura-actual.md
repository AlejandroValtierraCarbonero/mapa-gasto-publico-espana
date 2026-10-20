---
id: TEC-001
titulo: Arquitectura actual y límites técnicos
estado: Implementado
---

# TEC-001 · Arquitectura actual y límites técnicos

## Origen

- [UX-002 — Jerarquía visual y agrupación de controles](../ux/UX-002-jerarquia-visual.md)
- [UX-008 — Evolución temporal y lectura del gráfico](../ux/UX-008-evolucion.md)
- [UX-009 — Rendimiento percibido y espera](../ux/UX-009-rendimiento.md)
- [A11Y-003 — Semántica y landmarks](../accesibilidad/semantica-landmarks.md)
- [A11Y-005 — Lectores de pantalla y ARIA](../accesibilidad/lectores-pantalla-aria.md)

## Estado observado

`index.html` carga scripts clásicos (sin módulos) en este orden: `js/data.js` (Eurostat), `js/trees.js` (jerarquías), `js/treemap.js` (geometría), `js/evolucion.js`, `js/app.js` (aplicación y fuente Eurostat), `js/data_hacienda.js` y `js/hacienda.js` (fuente Hacienda, que reutiliza treemap y evolución). Los `data*.js` son catálogos estáticos grandes. La consulta normal no usa API ni backend. Al cambiar un control se regeneran resumen (`#sum`), migas (`#crumbs`), nota (`#note`) y mapa (`#map`).

## Aplicación técnica

Mantener la consulta sin backend y separar responsabilidades. Cada fuente se normaliza a un contrato de árbol interno antes de renderizar, sin traducir la clasificación presupuestaria de Hacienda a COFOG/SEC:

```js
{ name, value, unit, children: [], residual: false, drillable: true }
```

- `js/treemap.js`: solo geometría.
- Renderizador común (DOM): celdas, lista/tabla alternativa y detalle ([TEC-006](TEC-006-componente-treemap.md)).
- `js/app.js` y `js/hacienda.js`: filtros, contexto metodológico y reinicio de ruta.
- `js/evolucion.js`: recibe series con unidad y medida ([TEC-009](TEC-009-evolucion-y-tablas.md)).
- No mover lógica de interfaz a los archivos de datos.

## Ficheros y límites

| Fichero | Responsabilidad en las mejoras |
|---|---|
| `index.html` | landmarks, grupos, contenedores de detalle y feedback |
| `css/styles.css` | tokens, foco, responsive, contraste, movimiento |
| `js/app.js`, `js/hacienda.js` | estado, rutas, mensajes por fuente |
| `js/trees.js`, `js/treemap.js`, `js/evolucion.js` | clasificaciones, geometría, serie temporal |
| `js/data.js`, `js/data_hacienda.js` | datos: no se modifican por cambios visuales |

Los scripts son globales y la web debe seguir abriéndose desde disco. Migrar a `type="module"` o carga dinámica exige verificar compatibilidad con `file://` y con GitHub Pages; conservar un fallback. La decisión de carga perezosa se basa en mediciones ([TEC-010](TEC-010-rendimiento-estados.md)).

## Relacionados

[TEC-006](TEC-006-componente-treemap.md), [TEC-009](TEC-009-evolucion-y-tablas.md), [TEC-010](TEC-010-rendimiento-estados.md), [TEC-011](TEC-011-fases-implementacion.md).
