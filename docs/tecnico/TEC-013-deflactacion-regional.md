# TEC-013: Deflactación por comunidad autónoma (Hacienda)

**Estado:** Implementado, cubierto por `tests/project.test.js`.
**Origen:** [Metodología de deflactación](../metodologia/deflactacion.md) §8; investigación sobre si deflactar con índices regionales o con los de España.
**Relacionados:** [TEC-004](TEC-004-controles-y-contexto.md) (controles), [TEC-009](TEC-009-evolucion-y-tablas.md) (evolución).

## 1. Decisión

| Aspecto | Decisión | Motivo |
|---|---|---|
| Valor por defecto | Índices de **España** | Comparabilidad entre comunidades, coherencia con la suma «Total CCAA» y con Eurostat, y porque consumo público, FBCF y coste laboral no existen por comunidad. |
| Alternativa | «Comunidad»: sustituye **solo** `ipc` y `pib` por la serie de la comunidad activa | Son las únicas series oficiales regionales con cobertura completa. |
| Fuente afectada | Solo **Hacienda** y solo cuando el territorio es una comunidad (códigos `01`–`19`) | Eurostat y «Total CCAA» (`00`) no tienen serie regional y siguen con España. |
| Aviso al usuario | Siempre visible junto al selector | El IPC regional mide precios de hogares y el deflactor regional del PIB, precios de lo producido en la región; ninguno mide el coste de prestar servicios públicos. |

## 2. Fuentes verificadas (API Tempus del INE, `https://servicios.ine.es/wstempus/js/ES/`)

| Serie | Operación | Tabla | Series usadas | Cobertura |
|---|---|---|---|---|
| IPC general, media anual (ECOICOP v2) | `IPC` | 76150 | «`<Comunidad>. Índice general. Media anual.`» (20 series: nacional + 19 territorios) | 2002–2025 |
| PIB a precios corrientes | `CRE` | 80109 | «`<Comunidad>. Dato base. Producto interior bruto a precios de mercado. Precios corrientes.`» | 2000–2025 |
| Tasa de variación interanual del PIB en volumen | `CRE` | 80111 | «`<Comunidad>. Tasa de Variación Interanual. Producto interior bruto a precios de mercado. Índices de volumen encadenados.`» | 2001–2025 |

Las tablas 82284 y 82286 contienen las mismas series que 80109 y 80111 (otra vista de la misma edición).

El INE **no publica** el deflactor regional del PIB: se deriva. Para un año `t` y una comunidad:

```
D_t = D_(t-1) · (PIB corriente_t / PIB corriente_(t-1)) / (1 + g_t / 100)
```

con `g_t` la tasa de volumen encadenado. `D` se arranca en 100 en el primer año y se reescala a **2015 = 100**, igual que los deflactores nacionales.

### Validación realizada

- El deflactor del PIB **nacional** reconstruido con este método coincide con el de Eurostat (`nama_10_gdp`, `PD15_EUR`) con diferencia máxima 0,0 % en todos los años: el método es exacto y el redondeo de `g_t` no acumula error apreciable.
- El IPC nacional del INE difiere del IPCA de Eurostat hasta un 0,32 % (2002) y 0,11 % (2024): son índices distintos, como ya reconoce la metodología.
- Dispersión (2015 = 100, año 2024): deflactor del PIB entre 119,7 (Melilla) y 130,1 (Aragón), con España en 124,0; IPC entre 120,5 (Ceuta) y 125,7 (Castilla-La Mancha), con España en 123,5. Crecimiento anual medio 2002–2024: PIB 1,9–3,2 %, IPC 1,9–2,4 %. En un año concreto, el deflactor regional del PIB llega a variaciones de −1,9 % a +9,9 %, más volátil que el nacional.

Conclusión de la validación: las diferencias acumuladas son de unos pocos puntos porcentuales; relevantes para comparar comunidades, pero pequeñas frente a las revisiones y al efecto de composición, lo que respalda mantener España como valor por defecto.

