const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function loadScripts(files, context = {}) {
  vm.createContext(context);
  for (const file of files) vm.runInContext(read(file), context, { filename: file });
  return context;
}

function loadDataAndTrees() {
  const context = loadScripts(["js/data.js", "js/data_deflactores.js", "js/data_deflactores_ccaa.js", "js/trees.js", "js/deflactor.js"], { window: {} });
  context.DATA = context.window.DATA;
  context.TREES = context.window.TREES;
  context.SUBSECTORES = context.window.SUBSECTORES;
  context.Deflactor = context.window.Deflactor;
  return context;
}

class FakeElement {
  constructor(id) {
    this.id = id;
    this.children = [];
    this.options = [];
    this.style = {};
    this.attributes = {};
    this.classNames = new Set();
    this.classList = {
      add: name => this.classNames.add(name),
      remove: name => this.classNames.delete(name),
      toggle: (name, force) => (force === undefined ? !this.classNames.has(name) : force) ? this.classNames.add(name) : this.classNames.delete(name)
    };
    this.clientWidth = 1000;
    this.clientHeight = 600;
    this.disabled = false;
    this.hidden = false;
    this.checked = false;
    this._value = "";
    this._text = "";
    this.focused = false;
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this._text + this.children.map(child => typeof child === "string" ? child : child.textContent).join("");
  }

  set value(value) {
    this._value = String(value);
  }

  get value() {
    return this._value;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this._text = "";
    this.children = [];
    this.options = [...html.matchAll(/<option value="([^"]+)"([^>]*)>(.*?)<\/option>/g)]
      .map(([, value, attributes, label]) => ({
        value,
        label,
        disabled: /\sdisabled(?:\s|$)/.test(attributes)
      }));
  }

