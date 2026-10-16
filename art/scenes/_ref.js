// 角色設定表（不是投影片頁；給畫圖時對照長相用）。render: python src/render.py ref_cast --frames 0
(function () {
  const R = RC;
  R.scene('ref_cast', 1.6, t => {
    const out = [R.rect(0, 0, 1920, 1080, '#F6F1E6')];
    const row1 = [['heigou', {}], ['heigou', { shirt: 'yellow' }], ['heigou', { shirt: 'yellow', rose: true }], ['aqing', {}], ['aqing', { suitcase: true }], ['f1', {}], ['f2', {}], ['f3', {}]];
    row1.forEach(([w, o], i) => out.push(R.person(w, Object.assign({ x: 140 + i * 235, y: 470, s: 1, pose: 'stand', p: R.cyc(t) }, o))));
    const poses = ['walk', 'sing', 'wave', 'point', 'shy', 'clap', 'cheer', 'jump', 'dance', 'drum', 'step', 'carry', 'sad'];
    poses.forEach((pz, i) => out.push(R.person(i % 2 ? 'aqing' : 'heigou', { x: 90 + i * 145, y: 860, s: 0.72, pose: pz, p: R.cyc(t), shirt: 'yellow', mouth: pz === 'sing' ? 'sing' : (pz === 'sad' ? 'sad' : (pz === 'cheer' || pz === 'jump' ? 'laugh' : 'smile')), blush: pz === 'shy', prop: pz === 'drum' ? 'djembe' : (pz === 'carry' ? 'tea' : undefined), hit: R.beat(t, 2) })));
    for (let i = 0; i < 12; i++) out.push(R.person(R.villager(100 + i, { kid: i % 5 === 4 }), { x: 90 + i * 160, y: 1060, s: 0.55, pose: 'stand' }));
    return out;
  });
})();
// 道具與點綴樣本
(function () {
  const R = RC, P = R.P;
  R.scene('ref_props', 1.6, t => [
    R.rect(0, 0, 1920, 1080, '#F6F1E6'),
    R.person('aqing', { x: 140, y: 420, s: 0.9, pose: 'lift', prop: 'chair' }),
    R.person('heigou', { x: 360, y: 420, s: 0.9, pose: 'crouch', shirt: 'yellow' }),
    R.person('f2', { x: 560, y: 420, s: 0.9, pose: 'sweep', prop: 'broom' }),
    R.person(R.villager(5, { elder: true }), { x: 760, y: 420, s: 0.9, pose: 'carry', prop: 'tea' }),
    R.person('aqing', { x: 960, y: 420, s: 0.9, pose: 'water', prop: 'can' }), R.waterArc(1040, 290, 120, 110, t),
    R.person('heigou', { x: 1180, y: 420, s: 0.9, pose: 'fist', shirt: 'yellow', mouth: 'grin' }),
    R.person('f1', { x: 1380, y: 420, s: 0.9, pose: 'hammer' === 'x' ? 'stand' : 'reach', prop: 'hammer' }),
    R.person('heigou', { x: 1580, y: 420, s: 0.9, pose: 'holdR', shirt: 'yellow', rose: true }), R.person('aqing', { x: 1740, y: 420, s: 0.9, pose: 'holdL' }),
    R.speech(80, 560, 260, 150, 200, 760, R.note(210, 620, 1, P.noteBlue, 0)),
    R.thought(560, 640, 170, 100, 470, 800, R.g([R.person(R.villager(3, { kid: true }), { x: 510, y: 700, s: 0.4 }), R.person(R.villager(4, { kid: true, female: true }), { x: 600, y: 700, s: 0.4 })])),
    R.shrine(860, 800, 1), R.tablet(1040, 800, 1), R.lantern(1200, 640, 1, t), R.butterfly(1320, 640, 1.4, t),
    R.roseBush(1520, 800, 1, t, { wild: true, bloom: 0 }), R.roseBush(1760, 800, 1, t, { blooms: [0, 0, 1, 0, 0] }),
    R.stage(400, 1060, 0.5, { fallen: 1 }), R.chair(700, 1060, 0.9, { fallen: true }), R.puddle(900, 1040, 120, t), R.djembe(1100, 1060, 0.8, 0.6),
    R.petals(3, 20, t, { x0: 1200, x1: 1900, y0: 860, y1: 1080 }),
  ]);
})();
