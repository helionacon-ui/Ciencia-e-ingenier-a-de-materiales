/* Figuras interactivas de Ciencia e Ingeniería de Materiales. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Ciencia e Ingeniería de Materiales: figuras interactivas ---- */
const Box=(a,x,y,w,h,lab,col)=>{a.g.fillStyle=C.bg;a.g.fillRect(x,y,w,h);a.g.strokeStyle=col||C.text;a.g.lineWidth=2;a.g.strokeRect(x,y,w,h);
  if(lab)a.txt(lab,x+w/2,y+h/2+4,col||C.text,12,'center');};
const Barra=(a,x,y,w,h,frac,col)=>{a.g.fillStyle=C.grid;a.g.fillRect(x,y,w,h);a.g.fillStyle=col;a.g.fillRect(x,y,w*Math.max(0,Math.min(1,frac)),h);
  a.g.strokeStyle=C.muted;a.g.lineWidth=1;a.g.strokeRect(x,y,w,h);};
const erf=z=>{const t=1/(1+0.3275911*Math.abs(z));const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-z*z);return z>=0?y:-y;};

/* T1 · Mapa de materiales: módulo frente a densidad */
SIMS.ashby=el=>build(el,{w:660,h:400,
 selects:[{k:'m',v:'acero',l:'material',opts:[['acero','acero al carbono'],['al','aluminio 2024'],['ti','titanio Ti-6Al-4V'],['mg','magnesio'],['cu','cobre'],['alumina','alúmina (cerámico)'],['vidrio','vidrio'],['pc','policarbonato'],['pe','polietileno BD'],['cfrp','epoxi-carbono']]},
  {k:'idx',v:'E/rho',l:'índice',opts:[['E/rho','rigidez específica E/ρ (tracción)'],['E12','viga a flexión √E/ρ'],['E13','panel / pandeo ∛E/ρ']]}],
 draw(a){a.clear();
  const M={acero:[7.85,207,500,'Fe',C.a],al:[2.78,73,470,'Al',C.f],ti:[4.43,114,950,'Ti',C.c],mg:[1.74,45,250,'Mg',C.d],cu:[8.93,120,300,'Cu',C.b],
   alumina:[3.90,390,350,'Al₂O₃',C.e],vidrio:[2.50,70,100,'vidrio',C.muted],pc:[1.20,2.4,65,'PC',C.c],pe:[0.92,0.3,12,'PE',C.d],cfrp:[1.60,135,1500,'CFRP',C.f]};
  const x0=70,y0=330,wv=520,hv=270;
  // ejes log-log: rho 0.5-12 (lineal), E 0.1-500 (log)
  const px=r=>x0+(Math.log10(r)-Math.log10(0.5))/(Math.log10(12)-Math.log10(0.5))*wv;
  const py=E=>y0-(Math.log10(E)-Math.log10(0.1))/(Math.log10(500)-Math.log10(0.1))*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  [0.5,1,2,5,10].forEach(r=>{a.line(px(r),y0,px(r),y0-hv,C.grid,1);a.txt(F(r),px(r),y0+16,C.muted,11,'center');});
  [0.1,1,10,100].forEach(E=>{a.line(x0,py(E),x0+wv,py(E),C.grid,1);a.txt(String(E),x0-8,py(E)+4,C.muted,11,'right');});
  a.txt('densidad ρ (g/cm³)',x0+wv/2,y0+34,C.muted,12,'center');
  a.txt('módulo E (GPa)',x0-52,y0-hv-10,C.muted,12);
  const sel=a.st.m, idx=a.st.idx;
  // rectas de iso-índice que pasan por el material elegido
  const d=M[sel];
  const ex=idx==='E/rho'?1:(idx==='E12'?2:3);
  const k=d[1]/Math.pow(d[0],ex);
  a.g.setLineDash([5,4]);a.g.strokeStyle=C.a;a.g.lineWidth=1.8;a.g.beginPath();
  for(let r=0.5;r<=12;r*=1.05){const E=k*Math.pow(r,ex);if(E>0.09&&E<520){const X=px(r),Y=py(E);if(r<=0.53)a.g.moveTo(X,Y);else a.g.lineTo(X,Y);}}
  a.g.stroke();a.g.setLineDash([]);
  Object.keys(M).forEach(key=>{const m=M[key];const X=px(m[0]),Y=py(m[1]);
    a.circ(X,Y,key===sel?8:5,m[4],true);a.txt(m[3],X+10,Y+4,key===sel?C.text:C.muted,key===sel?13:11);});
  const val=d[1]/Math.pow(d[0],ex);
  const nom=idx==='E/rho'?'E/ρ':(idx==='E12'?'√E/ρ':'∛E/ρ');
  const rank=Object.keys(M).map(k2=>[M[k2][3],M[k2][1]/Math.pow(M[k2][0],ex)]).sort((p,q)=>q[1]-p[1]);
  a.html(`<b>${d[3]}</b>: ρ = ${F(d[0])} g/cm³, E = ${F(d[1])} GPa, R<sub>m</sub> ≈ ${F(d[2])} MPa.<br>
  Índice <b>${nom} = ${F(val)}</b>. La recta discontinua une todos los materiales que rinden igual con este criterio: lo que está <b>arriba y a la izquierda</b> de ella es mejor.<br>
  Ranking con este índice: ${rank.slice(0,4).map(r=>r[0]+' ('+F(r[1])+')').join(' · ')}…<br>
  <span class="hint">Para tracción manda E/ρ (acero, Al y Ti empatan casi); para una viga a flexión manda √E/ρ y para un panel ∛E/ρ: ahí ganan los ligeros y los compuestos.</span>`);}});