  get innerHTML() {
    return this._innerHTML || "";
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return name in this.attributes ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  focus() {
    this.focused = true;
  }

  append(...children) {
    this.children.push(...children);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  find(predicate, found = []) {
    for (const child of this.children) {
      if (typeof child === "string") continue;
      if (predicate(child)) found.push(child);
      child.find(predicate, found);
    }
    return found;
  }
}

function makeDocument(getElementById) {
  const listeners = {};
  return {
    getElementById,
    createElement: tag => Object.assign(new FakeElement(tag), { tag }),
    addEventListener: (type, listener) => (listeners[type] ||= []).push(listener),
    listeners
  };
}

function crumbParts(nav) {
  return nav.find(node => node.tag === "li");
}

function crumbButtons(nav) {
  return nav.find(node => node.tag === "button");
}

function loadApp() {
  const elements = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };
  const context = loadDataAndTrees();
  loadScripts(["js/treemap.js", "js/evolucion.js"], context);
  context.Evolucion = context.window.Evolucion;
  context.squarify = context.window.squarify;
  context.document = makeDocument(getElementById);
  context.addEventListener = () => {};
  context.innerWidth = 1200;
  loadScripts(["js/ui.js", "js/app.js"], context);
  return { context, get: getElementById };
}

test("la página referencia recursos existentes y carga los scripts en orden", () => {
  const html = read("index.html");
  const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(([, value]) => value).filter(value => !value.startsWith("#"));

  for (const resource of resources) {
    assert.ok(fs.existsSync(path.join(root, resource)), `No existe ${resource}`);
  }
  assert.deepEqual(
    resources.filter(resource => resource.startsWith("js/")),
    ["js/data.js", "js/data_deflactores.js", "js/data_deflactores_ccaa.js", "js/trees.js", "js/deflactor.js", "js/treemap.js", "js/ui.js", "js/evolucion.js", "js/app.js", "js/data_hacienda.js", "js/hacienda.js"]
  );
});

test("los datos cubren los años, sectores y fuentes esperados con valores finitos", () => {
  const { DATA, TREES, SUBSECTORES } = loadDataAndTrees();
  assert.deepEqual(Object.keys(DATA).sort(), [
    ...Array.from({ length: 26 }, (_, i) => String(2000 + i))
  ]);
  assert.deepEqual(Object.keys(SUBSECTORES).sort(), ["S1311", "S1312", "S1313", "S1314"]);
  assert.deepEqual(Object.keys(TREES).sort(), [
    "gastosFuncion", "gastosTipo", "gastosTipoFuncion", "ingresos", "ingresosDetalle"
  ]);

  for (const [year, sectors] of Object.entries(DATA)) {
    assert.ok(sectors.S13?.main?.TR, `Falta el total de ingresos de ${year}`);
    assert.ok(sectors.S13?.main?.TE, `Falta el total de gastos de ${year}`);
    for (const [sector, blocks] of Object.entries(sectors)) {
      assert.ok(["S13", ...Object.keys(SUBSECTORES)].includes(sector));
      for (const values of Object.values(blocks)) {
        for (const amount of Object.values(values)) assert.ok(Number.isFinite(amount));
      }
    }
  }
});

test("el treemap distribuye el área disponible y omite valores no positivos", () => {
  const context = loadScripts(["js/treemap.js"], { window: {} });
  const rectangles = context.window.squarify([
    { name: "A", val: 6 },
    { name: "B", val: 4 },
    { name: "cero", val: 0 },
    { name: "negativo", val: -2 }
  ], 0, 0, 100, 60);

  assert.deepEqual(Array.from(rectangles, rectangle => rectangle.name).sort(), ["A", "B"]);
  for (const rectangle of rectangles) {
    assert.ok(rectangle.w >= 0 && rectangle.h >= 0);
    assert.ok(rectangle.x >= 0 && rectangle.y >= 0);
    assert.ok(rectangle.x + rectangle.w <= 100.001);
    assert.ok(rectangle.y + rectangle.h <= 60.001);
  }
  const area = rectangles.reduce((sum, rectangle) => sum + rectangle.w * rectangle.h, 0);
  assert.ok(Math.abs(area - 6000) < 0.001);
});

test("la aplicación renderiza las vistas, sectores y navegación sin errores", () => {
  const { get } = loadApp();
  const map = get("map");
  const view = get("selView");
  const sector = get("selSector");

  assert.equal(get("selTo").value, "2025");
  assert.ok(map.children.length > 0);

  get("bGas").onclick();
  for (const viewName of ["tipo", "funcion", "tipofuncion"]) {
    view.value = viewName;
    view.onchange({ target: view });
    const lastAvailableYear = viewName === "tipo" ? "2025" : "2024";
    assert.equal(get("selTo").value, lastAvailableYear);
    assert.equal(
      get("selTo").options.find(option => option.value === "2025").disabled,
      lastAvailableYear === "2024"
    );
    assert.ok(map.children.length > 0, `La vista ${viewName} no renderiza partidas`);
  }

  get("bIng").onclick();
  view.value = "detalle";
  view.onchange({ target: view });
  assert.equal(get("selTo").value, "2024");
  assert.ok(map.children.length > 0);
  view.value = "resumen";
  view.onchange({ target: view });
  assert.equal(get("selTo").value, "2024");
  assert.equal(get("selTo").options.find(option => option.value === "2025").disabled, false);
  get("selTo").value = "2025";
  get("selTo").onchange({ target: get("selTo") });
  assert.equal(get("selTo").value, "2025");

  sector.value = "S1312";
  sector.onchange({ target: sector });
  assert.match(get("note").textContent, /Subsector no consolidado/);
  assert.ok(map.children.length > 0);

  get("chkAcc").checked = true;
  get("chkAcc").onchange({ target: get("chkAcc") });
  assert.equal(get("selFrom").disabled, false);
  get("selFrom").value = "2020";
  get("selFrom").onchange({ target: get("selFrom") });
  get("selTo").value = "2022";
  get("selTo").onchange({ target: get("selTo") });
  assert.match(get("sum").innerHTML, /2020–2022 \(acumulado\)/);

  const drillCell = map.children.find(cell => /drill/.test(cell.className));
  assert.ok(drillCell, "No hay ninguna categoría navegable");
  drillCell.onclick();
  assert.equal(crumbParts(get("crumbs")).length > 1, true);
  assert.equal(get("btnBack").hidden, false);
  assert.ok(get("levelTitle").focused, "El foco debe pasar al encabezado del nivel");
  const rootCrumb = crumbButtons(get("crumbs")).find(child => child.onclick);
  assert.ok(rootCrumb);
  rootCrumb.onclick();
  assert.equal(crumbParts(get("crumbs")).length, 1);
  assert.equal(get("btnBack").hidden, true);
});

function loadBothSources() {
  const elements = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };
  const context = loadDataAndTrees();
  loadScripts(["js/data_hacienda.js"], context);
  loadScripts(["js/treemap.js", "js/evolucion.js"], context);
  context.Evolucion = context.window.Evolucion;
  context.squarify = context.window.squarify;
  context.document = makeDocument(getElementById);
  const listeners = {};
  context.addEventListener = (type, listener) => (listeners[type] ||= []).push(listener);
  context.dispatchEvent = event => (listeners[event.type] || []).forEach(listener => listener(event));
  context.Event = function Event(type) { this.type = type; };
  context.innerWidth = 1200;
  getElementById("selSource").value = "eurostat";
  loadScripts(["js/ui.js", "js/app.js", "js/hacienda.js"], context);
  return { context, get: getElementById, listeners };
}

