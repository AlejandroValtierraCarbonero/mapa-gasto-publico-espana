"""Descarga la liquidación consolidada de Hacienda mediante su formulario WebForms.

El portal exige una sesión: se abre el menú, se lee el formulario de descarga,
se envían sus tokens de sesión y se sigue la redirecci\u00f3n al XLSX. Se genera
js/data_hacienda.js; no se consulta la fuente desde el navegador.
"""
import argparse
import html
import http.cookiejar
import json
import math
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO
from pathlib import Path

BASE = "https://serviciostelematicosext.hacienda.gob.es/SGCIEF/PublicacionLiquidaciones/aspx/"
YEARS = list(range(2002, 2025))
TERRITORIES = {
    "00": "Total CCAA", "01": "Andalucía", "02": "Aragón", "03": "Asturias",
    "04": "Illes Balears", "05": "Canarias", "06": "Cantabria", "07": "Castilla y León",
    "08": "Castilla-La Mancha", "09": "Cataluña", "10": "Extremadura", "11": "Galicia",
    "12": "Comunidad de Madrid", "13": "Región de Murcia", "14": "Navarra",
    "15": "País Vasco", "16": "La Rioja", "17": "Comunitat Valenciana", "18": "Ceuta", "19": "Melilla",
}
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
CLASSIFICATION = "Clasificaci" + chr(0xf3) + "n funcional y cap" + chr(0xed) + "tulos econ" + chr(0xf3) + "micos propios de Hacienda"


def col_index(ref):
    n = 0
    for c in re.match(r"[A-Z]+", ref).group(0):
        n = n * 26 + ord(c) - 64
    return n - 1


def parse_xlsx(raw, year, code):
    try:
        z = zipfile.ZipFile(BytesIO(raw))
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    except Exception as exc:
        raise ValueError(f"{year}/{code}: respuesta no es un XLSX válido") from exc
    rows = sheet.findall(".//m:sheetData/m:row", NS)
    try:
        shared_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        shared = ["".join(item.itertext()) for item in shared_root.findall("m:si", NS)]
    except KeyError:
        shared = []
    cell_rows = []
    for row in rows:
        vals = {}
        for cell in row.findall("m:c", NS):
            idx = col_index(cell.attrib["r"])
            typ = cell.attrib.get("t")
            if typ == "inlineStr":
                val = "".join(cell.find("m:is", NS).itertext()) if cell.find("m:is", NS) is not None else ""
            else:
                v = cell.find("m:v", NS)
                val = v.text if v is not None else ""
                if typ == "s" and val:
                    val = shared[int(val)]
            vals[idx] = html.unescape(val).strip()
        cell_rows.append(vals)
    header_index = next((i for i, r in enumerate(cell_rows)
                         if "reas y Pol" in r.get(0, "")
                         and r.get(10, "").strip().lower().startswith("total")), None)
    if header_index is None:
        # Algunas exportaciones pueden eliminar tildes o espacios en la etiqueta.
        header_index = next((i for i, r in enumerate(cell_rows) if "reas y Pol" in r.get(0, "") and r.get(10, "").strip().lower().startswith("total")), None)
    if header_index is None:
        raise ValueError(f"{year}/{code}: no se encontró la tabla funcional oficial")
    headers = cell_rows[header_index]
    if not all(i in headers for i in range(0, 11)):
        raise ValueError(f"{year}/{code}: faltan columnas de capítulo en la hoja")
    # La primera columna contiene áreas y políticas; B:J capítulos 1?9 y K total.
    records, total = [], None
    current_area = None
    for row in cell_rows[header_index + 1:]:
        label = row.get(0, "").strip()
        if not label:
            continue
        values = []
        for idx in range(1, 11):
            text = row.get(idx, "").replace(",", ".")
            if not text or text in ("-", chr(0x2013), chr(0x2014)):
                values.append(0.0)
            else:
                try:
                    value = float(text)
                except ValueError as exc:
                    raise ValueError(f"{year}/{code}: importe no num\u00e9rico en la tabla: {text!r}") from exc
                if not math.isfinite(value):
                    raise ValueError(f"{year}/{code}: importe no finito en la tabla")
                values.append(value)
        m = re.match(r"^(\d{1,2})\.\s*(.+)$", label)
        if label.lower().startswith("total gastos"):
            total = values
            continue
        if not m:
            continue
        number, name = m.group(1), m.group(2).strip()
        if len(number) == 1:
            current_area = number
            records.append({"areaCode": number, "area": name, "policyCode": number,
                            "policy": name, "chapters": values[:9], "total": values[9]})
        elif current_area:
            records.append({"areaCode": current_area, "area": next(r["area"] for r in reversed(records) if r["areaCode"] == current_area and r["policyCode"] == current_area),
                            "policyCode": number, "policy": name, "chapters": values[:9], "total": values[9]})
    if not records or total is None or not any(v for v in total):
        raise ValueError(f"{year}/{code}: tabla sin filas cuantitativas ni total gastos")
    return {"unit": "miles de euros", "rows": records, "totalChapters": total[:9], "total": total[9]}