/* T2 · Celdilla cristalina */
SIMS.cristal=el=>build(el,{w:660,h:400,
 selects:[{k:'c',v:'FCC',l:'celdilla',opts:[['SC','cúbica simple'],['BCC','BCC (centrada en el cuerpo)'],['FCC','FCC (centrada en las caras)'],['HCP','HCP (hexagonal compacta)']]},
  {k:'m',v:'Fe',l:'metal',opts:[['Fe','hierro (A = 55,85 · R = 0,124 nm)'],['Al','aluminio (26,98 · 0,143)'],['Cu','cobre (63,55 · 0,128)'],['W','wolframio (183,8 · 0,137)'],['Mg','magnesio (24,31 · 0,160)'],['Ir','iridio (192,2 · 0,1385)']]}],
 draw(a){a.clear();const c=a.st.c;
  const MET={Fe:[55.85,0.124,7.87],Al:[26.98,0.143,2.70],Cu:[63.55,0.128,8.96],W:[183.8,0.137,19.3],Mg:[24.31,0.160,1.74],Ir:[192.2,0.1385,22.4]};
  const m=MET[a.st.m],A=m[0],R=m[1];
  let n,apf,rel,coord,a0;
  if(c==='SC'){n=1;a0=2*R;apf=Math.PI/6;rel='a = 2R';coord=6;}
  else if(c==='BCC'){n=2;a0=4*R/Math.sqrt(3);apf=Math.PI*Math.sqrt(3)/8;rel='a = 4R/√3';coord=8;}
  else if(c==='FCC'){n=4;a0=4*R/Math.sqrt(2);apf=Math.PI/(3*Math.sqrt(2));rel='a = 4R/√2 = 2R√2';coord=12;}
  else{n=6;a0=2*R;apf=Math.PI/(3*Math.sqrt(2));rel='a = 2R, c = 1,633·a';coord=12;}
  const Vc=(c==='HCP')?(3*Math.sqrt(3)/2*a0*a0*(1.633*a0)):Math.pow(a0,3); // nm³
  const rho=n*A/(Vc*1e-21*6.022e23);
  // dibujo
  const cx=210,cy=200,s=120,o=52;
  const P=(i,j,k)=>[cx-s/2+i*s+k*o*0.6, cy+s/2-j*s-k*o*0.5];
  const edge=(p,q)=>a.line(p[0],p[1],q[0],q[1],C.grid,1.6);
  if(c!=='HCP'){
    const V=[];for(let k=0;k<2;k++)for(let j=0;j<2;j++)for(let i=0;i<2;i++)V.push(P(i,j,k));
    [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(e=>edge(V[e[0]],V[e[1]]));
    const rr=Math.min(19,s*R/a0*1.6);
    V.forEach(p=>{a.circ(p[0],p[1],rr,C.a,true);a.circ(p[0],p[1],rr,C.text,false);});
    if(c==='BCC'){const p=P(0.5,0.5,0.5);a.circ(p[0],p[1],rr,C.f,true);a.circ(p[0],p[1],rr,C.text,false);a.txt('● centro del cuerpo',cx-s/2-30,cy+s/2+46,C.f,11);}
    if(c==='FCC'){[[0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5]].forEach(q=>{const p=P(q[0],q[1],q[2]);a.circ(p[0],p[1],rr,C.c,true);a.circ(p[0],p[1],rr,C.text,false);});
      a.txt('● centros de cara',cx-s/2-30,cy+s/2+46,C.c,11);}
  } else {
    const hx=(ang,r,yy)=>[cx+r*Math.cos(ang)+0, cy+yy+r*Math.sin(ang)*0.45];
    [[-60,C.a],[60,C.a]].forEach(([yy,col])=>{for(let i=0;i<6;i++){const p=hx(i*Math.PI/3,70,yy),q=hx((i+1)*Math.PI/3,70,yy);edge(p,q);a.circ(p[0],p[1],16,col,true);a.circ(p[0],p[1],16,C.text,false);}
      const ctr=hx(0,0,yy);a.circ(ctr[0],ctr[1],16,col,true);a.circ(ctr[0],ctr[1],16,C.text,false);});
    for(let i=0;i<6;i+=2){const p=hx(i*Math.PI/3,70,-60),q=hx(i*Math.PI/3,70,60);edge(p,q);}
    [1,3,5].forEach(i=>{const p=hx(i*Math.PI/3-Math.PI/6,40,0);a.circ(p[0],p[1],16,C.c,true);a.circ(p[0],p[1],16,C.text,false);});
    a.txt('plano intermedio (3 átomos)',cx+60,cy+6,C.c,11);
  }
  a.txt(c,cx,cy-150,C.a,18,'center');
  // barras comparativas de APF
  const bx=410;a.txt('Factor de empaquetamiento',bx,70,C.text,13);
  [['SC',0.524],['BCC',0.680],['FCC',0.740],['HCP',0.740]].forEach((d2,i)=>{
    Barra(a,bx,84+i*30,140,18,d2[1],d2[0]===c?C.a:C.grid);
    a.txt(d2[0]+' '+F(d2[1]*100)+' %',bx+146,98+i*30,d2[0]===c?C.a:C.muted,12);});
  a.txt('Átomos por celdilla: '+n,bx,232,C.text,13);
  a.txt('Índice de coordinación: '+coord,bx,254,C.text,13);
  a.txt(rel,bx,276,C.f,13);
  a.html(`<b>${a.st.m} en ${c}</b>: ${rel} ⇒ a = ${a0.toFixed(4).replace('.',',')} nm (${(a0*1e-7).toExponential(3).replace('.',',')} cm).<br>
  V<sub>c</sub> = ${(Vc).toFixed(5).replace('.',',')} nm³ · n = ${n} átomos · APF = <b>${F(apf*100)} %</b>.<br>
  ρ = n·A/(V<sub>c</sub>·N<sub>A</sub>) = <b>${F(rho)} g/cm³</b>, frente a ${F(m[2])} g/cm³ tabulados ⇒ error ${F(Math.abs(rho-m[2])/m[2]*100)} %.<br>
  <span class="hint">${Math.abs(rho-m[2])/m[2]<0.06?'Coincide: esta es la estructura real del metal.':'No coincide: prueba otra celdilla — así se identifica la estructura en los problemas 12 a 15.'}</span>`);}});

/* T3 · Hall-Petch y tamaño de grano ASTM */
SIMS.granos=el=>build(el,{w:660,h:400,
 sliders:[{k:'d',v:20,min:2,max:120,step:1,l:'tamaño de grano d',u:'µm'},{k:'k',v:377,min:100,max:700,step:1,l:'constante k',u:'MPa·µm^½'},{k:'s0',v:27,min:0,max:200,step:1,l:'σ₀',u:'MPa'}],
 draw(a){a.clear();const d=a.st.d,k=a.st.k,s0=a.st.s0;
  const sy=s0+k/Math.sqrt(d);
  const Nast=Math.pow(645.16/ (d*d) ,1)*1; // granos/mm2 aprox -> usamos relacion ASTM
  const gmm2=1e6/(d*d); // granos por mm2
  const Npulg=gmm2*645.16/ (100*100) *10000/10000; // granos por pulgada2 a 100x
  const nA=1+Math.log(Math.max(Npulg,1e-6))/Math.LN2;
  // microestructura (granos dibujados como celdas de Voronoi aproximadas)
  const gx=40,gy=70,gw=260,gh=250;
  a.g.save();a.g.beginPath();a.g.rect(gx,gy,gw,gh);a.g.clip();
  a.g.fillStyle=C.bg;a.g.fillRect(gx,gy,gw,gh);
  const px2=Math.max(10,Math.min(90,gw*d/220));
  let seed=Math.round(d*13)%101;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
  const pts=[];
  for(let y=gy-px2;y<gy+gh+px2;y+=px2)for(let x=gx-px2;x<gx+gw+px2;x+=px2)pts.push([x+(rnd()-0.5)*px2*0.55,y+(rnd()-0.5)*px2*0.55]);
  const step=2, th=Math.max(1.6,px2*0.07);
  for(let y=gy;y<gy+gh;y+=step)for(let x=gx;x<gx+gw;x+=step){
    let b1=1e9,b2=1e9;
    for(let i2=0;i2<pts.length;i2++){const dx=pts[i2][0]-x,dy=pts[i2][1]-y,dd=dx*dx+dy*dy;
      if(dd<b1){b2=b1;b1=dd;}else if(dd<b2)b2=dd;}
    const borde=(Math.sqrt(b2)-Math.sqrt(b1))<th;
    a.g.fillStyle=borde?C.text:C.grid;a.g.fillRect(x,y,step,step);}
  a.g.restore();
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.5;a.g.strokeRect(gx,gy,gw,gh);
  a.txt('microestructura: granos y bordes (en oscuro)',gx,gy-12,C.muted,11);
  a.txt(F(d)+' µm',gx+gw-4,gy+gh+18,C.muted,11,'right');
  // curva Hall-Petch
  const x0=360,y0=320,wv=260,hv=240;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  a.txt('d^(−1/2) (µm^−½)',x0+wv/2,y0+30,C.muted,11,'center');
  a.txt('σy (MPa)',x0-6,y0-hv-8,C.muted,11);
  const xm=0.75,ym=s0+k*xm;
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  a.g.moveTo(x0,y0-s0/ym*hv);a.g.lineTo(x0+wv,y0-hv);a.g.stroke();
  const xq=1/Math.sqrt(d);
  const X=x0+xq/xm*wv,Y=y0-sy/ym*hv;
  a.line(x0,Y,X,Y,C.f,1.2,[4,3]);a.line(X,y0,X,Y,C.f,1.2,[4,3]);
  a.circ(X,Y,6,C.f,true);
  a.txt(F(sy)+' MPa',X-6,Y-12,C.f,12,'right');
  [100,25,10,4].forEach(dd=>{const xx=x0+(1/Math.sqrt(dd))/xm*wv;if(xx<=x0+wv){a.txt(dd+' µm',xx,y0+15,C.muted,10,'center');a.line(xx,y0,xx,y0-5,C.muted,1.2);}});
  a.html(`d = <b>${F(d)} µm</b> ⇒ d<sup>−1/2</sup> = ${F(xq)} µm<sup>−½</sup> ⇒ <b>σy = σ₀ + k·d<sup>−1/2</sup> = ${F(s0)} + ${F(k)}·${F(xq)} = ${F(sy)} MPa</b>.<br>
  Tamaño <b>ASTM ≈ n = ${F(nA)}</b> (${F(Npulg)} granos por pulgada² a 100×, es decir ${F(gmm2)} granos/mm²), según N = 2<sup>n−1</sup>.<br>
  Bajando el grano de 100 a 10 µm, σy pasa de ${F(s0+k/10)} a ${F(s0+k/Math.sqrt(10))} MPa: <b>+${F((s0+k/Math.sqrt(10))-(s0+k/10))} MPa</b> sin tocar la composición.<br>
  <span class="hint">El afino de grano es el único mecanismo que sube la resistencia SIN perder tenacidad: más bordes de grano = más obstáculos para las dislocaciones.</span>`);}});

/* T4 · Difusión: perfil con la función error */
SIMS.difusion=el=>build(el,{w:660,h:400,
 sliders:[{k:'T',v:950,min:700,max:1100,step:10,l:'temperatura',u:'°C'},{k:'t',v:4,min:0.5,max:24,step:0.5,l:'tiempo',u:'h'},{k:'cs',v:1.2,min:0.5,max:1.4,step:0.05,l:'C superficie',u:'%C'},{k:'c0',v:0.25,min:0.05,max:0.6,step:0.05,l:'C inicial',u:'%C'}],
 draw(a){a.clear();const T=a.st.T+273.15,t=a.st.t*3600,cs=a.st.cs,c0=a.st.c0;
  const D0=2.3e-5,Q=148000; // C en Fe-gamma
  const D=D0*Math.exp(-Q/(8.314*T));
  const x0=70,y0=320,wv=540,hv=250;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  const XM=2.0; // mm
  const px=x=>x0+x/XM*wv, py=c=>y0-(c-0)/1.5*hv;
  [0,0.5,1,1.5,2].forEach(x=>{a.line(px(x),y0,px(x),y0-hv,C.grid,1);a.txt(F(x),px(x),y0+16,C.muted,11,'center');});
  [0,0.5,1,1.5].forEach(c=>{a.line(x0,py(c),x0+wv,py(c),C.grid,1);a.txt(F(c),x0-8,py(c)+4,C.muted,11,'right');});
  a.txt('profundidad x (mm)',x0+wv/2,y0+34,C.muted,12,'center');
  a.txt('%C',x0-46,y0-hv-10,C.muted,12);
  a.line(x0,py(c0),x0+wv,py(c0),C.muted,1.2,[5,4]);
  a.txt('C₀ = '+F(c0)+' %',x0+wv-4,py(c0)-6,C.muted,11,'right');
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;a.g.beginPath();
  for(let i=0;i<=200;i++){const x=XM*i/200,z=(x*1e-3)/(2*Math.sqrt(D*t));const c=cs-(cs-c0)*erf(z);
    if(i===0)a.g.moveTo(px(x),py(c));else a.g.lineTo(px(x),py(c));}
  a.g.stroke();
  // profundidad a 0,8 %C y a 0,4 %C
  const prof=cx=>{const r=(cx-c0)/(cs-c0);if(r<=0||r>=1)return NaN;
    let lo=0,hi=5;for(let i=0;i<60;i++){const mid=(lo+hi)/2;(1-erf(mid))<r?hi=mid:lo=mid;}
    return 2*(lo+hi)/2*Math.sqrt(D*t)*1000;};
  [[0.8,C.f],[0.4,C.c]].forEach(([cv,col])=>{const xp=prof(cv);
    if(isFinite(xp)&&xp<XM){a.line(px(xp),y0,px(xp),py(cv),col,1.4,[4,3]);a.line(x0,py(cv),px(xp),py(cv),col,1.4,[4,3]);
      a.circ(px(xp),py(cv),5,col,true);a.txt(F(cv)+' %C a '+F(xp)+' mm',px(xp)+8,py(cv)-6,col,12);}});
  a.g.fillStyle=C.a;a.g.globalAlpha=0.10;a.g.fillRect(x0,y0-hv,16,hv);a.g.globalAlpha=1;
  a.txt('superficie',x0+20,y0-hv+14,C.a,11);
  const x5=prof(0.8);
  a.html(`T = ${F(a.st.T)} °C ⇒ <b>D = D₀·e<sup>−Q/RT</sup> = ${D.toExponential(2).replace('.',',')} m²/s</b> (D₀ = 2,3·10⁻⁵ m²/s, Q = 148 kJ/mol para C en austenita).<br>
  Perfil: (C<sub>x</sub> − C₀)/(C<sub>s</sub> − C₀) = 1 − erf(x / 2√(Dt)) con 2√(Dt) = ${F(2*Math.sqrt(D*t)*1000)} mm.<br>
  Profundidad al <b>0,8 %C</b>: ${isFinite(x5)?'<b>'+F(x5)+' mm</b>':'no se alcanza con esta C superficial'} · al 0,4 %C: ${isFinite(prof(0.4))?F(prof(0.4))+' mm':'—'}.<br>
  Para duplicar la profundidad hace falta <b>4 veces más tiempo</b> (x ∝ √t): ${F(a.st.t)} h → ${F(a.st.t*4)} h.<br>
  <span class="hint">Subir 100 °C multiplica D por ≈${F(Math.exp(-Q/(8.314*(T+100)))/Math.exp(-Q/(8.314*T)))}: siempre sale más barato calentar más que esperar más.</span>`);}});

/* T5 · Curva tensión-deformación */
SIMS.traccion=el=>build(el,{w:660,h:400,
 selects:[{k:'m',v:'acero',l:'material',opts:[['acero','acero C45 (dúctil)'],['hss','acero templado (duro)'],['al','aluminio 6061-T6'],['fundicion','fundición gris (frágil)'],['pc','policarbonato']]}],
 sliders:[{k:'p',v:40,min:1,max:100,step:1,l:'posición en la curva',u:'%'}],
 draw(a){a.clear();
  const M={acero:[207,390,719,28,18,'C45 bonificado'],hss:[207,1300,1600,8,6,'acero templado y revenido'],al:[70,276,310,12,15,'Al 6061-T6'],fundicion:[100,0,250,1,0,'fundición gris'],pc:[2.4,62,70,110,40,'policarbonato']};
  const m=M[a.st.m],E=m[0],Rp=m[1],Rm=m[2],A=m[3],Z=m[4];
  const eMax=A/100*1.08, sMax=Rm*1.15;
  const x0=70,y0=330,wv=530,hv=270;
  const px=e=>x0+e/eMax*wv, py=s=>y0-s/sMax*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  for(let i=0;i<=5;i++){const e=eMax*i/5;a.line(px(e),y0,px(e),y0-hv,C.grid,1);a.txt(Math.round(e*100)+'%',px(e),y0+16,C.muted,11,'center');}
  for(let i=0;i<=4;i++){const s=sMax*i/4;a.line(x0,py(s),x0+wv,py(s),C.grid,1);a.txt(String(Math.round(s)),x0-8,py(s)+4,C.muted,11,'right');}
  a.txt('deformación ε',x0+wv/2,y0+34,C.muted,12,'center');a.txt('σ (MPa)',x0-50,y0-hv-10,C.muted,12);
  const eY=Rp/(E*1000), eU=A/100*0.7, eF=A/100;
  const curva=e=>{ if(a.st.m==='fundicion') return Math.min(E*1000*e, Rm);
    if(e<=eY) return E*1000*e;
    if(e<=eU) return Rp+(Rm-Rp)*Math.pow((e-eY)/(eU-eY),0.45);
    return Rm-(Rm-Rm*0.82)*Math.pow((e-eU)/(eF-eU),1.6);};
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;a.g.beginPath();
  for(let i=0;i<=300;i++){const e=eF*i/300;if(i===0)a.g.moveTo(px(e),py(curva(e)));else a.g.lineTo(px(e),py(curva(e)));}
  a.g.stroke();
  // area bajo la curva (tenacidad)
  a.g.fillStyle=C.a;a.g.globalAlpha=0.08;a.g.beginPath();a.g.moveTo(px(0),py(0));
  for(let i=0;i<=300;i++){const e=eF*i/300;a.g.lineTo(px(e),py(curva(e)));}
  a.g.lineTo(px(eF),py(0));a.g.closePath();a.g.fill();a.g.globalAlpha=1;
  // recta 0,2 %
  if(Rp>0){a.line(px(0.002),y0,px(0.002+Rp/(E*1000)),py(Rp),C.c,1.5,[5,4]);
    a.circ(px(eY+0.002*0),py(Rp),5,C.c,true);a.txt('Rp0,2 = '+F(Rp),px(eY)+10,py(Rp)-8,C.c,12);}
  a.line(x0,py(Rm),x0+wv,py(Rm),C.b,1.2,[5,4]);a.txt('Rm = '+F(Rm),x0+wv-4,py(Rm)-6,C.b,12,'right');
  // punto móvil
  const e=eF*a.st.p/100, s=curva(e);
  a.circ(px(e),py(s),7,C.f,true);a.line(px(e),y0,px(e),py(s),C.f,1.2,[3,3]);
  const zona=e<=eY?'elástica (recuperable)':(e<=eU?'plástica uniforme (endurecimiento por deformación)':'estricción (la sección se reduce localmente)');
  const area=(()=>{let s2=0;for(let i=0;i<1000;i++){const ee=e*i/1000;s2+=curva(ee)*e/1000;}return s2;})();
  a.html(`<b>${m[5]}</b>: E = ${F(E)} GPa · Rp0,2 = ${Rp>0?F(Rp)+' MPa':'no definido (rotura frágil)'} · Rm = ${F(Rm)} MPa · A = ${F(A)} % · Z = ${F(Z)} %.<br>
  Punto marcado: ε = <b>${F(e*100)} %</b>, σ = <b>${F(s)} MPa</b> ⇒ zona <b>${zona}</b>.<br>
  Si descargas aquí, la deformación recuperada es σ/E = ${F(s/(E*1000)*100)} % y la permanente ${F(Math.max(0,(e-s/(E*1000)))*100)} %.<br>
  Tenacidad acumulada (área bajo la curva) ≈ ${F(area)} MJ/m³.<br>
  <span class="hint">La tensión se calcula SIEMPRE con la sección inicial S₀: por eso la curva baja tras Rm aunque el material siga endureciéndose.</span>`);}});

/* T6 · Diagrama eutéctico y regla de la palanca */
SIMS.fases=el=>build(el,{w:660,h:410,
 sliders:[{k:'c',v:40,min:2,max:98,step:1,l:'composición C₀',u:'% B'},{k:'T',v:250,min:120,max:420,step:5,l:'temperatura',u:'°C'}],
 draw(a){a.clear();
  const TA=327,TB=232,TE=183,CE=61.9,CaMax=19.2,CbMax=97.5; // Pb-Sn
  const x0=70,y0=350,wv=520,hv=290;
  const px=c=>x0+c/100*wv, py=T=>y0-(T-100)/350*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  [0,20,40,60,80,100].forEach(c=>{a.line(px(c),y0,px(c),y0-hv,C.grid,1);a.txt(c+'',px(c),y0+16,C.muted,11,'center');});
  [100,200,300,400].forEach(T=>{a.line(x0,py(T),x0+wv,py(T),C.grid,1);a.txt(T+'',x0-8,py(T)+4,C.muted,11,'right');});
  a.txt('% B (estaño) en peso',x0+wv/2,y0+34,C.muted,12,'center');a.txt('T (°C)',x0-46,y0-hv-6,C.muted,12);
  // liquidus y solidus
  const liqA=c=>TA-(TA-TE)*(c/CE), liqB=c=>TB-(TB-TE)*((100-c)/(100-CE));
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();a.g.moveTo(px(0),py(TA));
  for(let c=0;c<=CE;c+=1)a.g.lineTo(px(c),py(liqA(c)));a.g.stroke();
  a.g.beginPath();a.g.moveTo(px(CE),py(TE));for(let c=CE;c<=100;c+=1)a.g.lineTo(px(c),py(liqB(c)));a.g.stroke();
  a.g.strokeStyle=C.f;a.g.lineWidth=2;
  a.g.beginPath();a.g.moveTo(px(0),py(TA));a.g.lineTo(px(CaMax),py(TE));a.g.stroke();
  a.g.beginPath();a.g.moveTo(px(100),py(TB));a.g.lineTo(px(CbMax),py(TE));a.g.stroke();
  a.line(px(CaMax),py(TE),px(CbMax),py(TE),C.b,2.5);
  a.circ(px(CE),py(TE),6,C.b,true);a.txt('eutéctico '+F(CE)+' % / '+TE+' °C',px(CE)+10,py(TE)+18,C.b,11);
  a.txt('L',px(50),py(400),C.muted,14,'center');a.txt('α',px(8),py(200),C.muted,14,'center');a.txt('β',px(96),py(200),C.muted,14,'center');
  a.txt('α + β',px(50),py(140),C.muted,14,'center');a.txt('L + α',px(28),py(260),C.muted,12,'center');a.txt('L + β',px(80),py(215),C.muted,12,'center');
  const c0=a.st.c,T=a.st.T;
  a.line(px(c0),y0,px(c0),y0-hv,C.c,1.4,[4,3]);
  a.circ(px(c0),py(T),7,C.c,true);
  // determinar region y palanca
  let txt='',ca,cb,f1,f2,n1,n2;
  const solA=T>=TE? CaMax*(TA-T)/(TA-TE):CaMax, solB=T>=TE?100-(100-CbMax)*(TB-T)/(TB-TE):CbMax;
  if(T>=Math.max(liqA(Math.min(c0,CE)),c0>CE?liqB(c0):0) && ((c0<=CE&&T>=liqA(c0))||(c0>CE&&T>=liqB(c0)))){
    txt='<b>Una sola fase: líquido</b> (100 % L). Grados de libertad F = 2.';}
  else if(T<TE){ ca=CaMax;cb=CbMax;f1=(cb-c0)/(cb-ca);f2=1-f1;n1='α';n2='β';
    const prim=c0<CE?'α proeutéctica':'β proeutéctica';
    const fprim=c0<CE?(CE-c0)/(CE-CaMax):(c0-CE)/(CbMax-CE);
    txt=`<b>Dos fases sólidas: α + β</b> ⇒ %α = (${F(cb)} − ${F(c0)})/(${F(cb)} − ${F(ca)}) = <b>${F(f1*100)} %</b> y %β = <b>${F(f2*100)} %</b>.<br>
    Constituyentes: ${F(Math.max(0,fprim)*100)} % de <b>${prim}</b> y ${F((1-Math.max(0,fprim))*100)} % de <b>eutéctico</b> (α + β laminar). ¡Fases y constituyentes no son lo mismo!`;}
  else if(c0<=CE){ ca=solA;cb=CE*(1)-0; const cl=Math.min(CE, CE*(TA-T)/(TA-TE));
    f1=(cl-c0)/(cl-ca);f2=1-f1;n1='α';n2='L';
    txt=`<b>Dos fases: α + L</b>. Lee la isoterma: α con ${F(ca)} % B y L con ${F(cl)} % B ⇒ %α = (${F(cl)} − ${F(c0)})/(${F(cl)} − ${F(ca)}) = <b>${F(f1*100)} %</b>, %L = <b>${F(f2*100)} %</b>.`;}
  else { const cl=Math.max(CE, 100-(100-CE)*(TB-T)/(TB-TE)); ca=solB;
    f1=(c0-cl)/(ca-cl);f2=1-f1;n1='β';n2='L';
    txt=`<b>Dos fases: β + L</b>. β con ${F(ca)} % B y L con ${F(cl)} % B ⇒ %β = <b>${F(Math.max(0,Math.min(1,f1))*100)} %</b>, %L = <b>${F(Math.max(0,Math.min(1,f2))*100)} %</b>.`;}
  if(f1!==undefined&&T>=TE){const cl2=(n2==='L')?(c0<=CE?Math.min(CE,CE*(TA-T)/(TA-TE)):Math.max(CE,100-(100-CE)*(TB-T)/(TB-TE))):CbMax;
    a.line(px(Math.min(ca,cl2)),py(T),px(Math.max(ca,cl2)),py(T),C.d,2.5);
    a.circ(px(ca),py(T),4,C.d,true);a.circ(px(cl2),py(T),4,C.d,true);}
  if(T<TE){a.line(px(CaMax),py(T),px(CbMax),py(T),C.d,2.5);}
  a.html(`C₀ = ${F(c0)} % B a ${F(T)} °C.<br>${txt}<br>
  <span class="hint">Regla de la palanca: el porcentaje de una fase se calcula con el brazo OPUESTO dividido por el segmento total. La regla de las fases da F = 0 en el punto eutéctico: ahí la temperatura no puede variar mientras coexisten las tres fases.</span>`);}});

/* T7 · Diagrama Fe-C */
SIMS.fec=el=>build(el,{w:660,h:410,
 sliders:[{k:'c',v:0.4,min:0.05,max:2.0,step:0.01,l:'contenido de carbono',u:'%C'},{k:'T',v:800,min:400,max:1100,step:10,l:'temperatura',u:'°C'}],
 draw(a){a.clear();
  const CE=0.77,TE=727,CMAX=2.11,FE3C=6.67,CA=0.022;
  const x0=70,y0=345,wv=520,hv=280;
  const px=c=>x0+c/2.2*wv, py=T=>y0-(T-400)/750*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  [0,0.5,1,1.5,2].forEach(c=>{a.line(px(c),y0,px(c),y0-hv,C.grid,1);a.txt(F(c),px(c),y0+16,C.muted,11,'center');});
  [400,600,800,1000].forEach(T=>{a.line(x0,py(T),x0+wv,py(T),C.grid,1);a.txt(T+'',x0-8,py(T)+4,C.muted,11,'right');});
  a.txt('% C en peso',x0+wv/2,y0+34,C.muted,12,'center');a.txt('T (°C)',x0-46,y0-hv-6,C.muted,12);
  // A3, Acm, A1
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();a.g.moveTo(px(0),py(912));
  for(let c=0;c<=CE;c+=0.01)a.g.lineTo(px(c),py(912-(912-TE)*Math.pow(c/CE,0.78)));a.g.stroke();
  a.g.beginPath();a.g.moveTo(px(CE),py(TE));for(let c=CE;c<=2.11;c+=0.01)a.g.lineTo(px(c),py(TE+(1148-TE)*Math.pow((c-CE)/(2.11-CE),0.85)));a.g.stroke();
  a.line(px(0),py(TE),px(2.2),py(TE),C.b,2.5);
  a.g.strokeStyle=C.f;a.g.lineWidth=2;a.g.beginPath();a.g.moveTo(px(0),py(912));
  for(let T=TE;T<=912;T+=5)a.g.lineTo(px(CA*(912-T)/(912-TE)*0+ (0.022*(T-TE)/(912-TE)+0.0)*0 + (0.022*(1-(912-T)/(912-TE)))),py(T));a.g.stroke();
  a.line(px(CA),py(TE),px(CA),py(400),C.f,1.6);
  a.circ(px(CE),py(TE),6,C.b,true);a.txt('eutectoide 0,77 % / 727 °C',px(CE)+12,py(TE)+22,C.b,11);
  a.txt('γ austenita',px(1.1),py(950),C.muted,13,'center');
  a.txt('α',px(0.06),py(800),C.muted,13,'center');
  a.txt('α + Fe₃C',px(0.9),py(600),C.muted,13,'center');
  a.txt('α + γ',px(0.3),py(790),C.muted,11,'center');
  a.txt('γ + Fe₃C',px(1.6),py(830),C.muted,11,'center');
  const c0=a.st.c,T=a.st.T;
  a.line(px(c0),y0,px(c0),y0-hv,C.c,1.4,[4,3]);a.circ(px(c0),py(T),7,C.c,true);
  const A3=c0<=CE?912-(912-TE)*Math.pow(c0/CE,0.78):null;
  const Acm=c0>CE?TE+(1148-TE)*Math.pow((c0-CE)/(2.11-CE),0.85):null;
  let txt='';
  const palanca=(c,cl,ch)=>[(ch-c)/(ch-cl)*100,(c-cl)/(ch-cl)*100];
  if(T>TE && ((c0<=CE&&T>A3)||(c0>CE&&T>Acm))){
    txt=`<b>Una sola fase: austenita γ</b> al ${F(100)} %, con ${F(c0)} %C en disolución intersticial (FCC). Es el punto de partida de todo tratamiento térmico.`;}
  else if(T>TE && c0<=CE){ const cg=CE*Math.pow((912-T)/(912-TE),1/0.78);
    const [fa,fg]=palanca(c0,CA,cg);
    txt=`<b>α + γ</b>: la ferrita proeutectoide ya ha empezado a precipitar. α con ${F(CA)} %C y γ con ${F(cg)} %C ⇒ <b>%α = ${F(fa)} %</b> y <b>%γ = ${F(fg)} %</b>. Al seguir bajando, γ se enriquece hasta 0,77 %C.`;}
  else if(T>TE && c0>CE){ const cg=CE+(2.11-CE)*Math.pow((T-TE)/(1148-TE),1/0.85);
    const [fg,fc]=palanca(c0,cg,FE3C);
    txt=`<b>γ + Fe₃C</b>: la cementita proeutectoide precipita en los bordes de grano. γ con ${F(cg)} %C ⇒ <b>%γ = ${F(fg)} %</b> y <b>%Fe₃C = ${F(fc)} %</b>.`;}
  else { const [fa,fc]=palanca(c0,CA,FE3C);
    const hipo=c0<=CE;
    const fpro=hipo?(CE-c0)/(CE-CA)*100:(c0-CE)/(FE3C-CE)*100;
    const fperl=100-fpro;
    const aPro=hipo?fpro:0, cPro=hipo?0:fpro;
    txt=`<b>Fases: α + Fe₃C</b> ⇒ <b>%α = ${F(fa)} %</b> y <b>%Fe₃C = ${F(fc)} %</b> (palanca entre 0,022 y 6,67).<br>
    <b>Constituyentes</b>: ${F(fperl)} % de <b>perlita</b> y ${F(fpro)} % de <b>${hipo?'ferrita':'cementita'} proeutectoide</b> ⇒ acero <b>${hipo?'hipoeutectoide':'hipereutectoide'}</b>.<br>
    Dentro de la perlita: ${F(fperl*0.889)} % α eutectoide + ${F(fperl*0.111)} % Fe₃C eutectoide (comprobación: ${F(aPro+fperl*0.889)} % ≈ ${F(fa)} % ✓).`;}
  // barra de constituyentes
  if(T<=TE){const hipo=c0<=CE;const fpro=hipo?(CE-c0)/(CE-CA):(c0-CE)/(FE3C-CE);
    const bx=px(1.35),by=py(1070);
    a.txt('constituyentes',bx,by-8,C.muted,11);
    Barra(a,bx,by,170,20,1,C.b);a.g.fillStyle=hipo?C.f:C.e;a.g.fillRect(bx,by,170*Math.max(0,fpro),20);
    a.txt((hipo?'ferrita pro ':'cementita pro ')+F(fpro*100)+'%',bx,by+36,hipo?C.f:C.e,11);
    a.txt('perlita '+F((1-fpro)*100)+'%',bx,by+52,C.b,11);}
  a.html(`C₀ = <b>${F(c0)} %C</b> (${c0<=CE?'hipoeutectoide':(c0<=CMAX?'hipereutectoide':'fundición')}) a ${F(T)} °C. ${A3?'A₃ ≈ '+F(A3)+' °C':'A_cm ≈ '+F(Acm)+' °C'} · A₁ = 727 °C.<br>${txt}<br>
  <span class="hint">Perlita = 88,9 % ferrita + 11,1 % cementita. Si el enunciado dice «fases», responde α y Fe₃C; si dice «constituyentes» o «al microscopio», responde proeutectoide y perlita.</span>`);}});

/* T8 · Curva TTT y tratamientos */
SIMS.ttt=el=>build(el,{w:660,h:410,
 selects:[{k:'tr',v:'temple',l:'tratamiento',opts:[['recocido','recocido (horno, muy lento)'],['normalizado','normalizado (aire)'],['temple','temple (agua)'],['austempering','austempering (sales a 350 °C)'],['martempering','martempering (escalonado)'],['isotermico','isotérmico a 650 °C (perlita media)']]},
  {k:'sost',v:'completo',l:'duración de la meseta',opts:[['completo','hasta completar la transformación'],['corto','solo 15 min (insuficiente)']]}],
 draw(a){a.clear();
  const x0=90,y0=330,wv=500,hv=270;
  const px=t=>x0+(Math.log10(Math.max(t,0.5))-Math.log10(0.5))/(Math.log10(1e5)-Math.log10(0.5))*wv;
  const py=T=>y0-(T-100)/700*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  [1,10,100,1000,10000,100000].forEach(t=>{a.line(px(t),y0,px(t),y0-hv,C.grid,1);a.txt(t>=1000?(t/1000)+'k s':t+' s',px(t),y0+16,C.muted,10,'center');});
  [200,400,600,800].forEach(T=>{a.line(x0,py(T),x0+wv,py(T),C.grid,1);a.txt(T+'',x0-8,py(T)+4,C.muted,11,'right');});
  a.txt('tiempo (escala logarítmica)',x0+wv/2,y0+34,C.muted,12,'center');a.txt('T (°C)',x0-50,y0-hv-14,C.muted,12);
  a.line(x0,py(727),x0+wv,py(727),C.muted,1.4,[5,4]);a.txt('A₁ = 727 °C',x0+4,py(727)-6,C.muted,11);
  a.line(x0,py(220),x0+wv,py(220),C.d,1.8,[6,4]);a.txt('Ms = 220 °C',x0+wv-4,py(220)-6,C.d,11,'right');
  a.line(x0,py(120),x0+wv,py(120),C.d,1.2,[3,3]);a.txt('Mf',x0+wv-4,py(120)-6,C.d,11,'right');
  // nariz de la S: inicio y fin
  const ini=T=>{const u=(T-250)/(727-250);return 1.2+ 2600*Math.pow(Math.abs(u-0.52)*2,2.1);};
  const fin=T=>ini(T)*9;
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  for(let T=727;T>=250;T-=4){const X=px(ini(T)),Y=py(T);if(T===727)a.g.moveTo(X,Y);else a.g.lineTo(X,Y);}a.g.stroke();
  a.g.strokeStyle=C.b;a.g.lineWidth=2;a.g.setLineDash([6,4]);a.g.beginPath();
  for(let T=727;T>=250;T-=4){const X=px(fin(T)),Y=py(T);if(T===727)a.g.moveTo(X,Y);else a.g.lineTo(X,Y);}a.g.stroke();a.g.setLineDash([]);
  a.txt('inicio',px(ini(500))-6,py(500)-10,C.a,11,'right');a.txt('fin',px(fin(500))+6,py(500)-10,C.b,11);
  a.txt('perlita gruesa',px(5000),py(690),C.muted,11,'center');
  a.txt('perlita fina',px(200),py(560),C.muted,11,'center');
  a.txt('bainita',px(3000),py(380),C.muted,11,'center');
  a.txt('martensita',px(60),py(170),C.d,12);
  // camino
  const tr=a.st.tr, corto=a.st.sost==='corto';
  const path=[];let res='',dur='',col=C.c;
  if(tr==='recocido'){for(let i=0;i<=60;i++){const t=Math.pow(10,-0.3+i/60*4.6);path.push([t,727-(727-500)*(i/60)]);} path.push([6e4,300]);res='Perlita gruesa (cruza la curva muy arriba): la más blanda, ≈15 HRc. Ablanda, quita tensiones y mejora la mecanizabilidad.';}
  else if(tr==='normalizado'){for(let i=0;i<=60;i++){const t=Math.pow(10,-0.3+i/60*2.6);path.push([t,727-(727-520)*(i/60)]);} path.push([2e3,300]);res='Perlita fina y grano afinado y homogéneo, ≈25 HRc. Estado de referencia antes de mecanizar o templar.';}
  else if(tr==='temple'){path.push([0.5,760],[1.2,400],[2,150]);res='<b>Martensita</b> (el camino no corta la nariz): ≈65 HRc, máxima dureza y mínima tenacidad. OBLIGATORIO revenir después.';col=C.d;}
  else if(tr==='austempering'){path.push([0.5,760],[1.5,350]);
    if(corto){path.push([900,350],[900,150]);res='A 350 °C la bainita no ha terminado a los 15 min: queda austenita que, al enfriar, se convierte en <b>martensita sin revenir</b> ⇒ pieza frágil. Tratamiento MAL diseñado.';col=C.d;}
    else{path.push([3e4,350],[3e4,200]);res='<b>Bainita</b> completa: ≈45-50 HRc con buena tenacidad y SIN las grietas ni deformaciones del temple (no hay transformación martensítica).';}}
  else if(tr==='martempering'){path.push([0.5,760],[1.2,260],[300,260],[600,120]);res='Temple escalonado: se homogeneiza la temperatura por encima de Ms y luego se cruza Ms despacio ⇒ <b>martensita con muchas menos tensiones</b> (menos riesgo de grietas y deformación). También hay que revenir.';col=C.d;}
  else {path.push([0.5,760],[1.5,650]);
    if(corto){path.push([900,650],[900,200]);res='A 650 °C la perlita termina a los ≈40 s, así que 15 min son más que suficientes: 100 % <b>perlita media</b>, ≈32 HRc.';}
    else{path.push([200,650],[400,250]);res='100 % <b>perlita media</b>, ≈32 HRc: es el tratamiento que piden en el problema 1 del tema 8 (austenizar, bajar a 650 °C, mantener ≥40 s y enfriar al aire).';}}
  a.g.strokeStyle=col;a.g.lineWidth=3;a.g.beginPath();
  path.forEach((p,i)=>{const X=px(p[0]),Y=py(p[1]);i===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);});a.g.stroke();
  const last=path[path.length-1];a.circ(px(last[0]),py(last[1]),6,col,true);
  a.html(`<b>${{recocido:'Recocido',normalizado:'Normalizado',temple:'Temple',austempering:'Austempering',martempering:'Martempering',isotermico:'Isotérmico a 650 °C'}[tr]}</b>: ${res}<br>
  Dureza relativa: martensita ≫ bainita > perlita fina > perlita gruesa.<br>
  <span class="hint">Regla de oro: si al cruzar Ms queda austenita sin transformar, aparecerá martensita, quieras o no. Comprueba siempre que has pasado la curva de FIN de transformación.</span>`);}});

