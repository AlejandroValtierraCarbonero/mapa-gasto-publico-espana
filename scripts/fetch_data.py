"""Descarga de Eurostat (Contabilidad Nacional, S.13 España) y genera js/data.js."""
import json
import urllib.request
from pathlib import Path

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
Y0, Y1 = 2015, 2025
ITEMS = ["TR", "TE", "B9", "D1PAY", "P2", "P5", "OP5ANP", "D3PAY", "D31PAY", "D39PAY",
         "D4PAY", "D41PAY", "D42_TO_D45PAY", "D5PAY", "D62PAY", "D632PAY", "D62_D632PAY",
         "D7PAY", "D9PAY", "D29PAY",
         "D61REC", "D611REC", "D613REC", "D5REC", "D2REC", "D211REC", "D29REC",
         "P11_P12_P131", "D9REC", "D7REC", "D4REC", "D41REC", "D42_TO_D45REC"]


def get(dataset, params):
    q = "&".join(f"{k}={v}" for k, v in params)
    with urllib.request.urlopen(f"{BASE}{dataset}?{q}&format=JSON&lang=EN", timeout=60) as r:
        return json.load(r)


def parse(js, key_dims):
    """Devuelve {(valores de key_dims): valor} a partir de JSON-stat."""
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


years = list(range(Y0, Y1 + 1))
common = [("geo", "ES"), ("sector", "S13"), ("unit", "MIO_EUR")] + [("time", y) for y in years]
main = parse(get("gov_10a_main", common + [("na_item", i) for i in ITEMS]), ["na_item", "time"])
cofog = parse(get("gov_10a_exp", common + [("na_item", "TE")]), ["cofog99", "time"])

data = {}
for y in years:
    ys = str(y)
    m = {i: v for (i, t), v in main.items() if t == ys}
    c = {g: v for (g, t), v in cofog.items() if t == ys and g != "TOTAL"}
    if m:
        data[ys] = {"main": m}
        if c:
            data[ys]["cofog"] = c

out = Path(__file__).resolve().parent.parent / "js" / "data.js"
out.write_text("// Generado por scripts/fetch_data.py (Eurostat gov_10a_main y gov_10a_exp, millones de EUR)\n"
               "window.DATA = " + json.dumps(data, indent=1) + ";\n", encoding="utf-8")
print("años:", sorted(data), "| con COFOG:", sorted(y for y in data if "cofog" in data[y]))
