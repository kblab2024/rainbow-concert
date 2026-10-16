// 第 2 章〈鄉間小路〉（合唱）。黑狗兄藍襯衫；阿晴提行李（c2c 由黑狗兄提）。
// 場景配置（STYLE 5.5）：小路穿過稻田，遠方是竹林與三合院（village），遠山可以看到黑狗兄的山（peak）。
(function () {
  const R = RC, P = R.P;

  // 地面（lib 的 ground() 最後一點在 x 1880，右緣會斜下去露出後面；這個版本鋪到 x 2000）
  function gnd(y, color, o = {}) {
    const pts = [];
    for (let x = -40; x <= 2080; x += 120) pts.push([x, y + (o.amp || 10) * Math.sin(x / 260 + (o.ph || 0))]);
    return R.path(R.smooth(pts) + ' L2080 1100 L-40 1100 Z', color);
  }

  // 一圈閃光（每顆錯開閃）：pts = [[x, y, r], …]
  function sparkles(pts, t, k = 2, col = '#FFE680') {
    return R.g(pts.map(([x, y, r], i) => R.sparkle(x, y, r, col, 0.35 + 0.65 * (0.5 + 0.5 * R.wave(t, k, i / pts.length)))));
  }
  // 驚訝的放射短線（頭旁）
  function surprise(x, y, s, t) {
    const k = 1 + 0.12 * R.wave(t, 2);
    const ls = [[-150, 0], [-120, -40], [-90, -60]].map(([a, d]) => {
      const r = a * Math.PI / 180, r0 = 70 * s, r1 = (70 + 34 * k) * s;
      return R.line(x + Math.cos(r) * r0, y + Math.sin(r) * r0 + d * 0, x + Math.cos(r) * r1, y + Math.sin(r) * r1, P.inkSoft, 6 * s);
    });
    return R.g(ls);
  }
  // 小孩版的主角（回憶泡泡用）
  const kidOf = who => Object.assign({}, R.CHAR[who], { kid: true, h: 0.62 });
  // 竹林一叢（遠景）
  const grove = (x, y, s, t, seed) => R.bamboo(x, y, s, t, { n: 5, seed, ph: seed * 0.07 });

  // ── c2a：午後的鄉間小路蜿蜒穿過稻田；黑狗兄走在路上，小路遠端有一個提行李的小小身影在閃光裡
  const ROAD_A = [[1330, 596], [1230, 618], [1080, 656], [930, 704], [800, 770], [700, 860], [660, 970], [700, 1100]];
  R.scene('c2a', 3.2, t => [
    R.sky('day', 600),
    R.sun(1720, 160, 58, t),
    R.cloud(560 + 14 * R.wave(t), 190, 0.8), R.cloud(1180 + 12 * R.wave(t, 1, 0.4), 120, 0.6),
    R.ridge({ y: 520, amp: 40, seed: 52, color: P.mtFar }),
    R.peak(380, 610, 0.55, 'day', t),
    R.ridge({ y: 590, amp: 16, seed: 53, color: P.mtNear }),
    grove(1180, 600, 0.5, t, 4),
    R.village(1580, 596, 0.52, t),
    gnd(592, P.grass, { amp: 4 }),
    R.paddies(604, 1060, t, { rows: 7 }),
    R.road(ROAD_A, 18, 380),
    R.flowerDots(7, 14, 560, 1000, 760, 1060, { size: 1.2 }),
    // 遠端那個熟悉的身影
    R.person('aqing', { x: 1322, y: 604, s: 0.35, pose: 'stand', suitcase: true }),
    sparkles([[1262, 492, 26], [1390, 470, 32], [1405, 556, 20], [1240, 566, 18]], t),
    // 黑狗兄走在路上（原地走）
    R.person('heigou', { x: 800, y: 742, s: 0.95, pose: 'walk', p: R.cyc(t, 2), shirt: 'blue', eyes: 'up' }),
    R.bird(R.lerp(-80, 2000, R.cyc(t)), 300 + 18 * R.wave(t, 1), 0.85, t, 4), R.bird(R.lerp(-180, 1900, R.cyc(t)), 330 + 18 * R.wave(t, 1, 0.3), 0.65, t, 4, 0.3),
  ]);

  // ── c2b：近景，阿晴提著行李站在小路上笑著揮手；左邊露出黑狗兄驚訝的半身。葉子隨風飄
  const ROAD_B = [[1470, 580], [1390, 600], [1280, 636], [1170, 694], [1110, 776], [1120, 890], [1210, 1100]];
  R.scene('c2b', 3.2, t => [
    R.sky('day', 560),
    R.cloud(820 + 12 * R.wave(t), 170, 0.75), R.cloud(1620 + 10 * R.wave(t, 1, 0.5), 130, 0.6),
    R.ridge({ y: 500, amp: 36, seed: 61, color: P.mtFar }),
    R.peak(700, 590, 0.42, 'day', t),
    R.ridge({ y: 570, amp: 14, seed: 62, color: P.mtNear }),
    grove(1880, 580, 0.45, t, 6),
    R.village(1560, 578, 0.42, t),
    gnd(574, P.grass, { amp: 4 }),
    R.paddies(586, 1060, t, { rows: 7 }),
    R.road(ROAD_B, 16, 440),
    R.flowerDots(9, 12, 1300, 1700, 700, 1000, { size: 1.3 }),
    // 阿晴：右手提行李，左手揮
    R.person('aqing', { x: 1150, y: 772, s: 1.1, pose: 'stand', suitcase: true, mouth: 'laugh',
      angles: { aL: [-150, -14 - 26 * R.wave(t, 2)], aR: [8, 4], tilt: -3 + 2 * R.wave(t, 2) } }),
    // 黑狗兄驚訝的半身（下半身在文字卡後面）
    R.person('heigou', { x: 330, y: 930, s: 1.32, pose: 'stand', shirt: 'blue', mouth: 'o',
      angles: { aL: [-34, -96], aR: [34, 96], dy: -4 * (0.5 + 0.5 * R.wave(t, 2)) } }),
    surprise(330, 930 - 1.32 * 250, 1.32, t),
    R.petals(71, 12, t, { colors: [P.leafL, P.leafLL, '#B7D86F'], x0: 400, x1: 1900, y0: 140, y1: 760 }),
  ]);

  // ── c2c：金黃的午後，兩人並肩走在田埂上；黑狗兄替阿晴提行李，阿晴眼睛發亮；回憶泡泡：兩個小孩在大樹下玩
  R.scene('c2c', 3.2, t => [
    R.sky('golden', 540),
    R.sun(330, 300, 66, t, { rays: 10 }),
    R.cloud(760 + 12 * R.wave(t), 140, 0.6, { shade: '#F8DDBA' }),
    R.ridge({ y: 480, amp: 34, seed: 71, color: '#C9B99A' }),
    R.peak(760, 560, 0.45, 'golden', t),
    R.ridge({ y: 540, amp: 12, seed: 72, color: '#A8B98A' }),
    R.village(250, 552, 0.42, t),
    R.paddies(552, 660, t, { rows: 4, color: P.paddyGold, colorD: '#D4AE45', base: '#EBD58A' }),
    // 田埂
    R.path(R.smooth([[-40, 668], [400, 660], [900, 664], [1400, 660], [1960, 668]]) + ' L1960 718 L-40 718 Z', P.dike),
    R.path(R.smooth([[-40, 668], [400, 660], [900, 664], [1400, 660], [1960, 668]]) + ' L1960 678 L-40 678 Z', '#D9C58E'),
    R.paddies(718, 1060, t, { rows: 5, color: P.paddyGold, colorD: '#D4AE45', base: '#EBD58A', still: true }),
    R.tufts(73, 18, 0, 1920, 676, 706, t, { color: '#8A9A4F', size: 0.9, still: true }),
    R.person('heigou', { x: 830, y: 692, s: 0.86, pose: 'walk', p: R.cyc(t, 2), shirt: 'blue', suitcase: true, mouth: 'open' }),
    R.person('aqing', { x: 1010, y: 692, s: 0.86, pose: 'walk', p: R.loop(t, 2, 0.5), eyes: 'up', mouth: 'open', blush: true }),
    sparkles([[1068, 380, 22], [1100, 450, 14], [950, 360, 13], [1110, 330, 11]], t),
    // 回憶泡泡
    R.thought(1480, 240, 250, 150, 1040, 400, memory(t)),
  ]);
  // 回憶泡泡的內容：大樹下兩個小孩（小黑狗兄、小阿晴）在玩
  function memory(t) {
    return R.g([
      R.ellipse(1480, 336, 200, 26, '#B9DC94'),
      R.tree(1480, 336, 0.82, t, { kind: 'round', ph: 0.2 }),
      R.person(kidOf('heigou'), { x: 1370, y: 340, s: 0.5, pose: 'jump', p: R.cyc(t, 2), shirt: 'blue', mouth: 'laugh' }),
      R.person(kidOf('aqing'), { x: 1592, y: 340, s: 0.5, pose: 'cheer', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
    ]);
  }

  // ── s2：歌曲頁〈鄉間小路〉合唱。夕陽，金黃稻田裡的小路往遠方山丘延伸；村民在右半邊的路上邊走邊唱
  const ROAD_S = [[1500, 640], [1440, 664], [1340, 704], [1250, 770], [1220, 860], [1260, 960], [1360, 1100]];
  R.scene('s2', 3.2, t => [
    R.sky('golden', 620),
    R.sun(1560, 470, 96, t, { rays: 0, color: '#FFC470', core: '#FFE2A8' }),
    R.cloud(1140 + 10 * R.wave(t), 200, 0.65, { color: '#FCE3C4', shade: '#F2C9A2' }), R.cloud(1800 + 10 * R.wave(t, 1, 0.5), 300, 0.55, { color: '#FCE3C4', shade: '#F2C9A2' }),
    R.ridge({ y: 590, amp: 30, seed: 81, color: '#C9B99A' }),
    R.hill(1520, 650, 900, 130, '#A8B98A'),
    R.ridge({ y: 640, amp: 10, seed: 82, color: '#9DB07E', x0: -40 }),
    R.village(1740, 646, 0.36, t, { lit: true }),
    R.paddies(652, 1060, t, { rows: 7, color: P.paddyGold, colorD: '#D4AE45', base: '#EBD58A' }),
    R.road(ROAD_S, 18, 470),
    singers(t),
    R.noteStream(1180, 640, 300, -420, 6, t, { s: 1.15 }),
    R.noteStream(1600, 600, 220, -400, 5, t, { s: 1.0 }),
  ]);
  // 路上邊走邊唱的人（遠小近大）。黑狗兄在前排（藍襯衫面積夠大，GIF 調色盤才會留住這個藍）；
  // 村民不穿青綠／藍色上衣，免得和黑狗兄的藍襯衫、阿晴的青綠洋裝混在一起
  function singers(t) {
    const ppl = [
      [R.villager(204, { kid: true }), 1520, 688, 0.36],
      [R.villager(207, { elder: true, female: true }), 1600, 698, 0.38],
      [R.villager(211, { elder: true, spec: { shirt: '#B489D6' } }), 1150, 800, 0.56],
      ['aqing', 1290, 812, 0.58],
      [R.villager(205, { elder: true, female: true, spec: { shirt: '#F49AB0', dress: '#F49AB0' } }), 1100, 990, 0.82],
      [R.villager(203, { kid: true, female: true }), 1250, 1004, 0.8],
      ['heigou', 1410, 1000, 0.86],
      [R.villager(209, { elder: true }), 1580, 990, 0.84],
      [R.villager(202, { female: true }), 1740, 960, 0.78],
    ];
    return R.g(ppl.map(([w, x, y, s], i) => R.person(w, { x, y, s, pose: 'walk', p: R.loop(t, 2, i * 0.13), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.2), shirt: w === 'heigou' ? 'blue' : undefined })));
  }
})();
