"""Gera scripts/brand/out/brand-book.html (A4 paisagem) a partir de public/brand/*.svg e de ramps.json.
Renderize com: node scripts/brand/render.mjs  (ou npm run brand:book)."""
import json, re, math, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LOGO, PAL, OUT = ROOT / "public" / "brand", HERE, HERE / "out"
OUT.mkdir(exist_ok=True)
R = {k: {int(s): v for s, v in r.items()} for k, r in json.load(open(PAL / "ramps.json"))["ramps"].items()}

# ---------- cores ----------
BRAND = [("Azul claro", "#0192FE"), ("Azul profundo", "#064DCD"), ("Ciano", "#0FCBF4"), ("Menta", "#52EDBA")]
NAVY = "#0B1F3B"
PRIMARY_L, PRIMARY_D = "#0060DE", "#0192FE"
INK950, INK900, INK800 = "#07101C", "#101B2B", "#1B2737"

def lin(c):
    c /= 255; return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def lum(h):
    r, g, b = [lin(int(h[i:i + 2], 16)) for i in (1, 3, 5)]; return 0.2126 * r + 0.7152 * g + 0.0722 * b
def cr(a, b):
    la, lb = lum(a), lum(b); hi, lo = max(la, lb), min(la, lb); return (hi + 0.05) / (lo + 0.05)
def oklch(h):
    r, g, b = [lin(int(h[i:i + 2], 16)) for i in (1, 3, 5)]
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    C = math.hypot(a, b2); H = math.degrees(math.atan2(b2, a)) % 360
    return f"oklch({L:.2f} {C:.3f} {H:.0f})"
def rgb(h): return "rgb(" + ", ".join(str(int(h[i:i + 2], 16)) for i in (1, 3, 5)) + ")"

# ---------- svgs ----------
def svg(name): return open(LOGO / name).read()
mark = svg("dupply-mark.svg")
meta = json.load(open(LOGO / "mark-meta.json")); MW, MH = meta["viewBox"]
defs = re.search(r"<defs>.*</defs>", mark).group(0)
paths = re.findall(r"<path[^>]*/>", mark)
def single(path_html, pad=0):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {MW + 2 * pad} {MH + 2 * pad}">{defs}{path_html}</svg>'
exploded = [("Arco", paths[0]), ("Barra", paths[1]), ("Diagonal", paths[2])]
# ordem visual: barra, arco, diagonal
exploded = [exploded[1], exploded[0], exploded[2]]
lock = svg("dupply-logo.svg"); lock_dark = svg("dupply-logo-on-dark.svg")
lock_mn = svg("dupply-logo-mono-navy.svg"); lock_mw = svg("dupply-logo-mono-white.svg")
mark_mn = svg("dupply-mark-mono-navy.svg"); mark_mw = svg("dupply-mark-mono-white.svg")
lk = json.load(open(LOGO / "lockup-meta.json"))["lockup"]

# ---------- helpers ----------
def page(num, title, body, dark=False, cls=""):
    foot = f'<footer><span>Dupply, manual de marca, versão 1.0</span><span>{num}</span></footer>' if num else ""
    head = f'<h1>{title}</h1>' if title else ""
    return f'<section class="page {"dark" if dark else ""} {cls}">{head}{body}{foot}</section>'

def swatch(hexv, name, big=False, sub=None):
    light = lum(hexv) > 0.35
    fg = INK950 if light else "#fff"
    sub = sub or f"{oklch(hexv)}<br>{rgb(hexv)}"
    return f'<div class="sw {"big" if big else ""}" style="background:{hexv};color:{fg}"><b>{name}</b><span>{hexv.upper()}</span><small>{sub}</small></div>'

def pair(fgc, bgc, label):
    return f'<div class="pair" style="background:{bgc};color:{fgc}"><span>{label}</span><em>{cr(fgc, bgc):.1f}:1</em></div>'

# ---------- páginas ----------
P = []