## 3. Datos

`scripts/fetch_deflactores_ccaa.py` genera `js/data_deflactores_ccaa.js`:

```js
window.DEFLACTORES_CCAA = {
  ipc: { "01": { "2002": <índice>, ... }, ... "19": {...} },   // 2015 = 100
  pib: { "01": { "2000": <índice>, ... }, ... "19": {...} },   // 2015 = 100, derivado
  nacionalINE: { ipc: {...}, pib: {...} }                   // solo para contraste con Eurostat
};
```

- Las claves de comunidad son los códigos de Hacienda (`scripts/fetch_hacienda.py`, `TERRITORIES`). La correspondencia con los nombres del INE está en `INE_NAMES` del script.
- El script falla (`KeyError`) si el INE cambia el nombre de una serie, en lugar de generar datos incompletos.
- Actualización: `python scripts/fetch_deflactores_ccaa.py` (sin dependencias externas).
- El fichero es opcional en tiempo de ejecución: si no carga, `window.DEFLACTORES_CCAA` es `{}` y el selector de ámbito no aparece.

## 4. Código

| Fichero | Cambio |
|---|---|
| `js/deflactor.js` | `state.scope` (`nacional` por defecto o `regional`) y `state.territory`. `index(key, year)` devuelve la serie regional solo si `scope === "regional"`, la clave es `ipc` o `pib` y hay serie para `territory`; si no, la nacional. `factor` e `index` no cambian de firma, por lo que treemap, tabla, acumulados y evolución las usan sin más cambios. Nuevos: `label(key)`, `regionalAvailable()`, `isRegional(key)`. `years()` se limita a ≥ 2002 con ámbito regional. `describe()` añade el aviso de las series que siguen siendo de España. |
| `js/hacienda.js` | `render()` y `switchSource()` mantienen `Deflactor.state.territory` (vacío con Eurostat). |
| `js/app.js` | Selector `selDeflScope`; `syncDeflControls` lo muestra solo si `regionalAvailable()` y hay deflactación o evolución en índice; `fillBase()` reajusta el año base a los años disponibles. |
| `js/evolucion.js` | La leyenda del deflactor usa `Deflactor.label(key)`. |
| `index.html` | Selector «Índices de precios» con ayuda `deflScopeHelp` y carga de `data_deflactores_ccaa.js` tras `data_deflactores.js`. |

Reglas de comportamiento:

1. Con «España» (por defecto) el resultado es idéntico al anterior a este cambio.
2. Con «Comunidad» y modo Automático, las partidas clasificadas `ipc` o `pib` usan la serie regional; `consumo`, `fbcf` y `laboral` siguen siendo de España. Con un deflactor fijo `consumo`, `fbcf` o `laboral` el ámbito no tiene efecto.
3. El aviso de la nota inferior y la leyenda de la evolución indican qué índice se aplicó.
4. Cambiar de territorio a `00` o de fuente a Eurostat vuelve a España aunque el selector siga en «Comunidad».

## 5. Pruebas (`tests/project.test.js`)

- Cobertura: 19 comunidades × `ipc`/`pib`, años 2002–2024 positivos, 2015 = 100.
- El PIB nacional del INE reproduce el de Eurostat (tolerancia 0,1 %).
- Ámbito: por defecto igual que España; regional sustituye solo `ipc`/`pib`; `00` y Eurostat usan España; `years()` ≥ 2002.
- Interfaz: el selector está oculto en el total, visible en una comunidad y cambia el resumen y la nota.

## 6. Límites conocidos

- Sin IPC regional anterior a 2002 (Hacienda comienza en 2002).
- El último año del deflactor del PIB regional puede ser provisional y se revisa en cada edición de la CRE.
- No existe deflactor regional de consumo público, FBCF ni coste laboral público.
- Pendiente (fuera de alcance): PIB nominal y población regionales (CRE 80109 y 80113) para mostrar el gasto como % del PIB y por habitante.
