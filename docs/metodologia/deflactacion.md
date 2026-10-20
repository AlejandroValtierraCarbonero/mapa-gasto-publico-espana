# Metodología: deflactación del gasto público

Guía para medir la evolución del gasto público en términos reales y cómo la aplica la web. Parte de la guía metodológica «Cómo medir la evolución del gasto público en España».

**Principio:** el IPC general no es siempre el deflactor adecuado. Mide la cesta de los hogares, mientras que las Administraciones compran bienes, servicios e infraestructuras y pagan salarios con dinámicas de precios distintas. Cada partida se deflacta con el índice que mejor refleja su naturaleza.

## 1. Deflactor según la partida

| Partida | Deflactor | Motivo |
|---|---|---|
| Gasto público total (y totales de ingresos/gastos) | Deflactor del PIB | Precios de todos los bienes y servicios producidos, incluidos inversión y consumo público. |
| Gastos de personal / remuneración de asalariados | Coste laboral por asalariado público (aproxima el ICLH) | Aísla el efecto de plantillas frente al coste por trabajador. |
| Inversión pública (FBCF) | Deflactor de la formación bruta de capital fijo | Materiales y obra civil evolucionan distinto de la cesta familiar. |
| Consumo público en bienes y servicios (sanidad, educación, defensa…) | Deflactor del consumo final de las AAPP | Coste específico de prestar los servicios públicos. |
| Pensiones y prestaciones sociales | IPC general | Mide el mantenimiento del poder adquisitivo del perceptor. |

## 2. Series utilizadas

Todas son de **España**, anuales, procedentes de Eurostat y almacenadas en `js/data_deflactores.js` (índices con 2015 = 100; se generan con `python scripts/fetch_deflactores.py`).

| Clave | Serie | Dataset Eurostat | Cobertura |
|---|---|---|---|
| `ipc` | IPCA general, media anual | `prc_hicp_aind` (CP00, INX_A_AVG) | 1996–2025 |
| `pib` | Deflactor implícito del PIB | `nama_10_gdp` (B1GQ, PD15_EUR) | 1995–2025 |
| `consumo` | Deflactor del consumo final de las AAPP | `nama_10_gdp` (P3_S13, PD15_EUR) | 1995–2025 |
| `fbcf` | Deflactor de la FBCF | `nama_10_gdp` (P51G, PD15_EUR) | 1995–2025 |
| `laboral` | Remuneración por asalariado, NACE O-Q (administración pública, educación y sanidad) | `nama_10_a10` (D1) ÷ `nama_10_a10_e` (SAL_DC) | 1995–2025 |

Limitaciones asumidas:

- El **IPC** es el IPCA armonizado (Eurostat), no el IPC nacional del INE; ambos difieren ligeramente.
- El **ICLH del sector público** no tiene serie larga en Eurostat. Se usa como aproximación la remuneración media por asalariado de las ramas O-Q, que además incorpora cambios de composición de la plantilla.
- Las series proceden de la misma Contabilidad Nacional que las cifras de gasto de Eurostat, por lo que son coherentes con ellas.

## 3. Cálculo

Para un importe nominal `V` del año `t`, expresado en euros constantes del año base `b` con el deflactor `D`:

```
V_real(b) = V_nominal(t) × D(b) / D(t)
```

- El año base se elige en la interfaz («Precios de»; por defecto 2024).
- En el modo acumulado se deflacta **cada año por separado** y después se suma; nunca se deflacta el acumulado con un único índice.
- Los porcentajes y los pesos relativos se calculan sobre los importes ya deflactados.

### Coherencia de la jerarquía

Cada partida usa su propio deflactor, por lo que un padre deflactado debe seguir siendo la suma de sus hijos deflactados. Para ello el valor real de un nodo es:

```
real(nodo) = Σ real(hijos) + (nominal(nodo) − Σ nominal(hijos)) × factor(nodo)
```

Es decir, la parte «Otros / no desglosado» se deflacta con el deflactor del nodo padre. Los totales de ingresos, gastos y saldo del resumen usan el deflactor del PIB.

## 4. Asignación automática de deflactor

El modo **Automático** clasifica cada nodo según su nombre y los de sus ancestros. Las partidas económicas tienen prioridad sobre las funcionales:

1. **Económicas** (se busca desde el nodo hacia la raíz): remuneración de asalariados / gastos de personal → coste laboral; formación bruta de capital fijo / inversión / inversiones reales → FBCF; prestaciones sociales y pensiones → IPC; consumos intermedios / bienes y servicios → consumo público.
2. **Capítulos de Hacienda** sin deflactor propio (transferencias, activos y pasivos financieros) → PIB.
3. **Funcionales**: protección social (vejez, supervivientes, desempleo, familia, exclusión social, promoción social) → IPC; deuda, transferencias a administraciones y regulación financiera → PIB; el resto de funciones COFOG (Eurostat) y de áreas/políticas (Hacienda) → consumo público.
4. **Resto** (ingresos, intereses, subvenciones, totales) → PIB.

Esta clasificación es una convención del proyecto sobre la guía, no una equivalencia oficial. El usuario puede forzar un único deflactor para todas las partidas.

## 5. Visualización en la web

Controles en «Opciones de visualización»:

- **Deflactar importes (euros constantes):** muestra treemap, tabla, resumen y evolución en euros constantes del año base. Los datos originales no se modifican: al desactivarlo se recuperan las cifras nominales.
- **Deflactor:** Automático (según la partida) o uno fijo (IPC, PIB, consumo público, FBCF, coste laboral).
- **Precios de:** año base.
- **Evolución → «Gasto nominal frente a su deflactor (índice)»:** con la evolución entre años activa, dibuja para cada partida el gasto nominal **sin deflactar** (línea continua) y su deflactor (línea discontinua), ambos con índice 100 en el primer año con dato. La tabla añade una fila de **gasto real** (nominal ÷ deflactor). Si la línea nominal supera a la del deflactor, el gasto real crece.

Se aplica a ambas fuentes (Eurostat y Hacienda). Las notas bajo la barra indican el año base y los deflactores aplicados.

## 6. Métricas complementarias (no implementadas)

La guía recomienda completar la deflactación con el gasto como **% del PIB nominal** y el **gasto real por habitante o beneficiario**. Requieren series de PIB nominal y población que la web aún no incorpora.

## 7. Ficheros

| Fichero | Función |
|---|---|
| `scripts/fetch_deflactores.py` | Descarga las series y genera `js/data_deflactores.js` |
| `js/data_deflactores.js` | Índices por serie y año (2015 = 100) |
| `js/deflactor.js` | Clasificación, factores y estado de la deflactación |
| `js/app.js`, `js/hacienda.js` | Aplicación a cada fuente |
| `js/evolucion.js` | Modo «Gasto nominal frente a su deflactor» |
| `tests/project.test.js` | Pruebas de clasificación, factores, coherencia e índice |
