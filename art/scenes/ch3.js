// 第 3 章〈情人的黃襯衫〉（非洲鼓＋擊鼓有氧）。黑狗兄從這章起穿黃襯衫，沒有玫瑰。
// 場景配置（STYLE 5.5）：村口＝大榕樹（畫面左）＋樹下的小土地公廟＋樹旁的無字石碑，旁邊是通往村子的小路（往畫面右後方）。
(function () {
  const R = RC, P = R.P;

  // 地面（lib 的 ground() 最後一點在 x 1880，右緣會斜下去露出後面；這個版本鋪到 x 2000）
  function gnd(y, color, o = {}) {
    const pts = [];
    for (let x = -40; x <= 2080; x += 120) pts.push([x, y + (o.amp || 10) * Math.sin(x / 260 + (o.ph || 0))]);
    return R.path(R.smooth(pts) + ' L2080 1100 L-40 1100 Z', color);
  }

  function sparkles(pts, t, k = 2, col = '#FFE680') {
    return R.g(pts.map(([x, y, r], i) => R.sparkle(x, y, r, col, 0.35 + 0.65 * (0.5 + 0.5 * R.wave(t, k, i / pts.length)))));
  }
  // 愛心一串往上飄（每顆生命 0→1 淡入淡出）
  function heartStream(x, y, dx, dy, n, t, s = 1, k = 1) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = R.loop(t, k, i / n);
      out.push(R.heart(x + dx * u + 22 * R.wave(u, 1, i * 0.37), y + dy * u, s * (0.75 + 0.35 * ((i * 5) % 3) / 2), i % 2 ? P.heart : P.roseL, { opacity: R.f(R.fadeLoop(u)) }));
    }
    return R.g(out);
  }
  // 包好的禮物盒（回憶泡泡用）
  function gift(x, y, s) {
    return R.at(x, y, s, [
      R.rect(-34, -50, 68, 50, '#E8475F', { rx: 4 }), R.rect(-38, -62, 76, 16, '#C2304F', { rx: 4 }),
      R.rect(-6, -62, 12, 62, '#F6C631'),
      R.path('M0 -62 q-26 -26 -30 -6 q4 8 30 6 Z M0 -62 q26 -26 30 -6 q-4 8 -30 6 Z', '#F6C631'),
    ]);
  }
  // 村口一組：榕樹、樹下土地公廟、樹旁無字石碑（相對位置固定，整組可移動縮放）
  function gate(x, y, s, t) {
    return R.g([
      R.tree(x, y, s, t, { kind: 'banyan', ph: 0.1, sway: 5 }),
      R.shrine(x - 270 * s, y + 6 * s, 0.95 * s),
      R.tablet(x + 250 * s, y + 10 * s, 0.9 * s),
    ]);
  }
  // 早晨村口的背景：天、遠山、遠方的村子、草地、往村子的小路
  function morning(t, o = {}) {
    const hz = o.hz || 640;
    return [
      R.sky('dawn', hz),
      R.sun(o.sunX || 1660, o.sunY || 210, 60, t, { rays: 10 }),
      R.cloud(980 + 12 * R.wave(t), 150, 0.7), R.cloud(1500 + 10 * R.wave(t, 1, 0.5), 300, 0.5),
      R.ridge({ y: hz - 70, amp: 36, seed: 91, color: P.mtFar }),
      R.ridge({ y: hz - 10, amp: 14, seed: 92, color: P.mtNear }),
      R.village(o.vx || 1600, hz, 0.46, t),
      gnd(hz, P.grass, { amp: 6 }),
      R.road(o.road || [[1420, hz + 4], [1330, hz + 30], [1230, hz + 80], [1190, hz + 160], [1260, hz + 280], [1420, 1100]], 16, 360),
      R.tufts(93, 26, 0, 1920, hz + 40, 1060, t, { color: P.grassDD, size: 1.2, still: true }),
    ];
  }

  // ── c3a：早晨的村口，大榕樹下，黑狗兄第一次穿黃襯衫，望著小路等人（微微踮腳）
  R.scene('c3a', 3.2, t => [
    morning(t),
    gate(470, 735, 1.05, t),
    R.flowerDots(31, 14, 1300, 1800, 760, 900, { size: 1.2 }),
    R.person('heigou', { x: 1000, y: 760, s: 1.0, pose: 'stand', shirt: 'yellow', eyes: 'up',
      angles: { aL: [-18, 46], aR: [18, -46], dy: -10 * (0.5 + 0.5 * R.wave(t, 2)), tilt: 4 } }),   // 拉拉新襯衫的下襬、踮腳望小路
    R.butterfly(1330 + 60 * R.wave(t, 1), 560 + 30 * R.wave(t, 2, 0.2), 1.3, t, 6),
    R.bird(R.lerp(2000, -80, R.cyc(t)), 280 + 18 * R.wave(t, 1), 0.8, t, 4), R.bird(R.lerp(2100, 20, R.cyc(t)), 320 + 18 * R.wave(t, 1, 0.3), 0.6, t, 4, 0.3),
  ]);

  // ── c3b：阿晴走到黑狗兄面前，指著他的黃襯衫笑了；黃襯衫旁閃光，黑狗兄有點不好意思
  R.scene('c3b', 3.2, t => [
    morning(t),
    gate(420, 735, 1.05, t),
    R.person('heigou', { x: 900, y: 770, s: 1.02, pose: 'stand', shirt: 'yellow', blush: true, mouth: 'smile',
      angles: { aL: [-10, 28], aR: [10, -28], tilt: -3 + 1.5 * R.wave(t, 1) } }),
    sparkles([[808, 560, 26], [990, 520, 30], [1000, 640, 20], [800, 660, 18]], t),
    R.person('aqing', { x: 1095, y: 770, s: 1.0, pose: 'stand', flip: true, mouth: 'laugh',
      angles: { aR: [72, 14], aL: [-12, -26], tilt: 4 * R.wave(t, 2), dy: -5 * (0.5 + 0.5 * R.wave(t, 2)) } }),
    R.butterfly(1420 + 50 * R.wave(t, 1, 0.3), 520 + 26 * R.wave(t, 2), 1.2, t, 6, '#F57D96'),
  ]);

  // ── c3c：近景，黑狗兄害羞抓頭、臉紅；阿晴雙手在胸前微笑看他；愛心飄在兩人中間。回憶泡泡：阿晴遞出包好的禮物
  R.scene('c3c', 3.2, t => [
    morning(t, { hz: 600, vx: 1700, road: [[1500, 604], [1440, 630], [1380, 690], [1400, 800], [1500, 1100]] }),
    R.tree(170, 790, 1.12, t, { kind: 'banyan', ph: 0.1, sway: 5 }),
    R.person('heigou', { x: 760, y: 800, s: 1.2, pose: 'shy', shirt: 'yellow', blush: true, mouth: 'grin',
      angles: { aR: [150, 70 + 10 * R.wave(t, 2)], tilt: -7 + 2 * R.wave(t, 2) } }),
    R.person('aqing', { x: 1120, y: 800, s: 1.18, pose: 'carry', mouth: 'smile', blush: true,
      angles: { tilt: 5 + 2 * R.wave(t, 1) } }),
    heartStream(942, 640, 0, -330, 5, t, 1.4),
    // 回憶泡泡：離鄉前，阿晴把包好的禮物遞給黑狗兄
    R.thought(1560, 230, 240, 150, 1190, 400, R.g([
      R.ellipse(1560, 330, 190, 22, '#B9DC94'),
      R.person('heigou', { x: 1470, y: 334, s: 0.5, pose: 'reach', mouth: 'o', shirt: 'blue',
        angles: { aR: [70, 30] } }),
      R.person('aqing', { x: 1650, y: 334, s: 0.5, pose: 'reach', flip: true, mouth: 'smile', blush: true,
        angles: { aR: [76 + 4 * R.wave(t, 1), 20] } }),
      gift(1560, 268 + 3 * R.wave(t, 1), 0.62),
    ])),
  ]);

  // ── c3d：三位好友敲非洲鼓起鬨；黑狗兄（臉紅）和阿晴在中間跟著節奏踏步擺動；愛心、音符隨鼓點跳出
  function drummer(who, x, y, s, t) {
    return R.person(who, { x, y, s, pose: 'drum', p: R.cyc(t, 2), prop: 'djembe', hit: R.beat(t, 4), mouth: 'laugh' });
  }
  R.scene('c3d', 3.2, t => [
    morning(t, { hz: 560, vx: 1660, sunX: 1560, sunY: 170, road: [[1440, 564], [1360, 590], [1300, 640], [1330, 720], [1480, 1100]] }),
    gate(240, 650, 0.86, t),
    drummer('f1', 560, 636, 0.84, t),
    drummer('f2', 970, 616, 0.82, t),
    drummer('f3', 1390, 636, 0.84, t),
    R.person('heigou', { x: 815, y: 700, s: 0.95, pose: 'step', p: R.cyc(t, 2), shirt: 'yellow', blush: true, mouth: 'grin' }),
    R.person('aqing', { x: 1125, y: 700, s: 0.94, pose: 'step', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
    heartStream(970, 330, 0, -240, 4, t, 1.2, 1),
    R.noteStream(610, 320, -90, -240, 4, t, { s: 0.9 }),
    R.noteStream(1440, 350, 90, -260, 4, t, { s: 0.9 }),
    beatPops(t),
  ]);
  // 每一拍在三個鼓上方跳出一個音符或愛心（跟 beat(t,4)）
  function beatPops(t) {
    const spots = [[560, 300], [970, 330], [1390, 330], [970, 330]];
    const i = Math.floor(R.cyc(t, 1) * 4) % 4, u = R.cyc(t, 4), [x, y] = spots[i];
    const sc = 0.6 + 0.6 * Math.sin(Math.PI * Math.min(1, u * 1.6)), op = R.f(1 - u * u);
    return i === 1 || i === 3 ? R.heart(x + (i === 1 ? -60 : 60), y - 80 * u, 1.5 * sc, P.heart, { opacity: op })
      : R.note(x, y - 80 * u, 1.1 * sc, i === 0 ? P.noteGold : P.noteRed, 0, { opacity: op });
  }

  // ── s3：歌曲頁〈情人的黃襯衫〉非洲鼓＋擊鼓有氧。右半邊一排大鼓隨拍子發光，黑狗兄和阿晴在鼓前跳舞
  R.scene('s3', 3.2, t => {
    const hit = R.beat(t, 4);
    const drums = [[1020, 760, 1.0, 0], [1240, 740, 1.05, 1], [1470, 730, 1.08, 2], [1700, 740, 1.05, 3]];
    return [
      R.sky('golden', 720),
      R.circle(1420, 520, 330, '#FFE3A0', { opacity: 0.35 }), R.circle(1420, 520, 230, '#FFEDBE', { opacity: 0.45 }),
      R.cloud(1820 + 10 * R.wave(t), 200, 0.55, { shade: '#F8DDBA' }), R.cloud(1080 + 10 * R.wave(t, 1, 0.5), 150, 0.5, { shade: '#F8DDBA' }),
      R.ridge({ y: 690, amp: 30, seed: 95, color: '#C9B99A' }),
      gnd(740, '#C9A86A', { amp: 6 }),
      gnd(800, '#B9955A', { amp: 4, ph: 1 }),
      // 節奏光圈（鼓後面，每拍擴散一次）
      rings(1420, 640, t),
      // 彩旗串左端綁在一根木竿上（竿腳在第一個鼓後面），右端拉出畫面外
      R.rect(978, 306, 14, 444, P.woodD, { rx: 5 }), R.circle(985, 304, 11, P.wood),
      R.bunting(985, 320, 1960, 296, 70, 9, t),
      drums.map(([x, y, s, k]) => R.djembe(x, y, s, k % 2 === Math.floor(R.cyc(t, 1) * 4) % 2 ? hit : hit * 0.5)),
      // 兩人牽著手跳舞：內側的手（黑狗兄右手、阿晴翻面後的右手）碰在一起，外側的手跟著節奏舉高
      // 手的位置算過：黑狗兄 aR [62,18] 手在 (+118, −154)，阿晴 aR [69.5,18]×0.912 在 (−111, −154)，中心相距 229
      R.person('heigou', { x: 1300, y: 1000, s: 0.98, pose: 'dance', p: R.cyc(t, 2), shirt: 'yellow', mouth: 'laugh', blush: true, angles: { aR: [62, 18] } }),
      R.person('aqing', { x: 1529, y: 1000, s: 0.96, pose: 'dance', p: R.loop(t, 2, 0.5), flip: true, mouth: 'laugh', angles: { aR: [69.5, 18] } }),
      R.noteStream(1120, 560, 80, -420, 5, t, { s: 1.2 }),
      R.noteStream(1800, 560, 60, -420, 5, t, { s: 1.1 }),
      sparkles([[1100, 380, 22], [1860, 420, 20], [1420, 260, 18]], t, 4),
    ];
  });
  function rings(x, y, t) {
    const u = R.cyc(t, 4), out = [];
    for (let i = 0; i < 2; i++) {
      const v = (u + i * 0.5) % 1;
      out.push(R.ellipse(x, y, 260 + 300 * v, 120 + 140 * v, 'none', { stroke: '#FFE7A0', strokeWidth: 10, opacity: R.f(0.8 * (1 - v)) }));
    }
    return R.g(out);
  }
})();
