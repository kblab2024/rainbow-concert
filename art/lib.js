/* 彩虹音樂會插圖共用庫（全部回傳 SVG 字串；座標 1920×1080，y 向下）
 * 說明與規則見 art/STYLE.md。場景檔用 scene(id, dur, draw) 註冊；draw(t) 的 t ∈ [0,1)，
 * 動畫必須是週期函數：所有隨時間變化都用 cyc(t,k)／wave(t,k,phase)／loop(t,k,off) 組成（k 為整數）。
 */
(function (W) {
  'use strict';
  const TAU = Math.PI * 2;

  // ───────── 色票 ─────────
  const P = {
    ink: '#3B2A1A', inkSoft: '#5A4632', white: '#FFFDF7', cream: '#FFF8EC',
    // 山與地
    mtFar: '#A9C9B6', mtMid: '#86B494', mtNear: '#69A076', mtDeep: '#4E8460', mtShade: '#5C9069',
    grass: '#8CC36E', grassD: '#73AD57', grassL: '#A6D486', grassDD: '#5E9846',
    paddy: '#B7D86F', paddyD: '#99C356', paddyGold: '#E7C75B', dike: '#C9B57C', water: '#9FCFE0',
    road: '#EAD4A5', roadEdge: '#D2B684', soil: '#C79A63', yard: '#E8D3A6', yardD: '#D9BE8B',
    // 建築
    brick: '#C8664B', brickD: '#AE5139', brickL: '#DA8064', roof: '#9E3D2E', roofD: '#7F2F24',
    tile: '#5F6670', tileD: '#4A5059', wood: '#9A6A43', woodD: '#74502F', woodL: '#B98559',
    plaster: '#F3E6CF', windowLit: '#FFE08A', windowDark: '#4C5A6A', glass: '#BFDCE6',
    // 植物
    leaf: '#4F8F4A', leafD: '#3D7A3B', leafL: '#69A85B', leafLL: '#86BD6C', trunk: '#7A5636', trunkD: '#5E4027',
    bamboo: '#8DBA5A', bambooD: '#6E9C43',
    rose: '#E8476A', roseD: '#C2304F', roseL: '#F57D96', roseLeaf: '#4E8A47', bud: '#B83A54',
    // 天空
    sun: '#FFD45C', sunCore: '#FFE89A', cloud: '#FFFFFF', cloudShade: '#E4EEF3',
    // 彩虹
    rainbow: ['#E8453C', '#F39237', '#F6C631', '#5DB55A', '#3C9AD6', '#4B5FB8', '#8C5BB0'],
    // 點綴
    noteGold: '#F6B731', noteRed: '#E8475F', noteBlue: '#3C8DCB', noteGreen: '#4FAE62', notePurple: '#8C63B8',
    heart: '#EF5A78', sparkle: '#FFF3B0', drumWood: '#A0643A', drumWoodD: '#7E4A27', drumHead: '#F1E3C6',
    rope: '#EBD7A2', kente1: '#D9412E', kente2: '#F2B632', kente3: '#2E8B57',
  };

  const SKY = {
    day: ['#8CCBEA', '#A6D7EE', '#C1E3F2', '#D8EEF5', '#EAF6F3'],
    golden: ['#F4AE72', '#F7BE82', '#FACD93', '#FCDCA8', '#FEEBC4'],
    dusk: ['#6B69A6', '#9580B3', '#C391AD', '#E9A79E', '#F7C69A'],
    night: ['#1E2948', '#243258', '#2C3D67', '#354877', '#415587'],
    storm: ['#38435E', '#424E69', '#4D5974', '#58647F', '#65718B'],
    dawn: ['#9BC8E7', '#BAD8EB', '#E9D9CD', '#F7CDB0', '#FBE3C6'],
    clear: ['#78C2EC', '#94CFF0', '#B2DDF4', '#CFEAF6', '#E7F5F7'],
  };

  // ───────── 基本工具 ─────────
  const f = n => (Math.round(n * 10) / 10);
  function rng(seed) { let a = (seed * 2654435761) >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const cyc = (t, k = 1) => ((t * k) % 1 + 1) % 1;                              // 0..1 鋸齒，k 圈
  const wave = (t, k = 1, ph = 0) => Math.sin(TAU * (t * k + ph));               // -1..1 正弦
  const loop = (t, k = 1, off = 0) => ((t * k + off) % 1 + 1) % 1;               // 帶偏移的鋸齒
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const bump = (u, w = 0.5) => { const d = Math.abs(u - 0.5) / w; return d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * d); }; // 0..1..0
  const fadeLoop = u => Math.sin(Math.PI * clamp(u));                             // 0→1→0，給升起淡出的東西

  function attrs(o) {
    let s = '';
    for (const k in o) {
      const v = o[k];
      if (v === undefined || v === null || v === false) continue;
      s += ' ' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + '="' + v + '"';
    }
    return s;
  }
  const J = a => Array.isArray(a) ? a.flat(Infinity).join('') : (a || '');
  const rect = (x, y, w, h, fill, o = {}) => `<rect${attrs({ x: f(x), y: f(y), width: f(w), height: f(h), fill, ...o })}/>`;
  const circle = (cx, cy, r, fill, o = {}) => `<circle${attrs({ cx: f(cx), cy: f(cy), r: f(Math.max(0, r)), fill, ...o })}/>`;
  const ellipse = (cx, cy, rx, ry, fill, o = {}) => `<ellipse${attrs({ cx: f(cx), cy: f(cy), rx: f(Math.max(0, rx)), ry: f(Math.max(0, ry)), fill, ...o })}/>`;
  const path = (d, fill, o = {}) => `<path${attrs({ d, fill: fill || 'none', ...o })}/>`;
  const line = (x1, y1, x2, y2, stroke, w = 4, o = {}) => `<line${attrs({ x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke, strokeWidth: w, strokeLinecap: 'round', ...o })}/>`;
  const poly = (pts, fill, o = {}) => `<polygon${attrs({ points: pts.map(p => f(p[0]) + ',' + f(p[1])).join(' '), fill, ...o })}/>`;
  const g = (inner, o = {}) => `<g${attrs(o)}>${J(inner)}</g>`;
  const tr = (x, y, s = 1, rot = 0) => `translate(${f(x)} ${f(y)})` + (rot ? ` rotate(${f(rot)})` : '') + (s !== 1 ? ` scale(${Math.round(s * 1000) / 1000})` : '');
  const at = (x, y, s, inner, o = {}) => g(inner, { transform: tr(x, y, s, o.rot || 0), opacity: o.opacity });

  // Catmull-Rom → 三次貝茲，平滑曲線
  function smooth(pts, closed = false) {
    if (pts.length < 2) return '';
    const n = pts.length;
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + (closed ? ' Z' : '');
  }

  let _gid = 0;
  const uid = p => (p || 'g') + (++_gid);

  // ───────── 天空、太陽、雲 ─────────
  function sky(kind = 'day', horizon = 820) {
    const b = SKY[kind] || SKY.day, id = uid('sky');
    const stops = b.map((c, i) => `<stop offset="${(i / (b.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('');
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>` + rect(0, 0, 1920, horizon + 40, `url(#${id})`);
  }
  function sun(x, y, r, t, o = {}) {
    const n = o.rays || 12, col = o.color || P.sun;
    const rot = cyc(t, 1) * (360 / n);
    const rays = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const r1 = r * 1.28, r2 = r * (1.62 + 0.08 * wave(t, 2, i / n));
      rays.push(line(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2, col, r * 0.13));
    }
    return g([
      circle(x, y, r * 2.2, col, { opacity: 0.16 }), circle(x, y, r * 1.6, col, { opacity: 0.22 }),
      o.rays === 0 ? '' : g(rays, { transform: `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`, opacity: 0.85 }),
      circle(x, y, r, col), circle(x - r * 0.18, y - r * 0.18, r * 0.62, o.core || P.sunCore, { opacity: 0.8 }),
    ]);
  }
  function moon(x, y, r) {
    return g([circle(x, y, r * 1.9, '#FFF6D6', { opacity: 0.1 }), circle(x, y, r, '#FFF3C4'), circle(x + r * 0.42, y - r * 0.18, r * 0.86, '#2C3D67')]);
  }
  function stars(seed, n, t, y1 = 600) {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const x = r() * 1920, y = r() * y1, s = 2 + r() * 4, ph = r();
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * wave(t, 1 + (i % 3), ph));
      out.push(sparkle(x, y, s * 1.6, '#FFF6CF', tw));
    }
    return g(out);
  }
  function cloud(x, y, s = 1, o = {}) {
    const c = o.color || P.cloud, sh = o.shade || P.cloudShade;
    const puffs = [[-90, 8, 52], [-38, -26, 66], [30, -38, 74], [92, -6, 56], [130, 16, 40], [-130, 22, 36]];
    return at(x, y, s, [
      g(puffs.map(([px, py, r]) => circle(px, py + 10, r, sh))),
      g(puffs.map(([px, py, r]) => circle(px, py, r, c))),
      rect(-150, 10, 300, 48, c, { rx: 24 }),
    ], { opacity: o.opacity });
  }

  // ───────── 山、丘、地 ─────────
  function ridge(o) {
    const { y = 700, amp = 60, seed = 1, color = P.mtFar, x0 = -40, x1 = 1960, bottom = 1100, freq = 1 } = o;
    const r = rng(seed), ph = [r() * TAU, r() * TAU, r() * TAU];
    const pts = [];
    for (let x = x0; x <= x1 + 1; x += 48) {
      const u = x / 1920;
      const v = 0.6 * Math.sin(u * TAU * 0.9 * freq + ph[0]) + 0.3 * Math.sin(u * TAU * 2.3 * freq + ph[1]) + 0.1 * Math.sin(u * TAU * 5.1 * freq + ph[2]);
      pts.push([x, y - amp * v]);
    }
    return path(smooth(pts) + ` L${x1} ${bottom} L${x0} ${bottom} Z`, color, o.stroke ? { stroke: o.stroke, strokeWidth: 4 } : {});
  }
  // 一座圓丘：cx 中心、base 底線、w 寬、h 高
  function hill(cx, base, w, h, color, o = {}) {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, x = cx - w / 2 + w * u;
      pts.push([x, base - h * Math.pow(Math.sin(Math.PI * u), o.sharp || 1.3)]);
    }
    return path(smooth(pts) + ` L${f(cx + w / 2)} ${f(base + (o.depth || 400))} L${f(cx - w / 2)} ${f(base + (o.depth || 400))} Z`, color);
  }
  // 「黑狗兄的山」：第 1 章唱歌、第 8 章彩虹跨過的同一座山。頂上有一塊平台和一棵小樹。
  // x 為山頂中心，base 為山腳，s 為比例（s=1 寬約 1100、高約 520）。tone: day|golden|dusk|night|storm
  const PEAK_TONE = {
    day: [P.mtNear, P.mtDeep, P.leafL], golden: ['#7FA56A', '#5F8A55', '#A6BE6E'], dusk: ['#6F8A7E', '#56716A', '#8FA58A'],
    night: ['#2F4A55', '#253D48', '#3E5C63'], storm: ['#4B6566', '#3E5657', '#5D7774'], clear: ['#62A073', '#4A8460', '#85BE76'],
  };
  function peak(x, base, s = 1, tone = 'day', t = 0, o = {}) {
    const [c, cd, cl] = PEAK_TONE[tone] || PEAK_TONE.day;
    const pts = [[-560, 0], [-450, -110], [-350, -215], [-250, -330], [-160, -430], [-80, -492], [10, -515], [95, -500], [170, -450], [250, -360], [340, -250], [440, -130], [560, 0]];
    const shade = [[10, -515], [95, -500], [170, -450], [250, -360], [340, -250], [440, -130], [560, 0], [300, 0], [180, -170], [90, -330], [40, -470]];
    const tops = [[-120, -468], [-60, -505], [10, -520], [80, -508], [140, -470]];
    return at(x, base, s, [
      path(smooth(pts) + ' L560 60 L-560 60 Z', c),
      path(smooth(shade) + ' Z', cd, { opacity: 0.55 }),
      path(smooth(tops) + ' L140 -455 Q10 -480 -120 -455 Z', cl, { opacity: 0.9 }),
      // 山頂的小樹（辨識用，ch1 與 ch8 都要畫到）
      o.noTree ? '' : at(70, -500, 0.55, tree(0, 0, 1, t, { kind: 'round' })),
    ]);
  }
  function ground(y, color = P.grass, o = {}) {
    const pts = [];
    for (let x = -40; x <= 2080; x += 120) pts.push([x, y + (o.amp || 10) * Math.sin(x / 260 + (o.ph || 0))]);
    return path(smooth(pts) + ' L2080 1100 L-40 1100 Z', color);
  }
  // 草叢：一排小草，k 為擺動圈數
  function tufts(seed, n, x0, x1, y0, y1, t, o = {}) {
    const r = rng(seed), out = [], col = o.color || P.grassDD;
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), s = (o.size || 1) * (0.7 + r() * 0.6), ph = r();
      const sw = o.still ? 0 : 6 * wave(t, 1, ph + x / 900);
      out.push(path(`M${f(x - 10 * s)} ${f(y)} Q${f(x - 8 * s + sw * 0.5)} ${f(y - 18 * s)} ${f(x - 14 * s + sw)} ${f(y - 30 * s)} M${f(x)} ${f(y)} Q${f(x + sw * 0.5)} ${f(y - 24 * s)} ${f(x + sw)} ${f(y - 40 * s)} M${f(x + 10 * s)} ${f(y)} Q${f(x + 8 * s + sw * 0.5)} ${f(y - 18 * s)} ${f(x + 15 * s + sw)} ${f(y - 28 * s)}`, 'none', { stroke: col, strokeWidth: 4 * s, strokeLinecap: 'round' }));
    }
    return g(out);
  }
  // 稻田：y0（遠）到 y1（近）一列列秧苗，近大遠小，隨風擺
  function paddies(y0, y1, t, o = {}) {
    const rows = o.rows || 7, out = [], col = o.color || P.paddy, colD = o.colorD || P.paddyD;
    out.push(rect(-20, y0, 1960, y1 - y0 + 60, o.base || '#C3DE80'));
    for (let i = 0; i < rows; i++) {
      const u = i / (rows - 1), y = lerp(y0, y1, u * u * 0.85 + u * 0.15);
      const s = lerp(0.45, 1.25, u), gap = lerp(34, 92, u);
      out.push(rect(-20, y + 4 * s, 1960, 6 * s, o.dike || P.dike, { opacity: 0.55 }));
      for (let x = -40 + (i % 2) * gap / 2; x < 1980; x += gap) {
        const sw = (o.still ? 0 : 7 * s * wave(t, 1, x / 1400 - i * 0.07));
        out.push(path(`M${f(x)} ${f(y)} q${f(-5 * s + sw * .4)} ${f(-14 * s)} ${f(-9 * s + sw)} ${f(-26 * s)} M${f(x)} ${f(y)} q${f(sw * .4)} ${f(-18 * s)} ${f(sw)} ${f(-34 * s)} M${f(x)} ${f(y)} q${f(5 * s + sw * .4)} ${f(-14 * s)} ${f(10 * s + sw)} ${f(-25 * s)}`, 'none', { stroke: (i + Math.round(x / gap)) % 3 ? col : colD, strokeWidth: f(4.2 * s), strokeLinecap: 'round' }));
      }
    }
    return g(out);
  }
  // 小路：pts 為中心線（遠到近），w0 遠端寬、w1 近端寬
  function road(pts, w0, w1, o = {}) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const u = i / (pts.length - 1), w = lerp(w0, w1, u) / 2;
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const d = smooth(L) + ' L' + R.slice().reverse().map(p => f(p[0]) + ' ' + f(p[1])).join(' L') + ' Z';
    const dR = smooth(R.slice().reverse()).replace(/^M/, 'L');
    return g([path(smooth(L) + ' ' + dR + ' Z', o.edge || P.roadEdge, { transform: 'translate(0 6)' }), path(smooth(L) + ' ' + dR + ' Z', o.color || P.road)]);
  }

  // ───────── 植物 ─────────
  // kind: round（圓樹）| banyan（大榕樹，鬚根、寬樹冠）| pine
  function tree(x, y, s, t, o = {}) {
    const kind = o.kind || 'round', sw = (o.still ? 0 : (o.sway === undefined ? 4 : o.sway) * wave(t, 1, o.ph || 0));
    if (kind === 'banyan') {
      const roots = [];
      for (let i = 0; i < 9; i++) { const rx = -220 + i * 55; roots.push(path(`M${rx} -330 q${f(sw * 0.3)} 80 ${f(4 + sw * 0.6)} 150`, 'none', { stroke: P.trunkD, strokeWidth: 3, opacity: 0.7 })); }
      return at(x, y, s, [
        path('M-60 0 Q-48 -120 -40 -210 Q-90 -260 -170 -280 L-160 -300 Q-80 -285 -30 -250 Q-20 -320 -40 -380 L-10 -385 Q10 -320 10 -260 Q60 -300 150 -310 L155 -290 Q80 -270 35 -215 Q42 -110 60 0 Z', P.trunk),
        path('M-10 -10 Q-4 -120 2 -230', 'none', { stroke: P.trunkD, strokeWidth: 6, opacity: 0.5 }),
        g(roots),
        g([
          circle(-200, -360, 120, P.leafD), circle(-60, -440, 150, P.leafD), circle(110, -420, 140, P.leafD), circle(230, -340, 110, P.leafD),
          circle(-170, -390, 110, P.leaf), circle(-40, -470, 135, P.leaf), circle(120, -450, 125, P.leaf), circle(220, -370, 95, P.leaf), circle(20, -360, 120, P.leaf),
          circle(-110, -470, 70, P.leafL), circle(60, -520, 75, P.leafL), circle(190, -430, 55, P.leafL), circle(-220, -380, 50, P.leafL),
        ], { transform: `translate(${f(sw)} 0)` }),
      ]);
    }
    if (kind === 'pine') {
      return at(x, y, s, [rect(-10, -40, 20, 40, P.trunk), g([poly([[-70, -40], [0, -150], [70, -40]], P.leafD), poly([[-55, -100], [0, -210], [55, -100]], P.leaf), poly([[-38, -160], [0, -255], [38, -160]], P.leafL)], { transform: `translate(${f(sw * 0.5)} 0)` })]);
    }
    return at(x, y, s, [
      path('M-14 0 Q-10 -60 -8 -110 L8 -110 Q10 -60 14 0 Z', P.trunk),
      g([circle(-34, -140, 52, P.leafD), circle(30, -150, 56, P.leafD), circle(0, -190, 60, P.leaf), circle(-28, -150, 44, P.leaf), circle(34, -160, 44, P.leaf), circle(-12, -205, 30, P.leafL), circle(26, -176, 22, P.leafL)], { transform: `translate(${f(sw)} 0)` }),
    ]);
  }
  function bamboo(x, y, s, t, o = {}) {
    const out = [], n = o.n || 5, r = rng(o.seed || 7);
    for (let i = 0; i < n; i++) {
      const bx = (i - (n - 1) / 2) * 34 + r() * 10, h = 420 + r() * 160, sw = 10 * wave(t, 1, i * 0.13 + (o.ph || 0));
      out.push(path(`M${f(bx)} 0 Q${f(bx + sw * 0.3)} ${f(-h * 0.5)} ${f(bx + sw)} ${f(-h)}`, 'none', { stroke: i % 2 ? P.bamboo : P.bambooD, strokeWidth: 12 }));
      for (let k = 1; k < 6; k++) { const yy = -h * k / 6, xx = bx + sw * (k / 6) * (k / 6); out.push(line(xx - 7, yy, xx + 7, yy, P.bambooD, 3)); }
      for (let k = 0; k < 6; k++) {
        const yy = -h * (0.45 + k * 0.1), xx = bx + sw * 0.6, dir = k % 2 ? 1 : -1;
        out.push(path(`M${f(xx)} ${f(yy)} q${f(dir * 30)} ${f(-14)} ${f(dir * 70)} ${f(4 + 4 * wave(t, 1, k * 0.2))} q${f(-dir * 36)} 8 ${f(-dir * 70)} ${f(-4)} Z`, i % 2 ? P.leafL : P.leaf));
      }
    }
    return at(x, y, s, out);
  }
  function flowerDots(seed, n, x0, x1, y0, y1, o = {}) {
    const r = rng(seed), cols = o.colors || ['#FFFFFF', '#F6C631', '#F57D96'], out = [];
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), c = cols[i % cols.length], s = (o.size || 1) * (0.7 + r() * 0.6); out.push(g([circle(x - 4 * s, y, 4 * s, c), circle(x + 4 * s, y, 4 * s, c), circle(x, y - 4 * s, 4 * s, c), circle(x, y + 4 * s, 4 * s, c), circle(x, y, 3 * s, '#F6B731')])); }
    return g(out);
  }
  // 玫瑰：bloom 0（花苞）→1（盛開）
  function rose(x, y, s = 1, bloom = 1, o = {}) {
    const c = o.color || P.rose, cd = o.dark || P.roseD, cl = o.light || P.roseL;
    if (bloom < 0.15) return at(x, y, s, [path('M0 6 Q-9 -6 0 -20 Q9 -6 0 6 Z', P.bud), path('M-8 4 Q0 -2 8 4 L0 10 Z', P.roseLeaf)]);
    const b = clamp(bloom), R = lerp(10, 26, b);
    const petals = [];
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; petals.push(ellipse(Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.5, R * 0.62, R * 0.5, cd, { transform: `rotate(${f(a * 180 / Math.PI + 90)} ${f(Math.cos(a) * R * 0.55)} ${f(Math.sin(a) * R * 0.5)})` })); }
    return at(x, y, s, [
      g(petals), circle(0, 0, R * 0.78, c),
      path(`M${f(-R * 0.45)} ${f(-R * 0.05)} Q0 ${f(-R * 0.65)} ${f(R * 0.45)} ${f(-R * 0.05)}`, 'none', { stroke: cd, strokeWidth: f(R * 0.12), strokeLinecap: 'round' }),
      path(`M${f(-R * 0.25)} ${f(R * 0.12)} Q0 ${f(-R * 0.3)} ${f(R * 0.25)} ${f(R * 0.12)}`, 'none', { stroke: cd, strokeWidth: f(R * 0.1), strokeLinecap: 'round' }),
      circle(-R * 0.25, -R * 0.3, R * 0.18, cl, { opacity: 0.8 }),
    ]);
  }
  // 玫瑰叢：blooms 陣列給每朵的綻放程度；wild=true 為沒整理的荒草叢
  function roseBush(x, y, s, t, o = {}) {
    const r = rng(o.seed || 3), out = [], n = o.n || 5, blooms = o.blooms || [];
    out.push(ellipse(0, -40, 120, 60, P.leafD), ellipse(-60, -60, 70, 50, P.roseLeaf), ellipse(55, -66, 75, 52, P.roseLeaf), ellipse(0, -85, 70, 45, P.leafL));
    if (o.wild) out.push(tufts((o.seed || 3) + 11, 14, -140, 140, -10, 10, t, { color: '#8A9A4F', size: 1.6 }));
    for (let i = 0; i < n; i++) {
      const bx = -90 + i * (180 / Math.max(1, n - 1)) + r() * 16, by = -70 - r() * 50;
      const bl = blooms[i] === undefined ? (o.bloom === undefined ? 1 : o.bloom) : blooms[i];
      out.push(rose(bx, by + 2 * wave(t, 1, i * 0.2), 0.9 + r() * 0.4, bl));
    }
    return at(x, y, s, out);
  }

  // ───────── 建築 ─────────
  // 三合院（正面簡化，紅磚、紅瓦、燕尾脊）
  function sanheyuan(x, y, s = 1, o = {}) {
    const lit = o.lit;
    const roofC = (w, h, yy) => path(`M${-w / 2 - 20} ${yy} Q0 ${yy - h * 0.25} ${w / 2 + 20} ${yy} L${w / 2 - 10} ${yy - h} Q0 ${yy - h - 10} ${-w / 2 + 10} ${yy - h} Z`, P.roof);
    const swallow = (w, yy) => path(`M${-w / 2 - 6} ${yy} q-30 -6 -44 -34 q22 10 50 14 Z M${w / 2 + 6} ${yy} q30 -6 44 -34 q-22 10 -50 14 Z`, P.roofD);
    const win = (wx, wy) => g([rect(wx, wy, 40, 46, lit ? P.windowLit : P.windowDark, { rx: 3 }), line(wx + 20, wy, wx + 20, wy + 46, P.woodD, 3), line(wx, wy + 23, wx + 40, wy + 23, P.woodD, 3)]);
    return at(x, y, s, [
      // 兩側護龍
      rect(-330, -110, 150, 110, P.brick), rect(180, -110, 150, 110, P.brick),
      path('M-345 -110 L-165 -110 L-180 -150 L-330 -150 Z', P.roof), path('M165 -110 L345 -110 L330 -150 L180 -150 Z', P.roof),
      win(-280, -84), win(230, -84),
      // 正身
      rect(-180, -150, 360, 150, P.brickL), rect(-180, -150, 360, 18, P.brickD, { opacity: 0.35 }),
      roofC(380, 60, -150), swallow(380, -210), rect(-190, -214, 380, 8, P.roofD),
      rect(-38, -112, 76, 112, P.woodD, { rx: 4 }), line(0, -112, 0, 0, '#5A3A22', 3), circle(-8, -56, 3, '#E7C25A'), circle(8, -56, 3, '#E7C25A'),
      win(-140, -100), win(100, -100),
      rect(-46, -128, 92, 12, '#E9C46A', { rx: 2 }),
    ]);
  }
  // 紅磚老學堂：拱廊、灰瓦、中間山牆與鐘。w 寬（預設 980）。lit：窗戶亮燈；bunting：掛彩帶（交給 bunting()）
  function schoolhouse(x, y, s = 1, o = {}) {
    const w = o.w || 980, h = 230, lit = o.lit, out = [];
    out.push(rect(-w / 2 - 30, -h - 10, w + 60, 26, P.tileD));
    out.push(path(`M${-w / 2 - 50} ${-h} L${-w / 2 + 40} ${-h - 110} L${w / 2 - 40} ${-h - 110} L${w / 2 + 50} ${-h} Z`, P.tile));
    for (let i = 0; i < 14; i++) { const xx = -w / 2 + 40 + i * (w - 80) / 13; out.push(line(xx, -h - 108, xx + (xx > 0 ? 8 : -8), -h - 4, P.tileD, 3, { opacity: 0.55 })); }
    out.push(rect(-w / 2, -h, w, h, P.brick));
    for (let r = 0; r < 9; r++) out.push(line(-w / 2, -h + 16 + r * 24, w / 2, -h + 16 + r * 24, P.brickD, 2, { opacity: 0.35 }));
    // 拱廊與窗
    const n = o.arches || 7, aw = (w - 80) / n;
    for (let i = 0; i < n; i++) {
      const ax = -w / 2 + 40 + i * aw, cx = ax + aw / 2;
      if (i === Math.floor(n / 2)) continue;
      out.push(path(`M${f(ax + 12)} -12 L${f(ax + 12)} ${-h + 90} Q${f(cx)} ${-h + 30} ${f(ax + aw - 12)} ${-h + 90} L${f(ax + aw - 12)} -12 Z`, P.plaster));
      out.push(rect(ax + 28, -h + 92, aw - 56, 92, lit ? P.windowLit : P.glass, { rx: 4 }));
      out.push(line(cx, -h + 92, cx, -h + 184, P.woodD, 4), line(ax + 28, -h + 138, ax + aw - 28, -h + 138, P.woodD, 4));
      if (lit) out.push(rect(ax + 28, -h + 92, aw - 56, 92, '#FFF2B8', { rx: 4, opacity: 0.35 }));
    }
    // 中央山牆入口
    const gx = 0, gw = aw + 40;
    out.push(path(`M${f(-gw / 2 - 20)} ${-h} L0 ${-h - 150} L${f(gw / 2 + 20)} ${-h} Z`, P.brickL));
    out.push(path(`M${f(-gw / 2 - 34)} ${-h + 4} L0 ${-h - 162} L${f(gw / 2 + 34)} ${-h + 4}`, 'none', { stroke: P.plaster, strokeWidth: 14, strokeLinejoin: 'round' }));
    out.push(circle(0, -h - 62, 26, P.plaster), circle(0, -h - 62, 18, '#E7C25A'), line(0, -h - 62, 0, -h - 74, P.ink, 3), line(0, -h - 62, 8, -h - 62, P.ink, 3));
    out.push(rect(-gw / 2, -h, gw, h, P.brickL));
    out.push(path(`M${f(-gw / 2 + 24)} 0 L${f(-gw / 2 + 24)} ${-h + 80} Q0 ${-h + 10} ${f(gw / 2 - 24)} ${-h + 80} L${f(gw / 2 - 24)} 0 Z`, o.doorOpen ? (lit ? '#FFE9A6' : '#6A4A30') : P.woodD));
    if (!o.doorOpen) out.push(line(0, -h + 46, 0, 0, '#5A3A22', 4));
    out.push(rect(-w / 2 - 20, -10, w + 40, 18, '#D8C7A6'));
    out.push(rect(-w / 2 - 10, -h - 2, w + 20, 10, P.plaster));
    return at(x, y, s, out);
  }

  // 山腳村莊：竹林、樹、兩座三合院（全片共用，各章遠景都用這個，村莊看起來才一致）。lit：窗戶亮燈
  function village(x, y, s, t, o = {}) {
    return at(x, y, s, [
      bamboo(-420, 10, 0.55, t, { n: 4, seed: 3 }),
      tree(-300, 20, 0.8, t, { ph: 0.1 }),
      sanheyuan(-60, 30, 0.62, { lit: o.lit }),
      tree(210, 30, 0.7, t, { ph: 0.4 }),
      sanheyuan(420, 40, 0.5, { lit: o.lit }),
      bamboo(620, 30, 0.5, t, { n: 3, seed: 9, ph: 0.3 }),
    ]);
  }

  // ───────── 點綴 ─────────
  function sparkle(x, y, r, color = P.sparkle, k = 1) {
    const q = r * clamp(k, 0, 1.5);
    return path(`M${f(x)} ${f(y - q)} Q${f(x + q * 0.18)} ${f(y - q * 0.18)} ${f(x + q)} ${f(y)} Q${f(x + q * 0.18)} ${f(y + q * 0.18)} ${f(x)} ${f(y + q)} Q${f(x - q * 0.18)} ${f(y + q * 0.18)} ${f(x - q)} ${f(y)} Q${f(x - q * 0.18)} ${f(y - q * 0.18)} ${f(x)} ${f(y - q)} Z`, color, { opacity: clamp(k, 0, 1) });
  }
  function heart(x, y, s = 1, color = P.heart, o = {}) {
    return at(x, y, s, path('M0 18 C-30 -2 -30 -30 -14 -32 C-5 -33 0 -26 0 -20 C0 -26 5 -33 14 -32 C30 -30 30 -2 0 18 Z', color), { opacity: o.opacity });
  }
  // 音符：kind 0 ♪、1 ♫、2 ♩
  function note(x, y, s = 1, color = P.noteGold, kind = 0, o = {}) {
    let d;
    if (kind === 1) d = [ellipse(-22, 30, 14, 10, color, { transform: 'rotate(-20 -22 30)' }), ellipse(24, 22, 14, 10, color, { transform: 'rotate(-20 24 22)' }), rect(-11, -34, 6, 64, color), rect(35, -42, 6, 64, color), path('M-11 -34 L41 -42 L41 -28 L-11 -20 Z', color)];
    else if (kind === 2) d = [ellipse(0, 30, 15, 11, color, { transform: 'rotate(-20 0 30)' }), rect(10, -36, 6, 66, color)];
    else d = [ellipse(0, 30, 15, 11, color, { transform: 'rotate(-20 0 30)' }), rect(10, -36, 6, 66, color), path('M16 -36 Q40 -24 34 4 Q30 -14 16 -16 Z', color)];
    return at(x, y, s, [g(d, { stroke: o.outline || 'none', strokeWidth: o.outline ? 6 : 0 }), g(d)], { opacity: o.opacity, rot: o.rot });
  }
  // 一串飄起的音符：從 (x,y) 往 (x+dx, y+dy) 飄，n 個，t 循環；每個音符生命 0→1 淡入淡出
  function noteStream(x, y, dx, dy, n, t, o = {}) {
    const cols = o.colors || [P.noteGold, P.noteRed, P.noteBlue, P.noteGreen, P.notePurple], out = [];
    const k = o.k || 1;
    // 相鄰音符間距至少 minGap×s（預設 95，約一個音符高）；路徑太短就自動少放幾個
    n = Math.max(1, Math.min(n, Math.floor(Math.hypot(dx, dy) / ((o.minGap || 95) * (o.s || 1)))));
    for (let i = 0; i < n; i++) {
      const u = loop(t, k, i / n);
      const px = x + dx * u + (o.wiggle === undefined ? 26 : o.wiggle) * wave(u, 1, i * 0.37), py = y + dy * u;
      out.push(note(px, py, (o.s || 1) * (0.8 + 0.3 * ((i * 7) % 3) / 2), cols[i % cols.length], i % 3, { opacity: fadeLoop(u), rot: 12 * wave(u, 1, i * 0.21), outline: o.outline }));
    }
    return g(out);
  }
  function bird(x, y, s, t, k = 3, ph = 0) {
    const fl = 14 * wave(t, k, ph);
    return at(x, y, s, path(`M-26 ${f(-fl * 0.4)} Q-12 ${f(-12 - fl)} 0 0 Q12 ${f(-12 - fl)} 26 ${f(-fl * 0.4)}`, 'none', { stroke: '#4A4A5A', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }
  // 雨：k 為一個循環落下幾輪；angle 斜度（度）
  function rain(seed, n, t, o = {}) {
    const r = rng(seed), out = [], k = o.k || 3, ang = (o.angle || 12) * Math.PI / 180, len = o.len || 46, col = o.color || '#CFE3F2';
    const y0 = o.y0 === undefined ? -60 : o.y0, y1 = o.y1 === undefined ? 1100 : o.y1, H = y1 - y0;
    for (let i = 0; i < n; i++) {
      const x = r() * 2100 - 240, off = r(), u = loop(t, k, off), y = y0 + H * u, xx = x + Math.tan(ang) * (y - y0) * 0.5;
      out.push(line(xx, y, xx - Math.sin(ang) * len, y - Math.cos(ang) * len, col, o.w || 3.2, { opacity: o.opacity || 0.75 }));
    }
    return g(out);
  }
  // 水花（地面濺起的小圈）
  function splashes(seed, n, x0, x1, y0, y1, t, o = {}) {
    const r = rng(seed), out = [], k = o.k || 3;
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), u = loop(t, k, r()); out.push(ellipse(x, y, 4 + 18 * u, (4 + 18 * u) * 0.3, 'none', { stroke: '#DDEBF5', strokeWidth: 3, opacity: f(1 - u) })); }
    return g(out);
  }
  // 彩虹：中心 (cx,cy)、外半徑 r、每色寬 bw；p 為畫出比例 0..1（從左到右）
  function rainbow(cx, cy, r, bw, p = 1, o = {}) {
    const out = [];
    P.rainbow.forEach((c, i) => {
      const rr = r - i * bw - bw / 2;
      const len = Math.PI * rr;
      out.push(path(`M${f(cx - rr)} ${f(cy)} A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + rr)} ${f(cy)}`, 'none', { stroke: c, strokeWidth: bw + 1, strokeDasharray: `${f(len * clamp(p))} ${f(len + 10)}`, opacity: o.opacity }));
    });
    return g(out);
  }
  // 三角旗彩帶：從 (x1,y1) 到 (x2,y2)，下垂 sag，n 面旗
  function bunting(x1, y1, x2, y2, sag, n, t, o = {}) {
    const cols = o.colors || P.rainbow, out = [];
    const qx = (x1 + x2) / 2, qy = (y1 + y2) / 2 + sag;
    const at_ = u => [lerp(lerp(x1, qx, u), lerp(qx, x2, u), u), lerp(lerp(y1, qy, u), lerp(qy, y2, u), u)];
    out.push(path(`M${f(x1)} ${f(y1)} Q${f(qx)} ${f(qy)} ${f(x2)} ${f(y2)}`, 'none', { stroke: '#7A5A3A', strokeWidth: 3 }));
    const sz = o.size || 34;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, [px, py] = at_(u), rot = 8 * wave(t, 1, i * 0.17);
      out.push(g(poly([[-sz / 2, 0], [sz / 2, 0], [0, sz * 1.25]], cols[i % cols.length]), { transform: `translate(${f(px)} ${f(py)}) rotate(${f(rot)})` }));
    }
    return g(out);
  }
  function confetti(seed, n, t, o = {}) {
    const r = rng(seed), out = [], k = o.k || 1, cols = o.colors || P.rainbow;
    const y0 = o.y0 === undefined ? -40 : o.y0, y1 = o.y1 === undefined ? 1080 : o.y1;
    for (let i = 0; i < n; i++) {
      const x = r() * 1920, u = loop(t, k, r()), y = lerp(y0, y1, u), sp = r() < 0.5 ? 1 : 2;
      const rot = 360 * cyc(t, sp * k) + r() * 360, w = 10 + r() * 8;
      out.push(rect(-w / 2, -5, w, 10, cols[i % cols.length], { transform: `translate(${f(x + 30 * wave(u, 1, r()))} ${f(y)}) rotate(${f(rot)})`, opacity: f(fadeLoop(u) * 0.95) }));
    }
    return g(out);
  }
  function chair(x, y, s = 1, o = {}) {
    const c = o.color || '#B5763F', cd = '#8A5A2E';
    const body = [rect(-26, -110, 52, 12, cd, { rx: 4 }), rect(-24, -100, 6, 60, cd), rect(18, -100, 6, 60, cd), rect(-30, -50, 60, 12, c, { rx: 4 }), rect(-28, -40, 6, 40, cd), rect(22, -40, 6, 40, cd), rect(-24, -96, 48, 30, c, { rx: 4 })];
    return at(x, y, s, body, { rot: o.fallen ? (o.fallen === true ? -78 : o.fallen) : 0 });
  }
  // 木頭舞台：fallen 0（立好）→1（倒）
  function stage(x, y, s = 1, o = {}) {
    const fall = o.fallen || 0;
    const back = g([rect(-300, -360, 18, 360, P.woodD), rect(282, -360, 18, 360, P.woodD), rect(-300, -380, 600, 34, P.wood, { rx: 6 }), o.banner ? rect(-250, -340, 500, 70, o.banner, { rx: 8 }) : ''], { transform: `rotate(${f(-fall * 84)} -300 0)` });
    return at(x, y, s, [back, rect(-340, -70, 680, 70, P.wood), rect(-340, -78, 680, 14, P.woodL), line(-340, -36, 340, -36, P.woodD, 3, { opacity: 0.5 }), rect(-330, 0, 22, 20, P.woodD), rect(308, 0, 22, 20, P.woodD)]);
  }
  function puddle(x, y, w, t, o = {}) {
    return g([ellipse(x, y, w, w * 0.18, o.color || '#9CC3D8', { opacity: 0.85 }), ellipse(x - w * 0.25, y - w * 0.03, w * 0.35, w * 0.05, '#E4F1F7', { opacity: 0.6 + 0.3 * wave(t, 1) })]);
  }
  // 非洲鼓（djembe）：hit 0..1 為敲擊瞬間（鼓面亮、擴散圈）
  function djembe(x, y, s = 1, hit = 0, o = {}) {
    const out = [
      path('M-62 -170 Q-70 -110 -26 -78 L-22 -40 Q-50 -16 -46 0 L46 0 Q50 -16 22 -40 L26 -78 Q70 -110 62 -170 Z', P.drumWood),
      path('M-62 -170 Q-70 -110 -26 -78 L-22 -40 Q-50 -16 -46 0 L-20 0 Q-26 -40 -4 -80 Q-36 -110 -40 -170 Z', P.drumWoodD, { opacity: 0.5 }),
      rect(-64, -150, 128, 16, o.band || P.kente1), rect(-64, -134, 128, 8, P.kente2), rect(-64, -126, 128, 6, P.kente3),
    ];
    for (let i = 0; i < 7; i++) { const xx = -54 + i * 18; out.push(line(xx, -170, xx + 9, -152, P.rope, 3), line(xx + 9, -152, xx + 18, -170, P.rope, 3)); }
    out.push(ellipse(0, -172, 66, 16, P.drumHead), ellipse(0, -172, 66, 16, 'none', { stroke: P.drumWoodD, strokeWidth: 4 }));
    if (hit > 0) {
      out.push(ellipse(0, -172, 66, 16, '#FFFFFF', { opacity: f(0.5 * hit) }));
      for (let i = 0; i < 2; i++) { const u = clamp(1 - hit + i * 0.25); out.push(ellipse(0, -176, 70 + 90 * u, 18 + 30 * u, 'none', { stroke: o.ring || '#FFE7A0', strokeWidth: 6, opacity: f((1 - u) * 0.8) })); }
    }
    return at(x, y, s, out);
  }
  // 鼓點節拍：t 一個循環 beats 拍，回傳目前這拍的敲擊強度（1 剛敲下 → 0）
  const beat = (t, beats = 4, off = 0) => { const u = cyc(t, beats) - off; const v = ((u % 1) + 1) % 1; return Math.pow(1 - v, 3); };

  // 閃電：整個畫面在循環的 at 位置（0..1）閃一下；回傳白色覆蓋層＋閃電形
  function flash(t, at = 0.3, o = {}) {
    const d = Math.min(Math.abs(cyc(t) - at), 1 - Math.abs(cyc(t) - at));
    const k = d < 0.012 ? 1 : (d < 0.05 ? 0.55 * (1 - (d - 0.012) / 0.038) : 0);
    if (k <= 0) return '';
    const bx = o.x || 1400, by = o.y || 0;
    return g([rect(0, 0, 1920, 1080, '#FFFFFF', { opacity: f(0.42 * k) }),
      path(`M${bx} ${by} l-50 160 l46 -6 l-70 190 l40 -6 l-60 170 l140 -230 l-48 8 l70 -170 l-50 6 l40 -122 Z`, '#FFF6C8', { opacity: f(k) })]);
  }
  // 流星：每個循環在 at 附近劃過一次
  function shootingStar(t, x0, y0, x1, y1, at = 0.4, w = 0.15) {
    const u = (cyc(t) - at) / w; if (u < 0 || u > 1) return '';
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u), tx = x - (x1 - x0) * 0.18, ty = y - (y1 - y0) * 0.18;
    return g([line(tx, ty, x, y, '#FFF3C4', 5, { opacity: f(0.8 * fadeLoop(u)) }), sparkle(x, y, 16, '#FFFBE6', fadeLoop(u))]);
  }
  // 對話泡泡（圓角框＋尾巴指向 tx,ty）與想像泡泡（雲狀＋小圓點）；inner 為裡面要畫的 SVG
  function speech(x, y, w, h, tx, ty, inner = '', o = {}) {
    const c = o.color || '#FFFDF7';
    return g([path(`M${f(x + w * 0.35)} ${f(y + h - 2)} L${f(tx)} ${f(ty)} L${f(x + w * 0.55)} ${f(y + h - 2)} Z`, c, { stroke: o.stroke || '#D9CBB0', strokeWidth: 3 }),
      rect(x, y, w, h, c, { rx: Math.min(w, h) * 0.3, stroke: o.stroke || '#D9CBB0', strokeWidth: 3 }), path(`M${f(x + w * 0.36)} ${f(y + h - 3)} L${f(x + w * 0.54)} ${f(y + h - 3)}`, 'none', { stroke: c, strokeWidth: 6 }), inner]);
  }
  function thought(cx, cy, rx, ry, tx, ty, inner = '', o = {}) {
    const c = o.color || '#FFFDF7', puffs = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; puffs.push(circle(cx + Math.cos(a) * rx * 0.88, cy + Math.sin(a) * ry * 0.85, Math.min(rx, ry) * 0.36, c)); }
    return g([g(puffs, { stroke: o.stroke || '#D9CBB0', strokeWidth: 3 }), ellipse(cx, cy, rx * 0.95, ry * 0.92, c),
      circle(lerp(cx, tx, 0.62), lerp(cy + ry, ty, 0.55), 16, c, { stroke: '#D9CBB0', strokeWidth: 3 }), circle(lerp(cx, tx, 0.85), lerp(cy + ry, ty, 0.85), 9, c, { stroke: '#D9CBB0', strokeWidth: 3 }), inner]);
  }
  // 花瓣飄落
  function petals(seed, n, t, o = {}) {
    const r = rng(seed), out = [], k = o.k || 1, cols = o.colors || [P.rose, P.roseL, '#F9B4C4'];
    const x0 = o.x0 || 0, x1 = o.x1 || 1920, y0 = o.y0 === undefined ? -30 : o.y0, y1 = o.y1 === undefined ? 1080 : o.y1;
    for (let i = 0; i < n; i++) {
      const u = loop(t, k, r()), x = lerp(x0, x1, r()) + 60 * wave(u, 1, r()), y = lerp(y0, y1, u), rot = 360 * cyc(t, k) + r() * 360;
      out.push(ellipse(0, 0, 9, 5, cols[i % cols.length], { transform: `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`, opacity: f(fadeLoop(u)) }));
    }
    return g(out);
  }
  // 澆水的水珠：從 (x,y) 往 (x+dx, y+dy) 拋物線
  function waterArc(x, y, dx, dy, t, n = 10, o = {}) {
    const out = [];
    for (let i = 0; i < n; i++) { const u = loop(t, o.k || 2, i / n), px = x + dx * u, py = y + dy * u * u - 40 * u * (1 - u); out.push(ellipse(px, py, 5, 7, '#7FC3E8', { opacity: f(0.9 * fadeLoop(u)) })); }
    return g(out);
  }
  // 蝴蝶
  function butterfly(x, y, s, t, k = 4, color = '#F6B731') {
    const fl = 0.35 + 0.65 * Math.abs(wave(t, k));
    return at(x, y, s, [g([ellipse(-12, -6, 14, 10, color), ellipse(-9, 8, 9, 7, color)], { transform: `scale(${f(fl * 100) / 100} 1)` }), g([ellipse(12, -6, 14, 10, color), ellipse(9, 8, 9, 7, color)], { transform: `scale(${f(fl * 100) / 100} 1)` }), rect(-2, -12, 4, 26, '#4A3A2A', { rx: 2 })]);
  }
  // 燈籠（暖光）
  function lantern(x, y, s, t, o = {}) {
    const k = 0.85 + 0.15 * wave(t, 2, o.ph || 0);
    return at(x, y, s, [circle(0, 0, 70, '#FFD27A', { opacity: f(0.18 * k) }), circle(0, 0, 42, '#FFD27A', { opacity: f(0.25 * k) }), line(0, -60, 0, -30, '#5A3A22', 3), ellipse(0, 0, 26, 32, o.color || '#E8453C'), rect(-12, -34, 24, 8, '#3A2A1A'), rect(-12, 26, 24, 8, '#3A2A1A'), ellipse(-7, -6, 6, 14, '#FFFFFF', { opacity: 0.25 })]);
  }
  // 土地公廟（小，紅牆、燕尾屋頂）與無字石碑
  function shrine(x, y, s = 1) {
    return at(x, y, s, [rect(-60, -90, 120, 90, P.brick), path('M-80 -90 L80 -90 L60 -120 L-60 -120 Z', P.roof), path('M-80 -92 q-24 -6 -30 -28 q14 10 34 14 Z M80 -92 q24 -6 30 -28 q-14 10 -34 14 Z', P.roofD), rect(-26, -66, 52, 66, '#3A2A1A', { rx: 4 }), rect(-20, -60, 40, 30, '#E9C46A', { opacity: 0.5 }), rect(-70, 0, 140, 12, '#B8AA90')]);
  }
  function tablet(x, y, s = 1) {
    return at(x, y, s, [path('M-50 0 L-50 -170 Q0 -200 50 -170 L50 0 Z', '#B9B4A6'), path('M-38 -12 L-38 -160 Q0 -184 38 -160 L38 -12 Z', '#CBC6B8'), rect(-70, 0, 140, 16, '#A39E90', { rx: 4 })]);
  }

  // ───────── 人物 ─────────
  // 每個角色固定長相（全片一致）。黑狗兄的 shirt 在第 3 章起改 'yellow'。
  const CHAR = {
    heigou: { skin: '#E2A877', hair: '#2B2320', style: 'spiky', shirt: '#6FA8DC', sleeve: 'short', pants: '#34495E', shoes: '#6B4A2F', brows: true, h: 1.0, w: 1.0 },
    aqing: { skin: '#F7D3B8', hair: '#3B2620', style: 'long', dress: '#2FA39A', collar: '#FFFDF7', ribbon: '#E8475F', shoes: '#C8443C', h: 0.95, w: 0.92 },
    f1: { skin: '#EBC09A', hair: '#1F1B1A', style: 'side', shirt: '#6BAA57', sleeve: 'long', pants: '#8C7A5B', shoes: '#3A2E25', glasses: true, h: 1.07, w: 0.95 },
    f2: { skin: '#D9A06E', hair: '#2A211C', style: 'cap', cap: '#2F4E7A', shirt: '#F2994A', sleeve: 'short', pants: '#4A4A4A', shoes: '#2E2A26', h: 0.98, w: 1.18 },
    f3: { skin: '#F0C7A4', hair: '#4A2F25', style: 'curly', shirt: '#9A73C2', sleeve: 'short', pants: '#3C4F66', shoes: '#5A3A2A', h: 0.93, w: 1.0 },
  };
  const SHIRT = { yellow: '#F6C631', blue: '#6FA8DC' };
  // 村民：seed 決定長相；opts.elder 長輩（白／灰髮）、opts.kid 小孩
  function villager(seed, o = {}) {
    const r = rng(seed * 31 + 7);
    const pick = a => a[Math.floor(r() * a.length)];
    const kid = !!o.kid, elder = kid ? false : (o.elder === undefined ? r() < 0.35 : o.elder);
    const female = o.female === undefined ? r() < 0.55 : o.female;
    const skin = pick(['#F3CBA8', '#E7B48C', '#D9A06E', '#F6D7BE']);
    const hair = elder ? pick(['#D9D6D0', '#B9B4AC', '#9C968E']) : pick(['#2A221E', '#3B2A22', '#1E1A18', '#5A3A28']);
    const top = pick(['#E86F5C', '#F2B84B', '#5CA4D8', '#7DBE6A', '#B489D6', '#F49AB0', '#4FB3A9', '#E9E2D0']);
    const bottom = pick(['#3E4E66', '#6A5848', '#4A4A52', '#8A6E52', '#2F5C66']);
    const style = female ? pick(elder ? ['bun', 'bob', 'bun'] : ['bob', 'long', 'bun', 'pony']) : pick(elder ? ['bald', 'short', 'cap'] : ['short', 'side', 'spiky', 'cap']);
    const spec = { skin, hair, style, shirt: top, sleeve: pick(['short', 'long']), pants: bottom, shoes: pick(['#3A2E25', '#6B4A2F', '#2E2A26', '#8A3A33']), h: kid ? 0.62 : (elder ? 0.93 : 0.95 + r() * 0.1), w: kid ? 0.9 : 0.95 + r() * 0.15, kid, elder, glasses: elder && r() < 0.5, cap: pick(['#C8443C', '#2F4E7A', '#E8B84B']) };
    if (female && r() < 0.5 && !kid) { spec.dress = top; spec.collar = '#FFFDF7'; }
    if (kid) { spec.style = female ? 'pony' : 'short'; spec.ribbon = '#F6C631'; }
    return Object.assign(spec, o.spec || {});
  }

  // 姿勢：回傳四肢角度（度；0＝向下，正值往畫面右，180＝向上）與身體上下位移
  // 每條手臂 [上臂, 前臂相對彎曲]；腿 [大腿, 小腿相對]；p 為動作相位（0..1，可用 cyc(t,k)）
  function poseAngles(pose, p = 0) {
    const s1 = Math.sin(TAU * p), c1 = Math.cos(TAU * p);
    const A = { aL: [-14, -8], aR: [14, 8], lL: [-4, 0], lR: [4, 0], dy: 0, tilt: 0 };
    switch (pose) {
      case 'stand': break;
      case 'walk': A.aL = [-6 + 22 * s1, -14]; A.aR = [6 - 22 * s1, 14]; A.lL = [-20 * s1, 6]; A.lR = [20 * s1, -6]; A.dy = -6 * Math.abs(c1); break;
      case 'sing': A.aL = [-38 - 6 * s1, -40]; A.aR = [38 + 6 * s1, 40]; A.tilt = 4 * s1; A.dy = -3 * Math.abs(s1); break;
      case 'singUp': A.aL = [-120 - 8 * s1, -20]; A.aR = [120 + 8 * s1, 20]; A.tilt = 3 * s1; break;
      case 'wave': A.aR = [150, 10 + 25 * s1]; A.aL = [-14, -8]; break;
      case 'point': A.aR = [138, 4]; A.aL = [-14, -10]; break;
      case 'shy': A.aR = [150, 70]; A.aL = [-10, 30]; A.tilt = -7; break;
      case 'clap': { const k = 0.5 + 0.5 * Math.sin(TAU * p * 2); A.aL = [-14, 30 + 60 * k]; A.aR = [14, -30 - 60 * k]; break; }
      case 'cheer': A.aL = [-150 - 10 * s1, 10]; A.aR = [150 + 10 * s1, -10]; A.dy = -10 * Math.max(0, s1); break;
      case 'jump': { const j = Math.max(0, Math.sin(TAU * p)); A.aL = [-150, 12]; A.aR = [150, -12]; A.lL = [-10 - 14 * j, 30 * j]; A.lR = [10 + 14 * j, -30 * j]; A.dy = -60 * j; break; }
      case 'dance': A.aL = [-110 + 40 * s1, -40]; A.aR = [70 + 40 * s1, 50]; A.lL = [-8 + 10 * s1, 10]; A.lR = [8 + 10 * s1, -10]; A.dy = -8 * Math.abs(s1); A.tilt = 6 * s1; break;
      case 'drum': { const hL = Math.max(0, Math.sin(TAU * p)), hR = Math.max(0, -Math.sin(TAU * p)); A.aL = [-30 - 6 * hL, 40 + 60 * hL]; A.aR = [30 + 6 * hR, -40 - 60 * hR]; A.lL = [-16, 6]; A.lR = [16, -6]; A.dy = -3 * (hL + hR); break; }
      case 'step': A.aL = [-30 + 20 * s1, -50]; A.aR = [30 + 20 * s1, 50]; A.lL = [-6 - 12 * Math.max(0, s1), 18 * Math.max(0, s1)]; A.lR = [6 + 12 * Math.max(0, -s1), -18 * Math.max(0, -s1)]; A.dy = -6 * Math.abs(s1); A.tilt = 3 * s1; break;
      case 'holdR': A.aR = [62, 18]; A.aL = [-14, -8]; break;     // 右手伸向右邊的人（牽手）
      case 'holdL': A.aL = [-62, -18]; A.aR = [14, 8]; break;     // 左手伸向左邊的人
      case 'holdBoth': A.aL = [-62, -18]; A.aR = [62, 18]; break;
      case 'carry': A.aL = [-10, 100]; A.aR = [10, -100]; break;    // 雙手捧在胸前（茶、椅子）
      case 'lift': A.aL = [-12, 70]; A.aR = [12, -70]; A.tilt = 4; break;   // 雙手往前下方抬東西（prop 'chair'）
      case 'sad': A.aL = [-6, -4]; A.aR = [6, 4]; A.tilt = 8; A.dy = 4; break;
      case 'water': A.aR = [70, 30]; A.aL = [-30, -60]; break;       // 澆水（右手拿澆水壺）
      case 'sweep': A.aL = [20 + 14 * s1, -40]; A.aR = [40 + 14 * s1, 30]; A.tilt = 6; break;
      case 'sit': A.aL = [-16, -60]; A.aR = [16, 60]; A.lL = [-70, 80]; A.lR = [-62, 74]; A.dy = 60; break;
      case 'crouch': A.aL = [-40, 50 + 10 * s1]; A.aR = [40, -50 - 10 * s1]; A.lL = [-70, 110]; A.lR = [70, -110]; A.dy = 52; A.tilt = 6; break;  // 蹲下拔草
      case 'reach': A.aR = [100, 6]; A.aL = [-14, -8]; break;     // 右手往前伸
      case 'fist': A.aR = [165, 25]; A.aL = [-14, -8]; break;      // 右手握拳舉高（下定決心）
      case 'hug': A.aL = [-40, 110]; A.aR = [40, -110]; break;
    }
    return A;
  }
  const pt = (x, y, a, L) => [x + L * Math.sin(a * Math.PI / 180), y + L * Math.cos(a * Math.PI / 180)];

  function hairBack(sp) {
    if (sp.style === 'long') return path('M-46 -262 Q-56 -200 -50 -168 Q-30 -160 0 -164 Q30 -160 50 -168 Q56 -200 46 -262 Z', sp.hair);
    if (sp.style === 'pony') return path('M30 -280 Q74 -270 62 -210 Q58 -232 40 -246 Z', sp.hair);
    if (sp.style === 'bob') return path('M-46 -262 Q-52 -220 -44 -206 L44 -206 Q52 -220 46 -262 Z', sp.hair);
    return '';
  }
  function hairFront(sp) {
    const c = sp.hair;
    switch (sp.style) {
      case 'spiky': return path('M-42 -252 Q-48 -292 -20 -300 L-14 -312 L-2 -298 L10 -314 L18 -298 L32 -306 L34 -290 Q48 -280 42 -250 Q30 -276 0 -276 Q-26 -276 -42 -252 Z', c);
      case 'long': return path('M-44 -248 Q-44 -296 0 -296 Q44 -296 44 -248 Q30 -270 6 -272 Q-6 -262 -28 -258 Q-36 -254 -44 -248 Z', c);
      case 'side': return path('M-43 -250 Q-46 -294 0 -294 Q42 -294 43 -252 Q34 -276 -6 -278 Q-26 -268 -43 -250 Z', c);
      case 'cap': return g([path('M-42 -258 Q-42 -300 0 -300 Q42 -300 42 -258 Z', sp.cap || '#2F4E7A'), path('M-10 -262 L62 -258 Q58 -248 -6 -252 Z', sp.cap || '#2F4E7A'), rect(-42, -262, 84, 8, '#FFFFFF', { opacity: 0.25 })]);
      case 'curly': return g([-30, -14, 2, 18, 32].map((xx, i) => circle(xx, -280 + (i % 2) * 8, 17, c)).concat([circle(-40, -258, 13, c), circle(40, -258, 13, c)]));
      case 'bun': return g([path('M-43 -250 Q-44 -294 0 -294 Q44 -294 43 -250 Q30 -272 0 -274 Q-30 -272 -43 -250 Z', c), circle(0, -300, 18, c)]);
      case 'bob': return path('M-44 -246 Q-46 -294 0 -294 Q46 -294 44 -246 Q20 -262 -10 -270 Q-30 -262 -44 -246 Z', c);
      case 'pony': return g([path('M-43 -250 Q-44 -294 0 -294 Q44 -294 43 -250 Q24 -270 0 -272 Q-24 -270 -43 -250 Z', c), circle(36, -268, 7, sp.ribbon || '#F6C631')]);
      case 'bald': return g([path('M-44 -246 Q-46 -262 -38 -270 L-34 -246 Z', c), path('M44 -246 Q46 -262 38 -270 L34 -246 Z', c)]);
      case 'short': default: return path('M-42 -252 Q-44 -294 0 -294 Q44 -294 42 -252 Q30 -270 0 -272 Q-30 -270 -42 -252 Z', c);
    }
  }
  function face(sp, o) {
    const ink = '#2B2320', out = [];
    const mouth = o.mouth || 'smile';
    if (o.eyes === 'closed' || mouth === 'laugh') out.push(path('M-20 -248 Q-14 -254 -8 -248 M8 -248 Q14 -254 20 -248', 'none', { stroke: ink, strokeWidth: 4, strokeLinecap: 'round' }));
    else if (o.eyes === 'up') out.push(ellipse(-14, -252, 4.6, 5.6, ink), ellipse(14, -252, 4.6, 5.6, ink), circle(-12.5, -254, 1.6, '#FFFFFF'), circle(15.5, -254, 1.6, '#FFFFFF'));
    else out.push(ellipse(-14, -247, 4.6, 5.6, ink), ellipse(14, -247, 4.6, 5.6, ink), circle(-12.5, -249, 1.6, '#FFFFFF'), circle(15.5, -249, 1.6, '#FFFFFF'));
    if (sp.brows) out.push(path(o.mouth === 'sad' ? 'M-22 -258 L-8 -262 M8 -262 L22 -258' : 'M-22 -261 Q-15 -266 -7 -262 M7 -262 Q15 -266 22 -261', 'none', { stroke: ink, strokeWidth: 4.5, strokeLinecap: 'round' }));
    else if (mouth === 'sad') out.push(path('M-20 -257 L-9 -260 M9 -260 L20 -257', 'none', { stroke: ink, strokeWidth: 3, strokeLinecap: 'round' }));
    if (sp.glasses) out.push(circle(-14, -247, 11, 'none', { stroke: '#3A3A3A', strokeWidth: 3 }), circle(14, -247, 11, 'none', { stroke: '#3A3A3A', strokeWidth: 3 }), line(-3, -248, 3, -248, '#3A3A3A', 3));
    if (mouth === 'open' || mouth === 'sing') out.push(ellipse(0, -226, 7, 8 + (o.mouthK || 0) * 3, '#8A3A33'), ellipse(0, -222, 4, 3, '#E77A7A'));
    else if (mouth === 'laugh' || mouth === 'grin') out.push(path('M-13 -231 Q0 -229 13 -231 Q10 -216 0 -216 Q-10 -216 -13 -231 Z', '#8A3A33'), path('M-8 -220 Q0 -215 8 -220', 'none', { stroke: '#E77A7A', strokeWidth: 3 }));
    else if (mouth === 'sad') out.push(path('M-10 -224 Q0 -232 10 -224', 'none', { stroke: ink, strokeWidth: 3.6, strokeLinecap: 'round' }));
    else if (mouth === 'o') out.push(ellipse(0, -226, 6, 7, '#8A3A33'));
    else out.push(path('M-12 -232 Q0 -222 12 -232', 'none', { stroke: ink, strokeWidth: 3.6, strokeLinecap: 'round' }));
    const bl = o.blush ? 0.95 : 0.55, br = o.blush ? 10 : 7;
    out.push(circle(-26, -232, br, '#F29C9C', { opacity: bl }), circle(26, -232, br, '#F29C9C', { opacity: bl }));
    if (o.blush) out.push(path('M-32 -236 l6 6 M-24 -237 l6 6 M20 -237 l6 6 M28 -236 l6 6', 'none', { stroke: '#E06A6A', strokeWidth: 2.4, strokeLinecap: 'round' }));
    return g(out);
  }
  // 畫一個人。who: 'heigou'|'aqing'|'f1'|'f2'|'f3' 或 villager() 的 spec。
  // o: {x, y（腳底）, s（比例，1＝高約 300px）, pose, p（動作相位）, mouth, eyes, blush, shirt（'yellow' 等）,
  //     rose（胸前別玫瑰）, suitcase, prop（'djembe'|'chair'|'tea'|'can'|'broom'|'flower'）, hit（鼓擊強度）, flip}
  function person(who, o = {}) {
    const sp = Object.assign({}, typeof who === 'string' ? CHAR[who] : who);
    if (o.shirt) sp.shirt = SHIRT[o.shirt] || o.shirt;
    const A = poseAngles(o.pose || 'stand', o.p || 0);
    if (o.angles) Object.assign(A, o.angles);
    const kid = sp.kid, headS = kid ? 1.22 : 1;
    const sx = (sp.w || 1), skin = sp.skin, top = sp.dress || sp.shirt;
    const out = [];
    // 影子
    out.push(ellipse(0, 4, 52 * sx, 10, '#000000', { opacity: 0.12 }));
    const body = [];
    // 後髮
    body.push(g(hairBack(sp), { transform: `rotate(${f(A.tilt)} 0 -200)` + (headS !== 1 ? ` translate(0 -200) scale(${headS}) translate(0 200)` : '') }));
    // 腿
    const legLen = 104, hipY = -104;
    for (const [side, ang] of [[-1, A.lL], [1, A.lR]]) {
      const hx = side * 17 * sx, k = pt(hx, hipY, ang[0], 54), ft = pt(k[0], k[1], ang[0] + ang[1], 52);
      const legCol = sp.dress ? skin : sp.pants;
      body.push(path(`M${f(hx)} ${hipY} L${f(k[0])} ${f(k[1])} L${f(ft[0])} ${f(ft[1])}`, 'none', { stroke: legCol, strokeWidth: sp.dress ? 15 : 24, strokeLinecap: 'round', strokeLinejoin: 'round' }));
      body.push(ellipse(ft[0] + side * 7, ft[1] + 2, 17, 9, sp.shoes || '#3A2E25'));
    }
    // 身體
    const sw = 36 * sx, hw = 40 * sx;
    if (sp.dress) {
      body.push(path(`M${f(-sw)} -196 Q0 -206 ${f(sw)} -196 L${f(hw - 2)} -120 L${f(hw + 18)} -44 Q0 -34 ${f(-hw - 18)} -44 L${f(-hw + 2)} -120 Z`, top, { stroke: top, strokeWidth: 8, strokeLinejoin: 'round' }));
      body.push(path(`M-16 -200 L0 -184 L16 -200`, 'none', { stroke: sp.collar || '#FFFDF7', strokeWidth: 8, strokeLinejoin: 'round', strokeLinecap: 'round' }));
      body.push(rect(-hw + 4, -124, (hw - 4) * 2, 8, '#000000', { opacity: 0.12 }));
    } else {
      body.push(path(`M${f(-sw)} -196 Q0 -206 ${f(sw)} -196 L${f(hw)} -104 Q0 -96 ${f(-hw)} -104 Z`, top, { stroke: top, strokeWidth: 10, strokeLinejoin: 'round' }));
      body.push(path(`M-12 -201 L0 -188 L12 -201`, 'none', { stroke: '#000000', strokeWidth: 4, opacity: 0.18, strokeLinejoin: 'round' }));
      body.push(rect(-hw, -112, hw * 2, 10, sp.pants, { opacity: 0.9 }));
    }
    if (o.rose) body.push(rose(18 * sx, -170, 0.5, 1));
    // 手上道具（畫在手臂下面）
    const hands = [];
    for (const [side, ang] of [[-1, A.aL], [1, A.aR]]) {
      const shx = side * 33 * sx, shy = -188;
      const e = pt(shx, shy, ang[0], 48), h = pt(e[0], e[1], ang[0] + ang[1], 46);
      hands.push(h);
      const sleeve = sp.sleeve === 'long' || sp.dress ? top : top;
      const fore = (sp.sleeve === 'long') ? top : skin;
      body.push(`<!--arm-->` + path(`M${f(shx)} ${shy} L${f(e[0])} ${f(e[1])}`, 'none', { stroke: sleeve, strokeWidth: 19, strokeLinecap: 'round' }));
      body.push(path(`M${f(e[0])} ${f(e[1])} L${f(h[0])} ${f(h[1])}`, 'none', { stroke: fore, strokeWidth: 15, strokeLinecap: 'round' }));
      body.push(circle(h[0], h[1], 10, skin));
    }
    // 頭（含脖子）
    const head = [rect(-10, -214, 20, 20, skin), circle(-41, -244, 9, skin), circle(41, -244, 9, skin), circle(0, -248, 44, skin), hairFront(sp), face(sp, o)];
    if (sp.style === 'long' && sp.ribbon) head.push(g([path('M24 -288 l16 -10 l2 18 Z M24 -288 l20 6 l-14 12 Z', sp.ribbon), circle(26, -286, 5, sp.ribbon)]));
    body.push(g(head, { transform: `rotate(${f(A.tilt)} 0 -200)` + (headS !== 1 ? ` translate(0 -200) scale(${headS}) translate(0 200)` : '') }));
    // 前景道具
    const fg = [];
    if (o.suitcase) { const h = hands[1]; fg.push(g([rect(h[0] - 30, h[1] + 8, 60, 70, '#A0623A', { rx: 8 }), rect(h[0] - 30, h[1] + 30, 60, 8, '#7E4A27'), path(`M${f(h[0] - 12)} ${f(h[1] + 8)} L${f(h[0] - 12)} ${f(h[1] - 4)} L${f(h[0] + 12)} ${f(h[1] - 4)} L${f(h[0] + 12)} ${f(h[1] + 8)}`, 'none', { stroke: '#5E3A22', strokeWidth: 5 })])); }
    if (o.prop === 'tea') { const m = [(hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2]; fg.push(g([rect(m[0] - 16, m[1] - 22, 32, 30, '#FFFDF7', { rx: 6 }), path(`M${f(m[0] + 16)} ${f(m[1] - 14)} q14 2 0 16`, 'none', { stroke: '#FFFDF7', strokeWidth: 4 }), path(`M${f(m[0] - 6)} ${f(m[1] - 30)} q-6 -10 0 -20 M${f(m[0] + 6)} ${f(m[1] - 30)} q-6 -10 0 -20`, 'none', { stroke: '#FFFFFF', strokeWidth: 3, opacity: 0.7, strokeLinecap: 'round' })])); }
    if (o.prop === 'can') { const h = hands[1]; fg.push(g([rect(h[0] - 6, h[1] - 6, 46, 36, '#5CA4D8', { rx: 6 }), path(`M${f(h[0] + 38)} ${f(h[1] + 4)} L${f(h[0] + 74)} ${f(h[1] - 18)}`, 'none', { stroke: '#5CA4D8', strokeWidth: 8, strokeLinecap: 'round' })])); }
    if (o.prop === 'broom') { const h = hands[1]; fg.push(g([line(h[0], h[1] - 60, h[0] + 20, h[1] + 110, '#B98559', 7), path(`M${f(h[0] + 4)} ${f(h[1] + 104)} l-24 50 l70 0 l-18 -50 Z`, '#D9B75E')])); }
    if (o.prop === 'flower') { const h = hands[1]; fg.push(rose(h[0], h[1] - 10, 0.6, 1)); }
    if (o.prop === 'chair') { const m = [(hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2]; fg.push(chair(m[0], m[1] + 70, 0.9, { fallen: o.chairTilt || 0 })); }
    if (o.prop === 'hammer') { const h = hands[1]; fg.push(g([line(h[0], h[1] + 10, h[0] + 6, h[1] - 50, '#B98559', 7), rect(h[0] - 14, h[1] - 66, 34, 18, '#6B6F78', { rx: 3 })])); }
    if (o.prop === 'mic') { const h = hands[1]; fg.push(g([line(h[0], h[1], h[0] - 6, h[1] - 40, '#333', 6), circle(h[0] - 7, h[1] - 46, 10, '#555')])); }
    let drum = '';
    if (o.prop === 'djembe') drum = djembe(0, 2, 0.64, o.hit || 0);
    const scale = (o.s || 1) * (sp.h || 1);
    const sc = `scale(${f((o.flip ? -1 : 1) * scale * 1000) / 1000} ${f(scale * 1000) / 1000})`;
    return g([g(out, { transform: `translate(${f(o.x || 0)} ${f(o.y || 0)}) ${sc}` }),
      g(o.prop === 'djembe' ? reorderForDrum(body, drum, fg) : [body.map(b => String(b).replace('<!--arm-->', '')), fg], { transform: `translate(${f(o.x || 0)} ${f((o.y || 0) + A.dy * scale)}) ${sc}` })]);
  }
  function reorderForDrum(body, drum, fg) {
    // body 內順序：後髮、腿、身體、(玫瑰)、[上臂、前臂、手]×2、頭。鼓蓋住腿，手臂與頭在鼓之前。
    const s = body.map(b => String(b));
    const idxArm = s.findIndex(b => b.startsWith('<!--arm-->'));
    const before = s.slice(0, idxArm), after = s.slice(idxArm).map(b => b.replace('<!--arm-->', ''));
    return [before, drum, after, fg];
  }
  // 一排觀眾／合唱團（簡化小人，遠景用）：n 人，seed，從 x0 到 x1，腳底 y，比例 s，pose 函數 (i)=>{pose,p}
  function crowd(seed, n, x0, x1, y, s, t, o = {}) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const sp = villager(seed + i * 13, { elder: o.elder ? (i % 3 === 0) : undefined, kid: o.kids ? (i % 4 === 1) : false });
      const u = n === 1 ? 0.5 : i / (n - 1), x = lerp(x0, x1, u) + (o.jitter || 0) * (((i * 37) % 11) / 11 - 0.5);
      const pp = o.pose ? o.pose(i) : { pose: 'stand' };
      out.push(person(sp, Object.assign({ x, y: y + (o.dy ? o.dy(i) : 0), s: s * (sp.kid ? 1 : 1) }, pp, { p: pp.p === undefined ? loop(t, 1, i * 0.13) : pp.p })));
    }
    return g(out);
  }

  // ───────── 場景註冊 ─────────
  // 每個場景：scene('c1a', 3.2, t => J([...]))；dur 為秒（建議 3.2 = 40 格）
  function scene(id, dur, draw) { W.SCENES[id] = { dur, draw: t => J(draw(t)), file: W.__file }; }

  W.SCENES = W.SCENES || {};
  W.RC = {
    TAU, P, SKY, CHAR, SHIRT, rng, cyc, wave, loop, lerp, clamp, ease, bump, fadeLoop, beat, J, f,
    attrs, rect, circle, ellipse, path, line, poly, g, tr, at, smooth, uid,
    sky, sun, moon, stars, cloud, ridge, hill, peak, ground, tufts, paddies, road,
    tree, bamboo, flowerDots, rose, roseBush, sanheyuan, schoolhouse, village,
    sparkle, heart, note, noteStream, bird, rain, splashes, rainbow, bunting, confetti, chair, stage, puddle, djembe,
    flash, shootingStar, speech, thought, petals, waterArc, butterfly, lantern, shrine, tablet,
    villager, poseAngles, person, crowd, scene,
  };
})(window);
