---
id: TEC-010
titulo: Rendimiento, carga y estados de error
estado: Parcial
---

# TEC-010 · Rendimiento, carga y estados de error

## Origen

- [UX-009 — Rendimiento percibido y espera](../ux/UX-009-rendimiento.md)
- [UX-006 — Feedback, estados vacíos y cambios de selección](../ux/UX-006-feedback-estados.md)
- [UX-003 — Lectura e interacción del treemap](../ux/UX-003-treemap.md)
- [A11Y-005 — Lectores de pantalla y ARIA](../accesibilidad/lectores-pantalla-aria.md)

## Medición y carga

`index.html` carga `js/data.js` (≈ 3,8 MB) y `js/data_hacienda.js` (≈ 2,9 MB) antes de inicializar, aunque solo se consulte una fuente. Primero medir bytes transferidos, parseo, tiempo hasta la primera visualización y memoria en móvil y escritorio. Solo si mejora las métricas: un recurso estático por fuente, promesa cacheada para alternar sin nueva descarga y compatibilidad con apertura local y GitHub Pages (ver [TEC-001](TEC-001-arquitectura-actual.md)).

```js
const loaded = {};
function loadSource(source) {
  loaded[source] ??= loadScript(sourceFiles[source]);
  showStatus(`Cargando datos de ${source}…`);
  return loaded[source].then(() => showStatus('Datos listos.'))
    .catch(() => { delete loaded[source]; showError('No se pudieron cargar los datos.', () => loadSource(source)); });
}
```

Estado de carga solo si hay espera perceptible (`role="status"`); error recuperable con botón «Reintentar» y `role="alert"` ([TEC-007](TEC-007-aria-y-feedback.md)). Mientras se actualiza no se deja un mapa antiguo asociado a filtros nuevos. La reducción de peso no cambia valores, fuentes, periodos ni clasificación.

## Estados diferenciados

Cargando, listo, vacío válido, año no publicado, cero, negativo excluido del área y error tienen mensaje propio. `app.js` ya deshabilita años no publicados y lista negativos; falta explicar el rango ([TEC-004](TEC-004-controles-y-contexto.md)). `hacienda.js` retorna sin mensaje si falta `record`: mostrar estado explicativo y mantener los controles activos. Nunca confundir cero con ausencia ([TEC-006](TEC-006-componente-treemap.md)).

## Ficheros y validación

`index.html`, `js/app.js`, `js/hacienda.js`, y datos si se reformatean. Ejecutar `node --test`; validar error/reintento, equivalencia de valores y ausencia de esperas repetidas; medir con Performance antes y después ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Estado de implementación

**Parcial.** Hecho: estados diferenciados (cargando con `role="status"`, error recuperable con `role="alert"` y «Reintentar» si faltan los datos, vacío, solo ceros, solo negativos, territorio/año sin dato en Hacienda), rango de años deshabilitados explicado con `aria-describedby`. Medición (Node, parseo de los ficheros): `data.js` ≈ 3,8 MB, ≈ 210 ms; `data_hacienda.js` ≈ 2,9 MB, ≈ 110 ms. Decisión: **no** se difiere la carga de ninguna fuente; la mejora medida es modesta y añadiría riesgo para la apertura local (`file://`) y la caché. Queda pendiente medir con Performance en navegador antes de reabrir esta opción.

## Relacionados

[TEC-001](TEC-001-arquitectura-actual.md), [TEC-004](TEC-004-controles-y-contexto.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-012](TEC-012-estrategia-pruebas.md).
