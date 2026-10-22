"""Gera ramps.json (escalas 50-950 em OKLCH a partir das cores do logo). Uso: python3 scripts/brand/palette.py"""
import math, json

# ---- sRGB <-> OKLCH ----
def srgb_to_linear(c):
    c/=255
    return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def linear_to_srgb(c):
    c = max(0,min(1,c))
    return 12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
def hex_to_oklch(h):
    r,g,b=[srgb_to_linear(int(h[i:i+2],16)) for i in (1,3,5)]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b
    m=0.2119034982*r+0.6806995451*g+0.1073969566*b
    s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l_,m_,s_=l**(1/3),m**(1/3),s**(1/3)
    L=0.2104542553*l_+0.7936177850*m_-0.0040720468*s_
    a=1.9779984951*l_-2.4285922050*m_+0.4505937099*s_
    b2=0.0259040371*l_+0.7827717662*m_-0.8086757660*s_
    C=math.hypot(a,b2); H=math.degrees(math.atan2(b2,a))%360
    return L,C,H
def oklch_to_hex(L,C,H):
    a=C*math.cos(math.radians(H)); b=C*math.sin(math.radians(H))
    l_=L+0.3963377774*a+0.2158037573*b
    m_=L-0.1055613458*a-0.0638541728*b
    s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r=+4.0767416621*l-3.3077115913*m+0.2309699292*s
    g=-1.2684380046*l+2.6097574011*m-0.3413193965*s
    b=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return '#%02x%02x%02x'%tuple(round(linear_to_srgb(x)*255) for x in (r,g,b))
def in_gamut(L,C,H):
    a=C*math.cos(math.radians(H)); b=C*math.sin(math.radians(H))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r=+4.0767416621*l-3.3077115913*m+0.2309699292*s; g=-1.2684380046*l+2.6097574011*m-0.3413193965*s; b=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return all(-0.003<=x<=1.003 for x in (r,g,b))
def clamp_c(L,C,H):
    while C>0 and not in_gamut(L,C,H): C-=0.002
    return max(C,0)

print("== Logo em OKLCH ==")
for name,h in [("blue-light","#0192fe"),("blue-mid","#0d8efd"),("blue-deep","#064dcd"),("blue-deep2","#0a61f6"),("cyan","#0fcbf4"),("teal","#26d4df"),("mint","#52edba"),("navy-atual","#0b1f3b"),("brand-blue-atual","#2f6bff")]:
    L,C,H=hex_to_oklch(h); print(f"{name:18s} {h}  oklch({L:.3f} {C:.3f} {H:.1f})")

# ---- ramps ----
STEPS=[50,100,200,300,400,500,600,700,800,900,950]
L_CURVE={50:0.975,100:0.94,200:0.885,300:0.80,400:0.71,500:0.62,600:0.54,700:0.46,800:0.39,900:0.31,950:0.23}
def ramp(hue,peakC,key=None):
    out={}
    for s in STEPS:
        L=L_CURVE[s]
        # chroma bell: low at extremes
        t=abs(L-0.62)/0.4
        C=peakC*max(0.12,1-t**1.4)
        C=clamp_c(L,C,hue)
        out[s]=oklch_to_hex(L,C,hue)
    return out

hues={
 "blue":   (hex_to_oklch("#0192fe")[2], 0.21),   # primary (logo)
 "cyan":   (hex_to_oklch("#0fcbf4")[2], 0.15),   # brand accent
 "mint":   (hex_to_oklch("#52edba")[2], 0.15),   # brand accent
 "violet": (285, 0.19),                         # IA / análise
 "emerald":(152, 0.17),                         # success
 "amber":  (80, 0.17),                          # warning / pendente
 "coral":  (25, 0.20),                          # danger
 "neutral":(hex_to_oklch("#0192fe")[2], 0.016), # cinza frio na matiz da marca
}
ramps={k:ramp(h,c) for k,(h,c) in hues.items()}
import os
json.dump({"hues":{k:v[0] for k,v in hues.items()},"ramps":ramps},open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"ramps.json"),"w"),indent=1)
for k,r in ramps.items():
    print(k, "h=%.0f"%hues[k][0], " ".join(f"{s}:{r[s]}" for s in (100,300,500,700,900)))