# 1 capa
P.append(page(None, None, f'''
<div class="cover">
  <div class="cover-mark">{mark}</div>
  <div class="cover-text">
    <h1>Manual de marca</h1>
    <p class="lede">Dupply</p>
    <p class="meta">Versão 1.0, outubro de 2026</p>
  </div>
</div>''', dark=True, cls="cover-page"))

# 2 a marca
P.append(page(2, "A marca", f'''
<div class="cols">
  <div class="text">
    <p>O símbolo é um <strong>D</strong> construído por três formas: a barra, o arco e a diagonal. A diagonal atravessa o D como um fluxo que entra e sai, a duplicata que vira capital.</p>
    <p>As duas famílias de cor marcam os dois lados da operação. O azul é a estrutura: plataforma, contrato, custódia. O ciano que vira menta é o dinheiro em movimento.</p>
    <h2>Construção</h2>
    <p>Barra e arco compartilham o gradiente azul, com uma dobra visível onde se encontram: a barra passa por cima do arco. A diagonal tem gradiente próprio, de ciano a menta, a 110°.</p>
    <p>O símbolo foi vetorizado a partir do original em bitmap. Os arquivos em <code>public/brand/</code> são a referência; não redesenhe a partir de capturas.</p>
  </div>
  <div class="visual">
    <div class="mark-hero">{mark}</div>
    <div class="exploded">{"".join(f'<figure>{single(p)}<figcaption>{n}</figcaption></figure>' for n, p in exploded)}</div>
  </div>
</div>'''))

# 3 versões
P.append(page(3, "Versões", f'''
<div class="cols">
  <div class="text">
    <p>A versão horizontal em cor é a principal. Use a monocromática quando só houver uma cor disponível (gravação, carimbo, marca d'água) ou quando o fundo competir com os gradientes.</p>
    <p>Sobre fundos escuros, o símbolo mantém a cor e o nome passa a branco. O navy <code>{NAVY}</code> é o fundo escuro oficial.</p>
    <h2>Símbolo sozinho</h2>
    <p>Só onde o nome já é conhecido: favicon, avatar, ícone de app, canto de documento. Em qualquer primeiro contato, use a versão com o nome.</p>
  </div>
  <div class="visual grid2">
    <div class="tile light">{lock}<span>Cor sobre claro (principal)</span></div>
    <div class="tile navy">{lock_dark}<span>Cor sobre navy</span></div>
    <div class="tile light">{lock_mn}<span>Monocromática navy</span></div>
    <div class="tile navy">{lock_mw}<span>Monocromática branca</span></div>
    <div class="tile light small">{mark}{mark_mn}<span>Símbolo: cor e mono</span></div>
    <div class="tile navy small">{mark}{mark_mw}<span>Símbolo sobre navy</span></div>
  </div>
</div>'''))

# 4 proteção e usos incorretos
H = lk["H"]; bar_h = 0.265 * H  # espessura da barra ≈ x
cs = f'''<svg viewBox="{-bar_h} {-bar_h} {lk["total_w"] + 2 * bar_h} {H + 2 * bar_h}" class="clear">
<rect x="{-bar_h}" y="{-bar_h}" width="{lk["total_w"] + 2 * bar_h}" height="{H + 2 * bar_h}" fill="none" stroke="{PRIMARY_L}" stroke-width="0.8" stroke-dasharray="3 3"/>
<rect x="{-bar_h}" y="{-bar_h}" width="{bar_h}" height="{bar_h}" fill="{PRIMARY_L}" opacity=".15"/>
<text x="{-bar_h / 2}" y="{-bar_h / 2 + 3}" font-size="8" fill="{PRIMARY_L}" text-anchor="middle" font-family="Inter">x</text>
<g>{lock.split(">",1)[1].rsplit("</svg>",1)[0]}</g></svg>'''
donts = [("Não rotacionar", f'<div style="transform:rotate(-14deg)">{mark}</div>'),
         ("Não distorcer", f'<div style="transform:scaleX(1.45)">{mark}</div>'),
         ("Não trocar as cores", mark_mn.replace(NAVY, "#E64343")),
         ("Não aplicar sombra ou contorno", f'<div style="filter:drop-shadow(3px 4px 3px rgba(0,0,0,.45))">{mark}</div>'),
         ("Não usar sobre gradiente", f'<div class="busy">{mark}</div>'),
         ("Não recriar o nome com outra fonte", '<div class="fakeword">DUPPLY</div>')]
