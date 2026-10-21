# Mapa de ingresos y gastos públicos de España

Mapa interactivo (treemap) de los ingresos y gastos de las Administraciones Públicas de España, de 2000 a 2025.

**Web:** https://alejandrovaltierracarbonero.github.io/mapa-gasto-publico-espana/

## Funcionalidades

- Cambio entre **ingresos** y **gastos**, para el **total de las AAPP** o por **subsector**: Estado, Comunidades Autónomas, entes locales y Seguridad Social.
- Ingresos: **resumen por tipo** (2000–2025) o **impuestos y cotizaciones en detalle** (IVA, IRPF, Sociedades, especiales, IBI, cotizaciones de asalariados/autónomos/empleadores…; 2000–2024).
- Gastos: **por tipo** (con transferencias a otras administraciones y a la UE), **por función COFOG → grupo → tipo de gasto** y **por tipo → función → grupo** (2000–2024).
- Selección de **año** y modo **acumulado** para sumar un rango de años; los años sin datos para el desglose elegido aparecen deshabilitados.
- Navegación por niveles (clic para bajar, migas de pan para volver) e información al pasar el ratón.
- **Deflactación** (euros constantes) con el deflactor adecuado a cada partida (PIB, IPC, consumo público, FBCF, coste laboral) y vista de la evolución del gasto nominal frente a su deflactor. Ver [docs/metodologia/deflactacion.md](docs/metodologia/deflactacion.md).
- Coherencia: cuando los hijos no suman el padre se muestra una hoja gris «Otros / no desglosado» con la diferencia. Las partidas negativas (p. ej. activos no producidos) no se pueden dibujar y se listan en el aviso bajo la barra.

## Datos

