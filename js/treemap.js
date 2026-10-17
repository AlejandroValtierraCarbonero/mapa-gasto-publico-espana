/* Algoritmo de treemap "squarified". items: [{val,...}] -> [{...item,x,y,w,h}] */
window.squarify = function (items, x, y, w, h) {
  const out = [];
  const sorted = items.filter(i => i.val > 0).sort((a, b) => b.val - a.val);
  const sum = sorted.reduce((s, i) => s + i.val, 0);
  if (!sum) return out;
  const rest = sorted.map(i => ({ ...i, area: i.val * w * h / sum }));
  while (rest.length) {
    const side = Math.min(w, h), row = [];
    const worst = r => {
      const s = r.reduce((a, i) => a + i.area, 0);
      return Math.max(...r.map(i => Math.max(side * side * i.area / (s * s), s * s / (side * side * i.area))));
    };
    let best = Infinity;
    while (rest.length) {
      const wv = worst(row.concat(rest[0]));
      if (row.length && wv > best) break;
      best = wv;
      row.push(rest.shift());
    }
    const th = row.reduce((a, i) => a + i.area, 0) / side;
    let o = 0;
    for (const i of row) {
      const l = i.area / th;
      out.push(w >= h ? { ...i, x, y: y + o, w: th, h: l } : { ...i, x: x + o, y, w: l, h: th });
      o += l;
    }
    if (w >= h) { x += th; w -= th; } else { y += th; h -= th; }
  }
  return out;
};