P.append(page(4, "Área de proteção e usos incorretos", f'''
<div class="cols">
  <div class="text">
    <p>Mantenha ao redor da marca um espaço livre igual à altura da barra do símbolo, marcado como <strong>x</strong>. Nada entra nessa área: texto, outras marcas, bordas da página.</p>
    <h2>Tamanho mínimo</h2>
    <table class="kv"><tr><td>Símbolo</td><td>24 px em tela, 6 mm impresso</td></tr><tr><td>Marca horizontal</td><td>96 px em tela, 24 mm impresso</td></tr></table>
    <p>Abaixo disso a diagonal perde definição e o gradiente vira ruído.</p>
    {cs}
  </div>
  <div class="visual donts">{"".join(f'<figure><div class="dont">{h}</div><figcaption>{t}</figcaption></figure>' for t, h in donts)}</div>
</div>'''))

# 5 cores da marca
grad_a = "linear-gradient(135deg,#0192FE,#064DCD)"; grad_b = "linear-gradient(135deg,#0FCBF4,#52EDBA)"
P.append(page(5, "Cores da marca", f'''
<div class="cols">
  <div class="text">
    <p>Quatro cores saem do símbolo. O azul claro e o azul profundo são a estrutura; o ciano e a menta, o movimento. Os dois gradientes só existem no símbolo e em momentos de marca: capa, abertura de página, ilustração.</p>
    <h2>Proporção</h2>
    <div class="ratio"><i style="flex:85;background:{R['neutral'][100]}"></i><i style="flex:10;background:{PRIMARY_L}"></i><i style="flex:5;background:{grad_b}"></i></div>
    <p class="caption">85% neutros, 10% azul de ação, 5% acento ciano e menta. Uma interface da Dupply é majoritariamente branca e cinza; a cor aponta onde agir.</p>
    <p>O azul claro do símbolo, <code>#0192FE</code>, tem contraste 3,2:1 com texto branco e por isso <strong>não é cor de botão</strong> em fundo claro. A cor de ação é o <code>{PRIMARY_L}</code>, entre os dois azuis do símbolo.</p>
  </div>
  <div class="visual">
    <div class="brand-sw">{"".join(swatch(h, n, big=True) for n, h in BRAND)}</div>
    <div class="grads"><div style="background:{grad_a}"><b>Gradiente azul</b><span>#0192FE → #064DCD, 135°</span></div><div style="background:{grad_b};color:{INK950}"><b>Gradiente acento</b><span>#0FCBF4 → #52EDBA, 135°</span></div></div>
    <div class="brand-sw">{swatch(NAVY, "Navy", sub="Fundo das páginas públicas e capas")}{swatch(PRIMARY_L, "Azul de ação", sub="Botões, links, foco")}{swatch(INK950, "Tinta", sub="Texto e fundo escuro")}{swatch(R['neutral'][50], "Papel", sub="Fundo claro")}</div>
  </div>
</div>'''))

# 6 paleta funcional
rows = [("Ação", "primary", PRIMARY_L, "#FFFFFF", PRIMARY_D, INK950, "Botão principal, link, foco, seleção"),
        ("Sucesso", "success", R["emerald"][700], R["emerald"][100], R["emerald"][300], R["emerald"][900], "Aprovado, liquidado, pago"),
        ("Atenção", "warning", R["amber"][700], R["amber"][100], R["amber"][300], R["amber"][900], "Pendente, em análise, vencimento próximo"),
        ("Erro", "destructive", R["coral"][700], R["coral"][100], R["coral"][300], R["coral"][900], "Recusado, vencido, falha"),
        ("Informação", "info", R["blue"][700], R["blue"][100], R["blue"][300], R["blue"][900], "Em captação, em andamento, dica"),
        ("Inteligência artificial", "ai", R["violet"][700], R["violet"][100], R["violet"][300], R["violet"][900], "Laudo, score e sugestão do agente de IA"),
        ("Neutro", "muted", R["neutral"][600], "#FFFFFF", R["neutral"][400], INK950, "Texto secundário, bordas, fundos")]
