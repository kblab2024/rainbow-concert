// 第 4 章〈請跟我來〉（合唱）。老學堂庭院配置照 STYLE.md 5.5：學堂在後方中間、大榕樹在學堂左邊、玫瑰花圃在學堂右前方。
(function () {
  const R = RC, P = R.P;

  // R.ground 的最後一個取樣點在 x 1880，右緣會露出斜角；底下先鋪一塊同色矩形補起來
  const ground = (y, color, o) => [R.rect(-20, y + 12, 1960, 1100 - y, color), R.ground(y, color, o)];

  // 手繪海報（不寫字）：木樁上釘一張紙，紙上畫彩虹和音符，被風吹得輕輕擺
  function poster(x, y, s, t) {
    const sway = 2.5 * R.wave(t, 1, 0.3);
    return R.at(x, y, s, [
      R.rect(-7, -250, 14, 250, P.woodD, { rx: 4 }),
      R.g([
        R.rect(-124, -310, 248, 176, P.white, { rx: 8 }),
        R.rect(-124, -310, 248, 176, 'none', { rx: 8, stroke: '#E7D3AE', strokeWidth: 5 }),
        R.rainbow(0, -158, 96, 10, 1),
        R.note(-82, -262, 0.55, P.noteRed, 0), R.note(84, -268, 0.5, P.noteBlue, 1),
        R.heart(0, -176, 0.55, P.heart),
        R.rect(-108, -318, 30, 14, '#F2D88A', { rx: 3, transform: 'rotate(-12 -93 -311)' }),
        R.rect(78, -318, 30, 14, '#F2D88A', { rx: 3, transform: 'rotate(12 93 -311)' }),
      ], { transform: `rotate(${R.f(sway)} 0 -310)` }),
    ]);
  }

  // 老學堂窗戶的暖光（疊在 schoolhouse 的窗上，輕輕明暗）。x,y,s 同 schoolhouse
  function windowGlow(x, y, s, t, o = {}) {
    const w = o.w || 980, h = 230, n = 7, aw = (w - 80) / n, out = [];
    for (let i = 0; i < n; i++) {
      if (i === 3) continue;
      const ax = -w / 2 + 40 + i * aw;
      out.push(R.rect(ax + 28, -h + 92, aw - 56, 92, '#FFF6CC', { rx: 4, opacity: R.f(0.18 + 0.18 * (0.5 + 0.5 * R.wave(t, 1, i * 0.15))) }));
    }
    return R.at(x, y, s, out);
  }

  // 樹蔭下的光點
  function dapple(seed, n, x0, x1, y0, y1, t) {
    const r = R.rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const x = R.lerp(x0, x1, r()), y = R.lerp(y0, y1, r()), w = 16 + r() * 20, ph = r();
      out.push(R.ellipse(x, y, w, w * 0.32, '#F7E7BE', { opacity: R.f(0.35 + 0.35 * R.wave(t, 1, ph)) }));
    }
    return R.g(out);
  }

  // 走進門的鄰居：從 (x0,y0,s0) 走到 (x1,y1,s1)，開頭淡入、到門口淡出；u 為 0..1
  function walker(sp, x0, y0, s0, x1, y1, s1, u, t) {
    const e = u, op = Math.min(1, u / 0.12, (1 - u) / 0.14);
    return R.g(R.person(sp, { x: R.lerp(x0, x1, e), y: R.lerp(y0, y1, e), s: R.lerp(s0, s1, e), pose: 'walk', p: R.cyc(t, 4) }), { opacity: R.f(R.clamp(op)) });
  }

  // ── c4a：日出，小坡上黑狗兄握拳下定決心，阿晴在旁拍手；旁邊一張畫著彩虹和音符的手繪海報
  R.scene('c4a', 3.2, t => [
    R.sky('dawn'),
    R.sun(1560, 400, 84, t, { rays: 12 }),
    R.cloud(1020 + 12 * R.wave(t), 170, 0.75), R.cloud(1820 + 10 * R.wave(t, 1, 0.4), 130, 0.55),
    R.cloud(300 + 10 * R.wave(t, 1, 0.7), 230, 0.6),
    R.ridge({ y: 600, amp: 40, seed: 51, color: P.mtFar }),
    R.peak(1180, 690, 0.55, 'day', t),
    R.ridge({ y: 668, amp: 18, seed: 52, color: P.mtNear }),
    R.village(1560, 690, 0.5, t),
    ground(690, P.grass),
    R.hill(700, 960, 2600, 190, P.grassL, { sharp: 1.0 }),
    R.tufts(53, 20, 60, 1500, 790, 880, t, { color: P.grassD, size: 1.1 }),
    poster(1150, 806, 1.05, t),
    R.person('aqing', { x: 590, y: 800, s: 1.05, pose: 'clap', p: R.cyc(t, 2), mouth: 'laugh', blush: true }),
    R.person('heigou', { x: 840, y: 792, s: 1.1, pose: 'fist', shirt: 'yellow', mouth: 'grin',
      angles: { aR: [148 + 8 * R.wave(t, 2), 34 + 8 * R.wave(t, 2)], dy: -4 * (0.5 + 0.5 * R.wave(t, 2)) } }),
    R.sparkle(960, 440, 24, '#FFF0A0', 0.4 + 0.6 * (0.5 + 0.5 * R.wave(t, 2))),
    R.sparkle(870, 400, 15, '#FFF0A0', 0.4 + 0.6 * (0.5 + 0.5 * R.wave(t, 2, 0.5))),
    R.bird(R.lerp(-80, 2000, R.cyc(t)), 300 + 20 * R.wave(t, 1), 0.8, t, 4), R.bird(R.lerp(-180, 1900, R.cyc(t)), 330 + 20 * R.wave(t, 1, 0.3), 0.6, t, 4, 0.3),
  ]);

  // ── c4b：阿晴牽著黑狗兄的手往右走（阿晴在前帶路），三位好友跟在後面；小路穿過竹林，遠方露出老學堂的灰瓦屋頂
  R.scene('c4b', 3.2, t => {
    const wp = i => R.loop(t, 2, i * 0.12);
    return [
      R.sky('day', 640),
      R.cloud(640 + 12 * R.wave(t), 150, 0.7), R.cloud(1300 + 10 * R.wave(t, 1, 0.5), 110, 0.55),
      R.ridge({ y: 520, amp: 40, seed: 61, color: P.mtFar }),
      R.schoolhouse(1600, 640, 0.42),
      R.hill(1560, 646, 1000, 100, P.mtMid, { sharp: 0.6 }),
      R.ridge({ y: 640, amp: 20, seed: 62, color: P.mtNear }),
      R.bamboo(260, 700, 0.9, t, { n: 5, seed: 4 }), R.bamboo(620, 690, 0.75, t, { n: 4, seed: 6, ph: 0.2 }),
      R.bamboo(1260, 690, 0.8, t, { n: 5, seed: 8, ph: 0.4 }), R.bamboo(1880, 700, 0.7, t, { n: 4, seed: 10, ph: 0.6 }),
      ground(690, P.grass),
      R.road([[1980, 712], [1500, 728], [1000, 746], [500, 768], [-60, 800]], 70, 150),
      R.tufts(63, 22, 0, 1920, 700, 720, t, { color: P.grassD }),
      // 三位好友跟在後面
      R.person('f1', { x: 300, y: 792, s: 0.86, pose: 'walk', p: wp(3), mouth: 'smile' }),
      R.person('f2', { x: 470, y: 788, s: 0.86, pose: 'walk', p: wp(4), mouth: 'grin' }),
      R.person('f3', { x: 640, y: 784, s: 0.86, pose: 'walk', p: wp(2), mouth: 'smile' }),
      // 黑狗兄右手（向右）牽阿晴左手
      R.person('heigou', { x: 940, y: 780, s: 0.95, pose: 'walk', p: wp(0), shirt: 'yellow', mouth: 'smile', blush: true, angles: { aR: [62, 18] } }),
      R.person('aqing', { x: 1150, y: 774, s: 0.95, pose: 'walk', p: wp(0), mouth: 'open', angles: { aL: [-62, -18] } }),
      R.bamboo(40, 1000, 1.25, t, { n: 3, seed: 12, ph: 0.1 }),
      R.bird(R.lerp(2000, -80, R.cyc(t)), 250 + 18 * R.wave(t, 1), 0.7, t, 4),
    ];
  });

  // ── c4c：大景。紅磚老學堂在後方中間，左邊大榕樹遮蔭，右前方荒著的玫瑰花圃；五個人剛走進泥土庭院，高興地四處看
  R.scene('c4c', 3.2, t => [
    R.sky('clear', 620),
    R.sun(1700, 150, 54, t, { rays: 10 }),
    R.cloud(1180 + 12 * R.wave(t), 120, 0.65), R.cloud(820 + 10 * R.wave(t, 1, 0.5), 200, 0.5),
    R.ridge({ y: 500, amp: 36, seed: 71, color: P.mtFar }),
    R.ridge({ y: 590, amp: 16, seed: 72, color: P.mtMid }),
    R.schoolhouse(1080, 620, 0.85),
    ground(624, P.yard, { amp: 4 }),
    R.path(R.smooth([[-40, 900], [400, 860], [900, 880], [1400, 860], [1960, 880]]) + ' L1960 1100 L-40 1100 Z', P.yardD),
    R.tree(330, 730, 0.95, t, { kind: 'banyan', sway: 6 }),
    dapple(74, 9, 90, 640, 760, 840, t),
    R.roseBush(1640, 730, 0.85, t, { wild: true, bloom: 0, seed: 5 }), R.roseBush(1840, 750, 0.9, t, { wild: true, bloom: 0, seed: 6 }),
    R.tufts(75, 10, 1500, 1920, 760, 820, t, { color: '#8A9A4F', size: 1.2 }),
    R.person('f1', { x: 660, y: 782, s: 0.78, pose: 'point', eyes: 'up', mouth: 'o', angles: { aR: [138 + 6 * R.wave(t, 1), 4] } }),
    R.person('heigou', { x: 820, y: 786, s: 0.82, pose: 'point', shirt: 'yellow', mouth: 'grin', eyes: 'up', angles: { aR: [146 + 6 * R.wave(t, 1, 0.3), 4] } }),
    R.person('aqing', { x: 990, y: 784, s: 0.8, pose: 'wave', p: R.cyc(t, 2), mouth: 'laugh' }),
    R.person('f2', { x: 1150, y: 788, s: 0.8, pose: 'cheer', p: R.cyc(t, 1), mouth: 'laugh' }),
    R.person('f3', { x: 1310, y: 784, s: 0.78, pose: 'wave', p: R.loop(t, 2, 0.3), mouth: 'smile', eyes: 'up' }),
    R.sparkle(560, 610, 14, P.sparkle, 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(250, 540, 12, P.sparkle, 0.5 + 0.5 * R.wave(t, 2, 0.4)),
    R.bird(R.lerp(-80, 2000, R.cyc(t)), 230 + 18 * R.wave(t, 1), 0.75, t, 4), R.bird(R.lerp(-200, 1880, R.cyc(t)), 270 + 18 * R.wave(t, 1, 0.4), 0.55, t, 4, 0.4),
  ]);

  // ── c4d：學堂門打開、窗戶亮燈，音符從門窗飄出；鄰居從左右走進門，兩位躲在榕樹後探頭，一位在門邊害羞
  R.scene('c4d', 3.2, t => {
    const sx = 1040, sy = 586, ss = 0.86;
    const vL1 = R.villager(401, { elder: true, female: true }), vL2 = R.villager(402, { kid: true });
    const vR1 = R.villager(403, { elder: true, female: false }), vR2 = R.villager(404, { female: true });
    const peek1 = R.villager(405, { kid: true, female: true }), peek2 = R.villager(406, { elder: true, female: false });
    const shyV = R.villager(407, { female: true, elder: false });
    const fgL1 = R.villager(408, { kid: true }), fgL2 = R.villager(409, { elder: true, female: true });
    const fgR1 = R.villager(420, { elder: true, female: false, spec: { style: 'short' } }), fgR2 = R.villager(421, { female: true, elder: false });
    const lean = 12 * R.wave(t, 1);
    return [
      R.sky('golden', 540),
      R.cloud(820 + 12 * R.wave(t), 140, 0.6, { shade: '#F8DDBA' }), R.cloud(1640 + 10 * R.wave(t, 1, 0.5), 110, 0.55, { shade: '#F8DDBA' }),
      R.ridge({ y: 450, amp: 34, seed: 81, color: '#C9B99A' }),
      R.ridge({ y: 545, amp: 14, seed: 82, color: '#A8B98A' }),
      R.schoolhouse(sx, sy, ss, { lit: true, doorOpen: true }),
      windowGlow(sx, sy, ss, t),
      ground(590, P.yard, { amp: 4 }),
      R.roseBush(1700, 660, 0.7, t, { wild: true, bloom: 0, seed: 5 }), R.roseBush(1870, 672, 0.72, t, { wild: true, bloom: 0, seed: 6 }),
      // 探頭的鄰居（先畫，樹幹會蓋住一半）
      R.person(peek2, { x: 196 - lean, y: 712, s: 0.68, pose: 'shy', mouth: 'o', angles: { tilt: -9 } }),
      R.person(peek1, { x: 300 + lean, y: 712, s: 0.78, pose: 'stand', mouth: 'smile', angles: { tilt: 10 } }),
      R.tree(250, 722, 1.0, t, { kind: 'banyan', sway: 5 }),
      // 走進門的鄰居（左右各兩位，錯開）
      // 中景：從前景兩側走向門口的小人物（背景）
      walker(vL1, 700, 664, 0.62, 975, 596, 0.48, R.loop(t, 1, 0.0), t),
      walker(vR1, 1400, 664, 0.62, 1105, 596, 0.48, R.loop(t, 1, 0.25), t),
      walker(vL2, 700, 664, 0.62, 975, 596, 0.48, R.loop(t, 1, 0.5), t),
      walker(vR2, 1400, 664, 0.62, 1105, 596, 0.48, R.loop(t, 1, 0.75), t),
      // 門邊害羞、還不敢進門的鄰居（畫在走路的人前面，路過的人從她身後經過）
      R.person(shyV, { x: 1240, y: 660, s: 0.6, pose: 'shy', blush: true, mouth: 'smile', p: R.cyc(t) }),
      // 前景：左右兩側比較大的鄰居，正往學堂走（左：阿嬤帶孫子；右：阿公和一位阿姨）
      R.person(fgL1, { x: 470, y: 700, s: 0.8, pose: 'walk', p: R.cyc(t, 2), mouth: 'smile', eyes: 'up' }),
      R.person(fgL2, { x: 600, y: 696, s: 0.82, pose: 'walk', p: R.loop(t, 2, 0.5), mouth: 'open' }),
      R.person(fgR1, { x: 1480, y: 700, s: 0.82, pose: 'walk', p: R.loop(t, 2, 0.25), mouth: 'smile', eyes: 'up' }),
      R.person(fgR2, { x: 1620, y: 692, s: 0.78, pose: 'walk', p: R.loop(t, 2, 0.75), mouth: 'open' }),
      // 屋裡傳出的歌聲
      R.noteStream(sx, sy - 150, -40, -320, 5, t, { s: 0.85 }),
      R.noteStream(sx - 260, sy - 150, -180, -250, 4, t, { s: 0.7 }),
      R.noteStream(sx + 260, sy - 150, 180, -250, 4, t, { s: 0.7 }),
    ];
  });

  // ── s4：歌曲頁〈請跟我來〉合唱。黃昏的老學堂庭院，右半邊村民排成兩排合唱，音符升起；左半安靜
  R.scene('s4', 3.2, t => {
    const back = [R.villager(410, { elder: true }), R.villager(411, { female: true }), R.villager(412, { elder: true, female: true }), R.villager(413, {}), R.villager(414, { elder: true, female: true }), R.villager(415, { female: true })];
    const front = [[R.villager(416, { kid: true, female: true }), {}], ['f1', {}], ['heigou', { shirt: 'yellow' }], ['aqing', {}], ['f2', {}], ['f3', {}], [R.villager(417, { kid: true }), {}]];
    const out = [
      R.sky('dusk', 700),
      R.sun(560, 640, 90, t, { rays: 0, color: '#FFC470', core: '#FFE2A8' }),
      R.cloud(1180 + 10 * R.wave(t), 170, 0.6, { color: '#F6D3C8', shade: '#E2B4B6' }), R.cloud(1760 + 10 * R.wave(t, 1, 0.5), 110, 0.5, { color: '#F6D3C8', shade: '#E2B4B6' }),
      R.stars(9, 10, t, 200),
      R.ridge({ y: 660, amp: 30, seed: 91, color: '#8E7FA6' }),
      R.ridge({ y: 720, amp: 14, seed: 92, color: '#6F8A7E' }),
      // 學堂稍往右、榕樹縮小右移：樹冠左緣（−320×s）落在 x ≈ 975，不伸進左邊的歌名框
      R.schoolhouse(1560, 720, 0.72, { lit: true }),
      windowGlow(1560, 720, 0.72, t),
      ground(724, '#D3B583', { amp: 4 }),
      R.tree(1195, 750, 0.68, t, { kind: 'banyan', sway: 4 }),
      R.roseBush(1860, 800, 0.6, t, { seed: 5, bloom: 0 }),
    ];
    back.forEach((sp, i) => out.push(R.person(sp, { x: 1130 + i * 140, y: 840, s: 0.58, pose: 'sing', p: R.loop(t, 1, i * 0.15), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.2) })));
    front.forEach(([w, o], i) => out.push(R.person(w, Object.assign({ x: 1060 + i * 135, y: 975, s: 0.64, pose: 'sing', p: R.loop(t, 1, 0.07 + i * 0.15), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.2 + 0.1) }, o))));
    out.push(R.noteStream(1260, 560, 60, -420, 6, t, { s: 1.1 }), R.noteStream(1660, 560, 120, -420, 6, t, { s: 1.0, k: 1 }));
    return out;
  });
})();
