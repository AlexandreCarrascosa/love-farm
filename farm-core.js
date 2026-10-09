/* Pure animation geometry, shared by the browser and the automated checks. */
(function (root) {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const glyphs = {
    I: ['11111','00100','00100','00100','00100','00100','11111'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    O: ['01110','11011','10001','10001','10001','11011','01110'],
    V: ['10001','10001','10001','10001','01010','01010','00100'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    ' ': ['00','00','00','00','00','00','00']
  };
  const rows = Array.from({ length: 7 }, (_, row) => [...'I LOVE U'].map(c => glyphs[c][row]).join('0'));
  const field = { x: 432, y: 410, cellW: 13, cellH: 27, cols: rows[0].length, rows: 7 };
  const route = [];
  for (let row = 0; row < 7; row++) for (let i = 0; i < field.cols; i++) {
    const col = row % 2 ? field.cols - 1 - i : i;
    route.push({ x: field.x + col * field.cellW + field.cellW / 2, y: field.y + row * field.cellH + field.cellH / 2, row, col, cut: rows[row][col] === '1' });
  }
  function path(points, ink = true) {
    const out = [];
    for (let j = 1; j < points.length; j++) {
      const a = points[j - 1], b = points[j], count = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
      for (let k = 0; k < count; k++) out.push({ x: lerp(a[0], b[0], k / count), y: lerp(a[1], b[1], k / count), ink });
    }
    const last = points[points.length - 1]; out.push({ x: last[0], y: last[1], ink }); return out;
  }
  const heart = Array.from({ length: 100 }, (_, i) => {
    const a = i / 99 * Math.PI * 2;
    return [647 + 3.3 * 16 * Math.sin(a) ** 3, 137 - 3.3 * (13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a))];
  });
  const strokes = [[[418,200],[460,89],[502,200]],[[435,158],[485,158]],heart,[[780,200],[780,89],[817,89],[837,99],[842,119],[832,139],[780,147]],[[799,145],[847,200]]];
  const smoke = [];
  strokes.forEach((s, i) => { if (i) { const p = smoke[smoke.length-1]; smoke.push(...path([[p.x,p.y],s[0]], false)); } smoke.push(...path(s)); });
  function routePosition(progress) {
    const f = clamp(progress) * (route.length - 1), index = Math.floor(f), a = route[index], b = route[Math.min(index + 1, route.length - 1)];
    return { x: lerp(a.x,b.x,f-index), y: lerp(a.y,b.y,f-index), angle: Math.atan2(b.y-a.y,b.x-a.x), index };
  }
  const phases = [[3,'O avião está se preparando…'],[7,'Um pouquinho de amor vai decolar.'],[23,'Para escrever no céu o que mora aqui dentro.'],[34,'E deixar no jardim uma lembrança de nós.'],[Infinity,'Rute 1:16 · A ❤️ R · I LOVE U']];
  function state(time) { return { time, progress: clamp(time/36), harvest: clamp((time-8)/26), writing: clamp((time-7)/16), done: time >= 36, caption: phases.find(p => time < p[0])[1] }; }
  const api = { clamp, lerp, field, rows, route, smoke, routePosition, state, duration:36 };
  root.FarmCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
