/* Fuente paralela Hacienda. DATA, TREES y el flujo Eurostat no se modifican. */
(function () {
  const $ = id => document.getElementById(id);
  const H = window.HACIENDA;
  const CHAPTERS = ["Gastos de personal", "Gastos corrientes en bienes y servicios", "Gastos financieros",
    "Transferencias corrientes", "Fondo de contingencia", "Inversiones reales", "Transferencias de capital",
    "Activos financieros", "Pasivos financieros"];
  const VIEWS = [
    ["funcion", "Área → política (Hacienda)"],
    ["tipo", "Capítulo económico (Hacienda)"],
    ["funcionTipo", "Área → política → capítulo (Hacienda)"],
    ["tipoFuncion", "Capítulo → área → política (Hacienda)"]
  ];
  const fmt = n => Math.round(n).toLocaleString("es-ES") + " miles €";
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
    const list = node.children.map(child => ({ node: child, val: child.value }));
    const residual = node.value - list.reduce((sum, item) => sum + item.val, 0);
    if (Math.abs(residual) >= 0.5) list.push({ node: { name: "Otros / no desglosado" }, val: residual, residual: true });
    return list;
  };
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
    const record = H.data[state.territory]?.[String(state.to)];
    if (!record) return;
    const years = fillControls();
    let tree = rowTree(record, state.view);
    if (state.accumulate && state.from !== state.to) {
      // Suma acumulada v\u00e1lida solo para una secuencia anual completa disponible.
      const selected = years.filter(y => y >= state.from && y <= state.to);
      if (selected.length !== state.to - state.from + 1) { state.from = state.to; $("selHaciendaFrom").value = state.from; }
      else {
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
        tree = rowTree(acc, state.view);
      }
    }
    let node = tree;
    for (const part of state.path) node = kids(node).map(k => k.node).find(child => child.name === part) || node;
    const map = $("map"), tip = $("tip"), items = kids(node), topNames = tree.children.map(c => c.name);
    const rects = window.squarify(items.map(item => ({ ...item, val: item.val })), 0, 0, map.clientWidth, map.clientHeight);
    map.innerHTML = "";
    rects.forEach((r, i) => {
      const top = state.path.length ? topNames.indexOf(state.path[0]) : topNames.indexOf(r.node.name);
      const hue = Math.round(top * 360 / Math.max(1, topNames.length) + 190) % 360;
      const d = document.createElement("div"); d.className = "cell";
      d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:${r.residual ? "hsl(215 12% 38%)" : `hsl(${hue} 60% ${Math.max(28, 46 - i * 2)}%)`}`;
      d.innerHTML = `<b>${r.node.name}</b><small>${fmt(r.val)} · ${(r.val / node.value * 100).toFixed(1)}%</small>`;
      const drill = !r.residual && kids(r.node).some(k => k.val > 0);
      if (drill) { d.classList.add("drill"); d.onclick = () => { state.path.push(r.node.name); render(); }; }
      d.onmousemove = e => { tip.style.display = "block"; tip.style.left = Math.min(e.clientX + 14, innerWidth - 280) + "px";
        tip.style.top = e.clientY + 14 + "px"; tip.innerHTML = `<b>${r.node.name}</b><br>${fmt(r.val)}<br>${(r.val / node.value * 100).toFixed(1)}% del nivel` + (drill ? "<br><i>Clic para ver el detalle</i>" : ""); };
      d.onmouseleave = () => tip.style.display = "none"; map.appendChild(d);
    });
    if (!rects.length) map.innerHTML = '<p class="empty">Sin datos para esta selecci\u00f3n.</p>';
    const crumbs = $("crumbs"); crumbs.innerHTML = "";
    [tree.name, ...state.path].forEach((part, i, all) => { const el = document.createElement("span"); el.textContent = part;
      if (i < all.length - 1) { el.className = "link"; el.onclick = () => { state.path = state.path.slice(0, i); render(); }; }
      crumbs.appendChild(el); if (i < all.length - 1) crumbs.append(" › "); });
    const total = state.accumulate && state.from !== state.to ? tree.value : record.total;
    $("sum").innerHTML = `<b>${state.from === state.to ? state.to : `${state.from}–${state.to} (acumulado)`}</b> · Gasto liquidado: ${fmt(total)}`;
    $("note").textContent = `Fuente: Ministerio de Hacienda. Copia local disponible: 2024; clasificaci\u00f3n funcional y econ\u00f3mica propia de la liquidaci\u00f3n presupuestaria (obligaciones reconocidas), miles de euros. Per\u00edmetro consolidado de la administraci\u00f3n auton\u00f3mica y entes incluidos en su cuenta, no todo el gasto p\u00fablico territorializado. Eurostat publica estos desgloses en otros ejercicios, en millones de euros y con base devengo SEC 2010 para S.1312. Las\u00a0\u00e1reas/pol\u00edticas no equivalen a COFOG ni los cap\u00edtulos a tipos SEC; no admite comparaci\u00f3n directa. Cap\u00edtulos 8 y 9 son financieros.`;
  }
  const EUROSTAT_FOOTER = $("sourceFooter").innerHTML;
  let wasHacienda = false;
  function switchSource() {
    const hacienda = $("selSource").value === "hacienda";
    $("euControls").hidden = hacienda; $("hcControls").hidden = !hacienda;
    $("note").classList.toggle("method-note", hacienda);
    if (hacienda) $("sourceFooter").textContent = "Fuente: Ministerio de Hacienda, Liquidaci\u00f3n de presupuestos CCAA. Clasificaci\u00f3n funcional y cap\u00edtulos presupuestarios propios; cifras est\u00e1ticas en miles de euros. El fichero local contiene ejercicios y territorios comprobados en el selector. Liquidaci\u00f3n presupuestaria (obligaciones reconocidas), per\u00edmetro consolidado propio; no comparable directamente con Eurostat (SEC 2010, devengo, S.1312). Actualizaci\u00f3n: python scripts/fetch_hacienda.py.";
    else $("sourceFooter").innerHTML = EUROSTAT_FOOTER;
    if (hacienda) render(); else if (wasHacienda) dispatchEvent(new Event("resize"));
    wasHacienda = hacienda;
  }
  const territorySelect = $("selHaciendaTerritory");
  territorySelect.innerHTML = codes.filter(code => availableYears(code).length)
    .map(code => `<option value="${code}">${code === "00" ? "Total CCAA" : H.territories[code]}</option>`).join("");
  territorySelect.value = state.territory;
  $("selHaciendaView").innerHTML = VIEWS.map(([key, name]) => `<option value="${key}">${name}</option>`).join("");
  $("selHaciendaView").value = state.view;
  $("selSource").onchange = switchSource;
  territorySelect.onchange = e => { state.territory = e.target.value; state.path = []; state.from = state.to = availableYears(state.territory).slice(-1)[0]; render(); };
  $("selHaciendaView").onchange = e => { state.view = e.target.value; state.path = []; render(); };
  $("selHaciendaYear").onchange = e => { state.to = +e.target.value; if (state.from > state.to) state.from = state.to; state.path = []; render(); };
  $("selHaciendaFrom").onchange = e => { state.from = +e.target.value; if (state.from > state.to) state.to = state.from; render(); };
  $("chkHaciendaAcc").onchange = e => { state.accumulate = e.target.checked; if (!state.accumulate) state.from = state.to; render(); };
  addEventListener("resize", () => { if ($("selSource").value === "hacienda") render(); });
  switchSource();
})();
