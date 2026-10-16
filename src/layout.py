"""版面常數（1920×1080 畫布、px）。preview.py、build_site.py、build_pptx.py 共用，三種成品版面一致。

PPTX 換算：畫布 13.333 in 寬 → 1 in = 144 px，1 pt = 2 px。
"""
import os

CANVAS_W, CANVAS_H = 1920, 1080
PX_PER_IN = 144.0

# 故事文字卡（下方）：高度依行數；最長一段 3 行。
# 10/16 朋友說「太擠了」：字級 68→62px（31pt）、字距 0→5px（約 0.08em）、行高 95→102px（1.65 倍），
# 卡片放寬到 x 96–1824、內邊距加大；29 段的行數不變（已用 MSJH 量過）
CARD = dict(x=96, w=1728, bottom=1056, pad_x=62, pad_top=34, pad_bottom=38,
            font_px=62, letter_px=5, line_px=102, radius=36,
            fill="#FFF8EC", alpha=0.93, border="#E7D3AE", ink="#3B2A1A")


def card_box(lines):
    h = CARD["pad_top"] + lines * CARD["line_px"] + CARD["pad_bottom"]
    return CARD["x"], CARD["bottom"] - h, CARD["w"], h


# 故事頁左上角小標：「1／8〈山頂的黑狗兄〉」
TAG = dict(x=40, y=34, h=64, pad_x=26, font_px=36, letter_px=2, fill="#FFF8EC", alpha=0.9, ink="#5A4632")

# 歌曲頁左半：歌名區
SONG = dict(x=72, y=290, w=860, h=470, radius=40, fill="#FFF8EC", alpha=0.9, ink="#3B2A1A",
            label_px=52, title_px=108, form_px=50, label_ls=3, title_ls=4, form_ls=3,
            form_fill="#E8475F", form_ink="#FFFFFF")

# 封面、結尾：標題緞帶（上）、計畫名稱卡（下）
COVER = dict(title_box=(150, 250, 1620, 160), title_px=88, title_ls=3, title_ink="#3B2A1A",
             credits_box=(230, 806, 1460, 234), credits_px=(32, 40, 32), credits_ls=2, credits_gap=24,
             credits_ink="#3B2A1A", fill="#FFF8EC", alpha=0.92, radius=40)

# 構圖規則（STYLE.md 也寫）：重點（臉、手、主要道具）要在這條線以上
SAFE_BOTTOM = 690

# 中文斷行：不放行首的標點、不放行尾的標點
NO_START = set("，。、；：？！」』）〉》…—～．·,.;:?!)")
NO_END = set("「『（〈《")

FONT_PATHS = [
    os.environ.get("SLIDEKIT_MEASURE_FONT", ""),
    "/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/MSJH.ttf",
]
FONT_BOLD_PATHS = [
    os.environ.get("SLIDEKIT_MEASURE_FONT_BOLD", ""),
    "/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/MSJHBD.ttf",
]


def spaced(font, letter_px):
    """量字（含字距）：每個字的字寬加上字距；PowerPoint 與 CSS 的字距都加在每個字後面。"""
    return lambda s: font.getlength(s) + letter_px * len(s)


def font_path(bold=False):
    for p in (FONT_BOLD_PATHS if bold else FONT_PATHS):
        if p and os.path.exists(p):
            return p
    return "/System/Library/Fonts/PingFang.ttc"


