"""Descarga del INE los deflactores regionales y genera js/data_deflactores_ccaa.js.

Series por comunidad autónoma (API Tempus del INE), anuales, reescaladas a 2015=100:
  ipc  IPC general, media anual (operación IPC, tabla 76150, ECOICOP v2, series "Índice general. Media anual.").
  pib  Deflactor implícito del PIB regional (Contabilidad Regional de España, CRE). No lo publica el INE como serie:
       se encadena como  D_t = D_(t-1) * (PIB corriente_t / PIB corriente_(t-1)) / (1 + g_t / 100),
       con PIB a precios corrientes (tabla 80109, «Dato base») y g = tasa de variación interanual del volumen
       (tabla 80111, índices de volumen encadenados).
La clave «00» (Total CCAA) no tiene serie regional y usa el deflactor nacional.
Además se descarga el total nacional del INE (mismas tablas) para contrastarlo con Eurostat.
"""
import json
import unicodedata
import urllib.request
from pathlib import Path

BASE = "https://servicios.ine.es/wstempus/js/ES/"
REBASE = 2015
FIRST_YEAR = 2000
# Nombre INE -> código de territorio de Hacienda (scripts/fetch_hacienda.py)
INE_NAMES = {
    "Andalucía": "01", "Aragón": "02", "Asturias, Principado de": "03", "Balears, Illes": "04", "Canarias": "05",
    "Cantabria": "06", "Castilla y León": "07", "Castilla - La Mancha": "08", "Cataluña": "09", "Extremadura": "10",
    "Galicia": "11", "Madrid, Comunidad de": "12", "Murcia, Región de": "13", "Navarra, Comunidad Foral de": "14",
    "País Vasco": "15", "Rioja, La": "16", "Comunitat Valenciana": "17", "Ceuta": "18", "Melilla": "19",
}
NATIONAL = "Total Nacional"
CRE_NOMINAL = ("80109", "Dato base. Producto interior bruto a precios de mercado. Precios corrientes.")
CRE_VOLUME = ("80111", "Tasa de Variación Interanual. Producto interior bruto a precios de mercado. Índices de volumen encadenados.")
IPC_TABLE = "76150"
IPC_SUFFIX = "Índice general. Media anual."


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=120) as r:
        return json.load(r)


def norm(s):
    return unicodedata.normalize("NFC", s).strip()


def series_by_territory(table, suffix):
    """{nombre de territorio: código de serie} para las series de la tabla cuyo nombre termina en `suffix`."""
    out = {}
    for s in get(f"SERIES_TABLA/{table}?det=0"):
        name = norm(s["Nombre"]).rstrip()
        if name.endswith(suffix):
            out[name[: -len(suffix)].rstrip(". ").strip()] = s["COD"]
    return out


def annual(code):
    data = get(f"DATOS_SERIE/{code}?nult=60")["Data"]
    return {int(d["Anyo"]): d["Valor"] for d in data if d["Valor"] is not None}


def rebase(series):
    ref = series[REBASE]
    return {y: round(v / ref * 100, 4) for y, v in sorted(series.items())}


def chain_deflator(nominal, growth):
    """Deflactor encadenado a partir del PIB corriente y la tasa de volumen; base arbitraria 100 en el primer año."""
    years = [y for y in sorted(nominal) if y >= FIRST_YEAR]
    defl = {years[0]: 100.0}
    for prev, y in zip(years, years[1:]):
        if y not in growth:
            break
        defl[y] = defl[prev] * (nominal[y] / nominal[prev]) / (1 + growth[y] / 100)
    return defl


def main():
    nominal_codes = series_by_territory(*CRE_NOMINAL)
    volume_codes = series_by_territory(*CRE_VOLUME)
    ipc_codes = series_by_territory(IPC_TABLE, IPC_SUFFIX)
    names = [NATIONAL, *INE_NAMES]
    out = {"ipc": {}, "pib": {}}
    nacional = {}
    for name in names:
        code = INE_NAMES.get(name, "ES")
        pib = rebase(chain_deflator(annual(nominal_codes[name]), annual(volume_codes[name])))
        ipc = rebase(annual(ipc_codes["Nacional" if name == NATIONAL else name]))
        if name == NATIONAL:
            nacional = {"ipc": ipc, "pib": pib}
        else:
            out["ipc"][code], out["pib"][code] = ipc, pib
        print(f"{code} {name}: pib {min(pib)}-{max(pib)}, ipc {min(ipc)}-{max(ipc)}")
    out["nacionalINE"] = nacional
    path = Path(__file__).resolve().parent.parent / "js" / "data_deflactores_ccaa.js"
    path.write_text("// Generado por scripts/fetch_deflactores_ccaa.py; índices 2015=100 (INE, por comunidad autónoma).\n"
                    "window.DEFLACTORES_CCAA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n",
                    encoding="utf-8")


if __name__ == "__main__":
    main()
