# Mapa de ingresos y gastos públicos de España

Mapa interactivo (treemap) de los ingresos y gastos de las Administraciones Públicas de España, de 2015 a 2025.

**Web:** https://alejandrovaltierracarbonero.github.io/mapa-gasto-publico-espana/

## Funcionalidades

- Cambio entre **ingresos** y **gastos**.
- Gastos desglosados **por tipo** (prestaciones, sueldos, intereses…) o **por función** (COFOG: sanidad, educación, defensa, protección social…).
- Selección de **año** y modo **acumulado** para sumar un rango de años.
- Navegación por niveles: clic en un bloque para ver su detalle, y migas de pan para volver.
- Información al pasar el ratón: importe, porcentaje de la categoría y del total.

## Datos

- Fuente: [Eurostat](https://ec.europa.eu/eurostat) (`gov_10a_main` y `gov_10a_exp`), sector S.13 Administraciones Públicas de España, basada en la Contabilidad Nacional de la IGAE.
- Millones de euros corrientes, base devengo (SEC 2010), datos consolidados.
- El desglose por función (COFOG) solo está publicado hasta 2024. Los ingresos no se clasifican por función.
- Las cifras están guardadas en `js/data.js`; la web no hace peticiones a ninguna API.

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
| `js/trees.js` | Jerarquías de categorías (por tipo y por función) |
| `js/treemap.js` | Algoritmo de treemap |
| `js/app.js` | Interacción y renderizado |
| `scripts/fetch_data.py` | Descarga y generación de `data.js` |

## Uso local

Abre `index.html` en el navegador. No necesita servidor ni dependencias.