test("Hacienda declara la cobertura 2002–2024 y territorios con descarga real", () => {
  const context = loadDataAndTrees();
  loadScripts(["js/data_hacienda.js"], context);
  const hacienda = context.window.HACIENDA;
  assert.equal(Object.keys(hacienda.territories).length, 20);
  assert.equal(hacienda.territories["00"], "Total CCAA");
  assert.equal(hacienda.territories["17"], "Comunitat Valenciana");
  assert.equal(hacienda.territories["18"], "Ceuta");
  assert.equal(hacienda.territories["19"], "Melilla");
  assert.equal(hacienda.classification, "Clasificaci\u00f3n funcional y cap\u00edtulos econ\u00f3micos propios de Hacienda");
  assert.deepEqual(Object.keys(hacienda.data).sort(), ["00", ...Array.from({ length: 19 }, (_, i) => String(i + 1).padStart(2, "0"))].sort());
  const expectedYears = Array.from({ length: 23 }, (_, i) => String(2002 + i));
  assert.deepEqual(Object.keys(hacienda.years).sort(), expectedYears);
  assert.deepEqual(Object.keys(hacienda.data["00"]).sort(), expectedYears);
  for (const [territory, byYear] of Object.entries(hacienda.data)) {
    for (const [year, record] of Object.entries(byYear)) {
      assert.ok(hacienda.years[year].includes(territory), `${territory} no figura en ${year}`);
      assert.ok(record.rows.length > 0, `Sin filas para ${territory}/${year}`);
      assert.ok(Number.isFinite(record.total) && record.total > 0);
      assert.equal(record.totalChapters.length, 9);
      for (const row of record.rows) {
        assert.ok(Number.isFinite(row.total));
        assert.equal(row.chapters.length, 9);
        assert.ok(row.chapters.every(Number.isFinite));
      }
    }
  }
  for (const code of ["18", "19"]) {
    assert.deepEqual(Object.keys(hacienda.data[code]).sort(), Array.from({ length: 8 }, (_, i) => String(2005 + i)),
      "Ceuta y Melilla solo tienen fichero de 2005 a 2012");
  }
  for (const year of expectedYears) assert.equal(hacienda.years[year].length, year >= "2005" && year <= "2012" ? 20 : 18);
});

