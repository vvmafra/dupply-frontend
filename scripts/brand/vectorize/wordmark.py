"""Gera o wordmark "DUPPLY" em path (Inter Bold) e os lockups horizontais.
Uso: python3 wordmark.py <Inter-Bold.ttf>   (fonte: https://github.com/rsms/inter/releases)
Saída: ../../../public/brand/dupply-logo*.svg e dupply-wordmark.svg
"""
import sys, json, re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
BRAND = Path(__file__).resolve().parents[3] / "public" / "brand"
f = TTFont(sys.argv[1]); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm; cap = f["OS/2"].sCapHeight
text, tracking = "DUPPLY", -0.015 * upm
x, d = 0, []
for ch in text:
    g = gs[cmap[ord(ch)]]; pen = SVGPathPen(gs); g.draw(TransformPen(pen, (1, 0, 0, -1, x, 0))); d.append(pen.getCommands()); x += g.width + tracking
word_w, wordpath = x - tracking, "".join(d)
mark = (BRAND / "dupply-mark.svg").read_text(); MW, MH = json.load(open(BRAND / "mark-meta.json"))["viewBox"]
defs = re.search(r"<defs>.*</defs>", mark).group(0); paths = re.findall(r"<path[^>]*/>", mark)
H = 100.0; s_m = H / MH; mw = MW * s_m; s_w = (0.58 * H) / cap; ww = word_w * s_w; gap = 0.30 * H; total_w = mw + gap + ww; wy = H / 2 + (0.58 * H) / 2
def lockup(fill_word, mark_paths, mark_defs, name):
    (BRAND / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.1f} {H:.0f}" role="img" aria-label="Dupply">{mark_defs}<g transform="scale({s_m:.5f})">{"".join(mark_paths)}</g><g transform="translate({mw+gap:.2f} {wy:.2f}) scale({s_w:.6f})"><path d="{wordpath}" fill="{fill_word}"/></g></svg>')
lockup("#0B1F3B", paths, defs, "dupply-logo.svg"); lockup("#FFFFFF", paths, defs, "dupply-logo-on-dark.svg")
lockup("#0B1F3B", re.findall(r"<path[^>]*/>", (BRAND / "dupply-mark-mono-navy.svg").read_text()), "", "dupply-logo-mono-navy.svg")
lockup("#FFFFFF", re.findall(r"<path[^>]*/>", (BRAND / "dupply-mark-mono-white.svg").read_text()), "", "dupply-logo-mono-white.svg")
(BRAND / "dupply-wordmark.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {word_w:.0f} {cap:.0f}"><g transform="translate(0 {cap})"><path d="{wordpath}" fill="currentColor"/></g></svg>')
json.dump({"lockup": {"H": H, "mark_w": mw, "gap": gap, "word_w": ww, "total_w": total_w}}, open(BRAND / "lockup-meta.json", "w"))
print("ok", total_w)
