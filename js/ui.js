/* Componentes de interfaz accesibles compartidos por Eurostat y Hacienda (migas, treemap, tabla, detalle, anuncios). */
(function () {
  const byId = id => document.getElementById(id);

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "className") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids) if (kid != null) e.append(kid);
    return e;
  }

  // Contraste WCAG: se elige texto claro u oscuro según la luminancia real del fondo HSL.
  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)];
  }
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const DARK = "#020617", LIGHT = "#ffffff";
  function cellColors(h, s, l) {
    const lum = luminance(hslToRgb(h, s, l));
    const fg = contrast(lum, 1) >= contrast(lum, luminance([2 / 255, 6 / 255, 23 / 255])) ? LIGHT : DARK;
    return { bg: `hsl(${h} ${s}% ${l}%)`, fg, ratio: Math.max(contrast(lum, 1), contrast(lum, luminance([2 / 255, 6 / 255, 23 / 255]))) };
  }

  let lastAnnouncement = "";
  function announce(text) {
    const region = byId("announcement");
    if (!region || !text) return;
    region.textContent = text === lastAnnouncement ? text + "\u00a0" : text;
    lastAnnouncement = region.textContent;
  }

  function focusLevel() {
    const h = byId("levelTitle");
    if (h && h.focus) h.focus();
  }

  function showError(message) {
    const status = byId("status");
    if (!status) return;
    status.textContent = "";
    status.setAttribute("role", "alert");
    status.hidden = false;
    status.append(message + " ", el("button", { type: "button", id: "btnRetry", text: "Reintentar" }));
    const retry = status.children[status.children.length - 1];
    if (retry) retry.onclick = () => location.reload();
  }
  function hideStatus() {
    const status = byId("status");
    if (status) { status.hidden = true; status.textContent = ""; }
  }

  // Migas: ancestros como botones, nivel actual como texto con aria-current.
  function crumbs(nav, labels, go) {
    nav.innerHTML = "";
    const list = el("ol", { className: "crumb-list" });
    labels.forEach((label, i) => {
      let item;
      if (i < labels.length - 1) {
        item = el("button", { type: "button", className: "link", text: label });
        item.onclick = () => go(i);
      } else item = el("span", { "aria-current": "page", text: label });
      list.append(el("li", {}, item));
    });
    nav.append(list);
  }

  function setBack(show, handler) {
    const btn = byId("btnBack");
    if (!btn) return;
    btn.hidden = !show;
    btn.onclick = show ? handler : null;
  }

  function hideTip() { const t = byId("tip"); if (t) t.style.display = "none"; }
  function hideDetail() { const d = byId("detail"); if (d) d.hidden = true; }
  function showDetail(title, lines) {
    const d = byId("detail");
    if (!d) return;
    d.innerHTML = "";
    const close = el("button", { type: "button", text: "Cerrar detalle" });
    close.onclick = hideDetail;
    d.append(el("h4", { text: title }), ...lines.map(l => el("p", { text: l })), close);
    d.hidden = false;
  }

  // Dibuja las celdas visuales. La alternativa accesible es la tabla; las celdas se ocultan a lectores de pantalla.
  function renderMap(map, rects, o) {
    map.innerHTML = "";
    const tip = byId("tip");
    rects.forEach((r, i) => {
      const c = o.color(r, i);
      const drill = o.drill(r);
      const b = el("button", { type: "button", tabindex: "-1", className: "cell" + (drill ? " drill" : "") },
        el("b", { text: r.node.name }), el("small", { text: `${o.amount(r.val)} · ${o.share(r)}` }));
      if (drill) b.append(el("span", { className: "open-hint", text: "Abrir ›" }));
      b.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:${c.bg};color:${c.fg}`;
      const lines = o.detail(r, drill);
      b.onclick = () => { if (drill) o.open(r); else showDetail(r.node.name, lines); };
      b.onmousemove = e => {
        tip.style.display = "block";
        tip.style.left = Math.min(e.clientX + 14, innerWidth - 280) + "px";
        tip.style.top = e.clientY + 14 + "px";
        tip.textContent = [r.node.name, ...lines].join("\n");
      };
      b.onmouseleave = hideTip;
      map.appendChild(b);
    });
  }

  // Tabla jerárquica equivalente al nivel actual (incluye partidas negativas, cero y residuales).
  function renderTable(container, rows, o) {
    container.innerHTML = "";
    if (!rows.length) return;
    const table = el("table", { className: "data-table" }, el("caption", { text: o.caption }));
    table.append(el("thead", {}, el("tr", {},
      el("th", { scope: "col", text: "Partida" }), el("th", { scope: "col", text: `Importe (${o.unit})` }),
      el("th", { scope: "col", text: "% del nivel" }), el("th", { scope: "col", text: "Tipo" }),
      el("th", { scope: "col", text: "Acción" }))));
    const body = el("tbody");
    for (const r of rows) {
      const act = el("td");
      if (r.drill) {
        const btn = el("button", { type: "button", "aria-label": `Abrir desglose de ${r.name}`, text: "Abrir desglose" });
        btn.onclick = r.open;
        act.append(btn);
      } else act.textContent = "Sin desglose";
      body.append(el("tr", {}, el("th", { scope: "row", text: r.name }), el("td", { text: r.amount }),
        el("td", { text: r.share }), el("td", { text: r.kindLabel }), act));
    }
    table.append(body);
    container.append(table);
  }

  const KINDS = { residual: "Residual (diferencia de conciliación)", negativa: "Negativa, no representada en el mapa",
    cero: "Cero (dato publicado)", positiva: "Importe positivo" };
  const kindOf = k => k.residual ? "residual" : k.val < 0 ? "negativa" : k.val === 0 ? "cero" : "positiva";

  // Textos distintos para nivel vacío, solo ceros, solo negativos y ausencia de dato.
  function emptyMessage(items) {
    if (!items.length) return "Este nivel no tiene desglose disponible para la selección actual.";
    if (items.every(k => k.val === 0)) return "Todas las partidas de este nivel valen 0 (dato publicado, no ausencia de dato).";
    return "No hay importes positivos que representar en este nivel; consulte la tabla para ver las partidas negativas.";
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { hideTip(); hideDetail(); }
  });

  window.UI = { el, cellColors, announce, focusLevel, showError, hideStatus, crumbs, setBack, hideTip, hideDetail,
    showDetail, renderMap, renderTable, kindOf, KINDS, emptyMessage };
})();
