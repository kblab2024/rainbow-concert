"""產生 claude.ai Slides 簡報的檔案：project/deck.json 與 project/slides/<id>.html。

python src/build_slides.py --assets <上傳結果.json> --root <輸出資料夾>
<上傳結果.json>：{"<場景 id>": "/_blob/<id>", …}（上傳 GIF 到簡報素材庫後得到的網址，原樣照填）
版面與網站、PPTX 相同（layout.py）；文字照 layout.wrap 的行，用 <br> 換行、white-space:nowrap。
"""
import argparse
import html as H
import json
import os
import sys
from datetime import datetime, timezone

from PIL import ImageFont

SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
sys.path.insert(0, SRC)
import layout as L  # noqa: E402
import build_pptx as BP  # noqa: E402  （共用備忘稿文字）

FONT = "font-family:'Huninn', sans-serif"
BG = "#F6F1E6"
NUM = "一二三四五六七八"


def e(s):
    return H.escape(s, quote=True)


def notes(i, pages):
    return e(BP.notes_for(i, pages))[:3900]


def story_html(p, lines, img, trans, i, pages):
    C, T = L.CARD, L.TAG
    f = ImageFont.truetype(L.font_path(), T["font_px"])
    tag = f"{p['chapter']}／8〈{p['song']}〉"
    tw = int(L.spaced(f, T["letter_px"])(tag) + 2 * T["pad_x"] + 8)
    body = "<br>".join(e(l) for l in lines)
    return (f'<section id="{p["id"]}" data-kind="story" data-transition="{trans}" style="background:{BG};color:{C["ink"]};{FONT}">\n'
            f'<img src="{img}" alt="{e(p["alt"])}" style="position:absolute;left:0px;top:0px;width:1920px;height:1080px;object-fit:cover">\n'
            f'<p data-build-in="fade 1 auto" style="position:absolute;left:{T["x"]}px;top:{T["y"]}px;width:{tw}px;height:{T["h"]}px;'
            f'padding:0px {T["pad_x"]}px;border-radius:{T["h"] // 2}px;background:rgba(255,248,236,0.9);color:{T["ink"]};font-size:{T["font_px"]}px;'
            f'letter-spacing:{T["letter_px"]}px;line-height:{T["h"]}px;white-space:nowrap;text-align:center">{e(tag)}</p>\n'
            f'<p id="cap" data-role="text" data-build-in="rise 2 auto" style="position:absolute;left:{C["x"]}px;bottom:{1080 - C["bottom"]}px;width:{C["w"]}px;'
            f'padding:{C["pad_top"] - 4}px {C["pad_x"] - 4}px {C["pad_bottom"] - 4}px;background:rgba(255,248,236,0.93);border:4px solid {C["border"]};'
            f'border-radius:{C["radius"]}px;box-shadow:0px 10px 30px rgba(59,42,26,0.18);font-size:{C["font_px"]}px;line-height:{C["line_px"]}px;'
            f'letter-spacing:{C["letter_px"]}px;white-space:nowrap;color:{C["ink"]}">{body}</p>\n'
            f'<aside>{notes(i, pages)}</aside>\n</section>\n')


def song_html(p, img, trans, i, pages):
    S = L.SONG
    x, y, w, h = S["x"], S["y"], S["w"], S["h"]
    form_w = int(L.spaced(ImageFont.truetype(L.font_path(True), S["form_px"]), S["form_ls"])(p["form"]) + 84)
    form_h = S["form_px"] + 36
    return (f'<section id="{p["id"]}" data-kind="song" data-transition="{trans}" style="background:{BG};color:{S["ink"]};{FONT}">\n'
            f'<img src="{img}" alt="{e(p["alt"])}" style="position:absolute;left:0px;top:0px;width:1920px;height:1080px;object-fit:cover">\n'
            f'<div data-build-in="fade 1 auto" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:rgba(255,248,236,0.9);'
            f'border-radius:{S["radius"]}px;box-shadow:0px 12px 36px rgba(59,42,26,0.22)"></div>\n'
            f'<p data-build-in="fade 2 auto" style="position:absolute;left:{x}px;top:{y + 58}px;width:{w}px;font-size:{S["label_px"]}px;line-height:1.4;'
            f'letter-spacing:{S["label_ls"]}px;text-align:center;color:#5A4632">{e(p["label"])}</p>\n'
            f'<h2 data-role="song" data-build-in="pop 3 auto" style="position:absolute;left:{x}px;top:{y + 160}px;width:{w}px;font-size:{S["title_px"]}px;'
            f'font-weight:400;line-height:1.15;letter-spacing:{S["title_ls"]}px;text-align:center;white-space:nowrap;color:{S["ink"]}">〈{e(p["song"])}〉</h2>\n'
            f'<p data-role="form" data-build-in="rise 4 auto" style="position:absolute;left:{x + (w - form_w) // 2}px;top:{y + h - form_h - 64}px;width:{form_w}px;'
            f'height:{form_h}px;border-radius:{form_h // 2}px;background:{S["form_fill"]};color:{S["form_ink"]};font-size:{S["form_px"]}px;'
            f'letter-spacing:{S["form_ls"]}px;line-height:{form_h}px;text-align:center;white-space:nowrap">{e(p["form"])}</p>\n'
            f'<aside>{notes(i, pages)}</aside>\n</section>\n')