test("el selector cambia a Hacienda por territorio y vuelve al flujo Eurostat intacto", () => {
  const { context, get, listeners } = loadBothSources();
  const eurostatData = context.DATA;
  const eurostatTrees = context.TREES;
  assert.equal(get("selSource").value, "eurostat");
  assert.equal(get("euControls").hidden, false);
  const eurostatCells = get("map").children.length;
  assert.ok(eurostatCells > 0);

  const source = get("selSource");
  source.value = "hacienda"; source.onchange({ target: source });
  assert.equal(get("euControls").hidden, true);
  assert.equal(get("hcControls").hidden, false);
  assert.equal(get("selHaciendaYear").value, "2024");
  assert.ok(get("selHaciendaTerritory").options.some(o => o.value === "00"));
  assert.ok(get("selHaciendaTerritory").options.some(o => o.value === "18"));
  assert.ok(get("map").children.length > 0);
  assert.match(get("sum").innerHTML, /283\.709\.850/);
  assert.match(get("noteFull").textContent, /no equivalen a COFOG ni los cap\u00edtulos a tipos SEC/);
  assert.match(get("note").textContent, /no equivalen a COFOG ni a tipos SEC/);
  assert.equal(get("noteDetails").hidden, false);
  assert.match(get("sourceNotice").textContent, /Fuente cambiada a Hacienda/);
  listeners.resize.forEach(listener => listener({ type: "resize" }));
  assert.match(get("sum").innerHTML, /283\.709\.850/, "un resize no debe volver a pintar Eurostat sobre Hacienda");
  const accumulate = get("chkHaciendaAcc");
  accumulate.checked = true; accumulate.onchange({ target: accumulate });
  const from = get("selHaciendaFrom"); from.value = "2023"; from.onchange({ target: from });
  assert.match(get("sum").innerHTML, /2023.*2024 \(acumulado\)/);
  accumulate.checked = false; accumulate.onchange({ target: accumulate });
  assert.match(get("sum").innerHTML, /2024/);
  assert.doesNotMatch(get("sum").innerHTML, /acumulado/);

  const territory = get("selHaciendaTerritory");
  territory.value = "09"; territory.onchange({ target: territory });
  assert.match(get("sum").innerHTML, /55\.827\.555/);
  const view = get("selHaciendaView");
  view.value = "funcionTipo"; view.onchange({ target: view });
  const drill = get("map").children.find(cell => /drill/.test(cell.className));
  assert.ok(drill, "La vista funcional por capitulo debe permitir navegar");
  drill.onclick();
  assert.ok(crumbParts(get("crumbs")).length > 1);

  source.value = "eurostat"; source.onchange({ target: source });
  assert.equal(get("hcControls").hidden, true);
  assert.equal(get("euControls").hidden, false);
  assert.equal(context.DATA, eurostatData, "No se debe reemplazar ni mutar DATA de Eurostat");
  assert.equal(context.TREES, eurostatTrees, "No se deben alterar los ?rboles de Eurostat");
  assert.ok(get("map").children.length > 0);
});

test("la evolución entre años calcula variaciones unitarias y porcentuales", () => {
  const { Evolucion } = loadScripts(["js/evolucion.js"], { window: {} }).window;
  assert.deepEqual(Array.from(Evolucion.transform([100, 110, 99], "delta")), [null, 10, -11]);
  assert.deepEqual(Array.from(Evolucion.transform([100, 110, 0, 5], "pct")), [null, 10, -100, null]);
  assert.deepEqual(Array.from(Evolucion.transform([1, 2], "valor")), [1, 2]);
});

test("la vista de evolución se pinta en ambas fuentes", () => {
  const { get } = loadBothSources();
  const check = get("chkEvo"); check.checked = true; check.onchange({ target: check });
  assert.match(get("map").innerHTML, /<svg/);
  const mode = get("selEvoMode"); mode.value = "pct"; mode.onchange({ target: mode });
  assert.match(get("map").innerHTML, /porcentual/);
  const source = get("selSource"); source.value = "hacienda"; source.onchange({ target: source });
  mode.value = "delta"; mode.onchange({ target: mode });
  assert.match(get("map").innerHTML, /unitaria/);
  assert.match(get("map").innerHTML, /2015/);
});


test("la estructura HTML ofrece landmarks, salto, migas nav, región viva y grupos de controles", () => {
  const html = read("index.html");
  assert.match(html, /<a class="skip-link" href="#contenido">/);
  assert.match(html, /<main id="contenido" tabindex="-1">/);
  assert.match(html, /<nav id="crumbs" aria-label="Ruta de navegación">/);
  assert.match(html, /id="announcement"[^>]*aria-live="polite"/);
  assert.match(html, /<h1>/);
  assert.match(html, /<h2 id="visual-title">/);
  assert.equal((html.match(/<fieldset/g) || []).length, 4);
  assert.equal((html.match(/<legend>/g) || []).length, 4);
  assert.match(html, /id="bIng"[^>]*aria-pressed="true"/);
  assert.match(html, /id="legend"/);
  assert.match(html, /<main[\s\S]*id="sum"[\s\S]*id="map"[\s\S]*<\/main>/);
  const css = read("css/styles.css");
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.skip-link:focus/);
  assert.match(css, /@media \(max-width: 40rem\)/);
});

