# 讓生命乘著歌聲，綻放成一道彩虹

樂齡合唱音樂會的動畫故事投影片。8 首歌串成黑狗兄與阿晴的故事：說故事時一按出一段，唱歌時放歌名、演出形式和整首歌循環的背景動畫。

**觀看**：<https://kblab2024.github.io/rainbow-concert/>

115年臺中市大人讀冊吧－銀向學習計畫之創齡無極限方案
《鼓動青春．樂齡飛揚》聲聲飛揚－動聲合唱課程
114–116 年朝陽科大USR計畫　北溝富麗 文化生態共榮村

## 放映操作

| 動作 | 按鍵 |
|---|---|
| 下一頁 | 點畫面、→、↓、空白鍵、PageDown、Enter（簡報筆可用） |
| 上一頁 | ←、↑、PageUp、點畫面最左邊 |
| 全螢幕 | F，或右下角 ⛶ |
| 黑畫面 | B 或 .（再按一次回來） |
| 第一頁、最後一頁 | Home、End |
| 直接跳到第 n 頁 | 網址最後加 `#n` |

- 手機直拿時改成上圖下文，可以左右滑動翻頁。
- 系統設定「減少動態效果」時，背景改成靜止圖。

## 頁序（共 39 頁）

| 段落 | 頁數 |
|---|---|
| 封面 | 1 |
| 第一首到第八首，每首：先唸該章故事（一段一頁，共 29 頁），再唱歌（歌曲頁，共 8 頁） | 37 |
| 結尾 | 1 |

| 曲序 | 歌名 | 演出形式 |
|---|---|---|
| 1 | 〈山頂的黑狗兄〉 | 四重唱 |
| 2 | 〈鄉間小路〉 | 合唱 |
| 3 | 〈情人的黃襯衫〉 | 非洲鼓＋擊鼓有氧 |
| 4 | 〈請跟我來〉 | 合唱 |
| 5 | 〈可愛的玫瑰花〉 | 非洲鼓＋擊鼓有氧 |
| 6 | 〈追夢人〉 | 合唱 |
| 7 | 〈幸福進行曲〉 | 合唱 |
| 8 | 〈飛躍的彩虹〉 | 非洲鼓＋擊鼓有氧 |

## 檔案

| 路徑 | 內容 |
|---|---|
| `index.html` | 網站本體（單一檔，由 `src/build_site.py` 產生） |
| `assets/` | 每頁的動畫 GIF（1920×1080，無限循環）與首格 PNG |
| `art/` | 向量插圖：`lib.js` 共用零件與角色、`scenes/ch*.js` 各章場景、`STYLE.md` 畫風規則 |
| `src/` | 頁序資料與產生、檢查程式；`script_original.txt` 是劇本原文 |

## 重新產生

需要 macOS 的 Google Chrome，以及 Python 3（Pillow、numpy、websocket-client、python-pptx）。

```bash
python src/make_story.py          # 劇本原文 → src/story.json（39 頁）
python src/render.py --all        # 各章場景 → assets/*.gif、*.png（Chrome 逐格截圖）
python src/check_gifs.py --periodic
python src/build_site.py          # → index.html
python src/check_text.py          # 文字和劇本原文一字不差
python src/shoot_site.py          # 本機逐頁截圖測試（橫向與手機直向）
```

- PowerPoint 版由 `src/build_pptx.py` 產生，需要 pathology-slide-kit 的 `scripts/gen_pptx.py`（環境變數 `SLIDEKIT_KIT`）。
- claude.ai 簡報版由 `src/build_slides.py` 產生。
- 這兩份都不在這個 repo 裡。

字型：網頁用 Google Fonts 的 Huninn（jf open 粉圓，SIL OFL）。
