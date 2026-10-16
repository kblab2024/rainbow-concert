# 畫風與做圖規則（彩虹音樂會）

給畫插圖的人與代理看。觀眾是長輩：畫面要清楚、溫暖、重點大。所有圖都是向量（SVG 字串），用 `src/render.py` 交給 Chrome 逐格截圖算成 GIF。

## 1. 檔案與分工

| 檔 | 是什麼 | 誰改 |
|---|---|---|
| `art/lib.js` | 共用零件、角色、色票（全域 `RC`） | 只有主控改；畫圖代理**不要改** |
| `art/scenes/ch1.js` | 封面與第 1 章，**畫風樣板** | 不要改 |
| `art/scenes/chN.js` | 第 N 章的場景（故事頁 `cNa…`、歌曲頁 `sN`）；第 8 章檔另含結尾 `end` | 該章的畫圖代理 |
| `art/scenes/_ref.js` | 角色表 `ref_cast`、道具表 `ref_props` | 不要改 |
| `src/story.json` | 39 頁的文字、每頁的畫圖說明 `art`、替代文字 `alt`、黑狗兄這頁的服裝 `heigou` | 不要改 |

需要 lib 沒有的零件，就在自己的場景檔裡寫區域函數（放在 IIFE 裡）；回報時列出來，主控之後再決定要不要收進 lib。

## 2. 場景檔寫法

```js
// 第 2 章〈鄉間小路〉（合唱）
(function () {
  const R = RC, P = R.P;
  R.scene('c2a', 3.2, t => [          // id、長度（秒）、draw(t)；t ∈ [0,1)
    R.sky('day', 700),
    R.cloud(300 + 14 * R.wave(t), 170, 0.85),
    R.person('heigou', { x: 700, y: 650, s: 0.9, pose: 'walk', p: R.cyc(t, 2) }),
    R.paddies(668, 1060, t),
  ]);
})();
```

- 陣列依序畫，後面的蓋前面：天空 → 遠山 → 中景 → 人物 → 前景 → 點綴。
- `dur` 預設 3.2 秒（40 格，80 ms 一格）。真的需要更長的動作可以用 4.8，但要注意大小。
- 長度相同的頁，前後接起來的循環節奏比較一致。

## 3. 動畫一定要是週期函數（GIF 才能無縫循環）

- 所有隨時間變的量，只能由這些組成：
  - `R.wave(t, k, 相位)`：正弦 −1..1。
  - `R.cyc(t, k)`：鋸齒 0..1。
  - `R.loop(t, k, 偏移)`：帶偏移的鋸齒。
  - `R.beat(t, 拍數)`：鼓點，剛敲 1 → 0。
  - `R.fadeLoop(u)`：0→1→0。
- 上面的 **k 一律用整數**，`draw(1)` 才會等於 `draw(0)`。
- 不可以用 `Math.random()`、`Date`。要隨機就用 `R.rng(seed)`，每次 draw 都用同一個 seed 建新的。
- 人物動作用 `p: R.cyc(t, k)` 或 `p: R.loop(t, 1, i * 0.13)`（每人錯開）。
- 雲不要整片橫移（3.2 秒移不完一圈），用 `x + 12 * R.wave(t)` 輕輕晃。鳥可以一個循環飛過全畫面。
- `python src/check_gifs.py --file chN --periodic` 會比對 draw(0) 與 draw(1)，要全部 OK。

## 4. 構圖區（1920×1080；數字見 `src/layout.py`）

| 頁 | 會被蓋住的地方 | 規則 |
|---|---|---|
| 故事頁 | 下方文字卡：x 112–1808。1 行從 y≈893 起、2 行從 y≈798 起、3 行從 y≈703 起，蓋到 y 1052。左上角小標：x 40–470、y 34–98 | **臉、手、主要道具都在 y 690 以上**；文字卡下面放地面、稻田、草地這類可以被蓋的東西。左上角放天空 |
| 歌曲頁 | 左半的米色歌名框：x 72–932、y 290–760 | 主角與重點都放在 **x ≥ 960**；左半是天空、遠山、地面，不要放人臉 |
| 封面、結尾 | 標題緞帶：x 150–1770、y 250–410；計畫名稱卡：x 230–1690、y 806–1040 | 這兩區保持安靜；彩虹、山可以在標題後面當背景 |

