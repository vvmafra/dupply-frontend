import numpy as np, cv2, math, json
exec(open('vec.py').read().split('# ---- fit linear gradient')[0].replace('print(','(lambda *a,**k:None)('))
a_o=cv2.morphologyEx((a>128).astype(np.uint8)*255,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
a_s=cv2.GaussianBlur(a_o.astype(np.float32),(0,0),1.6)
bowl=(lab==1)&(a_s>128); core=(lab==1)&(a>250)
ys,xs=np.nonzero(bowl); x0,y0=xs.min(),ys.min()
light=(core&(L>0.60)).astype(np.uint8); n2,l2,_,_=cv2.connectedComponentsWithStats(light,connectivity=4)
bar_core=(l2==l2[y0+60,x0+40])
bar=(cv2.dilate(bar_core.astype(np.uint8),np.ones((5,5),np.uint8))>0)&bowl
arc_fit=core&~bar_core
slash=(lab==2)&(a_s>128); slash_core=(lab==2)&(a>250)

def fit(sel,stops=(2,25,50,75,98)):
    ys,xs=np.nonzero(sel); best=None
    for th in range(0,360,5):
        t=math.radians(th); p=xs*math.cos(t)+ys*math.sin(t); Xm=np.c_[np.ones_like(p),p]; res=0
        for ch in (L[sel],A[sel],B[sel]):
            _,r,_,_=np.linalg.lstsq(Xm,ch,rcond=None); res+=(r[0] if len(r) else 0)
        if best is None or res<best[0]: best=(res,th)
    th=best[1]; t=math.radians(th); p=xs*math.cos(t)+ys*math.sin(t); lo,hi=np.percentile(p,stops[0]),np.percentile(p,stops[-1])
    def col(q):
        mm=np.abs(p-q)<(hi-lo)*0.04; cc=np.median(rgb[sel][mm],axis=0); return '#%02x%02x%02x'%tuple(int(round(v)) for v in cc)
    cx,cy=xs.mean(),ys.mean(); pc=cx*math.cos(t)+cy*math.sin(t)
    st=[]
    for s in stops:
        q=np.percentile(p,s); st.append(((q-lo)/(hi-lo), col(q)))
    return dict(theta=th,x1=cx+(lo-pc)*math.cos(t),y1=cy+(lo-pc)*math.sin(t),x2=cx+(hi-pc)*math.cos(t),y2=cy+(hi-pc)*math.sin(t),stops=st)
G={"bar":fit(bar_core),"arc":fit(arc_fit),"slash":fit(slash_core)}
for k,g in G.items(): print(k,"ang %d°"%g['theta']," ".join(f"{o:.2f}:{c}" for o,c in g['stops']))

allm=bowl|slash; ys,xs=np.nonzero(allm); X0,Y0,X1,Y1=xs.min(),ys.min(),xs.max()+1,ys.max()+1; W,H_=X1-X0,Y1-Y0
def path_of(mask,eps=1.1):
    cs,_=cv2.findContours(mask.astype(np.uint8),cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE); d=[]
    for c in cs:
        if cv2.contourArea(c)<30: continue
        c=cv2.approxPolyDP(c,eps,True)[:,0,:].astype(float)
        d.append("M"+" L".join(f"{round(x-X0,1)} {round(y-Y0,1)}" for x,y in c)+"Z")
    return "".join(d)
P={"bowl":path_of(bowl),"bar":path_of(bar),"slash":path_of(slash)}
def grad(id,g):
    stops="".join(f'<stop offset="{o:.3f}" stop-color="{c}"/>' for o,c in g['stops'])
    return f'<linearGradient id="{id}" gradientUnits="userSpaceOnUse" x1="{g["x1"]-X0:.1f}" y1="{g["y1"]-Y0:.1f}" x2="{g["x2"]-X0:.1f}" y2="{g["y2"]-Y0:.1f}">{stops}</linearGradient>'
head=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H_}" role="img" aria-label="Dupply">'
color=f'{head}<defs>{grad("dg-arc",G["arc"])}{grad("dg-bar",G["bar"])}{grad("dg-slash",G["slash"])}</defs><path d="{P["bowl"]}" fill="url(#dg-arc)"/><path d="{P["bar"]}" fill="url(#dg-bar)"/><path d="{P["slash"]}" fill="url(#dg-slash)"/></svg>'
open('dupply-mark.svg','w').write(color)
for name,fill in (("mono","currentColor"),("mono-navy","#0B1F3B"),("mono-white","#FFFFFF"),("mono-black","#000000")):
    open(f'dupply-mark-{name}.svg','w').write(f'{head}<path d="{P["bowl"]}{P["slash"]}" fill="{fill}"/></svg>')
json.dump({"viewBox":[int(W),int(H_)],"grad":{k:{"theta":int(g["theta"]),"stops":[(float(o),c) for o,c in g["stops"]]} for k,g in G.items()}},open('mark-meta.json','w'),indent=1)
print("viewBox",W,H_,"bytes",len(color))
