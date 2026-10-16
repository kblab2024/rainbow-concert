// 第 6 章〈追夢人〉（合唱）
// 庭院配置照 STYLE.md 5.5：學堂在後方中間、大榕樹在左、玫瑰花圃在右前、舞台在學堂前。
(function () {
  const R = RC, P = R.P;
  // 第 6 章的鄰居（c6c、c6d 同一個鄰居同一個樣子）。上衣避開好友的綠（f1）、藍帽（f2）
  const tint = (v, c) => Object.assign(v, { shirt: c }, v.dress ? { dress: c } : {});
  const NB = {
    hammer: tint(R.villager(601, { female: false, elder: false }), '#E9E2D0'),
    helper: tint(R.villager(602, { female: false, elder: false, spec: { style: 'short' } }), '#E86F5C'),
    teaGran: tint(R.villager(603, { elder: true, female: true }), '#F49AB0'),
  };

  // ── 區域零件 ──
  // 暗色雨雲
  const darkCloud = (x, y, s) => R.cloud(x, y, s, { color: '#5D6880', shade: '#4B556C' });
  // 整片背景調暗（不透明度固定，不隨時間變，不會產生色帶閃動）
  const dim = (c, a, y1 = 1080) => R.rect(0, 0, 1920, y1, c, { opacity: a });
  // 被風吹彎的大榕樹：以樹根為軸 skewX，往右彎（和雨絲斜向一致）
  function bentBanyan(x, y, s, t, k) {
    const sk = -k - 3 * R.wave(t, 2);
    return R.g(R.tree(x, y, s, t, { kind: 'banyan', sway: 10 }), { transform: `translate(${x} ${y}) skewX(${R.f(sk)}) translate(${-x} ${-y})` });
  }
  // 倒下的舞台：台面歪一邊，背板整片平倒在台前地上（看得出是倒下的背板）
  function fallenStage(x, y, s, o = {}) {
    const b = o.banner || '#C9A24A';
    return R.at(x, y, s, [
      // 台面（左腳斷了，往左下歪）
      R.g([R.rect(-340, -70, 680, 70, P.wood), R.rect(-340, -78, 680, 14, P.woodL), R.line(-340, -36, 340, -36, P.woodD, 3, { opacity: 0.5 }), R.rect(308, 0, 22, 20, P.woodD)], { transform: 'rotate(-5 330 0)' }),
      // 平倒的背板（透視壓扁的框）
      R.poly([[-380, 40], [300, 40], [360, 110], [-450, 110]], P.woodD, { opacity: 0.35 }),
      R.path('M-390 30 L310 30 L370 100 L-460 100 Z', 'none', { stroke: P.woodD, strokeWidth: 16, strokeLinejoin: 'round' }),
      R.path('M-300 46 L230 46 L268 86 L-350 86 Z', b),
      R.rect(-470, 92, 850, 22, P.wood, { rx: 6, transform: 'rotate(1 -50 100)' }),
    ]);
  }
  // 斷掉垂下的彩帶：一端還掛在屋簷，另一端隨風晃
  function brokenBunting(x1, y1, len, dir, t, ph) {
    const x2 = x1 + dir * 60 + 24 * R.wave(t, 1, ph), y2 = y1 + len;
    return R.bunting(x1, y1, x2, y2, 14 * dir, 5, t, { size: 28 });
  }
  // 被風吹走的葉子（一個循環飛過一段）
  function leaves(seed, n, t, x0, x1, y0, y1) {
    const r = R.rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const u = R.loop(t, 1, r()), x = R.lerp(x0, x1, u), y = R.lerp(y0, y1, r()) + 40 * R.wave(u, 2, r()), rot = 360 * R.cyc(t, 2) + r() * 360;
      out.push(R.ellipse(0, 0, 12, 6, i % 2 ? P.leaf : P.leafL, { transform: `translate(${R.f(x)} ${R.f(y)}) rotate(${R.f(rot)})`, opacity: R.f(R.fadeLoop(u)) }));
    }
    return R.g(out);
  }
  // 頭髮滴下的雨水
  function drips(x, y, s, t) {
    const out = [];
    [[-34, -262], [30, -258], [-6, -300]].forEach(([dx, dy], i) => {
      const u = R.loop(t, 2, i / 3), px = x + dx * s, py = y + dy * s + 90 * s * u;
      out.push(R.ellipse(px, py, 4 * s, 7 * s, '#BFE0F2', { opacity: R.f(0.9 * R.fadeLoop(u)) }));
    });
    return R.g(out);
  }
  // 光束（雲縫透出的晨光；固定不動、小面積）
  function rays(x, y, list, color) {
    return R.g(list.map(([a, w, L]) => {
      const r1 = a * Math.PI / 180, r2 = (a + w) * Math.PI / 180;
      return R.poly([[x, y], [x + L * Math.sin(r1), y + L * Math.cos(r1)], [x + L * Math.sin(r2), y + L * Math.cos(r2)]], color, { opacity: 0.22 });
    }));
  }
  // 地面（自己畫到畫面右緣外，右邊不會露出斜角）
  function ground(y, color, o = {}) {
    const pts = [];
    for (let x = -40; x <= 2000; x += 120) pts.push([x, y + (o.amp || 10) * Math.sin(x / 260 + (o.ph || 0))]);
    return R.path(R.smooth(pts) + ' L2000 1100 L-40 1100 Z', color);
  }
  // 歪掉的舞台：背板以底部中間為軸往左歪 ang 度（台面擋住軸心）
  function leaningStage(x, y, s, ang, o = {}) {
    const back = R.g([R.rect(-300, -360, 18, 360, P.woodD), R.rect(282, -360, 18, 360, P.woodD), R.rect(-300, -380, 600, 34, P.wood, { rx: 6 }), R.rect(-250, -340, 500, 70, o.banner || '#E9C46A', { rx: 8 })], { transform: `rotate(${R.f(ang)} 0 -20)` });
    return R.at(x, y, s, [back, R.rect(-340, -70, 680, 70, P.wood), R.rect(-340, -78, 680, 14, P.woodL), R.line(-340, -36, 340, -36, P.woodD, 3, { opacity: 0.5 }), R.rect(-330, 0, 22, 20, P.woodD), R.rect(308, 0, 22, 20, P.woodD)]);
  }
  // 一排倒掉的椅子
  const fallenChairs = (list) => R.g(list.map(([x, y, s, a]) => R.chair(x, y, s, { fallen: a })));

  // ── c6a：大雨的夜裡，庭院積水，舞台被風吹倒，椅子也倒了；沒有人
  R.scene('c6a', 3.2, t => [
    R.sky('storm', 640),
    darkCloud(380 + 14 * R.wave(t), 120, 1.0), darkCloud(1000 + 12 * R.wave(t, 1, 0.3), 90, 1.2), darkCloud(1620 + 12 * R.wave(t, 1, 0.6), 150, 0.95),
    R.ridge({ y: 560, amp: 30, seed: 61, color: '#4E5C6B' }),
    R.schoolhouse(1010, 610, 0.85),
    dim('#26304A', 0.42, 700),
    brokenBunting(600, 420, 170, 1, t, 0), brokenBunting(1420, 420, 140, -1, t, 0.4),
    ground(616, '#69756C', { amp: 6 }),
    ground(660, '#5F6B62', { amp: 8, ph: 1 }),
    bentBanyan(260, 680, 0.92, t, 10),
    R.puddle(760, 700, 190, t, { color: '#7D98AE' }), R.puddle(1420, 668, 120, t, { color: '#7D98AE' }), R.puddle(380, 770, 170, t, { color: '#7D98AE' }),
    fallenStage(980, 600, 0.9, {}),
    fallenChairs([[1300, 682, 1.15, -78], [1460, 664, 1.05, 96], [1180, 694, 1.0, -60]]),
    R.roseBush(1690, 660, 0.95, t, { bloom: 0.7, seed: 6 }),
    R.splashes(61, 22, 200, 1800, 640, 760, t, { k: 3 }),
    leaves(62, 6, t, 1900, -40, 240, 600),
    R.petals(63, 8, t, { x0: 1500, x1: 1900, y0: 560, y1: 760, k: 1 }),
    R.rain(64, 110, t, { k: 3, angle: 16, len: 54, color: '#C9D9EA', opacity: 0.7, y1: 840 }),
    R.flash(t, 0.32, { x: 1560, y: 0 }),
  ]);

  // ── c6b：黑狗兄站在雨中，看著倒掉的舞台和椅子，難過地低頭
  R.scene('c6b', 3.2, t => [
    R.sky('storm', 620),
    darkCloud(300 + 12 * R.wave(t), 140, 1.0), darkCloud(1100 + 12 * R.wave(t, 1, 0.4), 100, 1.1), darkCloud(1750 + 10 * R.wave(t, 1, 0.7), 170, 0.9),
    R.ridge({ y: 540, amp: 30, seed: 62, color: '#4E5C6B' }),
    R.schoolhouse(1180, 580, 0.68),
    R.tree(150, 640, 0.75, t, { kind: 'banyan', sway: 8 }),
    dim('#26304A', 0.45, 680),
    ground(600, '#66716A', { amp: 6 }),
    ground(650, '#5B665E', { amp: 8, ph: 2 }),
    fallenStage(560, 600, 0.85, {}),
    fallenChairs([[1380, 690, 1.2, -78], [1560, 672, 1.1, 100], [860, 700, 1.05, 70]]),
    R.puddle(1060, 742, 150, t, { color: '#7D98AE' }), R.puddle(1500, 720, 130, t, { color: '#7D98AE' }),
    R.person('heigou', { x: 1060, y: 730, s: 1.0, pose: 'sad', mouth: 'sad', shirt: 'yellow', rose: false, angles: { tilt: 9 + 2.5 * R.wave(t, 1), aL: [-6 + 2 * R.wave(t, 1), -4], aR: [6 - 2 * R.wave(t, 1), 4] } }),
    drips(1060, 730, 1.0, t),
    R.splashes(71, 24, 200, 1800, 660, 780, t, { k: 3 }),
    R.rain(72, 110, t, { k: 3, angle: 14, len: 52, color: '#C9D9EA', opacity: 0.7, y1: 840 }),
    dim('#2C3D67', 0.1),
  ]);

  // ── c6c：雨變小了；阿晴扶起椅子，好友帶著掃把、工具走來，鄰居修舞台，長輩端熱茶；燈籠暖光
  R.scene('c6c', 3.2, t => [
    R.sky('night', 640),
    darkCloud(420 + 12 * R.wave(t), 120, 0.9), darkCloud(1500 + 10 * R.wave(t, 1, 0.5), 100, 1.0),
    R.ridge({ y: 540, amp: 30, seed: 63, color: '#3E4E66' }),
    R.schoolhouse(990, 560, 0.8, { lit: true }),
    dim('#26304A', 0.25, 640),
    ground(590, '#7A7E70', { amp: 6 }),
    ground(640, '#6E7465', { amp: 8, ph: 1 }),
    R.tree(150, 660, 0.85, t, { kind: 'banyan' }),
    R.lantern(330, 300, 0.9, t), R.lantern(640, 360, 0.8, t, { ph: 0.3 }), R.lantern(1340, 360, 0.8, t, { ph: 0.6 }),
    R.puddle(560, 760, 150, t, { color: '#8AA4B8' }), R.puddle(1500, 740, 120, t, { color: '#8AA4B8' }),
    leaningStage(760, 640, 0.82, -16 + 1.5 * R.wave(t, 1)),
    // 修舞台的兩個鄰居：一個敲槌子、一個撐住背板
    R.person(NB.hammer, { x: 560, y: 690, s: 0.78, pose: 'reach', prop: 'hammer', angles: { aR: [120 + 22 * R.wave(t, 2), 10] }, mouth: 'smile' }),
    R.person(NB.helper, { x: 430, y: 690, s: 0.78, pose: 'cheer', p: 0.25, angles: { aL: [-150, 10], aR: [165, -10] } }),
    // 一旁看著的黑狗兄（還沒回過神）
    R.person('heigou', { x: 210, y: 700, s: 0.82, pose: 'stand', mouth: 'o', shirt: 'yellow', angles: { tilt: 3 * R.wave(t, 1) } }),
    // 長輩端熱茶
    R.person(NB.teaGran, { x: 1000, y: 700, s: 0.8, pose: 'carry', prop: 'tea', p: R.cyc(t) }),
    // 阿晴扶起椅子
    R.chair(1290, 690, 0.85),
    R.person('aqing', { x: 1150, y: 700, s: 0.88, pose: 'lift', prop: 'chair', chairTilt: -40 + 40 * (0.5 + 0.5 * R.wave(t, 1)) }),
    R.roseBush(1720, 620, 0.85, t, { bloom: 0.8, seed: 6 }),
    // 三位好友走來
    R.person('f1', { x: 1470, y: 700, s: 0.78, pose: 'walk', p: R.loop(t, 2, 0), prop: 'hammer' }),
    R.person('f2', { x: 1620, y: 712, s: 0.78, pose: 'walk', p: R.loop(t, 2, 0.3), prop: 'broom', angles: { aR: [150 + 6 * R.wave(t, 2), 10] } }),
    R.person('f3', { x: 1780, y: 704, s: 0.78, pose: 'walk', p: R.loop(t, 2, 0.6), prop: 'broom', angles: { aR: [150 + 6 * R.wave(t, 2, 0.3), 10] } }),
    R.rain(81, 45, t, { k: 3, angle: 10, len: 38, color: '#C9D9EA', opacity: 0.5 }),
  ]);

  // ── c6d：雨快停了，雲縫透出晨光；大家一邊唱一邊把舞台背板扶回去，音符升起
  R.scene('c6d', 3.2, t => [
    R.sky('dawn', 640),
    rays(1460, 140, [[-30, 7, 760], [-10, 6, 820], [12, 6, 760], [34, 5, 700]], '#FFF1C8'),
    R.sun(1460, 140, 46, t, { rays: 0 }),
    darkCloud(300 + 12 * R.wave(t), 130, 1.1), R.cloud(1180 + 10 * R.wave(t, 1, 0.3), 120, 0.9, { color: '#C9CED8', shade: '#AEB5C2' }), R.cloud(1760 + 10 * R.wave(t, 1, 0.6), 110, 0.85, { color: '#E8DDD8', shade: '#CFC3C2' }),
    R.ridge({ y: 540, amp: 30, seed: 64, color: '#8FA3A0' }),
    R.schoolhouse(990, 570, 0.8),
    ground(590, '#B9B08E', { amp: 6 }),
    ground(640, '#A9A27F', { amp: 8, ph: 1 }),
    R.tree(150, 670, 0.85, t, { kind: 'banyan' }),
    R.puddle(560, 760, 150, t, { color: '#E9CDB4' }), R.puddle(1450, 750, 120, t, { color: '#E9CDB4' }),
    R.stage(900, 640, 0.82, { fallen: 0.04 * (0.5 + 0.5 * R.wave(t, 1)), banner: '#E9C46A' }),
    R.roseBush(1730, 640, 0.85, t, { bloom: 0.9, seed: 6 }),
    // 撐住背板兩側的人：黑狗兄（左柱）、阿壯（右柱）
    R.person('heigou', { x: 600, y: 700, s: 0.84, pose: 'singUp', p: R.cyc(t), mouth: 'sing', mouthK: R.wave(t, 2), shirt: 'yellow', rose: false, angles: { aL: [-150, 20], aR: [140 + 6 * R.wave(t, 1), -30] } }),
    R.person('f2', { x: 1190, y: 700, s: 0.82, pose: 'singUp', p: R.cyc(t), mouth: 'sing', mouthK: R.wave(t, 2, 0.3), angles: { aL: [-140 - 6 * R.wave(t, 1), 30], aR: [150, -20] } }),
    // 中間一起唱的人
    R.person('f1', { x: 760, y: 712, s: 0.78, pose: 'sing', p: R.loop(t, 1, 0.2), mouth: 'sing', mouthK: R.wave(t, 2, 0.1), prop: 'hammer' }),
    R.person('aqing', { x: 930, y: 716, s: 0.82, pose: 'sing', p: R.loop(t, 1, 0.4), mouth: 'sing', mouthK: R.wave(t, 2, 0.5) }),
    R.person('f3', { x: 1060, y: 714, s: 0.78, pose: 'sing', p: R.loop(t, 1, 0.6), mouth: 'sing', mouthK: R.wave(t, 2, 0.7) }),
    R.person(NB.teaGran, { x: 1360, y: 706, s: 0.76, pose: 'sing', p: R.loop(t, 1, 0.1), mouth: 'sing', mouthK: R.wave(t, 2, 0.2) }),
    R.person(R.villager(604, { kid: true }), { x: 1490, y: 712, s: 0.7, pose: 'sweep', p: R.cyc(t, 2), prop: 'broom', mouth: 'sing' }),
    R.person(NB.hammer, { x: 400, y: 708, s: 0.76, pose: 'sing', p: R.loop(t, 1, 0.8), mouth: 'sing', mouthK: R.wave(t, 2, 0.9), prop: 'hammer' }),
    R.noteStream(860, 440, 180, -400, 4, t, { s: 0.85 }),
    R.noteStream(1260, 460, 220, -380, 4, t, { s: 0.8 }),
    R.rain(91, 14, t, { k: 3, angle: 8, len: 30, color: '#E4ECF4', opacity: 0.45, y1: 640 }),
  ]);

  // ── s6：歌曲頁〈追夢人〉合唱。星空下重新搭好的舞台（右半），大家仰望星空唱歌，流星劃過；左半是安靜的星空
  R.scene('s6', 3.2, t => [
    R.sky('night'),
    R.stars(66, 34, t, 640),
    R.moon(230, 150, 44),
    R.shootingStar(t, 1880, 70, 1250, 300, 0.25, 0.16),
    R.ridge({ y: 760, amp: 30, seed: 65, color: '#2F4560' }),
    R.schoolhouse(1480, 760, 0.62, { lit: true }),
    ground(800, '#3D5A55', { amp: 8 }),
    R.at(1830, 830, 0.7, R.roseBush(0, 0, 1, t, { bloom: 1, seed: 6 })),
    R.stage(1440, 900, 1.05, { banner: '#E9C46A' }),
    // 台上五人仰望星空唱
    ...[['f1', -2], ['heigou', -1], ['aqing', 0], ['f2', 1], ['f3', 2]].map(([w, k], i) => R.person(w, { x: 1440 + k * 132, y: 822, s: 0.74, pose: k === 0 ? 'singUp' : 'sing', p: R.loop(t, 1, i * 0.18), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.2), eyes: 'up', shirt: w === 'heigou' ? 'yellow' : undefined, rose: false })),
    R.noteStream(1300, 520, 120, -380, 5, t, { s: 1.0, colors: ['#FFE08A', '#FFFFFF', '#F6B731'] }),
    R.noteStream(1600, 520, 140, -400, 5, t, { s: 0.9, k: 1, colors: ['#FFFFFF', '#FFE08A', '#F57D96'] }),
  ]);
})();
