/* Fuente paralela Hacienda. DATA, TREES y el flujo Eurostat no se modifican. */
(function () {
  const $ = id => document.getElementById(id);
  const UI = window.UI;
  const H = window.HACIENDA;
  if (!H) {
    const opt = [...($("selSource").options || [])].find(o => o.value === "hacienda");
    if (opt) opt.disabled = true;
    UI.showError("No se pudieron cargar los datos de Hacienda; la fuente Eurostat sigue disponible.");
    return;
  }
  const CHAPTERS = ["Gastos de personal", "Gastos corrientes en bienes y servicios", "Gastos financieros",
    "Transferencias corrientes", "Fondo de contingencia (hasta 2012: dotación amortización)", "Inversiones reales", "Transferencias de capital",
    "Activos financieros", "Pasivos financieros"];
  const VIEWS = [
    ["funcion", "Área → política (Hacienda)"],
    ["tipo", "Capítulo económico (Hacienda)"],
    ["funcionTipo", "Área → política → capítulo (Hacienda)"],
    ["tipoFuncion", "Capítulo → área → política (Hacienda)"]
  ];
  const fmt = n => Math.round(n).toLocaleString("es-ES") + " miles de €";
  const codes = Object.keys(H.territories);
  const state = { territory: "00", view: "funcion", from: 2024, to: 2024, accumulate: false, path: [] };

  function availableYears(code) {
    return Object.keys(H.data[code] || {}).map(Number).sort((a, b) => a - b);
  }
  function rowTree(record, view) {
    const areas = new Map();
    for (const r of record.rows) {
      if (!areas.has(r.areaCode)) areas.set(r.areaCode, { name: r.area, value: 0, children: [], chapters: Array(9).fill(0) });
      const area = areas.get(r.areaCode);
      if (r.policyCode === r.areaCode) {
        area.value = r.total;
        area.chapters = r.chapters;
      } else {
        area.children.push({ name: r.policy, value: r.total, chapters: r.chapters, children: [] });
      }
    }
    const areaNodes = [...areas.values()];
    if (view === "funcion") return { name: "Gasto por área", value: record.total, children: areaNodes };
    if (view === "tipo") return { name: "Gasto por capítulo económico", value: record.total,
      children: CHAPTERS.map((name, i) => ({ name: `${i + 1}. ${name}`, value: record.totalChapters[i], children: [] })) };
    if (view === "funcionTipo") return { name: "Área y política → capítulo",
      value: record.total, children: areaNodes.map(area => ({ ...area, children: area.children.map(policy => ({ ...policy,
        children: CHAPTERS.map((name, i) => ({ name: `${i + 1}. ${name}`, value: policy.chapters[i], children: [] })) })) })) };
    const chapters = CHAPTERS.map((name, i) => ({ name: `${i + 1}. ${name}`, value: record.totalChapters[i],
      children: areaNodes.map(area => ({ name: area.name, value: area.chapters[i], children: area.children.map(policy =>
        ({ name: policy.name, value: policy.chapters[i], children: [] })) })) }));
    return { name: "Capítulo → área y política", value: record.total, children: chapters };
  }
  const kids = node => {
    if (!node.children?.length) return [];
    const list = node.children.map(child => ({ node: child, val: child.value, defl: child.defl }));
    const residual = node.value - list.reduce((sum, item) => sum + item.val, 0);
    if (Math.abs(residual) >= 0.5) list.push({ node: { name: "Otros / no desglosado" }, val: residual, residual: true, defl: node.defl });
    return list;
  };
  // Árbol del año con cada nodo clasificado por deflactor; si se deflacta, el valor de un nodo es la suma de sus hijos
  // deflactados más la diferencia no desglosada deflactada con el deflactor del propio nodo.
  function treeAt(record, view, year) {
    const tree = rowTree(record, view);
    const prep = (n, path) => {
      n.nom = n.value;
      n.defl = Deflactor.classify([...path, n.name], "hacienda");
      (n.children || []).forEach(c => prep(c, [...path, n.name]));
    };
    const realize = n => {
      const f = Deflactor.factor(n.defl, year);
      if (!n.children?.length) { n.value = n.nom * f; return; }
      n.children.forEach(realize);
      n.value = n.children.reduce((s, c) => s + c.value, 0) + (n.nom - n.children.reduce((s, c) => s + c.nom, 0)) * f;
    };
    prep(tree, []);
    if (Deflactor.state.on) realize(tree);
    return tree;
  }
  function mergeTrees(list) {
    const clone = n => ({ ...n, children: (n.children || []).map(clone) });
    const add = (a, b) => {
      a.value += b.value; a.nom += b.nom;
      for (const c of b.children || []) {
        const m = a.children.find(x => x.name === c.name);
        if (m) add(m, c); else a.children.push(clone(c));
      }
    };
    const out = clone(list[0]);
    list.slice(1).forEach(t => add(out, t));
    return out;
  }
  function fillControls() {
    const years = availableYears(state.territory);
    if (!years.includes(state.to)) state.to = years[years.length - 1];
    if (!years.includes(state.from) || state.from > state.to) state.from = state.to;
    $("selHaciendaYear").innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
    $("selHaciendaYear").value = state.to;
    for (const id of ["selHaciendaYear", "selHaciendaFrom"]) {
      if (id === "selHaciendaFrom") $(id).innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
    }
    $("selHaciendaFrom").value = state.from;
    $("selHaciendaFrom").disabled = !state.accumulate || years.length < 2;
    $("chkHaciendaAcc").disabled = years.length < 2;
    return years;
  }
  function render() {
    lastWidth = $("map").clientWidth;
    const record = H.data[state.territory]?.[String(state.to)];
    if (!record) {
      $("map").innerHTML = '<p class="empty">No hay datos publicados por Hacienda para este territorio y año. Cambie el territorio o el año.</p>';
      $("map").removeAttribute("aria-hidden"); $("dataAlt").innerHTML = "";
      UI.hideStatus();
      return;
    }
    const years = fillControls();
    let tree = treeAt(record, state.view, state.to);
    if (state.accumulate && state.from !== state.to) {
      // Suma acumulada v\u00e1lida solo para una secuencia anual completa disponible.
      const selected = years.filter(y => y >= state.from && y <= state.to);
      if (selected.length !== state.to - state.from + 1) { state.from = state.to; $("selHaciendaFrom").value = state.from; }
      else if (Deflactor.state.on) {
        tree = mergeTrees(selected.map(y => treeAt(H.data[state.territory][String(y)], state.view, y)));
      } else {
        const sumRecords = selected.map(y => H.data[state.territory][String(y)]);
        const sumRows = new Map();
        for (const data of sumRecords) for (const r of data.rows) {
          const k = `${r.areaCode}|${r.policyCode}`;
          if (!sumRows.has(k)) sumRows.set(k, { ...r, chapters: Array(9).fill(0), total: 0 });
          const item = sumRows.get(k);
          item.total += r.total; item.chapters = item.chapters.map((v, i) => v + r.chapters[i]);
        }
        const acc = { ...record, rows: [...sumRows.values()], total: sumRecords.reduce((s, r) => s + r.total, 0),
          totalChapters: record.totalChapters.map((_, i) => sumRecords.reduce((s, r) => s + r.totalChapters[i], 0)) };
        tree = treeAt(acc, state.view, state.to);
      }
    }
    let node = tree;
    for (const part of state.path) node = kids(node).map(k => k.node).find(child => child.name === part) || node;
    const map = $("map"), items = kids(node), topNames = tree.children.map(c => c.name);
    const evo = $("chkEvo").checked;
    $("lblEvoMode").hidden = !evo;
    window.syncDeflControls();
    map.classList.toggle("evo-on", evo);
    $("altWrap").hidden = evo;
    UI.hideTip(); UI.hideDetail();
    const rects = evo ? [] : window.squarify(items.map(item => ({ ...item, val: item.val })), 0, 0, map.clientWidth, map.clientHeight);
    if (evo) {
      const collect = () => years.map(y => {
        let n = treeAt(H.data[state.territory][String(y)], state.view, y);
        for (const part of state.path) n = kids(n).map(k => k.node).find(child => child.name === part) || n;
        return new Map(kids(n).map(k => [k.node.name, k]));
      });
      const perYear = collect();
      const wasOn = Deflactor.state.on;
      Deflactor.state.on = false;
      const nominalYear = wasOn ? collect() : perYear;
      Deflactor.state.on = wasOn;
      const latest = perYear[perYear.length - 1];
      const series = [...latest.entries()].filter(([, k]) => k.val > 0)
        .map(([name, k]) => ({ name, residual: !!k.residual, defl: k.defl, values: perYear.map(m => m.has(name) ? m.get(name).val : null),
          nominal: nominalYear.map(m => m.has(name) ? m.get(name).val : null) }))
        .sort((a, b) => b.values[b.values.length - 1] - a.values[a.values.length - 1]);
      window.Evolucion.draw(map, { years, series, mode: $("selEvoMode").value, fmt, unit: "miles de €" + Deflactor.suffix().replace(" · ", ", "),
        context: `Hacienda, ${H.territories[state.territory]}, ${state.path.length ? state.path[state.path.length - 1] : tree.name}` });
      map.removeAttribute("aria-hidden");
    } else {
      const share = v => node.value ? (v / node.value * 100).toFixed(1) : "0.0";
      const isDrill = k => !k.residual && kids(k.node).some(x => x.val > 0);
      const open = name => () => { state.path.push(name); update(); UI.focusLevel(); };
      UI.renderMap(map, rects, {
        color: (r, i) => {
          const top = state.path.length ? topNames.indexOf(state.path[0]) : topNames.indexOf(r.node.name);
          const hue = Math.round(top * 360 / Math.max(1, topNames.length) + 190) % 360;
          return r.residual ? UI.cellColors(215, 12, 38) : UI.cellColors(hue, 60, Math.max(28, 46 - i * 2));
        },
        amount: fmt, share: r => share(r.val) + "%", drill: r => isDrill(r), open: r => open(r.node.name)(),
        detail: (r, drill) => [fmt(r.val), `${share(r.val)}% del nivel`, ...(drill ? ["Abra el desglose desde la tabla o con clic."] : [])]
      });
      map.setAttribute("aria-hidden", rects.length ? "true" : "false");
      if (!rects.length) map.innerHTML = `<p class="empty">${UI.emptyMessage(items)}</p>`;
      UI.renderTable($("dataAlt"), [...items].sort((a, b) => b.val - a.val).map(k => ({
        name: k.node.name, amount: fmt(k.val), share: share(k.val) + " %", kindLabel: UI.KINDS[UI.kindOf(k)],
        drill: isDrill(k), open: open(k.node.name)
      })), { caption: `${state.path.length ? node.name : tree.name}, ${state.from === state.to ? state.to : state.from + "–" + state.to}, miles de euros (Hacienda)${Deflactor.suffix()}`, unit: "miles de euros" });
    }
    const crumbLabels = [tree.name, ...state.path];
    UI.crumbs($("crumbs"), crumbLabels, i => { state.path = state.path.slice(0, i); update(); UI.focusLevel(); });
    UI.setBack(state.path.length > 0, () => { state.path.pop(); update(); UI.focusLevel(); });
    const total = Deflactor.state.on || (state.accumulate && state.from !== state.to) ? tree.value : record.total;
    const per = state.from === state.to ? state.to : `${state.from}–${state.to} (acumulado)`;
    $("levelTitle").textContent = `${crumbLabels[crumbLabels.length - 1]} · ${per}`;
    summary = `Hacienda, ${H.territories[state.territory]}, ${per}, ${fmt(node.value)}, nivel ${crumbLabels[crumbLabels.length - 1]}`;
    $("sum").innerHTML = `<b>${per}</b>${Deflactor.suffix()} · Gasto liquidado: ${fmt(total)}`;
    $("note").textContent = "Hacienda: liquidación presupuestaria (obligaciones reconocidas) en miles de euros, con perímetro consolidado propio. No es comparable directamente con Eurostat (SEC 2010, devengo, S.1312): áreas, políticas y capítulos no equivalen a COFOG ni a tipos SEC." +
      (Deflactor.state.on ? ` Importes deflactados a euros constantes de ${Deflactor.state.base} con: ${Deflactor.describe(items.map(k => k.defl))}.` : "");
    $("noteDetails").hidden = false;
    $("noteFull").textContent = FULL_NOTE;
    UI.hideStatus();
  }
  const EUROSTAT_FOOTER = $("sourceFooter").innerHTML;
  const FULL_NOTE = `Fuente: Ministerio de Hacienda. Copia local disponible: 2002–2024 (el portal no publica ejercicios anteriores; la clasificación por áreas y políticas cambió con el tiempo, por lo que las series largas por área no son plenamente homogéneas); clasificaci\u00f3n funcional y econ\u00f3mica propia de la liquidaci\u00f3n presupuestaria (obligaciones reconocidas), miles de euros. Per\u00edmetro consolidado de la administraci\u00f3n auton\u00f3mica y entes incluidos en su cuenta, no todo el gasto p\u00fablico territorializado. Eurostat publica estos desgloses en otros ejercicios, en millones de euros y con base devengo SEC 2010 para S.1312. Las\u00a0\u00e1reas/pol\u00edticas no equivalen a COFOG ni los cap\u00edtulos a tipos SEC; no admite comparaci\u00f3n directa. Cap\u00edtulos 8 y 9 son financieros.`;
  let summary = "";
  const update = () => { render(); UI.announce(summary); };
  let wasHacienda = false, initialized = false, lastWidth = -1;
  function switchSource() {
    const hacienda = $("selSource").value === "hacienda";
    $("euControls").hidden = hacienda; $("hcControls").hidden = !hacienda;
    $("note").classList.toggle("method-note", hacienda);
    state.path = [];
    if (window.resetEurostatPath) window.resetEurostatPath();
    if (hacienda) $("sourceFooter").textContent = "Fuente: Ministerio de Hacienda, Liquidaci\u00f3n de presupuestos CCAA. Clasificaci\u00f3n funcional y cap\u00edtulos presupuestarios propios; cifras est\u00e1ticas en miles de euros. El fichero local contiene ejercicios y territorios comprobados en el selector. Liquidaci\u00f3n presupuestaria (obligaciones reconocidas), per\u00edmetro consolidado propio; no comparable directamente con Eurostat (SEC 2010, devengo, S.1312). Actualizaci\u00f3n: python scripts/fetch_hacienda.py.";
    else $("sourceFooter").innerHTML = EUROSTAT_FOOTER;
    if (hacienda) render(); else if (wasHacienda && window.renderEurostat) window.renderEurostat();
    const notice = $("sourceNotice");
    if (initialized) {
      const msg = `Fuente cambiada a ${hacienda ? "Hacienda" : "Eurostat"}: cambian la base, el perímetro y la clasificación; no compare cifras directamente con la otra fuente.`;
      notice.textContent = msg; notice.hidden = false;
      UI.announce(msg);
    }
    initialized = true;
    wasHacienda = hacienda;
  }
  const territorySelect = $("selHaciendaTerritory");
  territorySelect.innerHTML = codes.filter(code => availableYears(code).length)
    .map(code => `<option value="${code}">${code === "00" ? "Total CCAA (perímetro de liquidación autonómica)" : H.territories[code]}</option>`).join("");
  territorySelect.value = state.territory;
  $("selHaciendaView").innerHTML = VIEWS.map(([key, name]) => `<option value="${key}">${name}</option>`).join("");
  $("selHaciendaView").value = state.view;
  $("selSource").onchange = switchSource;
  territorySelect.onchange = e => { state.territory = e.target.value; state.path = []; state.from = state.to = availableYears(state.territory).slice(-1)[0]; update(); };
  $("selHaciendaView").onchange = e => { state.view = e.target.value; state.path = []; update(); };
  $("selHaciendaYear").onchange = e => { state.to = +e.target.value; if (state.from > state.to) state.from = state.to; state.path = []; update(); };
  $("selHaciendaFrom").onchange = e => { state.from = +e.target.value; if (state.from > state.to) state.to = state.from; update(); };
  $("chkHaciendaAcc").onchange = e => { state.accumulate = e.target.checked; if (!state.accumulate) state.from = state.to; update(); };
  addEventListener("resize", () => {
    if ($("selSource").value === "hacienda" && $("map").clientWidth !== lastWidth) render();
  });
  window.renderHacienda = announce => announce ? update() : render();
  switchSource();
})();
