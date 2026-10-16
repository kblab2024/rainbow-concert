// 第 7 章〈幸福進行曲〉（合唱）
// 庭院配置照 STYLE.md 5.5：學堂在後方中間、大榕樹在左、玫瑰花圃在右前、舞台在學堂前、觀眾椅子在花圃旁。
(function () {
  const R = RC, P = R.P;
  const HG = { shirt: 'yellow', rose: true };   // 第 7 章黑狗兄：黃襯衫、胸前玫瑰

  // ── 區域零件 ──
  // 地面（畫到畫面右緣外）
  function ground(y, color, o = {}) {
    const pts = [];
    for (let x = -40; x <= 2000; x += 120) pts.push([x, y + (o.amp || 10) * Math.sin(x / 260 + (o.ph || 0))]);
    return R.path(R.smooth(pts) + ' L2000 1100 L-40 1100 Z', color);
  }
  // 映著藍天白雲的水窪
  function skyPuddle(x, y, w, t) {
    return R.g([R.ellipse(x, y, w, w * 0.2, '#9FD3EE'), R.ellipse(x - w * 0.3 + 6 * R.wave(t, 1), y - w * 0.03, w * 0.32, w * 0.06, '#FFFFFF', { opacity: 0.85 }), R.ellipse(x + w * 0.25, y + w * 0.05, w * 0.2, w * 0.035, '#FFFFFF', { opacity: 0.6 })]);
  }
  // 一組閃光（水珠反光），各自錯開
  const glints = (list, t, k = 2) => R.g(list.map(([x, y, r], i) => R.sparkle(x, y, r, '#FFFFFF', 0.25 + 0.75 * Math.max(0, R.wave(t, k, i * 0.29)))));
  // 從葉尖滴下的水珠
  function dropFall(list, t) {
    return R.g(list.map(([x, y, L], i) => { const u = R.loop(t, 1, i / list.length); return R.ellipse(x, y + L * u * u, 5, 7, '#9FD3EE', { opacity: R.f(R.fadeLoop(u)) }); }));
  }
  // 只灑在某一區的彩紙（歌曲頁左半不灑）
  function confettiIn(seed, n, t, x0, x1, y0, y1, k = 1) {
    const r = R.rng(seed), out = [], cols = P.rainbow;
    for (let i = 0; i < n; i++) {
      const x = R.lerp(x0, x1, r()), u = R.loop(t, k, r()), y = R.lerp(y0, y1, u), sp = r() < 0.5 ? 1 : 2;
      const rot = 360 * R.cyc(t, sp * k) + r() * 360, w = 12 + r() * 8;
      out.push(R.rect(-w / 2, -6, w, 12, cols[i % cols.length], { transform: `translate(${R.f(x + 30 * R.wave(u, 1, r()))} ${R.f(y)}) rotate(${R.f(rot)})`, opacity: R.f(R.fadeLoop(u) * 0.95) }));
    }
    return R.g(out);
  }
  // 飄起的小愛心
  function heartsUp(x, y, dy, n, t, s = 1) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = R.loop(t, 1, i / n);
      out.push(R.heart(x + 30 * R.wave(u, 1, i * 0.3) + (i % 2 ? 26 : -26), y - dy * u, s * (0.7 + 0.5 * u), i % 2 ? P.heart : P.roseL, { opacity: R.f(R.fadeLoop(u)) }));
    }
    return R.g(out);
  }
  // 柔和的聚光（不透明的淺色梯形，不用大面積半透明）
  const spot = (x, top, w0, w1, bottom, c) => R.poly([[x - w0, top], [x + w0, top], [x + w1, bottom], [x - w1, bottom]], c);
  // 坐在椅子上的人：先畫椅子，再畫坐姿的人（腳往前垂）
  function seated(sp, x, y, s, t, o = {}) {
    const ang = Object.assign({ lL: [-55, 55], lR: [55, -55], dy: 27, aL: [-16, -60], aR: [16, 60] }, o.arms || {});
    const oo = Object.assign({}, o); delete oo.arms;
    return R.g([R.chair(x, y + 2, s * 1.8), R.person(sp, Object.assign({ x, y, s, pose: 'sit', angles: ang }, oo))]);
  }
  // 牽著手走進來的長輩與孩子
  function family(x, y, s, t, seedA, seedK, ph) {
    return R.g([
      R.person(R.villager(seedA, { elder: true }), { x, y, s, pose: 'holdR', p: R.loop(t, 2, ph), angles: Object.assign(walkLegs(t, ph), { aR: [55, 14] }) }),
      R.person(R.villager(seedK, { kid: true }), { x: x + 118 * s, y: y + 4, s: s * 0.95, pose: 'holdL', angles: Object.assign(walkLegs(t, ph + 0.5), { aL: [-120, -10] }) }),
    ]);
  }
  function walkLegs(t, ph) { const s1 = R.wave(t, 2, ph); return { lL: [-20 * s1, 6], lR: [20 * s1, -6], dy: -5 * Math.abs(R.wave(t, 2, ph + 0.25)) }; }
  // 學堂屋簷上的彩帶（三條）
  function eaveBunting(x, y, s, t) {
    const hw = 490 * s, top = y - 392 * s, eave = y - 232 * s;
    return R.g([
      R.bunting(x - hw, eave, x + hw, eave, 46 * s, 14, t, { size: 34 * s }),
      R.bunting(x, top + 6, x - hw - 20, eave - 20, 40 * s, 8, t, { size: 30 * s }),
      R.bunting(x, top + 6, x + hw + 20, eave - 20, 40 * s, 8, t, { size: 30 * s }),
    ]);
  }

  // ── c7a：雨停了的早晨。藍天、白雲、太陽；水窪映著天空，葉子和玫瑰上的水珠閃光，鳥飛過
  R.scene('c7a', 3.2, t => [
    R.sky('clear', 640),
    R.sun(1640, 170, 66, t),
    R.cloud(330 + 14 * R.wave(t), 170, 0.85), R.cloud(1080 + 12 * R.wave(t, 1, 0.4), 120, 0.7),
    R.ridge({ y: 540, amp: 40, seed: 71, color: P.mtFar }),
    R.schoolhouse(980, 600, 0.86, { doorOpen: true }),
    ground(600, P.yard, { amp: 6 }),
    ground(650, P.yardD, { amp: 8, ph: 1 }),
    R.tree(210, 660, 0.95, t, { kind: 'banyan' }),
    glints([[70, 300, 14], [180, 230, 12], [300, 290, 16], [380, 360, 12], [120, 400, 12]], t),
    dropFall([[150, 470, 120], [330, 450, 130]], t),
    R.stage(960, 660, 0.78, {}),
    skyPuddle(560, 720, 170, t), skyPuddle(1240, 690, 130, t), skyPuddle(820, 790, 150, t),
    // 走出學堂看天空的黑狗兄和阿晴（中景）
    R.person('heigou', Object.assign({ x: 1300, y: 650, s: 0.6, pose: 'cheer', p: R.cyc(t), mouth: 'laugh', eyes: 'up' }, HG)),
    R.person('aqing', { x: 1400, y: 652, s: 0.6, pose: 'point', mouth: 'smile', eyes: 'up', angles: { aR: [150 + 6 * R.wave(t, 1), 4] } }),
    R.roseBush(1660, 700, 1.15, t, { bloom: 1, seed: 6 }),
    glints([[1560, 590, 14], [1640, 560, 12], [1730, 580, 15], [1800, 620, 11], [1590, 640, 10]], t),
    dropFall([[1520, 640, 70], [1780, 650, 60]], t),
    R.bird(R.lerp(-80, 2000, R.cyc(t)), 300 + 20 * R.wave(t, 1), 0.9, t, 4), R.bird(R.lerp(-200, 1880, R.cyc(t)), 340 + 18 * R.wave(t, 1, 0.3), 0.7, t, 4, 0.3), R.bird(R.lerp(-320, 1760, R.cyc(t)), 270 + 18 * R.wave(t, 1, 0.6), 0.6, t, 4, 0.6),
  ]);

  // ── c7b：老學堂掛上彩帶，舞台立好；花圃旁排滿椅子，村民帶著家人入座，台上的人向台下揮手
  R.scene('c7b', 3.2, t => [
    R.sky('clear', 620),
    R.sun(1720, 150, 56, t),
    R.cloud(560 + 12 * R.wave(t), 130, 0.7), R.cloud(1400 + 10 * R.wave(t, 1, 0.5), 110, 0.6),
    R.ridge({ y: 520, amp: 36, seed: 72, color: P.mtFar }),
    R.schoolhouse(940, 560, 0.8, { doorOpen: true }),
    eaveBunting(940, 560, 0.8, t),
    ground(560, P.yard, { amp: 6 }),
    ground(620, P.yardD, { amp: 8, ph: 1 }),
    R.tree(150, 650, 0.88, t, { kind: 'banyan' }),
    R.bunting(300, 300, 560, 330, 50, 7, t, { size: 30 }),
    R.stage(880, 650, 0.78, { banner: '#E8475F' }),
    // 台上揮手
    ...[['f1', -2], ['heigou', -1], ['aqing', 0], ['f2', 1], ['f3', 2]].map(([w, k], i) => R.person(w, Object.assign({ x: 880 + k * 100, y: 594, s: 0.52, pose: 'wave', p: R.loop(t, 1, i * 0.2), mouth: 'laugh' }, w === 'heigou' ? HG : {}))),
    // 花圃旁的椅子（後排、前排）
    R.roseBush(1760, 650, 0.95, t, { bloom: 1, seed: 6 }),
    ...[1260, 1360, 1460, 1560].map((x, i) => i === 1 ? R.chair(x, 620, 1.0) : seated(R.villager(710 + i, {}), x, 618, 0.56, t, { mouth: 'smile', arms: i === 3 ? { aR: [150, 10 + 25 * R.wave(t, 2)] } : {} })),
    ...[1300, 1420, 1540, 1660].map((x, i) => i === 2 ? R.chair(x, 698, 1.2) : seated(R.villager(720 + i, { elder: i === 0, kid: i === 3 }), x, 696, i === 3 ? 0.62 : 0.66, t, { mouth: 'smile' })),
    // 走進來的家人
    family(330, 706, 0.74, t, 731, 732, 0),
    family(560, 712, 0.7, t, 733, 734, 0.4),
    R.butterfly(1640 + 30 * R.wave(t, 1), 470 + 20 * R.wave(t, 2), 1.1, t, 4, '#F6B731'),
  ]);

  // ── c7c：台上近景。胸前別著玫瑰的黑狗兄，頭靠向阿晴小聲說話，小愛心飄起；背景是彩帶、舞台背板、柔和聚光
  R.scene('c7c', 3.2, t => [
    R.sky('clear', 400),
    R.schoolhouse(960, 600, 1.5),
    R.rect(0, 380, 1920, 700, '#E3CFA6'),
    R.rect(270, 150, 1380, 560, '#D9B98A'),
    R.g([0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => R.line(270 + i * 153, 330, 270 + i * 153, 700, '#C49F6E', 4))),
    // 舞台背板（近景放大）
    R.rect(250, 120, 34, 760, P.woodD), R.rect(1636, 120, 34, 760, P.woodD),
    R.rect(240, 92, 1440, 60, P.wood, { rx: 10 }),
    R.rect(330, 170, 1260, 160, '#E8475F', { rx: 16 }),
    R.g([0, 1, 2, 3, 4, 5].map(i => R.circle(460 + i * 200, 250, 30, '#F6C631', { opacity: 0.9 }))),
    R.bunting(-40, 40, 980, 60, 80, 12, t, { size: 40 }),
    R.bunting(940, 60, 1960, 40, 80, 12, t, { size: 40 }),
    spot(960, 340, 180, 420, 710, '#F7EBCB'),
    spot(960, 340, 120, 300, 710, '#FBF2DA'),
    // 台面
    R.rect(-20, 700, 1960, 400, P.wood), R.rect(-20, 692, 1960, 18, P.woodL),
    R.line(-20, 780, 1940, 780, P.woodD, 4, { opacity: 0.4 }), R.line(-20, 890, 1940, 890, P.woodD, 4, { opacity: 0.4 }),
    R.person('heigou', Object.assign({ x: 870, y: 744, s: 1.08, pose: 'stand', mouth: 'o', blush: true, angles: { tilt: 10 + 4 * R.wave(t, 1), aR: [40, 50] } }, HG)),
    R.person('aqing', { x: 1056, y: 746, s: 1.08, pose: 'shy', mouth: 'smile', blush: true, angles: { tilt: -4 + 2 * R.wave(t, 1, 0.25), aR: [150, 70], aL: [-10, 30] } }),
    heartsUp(964, 420, 220, 5, t, 1.1),
    R.sparkle(560, 420, 18, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(1380, 460, 16, '#FFF3B0', 0.5 + 0.5 * R.wave(t, 2, 0.5)),
  ]);

  // ── c7d：阿晴笑著點頭，台下觀眾鼓掌，彩紙飄落，台上大家一起唱
  R.scene('c7d', 3.2, t => [
    R.sky('clear', 600),
    R.cloud(380 + 12 * R.wave(t), 130, 0.7), R.cloud(1500 + 10 * R.wave(t, 1, 0.5), 120, 0.65),
    R.ridge({ y: 500, amp: 36, seed: 73, color: P.mtFar }),
    R.schoolhouse(960, 540, 0.78, { doorOpen: true }),
    eaveBunting(960, 540, 0.78, t),
    ground(540, P.yard, { amp: 6 }),
    ground(620, P.yardD, { amp: 8, ph: 1 }),
    R.stage(960, 640, 0.92, { banner: '#E8475F' }),
    // 台上合唱；阿晴在中間笑著點頭
    ...[['f1', -2], ['heigou', -1], ['f2', 1], ['f3', 2]].map(([w, k], i) => R.person(w, Object.assign({ x: 960 + k * 128 + (k > 0 ? 6 : -6), y: 576, s: 0.64, pose: 'sing', p: R.loop(t, 1, i * 0.2), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.25) }, w === 'heigou' ? HG : {}))),
    R.person('aqing', { x: 960, y: 578, s: 0.66, pose: 'stand', eyes: 'closed', mouth: 'laugh', blush: true, angles: { tilt: 7 * Math.max(0, R.wave(t, 2)), aL: [-14, -8], aR: [14, 8], dy: 2 * Math.max(0, R.wave(t, 2)) } }),
    // 台下兩側鼓掌的觀眾
    R.tree(90, 660, 0.8, t, { kind: 'banyan' }),
    ...[[190, 0], [330, 1], [470, 2]].map(([x, i]) => R.person(R.villager(740 + i, { elder: i === 1, kid: i === 2 }), { x, y: 700 + (i % 2) * 8, s: i === 2 ? 0.64 : 0.7, pose: 'clap', p: R.loop(t, 2, i * 0.3), mouth: 'laugh' })),
    R.roseBush(1800, 640, 0.9, t, { bloom: 1, seed: 6 }),
    ...[[1450, 0], [1590, 1], [1730, 2]].map(([x, i]) => R.person(R.villager(750 + i, { elder: i !== 1, kid: i === 1, female: i === 0 }), { x, y: 704 + (i % 2) * 6, s: i === 1 ? 0.62 : 0.7, pose: 'clap', p: R.loop(t, 2, 0.15 + i * 0.3), mouth: 'laugh' })),
    confettiIn(76, 60, t, 0, 1920, -40, 760),
  ]);

  // ── s7：歌曲頁〈幸福進行曲〉合唱。右半：掛滿彩帶的舞台，大家一起唱，彩紙與音符；左半是安靜的天空與彩帶
  R.scene('s7', 3.2, t => [
    R.sky('clear'),
    R.cloud(260 + 10 * R.wave(t), 170, 0.65), R.cloud(700 + 10 * R.wave(t, 1, 0.4), 120, 0.5),
    R.bunting(-40, 60, 980, 90, 90, 12, t, { size: 34 }),
    R.ridge({ y: 820, amp: 30, seed: 74, color: P.mtFar }),
    ground(860, P.grass, { amp: 8 }),
    R.schoolhouse(1440, 640, 0.66),
    R.bunting(960, 120, 1960, 100, 110, 11, t, { size: 38 }),
    R.bunting(1000, 200, 1920, 230, 70, 10, t, { size: 32, colors: [P.rainbow[2], P.rainbow[0], P.rainbow[4], P.rainbow[3], P.rainbow[1], P.rainbow[6]] }),
    R.stage(1440, 820, 1.06, { banner: '#E8475F' }),
    R.bunting(1100, 420, 1780, 420, 60, 9, t, { size: 30 }),
    // 台上：好友、黑狗兄、阿晴
    ...[['f1', -2], ['heigou', -1], ['aqing', 0], ['f2', 1], ['f3', 2]].map(([w, k], i) => R.person(w, Object.assign({ x: 1440 + k * 132, y: 738, s: 0.72, pose: 'sing', p: R.loop(t, 1, i * 0.18), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.22) }, w === 'heigou' ? HG : {}))),
    // 台前：村民（長輩、小孩）一起唱
    R.roseBush(1870, 960, 0.9, t, { bloom: 1, seed: 6 }),
    ...[[1090, 0], [1250, 1], [1410, 2], [1570, 3], [1720, 4]].map(([x, i]) => R.person(R.villager(760 + i, { elder: i % 2 === 0, kid: i === 3, spec: i === 1 ? { style: 'short', shirt: '#E9E2D0' } : undefined }), { x, y: 1040, s: i === 3 ? 0.66 : 0.74, pose: i === 3 ? 'cheer' : 'sing', p: R.loop(t, 1, 0.1 + i * 0.17), mouth: 'sing', mouthK: R.wave(t, 2, 0.1 + i * 0.2) })),
    R.noteStream(1180, 560, 120, -420, 5, t, { s: 1.1 }),
    R.noteStream(1700, 560, 120, -420, 5, t, { s: 1.0, k: 1 }),
    confettiIn(77, 34, t, 980, 1920, -40, 1000),
  ]);
})();
