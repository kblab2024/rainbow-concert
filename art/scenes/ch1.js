// 封面＋第 1 章〈山頂的黑狗兄〉（四重唱）。畫風樣板：其他章照這裡的比例、色調、構圖規則。
(function () {
  const R = RC, P = R.P;

  const village = R.village;
  // peak(x0, base, sc) 山頂一帶（中心左右約 ±140×sc）的地面高度；用二次式近似 lib 的山頂曲線
  const peakTop = (x0, base, sc, px) => { const xl = (px - x0) / sc; return base + sc * (-515 + 0.0027 * (xl - 10) * (xl - 10)); };
  // 四人站在山頂唱歌（第 1 章）
  function quartet(x, y, s, t, o = {}) {
    const ppl = [['f1', -1.5], ['heigou', -0.5], ['f2', 0.5], ['f3', 1.5]];
    // y 可以是數字，或 px => y（每個人站在山坡實際的高度）
    return R.g(ppl.map(([w, k], i) => { const px = x + k * 150 * s; return R.person(w, { x: px, y: typeof y === 'function' ? y(px) : y, s, pose: o.pose || 'sing', p: R.loop(t, 1, i * 0.18), mouth: 'sing', mouthK: R.wave(t, 2, i * 0.25), shirt: o.shirt }); }));
  }

  // ── 封面：彩虹、黑狗兄的山、山腳村莊、稻田；音符從村莊飄向彩虹
  R.scene('cover', 3.2, t => [
    R.sky('dawn'),
    R.sun(1640, 250, 70, t, { rays: 10 }),
    R.cloud(380 + 14 * R.wave(t), 200, 0.9), R.cloud(1180 + 12 * R.wave(t, 1, 0.3), 140, 0.7), R.cloud(1820 + 10 * R.wave(t, 1, 0.6), 420, 0.6),
    R.rainbow(960, 1000, 860, 34, 1, { opacity: 0.9 }),
    R.ridge({ y: 700, amp: 50, seed: 11, color: P.mtFar }),
    R.peak(1380, 830, 0.78, 'day', t),
    R.hill(330, 840, 900, 210, P.mtMid),
    R.ridge({ y: 800, amp: 22, seed: 5, color: P.mtNear }),
    village(980, 820, 0.85, t),
    R.paddies(850, 1060, t, { rows: 6 }),
    R.noteStream(840, 760, 240, -460, 7, t, { s: 0.9, wiggle: 30 }),
    R.bird(R.lerp(-60, 2000, R.cyc(t)), 330 + 20 * R.wave(t, 1), 0.9, t, 4), R.bird(R.lerp(-160, 1900, R.cyc(t)), 360 + 20 * R.wave(t, 1, 0.3), 0.7, t, 4, 0.3),
  ]);

  // ── c1a：山腳下的小村莊；遠遠的山頂上，四個人在唱歌，音符往山谷飄
  R.scene('c1a', 3.2, t => [
    R.sky('day', 700),
    R.sun(1700, 170, 64, t),
    R.cloud(300 + 14 * R.wave(t), 170, 0.85), R.cloud(1050 + 12 * R.wave(t, 1, 0.4), 120, 0.65),
    R.ridge({ y: 560, amp: 50, seed: 21, color: P.mtFar }),
    R.peak(700, 790, 1.05, 'day', t),
    // 山頂四人（遠景；放大到 0.4，投影幕上看得出是四個人在唱歌）。peakTop：peak() 山頂附近的地面高度
    quartet(650, px => peakTop(700, 790, 1.05, px) + 6, 0.4, t),
    R.noteStream(760, 170, 560, 300, 6, t, { s: 0.8 }),
    R.noteStream(580, 180, -420, 320, 5, t, { s: 0.75 }),
    R.ridge({ y: 650, amp: 22, seed: 8, color: P.mtNear }),
    village(1360, 640, 0.9, t),
    R.tree(130, 660, 1.0, t, { ph: 0.2 }),
    R.ground(650, P.grass),
    R.paddies(668, 1060, t, { rows: 7 }),
  ]);

  // ── c1b：山頂上的四個好友對著山谷唱歌；夕陽，音符一路飄下山
  R.scene('c1b', 3.2, t => [
    R.sky('golden'),
    R.sun(1520, 330, 90, t, { rays: 12 }),
    R.cloud(260 + 12 * R.wave(t), 160, 0.8, { shade: '#F8DDBA' }), R.cloud(1100 + 10 * R.wave(t, 1, 0.5), 120, 0.6, { shade: '#F8DDBA' }),
    R.ridge({ y: 560, amp: 40, seed: 31, color: '#C9B99A' }),
    // 山谷下的村莊（遠）
    R.ridge({ y: 660, amp: 30, seed: 32, color: '#A8B98A' }),
    village(1380, 700, 0.45, t, { lit: true }),
    // 山頂平台（近）
    R.path(R.smooth([[-40, 760], [200, 700], [520, 690], [860, 700], [1160, 735], [1400, 790], [1960, 900]]) + ' L1960 1100 L-40 1100 Z', '#8FB46A'),
    R.path(R.smooth([[-40, 800], [300, 760], [700, 770], [1100, 800], [1500, 860], [1960, 960]]) + ' L1960 1100 L-40 1100 Z', '#7DA45C'),
    R.at(1190, 760, 0.9, R.tree(0, 0, 1, t, { kind: 'round' })),   // 山頂那棵小樹（和封面、第 8 章同一棵）
    R.tufts(41, 22, 0, 1900, 780, 1000, t, { color: '#5E8A44', size: 1.3 }),
    quartet(560, 730, 0.95, t),
    R.noteStream(820, 420, 700, 260, 9, t, { s: 1.0 }),
    R.sparkle(420, 300, 18, P.sparkle, 0.5 + 0.5 * R.wave(t, 2)), R.sparkle(980, 250, 14, P.sparkle, 0.5 + 0.5 * R.wave(t, 2, 0.5)), R.sparkle(1300, 520, 12, P.sparkle, 0.5 + 0.5 * R.wave(t, 2, 0.25)),
  ]);

  // ── s1：歌曲頁〈山頂的黑狗兄〉四重唱。左半留給歌名；右邊四人在山頂唱，大音符升起
  R.scene('s1', 3.2, t => [
    R.sky('dusk'),
    R.sun(1500, 560, 120, t, { rays: 0, color: '#FFC470', core: '#FFE2A8' }),
    R.cloud(1100 + 10 * R.wave(t), 200, 0.7, { color: '#F6D3C8', shade: '#E2B4B6' }), R.cloud(1780 + 10 * R.wave(t, 1, 0.5), 300, 0.6, { color: '#F6D3C8', shade: '#E2B4B6' }),
    R.stars(5, 18, t, 260),
    R.ridge({ y: 700, amp: 40, seed: 41, color: '#8E7FA6' }),
    R.path(R.smooth([[700, 1100], [900, 800], [1150, 720], [1450, 715], [1700, 750], [1960, 820]]) + ' L1960 1100 Z', '#5F7F68'),
    R.at(1820, 760, 0.75, R.tree(0, 0, 1, t, { kind: 'round' })),
    quartet(1360, 760, 0.86, t),
    R.noteStream(1180, 560, 120, -640, 4, t, { s: 1.4 }),
    R.noteStream(1560, 560, 160, -640, 4, t, { s: 1.25, k: 1 }),
  ]);
})();
