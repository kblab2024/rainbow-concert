"""產生網站 index.html（GitHub Pages 根目錄）：單一檔，CSS／JS 內嵌，GIF 在 assets/。

python src/build_site.py            # 寫 index.html
故事文字的換行點用 layout.wrap（微軟正黑體量字；粉圓的中文與標點字寬相同，已比對），
橫向舞台照這些行排；手機直拿時改成一般排版，人名不拆行。
"""
import html
import json
import os
import sys

from PIL import ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import layout as L  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://kblab2024.github.io/rainbow-concert/"


def page_data(story):
    f = ImageFont.truetype(L.font_path(), L.CARD["font_px"])
    inner = L.CARD["w"] - 2 * L.CARD["pad_x"]
    out = []
    for p in story["pages"]:
        q = {"id": p["id"], "k": p["kind"], "img": p["scene"], "alt": p["alt"]}
        if p["kind"] == "story":
            q["lines"] = L.wrap(p["text"], inner, L.spaced(f, L.CARD["letter_px"]))
            q["text"] = p["text"]
            q["tag"] = f"{p['chapter']}／8〈{p['song']}〉"
            q["box"] = L.card_box(len(q["lines"]))
        elif p["kind"] == "song":
            q.update(label=p["label"], song=p["song"], form=p["form"], tag=f"{p['chapter']}／8")
        else:
            q.update(title=p["title"], credits=p["credits"])
        out.append(q)
    return out


TEMPLATE = r"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%%TITLE_TEXT%%</title>
<meta name="description" content="%%DESC%%">
<meta property="og:type" content="website">
<meta property="og:title" content="%%TITLE_TEXT%%">
<meta property="og:description" content="%%DESC%%">
<meta property="og:image" content="%%SITE%%assets/cover.png">
<meta property="og:url" content="%%SITE%%">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1B1714">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M6 50a26 26 0 0 1 52 0' fill='none' stroke='%23E8453C' stroke-width='6'/%3E%3Cpath d='M12 50a20 20 0 0 1 40 0' fill='none' stroke='%23F6C631' stroke-width='6'/%3E%3Cpath d='M18 50a14 14 0 0 1 28 0' fill='none' stroke='%233C9AD6' stroke-width='6'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Huninn&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="assets/cover.gif">
<style>
:root{
  --ink:#3B2A1A; --ink-soft:#5A4632; --cream:#FFF8EC; --cream-a:rgba(255,248,236,.93);
  --border:#E7D3AE; --accent:#E8475F; --bg:#1B1714; --chip:rgba(27,23,20,.62); --chip-ink:#FFF8EC;
  --font:'Huninn','Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC',sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font-family:var(--font);-webkit-text-size-adjust:100%}