/* T9 · Aceros: del %C a las propiedades */
SIMS.aceros=el=>build(el,{w:660,h:390,
 sliders:[{k:'c',v:0.45,min:0.05,max:1.4,step:0.05,l:'contenido de carbono',u:'%C'}],
 selects:[{k:'e',v:'normalizado',l:'estado',opts:[['recocido','recocido (perlita gruesa)'],['normalizado','normalizado (perlita fina)'],['bonificado','temple + revenido'],['templado','templado sin revenir']]}],
 draw(a){a.clear();const c=a.st.c,e=a.st.e;
  const CE=0.77,CA=0.022,FE3C=6.67;
  const hipo=c<=CE;
  const fperl=hipo?(c-CA)/(CE-CA):(FE3C-c)/(FE3C-CE);
  const fpro=1-fperl;
  const base=hipo?300+500*c/CE:800;
  const mult={recocido:0.85,normalizado:1.0,bonificado:1.45,templado:1.9}[e];
  const Rm=Math.round(base*mult);
  const HB=Math.round(Rm/3.5);
  const A=Math.max(1,Math.round((hipo?(28-22*c/CE):6)*{recocido:1.25,normalizado:1.0,bonificado:0.75,templado:0.12}[e]));
  const bx=50,by=70;
  a.txt('Microestructura (estado recocido o normalizado)',bx,by-14,C.muted,12);
  Barra(a,bx,by,260,26,1,C.b);
  a.g.fillStyle=hipo?C.f:C.e;a.g.fillRect(bx,by,260*fpro,26);
  a.txt((hipo?'ferrita ':'cementita ')+F(fpro*100)+'%',bx+4,by+44,hipo?C.f:C.e,12);
  a.txt('perlita '+F(fperl*100)+'%',bx+150,by+44,C.b,12);
  // esquema de grano
  const gx=bx,gy=by+70,gw=260,gh=160;
  a.g.fillStyle=C.bg;a.g.fillRect(gx,gy,gw,gh);
  let seed=Math.round(c*1000)%89;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
  for(let i=0;i<26;i++){const X=gx+10+rnd()*(gw-20),Y=gy+10+rnd()*(gh-20),r=10+rnd()*9;
    const perl=rnd()<fperl;
    if(e==='templado'||e==='bonificado'){a.g.strokeStyle=e==='templado'?C.d:C.a;a.g.lineWidth=1.6;
      for(let j=0;j<4;j++){const ang=rnd()*Math.PI;a.line(X-r*Math.cos(ang),Y-r*Math.sin(ang),X+r*Math.cos(ang),Y+r*Math.sin(ang),e==='templado'?C.d:C.a,1.6);}}
    else if(perl){a.circ(X,Y,r,C.b,true);a.g.strokeStyle=C.bg;a.g.lineWidth=1;
      for(let j=-r;j<r;j+=3.2){a.line(X-Math.sqrt(Math.max(0,r*r-j*j)),Y+j,X+Math.sqrt(Math.max(0,r*r-j*j)),Y+j,C.bg,1);}}
    else {a.circ(X,Y,r,hipo?C.f:C.e,true);}
    a.circ(X,Y,r,C.muted,false);}
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.5;a.g.strokeRect(gx,gy,gw,gh);
  a.txt(e==='templado'?'agujas de martensita':(e==='bonificado'?'martensita revenida (sorbita)':'granos: perlita rayada y '+(hipo?'ferrita':'cementita')),gx,gy+gh+18,C.muted,11);
  // propiedades
  const rx=370;
  [['Rm (MPa)',Rm,2200,C.a],['Dureza (HB)',HB,650,C.b],['Alargamiento A (%)',A,36,C.c]].forEach((d,i)=>{
    a.txt(d[0],rx,80+i*74,C.text,12);
    Barra(a,rx,88+i*74,220,22,d[1]/d[2],d[3]);
    a.txt(String(d[1]),rx+226,105+i*74,d[3],13);});
  const uso=c<0.25?'chapa, perfiles, tubos y piezas soldadas (buena soldabilidad y conformabilidad)':
    (c<0.6?'ejes, bielas, engranajes y piezas bonificadas':'muelles, herramientas de corte, matrices y rodamientos');
  const tipo=c<0.25?'bajo carbono':(c<0.6?'medio carbono':'alto carbono');
  const desig=c<0.25?('S235 / C'+Math.round(c*100)):'C'+Math.round(c*100);
  a.html(`Acero de <b>${F(c)} %C</b> (${tipo}, ${hipo?'hipoeutectoide':'hipereutectoide'}), designación tipo <b>${desig}</b>, estado <b>${e}</b>.<br>
  Microestructura de equilibrio: ${F(fpro*100)} % ${hipo?'ferrita':'cementita'} proeutectoide + ${F(fperl*100)} % perlita.<br>
  Estimación: R<sub>m</sub> ≈ <b>${Rm} MPa</b> ⇒ dureza ≈ <b>${HB} HB</b> (R<sub>m</sub> ≈ 3,5·HB) y alargamiento ≈ <b>${A} %</b>.<br>
  Uso típico: ${uso}.<br>
  <span class="hint">${c>0.6?'Ojo: por encima de 0,77 %C la cementita proeutectoide forma una red frágil en los bordes de grano; conviene globulizarla.':'Más carbono = más resistencia y dureza, menos ductilidad y peor soldabilidad.'} ${e==='templado'?'Sin revenir, esta pieza es demasiado frágil para servicio.':''}</span>`);}});

