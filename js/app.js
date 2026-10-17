(function () {
  const $ = id => document.getElementById(id);
  const fmt = n => Math.round(n).toLocaleString("es-ES") + " M€";
  const years = Object.keys(DATA).map(Number).sort((a, b) => a - b);
  const last = years[years.length - 1];

  const state = { side: "Ingresos", view: "tipo", from: last, to: last, accumulate: false, path: [] };

  const hasCofog = y => !!DATA[y].cofog;
  const treeFor = () => state.side === "Ingresos" ? TREES.ingresos
    : state.view === "funcion" ? TREES.gastosFuncion : TREES.gastosTipo;

  // Suma un código (con posible signo "-") a lo largo del rango de años seleccionado
  function value(codes, source) {
    let s = 0;
    for (let y = state.from; y <= state.to; y++) {
      const d = DATA[y][source || "main"] || {};
      for (const c of codes) s += c[0] === "-" ? -(d[c.slice(1)] || 0) : (d[c] || 0);
    }
    return s;
  }
  const total = (node, source) => node.codes ? value(node.codes, source) : node.children.reduce((s, c) => s + total(c, source), 0);
  const grandTotal = key => {
    let s = 0;
    for (let y = state.from; y <= state.to; y++) s += DATA[y].main[key] || 0;
    return s;
  };

  function fillYears() {
    const need = state.side === "Gastos" && state.view === "funcion";
    const ok = years.filter(y => !need || hasCofog(y));
    for (const id of ["selTo", "selFrom"]) {
      const el = $(id);
      el.innerHTML = years.map(y => `<option value="${y}"${need && !hasCofog(y) ? " disabled" : ""}>${y}</option>`).join("");
    }
    const max = ok[ok.length - 1];
    if (state.to > max || !ok.includes(state.to)) state.to = max;
    if (state.from > state.to || !ok.includes(state.from)) state.from = state.to;
    $("selTo").value = state.to;
    $("selFrom").value = state.from;
    $("selFrom").disabled = !state.accumulate;
    $("note").textContent = need ? "Los ingresos no se clasifican por función. El desglose funcional (COFOG) solo está publicado hasta " + max + "." : "";
  }

  function render() {
    fillYears();
    if (!state.accumulate) state.from = state.to;
    const tree = treeFor(), source = tree.source;
    let node = tree;
    for (const p of state.path) node = node.children.find(c => c.name === p) || node;
    const map = $("map"), tip = $("tip");
    const root = total(tree, source), cur = total(node, source);
    const items = (node.children || []).map(c => ({ node: c, val: total(c, source) }));
    const topNames = tree.children.map(c => c.name);
    const rects = squarify(items, 0, 0, map.clientWidth, map.clientHeight);
    map.innerHTML = "";
    rects.forEach((r, i) => {
      const top = state.path.length ? topNames.indexOf(state.path[0]) : topNames.indexOf(r.node.name);
      const hue = Math.round(top * 360 / topNames.length + (state.side === "Ingresos" ? 200 : 0)) % 360;
      const light = state.path.length ? Math.max(28, 46 - i * 2.5) : 40;
      const pct = (r.val / cur * 100).toFixed(1), pctRoot = (r.val / root * 100).toFixed(1);
      const d = document.createElement("div");
      d.className = "cell";
      d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:hsl(${hue} 60% ${light}%)`;
      d.innerHTML = `<b>${r.node.name}</b><small>${fmt(r.val)} · ${pct}%</small>`;
      const drill = r.node.children && (r.node.children.length > 1 || !state.path.length);
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
  }

  function setSide(s) {
    state.side = s; state.path = [];
    $("bIng").classList.toggle("on", s === "Ingresos");
    $("bGas").classList.toggle("on", s === "Gastos");
    render();
  }
  $("bIng").onclick = () => setSide("Ingresos");
  $("bGas").onclick = () => setSide("Gastos");
  $("selView").onchange = e => { state.view = e.target.value; state.path = []; render(); };
  $("selTo").onchange = e => { state.to = +e.target.value; if (state.from > state.to) state.from = state.to; render(); };
  $("selFrom").onchange = e => { state.from = +e.target.value; if (state.from > state.to) state.to = state.from; render(); };
  $("chkAcc").onchange = e => { state.accumulate = e.target.checked; render(); };
  addEventListener("resize", render);
  render();
})();
