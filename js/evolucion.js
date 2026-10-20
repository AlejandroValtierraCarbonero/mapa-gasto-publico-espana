/* Visualización de la evolución interanual (gráfico de líneas + tabla), compartida por ambas fuentes. */
(function () {
  const MODES = [["valor", "Importe"], ["delta", "Variación unitaria (año a año)"], ["pct", "Variación porcentual (año a año)"],
    ["indice", "Gasto nominal frente a su deflactor (índice)"]];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (n, d) => n.toLocaleString("es-ES", { maximumFractionDigits: d, minimumFractionDigits: d });

  // Transforma una serie de importes según el modo; el primer año (sin año previo) y las bases cero quedan en null.
  function transform(values, mode) {
    if (mode === "valor") return values.slice();
    return values.map((v, i) => {
      const p = values[i - 1];
      if (i === 0 || v == null || p == null) return null;
      if (mode === "delta") return v - p;
      return p === 0 ? null : (v - p) / Math.abs(p) * 100;
    });
  }

  // Para cada serie: gasto nominal, deflactor y gasto real, todos con índice 100 en el primer año con dato.
  function indexRows(series, years) {
    const D = window.Deflactor;
    const rows = [];
    series.forEach((s, i) => {
      const key = D.resolve(s.defl);
      const first = years.findIndex((y, j) => s.nominal[j] != null && s.nominal[j] !== 0 && D.index(key, y) != null);
      const color = s.residual ? "#94a3b8" : `hsl(${Math.round(i * 360 / series.length)} 70% 60%)`;
      const nom = years.map((y, j) => first < 0 || s.nominal[j] == null ? null : s.nominal[j] / s.nominal[first] * 100);
      const def = years.map((y, j) => first < 0 || D.index(key, y) == null ? null : D.index(key, y) / D.index(key, years[first]) * 100);
      const real = nom.map((v, j) => v == null || def[j] == null ? null : v / def[j] * 100);
      rows.push({ name: `${s.name} · nominal`, color, dash: false, out: nom, values: nom, group: s.name },
        { name: `${s.name} · deflactor (${D.KEYS[key]})`, color, dash: true, out: def, values: def, group: s.name },
        { name: `${s.name} · real (nominal ÷ deflactor)`, color, dash: false, tableOnly: true, out: real, values: real, group: s.name });
    });
    return rows;
  }

  function draw(el, { years, series, fmt, unit, mode: requested, context }) {
    const mode = MODES.some(m => m[0] === requested) ? requested : "valor";
    if (!years.length || !series.length) { el.innerHTML = '<p class="empty">Sin datos para esta selección.</p>'; return; }
    const idx = mode === "indice";
    const fmtCell = v => v == null ? "–" : idx ? num(v, 1) : mode === "pct" ? (v > 0 ? "+" : "") + num(v, 1) + " %" :
      mode === "delta" ? (v > 0 ? "+" : "") + fmt(v) : fmt(v);
    // Celda vacía: «No disponible» (sin dato) frente a «No calculable» (primer año o base cero).
    const cell = (r, i) => {
      const v = r.out[i];
      if (v != null) return `<td class="${mode !== "valor" && !idx ? (v < 0 ? "neg" : "pos") : ""}">${fmtCell(v)}</td>`;
      const why = r.values[i] == null ? "No disponible" : "No calculable";
      return `<td title="${why}"><span aria-hidden="true">–</span><span class="visually-hidden">${why}</span></td>`;
    };
    const rows = idx ? indexRows(series, years) : series.map((s, i) => ({ ...s, color: s.residual ? "#94a3b8" : `hsl(${Math.round(i * 360 / series.length)} 70% 60%)`,
      out: transform(s.values, mode) }));
    const plotted = idx ? rows.filter(r => !r.tableOnly).slice(0, 12) : rows.slice(0, 10);
    const all = plotted.flatMap(r => r.out).filter(v => v != null);
    let lo = idx && all.length ? Math.min(...all) : Math.min(0, ...all), hi = idx && all.length ? Math.max(...all) : Math.max(0, ...all);
    if (lo === hi) hi = lo + 1;
    const W = 900, H = 380, L = 70, R = 20, T = 16, B = 34;
    const x = i => L + (years.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (years.length - 1));
    const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    const unitTxt = idx ? "índice, primer año con dato = 100" : mode === "pct" ? "%" : unit;
    const modeName = MODES.find(m => m[0] === mode)[1];
    const range = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : String(years[0]);
    const chartTitle = `${modeName}${context ? ", " + context : ""}, ${range}, ${unitTxt}`;
    const lastOf = a => { const j = a.length - 1 - [...a].reverse().findIndex(v => v != null); return a.some(v => v != null) ? a[j] : null; };
    const trend = idx ? rows.filter(r => r.name.endsWith("· nominal")).slice(0, 3).map(n => {
      const g = rows.filter(r => r.group === n.group);
      return `${n.group}: en el último año nominal ${num(lastOf(g[0].out) ?? NaN, 1)}, deflactor ${num(lastOf(g[1].out) ?? NaN, 1)}, real ${num(lastOf(g[2].out) ?? NaN, 1)}`;
    }) : plotted.slice(0, 3).map(r => {
      const first = r.values.findIndex(v => v != null);
      const lastI = r.values.length - 1 - [...r.values].reverse().findIndex(v => v != null);
      return first < 0 || first === lastI ? null :
        `${r.name}: de ${fmt(r.values[first])} en ${years[first]} a ${fmt(r.values[lastI])} en ${years[lastI]}`;
    }).filter(Boolean);
    const omitted = idx ? series.length - plotted.length / 2 : rows.length - plotted.length;
    const desc = (trend.length ? "Tendencia de las mayores partidas. " + trend.join("; ") + ". " : "") +
      (omitted ? `El gráfico omite ${omitted} partidas menores, disponibles en la tabla.` : "Todas las partidas están en el gráfico y en la tabla.");
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="evoChartTitle" aria-describedby="evoChartDesc">` +
      `<title id="evoChartTitle">${esc(chartTitle)}</title><desc id="evoChartDesc">${esc(desc)}</desc>`;
    for (let k = 0; k <= 4; k++) {
      const v = lo + (hi - lo) * k / 4;
      svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/>` +
        `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${num(v, mode === "pct" || idx ? 1 : 0)}</text>`;
    }
    if (!idx) svg += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" class="zero"/>`;
    years.forEach((yr, i) => { svg += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle">${yr}</text>`; });
    for (const r of plotted) {
      const pts = r.out.map((v, i) => v == null ? null : [x(i), y(v)]);
      const path = pts.map((p, i) => p ? `${pts[i - 1] ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}` : "").join("");
      svg += `<path d="${path}" fill="none" stroke="${r.color}" stroke-width="2"${r.dash ? ' stroke-dasharray="6 4"' : ""}/>`;
      for (const p of pts) if (p) svg += r.dash ? `<rect x="${(p[0] - 2.5).toFixed(1)}" y="${(p[1] - 2.5).toFixed(1)}" width="5" height="5" fill="${r.color}"/>` :
        `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${r.color}"/>`;
    }
    svg += "</svg>";
    const legend = plotted.map(r => `<span><i style="background:${r.color}" aria-hidden="true"></i>${esc(r.name)}${r.dash ? " (línea discontinua)" : ""}</span>`).join("");
    const head = `<tr><th scope="col">Partida</th>${years.map(yr => `<th scope="col">${yr}</th>`).join("")}</tr>`;
    const body = rows.map(r => `<tr><th scope="row"><i style="background:${r.color}" aria-hidden="true"></i>${esc(r.name)}</th>` +
      r.out.map((_, i) => cell(r, i)).join("") + "</tr>").join("");
    const hasGaps = rows.some(r => r.out.some((v, i) => v == null && r.values[i] != null));
    el.innerHTML = `<div class="evo"><h3 class="evo-title">${esc(modeName)} (${esc(unitTxt)})` +
      `</h3><p class="evo-sub">${esc(context || "")}${context ? " · " : ""}${esc(range)}` +
      (omitted ? `. El gráfico muestra las ${idx ? plotted.length / 2 : plotted.length} partidas mayores del último año; la tabla incluye las ${idx ? series.length : rows.length} series.` : ".") +
      `</p>${svg}<div class="evo-legend">${legend}</div>` +
      (idx ? '<p class="evo-sub">Línea continua: gasto nominal sin deflactar. Línea discontinua: deflactor aplicado a esa partida. Si el gasto nominal crece más que el deflactor, el gasto real aumenta; si crece menos, disminuye.</p>' : "") +
      (hasGaps ? '<p class="evo-sub">«–» = no calculable (primer año sin año previo o base cero).</p>' : "") +
      `<div class="evo-table"><table><caption>${esc(chartTitle)}</caption><thead>${head}</thead><tbody>${body}</tbody></table></div></div>`;
  }

  window.Evolucion = { draw, transform, MODES };
})();