- 每頁的實際文字卡大小不同。`python src/preview.py <id…>` 會把真正的文字卡、小標、歌名框疊上去，還有一條紅線標出 y 690，一看就知道有沒有被蓋到。
- 人物大小：近景主角 `s` 0.85–1.1（約 300 px 高，腳底 y 640–760）、中景 0.5–0.7、遠景 0.25–0.35。
- 人物面向觀眾。兩人互動時靠近一點，牽手要讓手真的碰在一起：
  - `holdR`（右手伸向右邊的人）配 `holdL`。
  - 兩人中心相距約 160×s。

## 5. 角色（全片長相固定；看 `_archive/frames/ref_cast_t0.25.png`）

- **黑狗兄** `'heigou'`：曬黑的膚色、刺刺黑髮、粗眉。
  - 服裝**照 `story.json` 該頁的 `heigou` 欄位**：`R.person('heigou', { shirt: 'yellow', rose: true, … })`。
  - 第 1–2 章藍襯衫；第 3 章起黃襯衫。
  - 胸前玫瑰只在 c5c、s5 與第 7 章以後；第 6 章沒有。
- **阿晴** `'aqing'`：長髮、紅色髮帶、青綠色洋裝、白領。
  - 行李（`suitcase: true`）只在第 2 章；c2c 是黑狗兄替她提（把 `suitcase: true` 給黑狗兄）。
- **三位好友**：
  - `'f1'`：高、眼鏡、綠衣。
  - `'f2'`：壯、藍帽、橘衣。
  - `'f3'`：捲髮、紫衣。
- **村民** `R.villager(seed, { elder, kid, female })`：
  - 每個 seed 長相固定，同一章的同一個鄰居用同一個 seed。
  - 要有長輩（白／灰髮）和小孩，這是樂齡的演出。
- **表情**：
  - `mouth`：`smile`、`sing`（唱歌，可配 `mouthK: R.wave(t,2)`）、`open`、`o`、`laugh`、`grin`、`sad`。
  - `eyes`：`'up'`（抬頭看）、`'closed'`。
  - `blush: true`。
- **姿勢**：stand walk sing singUp wave point shy clap cheer jump dance drum step holdR holdL holdBoth carry lift sad water sweep sit crouch reach fist hug。
  - 自訂角度用 `angles: { aR: [上臂, 前臂彎], tilt: … }`。
- **手上道具** `prop`：
  - `'djembe'`（配 `pose:'drum'`、`hit: R.beat(t,4)`）。
  - `'tea'`、`'can'`（澆水，配 `R.waterArc`）、`'broom'`、`'chair'`（配 `lift`）、`'hammer'`、`'flower'`、`'mic'`。

## 5.5 跨章一致的場景配置（不同代理畫同一個地方，要擺得一樣）

- **老學堂庭院**（第 4–8 章）：
  - 紅磚老學堂 `schoolhouse` 在後方中間。
  - 大榕樹 `tree(...{kind:'banyan'})` 在學堂**左邊**（畫面左），樹冠遮住庭院左側。
  - 玫瑰花圃 `roseBush` 在學堂**右前方**（畫面右）。
  - 舞台 `stage` 搭在庭院中間、學堂前面；觀眾椅子排在花圃旁、舞台前。
  - 近景可以只畫其中一部分，但左右關係不能反過來。
- **黑狗兄的山**：一律用 `peak()`，山頂右側有那棵小樹。遠景的村莊一律用 `village()`。
- **村口**（第 3 章）：大榕樹＋無字石碑 `tablet`＋小土地公廟 `shrine`，旁邊是通往村子的小路。
- **鄉間小路**（第 2 章）：小路穿過稻田，遠方是竹林與三合院（`village`），背景遠山可以看到黑狗兄的山。

## 6. 零件（`RC.*`，參數見 `lib.js`）

