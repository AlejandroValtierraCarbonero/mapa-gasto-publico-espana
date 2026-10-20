"""Descarga de Eurostat (Contabilidad Nacional, España) y genera js/data.js.

Datasets: gov_10a_main, gov_10a_exp (COFOG x tipo de gasto) y gov_10a_taxag (impuestos por tipo),
para S.13 (total AAPP) y sus subsectores S.1311 (Estado), S.1312 (CCAA), S.1313 (entes locales)
y S.1314 (Seguridad Social). Se descargan TODAS las partidas con datos para España.

Formato de salida: DATA[año][sector] = {
    main:  {na_item: valor}               # gov_10a_main
    cofog: {cofog99: valor}               # gov_10a_exp, gasto total (TE) por función
    exp:   {"cofog99|na_item": valor}     # gov_10a_exp, función x tipo de gasto
    tax:   {na_item: valor}               # gov_10a_taxag
}
"""
import json
import urllib.request
from pathlib import Path

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
Y0, Y1 = 2000, 2025
SECTORS = ["S13", "S1311", "S1312", "S1313", "S1314"]
YEARS = list(range(Y0, Y1 + 1))


def get(dataset, params):
    q = "&".join(f"{k}={v}" for k, v in params)
    url = f"{BASE}{dataset}?{q}&format=JSON&lang=EN"
    for intento in range(3):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            if getattr(e, "code", None) == 404:  # sin datos para la combinación
                return None
            if intento == 2:
                raise
    return None


def parse(js, key_dims):
    """Devuelve {(valores de key_dims): valor} a partir de JSON-stat."""
    if not js:
        return {}
    ids, size = js["id"], js["size"]
    cats = {d: sorted(js["dimension"][d]["category"]["index"].items(), key=lambda kv: kv[1]) for d in ids}
    out = {}
    for pos, val in js["value"].items():
        i, labels = int(pos), {}
        for k in range(len(ids) - 1, -1, -1):
            labels[ids[k]] = cats[ids[k]][i % size[k]][0]
            i //= size[k]
        out[tuple(labels[d] for d in key_dims)] = val
    return out


def common(sector):
    return [("geo", "ES"), ("sector", sector), ("unit", "MIO_EUR")] + [("time", y) for y in YEARS]


data = {str(y): {s: {"main": {}, "cofog": {}, "exp": {}, "tax": {}} for s in SECTORS} for y in YEARS}

for s in SECTORS:
    for (item, t), v in parse(get("gov_10a_main", common(s)), ["na_item", "time"]).items():
        data[t][s]["main"][item] = v
    for (item, t), v in parse(get("gov_10a_taxag", common(s)), ["na_item", "time"]).items():
        data[t][s]["tax"][item] = v
    for (g, item, t), v in parse(get("gov_10a_exp", common(s)), ["cofog99", "na_item", "time"]).items():
        if g == "TOTAL":
            continue
        if item == "TE":
            data[t][s]["cofog"][g] = v
        else:
            data[t][s]["exp"][f"{g}|{item}"] = v
    print(s, "ok")

# Elimina bloques/sectores/años vacíos
for y in list(data):
    for s in list(data[y]):
        data[y][s] = {b: v for b, v in data[y][s].items() if v}
        if not data[y][s]:
            del data[y][s]
    if "main" not in data[y].get("S13", {}):
        del data[y]

out = Path(__file__).resolve().parent.parent / "js" / "data.js"
out.write_text("// Generado por scripts/fetch_data.py (Eurostat gov_10a_main, gov_10a_exp y gov_10a_taxag, millones de EUR)\n"
               "window.DATA = " + json.dumps(data, separators=(",", ":")) + ";\n", encoding="utf-8")
print("años:", sorted(data), "| con COFOG:", sorted(y for y in data if "cofog" in data[y]["S13"]),
      "| tamaño KB:", out.stat().st_size // 1024)