class NoDataError(RuntimeError):
    """El formulario oficial confirma que no hay fichero para este ejercicio/territorio."""


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def download(year, code):
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar), NoRedirect())
    with opener.open(BASE + "menuInicio.aspx", timeout=60):
        pass
    page = opener.open(BASE + "SelDescargaDC.aspx", timeout=60).read().decode("latin-1", "replace")
    hidden = dict(re.findall(r'<input type="hidden" name="([^"]+)"[^>]*value="([^"]*)"', page, re.I))
    if not all(k in hidden for k in ("__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION")):
        raise RuntimeError("No se encontraron los tokens de sesión del formulario oficial")
    fields = dict(hidden)
    fields.update({
        "ctl00$MainContent$ano": str(year), "ctl00$MainContent$autonomia": code,
        "ctl00$MainContent$tipoConsulta": "../aspx/DescargaFuncionalCapDC.aspx?cdcdad=",
        "ctl00$MainContent$botonAceptar.x": "0", "ctl00$MainContent$botonAceptar.y": "0",
    })
    req = urllib.request.Request(BASE + "SelDescargaDC.aspx", data=urllib.parse.urlencode(fields).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded", "Referer": BASE + "SelDescargaDC.aspx"})
    try:
        response = opener.open(req, timeout=60)
        body = response.read().decode("latin-1", "replace")
        error = re.search(r'<span id="MainContent_labelError">(.*?)</span>', body, re.I | re.S)
        message = re.sub(r"<[^>]+>", "", error.group(1)).strip() if error else ""
        if message:
            if "sesion" in message.lower() or "sesi" in message.lower():
                raise RuntimeError(f"Sesi\u00f3n oficial inv\u00e1lida: {html.unescape(message)}")
            raise NoDataError(f"{year}/{code}: {html.unescape(message)}")
        raise RuntimeError(f"{year}/{code}: respuesta 200 sin redirecci\u00f3n ni mensaje de disponibilidad")
    except NoDataError:
        raise
    except urllib.error.HTTPError as response:
        if response.code not in (302, 303) or not response.headers.get("Location"):
            body = response.read(500).decode("latin-1", "replace")
            if "sesion_expirada" in body.lower():
                raise RuntimeError("La sesión oficial ha expirado")
            raise RuntimeError(f"{year}/{code}: error HTTP {response.code}")
        url = urllib.parse.urljoin(BASE + "SelDescargaDC.aspx", response.headers["Location"])
    with opener.open(url, timeout=120) as response:
        raw = response.read()
    if not raw.startswith(b"PK\x03\x04"):
        raise RuntimeError(f"{year}/{code}: el portal no entregó un XLSX")
    return parse_xlsx(raw, year, code)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--years", nargs="+", type=int, default=[2024], help="Ejercicios a consultar (2002–2024)")
    ap.add_argument("--territories", nargs="+", default=["00", *[f"{i:02d}" for i in range(1, 20)]], help="Códigos oficiales 00–19")
    args = ap.parse_args()
    if any(y not in YEARS for y in args.years) or any(c not in TERRITORIES for c in args.territories):
        ap.error("Ejercicio o código territorial fuera de la lista oficial del portal")
    data = {"source": "Ministerio de Hacienda: Liquidación de los presupuestos de las CCAA",
            "classification": CLASSIFICATION,
            "years": {}, "territories": TERRITORIES, "data": {}}
    for year in sorted(set(args.years)):
        for code in dict.fromkeys(args.territories):
            try:
                value = download(year, code)
                data["data"].setdefault(code, {})[str(year)] = value
                print(f"{year} {code} {TERRITORIES[code]}: OK ({value['total']:,.2f} miles de euros)")
            except NoDataError as exc:
                print(f"{year} {code} {TERRITORIES[code]}: sin datos ({exc})")
            time.sleep(0.15)
        data["years"][str(year)] = sorted(code for code in data["data"] if str(year) in data["data"][code])
    out = Path(__file__).resolve().parent.parent / "js" / "data_hacienda.js"
    out.write_text("// Generado por scripts/fetch_hacienda.py; cifras oficiales en miles de euros.\nwindow.HACIENDA = " +
                   json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Escrito {out} ({out.stat().st_size:,} bytes); cobertura: {data['years']}")


if __name__ == "__main__":
    main()