tr = "".join(f'<tr><td><b>{n}</b><br><code>{t}</code></td><td>{pair(fl, bl, "Aa")}<small>{fl.upper()} sobre {bl.upper()}</small></td><td>{pair(fd, bd, "Aa")}<small>{fd.upper()} sobre {bd.upper()}</small></td><td>{u}</td></tr>' for n, t, fl, bl, fd, bd, u in rows)
ramps = "".join(f'<div class="ramp"><b>{k}</b>{"".join(f"<i style=background:{R[k][s]} title={s}></i>" for s in (50,100,200,300,400,500,600,700,800,900,950))}</div>' for k in ("blue", "cyan", "mint", "violet", "emerald", "amber", "coral", "neutral"))
P.append(page(6, "Paleta funcional", f'''
<div class="cols wide">
  <div class="text">
    <p>Na interface, cada cor tem um papel e só um. Azul é ação. Verde, âmbar e coral são estado. Violeta marca o que foi gerado pelo agente de IA. Ciano e menta são marca e nunca aparecem em botão ou em status.</p>
    <p>Os pares abaixo foram verificados para contraste mínimo de 4,5:1 (WCAG AA) em texto corrido. O número ao lado de cada par é o contraste medido.</p>
    <h2>Escalas</h2>
    <p class="caption">Oito escalas de 50 a 950, geradas em OKLCH a partir das cores do símbolo. Os cinzas têm a mesma matiz do azul, por isso nada parece "de fora".</p>
    {ramps}
  </div>
  <div class="visual"><table class="sem"><thead><tr><th>Papel</th><th>Claro</th><th>Escuro</th><th>Uso</th></tr></thead><tbody>{tr}</tbody></table></div>
</div>'''))

# 7 tipografia
amounts = [("Captado", "R$ 184.250,00"), ("Alvo", "R$ 250.000,00"), ("Ticket mínimo", "R$ 1.000,00"), ("Taxa", "1,90% a.m.")]
P.append(page(7, "Tipografia", f'''
<div class="cols">
  <div class="text">
    <p><strong>Inter</strong> é a única família da marca, em todos os pesos e tamanhos, da capa ao rodapé de uma tabela. Nenhuma segunda fonte para títulos.</p>
    <h2>Pesos</h2>
    <table class="kv"><tr><td>400</td><td>Texto corrido</td></tr><tr><td>500</td><td>Rótulos e navegação</td></tr><tr><td>600</td><td>Títulos e ações</td></tr><tr><td>700</td><td>Valores em destaque e o nome da marca</td></tr></table>
    <h2>Números</h2>
    <p>Valores monetários, taxas e datas usam <strong>algarismos tabulares</strong> (<code>tabular-nums</code>): cada dígito ocupa a mesma largura e as colunas alinham. Endereços, hashes e identificadores usam a monoespaçada do sistema.</p>
  </div>
  <div class="visual type">
    <div class="specimen">Aa</div>
    <div class="scale">
      <div style="font-size:30px;font-weight:600;letter-spacing:-.02em">Antecipe duplicatas em horas, não semanas.</div>
      <div style="font-size:20px;font-weight:600;letter-spacing:-.01em">Oferta DUP-2026-0141 em captação</div>
      <div style="font-size:14px">A Dupply transforma duplicatas aprovadas em ofertas de investimento. O cedente recebe antes do vencimento e o investidor financia um título analisado.</div>
      <div style="font-size:12px;color:{R['neutral'][600]}">Vence em 42 dias. Sacado com aceite confirmado.</div>
    </div>
    <div class="nums">
      <div><b>Tabular</b><table class="tab">{"".join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k, v in amounts)}</table></div>
      <div><b>Proporcional (evitar)</b><table class="prop">{"".join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k, v in amounts)}</table></div>
      <div><b>Monoespaçada</b><div class="mono">0x7f3a…9c2e<br>DUP-2026-0141<br>GDRX…K7QA</div></div>
    </div>
  </div>
</div>'''))

