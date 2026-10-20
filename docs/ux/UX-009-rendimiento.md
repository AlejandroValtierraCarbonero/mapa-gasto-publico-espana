---
id: UX-009
titulo: Rendimiento percibido y espera
prioridad: P2
---

## Hallazgo

La web es estática y no depende de una petición de datos en tiempo de uso, pero `index.html` carga en cada sesión dos ficheros de datos JavaScript grandes (aprox. 3,8 MB para Eurostat y 2,9 MB para Hacienda) antes de inicializar la aplicación. La opción de fuente no evita descargar el conjunto que no se vaya a consultar. No se muestra progreso de inicialización. Una vez disponibles los datos, la navegación por el mapa no requiere red.

## Recomendación

Preservar el acceso sin backend, pero reducir el coste inicial: revisar duplicación y formatos de los datos y, si conviene, separar los recursos por fuente para cargar bajo demanda. Si se introduce carga diferida, comunicar claramente el cambio y mantener las acciones disponibles o explicar que están pendientes. Medir descarga, análisis del script y primera visualización en móvil y escritorio antes y después; mantener los datos ya cargados para que alternar vistas no cause esperas repetidas. Los estados de espera y error deben cumplir lo indicado en [feedback y estados](UX-006-feedback-estados.md).

## Criterios de aceptación

- La primera visualización aparece sin descargar y analizar innecesariamente datos de una fuente que no se ha seleccionado, o existe evidencia medida de que la carga conjunta es más conveniente.
- Se registran y comparan tamaño transferido, tiempo de inicialización y tiempo hasta la primera visualización en una conexión móvil representativa.
- Durante una carga diferida se presenta un estado informativo; un error no deja el mapa vacío sin explicación.
- Cambiar entre filtros y niveles después de cargar los datos no provoca nuevas esperas apreciables.
- La reducción de peso no cambia valores, fuentes, periodos ni comportamiento de la selección.

## Implementación técnica

- [TEC-001 — Arquitectura actual y límites técnicos](../tecnico/TEC-001-arquitectura-actual.md)
- [TEC-010 — Rendimiento, carga y estados de error](../tecnico/TEC-010-rendimiento-estados.md)
