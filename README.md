# Mapa de ingresos y gastos públicos de España

Mapa interactivo (treemap) de los ingresos y gastos de las Administraciones Públicas de España, de 2015 a 2025.

**Web:** https://alejandrovaltierracarbonero.github.io/mapa-gasto-publico-espana/

## Funcionalidades

- Cambio entre **ingresos** y **gastos**, para el **total de las AAPP** o por **subsector**: Estado, Comunidades Autónomas, entes locales y Seguridad Social.
- Ingresos: **resumen por tipo** (2015–2025) o **impuestos y cotizaciones en detalle** (IVA, IRPF, Sociedades, especiales, IBI, cotizaciones de asalariados/autónomos/empleadores…; 2015–2024).
- Gastos: **por tipo** (con transferencias a otras administraciones y a la UE), **por función COFOG → grupo → tipo de gasto** y **por tipo → función → grupo** (2015–2024).
- Selección de **año** y modo **acumulado** para sumar un rango de años; los años sin datos para el desglose elegido aparecen deshabilitados.
- Navegación por niveles (clic para bajar, migas de pan para volver) e información al pasar el ratón.
- Coherencia: cuando los hijos no suman el padre se muestra una hoja gris «Otros / no desglosado» con la diferencia. Las partidas negativas (p. ej. activos no producidos) no se pueden dibujar y se listan en el aviso bajo la barra.

## Datos

- Fuente: [Eurostat](https://ec.europa.eu/eurostat), basada en la Contabilidad Nacional de la IGAE, millones de euros corrientes, base devengo (SEC 2010):
  - `gov_10a_main`: todas las partidas con datos para España (S.13 y S.1311–S.1314), 2015–2025.
  - `gov_10a_exp`: COFOG a 2 y 3 dígitos (10 divisiones, 69 grupos; Eurostat no publica un nivel inferior) y su cruce con 10 tipos de gasto, 2015–2024.
  - `gov_10a_taxag`: impuestos y cotizaciones por tipo, 2015–2024.
- S.13 está consolidado; los subsectores no (incluyen transferencias entre administraciones) y por eso no suman el total.
- Los ingresos no se clasifican por función. Eurostat no publica COFOG ni impuestos para 2025 (solo `gov_10a_main`).
- Las cifras están en `js/data.js` (~1,5 MB); la web no hace peticiones a ninguna API.
Para actualizar los datos (requiere Python 3):

```
python scripts/fetch_data.py
```

## Estructura

| Ruta | Descripción |
|---|---|
| `index.html` | Estructura de la página |
| `css/styles.css` | Estilos |
| `js/data.js` | Datos generados desde Eurostat |
| `js/trees.js` | Jerarquías de categorías (ingresos, gastos por tipo, por función y cruces) |
| `js/treemap.js` | Algoritmo de treemap |
| `js/app.js` | Interacción y renderizado |
| `scripts/fetch_data.py` | Descarga y generación de `data.js` |

## Uso local

Abre `index.html` en el navegador. No necesita servidor ni dependencias.

## Pruebas y despliegue

Ejecuta las pruebas antes de publicar cambios (requiere Node.js 22 o superior):

```
node --test
```

GitHub Actions ejecuta las pruebas y comprueba la sintaxis del descargador Python en cada `push` y pull request. Solo publica GitHub Pages al actualizar `main`, y únicamente si las comprobaciones han pasado. Para habilitar este despliegue automático, configura **Settings → Pages → Build and deployment → Source → GitHub Actions** en el repositorio.