# 8 aplicação
def ui(dark):
    bg, card, fg, mut, bd = (INK950, INK900, R["neutral"][50], R["neutral"][400], INK800) if dark else (R["neutral"][50], "#fff", INK950, R["neutral"][600], R["neutral"][200])
    pr, prf = (PRIMARY_D, INK950) if dark else (PRIMARY_L, "#fff")
    def bdg(k, t):
        f, b = (R[k][300], R[k][900]) if dark else (R[k][700], R[k][100]); return f'<span class="badge" style="background:{b};color:{f}">{t}</span>'
    return f'''<div class="ui" style="background:{bg};color:{fg};border-color:{bd}">
<div class="row"><button style="background:{pr};color:{prf}">Investir agora</button><button style="border:1px solid {bd};color:{fg}">Ver detalhes</button><button style="background:{R['coral'][600] if not dark else R['coral'][500]};color:#fff">Recusar</button></div>
<div class="row">{bdg("emerald","Aprovado")}{bdg("amber","Pendente")}{bdg("coral","Recusado")}{bdg("blue","Em captação")}{bdg("violet","Laudo IA")}<span class="badge" style="background:{R['neutral'][800] if dark else R['neutral'][100]};color:{R['neutral'][300] if dark else R['neutral'][700]}">Liquidado</span></div>
<div class="cards"><div class="card" style="background:{card};border-color:{bd}"><small style="color:{mut}">Captado</small><b>R$ 184.250,00</b><span style="color:{R['emerald'][400] if dark else R['emerald'][700]}">+12,4% esta semana</span></div>
<div class="card" style="background:{card};border-color:{bd}"><small style="color:{mut}">Taxa mensal</small><b>1,90%</b><span style="color:{mut}">Vence em 42 dias</span></div>
<div class="card" style="background:{grad_a};color:#fff;border-color:transparent"><small style="color:#cfe6ff">Oferta em destaque</small><b>DUP-2026-0141</b><span style="color:#cfe6ff">gradiente só aqui</span></div></div>
</div>'''
P.append(page(8, "Aplicação na interface", f'''
<div class="cols">
  <div class="text">
    <p>Os mesmos tokens valem para o site, o app e qualquer material. Botão principal em azul de ação; estados em verde, âmbar e coral; o gradiente da marca aparece uma vez por tela, no máximo.</p>
    <p>Fundo claro é o padrão do produto. O escuro usa tinta azulada, não preto, para continuar na família da marca.</p>
    <h2>Regra de bolso</h2>
    <p>Se uma cor está fazendo dois papéis na mesma tela, está errado.</p>
  </div>
  <div class="visual stack">{ui(False)}{ui(True)}</div>
</div>'''))

