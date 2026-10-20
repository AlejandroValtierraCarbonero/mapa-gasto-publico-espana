---
id: TEC-002
titulo: Tokens CSS, color, leyenda y movimiento
estado: Implementado
---

# TEC-002 · Tokens CSS, color, leyenda y movimiento

## Origen

- [UX-004 — Color, etiquetas y legibilidad del mapa](../ux/UX-004-color-legibilidad.md)
- [A11Y-001 — Contraste y uso del color](../accesibilidad/contraste.md)
- [A11Y-006 — Movimiento y animaciones](../accesibilidad/movimiento.md)

## Estado actual

`css/styles.css` define variables base, pero enlaces, avisos, positivos/negativos, foco y celdas se colorean en CSS y JS. `js/app.js` y `js/hacienda.js` generan fondos HSL dinámicos bajo texto blanco sin ratios verificados. Hay una transición de filtro de 0,15 s en hover y no se respeta `prefers-reduced-motion`.

## Aplicación técnica

Tokens y foco global en `css/styles.css` (valores de partida, no certificación):

```css
:root {
  --bg:#0f172a; --panel:#1e293b; --text:#e2e8f0; --muted:#cbd5e1;
  --accent:#93c5fd; --warning:#fcd34d; --focus:#facc15; --border:#64748b;
  --space-1:.5rem; --space-2:1rem; --space-3:1.5rem;
}
:focus-visible { outline:3px solid var(--focus); outline-offset:2px; }
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after { scroll-behavior:auto!important; transition-duration:.01ms!important; animation-duration:.01ms!important; }
}
```

- **Contraste de celdas**: en `app.js`/`hacienda.js` calcular la luminancia del HSL generado y elegir texto claro u oscuro, o poner el texto sobre una superficie sólida (`background: rgb(0 0 0 / .55)`). Ratios: ≥ 4,5:1 texto normal, ≥ 3:1 texto grande y límites gráficos necesarios.
- **Leyenda** (UX-004): un `<p class="legend">` junto al mapa que declare que el color diferencia categorías y no expresa magnitud ni comparabilidad entre fuentes.
- **Estado no solo por color**: saldos y avisos llevan signo («+», «−») o etiqueta («Déficit», «No representada») además de rojo/verde; residuales etiquetados «Otros / no desglosado».
- **Deshabilitados**: no usar solo `opacity`; combinar color con contraste verificable y texto explicativo ([TEC-004](TEC-004-controles-y-contexto.md)).
- **Movimiento**: mantener solo transiciones breves y no esenciales; nada depende de la animación para informar.
- **Etiquetas recortadas**: adaptar u omitir etiqueta solo si el valor completo está en la alternativa sincronizada ([TEC-006](TEC-006-componente-treemap.md)).

## Ficheros y verificación

`css/styles.css`, `js/app.js`, `js/hacienda.js`, estilos de serie en `js/evolucion.js`. Medir todas las variantes HSL reales, foco, hover, disabled y avisos; probar con `prefers-reduced-motion` activado ([TEC-012](TEC-012-estrategia-pruebas.md)).

## Relacionados

[TEC-004](TEC-004-controles-y-contexto.md), [TEC-006](TEC-006-componente-treemap.md), [TEC-009](TEC-009-evolucion-y-tablas.md), [TEC-012](TEC-012-estrategia-pruebas.md).
