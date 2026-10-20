"""Descarga de Eurostat los deflactores de la guía metodológica y genera js/data_deflactores.js.

Series (España, anuales):
  ipc      IPCA general, índice medio anual (prc_hicp_aind, CP00, INX_A_AVG, 2015=100)
  pib      Deflactor implícito del PIB (nama_10_gdp, B1GQ, PD15_EUR, 2015=100)
  consumo  Deflactor del consumo final de las AAPP (nama_10_gdp, P3_S13, PD15_EUR, 2015=100)
  fbcf     Deflactor de la formación bruta de capital fijo (nama_10_gdp, P51G, PD15_EUR, 2015=100)
  laboral  Coste laboral medio por asalariado en Administración pública, educación y sanidad (NACE O-Q):
           remuneración de asalariados (nama_10_a10, D1, CP_MEUR) / asalariados (nama_10_a10_e, SAL_DC, THS_PER),
           reescalado a 2015=100. Aproxima el ICLH del sector público, que Eurostat no publica con serie larga.
"""
import json
import urllib.request
from pathlib import Path

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
REBASE = "2015"


def get(dataset, params):
    q = "&".join(f"{k}={v}" for k, v in params)
    with urllib.request.urlopen(f"{BASE}{dataset}?{q}&geo=ES&format=JSON&lang=EN", timeout=120) as r:
        js = json.load(r)
    years = {v: k for k, v in js["dimension"]["time"]["category"]["index"].items()}
    return {years[int(i)]: v for i, v in js["value"].items()}


def rebase(series):
    ref = series[REBASE]
    return {y: round(v / ref * 100, 4) for y, v in sorted(series.items())}


def main():
    pd = lambda item: get("nama_10_gdp", [("unit", "PD15_EUR"), ("na_item", item)])
    comp = get("nama_10_a10", [("unit", "CP_MEUR"), ("nace_r2", "O-Q"), ("na_item", "D1")])
    emp = get("nama_10_a10_e", [("unit", "THS_PER"), ("nace_r2", "O-Q"), ("na_item", "SAL_DC")])
    series = {
        "ipc": get("prc_hicp_aind", [("coicop", "CP00"), ("unit", "INX_A_AVG")]),
        "pib": pd("B1GQ"),
        "consumo": pd("P3_S13"),
        "fbcf": pd("P51G"),
        "laboral": {y: comp[y] / emp[y] for y in comp if y in emp and emp[y]},
    }
    out = {k: rebase(v) for k, v in series.items()}
    path = Path(__file__).resolve().parent.parent / "js" / "data_deflactores.js"
    path.write_text("// Generado por scripts/fetch_deflactores.py; índices 2015=100 (Eurostat, España).\n"
                    "window.DEFLACTORES_DATA = " + json.dumps(out, separators=(",", ":")) + ";\n", encoding="utf-8")
    for k, v in out.items():
        print(k, min(v), max(v), len(v))


if __name__ == "__main__":
    main()
