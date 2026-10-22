# Marca Dupply: fontes e geradores

Tudo em `public/brand/` é gerado daqui. Não edite o PDF nem os PNGs à mão.

| Comando | O que faz |
|---|---|
| `python3 scripts/brand/palette.py` | Recalcula `ramps.json` (escalas OKLCH a partir das cores do símbolo) |
| `npm run brand:book` | Monta `out/brand-book.html` e renderiza `public/brand/dupply-brand-book.pdf` + prévias em `out/` |
| `npm run brand:icons` | Gera favicon-16/32, apple-touch-icon, icon-192/512 e og-image a partir de `favicon.svg` / `app-icon.svg` |

Requisitos: Python 3 (sem dependências extras para `palette.py` e `build_book.py`) e Playwright (`npm i -D playwright`, Chromium já incluso).

## Vetorização (feita uma vez)

`vectorize/` guarda o processo que transformou o logo original (bitmap embrulhado em SVG) em vetor real:

1. `vec.py` separa as duas formas (bowl azul e diagonal) e mede os gradientes no raster.
2. `mksvg2.py` segmenta barra/arco por luminosidade, traça os contornos (OpenCV) e escreve `dupply-mark*.svg` com gradientes de 5 stops.
3. `wordmark.py <Inter-Bold.ttf>` converte "DUPPLY" em path e monta os lockups horizontais.

Requer `numpy`, `opencv-python`, `fonttools`. Só precisa rodar de novo se o símbolo mudar.

## Regras rápidas

- Símbolo e nome: ver `public/brand/dupply-brand-book.pdf`, página 4 (área de proteção, tamanho mínimo, usos incorretos).
- No React, use `dupply-mark-mono.svg` inline quando precisar herdar `currentColor`; o colorido vai como `<img>`.
- Cores de interface vêm de `src/index.css`, não daqui. `ramps.json` é a fonte para gerar os tokens e o manual.
