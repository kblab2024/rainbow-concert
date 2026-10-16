"""預覽：把場景某一格疊上實際的文字卡／歌名區／封面標題，存成 1280×720 PNG，並可拼成聯絡表。

用法：
  python src/preview.py c2a c2b s2                # 從 assets/<id>.gif 取第 0 格（沒有 GIF 就現算）
  python src/preview.py c2a --t 0.5               # 現算 t=0.5 那一格（需要 Chrome）
  python src/preview.py --chapter 2 3 --sheet ch23  # 第 2、3 章全部頁，加一張聯絡表
  python src/preview.py --all --sheet all --outdir _archive/review_story
輸出：<outdir>/<id>.png（預設 _archive/preview/），聯絡表 <outdir>/sheet_<name>.png
"""
import argparse
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageSequence

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import layout as L  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORY = json.load(open(os.path.join(ROOT, "src", "story.json"), encoding="utf-8"))
PAGES = {p["id"]: p for p in STORY["pages"]}
ORDER = [p["id"] for p in STORY["pages"]]

_fonts = {}


def font(px, bold=False):
    k = (px, bold)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(L.font_path(bold), px)
    return _fonts[k]


def hex_rgba(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), int(round(a * 255)))


def frame_from_gif(sid, t=None):
    gif = os.path.join(ROOT, "assets", f"{sid}.gif")
    if t is None and os.path.exists(gif):
        return Image.open(gif).convert("RGB")
    if t is not None and os.path.exists(gif):
        im = Image.open(gif)
        n = getattr(im, "n_frames", 1)
        idx = min(n - 1, int(round(t * n)) % n)
        for i, fr in enumerate(ImageSequence.Iterator(im)):
            if i == idx:
                return fr.convert("RGB").copy()
    return None


def render_frame(sid, t):
    import render as R
    files = R.scene_files()
    ch = R.Chrome()
    try:
        ch.goto(R.stage_url(files))
        import time
        for _ in range(400):
            if ch.eval("document.body && document.body.dataset.ready") == "1":
                break
            time.sleep(0.05)
        ch.eval(f"renderScene({json.dumps(sid)}, {t})")
        return ch.shot().convert("RGB")
    finally:
        ch.close()


def rounded(draw, box, r, fill, outline=None, width=0):
    x, y, w, h = box
    draw.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=width)