# 9 voz
P.append(page(9, "Voz e vocabulário", f'''
<div class="cols">
  <div class="text">
    <p>A Dupply fala como alguém que entende de crédito e não precisa provar isso. Frases curtas, verbo na frente, sem jargão que não ajude a decidir.</p>
    <h2>Três princípios</h2>
    <table class="kv"><tr><td>Claro</td><td>Diga o que acontece e quando. "Você recebe em até 2 dias úteis", não "liquidação ágil".</td></tr><tr><td>Direto</td><td>Um botão diz o que faz: "Enviar duplicata", "Aceitar proposta", "Investir".</td></tr><tr><td>Confiável</td><td>Números com casas decimais, datas completas, status sem eufemismo. "Recusado" é recusado.</td></tr></table>
    <h2>Mensagens para validação</h2>
    <p class="caption">Candidatas a assinatura. Escolher uma e aposentar as outras.</p>
    <ul class="tag"><li>Liquidez instantânea para empresas modernas.</li><li>Transforme duplicatas em capital.</li><li>Antecipação de recebíveis, on-chain.</li></ul>
  </div>
  <div class="visual">
    <table class="vocab"><thead><tr><th>Use</th><th>Em vez de</th><th>Por quê</th></tr></thead><tbody>
    <tr><td>duplicata</td><td>título, recebível, nota</td><td>É o nome legal do instrumento e o que o cedente conhece</td></tr>
    <tr><td>cedente</td><td>empresa, cliente, vendedor</td><td>Papel na operação, não tipo de conta</td></tr>
    <tr><td>sacado</td><td>pagador, devedor, comprador</td><td>Idem; "devedor" soa pejorativo</td></tr>
    <tr><td>investidor</td><td>usuário, financiador</td><td>Quem aporta capital numa oferta</td></tr>
    <tr><td>oferta</td><td>deal, operação, produto</td><td>Uma duplicata aprovada aberta a aportes</td></tr>
    <tr><td>aporte</td><td>investimento, compra de cota</td><td>O ato de investir numa oferta</td></tr>
    <tr><td>antecipação</td><td>empréstimo, financiamento</td><td>Não é dívida: é venda do recebível</td></tr>
    <tr><td>deságio</td><td>taxa, desconto, juros</td><td>Termo do mercado para a diferença entre valor de face e valor pago</td></tr>
    <tr><td>laudo do agente de IA</td><td>análise automática, score</td><td>Deixa claro quem gerou e que é apoio, não decisão</td></tr>
    </tbody></table>
  </div>
</div>'''))

# 10 arquivos
files = [("dupply-logo.svg", "Marca horizontal em cor, nome em navy. Versão principal."),
         ("dupply-logo-on-dark.svg", "Marca horizontal em cor, nome em branco. Sobre navy e fundos escuros."),
         ("dupply-logo-mono-navy.svg", "Marca horizontal monocromática navy."),
         ("dupply-logo-mono-white.svg", "Marca horizontal monocromática branca."),
         ("dupply-mark.svg", "Símbolo em cor."),
         ("dupply-mark-mono.svg", "Símbolo com <code>currentColor</code>, para uso inline em React."),
         ("dupply-mark-mono-navy.svg, -white.svg, -black.svg", "Símbolo monocromático com cor fixa."),
         ("dupply-wordmark.svg", "Só o nome, em path (Inter Bold), <code>currentColor</code>."),
         ("favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png", "Ícones de app e aba."),
         ("og-image.png", "Imagem de compartilhamento, 1200 × 630.")]
P.append(page(10, "Arquivos e manutenção", f'''
<div class="cols">
  <div class="text">
    <p>Tudo que está neste manual é gerado a partir de duas fontes: os SVGs em <code>public/brand/</code> e os tokens em <code>src/index.css</code>. Mudou um token, regenere o manual; não edite o PDF.</p>
    <h2>Regenerar</h2>
    <pre>npm run brand:book</pre>
    <p class="caption">Script em <code>scripts/brand/</code>. Produz <code>public/brand/dupply-brand-book.pdf</code>.</p>
    <h2>Histórico</h2>
    <table class="kv"><tr><td>1.0</td><td>21 out 2026. Primeira versão. Substitui o manual gerado por IA que usava <code>#2F6BFF</code> e <code>#35E6A8</code>, cores que não existem no símbolo.</td></tr></table>
  </div>
  <div class="visual"><table class="vocab files"><thead><tr><th>Arquivo</th><th>Uso</th></tr></thead><tbody>{"".join(f'<tr><td><code>{a}</code></td><td>{b}</td></tr>' for a, b in files)}</tbody></table></div>
</div>'''))