body{overflow:hidden;touch-action:manipulation}
#frame{position:absolute;inset:0;margin:auto;width:min(100vw,calc(100dvh*16/9));height:min(100dvh,calc(100vw*9/16));overflow:hidden;background:#F6F1E6;cursor:pointer}
#stage{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
.bg{position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:0;transition:opacity .8s ease;user-select:none;-webkit-user-drag:none}
.bg.on{opacity:1}
.ov{position:absolute;inset:0;pointer-events:none;transition:opacity .28s ease}
.ov.leaving{opacity:0}
/* 故事頁 */
.tag{position:absolute;left:%%TAG_X%%px;top:%%TAG_Y%%px;height:%%TAG_H%%px;padding:0 %%TAG_PAD%%px;border-radius:%%TAG_R%%px;background:rgba(255,248,236,.9);color:var(--ink-soft);font-size:%%TAG_FONT%%px;letter-spacing:%%TAG_LS%%px;line-height:%%TAG_H%%px;white-space:nowrap;animation:fadeIn .6s ease both}
.card{position:absolute;background:var(--cream-a);border:4px solid var(--border);border-radius:%%CARD_R%%px;padding:%%CARD_PT%%px %%CARD_PX%%px %%CARD_PB%%px;box-shadow:0 10px 30px rgba(59,42,26,.18);animation:rise .7s cubic-bezier(.2,.7,.2,1) .35s both}
.card .ln{display:block;height:%%LINE%%px;line-height:%%LINE%%px;font-size:%%FONT%%px;white-space:nowrap;letter-spacing:%%CARD_LS%%px}
/* 歌曲頁 */
.songbox{position:absolute;left:%%SONG_X%%px;top:%%SONG_Y%%px;width:%%SONG_W%%px;height:%%SONG_H%%px;border-radius:%%SONG_R%%px;background:rgba(255,248,236,.9);box-shadow:0 12px 36px rgba(59,42,26,.22);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;animation:fadeIn .6s ease both}
.songbox .label{font-size:%%SONG_LABEL%%px;letter-spacing:%%SONG_LABEL_LS%%px;color:var(--ink-soft);animation:fadeIn .6s ease .25s both}
.songbox .title{font-size:%%SONG_TITLE%%px;letter-spacing:%%SONG_TITLE_LS%%px;line-height:1.15;color:var(--ink);white-space:nowrap;animation:pop .9s cubic-bezier(.2,.8,.25,1.15) .45s both}
.songbox .form{font-size:%%SONG_FORM%%px;letter-spacing:%%SONG_FORM_LS%%px;color:#fff;background:var(--accent);border-radius:999px;padding:14px 42px;white-space:nowrap;animation:rise .7s ease 1s both}
/* 封面、結尾 */
.titlebox{position:absolute;left:%%TB_X%%px;top:%%TB_Y%%px;width:%%TB_W%%px;height:%%TB_H%%px;border-radius:%%COVER_R%%px;background:rgba(255,248,236,.92);box-shadow:0 12px 36px rgba(59,42,26,.2);display:flex;align-items:center;justify-content:center;animation:fadeIn .5s ease both}
.titlebox h1{margin:0;font-weight:normal;font-size:%%COVER_TITLE%%px;letter-spacing:%%COVER_TITLE_LS%%px;color:var(--ink);white-space:nowrap;animation:wipe 1.6s cubic-bezier(.3,.6,.2,1) .3s both}
.credits{position:absolute;left:%%CR_X%%px;top:%%CR_Y%%px;width:%%CR_W%%px;height:%%CR_H%%px;border-radius:%%COVER_R%%px;background:rgba(255,248,236,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:%%CR_GAP%%px;color:var(--ink)}
.credits div{white-space:nowrap;letter-spacing:%%CR_LS%%px;animation:rise .7s ease both}
.credits .c0{font-size:%%CR0%%px;animation-delay:1.3s}.credits .c1{font-size:%%CR1%%px;animation-delay:1.6s}.credits .c2{font-size:%%CR2%%px;animation-delay:1.9s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.82)}to{opacity:1;transform:none}}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
/* 操作列 */
#ui{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));display:flex;gap:8px;align-items:center;background:var(--chip);color:var(--chip-ink);border-radius:999px;padding:6px;transition:opacity .4s ease;z-index:10;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
#ui.idle{opacity:0;pointer-events:none}
#ui button{all:unset;cursor:pointer;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:22px;color:var(--chip-ink)}
#ui button:hover,#ui button:focus-visible{background:rgba(255,248,236,.18);outline:none}
#ui .count{font-size:17px;min-width:70px;text-align:center;font-variant-numeric:tabular-nums}
#bar{position:fixed;left:0;bottom:0;height:4px;background:linear-gradient(90deg,#E8453C,#F39237,#F6C631,#5DB55A,#3C9AD6,#4B5FB8,#8C5BB0);transition:width .5s ease;z-index:9;opacity:.85}
#hint{position:fixed;left:50%;top:18px;transform:translateX(-50%);background:var(--chip);color:var(--chip-ink);padding:10px 22px;border-radius:999px;font-size:18px;z-index:11;transition:opacity .8s ease;white-space:nowrap}
#hint.gone{opacity:0;pointer-events:none}
#black{position:fixed;inset:0;background:#000;z-index:20;display:none}
#black.on{display:block}
#below{display:none}
.nb{white-space:nowrap}
/* 手機直拿：上圖下文 */
@media (max-aspect-ratio: 1/1){
  body{overflow:auto}
  #frame{position:relative;inset:auto;margin:0;width:100vw;height:56.25vw}
  .ov{display:none}
  #below{display:block;padding:22px 20px 110px;font-size:21px;line-height:1.9;letter-spacing:.05em;color:#FFF8EC}
  #below .btag{display:inline-block;font-size:15px;color:#E9D8B8;border:1px solid rgba(233,216,184,.45);border-radius:999px;padding:2px 12px;margin-bottom:12px}
  #below p{margin:0}
  #below .blabel{font-size:17px;color:#E9D8B8}
  #below .btitle{font-size:32px;line-height:1.3;margin:6px 0 12px}
  #below .bform{display:inline-block;background:var(--accent);color:#fff;border-radius:999px;padding:4px 18px;font-size:18px}
  #below h1{font-size:26px;font-weight:normal;line-height:1.4;margin:0 0 14px}
  #below .bcred{font-size:15px;line-height:1.6;color:#E9D8B8}
  #ui{left:50%;right:auto;transform:translateX(-50%)}
  #ui.idle{opacity:1;pointer-events:auto}
  #hint{display:none}
}
@media (prefers-reduced-motion: reduce){
  .bg{transition:none}
  .tag,.card,.songbox,.songbox *,.titlebox,.titlebox h1,.credits div{animation:none!important}
}
</style>
</head>
<body>
<div id="frame" role="img" aria-label="">
  <div id="stage">
    <img id="bg0" class="bg on" alt="" src="assets/cover.gif">
    <img id="bg1" class="bg" alt="">
  </div>
