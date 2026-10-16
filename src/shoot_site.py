"""網站測試：本機開 http.server，Chrome 逐頁截圖（橫向 1920×1080、手機直向 390×844），
檢查 JS 錯誤、方向鍵翻頁、每個 GIF 都載得到。

python src/shoot_site.py                 # 全部頁
python src/shoot_site.py --pages 1-8     # 第 1–8 頁（1 起算）
python src/shoot_site.py --url https://kblab2024.github.io/rainbow-concert/   # 測已發布的網站
輸出：_archive/site_shots/{land,port}/NN_<id>.png 與聯絡表 sheet_{land,port}.png
"""
import argparse
import functools
import http.server
import json
import os
import socketserver
import sys
import threading
import time
import urllib.request

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import layout as L  # noqa: E402
import render as R  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_archive", "site_shots")


class Probe(R.Chrome):
    """記下 console 錯誤與例外。"""
    def __init__(self, *a, **k):
        self.errors = []
        super().__init__(*a, **k)

    def send(self, method, **params):
        self.mid += 1
        my = self.mid
        self.ws.send(json.dumps({"id": my, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            m = msg.get("method")
            if m == "Runtime.exceptionThrown":
                d = msg["params"]["exceptionDetails"]
                self.errors.append("JS 例外：" + str(d.get("exception", {}).get("description", d.get("text"))))
            elif m == "Runtime.consoleAPICalled" and msg["params"]["type"] in ("error", "warning"):
                self.errors.append("console：" + " ".join(str(a.get("value", a.get("description", ""))) for a in msg["params"]["args"]))
            elif m == "Log.entryAdded" and msg["params"]["entry"]["level"] == "error":
                self.errors.append("載入：" + msg["params"]["entry"].get("text", "") + " " + msg["params"]["entry"].get("url", ""))
            if msg.get("id") == my:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    handler.log_message = lambda *a: None
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def key(ch, k, code, vk):
    for t in ("keyDown", "keyUp"):
        ch.send("Input.dispatchKeyEvent", type=t, key=k, code=code, windowsVirtualKeyCode=vk, nativeVirtualKeyCode=vk)


def sheet(items, out, cols, cell):
    W, H = cell
    rows = (len(items) + cols - 1) // cols
    S = Image.new("RGB", (cols * W, rows * (H + 30)), (40, 36, 32))
    d = ImageDraw.Draw(S)
    f = ImageFont.truetype(L.font_path(), 20)
    for i, (label, p) in enumerate(items):
        im = Image.open(p).convert("RGB")
        im.thumbnail((W, H), Image.LANCZOS)
        x, y = (i % cols) * W, (i // cols) * (H + 30)
        S.paste(im, (x + (W - im.width) // 2, y + 30))
        d.text((x + 6, y + 4), label, font=f, fill=(255, 220, 120))
    S.save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", default=None)
    ap.add_argument("--url", default=None)
    ap.add_argument("--wait", type=float, default=2.4)
    ap.add_argument("--no-port", action="store_true")
    a = ap.parse_args()
    httpd = None
    base = a.url
    if not base:
        httpd, base = serve()
    story = json.load(open(os.path.join(ROOT, "src", "story.json"), encoding="utf-8"))
    ids = [p["id"] for p in story["pages"]]
    N = len(ids)
    sel = list(range(N))
    if a.pages:
        lo, _, hi = a.pages.partition("-")
        sel = list(range(int(lo) - 1, int(hi or lo)))
    problems = []
    # 1) 每個 GIF／PNG 都載得到
    for sid in [ids[i] for i in sel]:
        for ext in ("gif", "png"):
            u = base + f"assets/{sid}.{ext}"
            try:
                with urllib.request.urlopen(u, timeout=30) as r:
                    if r.status != 200:
                        problems.append(f"{u} → {r.status}")
            except Exception as e:
                problems.append(f"{u} → {e}")
    shots = {"land": [], "port": []}
    modes = [("land", 1920, 1080, False)] + ([] if a.no_port else [("port", 390, 844, True)])
    for mode, w, h, mobile in modes:
        ch = Probe(w, h)
        try:
            ch.send("Log.enable")
            ch.send("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=mobile)
            ch.goto(base + "index.html")
            time.sleep(1.0)
            os.makedirs(os.path.join(OUT, mode), exist_ok=True)
            if mode == "land":
                # 2) 方向鍵翻頁
                ch.eval("__deck.show(0)")
                time.sleep(0.3)
                key(ch, "ArrowRight", "ArrowRight", 39); key(ch, "PageDown", "PageDown", 34); key(ch, " ", "Space", 32)
                c1 = ch.eval("__deck.cur()")
                key(ch, "ArrowLeft", "ArrowLeft", 37)
                c2 = ch.eval("__deck.cur()")
                key(ch, "End", "End", 35)
                c3 = ch.eval("__deck.cur()")
                ok = (c1 == 3 and c2 == 2 and c3 == N - 1)
                print(f"翻頁鍵：→/PageDown/空白 到第 {c1 + 1} 頁、← 回第 {c2 + 1} 頁、End 到第 {c3 + 1} 頁 {'OK' if ok else 'FAIL'}")
                if not ok:
                    problems.append("翻頁鍵不對")
            for i in sel:
                ch.eval(f"__deck.show({i})")
                time.sleep(a.wait)
                p = os.path.join(OUT, mode, f"{i + 1:02d}_{ids[i]}.png")
                ch.shot().convert("RGB").save(p)
                shots[mode].append((f"{i + 1} {ids[i]}", p))
            # 文字有沒有超出卡片（橫向）
            if mode == "land":
                over = ch.eval("""(function(){var r=[];document.querySelectorAll('.card').forEach(function(c){
                    c.querySelectorAll('.ln').forEach(function(l){ if(l.scrollWidth>c.clientWidth-40) r.push(l.textContent); });});return r;})()""")
                if over:
                    problems.append(f"文字超出卡片：{over}")
            fam = ch.eval("document.fonts.check('68px Huninn') ? 'Huninn 已載入' : 'Huninn 沒載入（用備用字型）'")
            print(f"{mode}: {len(shots[mode])} 張；{fam}")
            problems += [f"{mode} {e}" for e in ch.errors]
        finally:
            ch.close()
    sheet(shots["land"], os.path.join(OUT, "sheet_land.png"), 4, (480, 270))
    if shots["port"]:
        sheet(shots["port"], os.path.join(OUT, "sheet_port.png"), 6, (260, 563))
    if httpd:
        httpd.shutdown()
    print("問題：" + ("無" if not problems else "\n  " + "\n  ".join(problems)))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