CSS = f'''
@page {{ size: A4 landscape; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; background: #fff; }}
body {{ font-family: Inter, system-ui, sans-serif; font-size: 12.5px; line-height: 1.55; color: {INK950}; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-feature-settings: "cv11", "ss01"; }}
.page {{ width: 297mm; height: 210mm; padding: 16mm 18mm 14mm; position: relative; page-break-after: always; overflow: hidden; background: #fff; display: flex; flex-direction: column; }}
.page.dark {{ background: {NAVY}; color: #fff; }}
h1 {{ font-size: 26px; font-weight: 600; letter-spacing: -.02em; margin: 0 0 14px; line-height: 1.15; }}
h2 {{ font-size: 13px; font-weight: 600; margin: 16px 0 4px; }}
p {{ margin: 0 0 8px; max-width: 62ch; }}
code {{ font-family: ui-monospace, "JetBrains Mono", Menlo, monospace; font-size: .92em; background: {R['neutral'][100]}; padding: 0 .3em; border-radius: 3px; }}
.dark code {{ background: rgba(255,255,255,.1); }}
pre {{ font-family: ui-monospace, Menlo, monospace; font-size: 12px; background: {INK950}; color: #fff; padding: 10px 12px; border-radius: 6px; margin: 4px 0 6px; }}
.caption {{ font-size: 11px; color: {R['neutral'][600]}; }}
footer {{ position: absolute; left: 18mm; right: 18mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 10px; color: {R['neutral'][500]}; }}
.cols {{ display: grid; grid-template-columns: 1fr 1.7fr; gap: 14mm; flex: 1; min-height: 0; }}
.cols.wide {{ grid-template-columns: 1fr 1.9fr; }}
.visual {{ min-width: 0; display: flex; flex-direction: column; justify-content: center; }}
.visual.stack {{ gap: 10px; }}
svg {{ display: block; }}
/* capa */
.cover-page {{ padding: 0; }}
.cover {{ display: grid; grid-template-columns: 1.1fr 1fr; height: 100%; align-items: center; }}
.cover-mark {{ padding: 0 0 0 22mm; }} .cover-mark svg {{ width: 118mm; }}
.cover-text {{ padding-right: 22mm; }}
.cover h1 {{ font-size: 46px; margin: 0 0 6px; }}
.cover .lede {{ font-size: 22px; font-weight: 500; margin: 0 0 22px; color: #BFD9FF; }}
.cover .meta {{ font-size: 12px; color: #8FB3E6; }}
/* marca */
.mark-hero svg {{ width: 70mm; margin: 0 auto 12mm; }}
.exploded {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }}
.exploded figure {{ margin: 0; text-align: center; }} .exploded svg {{ width: 100%; max-width: 44mm; margin: 0 auto 6px; }}
figcaption {{ font-size: 11px; color: {R['neutral'][600]}; }}
/* versões */
.grid2 {{ display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 8px; }}
.tile {{ border-radius: 8px; padding: 14px 18px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 10px; position: relative; border: 1px solid {R['neutral'][200]}; }}
.tile svg {{ width: 62mm; }} .tile.small svg {{ width: 18mm; display: inline-block; margin-right: 10px; }}
.tile.navy {{ background: {NAVY}; border-color: {NAVY}; }} .tile.navy span {{ color: #8FB3E6; }}
.tile span {{ font-size: 10.5px; color: {R['neutral'][600]}; position: absolute; left: 18px; bottom: 10px; }}
.tile.small {{ flex-direction: row; align-items: center; }}
/* proteção */
.clear {{ width: 100%; margin-top: 12px; }}
.donts {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-content: center; }}
.donts figure {{ margin: 0; text-align: center; }}
.dont {{ height: 40mm; border: 1px solid {R['neutral'][200]}; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 6px; }}
.dont svg {{ width: 24mm; }} .dont > div {{ display: inline-block; }}
.busy {{ background: linear-gradient(120deg, #ff7a59, #ffd166, #06d6a0, #118ab2); padding: 12px; border-radius: 6px; }}
.fakeword {{ font-family: Georgia, serif; font-style: italic; font-size: 26px; color: {NAVY}; }}
.donts figcaption::before {{ content: "✕ "; color: {R['coral'][600]}; }}
table.kv {{ border-collapse: collapse; font-size: 11.5px; margin: 2px 0 6px; }} table.kv td {{ padding: 3px 10px 3px 0; vertical-align: top; }} table.kv td:first-child {{ font-weight: 600; white-space: nowrap; }}
/* cores */
.brand-sw {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }}
.sw {{ border-radius: 8px; padding: 10px 12px; min-height: 22mm; display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; }}
.sw.big {{ min-height: 34mm; }} .sw b {{ font-size: 12px; }} .sw span {{ font-size: 11px; font-weight: 500; }} .sw small {{ font-size: 9.5px; opacity: .85; line-height: 1.35; }}
.grads {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }}
.grads div {{ border-radius: 8px; padding: 10px 12px; min-height: 18mm; color: #fff; display: flex; flex-direction: column; justify-content: flex-end; }} .grads b {{ font-size: 12px; }} .grads span {{ font-size: 10px; opacity: .9; }}
.ratio {{ display: flex; height: 10px; border-radius: 5px; overflow: hidden; margin: 6px 0; }} .ratio i {{ display: block; }}
/* funcional */
table.sem {{ border-collapse: collapse; width: 100%; font-size: 11px; }} table.sem th {{ text-align: left; font-weight: 600; padding: 4px 8px; border-bottom: 1px solid {R['neutral'][300]}; }}
table.sem td {{ padding: 6px 8px; border-bottom: 1px solid {R['neutral'][200]}; vertical-align: middle; }} table.sem small {{ display: block; font-size: 9px; color: {R['neutral'][600]}; margin-top: 3px; }}
.pair {{ display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 6px; font-weight: 600; }} .pair em {{ font-style: normal; font-weight: 500; font-size: 10px; opacity: .9; font-variant-numeric: tabular-nums; }}
.ramp {{ display: grid; grid-template-columns: 52px repeat(11, 1fr); gap: 2px; align-items: center; margin: 2px 0; }} .ramp b {{ font-size: 9.5px; font-weight: 500; }} .ramp i {{ display: block; height: 10px; border-radius: 2px; }}
/* tipografia */
.type {{ gap: 10mm; }} .specimen {{ font-size: 96px; font-weight: 600; letter-spacing: -.04em; line-height: 1; }}
.scale {{ display: flex; flex-direction: column; gap: 8px; }}
.nums {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; font-size: 11.5px; }} .nums b {{ display: block; font-weight: 600; margin-bottom: 4px; }}
.nums table {{ border-collapse: collapse; }} .nums td {{ padding: 2px 10px 2px 0; }} .nums td:last-child {{ text-align: right; }}
table.tab td:last-child {{ font-variant-numeric: tabular-nums; }} table.prop td:last-child {{ font-variant-numeric: proportional-nums; }}
.mono {{ font-family: ui-monospace, Menlo, monospace; font-size: 11px; line-height: 1.6; }}
/* ui */
.ui {{ border: 1px solid; border-radius: 10px; padding: 12px; }}
.row {{ display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }}
.ui button {{ font: 600 11px Inter; border: 0; border-radius: 6px; padding: 7px 11px; background: transparent; }}
.badge {{ font: 600 10px Inter; padding: 2px 8px; border-radius: 999px; }}
.cards {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }}
.card {{ border: 1px solid; border-radius: 8px; padding: 9px 10px; display: flex; flex-direction: column; gap: 1px; }} .card small {{ font-size: 9.5px; font-weight: 500; }} .card b {{ font-size: 17px; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }} .card span {{ font-size: 10px; }}
/* voz */
table.vocab {{ border-collapse: collapse; width: 100%; font-size: 11px; }} table.vocab th {{ text-align: left; font-weight: 600; padding: 5px 8px; border-bottom: 1px solid {R['neutral'][300]}; }}
table.vocab td {{ padding: 6px 8px; border-bottom: 1px solid {R['neutral'][200]}; vertical-align: top; }} table.vocab td:first-child {{ font-weight: 600; white-space: nowrap; }}
table.vocab td:nth-child(2) {{ color: {R['neutral'][600]}; }}
table.files td:first-child {{ white-space: normal; font-weight: 400; }}
ul.tag {{ margin: 0; padding-left: 18px; }} ul.tag li {{ margin-bottom: 3px; }}
'''
html = f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Dupply, manual de marca</title><style>{CSS}</style></head><body>{"".join(P)}</body></html>'
(OUT / "brand-book.html").write_text(html)
print("ok", len(html), "bytes,", len(P), "páginas")
