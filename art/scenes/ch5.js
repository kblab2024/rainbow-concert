// 第 5 章〈可愛的玫瑰花〉（非洲鼓＋擊鼓有氧）。玫瑰花圃在老學堂右前方（STYLE.md 5.5）：近景學堂在畫面左後、花圃在右。
(function () {
  const R = RC, P = R.P;

  // R.ground 的最後一個取樣點在 x 1880，右緣會露出斜角；底下先鋪一塊同色矩形補起來
  const ground = (y, color, o) => [R.rect(-20, y + 12, 1960, 1100 - y, color), R.ground(y, color, o)];

  // 依 lib 的人物骨架算手的位置（給手上拿的區域道具用）。side -1 左手、1 右手
  function handAt(who, x, y, s, pose, p, angles, side) {
    const sp = typeof who === 'string' ? R.CHAR[who] : who;
    const A = Object.assign(R.poseAngles(pose, p), angles || {});
    const sc = s * (sp.h || 1), sx = sp.w || 1, ang = side < 0 ? A.aL : A.aR;
    const pt = (px, py, a, L) => [px + L * Math.sin(a * Math.PI / 180), py + L * Math.cos(a * Math.PI / 180)];
    const e = pt(side * 33 * sx, -188, ang[0], 48), h = pt(e[0], e[1], ang[0] + ang[1], 46);
    return [x + h[0] * sc, y + (A.dy + h[1]) * sc];
  }

  // 一把拔起來的雜草（草葉朝上、根垂下）
  function weed(x, y, s) {
    return R.at(x, y, s, [
      R.path('M-4 0 q-4 18 -10 30 M2 0 q2 20 -2 34 M6 0 q8 14 10 26', 'none', { stroke: '#8A6A44', strokeWidth: 3, strokeLinecap: 'round' }),
      R.path('M-6 0 Q-14 -24 -26 -44 M0 0 Q2 -30 -4 -58 M6 0 Q16 -22 28 -40', 'none', { stroke: '#7E9A48', strokeWidth: 6, strokeLinecap: 'round' }),
    ]);
  }
  // 拔下來堆在一旁的雜草
  function weedPile(x, y, s) {
    return R.at(x, y, s, [R.ellipse(0, -10, 60, 20, '#8A9A4F'), R.ellipse(-20, -20, 30, 14, '#9AAA5A'), R.ellipse(22, -22, 28, 12, '#7E8E44'),
      R.path('M-40 -14 q-10 -16 -20 -22 M-10 -24 q0 -18 -6 -30 M24 -26 q8 -14 18 -20', 'none', { stroke: '#7E9A48', strokeWidth: 5, strokeLinecap: 'round' })]);
  }
  // 掃地揚起的小塵土
  function dust(x, y, t, ph) {
    const out = [];
    for (let i = 0; i < 3; i++) { const u = R.loop(t, 2, ph + i / 3); out.push(R.circle(x + 50 * u - 10 * i, y - 8 - 22 * u, 6 + 10 * u, '#E3CFA2', { opacity: R.f(0.8 * R.fadeLoop(u)) })); }
    return R.g(out);
  }
  // 往上飄的愛心
  function hearts(x, y, dy, n, t, s = 1) {
    const out = [];
    for (let i = 0; i < n; i++) { const u = R.loop(t, 1, i / n); out.push(R.heart(x + 30 * R.wave(u, 1, i * 0.3) + (i % 2 ? 26 : -26), y - dy * u, s * (0.6 + 0.4 * u), i % 2 ? P.heart : P.roseL, { opacity: R.f(R.fadeLoop(u)) })); }
    return R.g(out);
  }
  // 繞圈飛舞的花瓣：中心 (cx,cy)，半徑 rx/ry，鼓點時往外撐開
  function petalSwirl(cx, cy, rx, ry, n, t) {
    const out = [], cols = [P.rose, P.roseL, '#F9B4C4'], push = 1 + 0.1 * R.beat(t, 4);
    for (let i = 0; i < n; i++) {
      const a = R.TAU * (R.cyc(t, 1) + i / n), wob = 1 + 0.06 * R.wave(t, 2, i * 0.37);
      const x = cx + Math.cos(a) * rx * push * wob, y = cy + Math.sin(a) * ry * push * wob, rot = 360 * R.cyc(t, 2) + i * 47;
      out.push(R.ellipse(0, 0, 16, 9, cols[i % 3], { transform: `translate(${R.f(x)} ${R.f(y)}) rotate(${R.f(rot)})` }));
    }
    return R.g(out);
  }

  // ── c5a：早晨，學堂旁荒廢的玫瑰花圃（只有花苞）。阿晴澆水、黑狗兄蹲著拔草、好友掃地
  R.scene('c5a', 3.2, t => {
    const pull = 0.5 + 0.5 * R.wave(t, 2);
    const crouchA = u => ({ aL: [-20, 60 + 50 * u], aR: [20, -60 - 50 * u] });
    const hg = { x: 1300, y: 694, s: 0.9 }, f1 = { x: 1790, y: 698, s: 0.86 };
    const hgL = handAt('heigou', hg.x, hg.y, hg.s, 'crouch', 0, crouchA(pull), -1), hgR = handAt('heigou', hg.x, hg.y, hg.s, 'crouch', 0, crouchA(pull), 1);
    const pull1 = 0.5 + 0.5 * R.wave(t, 2, 0.5);
    const f1L = handAt('f1', f1.x, f1.y, f1.s, 'crouch', 0, crouchA(pull1), -1), f1R = handAt('f1', f1.x, f1.y, f1.s, 'crouch', 0, crouchA(pull1), 1);
    const aq = { x: 800, y: 694, s: 0.92 }, tilt = 6 * R.wave(t, 1);
    return [
      R.sky('clear', 560),
      R.sun(1660, 200, 60, t, { rays: 10 }),
      R.cloud(1100 + 12 * R.wave(t), 130, 0.65), R.cloud(1500 + 10 * R.wave(t, 1, 0.5), 300, 0.45),
      R.ridge({ y: 470, amp: 34, seed: 101, color: P.mtFar }),
      R.ridge({ y: 550, amp: 14, seed: 102, color: P.mtMid }),
      R.tree(-40, 600, 0.8, t, { kind: 'banyan', sway: 4 }),
      R.schoolhouse(470, 562, 0.7),
      ground(566, P.yard, { amp: 4 }),
      // 花圃的土
      R.ellipse(1340, 640, 640, 62, P.soil), R.ellipse(1340, 632, 610, 50, '#D3A873'),
      R.roseBush(1000, 652, 0.78, t, { wild: true, bloom: 0, seed: 11 }), R.roseBush(1220, 640, 0.74, t, { wild: true, bloom: 0, seed: 12 }),
      R.roseBush(1460, 646, 0.78, t, { wild: true, bloom: 0, seed: 13 }), R.roseBush(1680, 654, 0.74, t, { wild: true, bloom: 0, seed: 14 }),
      weedPile(1530, 694, 0.9),
      // 好友掃地
      R.person('f3', { x: 560, y: 698, s: 0.84, pose: 'sweep', p: R.cyc(t, 2), prop: 'broom' }), dust(660, 700, t, 0),
      R.person('f2', { x: 160, y: 700, s: 0.84, pose: 'sweep', p: R.loop(t, 2, 0.4), prop: 'broom', mouth: 'grin' }), dust(262, 702, t, 0.4),
      // 阿晴澆水
      R.person('aqing', Object.assign({ pose: 'water', prop: 'can', mouth: 'smile', angles: { aR: [70 + tilt, 30] } }, aq)),
      R.waterArc(handAt('aqing', aq.x, aq.y, aq.s, 'water', 0, { aR: [70 + tilt, 30] }, 1)[0] + 62, handAt('aqing', aq.x, aq.y, aq.s, 'water', 0, { aR: [70 + tilt, 30] }, 1)[1] - 16, 110, 90, t, 10),
      // 黑狗兄、f1 蹲著拔草
      R.person('heigou', Object.assign({ pose: 'crouch', shirt: 'yellow', mouth: 'grin', angles: crouchA(pull) }, hg)),
      weed((hgL[0] + hgR[0]) / 2, (hgL[1] + hgR[1]) / 2 + 6, 1.0),
      R.person('f1', Object.assign({ pose: 'crouch', mouth: 'smile', angles: crouchA(pull1) }, f1)),
      weed((f1L[0] + f1R[0]) / 2, (f1L[1] + f1R[1]) / 2 + 6, 0.95),
      R.butterfly(1100 + 80 * R.wave(t, 1), 470 + 30 * R.wave(t, 2, 0.2), 1.1, t, 4),
      R.bird(R.lerp(-80, 2000, R.cyc(t)), 220 + 18 * R.wave(t, 1), 0.7, t, 4),
    ];
  });

  // ── c5b：第一朵玫瑰開了（中間一朵大的，周圍閃光；其他是花苞）。阿晴高興地喊，孩子圍著花圃跳舞，大人敲鼓踏步，安靜的長輩也伸手轉身
  R.scene('c5b', 3.2, t => {
    const hit = R.beat(t, 4), dp = R.loop(t, 2, 0.25);
    const kid1 = R.villager(501, { kid: true, female: true }), kid2 = R.villager(502, { kid: true }), kid3 = R.villager(503, { kid: true }), kid4 = R.villager(504, { kid: true, female: true });
    const drummer = R.villager(505, { elder: false, female: false }), quiet = R.villager(506, { elder: true, female: true });
    const rx = 1160, ry = 478, sparks = [];
    for (let i = 0; i < 6; i++) { const a = R.TAU * (i / 6 + 0.25 * R.cyc(t)); sparks.push(R.sparkle(rx + Math.cos(a) * 118, ry + Math.sin(a) * 92, 18, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, i / 6))); }
    return [
      R.sky('clear', 540),
      R.cloud(820 + 12 * R.wave(t), 140, 0.65), R.cloud(1560 + 10 * R.wave(t, 1, 0.4), 120, 0.55),
      R.ridge({ y: 450, amp: 30, seed: 111, color: P.mtFar }),
      R.ridge({ y: 530, amp: 14, seed: 112, color: P.mtMid }),
      R.tree(-90, 590, 0.75, t, { kind: 'banyan', sway: 4 }),
      R.schoolhouse(300, 544, 0.6),
      ground(548, P.yard, { amp: 4 }),
      R.ellipse(1160, 612, 470, 50, P.soil), R.ellipse(1160, 606, 450, 40, '#D3A873'),
      // 花圃後兩側的孩子
      R.person(kid3, { x: 650, y: 616, s: 0.78, pose: 'dance', p: R.loop(t, 2, 0.1) }),
      R.roseBush(820, 620, 0.78, t, { bloom: 0, seed: 21 }), R.roseBush(990, 612, 0.74, t, { bloom: 0, seed: 22 }),
      R.roseBush(1330, 612, 0.74, t, { bloom: 0, seed: 24 }), R.roseBush(1500, 620, 0.78, t, { bloom: 0, seed: 25 }),
      R.roseBush(1160, 616, 0.86, t, { bloom: 0, seed: 23, n: 4 }),
      // 繞著花圃跳舞的孩子（站在花圃前緣，不被大人擋住）
      R.person(kid4, { x: 985, y: 652, s: 0.76, pose: 'dance', p: R.loop(t, 2, 0.6), mouth: 'laugh' }),
      // 第一朵盛開的玫瑰
      R.circle(rx, ry, 92 + 8 * hit, '#FFF3B0', { opacity: R.f(0.35 + 0.25 * hit) }),
      R.path(`M${rx} ${ry + 40} Q${rx - 6} ${ry + 80} ${rx} ${ry + 120}`, 'none', { stroke: P.roseLeaf, strokeWidth: 8, strokeLinecap: 'round' }),
      R.rose(rx, ry, 2.5 + 0.08 * hit, 1),
      sparks,
      // 前排：敲鼓的大人、跳舞的孩子、阿晴、安靜的長輩
      R.person(drummer, { x: 150, y: 706, s: 0.82, pose: 'drum', p: dp, prop: 'djembe', hit, mouth: 'grin' }),
      R.person('heigou', { x: 360, y: 706, s: 0.86, pose: 'drum', p: dp, prop: 'djembe', hit, shirt: 'yellow', mouth: 'laugh' }),
      R.person(kid1, { x: 570, y: 708, s: 0.9, pose: 'dance', p: R.loop(t, 2, 0.3), mouth: 'laugh' }),
      R.person('aqing', { x: 810, y: 704, s: 0.9, pose: 'cheer', p: R.cyc(t, 2), mouth: 'open', mouthK: R.wave(t, 2) }),
      R.person(kid2, { x: 1350, y: 708, s: 0.9, pose: 'dance', p: R.loop(t, 2, 0.8), mouth: 'laugh' }),
      R.person(quiet, { x: 1520, y: 706, s: 0.84, pose: 'dance', p: R.cyc(t, 1), mouth: 'smile', eyes: 'closed' }),
      R.person('f3', { x: 1690, y: 706, s: 0.82, pose: 'step', p: R.loop(t, 2, 0.25), mouth: 'grin' }),
      R.person('f2', { x: 1850, y: 708, s: 0.8, pose: 'drum', p: dp, prop: 'djembe', hit, mouth: 'grin' }),
    ];
  });

  // ── c5c：近景。黑狗兄把一朵玫瑰別在黃襯衫胸前，阿晴在旁邊笑得燦爛；背景玫瑰盛開，花瓣飄落、愛心
  R.scene('c5c', 3.2, t => {
    const adj = 5 * R.wave(t, 1);
    return [
      R.sky('golden', 520),
      R.sun(1620, 240, 70, t, { rays: 0, color: '#FFD27A', core: '#FFE8B0' }),
      R.cloud(900 + 12 * R.wave(t), 150, 0.6, { shade: '#F8DDBA' }),
      R.ridge({ y: 440, amp: 30, seed: 121, color: '#C9B99A' }),
      R.schoolhouse(220, 520, 0.62),
      ground(522, P.yard, { amp: 4 }),
      // 後排、前排盛開的玫瑰叢
      R.roseBush(560, 600, 1.0, t, { seed: 31 }), R.roseBush(820, 590, 0.95, t, { seed: 32 }), R.roseBush(1080, 600, 1.0, t, { seed: 33 }),
      R.roseBush(1340, 590, 0.95, t, { seed: 34 }), R.roseBush(1600, 600, 1.0, t, { seed: 35 }), R.roseBush(1860, 592, 0.95, t, { seed: 36 }),
      R.roseBush(380, 700, 1.15, t, { seed: 37 }), R.roseBush(1760, 700, 1.15, t, { seed: 38 }),
      // 阿晴笑得燦爛（雙手合在胸前，笑得一顛一顛）
      R.person('aqing', { x: 790, y: 816, s: 1.32, pose: 'stand', mouth: 'laugh', blush: true,
        angles: { aL: [-14, 120], aR: [14, -120], dy: -6 * Math.abs(R.wave(t, 2)), tilt: 4 * R.wave(t, 1) } }),
      // 黑狗兄右手把胸前的玫瑰別好
      R.person('heigou', { x: 1125, y: 816, s: 1.4, pose: 'stand', shirt: 'yellow', rose: true, mouth: 'smile', blush: true,
        angles: { aR: [30 + adj, -158 - adj * 0.6], tilt: -3 } }),
      R.sparkle(1185, 540, 20, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(1225, 610, 13, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.5)),
      hearts(958, 470, 250, 4, t, 1.1),
      R.petals(41, 16, t, { y0: -30, y1: 720 }),
    ];
  });

  // ── s5：歌曲頁〈可愛的玫瑰花〉非洲鼓＋擊鼓有氧。右半邊盛開的玫瑰花圃，大家敲鼓跳舞，花瓣隨鼓點繞圈飛舞；左半安靜
  R.scene('s5', 3.2, t => {
    const hit = R.beat(t, 4), dp = R.loop(t, 2, 0.25);
    const kid = R.villager(511, { kid: true, female: true }), elder = R.villager(512, { elder: true, female: true });
    return [
      R.sky('clear', 700),
      R.cloud(420 + 10 * R.wave(t), 170, 0.7), R.cloud(1280 + 10 * R.wave(t, 1, 0.4), 130, 0.6), R.cloud(1800 + 10 * R.wave(t, 1, 0.7), 220, 0.5),
      R.ridge({ y: 620, amp: 36, seed: 131, color: P.mtFar }),
      R.ridge({ y: 690, amp: 16, seed: 132, color: P.mtMid }),
      R.schoolhouse(1180, 690, 0.5),
      ground(694, P.yard, { amp: 4 }),
      R.roseBush(1080, 790, 0.95, t, { seed: 41 }), R.roseBush(1290, 780, 0.9, t, { seed: 42 }), R.roseBush(1500, 790, 0.95, t, { seed: 43 }),
      R.roseBush(1710, 780, 0.9, t, { seed: 44 }), R.roseBush(1900, 790, 0.95, t, { seed: 45 }),
      R.person(elder, { x: 1600, y: 836, s: 0.6, pose: 'dance', p: R.loop(t, 1, 0.4), mouth: 'smile', eyes: 'closed' }),
      R.person('f1', { x: 1030, y: 975, s: 0.8, pose: 'drum', p: dp, prop: 'djembe', hit, mouth: 'grin' }),
      R.person('heigou', { x: 1205, y: 970, s: 0.86, pose: 'dance', p: R.cyc(t, 2), shirt: 'yellow', rose: true, mouth: 'laugh' }),
      R.person('aqing', { x: 1375, y: 970, s: 0.86, pose: 'dance', p: R.loop(t, 2, 0.5), mouth: 'laugh' }),
      R.person(kid, { x: 1525, y: 975, s: 0.84, pose: 'jump', p: R.cyc(t, 2), mouth: 'laugh' }),
      R.person('f2', { x: 1675, y: 975, s: 0.8, pose: 'drum', p: dp, prop: 'djembe', hit, mouth: 'grin' }),
      R.person('f3', { x: 1830, y: 975, s: 0.78, pose: 'step', p: R.loop(t, 2, 0.25), mouth: 'grin' }),
      petalSwirl(1440, 500, 420, 190, 22, t),
    ];
  });
})();
