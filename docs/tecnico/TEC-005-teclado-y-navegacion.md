---
id: TEC-005
titulo: Navegación jerárquica, teclado y foco
estado: Implementado
---

# TEC-005 · Navegación jerárquica, teclado y foco

## Origen

- [UX-001 — Navegación por niveles y migas de pan](../ux/UX-001-navegacion.md)
- [A11Y-002 — Teclado y foco](../accesibilidad/teclado-foco.md)
- [A11Y-003 — Semántica y landmarks](../accesibilidad/semantica-landmarks.md)
- [A11Y-005 — Lectores de pantalla y ARIA](../accesibilidad/lectores-pantalla-aria.md)

## Estado actual

`js/app.js` y `js/hacienda.js` crean celdas `div` y migas `span` con `onclick`: la navegación depende del puntero y no hay foco ni activación por teclado.

## Aplicación técnica

Usar `<button type="button">` para toda acción; Enter y Espacio funcionan sin código adicional. Para no meter cientos de celdas en el orden de Tab, la alternativa de datos de [TEC-006](TEC-006-componente-treemap.md) es el camino principal por teclado y las celdas visuales pueden quedar con `tabindex="-1"` o ser accionables solo si tienen desglose. Las hojas informativas no se convierten en controles.

```js
const action = document.createElement('button');
action.type = 'button'; action.className = 'cell drill';
action.setAttribute('aria-label', `${name}, ${amount}, abrir desglose`);
action.addEventListener('click', () => { state.path.push(name); render(); });
```

- **Migas**: `<nav aria-label="Ruta de navegación"><ol>…</ol></nav>`; los ancestros son botones que restauran `path`; el último nodo es texto con `aria-current="page"`.
- **Volver**: botón «Volver al nivel anterior» solo cuando `path.length > 0`.
- **Contexto**: filtros y periodo se conservan al explorar; cambiar fuente/vista/sector/territorio reinicia la ruta y lo comunica ([TEC-004](TEC-004-controles-y-contexto.md), [TEC-007](TEC-007-aria-y-feedback.md)).
- **Regla de foco tras render**: mantener el foco en el elemento equivalente; si desaparece, enfocar el encabezado del nivel (`tabindex="-1"`). Nunca dejarlo en `body`.
- **Distinción visual** de celdas con desglose (icono/texto «Abrir») sin depender del cursor.
- **Pestañas** Ingresos/Gastos: `aria-pressed` (ver [TEC-007](TEC-007-aria-y-feedback.md)).
- **CSS**: `:focus-visible` de alto contraste (ver [TEC-002](TEC-002-tokens-y-contraste.md)), con `scroll-margin-top` / `scroll-padding-top` para que cabeceras sticky no oculten el foco (2.4.11).
- Escape cierra el detalle o tooltip abierto sin mover el foco.

## Ficheros y pruebas

`index.html`, `js/app.js`, `js/hacienda.js`, `css/styles.css`. Probar Tab/Shift+Tab sin trampas, Enter/Espacio, foco tras render, regreso por migas y Escape ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-002](TEC-002-tokens-y-contraste.md), [TEC-003](TEC-003-estructura-semantica.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-007](TEC-007-aria-y-feedback.md), [TEC-012](TEC-012-estrategia-pruebas.md).
