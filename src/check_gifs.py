"""檢查 assets/ 的 GIF：大小、格數、無限循環、首末格接縫；可選擇用 Chrome 驗證 t=1 與 t=0 是否同一張（週期函數）。

用法：
  python src/check_gifs.py                 # 全部 GIF
  python src/check_gifs.py c2a c2b s2      # 指定場景
  python src/check_gifs.py --file ch2 --periodic   # 另外用 Chrome 比對 draw(0) 與 draw(1)
結束碼：有 FAIL 就是 1。
大小：> 2.5 MB 為 WARN，> 3.0 MB 為 FAIL。
"""
import argparse
import glob
import json
import os
import sys

import numpy as np
from PIL import Image, ImageSequence

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
WARN_MB, FAIL_MB = 2.5, 3.0


def frames(path):
    im = Image.open(path)
    out = [np.asarray(fr.convert("RGB"), dtype=np.int16) for fr in ImageSequence.Iterator(im)]
    return im, out


def check(path):
    sid = os.path.splitext(os.path.basename(path))[0]
    mb = os.path.getsize(path) / 1e6
    im, fr = frames(path)
    n = len(fr)
    loop = im.info.get("loop", None)
    dur = im.info.get("duration", None)
    diffs = [np.abs(fr[i + 1] - fr[i]).mean() for i in range(n - 1)]
    seam = np.abs(fr[0] - fr[-1]).mean()
    med = float(np.median(diffs)) if diffs else 0.0
    status, notes = "OK", []
    if mb > FAIL_MB:
        status = "FAIL"; notes.append(f"太大 {mb:.2f} MB（上限 {FAIL_MB}）")
    elif mb > WARN_MB:
        status = "WARN"; notes.append(f"偏大 {mb:.2f} MB（建議 ≤ {WARN_MB}）")
    if loop != 0:
        status = "FAIL"; notes.append(f"不是無限循環（loop={loop}）")
    if n < 8:
        status = "FAIL"; notes.append(f"格數太少 {n}")
    if seam > 3 * med + 1.0:
        status = "FAIL" if seam > 6 * med + 2.0 else ("WARN" if status == "OK" else status)
        notes.append(f"首末格接縫跳動：{seam:.2f}（一般每格 {med:.2f}）")
    if med < 0.02:
        notes.append("幾乎沒有動")
        status = "WARN" if status == "OK" else status
    return sid, status, mb, n, dur, med, seam, notes


def periodic(ids, files):
    import render as R
    ch = R.Chrome()
    bad = []
    try:
        ch.goto(R.stage_url(files))
        import time
        for _ in range(400):
            if ch.eval("document.body && document.body.dataset.ready") == "1":
                break
            time.sleep(0.05)
        for sid in ids:
            ch.eval(f"renderScene({json.dumps(sid)}, 0)")
            a = np.asarray(ch.shot().convert("RGB"), dtype=np.int16)
            ch.eval(f"renderScene({json.dumps(sid)}, 1)")
            b = np.asarray(ch.shot().convert("RGB"), dtype=np.int16)
            frac = float((np.abs(a - b).max(axis=2) > 24).mean())
            ok = frac < 0.002
            print(f"  週期 {sid}: draw(0) 與 draw(1) 不同的像素 {frac * 100:.2f}% {'OK' if ok else 'FAIL（動畫不是週期函數，GIF 會跳）'}")
            if not ok:
                bad.append(sid)
    finally:
        ch.close()
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--file", action="append", default=[])
    ap.add_argument("--periodic", action="store_true")
    a = ap.parse_args()
    ids = list(a.ids)
    files = []
    if a.file:
        import render as R
        files = [f for f in R.scene_files() if os.path.splitext(os.path.basename(f))[0] in set(a.file)]
        if not ids:
            ch = R.Chrome()
            try:
                ch.goto(R.stage_url(files))
                import time
                for _ in range(400):
                    if ch.eval("document.body && document.body.dataset.ready") == "1":
                        break
                    time.sleep(0.05)
                ids = [s[0] for s in json.loads(R.list_scenes(ch)) if not s[0].startswith("ref_")]
            finally:
                ch.close()
    paths = [os.path.join(ASSETS, f"{i}.gif") for i in ids] if ids else sorted(glob.glob(os.path.join(ASSETS, "*.gif")))
    fail = 0
    total = 0.0
    for p in paths:
        if not os.path.exists(p):
            print(f"{os.path.basename(p)}: FAIL 沒有這個檔")
            fail += 1
            continue
        sid, st, mb, n, dur, med, seam, notes = check(p)
        total += mb
        print(f"{sid:6s} {st:4s} {mb:5.2f} MB {n:3d} 格 {dur} ms  每格變化 {med:5.2f}  接縫 {seam:5.2f}  {'；'.join(notes)}")
        fail += st == "FAIL"
    print(f"共 {len(paths)} 張，{total:.1f} MB")
    if a.periodic:
        if not files:
            import render as R
            files = R.scene_files()
        fail += len(periodic([os.path.splitext(os.path.basename(p))[0] for p in paths], files))
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