test("las celdas del treemap usan botones no interactivos por teclado, contraste ≥ 4,5:1 y tabla equivalente", () => {
  const { get, context } = loadApp();
  const cells = get("map").children;
  assert.ok(cells.length > 0);
  assert.equal(get("map").getAttribute("aria-hidden"), "true");
  for (const cell of cells) {
    assert.equal(cell.tag, "button");
    assert.equal(cell.getAttribute("tabindex"), "-1");
  }
  const rows = get("dataAlt").find(node => node.tag === "tr");
  assert.ok(rows.length >= cells.length + 1, "la tabla debe incluir al menos las partidas del mapa");
  assert.ok(get("dataAlt").find(node => node.tag === "caption").length === 1);
  assert.ok(get("dataAlt").find(node => node.tag === "th" && node.getAttribute("scope") === "row").length >= cells.length);
  const { cellColors } = context.window.UI;
  for (let hue = 0; hue < 360; hue += 5) {
    for (const light of [28, 31, 36, 40, 46]) {
      assert.ok(cellColors(hue, 60, light).ratio >= 4.5, `contraste insuficiente en hsl(${hue} 60% ${light}%)`);
    }
  }
  assert.ok(cellColors(215, 12, 38).ratio >= 4.5);
});

test("los botones Ingresos/Gastos exponen aria-pressed y los cambios se anuncian una vez", () => {
  const { get } = loadApp();
  get("bGas").onclick();
  assert.equal(get("bGas").getAttribute("aria-pressed"), "true");
  assert.equal(get("bIng").getAttribute("aria-pressed"), "false");
  assert.match(get("announcement").textContent, /^Gastos, \d{4}, .* M€, nivel Gastos/);
  assert.match(get("sum").innerHTML, /Saldo \((déficit|superávit)\): [+-]?/);
});

test("la navegación por teclado: volver, migas y foco tras el render", () => {
  const { get } = loadApp();
  const drillBtn = get("dataAlt").find(node => node.tag === "button" && node.onclick)[0];
  assert.ok(drillBtn, "la tabla debe ofrecer 'Abrir desglose' como camino por teclado");
  drillBtn.onclick();
  assert.equal(get("btnBack").hidden, false);
  assert.equal(get("levelTitle").focused, true);
  get("levelTitle").focused = false;
  get("btnBack").onclick();
  assert.equal(get("btnBack").hidden, true);
  assert.equal(get("levelTitle").focused, true);
  const current = get("crumbs").find(node => node.getAttribute("aria-current") === "page");
  assert.equal(current.length, 1);
});

test("Hacienda: tabla, aviso de cambio de fuente y estado vacío sin romper controles", () => {
  const { get } = loadBothSources();
  const source = get("selSource");
  source.value = "hacienda"; source.onchange({ target: source });
  assert.match(get("announcement").textContent, /Fuente cambiada a Hacienda/);
  assert.ok(get("dataAlt").find(node => node.tag === "tr").length > 1);
  assert.match(get("dataAlt").find(node => node.tag === "caption")[0].textContent, /miles de euros/);
  assert.match(get("sum").innerHTML, /miles de €/);
  source.value = "eurostat"; source.onchange({ target: source });
  assert.match(get("sourceNotice").textContent, /Fuente cambiada a Eurostat/);
  assert.equal(get("noteDetails").hidden, true);
});

test("la evolución usa tabla semántica, SVG con título/descripción, límite de series y celdas no calculables", () => {
  const { Evolucion } = loadScripts(["js/evolucion.js"], { window: {} }).window;
  const el = { innerHTML: "" };
  const years = [2000, 2001, 2002];
  const series = Array.from({ length: 12 }, (_, i) => ({ name: `Partida ${i}`, values: [100 + i, 0, i === 0 ? null : 50] }));
  const fmt = n => `${n} M€`;
  Evolucion.draw(el, { years, series, mode: "pct", fmt, unit: "M€", context: "Eurostat, Gastos" });
  assert.match(el.innerHTML, /<svg[^>]*role="img"[^>]*aria-labelledby="evoChartTitle"[^>]*aria-describedby="evoChartDesc"/);
  assert.match(el.innerHTML, /<caption>[^<]*Eurostat, Gastos[^<]*2000–2002/);
  assert.match(el.innerHTML, /<th scope="col">2001<\/th>/);
  assert.match(el.innerHTML, /<th scope="row">/);
  assert.match(el.innerHTML, /las 10 partidas mayores del último año; la tabla incluye las 12 series/);
  assert.equal((el.innerHTML.match(/<path /g) || []).length, 10);
  assert.equal((el.innerHTML.match(/<th scope="row">/g) || []).length, 12);
  assert.match(el.innerHTML, /No calculable/);
  assert.match(el.innerHTML, /No disponible/);
  assert.doesNotMatch(el.innerHTML, /aria-label="Evolución"/);
});

