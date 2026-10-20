---
id: A11Y-006
titulo: Movimiento y animaciones
criterio_wcag: WCAG 2.2 — 2.2.2 (AA, cuando aplique); 2.3.3 (AAA, mejora recomendada)
prioridad: Media
---

## Hallazgo

No se aprecia reproducción automática ni parpadeo; los cambios de treemap aplican una transición de filtro de 0,15 s al pasar el puntero. No se respeta explícitamente `prefers-reduced-motion`. El efecto actual es breve, pero las actualizaciones de los gráficos y la navegación jerárquica deben revisarse con personas sensibles al movimiento.

## Recomendación

Mantener animaciones no esenciales breves, no automáticas y sin destellos; ofrecer una variante sin transición ante `prefers-reduced-motion`. Evitar movimiento que distraiga o impida leer el dato. Revisar la animación como parte de las actualizaciones de [treemap y gráficos](treemap-graficos.md) y el efecto de foco/hover descrito en [teclado y foco](teclado-foco.md).

## Criterios de aceptación

- La preferencia de reducción de movimiento elimina o reduce transiciones no esenciales.
- No hay contenido que se mueva automáticamente durante más de cinco segundos sin pausa, parada u ocultación.
- No hay destellos que superen los umbrales WCAG.
- Las actualizaciones visuales no dependen de una animación para comunicar información.

## Implementación técnica

- [TEC-002 — Tokens CSS, color, leyenda y movimiento](../tecnico/TEC-002-tokens-y-contraste.md)