| 類別 | 零件 |
|---|---|
| 天空 | `sky(kind, horizon)`，kind：day golden dusk night storm dawn clear；`sun`、`moon`、`stars`、`cloud` |
| 山與地 | `ridge({y,amp,seed,color})`、`hill`、`ground`、`paddies(y0,y1,t)`、`road(pts,w0,w1)`、`tufts`、`flowerDots` |
| 黑狗兄的山 | **`peak(x, base, s, tone, t)`**：第 1 章唱歌、第 8 章彩虹跨過的同一座山，山頂有一棵小樹。tone：day golden dusk night storm clear。畫到這座山就一律用它 |
| 建築 | `sanheyuan`（三合院）、`schoolhouse(x,y,s,{lit,doorOpen,w})`（紅磚老學堂，寬約 980×s）、`village`（山腳村莊，全片共用）、`shrine`（土地公廟）、`tablet`（無字石碑）、`stage(x,y,s,{fallen,banner})`、`chair(x,y,s,{fallen})` |
| 植物 | `tree(x,y,s,t,{kind:'round'|'banyan'|'pine'})`、`bamboo`、`rose(x,y,s,bloom)`、`roseBush(x,y,s,t,{wild,bloom,blooms})` |
| 點綴 | `note`、`noteStream(x,y,dx,dy,n,t)`、`sparkle`、`heart`、`bird`、`butterfly`、`petals`、`confetti`、`bunting`、`rainbow(cx,cy,r,bw,p)`、`rain`、`splashes`、`puddle`、`flash`（閃電）、`shootingStar`、`lantern`、`waterArc`、`speech`、`thought`、`djembe` |
| 工具 | `g`、`at(x,y,s,inner)`、`rect`、`circle`、`ellipse`、`path`、`line`、`poly`、`smooth(pts)`（平滑曲線） |

## 7. 畫風

- 扁平繪本風，色彩溫暖，用 `R.P` 的色票。不用純黑；墨色 `#3B2A1A`。不畫外框線（五官除外）。
- 臺灣鄉間：三合院、稻田、竹林、大榕樹、紅磚老學堂、玫瑰花圃、土地公廟。
- **不畫任何文字、字母、數字**（招牌、海報都留白或畫圖案）。問號、音符用圖形畫。
- 半透明的大面積疊色（例：全畫面的霧、光暈）會讓 GIF 出現色帶，也會讓檔案變大：用小面積、或用不透明的色塊。
- 每頁都要「會動」，但動的東西要有意義：人物（走、唱、揮手、打鼓）、自然（雲、稻浪、樹、雨、花瓣）、點綴（音符、愛心、閃光）。至少要有一個人物或主體在動，不只背景在動。
- 歌曲頁要整首歌都看得下去：動作規律、不刺眼；鼓的歌用 `R.beat(t, 4)` 讓鼓面光圈跟拍子。

## 8. 檔案大小（每張 GIF ≤ 2.5 MB）

GIF 只存「和前一格不同的像素」，所以**大小幾乎只看每格有多少像素在變**。超過時依序：

- 減少同時在動的面積：例如稻浪只動近處幾排，雨少一點、短一點。
- 細碎的東西別鋪滿全畫面，例如整片抖動的草。
- 閃電一個循環只閃一次、很短。
- 真的不行才把 `dur` 從 3.2 改短。

## 9. 自己檢查的步驟（每頁）

```bash
cd ~/localcode/rainbow-concert
P=/opt/anaconda3/bin/python
$P src/render.py --file ch2 --frames 0,0.5          # 先看靜態格：_archive/frames/<id>_t0.00.png
$P src/render.py --file ch2                         # 算 GIF 到 assets/（只算自己的檔）
$P src/check_gifs.py --file ch2 --periodic          # 大小、接縫、週期都要 OK
$P src/preview.py --chapter 2 --sheet ch2           # 疊上文字卡：_archive/preview/<id>.png（1280×720）與 sheet_ch2.png
```

看預覽圖時要確認四件事：

- 畫的內容符合 `story.json` 這頁的 `text` 和 `art`。
- 服裝符合 `heigou` 欄位。
- 重點沒被文字卡或歌名框蓋到。
- 和 `ch1` 的樣板是同一個畫風。

看圖用 1280×720 的預覽就好，省時間。
