// 第 8 章〈飛躍的彩虹〉（非洲鼓＋擊鼓有氧），另含結尾頁 end。
// 場景：老學堂庭院（學堂在後方中間、大榕樹在左、玫瑰花圃在右前方、舞台在學堂前）；彩虹跨過黑狗兄的山 peak()。
(function () {
  const R = RC, P = R.P;
  const pt = (x, y, a, L) => [x + L * Math.sin(a * Math.PI / 180), y + L * Math.cos(a * Math.PI / 180)];

  // ── 第 8 章的村民（同一個鄰居同一個 seed）
  const V = {
    grandpa: R.villager(801, { elder: true, female: false }),
    grandma: R.villager(802, { elder: true, female: true }),
    kid: R.villager(803, { kid: true, female: false }),
    mom: R.villager(804, { elder: false, female: true }),
    dad: R.villager(805, { elder: false, female: false, spec: { style: 'short', shirt: '#E9E2D0' } }),   // 不戴藍帽、不穿橘衣（避免像 f2）
    auntie: R.villager(806, { elder: true, female: true }),
    girl: R.villager(807, { kid: true, female: true }),
    uncle: R.villager(808, { elder: false, female: false }),
    granny: R.villager(809, { elder: true, female: true }),
    elder2: R.villager(810, { elder: true, female: false }),
    lady: R.villager(811, { elder: false, female: true }),
  };
  const HG = { shirt: 'yellow', rose: true };   // 黑狗兄這章的服裝（story.json heigou）

  // ── 區域零件
  // 某人某隻手的世界座標（side 1＝右手 aR，-1＝左手 aL）；算法同 lib person()
  function handAt(who, o, side) {
    const sp = typeof who === 'string' ? R.CHAR[who] : who;
    const A = R.poseAngles(o.pose || 'stand', o.p || 0);
    if (o.angles) Object.assign(A, o.angles);
    const sx = sp.w || 1, ang = side > 0 ? A.aR : A.aL;
    const e = pt(side * 33 * sx, -188, ang[0], 48), h = pt(e[0], e[1], ang[0] + ang[1], 46);
    const sc = (o.s || 1) * (sp.h || 1);
    return [o.x + h[0] * sc, o.y + (h[1] + A.dy) * sc];
  }
  // 黑狗兄（左）牽著阿晴（右）：兩人相牽的手高舉；阿晴的位置與上下位移由黑狗兄的手算出，手一定碰在一起
  // o.stand：站著牽手（手放低、阿晴不上下位移）；否則一起跳、相牽的手高舉
  function couple(x, y, s, p, o = {}) {
    const pose = o.pose || (o.stand ? 'stand' : 'jump');
    const aR = o.stand ? [62, 18] : [118, 12], aL = [-aR[0], -aR[1]];
    const oH = Object.assign({ x, y, s, pose, p, mouth: o.mouthH || 'laugh', eyes: o.eyes, angles: Object.assign({ aR }, o.angH || {}) }, HG);
    const hH = handAt('heigou', oH, 1);
    const sp = R.CHAR.aqing, sA = s * sp.h;
    const e = pt(-33 * sp.w, -188, aL[0], 48), h = pt(e[0], e[1], aL[0] + aL[1], 46);
    const xA = hH[0] - h[0] * sA + (o.stand ? 6 : -4) * s;
    const angA = Object.assign({ aL }, o.stand ? {} : { dy: (hH[1] - y) / sA - h[1] }, o.angA || {});
    return R.g([
      R.person('aqing', { x: xA, y, s, pose, p, mouth: o.mouthA || 'laugh', eyes: o.eyes, blush: o.blush, angles: angA }),
      R.person('heigou', oH),
    ]);
  }
  // 坐在椅子上的人
  function seated(sp, x, y, s, o = {}) {
    return R.g([R.chair(x, y, s * 0.95), R.person(sp, Object.assign({ x, y, s, pose: 'sit' }, o))]);
  }
  // 彩紙（只灑在 x0..x1、y0..y1）
  function confettiIn(seed, n, t, x0, x1, y0, y1, o = {}) {
    const r = R.rng(seed), out = [], cols = o.colors || P.rainbow;
    for (let i = 0; i < n; i++) {
      const x = R.lerp(x0, x1, r()), u = R.loop(t, 1, r()), y = R.lerp(y0, y1, u), sp = r() < 0.5 ? 1 : 2;
      const rot = 360 * R.cyc(t, sp) + r() * 360, w = 12 + r() * 8;
      out.push(R.rect(-w / 2, -6, w, 12, cols[i % cols.length], { transform: `translate(${R.f(x + 26 * R.wave(u, 1, r()))} ${R.f(y)}) rotate(${R.f(rot)})`, opacity: R.f(R.fadeLoop(u)) }));
    }
    return R.g(out);
  }
  // 沿著彩虹弧滑過的光點（彩虹微微閃爍）
  function arcSparkles(cx, cy, r, n, t, o = {}) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = R.loop(t, 1, i / n), a = Math.PI * (1 - u), rr = r + (o.spread || 0) * R.wave(u, 2, i * 0.3);
      out.push(R.sparkle(cx + rr * Math.cos(a), cy - rr * Math.sin(a), o.size || 20, o.color || '#FFFFFF', R.fadeLoop(u) * 1.1));
    }
    return R.g(out);
  }
  // 沿二次曲線飄的音符串（從山頂飄到庭院）
  function noteCurve(p0, p1, p2, n, t, o = {}) {
    const cols = [P.noteGold, P.noteRed, P.noteBlue, P.noteGreen, P.notePurple], out = [];
    for (let i = 0; i < n; i++) {
      const u = R.loop(t, 1, i / n), v = 1 - u;
      const x = v * v * p0[0] + 2 * u * v * p1[0] + u * u * p2[0], y = v * v * p0[1] + 2 * u * v * p1[1] + u * u * p2[1] + 14 * R.wave(u, 2, i * 0.3);
      const fade = Math.min(1, R.fadeLoop(u) * 2.2);
      out.push(R.note(x, y, (o.s || 1) * (0.85 + 0.25 * (i % 3) / 2), cols[i % cols.length], i % 3, { opacity: R.f(fade), rot: 12 * R.wave(u, 1, i * 0.21) }));
    }
    return R.g(out);
  }
  // 分段天空：和 R.sky 同一組漸層色，切成 n 條不透明色帶。GIF 調色盤只有 255 色，平滑漸層會吃掉太多色，
  // 小面積的膚色、黃襯衫就被換成別的顏色；色帶很細，看起來和漸層一樣
  function bandSky(kind, horizon = 820, n = 28) {
    const st = (R.SKY[kind] || R.SKY.day).map(c => [1, 3, 5].map(i => parseInt(c.substr(i, 2), 16)));
    const H = horizon + 40, out = [];
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n * (st.length - 1), k = Math.min(st.length - 2, Math.floor(u)), w = u - k;
      const c = st[k].map((v, j) => Math.round(v + (st[k + 1][j] - v) * w));
      out.push(R.rect(0, H * i / n - 1, 1920, H / n + 2, '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')));
    }
    return R.g(out);
  }
  // 問號（圖形，不用字型）
  function qmark(x, y, s, color) {
    return R.at(x, y, s, [
      R.path('M-26 -34 Q-26 -70 4 -70 Q34 -70 34 -42 Q34 -20 4 -6 L4 14', 'none', { stroke: color, strokeWidth: 15, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      R.circle(4, 44, 10, color),
    ]);
  }
  // 山頂上的四個好友（遠景，小；結尾頁回到故事開頭的地方）
  function quartet(x, y, s, t) {
    const ppl = [['f1', -1.5], ['heigou', -0.5], ['f2', 0.5], ['f3', 1.5]];
    return R.g(ppl.map(([w, k], i) => R.person(w, Object.assign({ x: x + k * 150 * s, y, s, pose: 'sing', p: R.loop(t, 1, i * 0.18), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.25) }, w === 'heigou' ? HG : {}))));
  }

  // ── c8a：庭院裡坐滿觀眾；一個孩子站在椅子上，指著右上方天空大喊，旁邊的人跟著抬頭；右上角露出一點彩虹
  R.scene('c8a', 3.2, t => [
    bandSky('clear', 640),
    R.sun(700, 130, 52, t),
    R.cloud(1080 + 12 * R.wave(t), 150, 0.62),
    // 右上角剛露出的彩虹邊
    R.rainbow(2060, 600, 560, 16, 0.27, { opacity: R.f(0.5 + 0.14 * R.wave(t, 1)) }),
    R.cloud(1735 + 8 * R.wave(t, 1, 0.2), 205, 0.55),
    R.sparkle(1585, 330, 18, '#FFFFFF', 0.6 + 0.5 * R.wave(t, 2)), R.sparkle(1640, 250, 13, '#FFFFFF', 0.6 + 0.5 * R.wave(t, 2, 0.5)),
    R.ridge({ y: 610, amp: 34, seed: 81, color: P.mtFar }),
    R.ground(632, P.grass),
    R.tree(190, 720, 0.95, t, { kind: 'banyan', ph: 0.1 }),
    R.schoolhouse(900, 640, 0.72, { doorOpen: true }),
    R.bunting(560, 478, 1240, 478, 46, 16, t),
    R.path(R.smooth([[-40, 660], [500, 648], [1000, 650], [1500, 646], [1960, 655]]) + ' L1960 1100 L-40 1100 Z', P.yard),
    // 舞台（學堂前），台上的人也抬頭
    R.stage(760, 730, 0.72, { banner: '#F39237' }),
    R.person('f2', { x: 590, y: 680, s: 0.56, prop: 'djembe', pose: 'stand', eyes: 'up' }),
    R.person('heigou', Object.assign({ x: 700, y: 680, s: 0.56, pose: 'point', eyes: 'up', mouth: 'o', angles: { aR: [140 + 6 * R.wave(t, 1), 4] } }, HG)),
    R.person('aqing', { x: 800, y: 680, s: 0.56, eyes: 'up', mouth: 'o', angles: { tilt: 3 * R.wave(t, 1, 0.3) } }),
    R.person('f1', { x: 895, y: 680, s: 0.56, eyes: 'up', mouth: 'smile' }),
    R.person('f3', { x: 985, y: 680, s: 0.56, eyes: 'up', mouth: 'open' }),
    // 後排觀眾
    // 後排觀眾：和前排的頭錯開；孩子後面留空
    seated(V.elder2, 1105, 712, 0.6, { eyes: 'up', mouth: 'o', angles: { tilt: 3 * R.wave(t, 1, 0.1) } }),
    seated(V.auntie, 1572, 712, 0.6, { eyes: 'up', mouth: 'o', angles: { tilt: 3 * R.wave(t, 1, 0.7) } }),
    seated(V.granny, 1712, 712, 0.6, { eyes: 'up' }),
    R.roseBush(1800, 770, 1.1, t, { seed: 8 }),
    // 前排：孩子站在椅子上指天空
    seated(V.grandpa, 1035, 800, 0.82, { eyes: 'up', mouth: 'o', angles: { tilt: -4 + 3 * R.wave(t, 1) } }),
    seated(V.mom, 1175, 800, 0.82, { eyes: 'up', mouth: 'open', angles: { tilt: 4 * R.wave(t, 1, 0.25) } }),
    R.chair(1345, 800, 0.82),
    R.person(V.kid, { x: 1345, y: 759, s: 1.18, pose: 'point', mouth: 'open', mouthK: R.wave(t, 2), angles: { aR: [146 + 8 * R.wave(t, 2), 2], aL: [-40, -60], dy: -10 * Math.abs(R.wave(t, 2)), tilt: 6 } }),
    seated(V.grandma, 1500, 800, 0.82, { pose: 'point', eyes: 'up', mouth: 'o', angles: { aR: [128 + 6 * R.wave(t, 1, 0.3), 6], lL: [-70, 80], lR: [-62, 74], dy: 60 } }),
    seated(V.dad, 1640, 800, 0.82, { eyes: 'up', mouth: 'smile', angles: { tilt: 3 * R.wave(t, 1, 0.6) } }),
    R.tufts(83, 18, 0, 1920, 780, 1060, t, { color: '#C7AE7C', size: 1.2, still: true }),
  ]);

  // ── c8b：大景。一道完整的彩虹跨過黑狗兄的山（山頂小樹），光點沿著彩虹滑過；前景庭院裡的人小小地抬頭看
  R.scene('c8b', 3.2, t => [
    bandSky('clear', 720),
    R.cloud(330 + 12 * R.wave(t), 190, 0.72), R.cloud(1660 + 10 * R.wave(t, 1, 0.5), 140, 0.6),
    R.rainbow(960, 790, 730, 30, 1, { opacity: 0.93 }),
    arcSparkles(960, 790, 730 - 105, 5, t, { size: 22, spread: 60 }),
    R.ridge({ y: 640, amp: 40, seed: 82, color: P.mtFar }),
    R.peak(960, 745, 0.95, 'clear', t),
    R.hill(220, 750, 760, 160, P.mtMid), R.hill(1720, 750, 760, 150, P.mtMid),
    R.ridge({ y: 722, amp: 12, seed: 9, color: P.mtNear }),
    R.village(560, 728, 0.42, t),
    R.bird(R.lerp(-80, 2000, R.cyc(t)), 380 + 20 * R.wave(t, 1), 0.8, t, 4), R.bird(R.lerp(-200, 1880, R.cyc(t)), 420 + 20 * R.wave(t, 1, 0.3), 0.6, t, 4, 0.3),
    // 庭院（前景）
    R.path(R.smooth([[-40, 756], [600, 740], [1300, 744], [1960, 752]]) + ' L1960 1100 L-40 1100 Z', P.yard),
    R.tree(60, 860, 0.95, t, { kind: 'banyan', ph: 0.2 }),
    R.roseBush(1830, 820, 1.0, t, { seed: 5 }),
    R.person(V.elder2, { x: 300, y: 762, s: 0.5, pose: 'point', eyes: 'up', mouth: 'o', angles: { aR: [150 + 6 * R.wave(t, 1), 4] } }),
    R.person(V.lady, { x: 400, y: 768, s: 0.5, eyes: 'up', mouth: 'open', angles: { tilt: 4 * R.wave(t, 1, 0.2) } }),
    R.person(V.girl, { x: 480, y: 770, s: 0.6, pose: 'cheer', p: R.cyc(t, 2), eyes: 'up', mouth: 'open' }),
    R.person('f1', { x: 580, y: 762, s: 0.5, eyes: 'up', mouth: 'o' }),
    R.person('f2', { x: 680, y: 766, s: 0.5, pose: 'point', eyes: 'up', mouth: 'grin', angles: { aR: [145 + 6 * R.wave(t, 1, 0.5), 4] } }),
    R.person('f3', { x: 780, y: 762, s: 0.5, eyes: 'up', mouth: 'open', angles: { tilt: 4 * R.wave(t, 1, 0.6) } }),
    couple(895, 768, 0.54, 0, { stand: true, eyes: 'up', mouthH: 'smile', mouthA: 'smile', blush: true, angH: { tilt: -3 + 2 * R.wave(t, 1) }, angA: { tilt: 3 + 2 * R.wave(t, 1, 0.5) } }),
    R.person(V.grandpa, { x: 1140, y: 762, s: 0.5, eyes: 'up', mouth: 'o' }),
    R.person(V.kid, { x: 1235, y: 770, s: 0.62, pose: 'jump', p: R.cyc(t, 2), eyes: 'up', mouth: 'open' }),
    R.person(V.mom, { x: 1330, y: 764, s: 0.5, pose: 'point', eyes: 'up', mouth: 'smile', angles: { aR: [140 + 6 * R.wave(t, 1, 0.2), 6] } }),
    R.person(V.grandma, { x: 1430, y: 762, s: 0.5, eyes: 'up', mouth: 'o', angles: { tilt: 3 * R.wave(t, 1, 0.8) } }),
    R.person(V.dad, { x: 1530, y: 768, s: 0.5, eyes: 'up', mouth: 'open' }),
    R.person(V.auntie, { x: 1630, y: 762, s: 0.5, eyes: 'up', mouth: 'smile', angles: { tilt: 3 * R.wave(t, 1, 0.4) } }),
  ]);

  // ── c8c：鼓聲中大家一起跳。黑狗兄牽著阿晴的手一起跳；台上好友敲鼓、揮手；台下的人跳起來；背後彩虹、彩紙
  R.scene('c8c', 3.2, t => {
    const hit = R.beat(t, 4), jp = R.cyc(t, 2);
    return [
      bandSky('clear', 600),
      R.cloud(330 + 12 * R.wave(t), 150, 0.6), R.cloud(1620 + 10 * R.wave(t, 1, 0.5), 110, 0.5),
      R.rainbow(960, 640, 640, 24, 1, { opacity: 0.88 }),
      R.ridge({ y: 585, amp: 30, seed: 84, color: P.mtFar }),
      R.ground(575, P.grass),
      R.tree(150, 640, 0.95, t, { kind: 'banyan', ph: 0.3 }),
      R.schoolhouse(960, 560, 0.66, { doorOpen: true }),
      R.bunting(640, 412, 1280, 412, 42, 16, t),
      R.path(R.smooth([[-40, 580], [600, 570], [1300, 572], [1960, 580]]) + ' L1960 1100 L-40 1100 Z', P.yard),
      R.stage(960, 610, 0.72, { banner: '#F6C631' }),
      // 台上：好友敲鼓、揮手
      R.person('f1', { x: 760, y: 560, s: 0.55, pose: 'cheer', p: R.cyc(t, 2), mouth: 'laugh' }),
      R.person('f2', { x: 870, y: 560, s: 0.55, pose: 'drum', p: R.cyc(t, 2), prop: 'djembe', hit, mouth: 'grin' }),
      R.person('f3', { x: 985, y: 560, s: 0.55, pose: 'cheer', p: R.loop(t, 2, 0.5), mouth: 'sing', mouthK: R.wave(t, 2) }),
      R.roseBush(1790, 700, 1.0, t, { seed: 6 }),
      // 台下：大家站起來一起跳
      R.person(V.grandpa, { x: 310, y: 690, s: 0.85, pose: 'drum', p: R.cyc(t, 2), prop: 'djembe', hit, mouth: 'grin' }),
      R.person(V.mom, { x: 480, y: 688, s: 0.82, pose: 'jump', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
      R.person(V.girl, { x: 610, y: 690, s: 0.95, pose: 'jump', p: jp, mouth: 'open', mouthK: 0.5 }),
      couple(1160, 690, 0.9, jp),
      R.person(V.kid, { x: 1500, y: 690, s: 0.95, pose: 'jump', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
      R.person(V.grandma, { x: 1640, y: 688, s: 0.82, pose: 'cheer', p: R.cyc(t, 2), mouth: 'laugh' }),
      confettiIn(85, 22, t, 0, 1920, -30, 640),
      R.tufts(86, 16, 0, 1920, 720, 1060, t, { color: '#C7AE7C', size: 1.2, still: true }),
    ];
  });

  // ── c8d：黃昏大景，連起故事頭尾：左邊遠方的山頂（小樹），右邊滿院子的人在老學堂前唱歌；音符從山頂飄到庭院；彩虹掛在天上
  R.scene('c8d', 3.2, t => [
    bandSky('golden', 660),
    R.sun(820, 575, 76, t, { rays: 10 }),
    R.cloud(260 + 12 * R.wave(t), 150, 0.62, { shade: '#F8DDBA' }), R.cloud(1640 + 10 * R.wave(t, 1, 0.5), 120, 0.55, { shade: '#F8DDBA' }),
    R.rainbow(960, 760, 760, 24, 1, { opacity: 0.8 }),
    R.ridge({ y: 600, amp: 36, seed: 87, color: '#C9B99A' }),
    R.peak(400, 690, 0.75, 'golden', t),
    // 山頂的「願望」：一顆小光點
    R.sparkle(400, 262, 26, '#FFF6CF', 0.7 + 0.4 * R.wave(t, 2)),
    R.ridge({ y: 668, amp: 22, seed: 88, color: '#A8B98A' }),
    R.village(470, 690, 0.36, t, { lit: true }),
    R.ground(690, '#9DBB72'),
    // 右邊：老學堂庭院
    R.path(R.smooth([[960, 820], [1060, 720], [1200, 676], [1500, 666], [1960, 672]]) + ' L1960 1100 L960 1100 Z', P.yard),
    R.tree(1090, 690, 0.52, t, { kind: 'banyan', ph: 0.2 }),
    R.schoolhouse(1440, 640, 0.54, { lit: true, doorOpen: true }),
    R.bunting(1190, 518, 1690, 518, 30, 14, t),
    R.stage(1440, 690, 0.5, { banner: '#F39237' }),
    R.roseBush(1820, 738, 0.7, t, { seed: 4 }),
    R.crowd(890, 7, 1210, 1680, 655, 0.38, t, { pose: () => ({ pose: 'sing', mouth: 'sing', mouthK: R.wave(t, 2) }), elder: true }),
    R.person('f1', { x: 1260, y: 735, s: 0.46, pose: 'sing', p: R.loop(t, 1, 0.1), mouth: 'sing', mouthK: R.wave(t, 2, 0.1) }),
    couple(1365, 738, 0.48, 0, { stand: true, mouthH: 'sing', mouthA: 'sing' }),
    R.person('f2', { x: 1580, y: 735, s: 0.46, pose: 'sing', p: R.loop(t, 1, 0.4), mouth: 'sing', mouthK: R.wave(t, 2, 0.4) }),
    R.person('f3', { x: 1680, y: 738, s: 0.46, pose: 'sing', p: R.loop(t, 1, 0.6), mouth: 'sing', mouthK: R.wave(t, 2, 0.6) }),
    R.person(V.grandpa, { x: 1160, y: 760, s: 0.48, pose: 'sing', p: R.loop(t, 1, 0.8), mouth: 'sing', mouthK: R.wave(t, 2, 0.8) }),
    R.person(V.kid, { x: 1780, y: 765, s: 0.6, pose: 'cheer', p: R.cyc(t, 2), mouth: 'open' }),
    noteCurve([430, 250], [900, 40], [1440, 470], 10, t, { s: 0.85 }),
    R.ground(790, '#A9C477'),
    R.tufts(89, 16, 0, 1920, 800, 1060, t, { color: '#7FA05A', size: 1.2, still: true }),
  ]);

  // ── c8e：夕陽下的彩虹，幾個村民圍著聊天；一位長輩問「明年唱什麼？」（泡泡裡是問號形狀與音符）
  R.scene('c8e', 3.2, t => {
    const by = 6 * R.wave(t, 1);
    return [
      bandSky('golden', 680),
      R.sun(1580, 560, 86, t, { rays: 12 }),
      R.rainbow(900, 770, 700, 26, 1, { opacity: 0.82 }),
      R.cloud(1190 + 10 * R.wave(t), 110, 0.55, { shade: '#F8DDBA' }), R.cloud(1790 + 8 * R.wave(t, 1, 0.5), 250, 0.45, { shade: '#F8DDBA' }),
      R.ridge({ y: 620, amp: 34, seed: 91, color: '#C9B99A' }),
      R.peak(1260, 690, 0.42, 'golden', t),
      R.ridge({ y: 668, amp: 18, seed: 92, color: '#A8B98A' }),
      R.path(R.smooth([[-40, 690], [700, 676], [1400, 680], [1960, 690]]) + ' L1960 1100 L-40 1100 Z', P.yard),
      R.tree(150, 720, 1.0, t, { kind: 'banyan', ph: 0.15 }),
      R.roseBush(1800, 740, 1.0, t, { seed: 7 }),
      R.chair(1520, 735, 0.7), R.chair(1630, 742, 0.7), R.chair(1690, 760, 0.7, { fallen: -8 }),
      // 圍著聊天的人
      R.person(V.grandma, { x: 790, y: 712, s: 0.82, mouth: 'smile', angles: { tilt: -3 + 3 * R.wave(t, 1, 0.3) } }),
      R.person(V.grandpa, { x: 640, y: 740, s: 0.9, pose: 'reach', mouth: 'open', mouthK: R.wave(t, 2), angles: { aR: [70 + 10 * R.wave(t, 1), 60], tilt: 4 } }),
      R.person(V.mom, { x: 935, y: 714, s: 0.82, mouth: 'smile', angles: { tilt: -4 * R.wave(t, 1, 0.6) } }),
      R.person(V.kid, { x: 1065, y: 742, s: 1.0, eyes: 'up', mouth: 'o', angles: { tilt: 3 * R.wave(t, 1, 0.1) } }),
      couple(1215, 740, 0.9, 0, { stand: true, mouthH: 'grin', mouthA: 'smile', blush: true, angH: { tilt: -3 + 2 * R.wave(t, 1, 0.2) }, angA: { tilt: 3 + 2 * R.wave(t, 1, 0.7) } }),
      // 長輩頭上的泡泡：問號與音符
      R.speech(470, 150 + by, 320, 190, 625, 450, R.g([qmark(560, 275 + by, 1.25, '#E8475F'), R.note(690, 238 + by, 1.25, P.noteBlue, 0)])),
      R.sparkle(1380, 210, 14, '#FFF6CF', 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(260, 300, 12, '#FFF6CF', 0.5 + 0.5 * R.wave(t, 2, 0.5)),
      R.bird(R.lerp(2000, -80, R.cyc(t)), 360 + 16 * R.wave(t, 1), 0.7, t, 4),
      R.tufts(93, 16, 0, 1920, 780, 1060, t, { color: '#C7AE7C', size: 1.2, still: true }),
    ];
  });

  // ── s8：歌曲頁〈飛躍的彩虹〉。右半：大彩虹跨過山頂，大家敲鼓一起跳；鼓面光圈跟拍子、彩紙。左半安靜留給歌名
  R.scene('s8', 3.2, t => {
    const hit = R.beat(t, 4), jp = R.cyc(t, 2);
    return [
      bandSky('clear', 780),
      R.cloud(420 + 10 * R.wave(t), 170, 0.7), R.cloud(1260 + 10 * R.wave(t, 1, 0.5), 120, 0.55),
      R.rainbow(1470, 800, 520, 24, 1, { opacity: 0.93 }),
      arcSparkles(1470, 800, 520 - 84, 3, t, { size: 18 }),
      R.ridge({ y: 720, amp: 38, seed: 94, color: P.mtFar }),
      R.peak(1470, 800, 0.72, 'clear', t),
      R.hill(380, 820, 1100, 180, P.mtMid),
      R.ridge({ y: 790, amp: 16, seed: 95, color: P.mtNear }),
      R.ground(820, P.grass),
      R.tufts(96, 10, 40, 900, 860, 1060, t, { color: P.grassDD, size: 1.2, still: true }),
      // 敲鼓、跳起來的人
      R.person('f2', { x: 1040, y: 920, s: 0.78, pose: 'drum', p: jp, prop: 'djembe', hit, mouth: 'grin' }),
      R.person('f1', { x: 1170, y: 915, s: 0.74, pose: 'jump', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
      couple(1300, 920, 0.8, jp),
      R.person(V.grandma, { x: 1590, y: 920, s: 0.76, pose: 'drum', p: R.loop(t, 2, 0.5), prop: 'djembe', hit, mouth: 'laugh' }),
      R.person(V.kid, { x: 1720, y: 925, s: 0.9, pose: 'jump', p: R.loop(t, 2, 0.5), mouth: 'open', mouthK: 0.5 }),
      R.person('f3', { x: 1840, y: 918, s: 0.74, pose: 'cheer', p: jp, mouth: 'sing', mouthK: R.wave(t, 2) }),
      confettiIn(97, 16, t, 1000, 1920, -30, 760),
    ];
  });

  // ── end：結尾頁（封面同一構圖的黃昏版）。彩虹跨過山頂與山腳村莊；四個好友回到山頂唱歌；光點與音符飄在空中；三合院亮燈
  R.scene('end', 3.2, t => [
    bandSky('dusk', 820, 40),
    R.stars(98, 12, t, 220),
    R.sun(520, 760, 100, t, { rays: 0, color: '#FFC470', core: '#FFE2A8' }),
    R.cloud(1780 + 10 * R.wave(t, 1, 0.6), 520, 0.55, { color: '#F6D3C8', shade: '#E2B4B6' }), R.cloud(120 + 10 * R.wave(t), 560, 0.5, { color: '#F6D3C8', shade: '#E2B4B6' }),
    R.rainbow(960, 1000, 860, 34, 1, { opacity: 0.85 }),
    R.ridge({ y: 720, amp: 46, seed: 99, color: '#8E7FA6' }),
    R.peak(1400, 860, 0.62, 'dusk', t),
    quartet(1400 - 40, 545, 0.2, t),
    R.noteStream(1440, 520, 260, -90, 3, t, { s: 0.55, wiggle: 10 }),
    R.hill(330, 860, 900, 200, '#6F8A7E'),
    R.ridge({ y: 820, amp: 20, seed: 5, color: '#5F7F68' }),
    R.village(980, 835, 0.85, t, { lit: true }),
    R.paddies(860, 1060, t, { rows: 6, still: true, base: '#93A86C', color: '#9DB565', colorD: '#7F9A52', dike: '#B3A27A' }),
    R.noteStream(900, 780, 300, -420, 4, t, { s: 0.8, wiggle: 18 }),
    R.sparkle(300, 470, 16, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(700, 520, 12, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.33)), R.sparkle(1700, 470, 14, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.66)),
    R.sparkle(620, 160, 14, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.2)), R.sparkle(1300, 120, 16, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.7)),
  ]);
})();