def cover_html(p, img, trans, i, pages):
    V = L.COVER
    tx, ty, tw, th = V["title_box"]
    cx, cy, cw, ch = V["credits_box"]
    rows = []
    total = sum(int(px * 1.4) for px in V["credits_px"]) + V["credits_gap"] * (len(V["credits_px"]) - 1)
    yy = cy + (ch - total) // 2
    for k, (ln, px) in enumerate(zip(p["credits"], V["credits_px"])):
        rows.append(f'<p data-role="credit" data-build-in="rise {4 + k} auto" style="position:absolute;left:{cx}px;top:{yy}px;width:{cw}px;'
                    f'font-size:{px}px;line-height:1.4;letter-spacing:{V["credits_ls"]}px;text-align:center;white-space:nowrap;color:{V["credits_ink"]}">{e(ln)}</p>')
        yy += int(px * 1.4) + V["credits_gap"]
    return (f'<section id="{p["id"]}" data-kind="{p["kind"]}" data-transition="{trans}" style="background:{BG};color:{V["title_ink"]};{FONT}">\n'
            f'<img src="{img}" alt="{e(p["alt"])}" style="position:absolute;left:0px;top:0px;width:1920px;height:1080px;object-fit:cover">\n'
            f'<div data-build-in="fade 1 auto" style="position:absolute;left:{tx}px;top:{ty}px;width:{tw}px;height:{th}px;background:rgba(255,248,236,0.92);'
            f'border-radius:{V["radius"]}px;box-shadow:0px 12px 36px rgba(59,42,26,0.2)"></div>\n'
            f'<h1 data-build-in="scale 2 auto" style="position:absolute;left:{tx}px;top:{ty + (th - int(V["title_px"] * 1.2)) // 2}px;width:{tw}px;'
            f'font-size:{V["title_px"]}px;font-weight:400;line-height:1.2;letter-spacing:{V["title_ls"]}px;text-align:center;white-space:nowrap;color:{V["title_ink"]}">{e(p["title"])}</h1>\n'
            f'<div data-build-in="fade 3 auto" style="position:absolute;left:{cx}px;top:{cy}px;width:{cw}px;height:{ch}px;background:rgba(255,248,236,0.92);'
            f'border-radius:{V["radius"]}px"></div>\n' + "\n".join(rows) + "\n"
            f'<aside>{notes(i, pages)}</aside>\n</section>\n')


def build(assets, root):
    story = json.load(open(os.path.join(SRC, "story.json"), encoding="utf-8"))
    pages = story["pages"]
    f = ImageFont.truetype(L.font_path(), L.CARD["font_px"])
    inner = L.CARD["w"] - 2 * L.CARD["pad_x"]
    os.makedirs(os.path.join(root, "project", "slides"), exist_ok=True)
    missing = [p["scene"] for p in pages if p["scene"] not in assets]
    if missing:
        sys.exit(f"缺上傳網址：{missing}")
    for i, p in enumerate(pages):
        nxt = pages[i + 1] if i + 1 < len(pages) else None
        # 同一章的故事頁之間用 magic（文字卡平滑變大小），其餘 fade
        trans = "magic" if (p["kind"] == "story" and nxt and nxt["kind"] == "story" and nxt["chapter"] == p["chapter"]) else "fade"
        img = assets[p["scene"]]
        if p["kind"] == "story":
            lines = L.wrap(p["text"], inner, L.spaced(f, L.CARD["letter_px"]))
            h = story_html(p, lines, img, trans, i, pages)
        elif p["kind"] == "song":
            h = song_html(p, img, trans, i, pages)
        else:
            h = cover_html(p, img, trans, i, pages)
        open(os.path.join(root, "project", "slides", f"{p['id']}.html"), "w", encoding="utf-8").write(h)
    sections = {"s0": {"description": "封面", "start": "cover"}}
    for n in range(1, 9):
        first = next(p for p in pages if p.get("chapter") == n)
        sections[f"s{n}"] = {"description": f"第{NUM[n - 1]}首〈{first['song']}〉（{first['form']}）", "start": first["id"]}
    sections["s9"] = {"description": "結尾", "start": "end"}
    deck = {"v": 4, "createdOnFiles": {"v": 1, "at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}, "lists": "css",
            "title": story["title"].strip("《》"), "order": [p["id"] for p in pages], "sections": sections, "cover": "cover",
            "faces": {"huninn": {"family": "Huninn", "href": "https://fonts.googleapis.com/css2?family=Huninn&display=swap"}},
            "designSystems": []}
    json.dump(deck, open(os.path.join(root, "project", "deck.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{root}/project：deck.json＋{len(pages)} 張 slides")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--assets", required=True)
    ap.add_argument("--root", required=True)
    a = ap.parse_args()
    build(json.load(open(a.assets, encoding="utf-8")), a.root)
