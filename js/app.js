(function () {
  const $ = id => document.getElementById(id);
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

  const treeFor = () => TREES[VIEWS[state.side].find(v => v[0] === state.view)[2]];
  const block = (y, src) => (DATA[y][state.sector] || {})[src];

  // Suma un código (con posible signo "-") a lo largo del rango de años seleccionado
  function value(codes, source) {
    let s = 0;
    for (let y = state.from; y <= state.to; y++) {
      const d = block(y, source || "main") || {};
      for (const c of codes) s += c[0] === "-" ? -(d[c.slice(1)] || 0) : (d[c] || 0);
    }
    return s;
  }
  const own = n => value(n.codes, n.source);
  const valOf = n => n.codes ? own(n) : (n.children || []).reduce((s, c) => s + valOf(c), 0);

  // Hijos de un nodo con su valor; si el nodo tiene valor propio se añade la diferencia como «Otros / no desglosado»
  function kids(n) {
    if (!n.children) return [];
    const list = n.children.map(c => ({ node: c, val: valOf(c) }));
    if (n.codes) {
      const resid = own(n) - list.reduce((s, k) => s + k.val, 0);
      if (Math.abs(resid) >= 0.5) list.push({ node: { name: n.rest || "Otros / no desglosado" }, val: resid, residual: true });
    }
    return list;
  }
  const grandTotal = key => {
    let s = 0;
    for (let y = state.from; y <= state.to; y++) s += (block(y, "main") || {})[key] || 0;
    return s;
  };

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
    return { needs, max, min: ok[0] };
  }

  function render() {
    const { needs, max, min } = fillControls();
    if (!state.accumulate) state.from = state.to;
    const tree = treeFor();
    let node = tree;
    for (const p of state.path) node = kids(node).map(k => k.node).find(c => c.name === p) || node;
    const map = $("map"), tip = $("tip");
    const root = valOf(tree), cur = valOf(node);
    const items = kids(node);
    const topNames = tree.children.map(c => c.name);
    const rects = squarify(items.map(i => ({ ...i, val: i.val })), 0, 0, map.clientWidth, map.clientHeight);
    map.innerHTML = "";
    rects.forEach((r, i) => {
      const top = state.path.length ? topNames.indexOf(state.path[0]) : topNames.indexOf(r.node.name);
      const hue = Math.round(top * 360 / topNames.length + (state.side === "Ingresos" ? 200 : 0)) % 360;
      const light = state.path.length ? Math.max(28, 46 - i * 2.5) : 40;
      const pct = (r.val / cur * 100).toFixed(1), pctRoot = (r.val / root * 100).toFixed(1);
      const d = document.createElement("div");
      d.className = "cell";
      const bg = r.residual ? "hsl(215 12% 38%)" : `hsl(${hue} 60% ${light}%)`;
      d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:${bg}`;
      d.innerHTML = `<b>${r.node.name}</b><small>${fmt(r.val)} · ${pct}%</small>`;
      const drill = !r.residual && kids(r.node).filter(k => k.val > 0).length > 1;
      if (drill) { d.classList.add("drill"); d.onclick = () => { state.path.push(r.node.name); render(); }; }
      d.onmousemove = e => {
        tip.style.display = "block";
        tip.style.left = Math.min(e.clientX + 14, innerWidth - 280) + "px";
        tip.style.top = e.clientY + 14 + "px";
        tip.innerHTML = `<b>${r.node.name}</b><br>${fmt(r.val)}<br>${pct}% de ${node.name}<br>${pctRoot}% del total de ${state.side.toLowerCase()}` +
          (drill ? "<br><i>Clic para ver el detalle</i>" : "");
      };
      d.onmouseleave = () => tip.style.display = "none";
      map.appendChild(d);
    });
    if (!rects.length) map.innerHTML = '<p class="empty">Sin datos para esta selección.</p>';

    const c = $("crumbs");
    c.innerHTML = "";
    [state.side, ...state.path].forEach((p, i, a) => {
      const s = document.createElement("span");
      s.textContent = p;
      if (i < a.length - 1) { s.className = "link"; s.onclick = () => { state.path = state.path.slice(0, i); render(); }; }
      c.appendChild(s);
      if (i < a.length - 1) c.append(" › ");
    });

    const ti = grandTotal("TR"), tg = grandTotal("TE"), b = ti - tg;
    const per = state.from === state.to ? state.to : `${state.from}–${state.to} (acumulado)`;
    $("sum").innerHTML = `<b>${per}</b> · Ingresos: ${fmt(ti)} · Gastos: ${fmt(tg)} · ` +
      `<span class="${b < 0 ? "neg" : "pos"}">Saldo: ${fmt(b)}</span>`;

    const notes = [];
    if (needs !== "main") notes.push(`Este desglose solo está publicado para ${min}–${max}.`);
    if (state.sector !== "S13") notes.push("Subsector no consolidado: incluye transferencias entre administraciones, por lo que los subsectores no suman el total.");
    const negs = items.filter(k => k.val < 0 && Math.abs(k.val) >= 0.5);
    if (negs.length) notes.push("Partidas negativas no representadas: " + negs.map(k => `${k.node.name} (${fmt(k.val)})`).join("; ") + ".");
    $("note").textContent = notes.join(" ");
  }

  function setSide(s) {
    state.side = s; state.path = []; state.view = VIEWS[s][0][0];
    $("bIng").classList.toggle("on", s === "Ingresos");
    $("bGas").classList.toggle("on", s === "Gastos");
    render();
  }
  $("bIng").onclick = () => setSide("Ingresos");
  $("bGas").onclick = () => setSide("Gastos");
  $("selView").onchange = e => { state.view = e.target.value; state.path = []; render(); };
  $("selSector").onchange = e => { state.sector = e.target.value; state.path = []; render(); };
  $("selTo").onchange = e => { state.to = +e.target.value; if (state.from > state.to) state.from = state.to; render(); };
  $("selFrom").onchange = e => { state.from = +e.target.value; if (state.from > state.to) state.to = state.from; render(); };
  $("chkAcc").onchange = e => { state.accumulate = e.target.checked; render(); };
  addEventListener("resize", render);
  render();
})();