/* T10 · Comparador de metales no férreos */
SIMS.noferreas=el=>build(el,{w:660,h:380,
 selects:[{k:'p',v:'resesp',l:'criterio',opts:[['rho','densidad ρ (menos es mejor)'],['E','módulo E'],['Rm','resistencia Rm'],['resesp','resistencia específica Rm/ρ'],['rigesp','rigidez específica E/ρ'],['Tserv','temperatura máxima de servicio'],['coste','coste relativo (menos es mejor)'],['sigma','conductividad eléctrica']]}],
 draw(a){a.clear();
  // [rho, E, Rm, Tserv, coste, cond %IACS]
  const M={'Acero al C':[7.85,207,500,500,1,15,C.text],'Inox 304':[7.9,193,590,800,4,2.4,C.muted],
   'Al 2024-T6':[2.78,73,470,175,2.5,30,C.f],'Al 7075-T6':[2.81,72,570,150,3.5,33,C.f],
   'Ti-6Al-4V':[4.43,114,950,550,30,3,C.c],'Mg AZ91':[1.81,45,230,150,5,10,C.d],
   'Cu':[8.93,120,220,250,6,100,C.b],'Latón 70/30':[8.53,110,340,200,5,28,C.e],'Inconel 718':[8.19,200,1240,700,40,1.4,C.a]};
  const p=a.st.p;
  const val=m=>({rho:m[0],E:m[1],Rm:m[2],resesp:m[2]/m[0],rigesp:m[1]/m[0],Tserv:m[3],coste:m[4],sigma:m[5]})[p];
  const menos=(p==='rho'||p==='coste');
  const uds={rho:'g/cm³',E:'GPa',Rm:'MPa',resesp:'MPa·cm³/g',rigesp:'GPa·cm³/g',Tserv:'°C',coste:'× acero',sigma:'% IACS'}[p];
  const keys=Object.keys(M).sort((u,v)=>menos?val(M[u])-val(M[v]):val(M[v])-val(M[u]));
  const vmax=Math.max(...keys.map(k=>val(M[k])));
  a.txt(({rho:'Densidad',E:'Módulo de Young',Rm:'Resistencia a tracción',resesp:'Resistencia específica Rm/ρ',rigesp:'Rigidez específica E/ρ',Tserv:'Temperatura máxima de servicio',coste:'Coste relativo',sigma:'Conductividad eléctrica'})[p]+'  ('+uds+')',40,34,C.text,14);
  a.txt(menos?'ordenado de MENOR a mayor (mejor arriba)':'ordenado de MAYOR a menor (mejor arriba)',40,54,C.muted,11);
  keys.forEach((k,i)=>{const m=M[k],v=val(m);
    a.txt(k,40,82+i*34,C.text,12);
    Barra(a,180,70+i*34,330,18,v/vmax,i===0?C.a:m[6]);
    a.txt(F(v),518,84+i*34,i===0?C.a:C.muted,12);});
  const best=M[keys[0]],worst=M[keys[keys.length-1]];
  a.html(`Mejor con este criterio: <b>${keys[0]}</b> (${F(val(best))} ${uds}); el peor, ${keys[keys.length-1]} (${F(val(worst))}).<br>
  Cambia el criterio y mira cómo se reordena todo: el <b>acero gana en E y en coste</b>, el <b>titanio en resistencia específica</b>, el <b>magnesio en densidad</b>, el <b>cobre en conductividad</b> y el <b>Inconel en temperatura</b>.<br>
  <span class="hint">Nunca compares metales por una sola propiedad: en diseño se usan índices (Rm/ρ, E/ρ, √E/ρ) y se cruzan con el coste y con la corrosión del ambiente de servicio.</span>`);}});