test("el deflactor clasifica las partidas según la guía y reexpresa en euros constantes", () => {
  const { Deflactor: D } = loadDataAndTrees();
  assert.equal(D.classify(["Gastos", "Remuneración de asalariados"], "eurostat"), "laboral");
  assert.equal(D.classify(["Gastos", "Prestaciones sociales"], "eurostat"), "ipc");
  assert.equal(D.classify(["Gastos", "Inversión", "Formación bruta de capital fijo"], "eurostat"), "fbcf");
  assert.equal(D.classify(["Gastos", "Sanidad"], "eurostat"), "consumo");
  assert.equal(D.classify(["Gastos", "Protección social", "Vejez (pensiones)"], "eurostat"), "ipc");
  assert.equal(D.classify(["Gastos"], "eurostat"), "pib");
  assert.equal(D.classify(["Gasto por capítulo", "1. Gastos de personal"], "hacienda"), "laboral");
  assert.equal(D.classify(["Gasto por área", "Educación"], "hacienda"), "consumo");
  assert.equal(D.state.on, false);
  assert.equal(D.factor("ipc", 2010), 1);
  D.state.on = true; D.state.base = 2020;
  assert.ok(Math.abs(D.factor("ipc", 2010) - D.index("ipc", 2020) / D.index("ipc", 2010)) < 1e-12);
  assert.ok(D.factor("pib", 2000) > 1);
  assert.equal(D.factor("pib", 2020), 1);
});

test("deflactar mantiene los datos nominales y el total coherente con sus partidas en ambas fuentes", () => {
  const { get, context } = loadBothSources();
  const nominal = get("sum").innerHTML;
  get("selTo").value = "2010"; get("selTo").onchange({ target: get("selTo") });
  const before = get("sum").innerHTML;
  get("chkDefl").checked = true; get("chkDefl").onchange({ target: get("chkDefl") });
  assert.match(get("sum").innerHTML, /€ constantes de 2024/);
  assert.notEqual(get("sum").innerHTML, before);
  assert.equal(get("lblDeflBase").hidden, false);
  assert.match(get("note").textContent, /Importes deflactados a euros constantes de 2024/);
  get("chkDefl").checked = false; get("chkDefl").onchange({ target: get("chkDefl") });
  assert.equal(get("sum").innerHTML, before);
  assert.notEqual(nominal, before);

  const source = get("selSource");
  source.value = "hacienda"; source.onchange({ target: source });
  get("chkDefl").checked = true; get("chkDefl").onchange({ target: get("chkDefl") });
  assert.match(get("sum").innerHTML, /€ constantes de 2024/);
  get("chkHaciendaAcc").checked = true; get("chkHaciendaAcc").onchange({ target: get("chkHaciendaAcc") });
  get("selHaciendaFrom").value = "2015"; get("selHaciendaFrom").onchange({ target: get("selHaciendaFrom") });
  assert.match(get("sum").innerHTML, /2015–2024 \(acumulado\)/);
  assert.ok(get("dataAlt").find(node => node.tag === "tr").length > 1);
  assert.ok(context.Deflactor.state.on);
});

