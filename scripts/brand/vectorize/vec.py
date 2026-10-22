import numpy as np, cv2, math, json
from PIL import Image
im=np.array(Image.open('source/dupply-mark-1254.png').convert('RGBA')).astype(np.float64)
a=im[...,3]; rgb=im[...,:3]
mask=(a>128).astype(np.uint8)
n,lab,stats,cent=cv2.connectedComponentsWithStats(mask,connectivity=8)
print("componentes:",n-1)
for i in range(1,n): print(i, "area",stats[i,cv2.CC_STAT_AREA],"bbox",stats[i,:4])

# ---- oklch per pixel (vectorized) ----
def srgb2lin(c):
    c=c/255.0; return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def rgb2oklab(rgb):
    r,g,b=[srgb2lin(rgb[...,i]) for i in range(3)]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b
    m=0.2119034982*r+0.6806995451*g+0.1073969566*b
    s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l_,m_,s_=np.cbrt(l),np.cbrt(m),np.cbrt(s)
    L=0.2104542553*l_+0.7936177850*m_-0.0040720468*s_
    A=1.9779984951*l_-2.4285922050*m_+0.4505937099*s_
    B=0.0259040371*l_+0.7827717662*m_-0.8086757660*s_
    return L,A,B
L,A,B=rgb2oklab(rgb)
H=(np.degrees(np.arctan2(B,A))%360)
for i in range(1,n):
    sel=(lab==i)&(a>250)
    print(i,"hue mediana %.0f"%np.median(H[sel]), "L %.2f..%.2f"%(np.percentile(L[sel],2),np.percentile(L[sel],98)))

# ---- fit linear gradient direction per component ----
def fit(sel):
    ys,xs=np.nonzero(sel); best=None
    for th in range(0,360,5):
        t=math.radians(th); p=xs*math.cos(t)+ys*math.sin(t)
        X=np.c_[np.ones_like(p),p]
        res=0
        for ch in (L[sel],A[sel],B[sel]):
            coef,r,_,_=np.linalg.lstsq(X,ch,rcond=None); res+= (r[0] if len(r) else 0)
        if best is None or res<best[0]: best=(res,th)
    th=best[1]; t=math.radians(th); p=xs*math.cos(t)+ys*math.sin(t)
    lo,hi=np.percentile(p,1),np.percentile(p,99)
    def color_at(q):
        m=np.abs(p-q)<(hi-lo)*0.03
        c=rgb[sel][m].mean(axis=0); return '#%02x%02x%02x'%tuple(int(round(v)) for v in c)
    # endpoints in image coords (projection extremes along direction)
    tot=np.var(L[sel])+np.var(A[sel])+np.var(B[sel]); 
    return th,(lo,hi),color_at(lo),color_at(hi),best[0]/(len(xs)*tot+1e-9)
out={}
for i in range(1,n):
    sel=(lab==i)&(a>250)
    th,(lo,hi),c0,c1,rel=fit(sel)
    print(i,"gradiente: angulo %d°, %s -> %s, residuo relativo %.2f"%(th,c0,c1,rel))
    out[i]=dict(theta=th,lo=float(lo),hi=float(hi),c0=c0,c1=c1)
json.dump(out,open('grad.json','w'))
