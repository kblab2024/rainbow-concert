"""PPTX 換頁轉場與進場動畫（python-pptx 沒有內建，直接寫 XML）。

transition(slide, kind='morph'|'fade', dur_ms)：Morph 以 mc:AlternateContent 包起來，舊版 PowerPoint 自動用 Fade。
entrances(slide, effects)：換到這張投影片就自動依序播放（不必按），effects 為 [(shape, 效果, 延遲ms, 長度ms), …]；
  效果：'fade' 淡入、'zoom' 由 80% 放大淡入、'wipe' 由左擦入、'rise' 由下方淡入上升。
"""
from lxml import etree
from pptx.oxml import parse_xml
from pptx.oxml.ns import qn

NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS_MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"
NS_P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
NS_P159 = "http://schemas.microsoft.com/office/powerpoint/2015/09/main"


def _insert_after_clrmap(sld, el):
    """放在 p:clrMapOvr 之後（schema 順序：cSld、clrMapOvr、transition、timing、extLst）。"""
    after = sld.find(qn("p:clrMapOvr"))
    if after is None:
        after = sld.find(qn("p:cSld"))
    after.addnext(el)


def transition(slide, kind="fade", dur_ms=900):
    sld = slide._element
    for old in sld.findall(qn("p:transition")):
        sld.remove(old)
    for old in sld.findall(f"{{{NS_MC}}}AlternateContent"):
        sld.remove(old)
    if kind == "morph":
        xml = (f'<mc:AlternateContent xmlns:mc="{NS_MC}" xmlns:p="{NS_P}">'
               f'<mc:Choice xmlns:p159="{NS_P159}" Requires="p159">'
               f'<p:transition xmlns:p14="{NS_P14}" spd="slow" p14:dur="{dur_ms}"><p159:morph option="byObject"/></p:transition>'
               f'</mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    else:
        xml = (f'<mc:AlternateContent xmlns:mc="{NS_MC}" xmlns:p="{NS_P}">'
               f'<mc:Choice xmlns:p14="{NS_P14}" Requires="p14">'
               f'<p:transition spd="slow" p14:dur="{dur_ms}"><p:fade/></p:transition>'
               f'</mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    _insert_after_clrmap(sld, parse_xml(xml))


def _behaviors(kind, spid, dur, ids):
    """回傳一個效果裡的行為 XML（set 可見 + 動畫）。ids 為遞增 id 產生器。"""
    tgt = f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
    s = (f'<p:set><p:cBhvr><p:cTn id="{next(ids)}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
         f'{tgt}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>')
    fade = f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{next(ids)}" dur="{dur}"/>{tgt}</p:cBhvr></p:animEffect>'

    def anim(attr, frm, to):
        return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{next(ids)}" dur="{dur}" fill="hold"/>{tgt}'
                f'<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:tavLst><p:tav tm="0"><p:val><p:strVal val="{frm}"/></p:val></p:tav>'
                f'<p:tav tm="100000"><p:val><p:strVal val="{to}"/></p:val></p:tav></p:tavLst></p:anim>')
    if kind == "fade":
        return "10", "0", s + fade
    if kind == "zoom":
        return "53", "16", s + anim("ppt_w", "#ppt_w*0.8", "#ppt_w") + anim("ppt_h", "#ppt_h*0.8", "#ppt_h") + fade
    if kind == "wipe":
        return "22", "8", s + f'<p:animEffect transition="in" filter="wipe(left)"><p:cBhvr><p:cTn id="{next(ids)}" dur="{dur}"/>{tgt}</p:cBhvr></p:animEffect>'
    if kind == "rise":
        return "42", "0", s + fade + anim("ppt_y", "#ppt_y+0.03", "#ppt_y")
    raise ValueError(kind)


def entrances(slide, effects):
    """effects：[(shape, kind, delay_ms, dur_ms), …]。全部在換到這張投影片時自動開始（第一個與上一動畫同時）。"""
    sld = slide._element
    for old in sld.findall(qn("p:timing")):
        sld.remove(old)
    if not effects:
        return

    def counter(start):
        n = start
        while True:
            yield n
            n += 1
    ids = counter(5)
    pars = []
    bld = []
    for shape, kind, delay, dur in effects:
        spid = shape.shape_id
        ctn_id = next(ids)
        preset, sub, body = _behaviors(kind, spid, dur, ids)
        pars.append(f'<p:par><p:cTn id="{ctn_id}" presetID="{preset}" presetClass="entr" presetSubtype="{sub}" fill="hold" grpId="0" nodeType="withEffect">'
                    f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>{body}</p:childTnLst></p:cTn></p:par>')
        if shape._element.tag == qn("p:sp"):
            bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/>')
    xml = (f'<p:timing xmlns:p="{NS_P}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
           f'<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst>'
           f'<p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
           + "".join(pars) +
           f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
           f'</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
           f'</p:childTnLst></p:cTn></p:par></p:tnLst>'
           + (f'<p:bldLst>{"".join(bld)}</p:bldLst>' if bld else "") +
           f'</p:timing>')
    el = parse_xml(xml)
    # timing 要在 transition（或包著它的 AlternateContent）之後
    anchor = sld.find(f"{{{NS_MC}}}AlternateContent")
    if anchor is None:
        anchor = sld.find(qn("p:transition"))
    if anchor is not None:
        anchor.addnext(el)
    else:
        _insert_after_clrmap(sld, el)