test("los deflactores regionales cubren las 19 comunidades y el PIB nacional del INE reproduce el de Eurostat", () => {
  const { window: w } = loadScripts(["js/data_deflactores.js", "js/data_deflactores_ccaa.js"], { window: {} });
  const R = w.DEFLACTORES_CCAA;
  const codes = Array.from({ length: 19 }, (_, i) => String(i + 1).padStart(2, "0"));
  for (const key of ["ipc", "pib"]) {
    assert.deepEqual(Object.keys(R[key]).sort(), codes);
    for (const code of codes) {
      assert.equal(R[key][code]["2015"], 100);
      for (let y = 2002; y <= 2024; y++) assert.ok(R[key][code][y] > 0, `${key} ${code} ${y}`);
    }
  }
  for (const y of Object.keys(R.nacionalINE.pib)) {
    if (w.DEFLACTORES_DATA.pib[y]) assert.ok(Math.abs(R.nacionalINE.pib[y] / w.DEFLACTORES_DATA.pib[y] - 1) < 1e-3, `PIB ${y}`);
  }
});

test("el ámbito regional solo sustituye IPC y PIB en la comunidad activa y por defecto se usa España", () => {
  const { Deflactor: D, window: w } = loadDataAndTrees();
  const R = w.DEFLACTORES_CCAA;
  D.state.on = true; D.state.base = 2020;
  const nationalPib = D.index("pib", 2010);
  D.state.territory = "01";
  assert.equal(D.index("pib", 2010), nationalPib);
  assert.equal(D.regionalAvailable(), true);
  D.state.scope = "regional";
  assert.equal(D.index("pib", 2010), R.pib["01"]["2010"]);
  assert.equal(D.index("ipc", 2010), R.ipc["01"]["2010"]);
  assert.equal(D.index("consumo", 2010), w.DEFLACTORES_DATA.consumo["2010"]);
  assert.ok(Math.abs(D.factor("pib", 2010) - R.pib["01"]["2020"] / R.pib["01"]["2010"]) < 1e-12);
  assert.match(D.label("pib"), /de la comunidad/);
  assert.match(D.describe(["pib", "consumo"]), /sin serie regional/);
  assert.ok(Math.min(...D.years()) >= 2002);
  D.state.territory = "00";
  assert.equal(D.index("pib", 2010), nationalPib);
  assert.equal(D.regionalAvailable(), false);
  D.state.territory = "";
  assert.equal(D.index("ipc", 2010), w.DEFLACTORES_DATA.ipc["2010"]);
});

test("en Hacienda el selector de ámbito de precios aparece solo para una comunidad y cambia el resultado", () => {
  const { get, context } = loadBothSources();
  const source = get("selSource");
  source.value = "hacienda"; source.onchange({ target: source });
  get("chkDefl").checked = true; get("chkDefl").onchange({ target: get("chkDefl") });
  assert.equal(get("lblDeflScope").hidden, true);
  const territory = get("selHaciendaTerritory");
  territory.value = "01"; territory.onchange({ target: territory });
  assert.equal(get("lblDeflScope").hidden, false);
  get("selHaciendaYear").value = "2010"; get("selHaciendaYear").onchange({ target: get("selHaciendaYear") });
  const national = get("sum").innerHTML;
  get("selDeflScope").value = "regional"; get("selDeflScope").onchange({ target: get("selDeflScope") });
  assert.notEqual(get("sum").innerHTML, national);
  assert.match(get("note").textContent, /de la comunidad/);
  source.value = "eurostat"; source.onchange({ target: source });
  assert.equal(get("lblDeflScope").hidden, true);
  assert.equal(context.Deflactor.state.territory, "");
});

test("la evolución compara el gasto nominal con su deflactor en índice 100", () => {
  const { Evolucion } = loadScripts(["js/evolucion.js"], { window: {} }).window;
  const { Deflactor } = loadDataAndTrees();
  const el = { innerHTML: "" };
  const years = [2015, 2016, 2017];
  const nominal = [100, 110, 121];
  const series = [{ name: "Personal", defl: "laboral", values: nominal, nominal }];
  const context = loadScripts(["js/evolucion.js"], { window: { Deflactor } });
  context.window.Evolucion.draw(el, { years, series, mode: "indice", fmt: n => String(n), unit: "M€" });
  assert.match(el.innerHTML, /Personal · nominal/);
  assert.match(el.innerHTML, /Personal · deflactor \(Coste laboral/);
  assert.match(el.innerHTML, /Personal · real/);
  assert.match(el.innerHTML, /stroke-dasharray/);
  assert.match(el.innerHTML, /<td class="">121,0<\/td>/);
});