- Fuente: [Eurostat](https://ec.europa.eu/eurostat), basada en la Contabilidad Nacional de la IGAE, millones de euros corrientes, base devengo (SEC 2010):
  - `gov_10a_main`: todas las partidas con datos para España (S.13 y S.1311–S.1314), 2000–2025.
  - `gov_10a_exp`: COFOG a 2 y 3 dígitos (10 divisiones, 69 grupos; Eurostat no publica un nivel inferior) y su cruce con 10 tipos de gasto, 2000–2024.
  - `gov_10a_taxag`: impuestos y cotizaciones por tipo, 2000–2024.
- S.13 está consolidado; los subsectores no (incluyen transferencias entre administraciones) y por eso no suman el total.
- Los ingresos no se clasifican por función. Eurostat no publica COFOG ni impuestos para 2025 (solo `gov_10a_main`).
- Las cifras están en `js/data.js` (~1,5 MB); la web no hace peticiones a ninguna API.
Para actualizar los datos (requiere Python 3):

```
python scripts/fetch_data.py
```

## Fuente autonómica adicional: liquidación de Hacienda

La aplicación ofrece una fuente paralela para consultar la **Liquidación de los presupuestos de las CCAA** del Ministerio de Hacienda. La integración no sustituye ni modifica Eurostat: el selector de fuente abre el flujo original por defecto y permite cambiar a Hacienda. La vista nueva muestra el total consolidado publicado (código 00) y las comunidades para las que se pudo descargar cada ejercicio estático. En la extracción incluida, los datos cubren **2000–2024** para el total y las 17 CCAA; el portal informa que Ceuta y Melilla solo están disponibles para 2005–2012 y no aparecen seleccionables aunque figuran en su catálogo territorial.

Hacienda publica ejercicios 2002–2024 y el formato de descarga es XLSX. El selector muestra el código 00 (total) y los territorios: 01 Andalucía, 02 Aragón, 03 Asturias, 04 Illes Balears, 05 Canarias, 06 Cantabria, 07 Castilla y León, 08 Castilla-La Mancha, 09 Cataluña, 10 Extremadura, 11 Galicia, 12 Comunidad de Madrid, 13 Región de Murcia, 14 Navarra, 15 País Vasco, 16 La Rioja, 17 Comunitat Valenciana, 18 Ceuta, 19 Melilla. La disponibilidad real depende del ejercicio: la copia incluida cubre 2000–2024 para el total y las 17 CCAA. El portal informa que Ceuta y Melilla solo están disponibles para 2005–2012, así que no hay XLSX para esas ciudades en este periodo. El portal indica datos definitivos hasta 2024, actualizados el 29/05/2026; no está disponible el avance.
### Actualización de datos de Hacienda

Portal oficial: [Liquidación de presupuestos CCAA](https://serviciostelematicosext.hacienda.gob.es/SGCIEF/PublicacionLiquidaciones/aspx/menuInicio.aspx); selector oficial de descarga: [Descargar datos consolidados](https://serviciostelematicosext.hacienda.gob.es/SGCIEF/PublicacionLiquidaciones/aspx/SelDescargaDC.aspx). El portal oficial no ofrece una URL de fichero abierta y estable: la descarga requiere una sesión WebForms, cookies y tokens de formulario. El descargador reproduce la ruta pública de consulta (GET del menú y selector, POST del formulario oficial y seguimiento de la redirección XLSX), valida el XLSX y genera datos locales; no hace llamadas desde el navegador. Para regenerar la serie 2000–2024 incluida:

```
python scripts/fetch_hacienda.py
```

También admite, por ejemplo, `python scripts/fetch_hacienda.py --years 2023 2024 --territories 00 09 12`. Se informan y omiten las combinaciones sin fichero; errores de autenticación/formato no se convierten en cifras.

Los datos se almacenan en `js/data_hacienda.js` en **miles de euros**. El fichero descargado es la clasificación funcional por capítulos; la interfaz muestra área, política, capítulo económico y cruces área/política → capítulo y capítulo → área/política. Son clasificaciones propias de la liquidación, no una traducción a COFOG ni a tipos SEC. Hacienda registra liquidación presupuestaria (obligaciones reconocidas) y consolida la administración y los organismos/entes incluidos en la cuenta de cada comunidad. Eurostat ofrece Contabilidad Nacional SEC 2010 por devengo para S.1312; difieren periodo, unidad, base y perímetro/consolidación. Los capítulos 8 y 9 de Hacienda son financieros. No hay comparaciones directas ni equivalencias categoría a categoría. El total de Hacienda tampoco representa todo el gasto público localizado en ese territorio.

## Estructura

| Ruta | Descripción |
|---|---|
| `index.html` | Estructura de la página |
| `css/styles.css` | Estilos |
| `js/data.js` | Datos generados desde Eurostat (sin cambios por la integración) |
| `js/data_hacienda.js` | Datos estáticos de la liquidación de Hacienda |
| `js/hacienda.js` | Interfaz paralela de consulta territorial Hacienda |
| `js/data_deflactores.js` | Índices de precios (Eurostat) para deflactar |
| `js/data_deflactores_ccaa.js` | IPC y deflactor del PIB por comunidad autónoma (INE), opcionales en Hacienda |
| `js/deflactor.js` | Clasificación de partidas y factores de deflactación |
| `js/trees.js` | Jerarquías de categorías (ingresos, gastos por tipo, por función y cruces) |
| `js/treemap.js` | Algoritmo de treemap |
| `js/app.js` | Interacción y renderizado |
| `scripts/fetch_data.py` | Descarga y generación de `data.js` |
| `scripts/fetch_hacienda.py` | Descarga con sesión oficial y genera `data_hacienda.js` |
| `scripts/fetch_deflactores.py` | Descarga los deflactores y genera `data_deflactores.js` |
| `scripts/fetch_deflactores_ccaa.py` | Descarga IPC y PIB regionales (INE) y genera `data_deflactores_ccaa.js` |

## Uso local

Abre `index.html` en el navegador. No necesita servidor ni dependencias.

## Pruebas y despliegue

Ejecuta las pruebas antes de publicar cambios (requiere Node.js 22 o superior):

```
node --test
```

GitHub Actions ejecuta las pruebas y comprueba la sintaxis del descargador Python en cada `push` y pull request. Solo publica GitHub Pages al actualizar `main`, y únicamente si las comprobaciones han pasado. Para habilitar este despliegue automático, configura **Settings → Pages → Build and deployment → Source → GitHub Actions** en el repositorio.
