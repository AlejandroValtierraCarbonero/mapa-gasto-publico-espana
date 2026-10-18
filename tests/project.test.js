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
  const context = loadScripts(["js/data.js", "js/trees.js"], { window: {} });
  context.DATA = context.window.DATA;
  context.TREES = context.window.TREES;
  context.SUBSECTORES = context.window.SUBSECTORES;
  return context;
}

class FakeElement {
  constructor(id) {
    this.id = id;
    this.children = [];
    this.options = [];
    this.style = {};
    this.classList = { add() {}, toggle() {} };
    this.clientWidth = 1000;
    this.clientHeight = 600;
    this.disabled = false;
    this.checked = false;
    this._value = "";
    this.textContent = "";
  }

  set value(value) {
    this._value = String(value);
  }

  get value() {
    return this._value;
  }

  set innerHTML(html) {
    this._innerHTML = html;
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

  append(child) {
    this.children.push(child);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

function loadApp() {
  const elements = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };
  const context = loadDataAndTrees();
  loadScripts(["js/treemap.js"], context);
  context.squarify = context.window.squarify;
  context.document = {
    getElementById,
    createElement: tag => new FakeElement(tag)
  };
  context.addEventListener = () => {};
  context.innerWidth = 1200;
  loadScripts(["js/app.js"], context);
  return { context, get: getElementById };
}

test("la página referencia recursos existentes y carga los scripts en orden", () => {
  const html = read("index.html");
  const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(([, value]) => value);

  for (const resource of resources) {
    assert.ok(fs.existsSync(path.join(root, resource)), `No existe ${resource}`);
  }
  assert.deepEqual(
    resources.filter(resource => resource.startsWith("js/")),
    ["js/data.js", "js/trees.js", "js/treemap.js", "js/app.js"]
  );
});

test("los datos cubren los años, sectores y fuentes esperados con valores finitos", () => {
  const { DATA, TREES, SUBSECTORES } = loadDataAndTrees();
  assert.deepEqual(Object.keys(DATA).sort(), [
    "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"
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

  const drillCell = map.children.find(cell => cell.onclick);
  assert.ok(drillCell, "No hay ninguna categoría navegable");
  drillCell.onclick();
  assert.ok(get("crumbs").children.length > 1);
  const rootCrumb = get("crumbs").children.find(child => child && child.onclick);
  assert.ok(rootCrumb);
  rootCrumb.onclick();
  assert.equal(get("crumbs").children.length, 1);
});