# 不可拆開的詞：人名與這份劇本裡的常用詞（沒有分詞套件，所以列出來；長詞先比對）
KEEP = sorted(set("""
黑狗兄 阿晴 音樂會 學音樂 音樂 黃襯衫 襯衫 玫瑰花圃 玫瑰花 玫瑰 老學堂 學堂 好友們 好友 小村莊 村莊 村口 全村 鄰居 舞台 椅子
彩虹 山頂 山谷 山腳下 願望 夢想 歌聲 鼓聲 節奏 心意 熱茶 工具 行李 家鄉 童年 往事 田野 鄉間小路 小路 庭院 大樹 花圃 澆水 除草
掌聲 觀眾 笑臉 幸福 日子 禮物 眼睛 孩子們 孩子 大人們 大人 村民 家人 台上 台下 前夕 大雨 準備 狼藉 袖子 人群 彩帶 入座 演出 起鬨
擺動 踏步 跳舞 轉身 伸手 練唱 遮蔭 進門 唱歌 答應 聲音 離開 外地 從小 熟悉 身影 多年 不見 大家 一起 起來 進來 已經 開始 最後 一首
曲子 天空 指著 抬起頭 跨過 最初 地方 終於 完成 明年 還要 什麼 男子 熱心 愛笑 愛唱歌 時間 一直 哪一天 我們 整個 笑著 四個人 這樣
帶著 飄下山 這一天 回家 忽然 看見 一個 那是 如今 提著 回到 這條 並肩 聊起 聽見 立刻 這麼 怎麼 可以 隔天 穿著 一件 等阿晴 一看 這件
衣服 你還 留著 送給 抓抓頭 害羞 一直想 穿著它 朋友們 紅著臉 加入 其中 兩人 說出口 藏在 熱鬧 支持 終於 決定 付諸行動 牽起 請跟我來
知道 好地方 寬敞 一棵 正適合 挨家挨戶 邀請 起初 自己 唱不好 害羞得 但聽著 屋裡 傳出 漸漸 走了 空蕩蕩 重新 多年沒人 照顧 練唱之餘
一進門 第一朵 綻放 高興 所有人 圍著 平常 最安靜 跟著 望著 燦爛 悄悄 摘下 一朵 自己的 上台 可是 打亂了 積了水 布置好 被風 吹倒
看著 滿地 難過 這麼久 辦不成 沒有 回答 扶起 一張 倒下的 接著 帶著工具 修舞台 清掃 準備熱茶 熟悉的 再次 響起 捲起袖子 走進 重新扶了起來
當天 終於停了 掛上 排滿 陸續 每一個人 找到 別著 那朵 身旁 小聲 以後 每一場 陪我 好嗎 點頭 唱出了 這段 親手 忙出來 一個孩子 大喊
抬起頭 一道 正是 最初唱歌 揮動 雙手 站起來 牽著 跳躍 歡笑 滿院子 那場 有人 問
""".split()), key=len, reverse=True)


def units(text):
    """切成斷行單位：人名整個一單位；行首禁用標點黏在前一單位後面，行尾禁用標點黏在後一單位前面。"""
    out, i = [], 0
    while i < len(text):
        for w in KEEP:
            if text.startswith(w, i):
                out.append(w)
                i += len(w)
                break
        else:
            out.append(text[i])
            i += 1
    merged = []
    pend = ""
    for u in out:
        if u in NO_END:
            pend += u
            continue
        u = pend + u
        pend = ""
        if merged and u[0] in NO_START:
            merged[-1] += u
        else:
            merged.append(u)
    if pend:
        merged[-1] += pend
    return merged


def _greedy(us, width_px, measure):
    lines, cur = [], ""
    for u in us:
        if not cur or measure(cur + u) <= width_px:
            cur += u
        else:
            lines.append(cur)
            cur = u
    if cur:
        lines.append(cur)
    return lines


PUNCT_END = set("，。、；：！？」』）…")


def wrap(text, width_px, measure, balance=True):
    """中文斷行：人名、常用詞不拆，標點不放錯位置。
    balance=True 時在最少行數下用動態規劃挑換行點：優先在逗號、句號等標點之後換行（每行是一個完整的語句），
    其次各行長度接近，並避免最後一行只剩幾個字。"""
    us = units(text)
    lines = _greedy(us, width_px, measure)
    if not balance or len(lines) < 2:
        return lines
    n, m = len(lines), len(us)
    cache = {}

    def W(i, j):
        if (i, j) not in cache:
            cache[(i, j)] = measure("".join(us[i:j]))
        return cache[(i, j)]
    INF = float("inf")
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    pv = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0.0
    for k in range(1, n + 1):
        for j in range(1, m + 1):
            for i in range(j - 1, -1, -1):
                w = W(i, j)
                if w > width_px:
                    break
                if dp[k - 1][i] == INF:
                    continue
                c = dp[k - 1][i]
                if j < m:
                    c += 0 if us[j - 1][-1] in PUNCT_END else 400     # 不在標點後換行
                    c += ((width_px - w) / width_px) ** 2 * 200        # 各行長度接近
                    if w < width_px * 0.35:
                        c += 300                                       # 中間行太短
                elif w < width_px * 0.3:
                    c += 150                                           # 最後一行太短
                if c < dp[k][j]:
                    dp[k][j], pv[k][j] = c, i
    if dp[n][m] == INF:
        return lines
    out, j = [], m
    for k in range(n, 0, -1):
        i = pv[k][j]
        out.append("".join(us[i:j]))
        j = i
    return out[::-1]