def overlay(img, page):
    img = img.convert("RGBA")
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    kind = page["kind"]
    if kind == "story":
        C = L.CARD
        f = font(C["font_px"])
        lines = L.wrap(page["text"], C["w"] - 2 * C["pad_x"], lambda s: f.getlength(s))
        x, y, w, h = L.card_box(len(lines))
        rounded(d, (x, y, w, h), C["radius"], hex_rgba(C["fill"], C["alpha"]), hex_rgba(C["border"]), 4)
        for i, ln in enumerate(lines):
            d.text((x + C["pad_x"], y + C["pad_top"] + i * C["line_px"] + (C["line_px"] - C["font_px"]) / 2 - 6), ln, font=f, fill=hex_rgba(C["ink"]))
        T = L.TAG
        tag = f"{page['chapter']}／8〈{page['song']}〉"
        ft = font(T["font_px"])
        tw = ft.getlength(tag)
        rounded(d, (T["x"], T["y"], tw + 2 * T["pad_x"], T["h"]), T["h"] / 2, hex_rgba(T["fill"], T["alpha"]))
        d.text((T["x"] + T["pad_x"], T["y"] + (T["h"] - T["font_px"]) / 2 - 4), tag, font=ft, fill=hex_rgba(T["ink"]))
    elif kind == "song":
        S = L.SONG
        rounded(d, (S["x"], S["y"], S["w"], S["h"]), S["radius"], hex_rgba(S["fill"], S["alpha"]))
        cx = S["x"] + S["w"] / 2
        fl, ftt, ff = font(S["label_px"]), font(S["title_px"], True), font(S["form_px"], True)
        y = S["y"] + 60
        d.text((cx - fl.getlength(page["label"]) / 2, y), page["label"], font=fl, fill=hex_rgba(S["ink"]))
        y += S["label_px"] + 50
        title = f"〈{page['song']}〉"
        d.text((cx - ftt.getlength(title) / 2, y), title, font=ftt, fill=hex_rgba(S["ink"]))
        y += S["title_px"] + 60
        fw = ff.getlength(page["form"]) + 70
        rounded(d, (cx - fw / 2, y, fw, S["form_px"] + 36), (S["form_px"] + 36) / 2, hex_rgba(S["form_fill"]))
        d.text((cx - fw / 2 + 35, y + 12), page["form"], font=ff, fill=hex_rgba(S["form_ink"]))
    else:
        C = L.COVER
        x, y, w, h = C["title_box"]
        rounded(d, (x, y, w, h), C["radius"], hex_rgba(C["fill"], C["alpha"]))
        ft = font(C["title_px"], True)
        d.text((x + w / 2 - ft.getlength(page["title"]) / 2, y + (h - C["title_px"]) / 2 - 10), page["title"], font=ft, fill=hex_rgba(C["title_ink"]))
        x, y, w, h = C["credits_box"]
        rounded(d, (x, y, w, h), C["radius"], hex_rgba(C["fill"], C["alpha"]))
        yy = y + 28
        for ln, px in zip(page["credits"], C["credits_px"]):
            fc = font(px, px >= 40)
            d.text((x + w / 2 - fc.getlength(ln) / 2, yy), ln, font=fc, fill=hex_rgba(C["credits_ink"]))
            yy += px + 34
    # 安全線（重點要在這條線以上；只在故事頁畫）
    if kind == "story":
        d.line([(0, L.SAFE_BOTTOM), (1920, L.SAFE_BOTTOM)], fill=(255, 0, 80, 110), width=3)
    return Image.alpha_composite(img, layer).convert("RGB")


def sheet(paths, out, cols=4, cell=(480, 270)):
    rows = (len(paths) + cols - 1) // cols
    W, H = cell
    S = Image.new("RGB", (cols * W, rows * (H + 34)), (250, 247, 240))
    d = ImageDraw.Draw(S)
    f = font(24)
    for i, (sid, p) in enumerate(paths):
        im = Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS)
        x, y = (i % cols) * W, (i // cols) * (H + 34)
        S.paste(im, (x, y + 34))
        d.text((x + 8, y + 4), sid, font=f, fill=(200, 30, 60))
    S.save(out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--chapter", nargs="*", type=int, default=[])
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--t", type=float, default=None, help="時間點；不給就用 GIF 第 0 格")
    ap.add_argument("--sheet", default=None, help="聯絡表名稱")
    ap.add_argument("--outdir", default=os.path.join(ROOT, "_archive", "preview"))
    ap.add_argument("--full", action="store_true", help="輸出 1920×1080（預設 1280×720）")
    a = ap.parse_args()
    ids = list(a.ids)
    if a.all:
        ids = ORDER[:]
    for c in a.chapter:
        ids += [p for p in ORDER if PAGES[p].get("chapter") == c]
    if not ids:
        sys.exit("請給頁 id、--chapter 或 --all")
    os.makedirs(a.outdir, exist_ok=True)
    done = []
    for sid in ids:
        page = PAGES[sid]
        img = frame_from_gif(page["scene"], a.t)
        if img is None:
            img = render_frame(page["scene"], a.t or 0)
        out = overlay(img, page)
        if not a.full:
            out = out.resize((1280, 720), Image.LANCZOS)
        tag = "" if a.t is None else f"_t{a.t:.2f}"
        p = os.path.join(a.outdir, f"{sid}{tag}.png")
        out.save(p)
        done.append((sid, p))
        print(os.path.relpath(p, ROOT))
    if a.sheet:
        print(os.path.relpath(sheet(done, os.path.join(a.outdir, f"sheet_{a.sheet}.png")), ROOT))


if __name__ == "__main__":
    main()