</div>
<section id="below" aria-live="polite"></section>
<div id="hint">按 → 或點一下畫面，翻到下一頁</div>
<nav id="ui" aria-label="翻頁">
  <button id="prev" aria-label="上一頁" title="上一頁（←）">◀</button>
  <span class="count" id="count">1 / %%N%%</span>
  <button id="next" aria-label="下一頁" title="下一頁（→）">▶</button>
  <button id="fs" aria-label="全螢幕" title="全螢幕（F）">⛶</button>
</nav>
<div id="bar"></div>
<div id="black"></div>
<noscript><div style="color:#FFF8EC;padding:24px;font-size:20px;line-height:1.8;position:relative;z-index:30;background:#1B1714">%%NOSCRIPT%%</div></noscript>
<script id="data" type="application/json">%%DATA%%</script>
<script>
(function(){
  'use strict';
  var D = JSON.parse(document.getElementById('data').textContent), P = D.pages, N = P.length;
  var $ = function(s){ return document.querySelector(s); };
  var frame = $('#frame'), stage = $('#stage'), below = $('#below'), ui = $('#ui');
  var bgs = [$('#bg0'), $('#bg1')], front = 0, cur = -1, token = 0, keep = {};
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  function src(p){ return 'assets/' + p.img + (RM.matches ? '.png' : '.gif'); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function nb(s){ return esc(s).replace(/(黑狗兄|阿晴)/g, '<span class="nb">$1</span>'); }
  function fit(){ stage.style.transform = 'scale(' + (frame.clientWidth / 1920) + ')'; }
  window.addEventListener('resize', fit); fit();

  function preload(i){
    if (i < 0 || i >= N) return;
    var u = src(P[i]); if (keep[u]) return;
    var im = new Image(); im.src = u; keep[u] = im;
  }
  function swapBg(p){
    var u = src(p), t = ++token, back = bgs[1 - front];
    var im = keep[u] || new Image(); keep[u] = im; if (!im.src) im.src = u;
    var go = function(){
      if (t !== token) return;
      back.src = u; back.alt = '';
      back.classList.add('on'); bgs[front].classList.remove('on'); front = 1 - front;
    };
    if (im.decode) im.decode().then(go, go); else if (im.complete) go(); else im.onload = go;
  }
  function overlay(p){
    var h = '';
    if (p.k === 'story'){
      var b = p.box;
      h += '<div class="tag">' + esc(p.tag) + '</div>';
      h += '<div class="card" style="left:' + b[0] + 'px;top:' + b[1] + 'px;width:' + b[2] + 'px;height:' + b[3] + 'px">' +
           p.lines.map(function(l){ return '<span class="ln">' + esc(l) + '</span>'; }).join('') + '</div>';
    } else if (p.k === 'song'){
      h += '<div class="songbox"><div class="label">' + esc(p.label) + '</div><div class="title">〈' + esc(p.song) + '〉</div><div class="form">' + esc(p.form) + '</div></div>';
    } else {
      h += '<div class="titlebox"><h1>' + esc(p.title) + '</h1></div><div class="credits">' +
           p.credits.map(function(c, i){ return '<div class="c' + i + '">' + esc(c) + '</div>'; }).join('') + '</div>';
    }
    var old = stage.querySelectorAll('.ov');
    old.forEach(function(o){ o.classList.add('leaving'); setTimeout(function(){ o.remove(); }, 320); });
    var d = document.createElement('div'); d.className = 'ov'; d.innerHTML = h; stage.appendChild(d);
  }
  function belowHtml(p){
    if (p.k === 'story') return '<span class="btag">' + esc(p.tag) + '</span><p>' + nb(p.text) + '</p>';
    if (p.k === 'song') return '<div class="blabel">' + esc(p.label) + '</div><div class="btitle">〈' + esc(p.song) + '〉</div><span class="bform">' + esc(p.form) + '</span>';
    return '<h1>' + esc(p.title) + '</h1><div class="bcred">' + p.credits.map(esc).join('<br>') + '</div>';
  }
  function show(i){
    i = Math.max(0, Math.min(N - 1, i));
    if (i === cur) return;
    var p = P[i], prev = cur >= 0 ? P[cur] : null;
    cur = i;
    if (!prev || prev.img !== p.img || bgs[front].getAttribute('src') !== src(p)) swapBg(p);
    frame.setAttribute('aria-label', p.alt);
    overlay(p);
    below.innerHTML = belowHtml(p);
    $('#count').textContent = (i + 1) + ' / ' + N;
    $('#bar').style.width = ((i + 1) / N * 100) + '%';
    if (history.replaceState) history.replaceState(null, '', '#' + (i + 1));
    preload(i + 1); preload(i + 2); preload(i - 1);
  }
  function next(){ hideHint(); show(cur + 1); }
  function prev(){ hideHint(); show(cur - 1); }
  function fullscreen(){
    var el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(function(){});
    else if (document.exitFullscreen) document.exitFullscreen();
  }
  var hintT = setTimeout(hideHint, 5000);
  function hideHint(){ clearTimeout(hintT); $('#hint').classList.add('gone'); }

  document.addEventListener('keydown', function(e){
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); show(0); }
    else if (k === 'End') { e.preventDefault(); show(N - 1); }
    else if (k === 'f' || k === 'F') { fullscreen(); }
    else if (k === 'b' || k === 'B' || k === '.') { $('#black').classList.toggle('on'); }
    wake();
  });
  frame.addEventListener('click', function(e){
    var r = frame.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.15) prev(); else next();
  });
  $('#black').addEventListener('click', function(){ $('#black').classList.remove('on'); });
  $('#prev').addEventListener('click', function(e){ e.stopPropagation(); prev(); });
  $('#next').addEventListener('click', function(e){ e.stopPropagation(); next(); });
  $('#fs').addEventListener('click', function(e){ e.stopPropagation(); fullscreen(); });
  var tx = null, ty = null;
  frame.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
  frame.addEventListener('touchend', function(e){
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); if (dx < 0) next(); else prev(); }
  });
  var idleT = null;
  function wake(){ ui.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function(){ ui.classList.add('idle'); }, 2600); }
  document.addEventListener('mousemove', wake); wake();
  window.addEventListener('hashchange', function(){ var n = parseInt(location.hash.slice(1), 10); if (n >= 1) show(n - 1); });
  var n0 = parseInt(location.hash.slice(1), 10);
  show(n0 >= 1 && n0 <= N ? n0 - 1 : 0);
  window.__deck = { show: show, cur: function(){ return cur; }, N: N };
})();
</script>
</body>
</html>
"""


def build():
    story = json.load(open(os.path.join(ROOT, "src", "story.json"), encoding="utf-8"))
    pages = page_data(story)
    C, T, S, V = L.CARD, L.TAG, L.SONG, L.COVER
    tb, cr = V["title_box"], V["credits_box"]
    rep = {
        "TITLE_TEXT": html.escape(story["title"].strip("《》")),
        "DESC": html.escape("樂齡合唱音樂會的動畫故事投影片：八首歌串成黑狗兄與阿晴的故事。" + story["pages"][0]["credits"][0]),
        "SITE": SITE_URL, "N": str(len(pages)),
        "TAG_X": T["x"], "TAG_Y": T["y"], "TAG_H": T["h"], "TAG_PAD": T["pad_x"], "TAG_R": T["h"] // 2, "TAG_FONT": T["font_px"],
        "CARD_R": C["radius"], "CARD_PT": C["pad_top"] - 4, "CARD_PX": C["pad_x"] - 4, "CARD_PB": C["pad_bottom"] - 4,
        "LINE": C["line_px"], "FONT": C["font_px"], "CARD_LS": C["letter_px"], "TAG_LS": T["letter_px"],
        "SONG_LABEL_LS": S["label_ls"], "SONG_TITLE_LS": S["title_ls"], "SONG_FORM_LS": S["form_ls"],
        "COVER_TITLE_LS": V["title_ls"], "CR_LS": V["credits_ls"], "CR_GAP": V["credits_gap"],
        "SONG_X": S["x"], "SONG_Y": S["y"], "SONG_W": S["w"], "SONG_H": S["h"], "SONG_R": S["radius"],
        "SONG_LABEL": S["label_px"], "SONG_TITLE": S["title_px"], "SONG_FORM": S["form_px"],
        "TB_X": tb[0], "TB_Y": tb[1], "TB_W": tb[2], "TB_H": tb[3], "COVER_R": V["radius"], "COVER_TITLE": V["title_px"],
        "CR_X": cr[0], "CR_Y": cr[1], "CR_W": cr[2], "CR_H": cr[3],
        "CR0": V["credits_px"][0], "CR1": V["credits_px"][1], "CR2": V["credits_px"][2],
    }
    noscript = "<h1>" + html.escape(story["title"]) + "</h1>" + "".join(
        f"<p>{html.escape(p['text'])}</p>" if p["kind"] == "story" else
        (f"<h2>{html.escape(p['label'])}〈{html.escape(p['song'])}〉{html.escape(p['form'])}</h2>" if p["kind"] == "song" else "")
        for p in story["pages"])
    out = TEMPLATE
    for k, v in rep.items():
        out = out.replace(f"%%{k}%%", str(v))
    out = out.replace("%%NOSCRIPT%%", noscript)
    data = json.dumps({"pages": pages}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    out = out.replace("%%DATA%%", data)
    assert "%%" not in out, [l for l in out.splitlines() if "%%" in l][:3]
    path = os.path.join(ROOT, "index.html")
    open(path, "w", encoding="utf-8").write(out)
    missing = [p["img"] for p in pages if not os.path.exists(os.path.join(ROOT, "assets", p["img"] + ".gif"))]
    print(f"index.html：{len(pages)} 頁，{len(out) / 1024:.0f} KB；還沒有 GIF 的頁：{len(missing)}" + (f"（{' '.join(missing)}）" if missing else ""))


if __name__ == "__main__":
    build()
