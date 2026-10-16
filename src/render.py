"""把 art/ 裡的 SVG 場景逐格算成 GIF 與首格 PNG。

用法：
  python src/render.py c1a c1b            # 算指定場景
  python src/render.py --file ch1         # 算 art/scenes/ch1.js 裡的全部場景
  python src/render.py --all              # 算 art/scenes/*.js 全部
  python src/render.py c1a --frames 0,0.5 # 只輸出指定時間點的 PNG（看圖用，不做 GIF）

場景寫法見 art/STYLE.md：每個場景 SCENES[id] = {dur, file, draw(t)}，
draw(t) 回傳 1920×1080 的 SVG 內容；t 從 0 到 1，必須是週期函數（t=1 等於 t=0）。

輸出：assets/<id>.gif、assets/<id>.png（首格）。
Chrome：/Applications/Google Chrome.app，headless，用 DevTools 協定截圖。
"""
import argparse
import base64
import glob
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

import websocket
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, "art")
ASSETS = os.path.join(ROOT, "assets")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

W, H = 1920, 1080         # GIF 解析度（場景座標一律 1920×1080）
FRAME_MS = 80             # 一格 80 ms（12.5 fps）
COLORS = 255


class Chrome:
    def __init__(self, w=W, h=H):
        self.tmp = tempfile.mkdtemp(prefix="rc_chrome_")
        self.proc = subprocess.Popen(
            [CHROME, "--headless=new", "--remote-debugging-port=0",
             f"--user-data-dir={self.tmp}", "--hide-scrollbars",
             "--no-first-run", "--no-default-browser-check",
             "--allow-file-access-from-files", "--force-device-scale-factor=1",
             f"--window-size={w},{h}", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        port_file = os.path.join(self.tmp, "DevToolsActivePort")
        for _ in range(200):
            if os.path.exists(port_file) and open(port_file).read().strip():
                break
            time.sleep(0.05)
        port = int(open(port_file).read().split()[0])
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list"))
                page = [t for t in tabs if t.get("type") == "page"][0]
                break
            except Exception:
                time.sleep(0.05)
        self.ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=120,
                                              suppress_origin=True)
        self.mid = 0
        self.send("Page.enable")
        self.send("Runtime.enable")
        self.size(w, h)

    def send(self, method, **params):
        self.mid += 1
        my = self.mid
        self.ws.send(json.dumps({"id": my, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("method") == "Runtime.consoleAPICalled":
                args = " ".join(str(a.get("value", a.get("description", ""))) for a in msg["params"]["args"])
                print(f"  [console.{msg['params']['type']}] {args}", file=sys.stderr)
            if msg.get("method") == "Runtime.exceptionThrown":
                d = msg["params"]["exceptionDetails"]
                print(f"  [JS error] {d.get('exception', {}).get('description', d.get('text'))}", file=sys.stderr)
            if msg.get("id") == my:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def size(self, w, h):
        self.send("Emulation.setDeviceMetricsOverride", width=w, height=h,
                  deviceScaleFactor=1, mobile=False)

    def goto(self, url):
        self.send("Page.navigate", url=url)
        for _ in range(400):
            r = self.eval("document.readyState")
            if r == "complete":
                break
            time.sleep(0.05)
        # 等字型與圖片
        self.eval("document.fonts ? document.fonts.ready.then(()=>1) : 1", await_promise=True)

    def eval(self, expr, await_promise=False):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True,
                      awaitPromise=await_promise)
        if "exceptionDetails" in r:
            raise RuntimeError(f"JS: {r['exceptionDetails'].get('exception', {}).get('description', r['exceptionDetails'])}")
        return r.get("result", {}).get("value")

    def shot(self, transparent=False):
        if transparent:
            self.send("Emulation.setDefaultBackgroundColorOverride", color={"r": 0, "g": 0, "b": 0, "a": 0})
        r = self.send("Page.captureScreenshot", format="png", captureBeyondViewport=False)
        return Image.open(io.BytesIO(base64.b64decode(r["data"])))

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass
        self.proc.terminate()
        try:
            self.proc.wait(5)
        except Exception:
            self.proc.kill()
        shutil.rmtree(self.tmp, ignore_errors=True)


def scene_files():
    return sorted(glob.glob(os.path.join(ART, "scenes", "*.js")))


def stage_url(files):
    q = ",".join(os.path.splitext(os.path.basename(f))[0] for f in files)
    return "file://" + os.path.join(ART, "stage.html") + "?files=" + q


def list_scenes(ch):
    return ch.eval("JSON.stringify(Object.entries(SCENES).map(([k,v])=>[k,v.dur,v.file]))")


def source_colors():
    """lib.js 與場景檔裡寫死的色碼（扁平色塊的「正確顏色」），量化時優先保留。"""
    import re
    cols = set()
    for f in [os.path.join(ART, "lib.js")] + scene_files():
        for h in re.findall(r"#([0-9A-Fa-f]{6})\b", open(f, encoding="utf-8").read()):
            cols.add(int(h, 16))
    return cols


_SRC_COLORS = None


def build_palette(frames, reserve=120):
    """全片共用一組調色盤（不抖色，避免閃爍）：
    1. 先保留畫面上確實出現、且是原始色碼的扁平色（衣服、膚色、髮色等），最多 reserve 色，確保小面積的顏色不被換掉；
    2. 其餘的色（漸層、反鋸齒邊）用中位切割補滿 255 色。index 255 留給透明，用不會出現的洋紅佔位。"""
    import numpy as np
    global _SRC_COLORS
    if _SRC_COLORS is None:
        _SRC_COLORS = source_colors()
    step = max(1, len(frames) // 8)
    sample = frames[::step]
    arr = np.concatenate([np.asarray(f, dtype=np.uint32).reshape(-1, 3) for f in sample[:6]])
    packed = (arr[:, 0] << 16) | (arr[:, 1] << 8) | arr[:, 2]
    vals, counts = np.unique(packed, return_counts=True)
    order = np.argsort(-counts)
    keys = []
    for v, c in zip(vals[order], counts[order]):
        if c < 60:
            break
        if int(v) in _SRC_COLORS:
            keys.append(int(v))
            if len(keys) >= reserve:
                break
    rest = COLORS - len(keys)
    tw, th = sample[0].width // 2, sample[0].height // 2
    mont = Image.new("RGB", (tw, th * len(sample)))
    for i, f in enumerate(sample):
        mont.paste(f.resize((tw, th), Image.BILINEAR), (0, i * th))
    mc = mont.quantize(colors=rest, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = mc.getpalette()[:rest * 3]
    pal += [0, 0, 0] * (rest - len(pal) // 3)
    for k in keys:
        pal += [(k >> 16) & 255, (k >> 8) & 255, k & 255]
    pal += [255, 0, 255]                      # index 255：透明佔位
    pimg = Image.new("P", (1, 1))
    pimg.putpalette(pal)
    return pimg


def save_gif(frames, path):
    """第 2 格起，和前一格相同的像素設成透明（index 255），GIF 只存有變的地方，檔案約小到 1/3，畫面不變。"""
    import numpy as np
    pal = build_palette(frames)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    arrs = [np.array(x) for x in q]
    for i, a in enumerate(arrs):
        if (a == 255).any():
            raise RuntimeError(f"{os.path.basename(path)} 第 {i} 格用到透明 index 255")
    palette = pal.getpalette()
    out = [q[0]]
    for i in range(1, len(arrs)):
        a = arrs[i].copy()
        a[arrs[i] == arrs[i - 1]] = 255
        im = Image.fromarray(a, "P")
        im.putpalette(palette)
        im.info["transparency"] = 255
        out.append(im)
    out[0].save(path, save_all=True, append_images=out[1:], duration=FRAME_MS, loop=0,
                optimize=False, disposal=1, transparency=255)


def render_scene(ch, sid, dur, out_dir=ASSETS, times=None):
    n = max(2, round(dur * 1000 / FRAME_MS))
    if times is not None:
        outs = []
        for t in times:
            ch.eval(f"renderScene({json.dumps(sid)}, {t})")
            im = ch.shot().convert("RGB")
            p = os.path.join(out_dir, f"{sid}_t{t:.2f}.png")
            im.save(p)
            outs.append(p)
        return outs
    frames = []
    for i in range(n):
        ch.eval(f"renderScene({json.dumps(sid)}, {i / n})")
        frames.append(ch.shot().convert("RGB"))
    os.makedirs(out_dir, exist_ok=True)
    gif = os.path.join(out_dir, f"{sid}.gif")
    save_gif(frames, gif)
    frames[0].save(os.path.join(out_dir, f"{sid}.png"), optimize=True)
    return gif, n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--file", action="append", default=[], help="scenes/<name>.js 的 name，可重複")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--frames", help="只輸出這些時間點的 PNG，例 0,0.25,0.5")
    ap.add_argument("--out", default=None, help="輸出資料夾（預設 assets/；--frames 預設 _archive/frames/）")
    ap.add_argument("--size", default=f"{W}x{H}")
    a = ap.parse_args()
    w, h = (int(x) for x in a.size.split("x"))

    files = scene_files()
    if a.file:
        want = set(a.file)
        files = [f for f in files if os.path.splitext(os.path.basename(f))[0] in want]
    ch = Chrome(w, h)
    try:
        ch.goto(stage_url(files))
        for _ in range(400):
            if ch.eval("document.body && document.body.dataset.ready") == "1":
                break
            time.sleep(0.05)
        scenes = json.loads(list_scenes(ch))
        if a.ids:
            scenes = [s for s in scenes if s[0] in set(a.ids)]
            missing = set(a.ids) - {s[0] for s in scenes}
            if missing:
                sys.exit(f"找不到場景：{sorted(missing)}")
        elif not (a.all or a.file):
            sys.exit("請給場景 id、--file 或 --all")
        times = [float(x) for x in a.frames.split(",")] if a.frames else None
        out = a.out or (os.path.join(ROOT, "_archive", "frames") if times else ASSETS)
        os.makedirs(out, exist_ok=True)
        for sid, dur, f in scenes:
            t0 = time.time()
            r = render_scene(ch, sid, dur, out, times)
            if times:
                print(f"{sid}: {', '.join(os.path.relpath(p, ROOT) for p in r)}")
            else:
                gif, n = r
                print(f"{sid}: {n} 格 {os.path.getsize(gif) / 1e6:.2f} MB  {time.time() - t0:.1f}s  ({f})")
    finally:
        ch.close()


if __name__ == "__main__":
    main()