/* T11 · Regla de mezclas en compuestos */
SIMS.compuestos=el=>build(el,{w:660,h:390,
 sliders:[{k:'vf',v:40,min:0,max:70,step:1,l:'fracción de fibra Vf',u:'% volumen'}],
 selects:[{k:'f',v:'vidrio',l:'refuerzo',opts:[['vidrio','fibra de vidrio E (72 GPa, 2,55)'],['carbono','fibra de carbono (230 GPa, 1,80)'],['kevlar','Kevlar 49 (124 GPa, 1,44)']]},
  {k:'d',v:'long',l:'dirección de la carga',opts:[['long','paralela a las fibras (isodeformación)'],['trans','transversal (isotensión)']]}],
 draw(a){a.clear();
  const FB={vidrio:[72,2.55,3400,C.c],carbono:[230,1.80,3500,C.text],kevlar:[124,1.44,3600,C.e]};
  const f=FB[a.st.f],Em=3.5,rm=1.20,Vf=a.st.vf/100,Vm=1-Vf;
  const El=f[0]*Vf+Em*Vm, Et=1/(Vf/f[0]+Vm/Em);
  const Ec=a.st.d==='long'?El:Et;
  const rc=f[1]*Vf+rm*Vm;
  const Ff=f[0]*Vf, Fm=Em*Vm, share=Ff/(Ff+Fm);
  // esquema de la lámina
  const bx=40,by=60,bw=270,bh=120;
  a.g.fillStyle=C.grid;a.g.fillRect(bx,by,bw,bh);
  const n=Math.max(0,Math.round(Vf*26));
  if(a.st.d==='long'){for(let i=0;i<n;i++){const y=by+6+i*(bh-12)/Math.max(n,1);a.g.fillStyle=f[3];a.g.fillRect(bx,y,bw,Math.max(2,(bh-12)/Math.max(n,1)*0.55));}
    a.arrow(bx-24,by+bh/2,bx-4,by+bh/2,C.a,2.5);a.arrow(bx+bw+24,by+bh/2,bx+bw+4,by+bh/2,C.a,2.5);
    a.txt('carga',bx+bw/2,by-10,C.a,12,'center');}
  else {for(let i=0;i<n;i++){const x=bx+6+i*(bw-12)/Math.max(n,1);a.g.fillStyle=f[3];a.g.fillRect(x,by,Math.max(2,(bw-12)/Math.max(n,1)*0.55),bh);}
    a.arrow(bx+bw/2,by-24,bx+bw/2,by-4,C.a,2.5);a.arrow(bx+bw/2,by+bh+24,bx+bw/2,by+bh+4,C.a,2.5);
    a.txt('carga',bx+bw+10,by+bh/2,C.a,12);}
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.5;a.g.strokeRect(bx,by,bw,bh);
  a.txt('matriz epoxi (3,5 GPa) + '+F(Vf*100)+' % de fibra',bx,by+bh+24,C.muted,11);
  // curva E frente a Vf
  const x0=360,y0=300,wv=250,hv=210;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  const ymax=f[0]*0.75;
  a.txt('E (GPa)',x0-6,y0-hv-8,C.muted,11);a.txt('Vf',x0+wv/2,y0+28,C.muted,11,'center');
  [0,0.25,0.5,0.7].forEach(v=>{a.txt(F(v*100)+'%',x0+v/0.7*wv,y0+14,C.muted,10,'center');});
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  for(let i=0;i<=70;i++){const v=i/100;const E=f[0]*v+Em*(1-v);const X=x0+v/0.7*wv,Y=y0-E/ymax*hv;i===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  a.g.strokeStyle=C.f;a.g.lineWidth=2.5;a.g.beginPath();
  for(let i=0;i<=70;i++){const v=i/100;const E=1/(v/f[0]+(1-v)/Em);const X=x0+v/0.7*wv,Y=y0-E/ymax*hv;i===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  a.txt('longitudinal',x0+wv-4,y0-f[0]*0.68/ymax*hv,C.a,11,'right');
  a.txt('transversal',x0+wv-4,y0-18,C.f,11,'right');
  const X=x0+Vf/0.7*wv,Y=y0-Ec/ymax*hv;a.circ(X,Y,6,C.c,true);
  a.html(`Refuerzo ${a.st.f}: E<sub>f</sub> = ${F(f[0])} GPa, ρ<sub>f</sub> = ${F(f[1])} g/cm³. Vf = ${F(Vf*100)} %, Vm = ${F(Vm*100)} %.<br>
  <b>Longitudinal</b>: E = E<sub>f</sub>V<sub>f</sub> + E<sub>m</sub>V<sub>m</sub> = ${F(f[0])}·${F(Vf)} + 3,5·${F(Vm)} = <b>${F(El)} GPa</b>.<br>
  <b>Transversal</b>: 1/E = V<sub>f</sub>/E<sub>f</sub> + V<sub>m</sub>/E<sub>m</sub> ⇒ <b>${F(Et)} GPa</b> (${F(El/Et)} veces menos).<br>
  Reparto de carga en longitudinal: F<sub>f</sub>/F<sub>m</sub> = ${F(Ff/Math.max(Fm,1e-6))} ⇒ la fibra soporta el <b>${F(share*100)} %</b>.<br>
  Densidad ρ<sub>c</sub> = <b>${F(rc)} g/cm³</b> ⇒ rigidez específica ${F(Ec/rc)} GPa·cm³/g (acero: 26,4).<br>
  <span class="hint">Las fracciones van en VOLUMEN. Un unidireccional es casi inútil a 90°: de ahí los laminados a 0/±45/90°.</span>`);}});

/* T12 · Resistividad: temperatura, impurezas y deformación (Matthiessen) */
SIMS.conductividad=el=>build(el,{w:660,h:390,
 sliders:[{k:'T',v:20,min:-200,max:400,step:10,l:'temperatura',u:'°C'},{k:'ci',v:0,min:0,max:30,step:1,l:'níquel en disolución',u:'% at'},{k:'cw',v:0,min:0,max:60,step:5,l:'deformación en frío',u:'%'}],
 draw(a){a.clear();
  const r0=0.1,alpha=0.0068,A=12.5; // Cu: 10^-8 ohm m
  const rT=c=>1.7*(1+alpha*(c-20));
  const rI=0+A*(a.st.ci/100)*(1-a.st.ci/100)*10;
  const rD=a.st.cw*0.012;
  const rt=rT(a.st.T)+rI+rD;
  const x0=70,y0=300,wv=540,hv=230;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  const px=T=>x0+(T+250)/700*wv, py=r=>y0-r/12*hv;
  [-200,-100,0,100,200,300,400].forEach(T=>{a.line(px(T),y0,px(T),y0-hv,C.grid,1);a.txt(T+'',px(T),y0+16,C.muted,10,'center');});
  [0,3,6,9,12].forEach(r=>{a.line(x0,py(r),x0+wv,py(r),C.grid,1);a.txt(F(r),x0-8,py(r)+4,C.muted,10,'right');});
  a.txt('temperatura (°C)',x0+wv/2,y0+34,C.muted,12,'center');
  a.txt('ρ (10⁻⁸ Ω·m)',x0-56,y0-hv-8,C.muted,12);
  // curva cobre puro y curva con impurezas+deformacion
  a.g.strokeStyle=C.muted;a.g.lineWidth=2;a.g.beginPath();
  for(let T=-250;T<=450;T+=5){const X=px(T),Y=py(Math.max(0.02,rT(T)));T===-250?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  a.txt('Cu puro recocido',px(300),py(rT(300))-10,C.muted,11,'center');
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;a.g.beginPath();
  for(let T=-250;T<=450;T+=5){const X=px(T),Y=py(Math.max(0.02,rT(T)+rI+rD));T===-250?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  const X=px(a.st.T),Y=py(rt);a.circ(X,Y,6,C.f,true);a.line(x0,Y,X,Y,C.f,1.2,[4,3]);
  // descomposición
  const bx=430,by=50;
  a.txt('Contribuciones (Matthiessen)',bx,by-10,C.text,12);
  [['térmica',rT(a.st.T),C.b],['impurezas',rI,C.c],['deformación',rD,C.d]].forEach((d,i)=>{
    Barra(a,bx,by+i*30,130,18,d[1]/Math.max(rt,0.1),d[2]);
    a.txt(d[0]+' '+F(d[1]),bx,by+i*30+32,d[2],11);});
  a.txt('ρ total = '+F(rt)+' ·10⁻⁸ Ω·m',bx,by+122,C.a,13);
  const sigma=1/(rt*1e-8);
  const Rcable=rt*1e-8*100/1e-6; // 100 m, 1 mm2
  a.html(`ρ = ρ<sub>térmica</sub> + ρ<sub>impurezas</sub> + ρ<sub>deformación</sub> = ${F(rT(a.st.T))} + ${F(rI)} + ${F(rD)} = <b>${F(rt)}·10⁻⁸ Ω·m</b> ⇒ σ = <b>${(sigma).toExponential(2).replace('.',',')} S/m</b>.<br>
  Un cable de 100 m y 1 mm² tendría <b>R = ${F(Rcable)} Ω</b> (el cobre puro recocido a 20 °C daría 1,70 Ω).<br>
  Con ${F(a.st.ci)} % at de Ni y ${F(a.st.cw)} % de deformación, la resistividad es <b>${F(rt/rT(20))} veces</b> la del cobre puro a 20 °C.<br>
  <span class="hint">Alear y deformar ENDURECE pero empeora la conducción: los conductores se fabrican de Cu o Al de alta pureza y recocidos. En los metales ρ sube con T; en los semiconductores baja.</span>`);}});

/* T13 · Semiconductores y nivel de Fermi */
SIMS.semiconductor=el=>build(el,{w:660,h:400,
 selects:[{k:'t',v:'n',l:'tipo',opts:[['i','intrínseco (Si puro)'],['n','tipo n (dopado con P)'],['p','tipo p (dopado con B)']]}],
 sliders:[{k:'logN',v:22,min:18,max:24,step:0.2,l:'dopantes 10^x',u:'át/m³'},{k:'T',v:300,min:200,max:600,step:10,l:'temperatura',u:'K'}],
 draw(a){a.clear();
  const Eg=1.1,k=8.62e-5,T=a.st.T,q=1.602e-19;
  const ni=1.5e16*Math.pow(T/300,1.5)*Math.exp(-Eg/2*(1/(k*T)-1/(k*300)));
  const N=Math.pow(10,a.st.logN);
  const mue=0.135*Math.pow(300/T,1.5), muh=0.048*Math.pow(300/T,1.5);
  let n,p,sigma,EF,tipo;
  if(a.st.t==='i'){n=ni;p=ni;sigma=ni*q*(mue+muh);EF=Eg/2;tipo='intrínseco';}
  else if(a.st.t==='n'){n=(N+Math.sqrt(N*N+4*ni*ni))/2;p=ni*ni/n;sigma=q*(n*mue+p*muh);EF=Eg-k*T*Math.log(2.8e25/n);tipo='tipo n';}
  else {p=(N+Math.sqrt(N*N+4*ni*ni))/2;n=ni*ni/p;sigma=q*(n*mue+p*muh);EF=k*T*Math.log(1.04e25/p);tipo='tipo p';}
  EF=Math.max(0.05,Math.min(Eg-0.05,EF));
  // diagrama de bandas
  const bx=60,bw=240,byC=96,byV=282;
  a.g.fillStyle=C.a;a.g.globalAlpha=0.16;a.g.fillRect(bx,byC-46,bw,46);a.g.fillStyle=C.f;a.g.fillRect(bx,byV,bw,46);a.g.globalAlpha=1;
  a.line(bx,byC,bx+bw,byC,C.a,2.5);a.line(bx,byV,bx+bw,byV,C.f,2.5);
  a.txt('banda de conducción (Ec)',bx,byC-54,C.a,12);a.txt('(Si, 300 K de referencia)',bx,byC-72,C.muted,11);
  a.txt('banda de valencia (Ev)',bx,byV+62,C.f,12);
  a.txt('Eg = 1,1 eV',bx+bw+10,(byC+byV)/2,C.muted,12);
  a.line(bx+bw,byC,bx+bw,byV,C.muted,1.2,[4,3]);
  const yEF=byV-(EF/Eg)*(byV-byC);
  a.line(bx-10,yEF,bx+bw+4,yEF,C.c,2,[7,4]);
  a.txt('EF = '+F(EF)+' eV',bx-14,yEF+4,C.c,12,'right');
  if(a.st.t==='n'){a.line(bx,byC+16,bx+bw,byC+16,C.b,1.5,[3,3]);a.txt('nivel donador',bx+4,byC+12,C.b,10);}
  if(a.st.t==='p'){a.line(bx,byV-16,bx+bw,byV-16,C.b,1.5,[3,3]);a.txt('nivel aceptor',bx+4,byV-20,C.b,10);}
  // portadores
  let seed=Math.round(a.st.logN*31+T)%97;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
  const ne=Math.min(22,Math.max(1,Math.round(Math.log10(n)-14))), np=Math.min(22,Math.max(1,Math.round(Math.log10(p)-14)));
  for(let i=0;i<ne;i++)a.circ(bx+10+rnd()*(bw-20),byC-10-rnd()*30,4,C.a,true);
  for(let i=0;i<np;i++){const X=bx+10+rnd()*(bw-20),Y=byV+10+rnd()*30;a.circ(X,Y,4,C.f,false);}
  a.txt('● electrones',bx,byV+86,C.a,11);a.txt('○ huecos',bx+110,byV+86,C.f,11);
  // sigma frente a 1/T
  const x0=370,y0=320,wv=250,hv=240;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  a.txt('1000/T (K⁻¹)  →  T más baja',x0+wv/2,y0+30,C.muted,11,'center');[600,400,300,200].forEach(TT=>{const X=x0+(1000/TT-1000/600)/(1000/200-1000/600)*wv;a.line(X,y0,X,y0-5,C.muted,1.2);a.txt(TT+' K',X,y0+15,C.muted,9,'center');});a.txt('ln σ',x0-6,y0-hv-8,C.muted,11);
  const sg=TT=>{const nii=1.5e16*Math.pow(TT/300,1.5)*Math.exp(-Eg/2*(1/(k*TT)-1/(k*300)));
    const mu1=0.135*Math.pow(300/TT,1.5),mu2=0.048*Math.pow(300/TT,1.5);
    if(a.st.t==='i')return nii*q*(mu1+mu2);
    const nn=a.st.t==='n'?(N+Math.sqrt(N*N+4*nii*nii))/2:nii*nii/((N+Math.sqrt(N*N+4*nii*nii))/2);
    const pp=a.st.t==='n'?nii*nii/nn:(N+Math.sqrt(N*N+4*nii*nii))/2;
    return q*(nn*mu1+pp*mu2);};
  const lmin=Math.log(sg(200)),lmax=Math.log(sg(600));
  const lo=Math.min(lmin,lmax)-1,hi=Math.max(lmin,lmax)+1;
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  for(let TT=200;TT<=600;TT+=4){const X=x0+(1000/TT-1000/600)/(1000/200-1000/600)*wv;
    const Y=y0-(Math.log(sg(TT))-lo)/(hi-lo)*hv;TT===200?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  const Xc=x0+(1000/T-1000/600)/(1000/200-1000/600)*wv, Yc=y0-(Math.log(sigma)-lo)/(hi-lo)*hv;
  a.circ(Xc,Yc,6,C.c,true);
  a.txt(a.st.t==='i'?'pendiente = −Eg/2k (así se mide el gap)':'zona extrínseca: n ≈ N fijo; σ sube al bajar T porque crece la movilidad',x0+4,y0-hv+14,C.muted,10);
  a.html(`<b>Silicio ${tipo}</b> a ${F(T)} K: n<sub>i</sub> = ${ni.toExponential(2).replace('.',',')} m⁻³.<br>
  n = <b>${n.toExponential(2).replace('.',',')} m⁻³</b> · p = <b>${p.toExponential(2).replace('.',',')} m⁻³</b> (comprobación n·p = ${(n*p).toExponential(2).replace('.',',')} ≈ n<sub>i</sub>² = ${(ni*ni).toExponential(2).replace('.',',')} ✓).<br>
  σ = q(n·µ<sub>e</sub> + p·µ<sub>h</sub>) = <b>${sigma.toExponential(3).replace('.',',')} S/m</b> ⇒ ρ = ${(1/sigma).toExponential(2).replace('.',',')} Ω·m.<br>
  Nivel de Fermi a <b>${F(EF)} eV</b> sobre la banda de valencia (${a.st.t==='i'?'en el centro del gap':(a.st.t==='n'?'desplazado hacia la banda de conducción':'desplazado hacia la banda de valencia')}).<br>
  ${a.st.t!=='i'?'Frente al Si puro, el dopado multiplica la conductividad por <b>'+F(sigma/(ni*q*(mue+muh)))+'</b>.':''}
  <span class="hint">En el intrínseco la exponencial lleva Eg/2kT; por eso la pendiente de ln σ frente a 1/T da el gap. En el extrínseco hay un plateau: todos los dopantes ionizados y aún sin generación intrínseca — ahí trabajan los dispositivos.</span>`);}});

/* T14 · Dieléctricos: permitividad, frecuencia y ruptura */
SIMS.dielectrico=el=>build(el,{w:660,h:390,
 selects:[{k:'m',v:'mica',l:'dieléctrico',opts:[['aire','aire (εr 1,0 · 3 kV/mm)'],['papel','papel impregnado (3,0 · 15)'],['mica','mica (6,0 · 60)'],['pe','polietileno (2,3 · 25)'],['agua','agua (80 · 0,5)'],['bat','titanato de bario (1500 · 8)']]}],
 sliders:[{k:'logf',v:2,min:0,max:12,step:0.2,l:'frecuencia 10^x',u:'Hz'},{k:'V',v:100,min:10,max:3000,step:10,l:'tensión aplicada',u:'V'},{k:'d',v:0.1,min:0.02,max:1,step:0.02,l:'espesor',u:'mm'}],
 draw(a){a.clear();
  const M={aire:[1.0,3,0.0001,[0,0,0,1]],papel:[3.0,15,0.005,[0.3,0.3,0.3,0.1]],mica:[6.0,60,0.0004,[0,0.4,0.5,0.1]],
   pe:[2.3,25,0.0002,[0,0,0.3,0.7]],agua:[80,0.5,0.1,[0,0.9,0.05,0.05]],bat:[1500,8,0.02,[0.1,0.85,0.03,0.02]]};
  const m=M[a.st.m],er0=m[0],rig=m[1],td0=m[2],mec=m[3];
  const f=Math.pow(10,a.st.logf), V=a.st.V, d=a.st.d*1e-3, Ar=25e-4;
  // caida de mecanismos: carga espacial <10^3, orientacion <10^9, ionica <10^13, electronica siempre
  const act=[f<1e3?1:0, f<1e9?1:0, f<1e13?1:0, 1];
  const frac=mec[0]*act[0]+mec[1]*act[1]+mec[2]*act[2]+mec[3]*act[3];
  const er=1+(er0-1)*frac;
  const Cp=er*8.854e-12*Ar/d;
  const E=V/(a.st.d); // kV/mm -> V/mm /1000
  const Ekv=V/1000/a.st.d;
  const td=td0*(1+ (f>5e2&&f<5e3?3:0) + (f>5e8&&f<5e9?4:0));
  const P=2*Math.PI*f*Cp*V*V*td;
  // curva er frente a f
  const x0=70,y0=300,wv=540,hv=220;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  const px=lf=>x0+lf/12*wv, py=e=>y0-(e-1)/(Math.max(er0,2)-1)*hv;
  for(let i=0;i<=12;i+=2){a.line(px(i),y0,px(i),y0-hv,C.grid,1);a.txt('10'+['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰','¹¹','¹²'][i],px(i),y0+16,C.muted,10,'center');}
  a.txt('frecuencia (Hz)',x0+wv/2,y0+34,C.muted,12,'center');a.txt('εr',x0-40,y0-hv-8,C.muted,12);
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;a.g.beginPath();
  for(let lf=0;lf<=12;lf+=0.05){const ff=Math.pow(10,lf);
    const ac=[ff<1e3?1:0,ff<1e9?1:0,ff<1e13?1:0,1];
    const fr=mec[0]*ac[0]+mec[1]*ac[1]+mec[2]*ac[2]+mec[3]*ac[3];
    const ee=1+(er0-1)*fr;const X=px(lf),Y=py(ee);lf===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();
  ['carga espacial','orientación','iónica'].forEach((nm,i)=>{const lf=[3,9,13][i];if(lf<=12){
    a.line(px(lf),y0,px(lf),y0-hv,C.b,1.4,[5,4]);a.txt('cae '+nm,px(lf)-5,y0-hv+16+i*16,C.b,10,'right');}});
  const X=px(a.st.logf),Y=py(er);a.circ(X,Y,6,C.f,true);a.line(x0,Y,X,Y,C.f,1.2,[4,3]);
  a.txt('εr = '+F(er),X+8,Y-8,C.f,12);
  const ruptura=Ekv>rig;
  a.g.fillStyle=ruptura?C.a:C.c;a.g.globalAlpha=0.12;a.g.fillRect(430,40,190,70);a.g.globalAlpha=1;
  a.g.strokeStyle=ruptura?C.a:C.c;a.g.lineWidth=2;a.g.strokeRect(430,40,190,70);
  a.txt(ruptura?'¡RUPTURA DIELÉCTRICA!':'Campo admisible',445,66,ruptura?C.a:C.c,13);
  a.txt(F(Ekv)+' kV/mm de '+F(rig)+' kV/mm',445,90,C.text,12);
  a.html(`Condensador de 25 cm² y ${F(a.st.d)} mm con ${a.st.m}: C = εr·ε₀·A/d = <b>${(Cp*1e9).toFixed(3).replace('.',',')} nF</b> (εr efectivo ${F(er)} a ${f.toExponential(0).replace('+','')} Hz).<br>
  Energía almacenada U = ½CV² = <b>${(0.5*Cp*V*V*1e6).toFixed(2).replace('.',',')} µJ</b> · campo E = V/d = <b>${F(Ekv)} kV/mm</b> frente a los ${F(rig)} kV/mm de rigidez ⇒ ${ruptura?'<b>se perfora</b>: hay que aumentar el espesor o cambiar de dieléctrico.':'factor de seguridad '+F(rig/Ekv)+'.'}<br>
  Pérdidas P = 2πfCV²·tanδ = <b>${P>1?F(P)+' W':(P*1e6).toFixed(1).replace('.',',')+' µW'}</b> con tanδ = ${td.toFixed(4).replace('.',',')}.<br>
  <span class="hint">εr baja a tramos al subir la frecuencia: cada mecanismo de polarización deja de poder seguir al campo y en esa caída aparece un pico de pérdidas. Es lo que calienta la comida en el microondas (orientación del agua a 2,45 GHz).</span>`);}});

/* T15 · Ciclo de histéresis magnética */
SIMS.magnetico=el=>build(el,{w:660,h:400,
 selects:[{k:'m',v:'fesi',l:'material',opts:[['fesi','Fe-Si (blando, transformadores)'],['ferritab','ferrita blanda (alta frecuencia)'],['acero','acero al carbono'],['alnico','alnico (imán)'],['ndfeb','NdFeB (imán potente)']]}],
 sliders:[{k:'f',v:50,min:50,max:2000,step:50,l:'frecuencia',u:'Hz'},{k:'V',v:1.5,min:0.1,max:5,step:0.1,l:'volumen del núcleo',u:'dm³'}],
 draw(a){a.clear();
  // [Bs(T), Br(T), Hc(A/m), mur, area(J/m3), rho(uohm m)]
  const M={fesi:[2.0,1.2,40,4000,120,0.5],ferritab:[0.45,0.2,20,2000,30,1e7],acero:[2.1,1.0,800,500,900,0.2],
   alnico:[1.25,1.1,50000,4,25000,0.5],ndfeb:[1.45,1.3,900000,1.05,350000,1.4]};
  const m=M[a.st.m],Bs=m[0],Br=m[1],Hc=m[2],area=m[4],rho=m[5];
  const f=a.st.f,V=a.st.V*1e-3;
  const x0=60,y0=380,cx=240,cy=210,wv=360,hv=300;
  const Hm=Hc*2.2;
  const px=H=>cx+H/Hm*(wv/2), py=B=>cy-B/(Bs*1.15)*(hv/2);
  a.line(px(-Hm),cy,px(Hm),cy,C.muted,1.5);a.line(cx,py(-Bs*1.15),cx,py(Bs*1.15),C.muted,1.5);
  a.txt('H (A/m)',px(Hm)-8,cy+20,C.muted,11,'right');a.txt('B (T)',cx+8,py(Bs*1.15)+12,C.muted,11);
  const lazo=(sg)=>{a.g.beginPath();
    for(let i=0;i<=200;i++){const H=-Hm+2*Hm*i/200;
      const B=Bs*Math.tanh((H+sg*Hc)/(Hc*0.85));
      const X=px(H),Y=py(B);i===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);}a.g.stroke();};
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;lazo(1);lazo(-1);
  // relleno del area
  a.g.fillStyle=C.a;a.g.globalAlpha=0.10;a.g.beginPath();
  for(let i=0;i<=200;i++){const H=-Hm+2*Hm*i/200;a.g.lineTo(px(H),py(Bs*Math.tanh((H+Hc)/(Hc*0.85))));}
  for(let i=200;i>=0;i--){const H=-Hm+2*Hm*i/200;a.g.lineTo(px(H),py(Bs*Math.tanh((H-Hc)/(Hc*0.85))));}
  a.g.closePath();a.g.fill();a.g.globalAlpha=1;
  a.circ(cx,py(Br),5,C.f,true);a.txt('Br = '+F(Br)+' T',cx+10,py(Br)-8,C.f,12);
  a.circ(px(-Hc),cy,5,C.c,true);a.txt('Hc = '+(Hc>=1000?F(Hc/1000)+' kA/m':F(Hc)+' A/m'),px(-Hc)-8,cy+18,C.c,12,'right');
  a.line(px(-Hm),py(Bs),px(Hm),py(Bs),C.b,1.2,[5,4]);a.txt('Bs = '+F(Bs)+' T',px(Hm)-6,py(Bs)-6,C.b,11,'right');
  const Ph=f*area*V;
  const kF=(a.st.m==='ferritab')?1e-6:1;
  const Pf=kF*2.2e-3*f*f*V*1e3/Math.max(rho,0.05)*0.02;
  const blando=Hc<2000;
  a.txt(blando?'MAGNÉTICAMENTE BLANDO':'MAGNÉTICAMENTE DURO (imán)',470,60,blando?C.c:C.a,13,'center');
  a.txt(blando?'núcleos, transformadores, motores':'imanes permanentes',470,80,C.muted,11,'center');
  [['µr',m[3],4200],['área del ciclo (J/m³)',area,350000],['Hc (A/m)',Hc,900000]].forEach((d,i)=>{
    a.txt(d[0]+': '+(d[1]>=10000?d[1].toExponential(1).replace('.',','):F(d[1])),390,120+i*52,C.text,12);
    Barra(a,390,128+i*52,170,16,Math.log10(Math.max(d[1],1))/Math.log10(d[2]),blando?C.c:C.a);});
  a.html(`<b>${{fesi:'Fe-Si',ferritab:'Ferrita blanda',acero:'Acero al carbono',alnico:'Alnico',ndfeb:'NdFeB'}[a.st.m]}</b>: Bs = ${F(Bs)} T · Br = ${F(Br)} T · Hc = ${Hc>=1000?F(Hc/1000)+' kA/m':F(Hc)+' A/m'} · µr = ${F(m[3])}.<br>
  Pérdidas por <b>histéresis</b> = f · área · V = ${F(f)} · ${F(area)} · ${F(V*1000)}·10⁻³ = <b>${F(Ph)} W</b>.<br>
  Pérdidas por <b>Foucault</b> (estimación, chapa de 0,35 mm) ≈ <b>${Pf<0.01?'despreciables':F(Pf)+' W'}</b> ∝ f²B²t²/ρ.<br>
  Para B = 1 T hace falta H = B/(µ₀µr) = <b>${F(1/(4*Math.PI*1e-7*m[3]))} A/m</b>.<br>
  <span class="hint">${blando?'Ciclo estrecho = pocas pérdidas por ciclo: lo que se busca en un núcleo. Las ferritas, al ser aislantes, eliminan las pérdidas de Foucault y se usan a alta frecuencia.':'Ciclo ancho: cuesta mucho desmagnetizarlo, así que conserva su campo. Se juzga por el producto energético (BH)max.'}</span>`);}});

/* T16 · Par galvánico y protección */
SIMS.corrosion=el=>build(el,{w:660,h:400,
 selects:[{k:'m1',v:'acero',l:'metal 1 (pieza grande)',opts:[['mg','magnesio'],['zn','cinc'],['al','aluminio'],['acero','acero al carbono'],['pb','plomo'],['sn','estaño'],['cu','cobre'],['laton','latón'],['inox','inoxidable 316 (pasivo)'],['ti','titanio'],['grafito','grafito']]},
  {k:'m2',v:'cu',l:'metal 2 (pieza pequeña)',opts:[['mg','magnesio'],['zn','cinc'],['al','aluminio'],['acero','acero al carbono'],['pb','plomo'],['sn','estaño'],['cu','cobre'],['laton','latón'],['inox','inoxidable 316 (pasivo)'],['ti','titanio'],['grafito','grafito']]}],
 sliders:[{k:'r',v:20,min:1,max:100,step:1,l:'área del metal 2 respecto al 1',u:'%'}],
 draw(a){a.clear();
  const S=[['mg','magnesio',-1.6],['zn','cinc',-1.0],['al','aluminio',-0.8],['acero','acero al carbono',-0.6],
   ['pb','plomo',-0.3],['sn','estaño',-0.28],['laton','latón',-0.2],['cu','cobre',-0.15],
   ['inox','inoxidable 316 pasivo',0.0],['ti','titanio',0.1],['grafito','grafito',0.25]];
  const get=k=>S.find(s=>s[0]===k);
  const A1=get(a.st.m1),A2=get(a.st.m2);
  // serie galvanica
  const x0=60,y0=70;
  a.txt('Serie galvánica en agua de mar',x0,y0-16,C.text,13);
  a.txt('activo (ánodo)',x0,y0+6,C.muted,10);a.txt('noble (cátodo)',x0,y0+300,C.muted,10);
  S.forEach((s,i)=>{const Y=y0+24+i*25;
    const sel=(s[0]===a.st.m1||s[0]===a.st.m2);
    a.line(x0,Y,x0+16,Y,sel?C.a:C.grid,sel?3:2);
    a.txt(s[1],x0+24,Y+4,sel?C.text:C.muted,sel?12:11);
    if(s[0]===a.st.m1)a.txt('◀ metal 1',x0+190,Y+4,C.f,11);
    if(s[0]===a.st.m2)a.txt('◀ metal 2',x0+190,Y+4,C.c,11);});
  // esquema
  const bx=330,by=70;
  const elx=bx, ely=by+150, elw=290, elh=100;
  a.g.fillStyle=C.grid;a.g.globalAlpha=0.30;a.g.fillRect(elx,ely,elw,elh);a.g.globalAlpha=1;
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.2;a.g.strokeRect(elx,ely,elw,elh);
  a.txt('electrolito (agua de mar)',elx+6,ely+elh+18,C.muted,11);
  const anodo = A1[2]<A2[2] ? 1 : (A1[2]>A2[2] ? 2 : 0);
  const ratio=a.st.r/100;
  const w1=120,w2=Math.max(12,120*ratio);
  const x1=elx+20, x2=elx+200;
  const top=by+60, hgt=150;
  Box(a,x1,top,w1,hgt,'',anodo===1?C.a:C.c);
  a.txt(A1[1].split(' ')[0],x1+w1/2,top-10,anodo===1?C.a:C.c,12,'center');
  Box(a,x2,top,w2,hgt,'',anodo===2?C.a:C.c);
  a.txt(A2[1].split(' ')[0],x2+w2/2,top-26,anodo===2?C.a:C.c,12,'center');
  a.line(x1+w1/2,top,x1+w1/2,top-40,C.text,2);
  a.line(x2+w2/2,top,x2+w2/2,top-40,C.text,2);
  a.line(x1+w1/2,top-40,x2+w2/2,top-40,C.text,2);
  a.txt('contacto eléctrico',(x1+x2)/2-10,top-48,C.muted,11,'center');
  if(anodo){const xa=anodo===1?x1+w1/2:x2+w2/2, xc=anodo===1?x2+w2/2:x1+w1/2;
    a.arrow(xa,ely+22,xa,ely+58,C.a,2.5);
    a.txt('se corroe',xa,ely+16,C.a,11,'center');
    a.txt('M → Mⁿ⁺ + ne⁻',elx+6,ely+92,C.a,11);
    a.txt('O₂+2H₂O+4e⁻ → 4OH⁻',elx+150,ely+92,C.c,11);
    a.circ(xc,ely+40,5,C.c,false);a.txt('e⁻',xc+8,ely+44,C.c,11);}
  const dE=Math.abs(A1[2]-A2[2]);
  const nomA=anodo===1?A1[1]:(anodo===2?A2[1]:'ninguno'), nomC=anodo===1?A2[1]:A1[1];
  const areaAn=anodo===1?1:ratio, areaCa=anodo===1?ratio:1;
  const factor=areaCa/areaAn;
  const riesgo=dE<0.15?'bajo (poca fem: la corrosión galvánica será lenta)':(dE<0.4?'moderado':'<b>alto</b>');
  a.html(`fem del par ≈ <b>${F(dE)} V</b>. ${anodo?'Se corroe el <b>'+nomA+'</b> (ánodo) y queda protegido el '+nomC+' (cátodo).':'Mismo metal: no hay par galvánico.'}<br>
  Riesgo por la fem: ${riesgo}. Efecto de las áreas: relación cátodo/ánodo = <b>${F(factor)}</b> ⇒ ${factor>3?'<b>situación peligrosa</b>: ánodo pequeño con cátodo grande, la densidad de corriente se concentra y la perforación es rápida.':(factor<0.4?'favorable: ánodo grande, el ataque se reparte y es lento.':'aceptable.')}<br>
  Soluciones: aislar eléctricamente los dos metales, elegir metales próximos en la serie, invertir las áreas (pieza grande activa y elemento pequeño noble), pintar el <b>cátodo</b> (nunca solo el ánodo) o añadir ánodos de sacrificio de Zn o Mg.<br>
  <span class="hint">Un tornillo de acero en una chapa de cobre falla en semanas; un tornillo de cobre en una chapa de acero aguanta años. Es el mismo par con las áreas al revés.</span>`);}});

document.querySelectorAll('[data-sim]').forEach(el=>{const f=SIMS[el.dataset.sim];if(f)f(el);});
})();
