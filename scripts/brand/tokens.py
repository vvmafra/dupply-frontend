"""Gera src/styles/palette.css (primitivos de cor em @theme) a partir de ramps.json.

Uso: python3 scripts/brand/tokens.py
É a mesma fonte do manual de marca, então código e PDF não derivam.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
R = {k: {int(s): v for s, v in r.items()} for k, r in json.load(open(HERE / "ramps.json"))["ramps"].items()}
STEPS = (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)

BRAND = {
    "brand-blue": "#0192FE",        # símbolo, barra
    "brand-blue-deep": "#064DCD",   # símbolo, arco
    "brand-cyan": "#0FCBF4",        # símbolo, diagonal (topo)
    "brand-mint": "#52EDBA",        # símbolo, diagonal (base)
    "navy": "#0B1F3B",              # fundo das páginas públicas
    "ink-950": "#07101C",           # fundo escuro do app
    "ink-900": "#101B2B",           # card escuro
    "ink-800": "#1B2737",           # borda / secondary escuro
}
# Famílias padrão do Tailwind que o código ainda usa, apontadas para as ramps da marca.
# Remover cada alias quando o codemod (T4) trocar as classes.
ALIASES = {"slate": "neutral", "zinc": "neutral", "gray": "neutral", "indigo": "violet", "red": "coral", "rose": "coral", "green": "emerald", "sky": "blue", "teal": "cyan"}

lines = [
    "/* GERADO por scripts/brand/tokens.py a partir de scripts/brand/ramps.json. Não editar à mão. */",
    "/* Primitivos de cor da Dupply. Os semânticos (--primary, --background…) ficam em src/index.css. */",
    "@theme {",
    "  --color-*: initial;",
    "  --color-white: #ffffff;",
    "  --color-black: #000000;",
    "",
]
for name, hexv in BRAND.items():
    lines.append(f"  --color-{name}: {hexv};")
lines.append("")
for fam in ("blue", "cyan", "mint", "violet", "emerald", "amber", "coral", "neutral"):
    lines.append(f"  /* {fam} */")
    for s in STEPS:
        lines.append(f"  --color-{fam}-{s}: {R[fam][s]};")
    lines.append("")
lines.append("  /* aliases temporários (famílias padrão ainda usadas no código) */")
for alias, fam in ALIASES.items():
    for s in STEPS:
        lines.append(f"  --color-{alias}-{s}: var(--color-{fam}-{s});")
lines.append("}")
lines.append("")

out = ROOT / "src" / "styles" / "palette.css"
out.parent.mkdir(exist_ok=True)
out.write_text("\n".join(lines))
print("ok", out.relative_to(ROOT), len(lines), "linhas")
