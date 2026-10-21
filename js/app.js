(function () {
  const $ = id => document.getElementById(id);
  const UI = window.UI;
  if (typeof DATA === "undefined" || typeof TREES === "undefined") {
    UI.showError("No se pudieron cargar los datos de Eurostat.");
    return;
  }
  const fmt = n => Math.round(n).toLocaleString("es-ES") + " M€";
  const years = Object.keys(DATA).map(Number).sort((a, b) => a - b);
  const last = years[years.length - 1];

  const VIEWS = {
    Ingresos: [["resumen", "Por tipo (resumen)", "ingresos"], ["detalle", "Impuestos y cotizaciones (detalle)", "ingresosDetalle"]],
    Gastos: [["tipo", "Por tipo", "gastosTipo"], ["funcion", "Por función (COFOG) → tipo", "gastosFuncion"],
      ["tipofuncion", "Por tipo → función (COFOG)", "gastosTipoFuncion"]]
  };
  const SECTORES = [["S13", "Total Administraciones Públicas"], ...Object.entries(SUBSECTORES)];

  const state = { side: "Ingresos", view: "resumen", sector: "S13", from: last, to: last, accumulate: false, path: [] };
  let summary = "";
  let lastWidth = -1;
  const update = () => { render(); UI.announce(summary); };

  const treeFor = () => TREES[VIEWS[state.side].find(v => v[0] === state.view)[2]];
  const block = (y, src) => (DATA[y][state.sector] || {})[src];

  // Valor nominal de un código (con posible signo "-") en un año concreto
  function nominal(codes, source, y) {
    const d = block(y, source || "main") || {};
    let s = 0;
    for (const c of codes) s += c[0] === "-" ? -(d[c.slice(1)] || 0) : (d[c] || 0);
    return s;
  }
  const nomOwn = (n, y) => nominal(n.codes, n.source, y);
  const nomVal = (n, y) => n.codes ? nomOwn(n, y) : (n.children || []).reduce((s, c) => s + nomVal(c, y), 0);
  // Valor del nodo en el año y, deflactado con el deflactor de cada partida; la diferencia con sus hijos se deflacta con el del propio nodo
  function realVal(n, y) {
    if (!Deflactor.state.on) return nomVal(n, y);
    const f = Deflactor.factor(n.defl, y);
    if (!n.children) return nomOwn(n, y) * f;
    const sum = n.children.reduce((s, c) => s + realVal(c, y), 0);
    return n.codes ? sum + (nomOwn(n, y) - n.children.reduce((s, c) => s + nomVal(c, y), 0)) * f : sum;
  }
  const valOf = n => { let s = 0; for (let y = state.from; y <= state.to; y++) s += realVal(n, y); return s; };

  // Hijos de un nodo con su valor; si el nodo tiene valor propio se añade la diferencia como «Otros / no desglosado»
  function kids(n) {
    if (!n.children) return [];
    const list = n.children.map(c => ({ node: c, val: valOf(c), defl: c.defl }));
    if (n.codes) {
      const resid = valOf(n) - list.reduce((s, k) => s + k.val, 0);
      if (Math.abs(resid) >= 0.5) list.push({ node: { name: n.rest || "Otros / no desglosado" }, val: resid, residual: true, defl: n.defl });
    }
    return list;
  }
  const grandTotal = key => {
    let s = 0;
    for (let y = state.from; y <= state.to; y++) s += ((block(y, "main") || {})[key] || 0) * Deflactor.factor("pib", y);
    return s;
  };
  const annotate = (n, path) => {
    n.defl = Deflactor.classify([...path, n.name], "eurostat");
    (n.children || []).forEach(c => annotate(c, [...path, n.name]));
  };
  Object.values(TREES).forEach(t => annotate(t, []));

  function fillControls() {
    const views = VIEWS[state.side];
    $("selView").innerHTML = views.map(v => `<option value="${v[0]}">${v[1]}</option>`).join("");
    $("selView").value = state.view;
    $("selSector").innerHTML = SECTORES.map(s => `<option value="${s[0]}">${s[1]}</option>`).join("");
    $("selSector").value = state.sector;

    const needs = treeFor().needs;
    const has = y => !!block(y, needs);
    const ok = years.filter(has);
    for (const id of ["selTo", "selFrom"])
      $(id).innerHTML = years.map(y => `<option value="${y}"${has(y) ? "" : " disabled"}>${y}</option>`).join("");
    const max = ok[ok.length - 1];
    if (!ok.includes(state.to)) state.to = max;
    if (state.from > state.to || !ok.includes(state.from)) state.from = state.to;
    $("selTo").value = state.to;
    $("selFrom").value = state.from;
    $("selFrom").disabled = !state.accumulate;
    $("yearHelp").textContent = ok.length < years.length
      ? `Los años deshabilitados no tienen datos para este desglose; disponible ${ok[0]}–${max}.` : "";
    return { needs, max, min: ok[0] };
  }

  // Evolución de los hijos del nodo actual en todos los años con datos para el desglose
  function renderEvolution(map, needs) {
    const saved = [state.from, state.to];
    const ys = years.filter(y => !!block(y, needs));
    const collect = () => ys.map(y => {
      state.from = state.to = y;
      let node = treeFor();
      for (const p of state.path) node = kids(node).map(k => k.node).find(c => c.name === p) || node;
      return new Map(kids(node).map(k => [k.node.name, k]));
    });
    const perYear = collect();
    const wasOn = Deflactor.state.on;
    Deflactor.state.on = false;
    const nominalYear = wasOn ? collect() : perYear;
    Deflactor.state.on = wasOn;
    [state.from, state.to] = saved;
    const latest = perYear[perYear.length - 1] || new Map();
    const series = [...latest.entries()].filter(([, k]) => k.val > 0)
      .map(([name, k]) => ({ name, residual: !!k.residual, defl: k.defl, values: perYear.map(m => m.has(name) ? m.get(name).val : null),
        nominal: nominalYear.map(m => m.has(name) ? m.get(name).val : null) }))
      .sort((a, b) => b.values[b.values.length - 1] - a.values[a.values.length - 1]);
    const level = state.path.length ? state.path[state.path.length - 1] : (state.side === "Ingresos" ? "ingresos" : "gastos");
    Evolucion.draw(map, { years: ys, series, mode: $("selEvoMode").value, fmt, unit: "M€" + Deflactor.suffix().replace(" · ", ", "),
      context: `Eurostat, ${state.side}, ${level}, ${state.sector === "S13" ? "total Administraciones Públicas" : "subsector " + state.sector}` });
  }

  function render() {
    if (document.getElementById("selSource")?.value === "hacienda") return;
    lastWidth = $("map").clientWidth;
    const { needs, max, min } = fillControls();
    if (!state.accumulate) state.from = state.to;
    const tree = treeFor();
    let node = tree;
    for (const p of state.path) node = kids(node).map(k => k.node).find(c => c.name === p) || node;
    const map = $("map");
    const evo = $("chkEvo") && $("chkEvo").checked;
    $("lblEvoMode").hidden = !evo;
    window.syncDeflControls();
    map.classList.toggle("evo-on", evo);
    $("altWrap").hidden = !!evo;
    UI.hideTip(); UI.hideDetail();
    if (evo) renderEvolution(map, needs);
    const root = valOf(tree), cur = valOf(node);
    const items = kids(node);
    const topNames = tree.children.map(c => c.name);
    const rects = evo ? [] : squarify(items.map(i => ({ ...i, val: i.val })), 0, 0, map.clientWidth, map.clientHeight);
    const isDrill = k => !k.residual && kids(k.node).filter(x => x.val > 0).length > 1;
    const open = name => () => { state.path.push(name); update(); UI.focusLevel(); };
    const pctOf = v => cur ? (v / cur * 100).toFixed(1) : "0.0";
    if (!evo) {
      UI.renderMap(map, rects, {
        color: (r, i) => {
          const top = state.path.length ? topNames.indexOf(state.path[0]) : topNames.indexOf(r.node.name);
          const hue = Math.round(top * 360 / topNames.length + (state.side === "Ingresos" ? 200 : 0)) % 360;
          const light = state.path.length ? Math.max(28, 46 - i * 2.5) : 40;
          return r.residual ? UI.cellColors(215, 12, 38) : UI.cellColors(hue, 60, light);
        },
        amount: fmt, share: r => pctOf(r.val) + "%", drill: r => isDrill(r),
        open: r => open(r.node.name)(),
        detail: (r, drill) => [fmt(r.val), `${pctOf(r.val)}% de ${state.path.length ? node.name : "este nivel"}`,
          `${(root ? r.val / root * 100 : 0).toFixed(1)}% del total de ${state.side.toLowerCase()}`,
          ...(drill ? ["Abra el desglose desde la tabla o con clic."] : [])]
      });
      map.setAttribute("aria-hidden", rects.length ? "true" : "false");
      if (!rects.length) map.innerHTML = `<p class="empty">${UI.emptyMessage(items)}</p>`;
      UI.renderTable($("dataAlt"), [...items].sort((a, b) => b.val - a.val).map(k => ({
        name: k.node.name, amount: fmt(k.val), share: pctOf(k.val) + " %", kindLabel: UI.KINDS[UI.kindOf(k)],
        drill: isDrill(k), open: open(k.node.name)
      })), { caption: `${state.path.length ? node.name : state.side}, ${state.from === state.to ? state.to : state.from + "–" + state.to}, millones de euros${Deflactor.suffix()}`, unit: "millones de euros, M€" });
    } else map.removeAttribute("aria-hidden");

    const per = state.from === state.to ? state.to : `${state.from}–${state.to} (acumulado)`;
    const crumbLabels = [state.side, ...state.path];
    UI.crumbs($("crumbs"), crumbLabels, i => { state.path = state.path.slice(0, i); update(); UI.focusLevel(); });
    UI.setBack(state.path.length > 0, () => { state.path.pop(); update(); UI.focusLevel(); });
    $("levelTitle").textContent = `${crumbLabels[crumbLabels.length - 1]} · ${per}`;
    summary = `${state.side}, ${per}, ${fmt(cur)}, nivel ${crumbLabels[crumbLabels.length - 1]}`;

    const ti = grandTotal("TR"), tg = grandTotal("TE"), b = ti - tg;
    $("sum").innerHTML = `<b>${per}</b>${Deflactor.suffix()} · Ingresos: ${fmt(ti)} · Gastos: ${fmt(tg)} · ` +
      `<span class="${b < 0 ? "neg" : "pos"}">Saldo (${b < 0 ? "déficit" : "superávit"}): ${b > 0 ? "+" : ""}${fmt(b)}</span>`;
    $("noteDetails").hidden = true; $("noteFull").textContent = "";
    UI.hideStatus();

    const notes = [];
    if (needs !== "main") notes.push(`Este desglose solo está publicado para ${min}–${max}.`);
    if (state.sector !== "S13") notes.push("Subsector no consolidado: incluye transferencias entre administraciones, por lo que los subsectores no suman el total.");
    if (Deflactor.state.on) notes.push(`Importes deflactados a euros constantes de ${Deflactor.state.base} con: ${Deflactor.describe(items.map(k => k.defl))}. Totales de ingresos y gastos con el deflactor del PIB.`);
    const negs = items.filter(k => k.val < 0 && Math.abs(k.val) >= 0.5);
    if (negs.length) notes.push("Partidas negativas no representadas: " + negs.map(k => `${k.node.name} (${fmt(k.val)})`).join("; ") + ".");
    $("note").textContent = notes.join(" ");
  }

  function setSide(s) {
    state.side = s; state.path = []; state.view = VIEWS[s][0][0];
    $("bIng").classList.toggle("on", s === "Ingresos");
    $("bGas").classList.toggle("on", s === "Gastos");
    $("bIng").setAttribute("aria-pressed", String(s === "Ingresos"));
    $("bGas").setAttribute("aria-pressed", String(s === "Gastos"));
    update();
  }
  $("bIng").onclick = () => setSide("Ingresos");
  $("bGas").onclick = () => setSide("Gastos");
  $("selView").onchange = e => { state.view = e.target.value; state.path = []; update(); };
  $("selSector").onchange = e => { state.sector = e.target.value; state.path = []; update(); };
  $("selTo").onchange = e => { state.to = +e.target.value; if (state.from > state.to) state.from = state.to; update(); };
  $("selFrom").onchange = e => { state.from = +e.target.value; if (state.from > state.to) state.to = state.from; update(); };
  $("chkAcc").onchange = e => { state.accumulate = e.target.checked; update(); };
  $("selEvoMode").innerHTML = Evolucion.MODES.map(m => `<option value="${m[0]}">${m[1]}</option>`).join("");
  const rerender = () => { update(); if ($("selSource").value === "hacienda" && window.renderHacienda) window.renderHacienda(true); };
  $("selEvoMode").onchange = rerender;
  const D = Deflactor;
  $("selDeflKey").innerHTML = `<option value="auto">Automático según la partida (guía)</option>` + Object.entries(D.KEYS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
  const fillBase = () => {
    const years = D.years();
    if (!years.includes(D.state.base)) D.state.base = years[years.length - 1];
    $("selDeflBase").innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
    $("selDeflBase").value = D.state.base;
  };
  fillBase();
  $("selDeflScope").innerHTML = `<option value="nacional">España (predeterminado)</option><option value="regional">Comunidad (IPC y PIB regionales)</option>`;
  window.syncDeflControls = () => {
    const idx = $("chkEvo").checked && $("selEvoMode").value === "indice";
    const scope = D.regionalAvailable() && ($("chkDefl").checked || idx);
    $("lblDeflKey").hidden = !($("chkDefl").checked || idx);
    $("lblDeflBase").hidden = !$("chkDefl").checked;
    $("lblDeflScope").hidden = $("deflScopeHelp").hidden = !scope;
    fillBase();
  };
  $("chkDefl").onchange = e => { D.state.on = e.target.checked; rerender(); };
  $("selDeflKey").onchange = e => { D.state.key = e.target.value; rerender(); };
  $("selDeflBase").onchange = e => { D.state.base = +e.target.value; rerender(); };
  $("selDeflScope").onchange = e => { D.state.scope = e.target.value; fillBase(); rerender(); };
  $("chkEvo").onchange = rerender;
  addEventListener("resize", () => {
    const w = $("map").clientWidth;
    if (w !== lastWidth) render();
  });
  window.renderEurostat = render;
  window.resetEurostatPath = () => { state.path = []; };
  render();
  lastWidth = $("map").clientWidth;
})();