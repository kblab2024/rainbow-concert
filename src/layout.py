"""版面常數（1920×1080 畫布、px）。preview.py、build_site.py、build_pptx.py 共用，三種成品版面一致。

PPTX 換算：畫布 13.333 in 寬 → 1 in = 144 px，1 pt = 2 px。
"""
import os

CANVAS_W, CANVAS_H = 1920, 1080
PX_PER_IN = 144.0

# 故事文字卡（下方）：高度依行數；最長一段 3 行（34pt、內寬 11.0 in，已用 MSJH 量過）
CARD = dict(x=112, w=1696, bottom=1052, pad_x=56, pad_top=30, pad_bottom=34,
            font_px=68, line_px=95, radius=36,
            fill="#FFF8EC", alpha=0.93, border="#E7D3AE", ink="#3B2A1A")


def card_box(lines):
    h = CARD["pad_top"] + lines * CARD["line_px"] + CARD["pad_bottom"]
    return CARD["x"], CARD["bottom"] - h, CARD["w"], h


# 故事頁左上角小標：「1／8〈山頂的黑狗兄〉」
TAG = dict(x=40, y=34, h=64, pad_x=26, font_px=36, fill="#FFF8EC", alpha=0.9, ink="#5A4632")

# 歌曲頁左半：歌名區
SONG = dict(x=72, y=290, w=860, h=470, radius=40, fill="#FFF8EC", alpha=0.9, ink="#3B2A1A",
            label_px=52, title_px=116, form_px=50, form_fill="#E8475F", form_ink="#FFFFFF")

# 封面、結尾：標題緞帶（上）、計畫名稱卡（下）
COVER = dict(title_box=(150, 250, 1620, 160), title_px=88, title_ink="#3B2A1A",
             credits_box=(230, 806, 1460, 234), credits_px=(32, 40, 32), credits_ink="#3B2A1A",
             fill="#FFF8EC", alpha=0.92, radius=40)

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


def font_path(bold=False):
    for p in (FONT_BOLD_PATHS if bold else FONT_PATHS):
        if p and os.path.exists(p):
            return p
    return "/System/Library/Fonts/PingFang.ttc"


# 不可拆開的詞（人名等）
KEEP = ["黑狗兄", "阿晴"]


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


def wrap(text, width_px, measure, balance=True):
    """中文斷行：人名不拆、標點不放錯位置；balance=True 時在行數不變下讓各行長度接近（避免最後一行只剩幾個字）。"""
    us = units(text)
    lines = _greedy(us, width_px, measure)
    if not balance or len(lines) < 2:
        return lines
    n = len(lines)
    lo, hi = width_px * 0.5, width_px
    for _ in range(18):
        mid = (lo + hi) / 2
        if len(_greedy(us, mid, measure)) <= n:
            hi = mid
        else:
            lo = mid
    return _greedy(us, hi, measure)
