(() => {
  'use strict';
  const F=window.FarmCore, E=window.FarmEnvironment, C=window.FarmCamera, WORLD=C.world, $=id=>document.getElementById(id), canvas=$('farm'), ctx=canvas.getContext('2d');
  const keys=new Set(), reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const game={time:0,ambient:0,running:false,paused:false,finished:false,reduced:reducedQuery.matches,cut:new Set(),harvestIndex:0,last:0,player:{x:410,y:650,walk:0,angle:0},zoom:1,targetZoom:1,camera:{x:innerWidth<760?680:600,y:380},pan:null,assetReady:false,cloudReady:false};
  let hemisphere='south';try{hemisphere=localStorage.getItem('love-farm-hemisphere')==='north'?'north':'south';}catch{}
  let environment=E.at(new Date(),hemisphere),lastEnvironmentMinute=-1;
  let W=innerWidth,H=innerHeight,DPR=1,scale=1,offsetX=0,offsetY=0,lastCaption='',lastPercent=-1,planeAngle=0,tractorAngle=0;
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const angleLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  function layer(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  function rect(c,x,y,w,h,color,r=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
  function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();}
  function radial(c,x,y,r,inside,outside){const g=c.createRadialGradient(x-r*.15,y-r*.2,0,x,y,r);g.addColorStop(0,inside);g.addColorStop(1,outside);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  const ground=layer(WORLD.width,WORLD.height),gctx=ground.getContext('2d'),crops=layer(1200,760),cropCtx=crops.getContext('2d'),smokeLayer=layer(1200,760),smokeCtx=smokeLayer.getContext('2d'),smokeShadowLayer=layer(1200,760),smokeShadowCtx=smokeShadowLayer.getContext('2d');
  gctx.fillStyle='#49623a';gctx.fillRect(0,0,WORLD.width,WORLD.height);
  const background=new Image();
  background.onload=()=>{gctx.drawImage(background,0,0,WORLD.width,WORLD.height);game.assetReady=true;$('loading').classList.add('loaded');};
  background.onerror=()=>{$('loading').textContent='Não foi possível carregar a paisagem. Recarregue a página.';};
  background.src='assets/farm-world.webp';
  // Draw vegetation once at high resolution. Harvest updates only the touched cell.
  function flower(c,x,y,r,seed){
    ellipse(c,x+1,y+1,r*2.5,r*1.9,'#14282055');
    for(let j=0;j<3;j++){const a=seed+j*2.1;c.save();c.translate(x,y);c.rotate(a);ellipse(c,r*1.7,0,r*1.8,r*.65,['#3a5e2b','#506e36','#72904a'][j]);c.restore();}
    const palette=['#7ca9d4','#93c4e9','#5e91c6','#a1c8e6'];
    for(let i=0;i<5;i++){const a=i*6.283/5+seed;ellipse(c,x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,r*.73,r*.73,palette[Math.floor(seed)%4]);}
    ellipse(c,x,y,r*.4,r*.4,'#e8cb6f');ellipse(c,x-.18,y-.18,r*.17,r*.17,'#fce5a4');
  }
  function seedField(){
    cropCtx.clearRect(0,0,1200,760);const f=F.field;
    for(let r=0;r<7;r++)for(let col=0;col<f.cols;col++){
      const x=f.x+col*f.cellW,y=f.y+r*f.cellH,n=r*100+col;
      rect(cropCtx,x,y,f.cellW,f.cellH,'#324829c9');
      for(let j=0;j<14;j++){
        const fx=x+1+noise(n*71+j)*Math.max(1,f.cellW-2),fy=y+1+noise(n*13+j+980)*(f.cellH-2);
        flower(cropCtx,fx,fy,.6+noise(n*31+j)*.75,n+j);
      }
      line(cropCtx,[[x,y+f.cellH-1],[x+f.cellW,y+f.cellH-1]],'#17291c4a',1);
    }
  }
  function cutCell(p){
    if(!p.cut)return;const key=p.row+','+p.col;if(game.cut.has(key))return;game.cut.add(key);
    const f=F.field,x=f.x+p.col*f.cellW,y=f.y+p.row*f.cellH;
    cropCtx.clearRect(x,y,f.cellW,f.cellH);rect(cropCtx,x,y,f.cellW,f.cellH,'#b9a171dc');
    for(let j=0;j<48;j++){const px=x+noise(j+p.row*43+p.col*107)*f.cellW,py=y+noise(j+872+p.col)*f.cellH;line(cropCtx,[[px,py],[Math.min(x+f.cellW,px+2),py+.4]],['#dec88c88','#72643e77','#d8bd8555'][j%3],.6);}
  }
  seedField();
  // Soft overlapping light volumes create a cloud with transparent, irregular edges.
  function createCloud(seed){
    const c=layer(620,360),q=c.getContext('2d');
    for(let pass=0;pass<3;pass++)for(let i=0;i<37;i++){
      const x=100+noise(i+seed)*420,y=120+Math.sin(i*2.13)*44+noise(i+seed+800)*55,r=35+noise(i+seed+44)*57;
      if(pass===0)radial(q,x+15,y+25,r*1.12,'rgba(80,102,111,.13)','rgba(90,112,120,0)');
      else if(pass===1)radial(q,x,y,r,'rgba(232,236,231,.49)','rgba(240,242,238,0)');
      else radial(q,x-13,y-13,r*.74,'rgba(255,255,247,.47)','rgba(255,255,249,0)');
    }
    return c;
  }
  const clouds=[{image:createCloud(4),x:-365,y:-100,s:1.05,speed:2.5},{image:createCloud(92),x:920,y:-135,s:1.05,speed:-2},{image:createCloud(238),x:1100,y:470,s:1,speed:-1.8}];
  function cacheCloudShadow(c){c.shadow=layer(620,360);const q=c.shadow.getContext('2d');q.filter='brightness(0) blur(12px)';q.drawImage(c.image,0,0,620,360);}
  clouds.forEach(cacheCloudShadow);
  const cloudImage=new Image();
  cloudImage.onload=()=>{clouds.forEach((c,i)=>{const sprite=layer(620,360),q=sprite.getContext('2d');if(i===1){q.translate(620,0);q.scale(-1,1);}q.drawImage(cloudImage,0,0,620,360);c.image=sprite;cacheCloudShadow(c);});game.cloudReady=true;};
  cloudImage.src='assets/cloud.webp';
  const smokePuff=layer(40,40),sp=smokePuff.getContext('2d');radial(sp,20,20,18,'rgba(255,254,240,.65)','rgba(255,254,247,0)');radial(sp,18,17,11,'rgba(255,255,248,.65)','rgba(255,255,247,0)');
  const shadowPuff=layer(40,40),shadowPuffCtx=shadowPuff.getContext('2d');radial(shadowPuffCtx,20,20,19,'rgba(10,20,16,.26)','rgba(10,20,16,0)');
  let smokeIndex=0;
  function addSmoke(){const target=Math.floor(F.state(game.time).writing*F.smoke.length);for(;smokeIndex<target;smokeIndex++){const p=F.smoke[smokeIndex];if(!p.ink)continue;const sz=17+noise(smokeIndex)*7;smokeCtx.drawImage(smokePuff,p.x-sz/2,p.y-sz/2,sz,sz);smokeShadowCtx.drawImage(shadowPuff,p.x+22-sz,p.y+33-sz,sz*2,sz*2);}}
  function vehicleShadow(x,y,rx,ry){ctx.save();ctx.filter='blur(4px)';ellipse(ctx,x+9,y+10,rx,ry,'#11211770');ctx.restore();}
  function tractor(x,y,a){
    vehicleShadow(x,y,22,15);ctx.save();ctx.translate(x,y);ctx.rotate(a);
    for(const s of [-1,1]){
      rect(ctx,-17,s*13-5,18,10,'#202820',3);rect(ctx,17,s*10-3,10,6,'#242b23',2);
      for(let j=0;j<5;j++)line(ctx,[[-15+j*3,s*13-4],[-13+j*3,s*13+3]],'#505649',1);
      rect(ctx,-14,s*13-1,12,2,'#878875');
    }
    rect(ctx,-21,-11,42,22,'#314f31',4);
    const metal=ctx.createLinearGradient(0,-10,0,10);metal.addColorStop(0,'#b1bd73');metal.addColorStop(.3,'#7c914a');metal.addColorStop(1,'#3e572d');rect(ctx,3,-9,26,18,metal,4);
    rect(ctx,-16,-11,20,22,'#2f4238',3);rect(ctx,-13,-8,14,16,'#709085',2);poly(ctx,[[-12,-8],[1,-8],[1,2],[-12,-4]],'#b1c2acaa');line(ctx,[[-15,0],[2,0]],'#3d4e3c',2);
    rect(ctx,-18,-13,22,3,'#adba84',1);rect(ctx,10,-8,10,1,'#b4be7f');rect(ctx,24,-7,3,14,'#344935',1);
    for(let i=0;i<5;i++)line(ctx,[[24,-5+i*2.5],[28,-5+i*2.5]],'#728068',.7);
    ellipse(ctx,14,-4,2.5,2.5,'#293e2d');ellipse(ctx,13,-5,1,1,'#a0a790');
    rect(ctx,-31,-15,7,30,'#6e7150',2);line(ctx,[[-28,-14],[-28,14]],'#c1b783',1);ctx.restore();
  }
  function planeShape(c,shadow=false){
    const wing=shadow?'#16291b55':'#d8d7c6',edge=shadow?wing:'#8b9989';
    poly(c,[[-3,-5],[-16,-43],[-6,-45],[15,-5]],wing);poly(c,[[-3,5],[-16,43],[-6,45],[15,5]],wing);
    if(!shadow){line(c,[[-13,-36],[-4,-37]],'#a3503f',4);line(c,[[-13,36],[-4,37]],'#a3503f',4);line(c,[[2,-7],[-7,-39]],edge,1);line(c,[[2,7],[-7,39]],edge,1);}
    poly(c,[[-29,-3],[-40,-16],[-32,-17],[-19,-4]],wing);poly(c,[[-29,3],[-40,16],[-32,17],[-19,4]],wing);
    const body=shadow?wing:c.createLinearGradient(0,-7,0,7);if(!shadow){body.addColorStop(0,'#fff4d6');body.addColorStop(.45,'#e1e0ca');body.addColorStop(1,'#839184');}
    ellipse(c,-2,0,38,6,body);
    if(!shadow){rect(c,0,-5,14,10,'#3d625f',4);line(c,[[3,-4],[12,-1]],'#b5d0c388',2);rect(c,27,-4,7,8,'#a65c44',3);rect(c,-36,-2,15,4,'#9a5646',1);}
  }
  function airplane(p){
    const lift=p.lift||0;ctx.save();ctx.translate(p.x+8+lift*36,p.y+10+lift*53);ctx.rotate(p.a);ctx.scale(p.s,p.s);ctx.filter='blur('+Math.round(2+lift*5)+'px)';planeShape(ctx,true);ctx.restore();
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.scale(p.s,p.s);planeShape(ctx);
    const prop=game.running&&!game.reduced?Math.sin(game.time*65):.8;line(ctx,[[36,-14*prop],[36,14*prop]],'#dce3dccc',2);ellipse(ctx,36,0,2,2,'#6c7365');ctx.restore();
  }
  function planeState(dt){
    const t=game.time;let p;
    if(t<3)p={x:205+(game.running&&!game.reduced?Math.sin(t*32)*.4:0),y:236,a:0,s:.62,lift:0};
    else if(t<5){const k=(t-3)/2;p={x:F.lerp(205,387,k*k),y:236,a:0,s:.62,lift:0};}
    else if(t<7){const k=(t-5)/2;p={x:F.lerp(387,418,k),y:F.lerp(236,200,k),a:-.85,s:F.lerp(.62,.82,k),lift:k};}
    else if(t<23){const v=(t-7)/16*(F.smoke.length-1),i=Math.min(F.smoke.length-2,Math.floor(v)),a=F.smoke[i],b=F.smoke[i+1];p={x:F.lerp(a.x,b.x,v-i),y:F.lerp(a.y,b.y,v-i),a:Math.atan2(b.y-a.y,b.x-a.x),s:.82,lift:1};}
    else{const k=F.clamp((t-23)/5);p={x:F.lerp(847,1380,k),y:F.lerp(200,35,k),a:-.3,s:.82,lift:1};}
    planeAngle=angleLerp(planeAngle,p.a,Math.min(1,dt*12));p.a=planeAngle;return p;
  }
  function person(){
    const p=game.player;vehicleShadow(p.x,p.y,6,5);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
    const step=Math.sin(p.walk)*2.5;rect(ctx,-3+step,-6,6,3,'#313b34',1);rect(ctx,-3-step,3,6,3,'#313b34',1);
    ellipse(ctx,-2,0,6,9,'#647b72');ellipse(ctx,0,-8,2.3,2.7,'#c29d78');ellipse(ctx,0,8,2.3,2.7,'#c29d78');
    ellipse(ctx,1,0,7.5,7.5,'#776447');ellipse(ctx,0,-1,7,7,'#c6b079');ellipse(ctx,-.5,-1.5,4.5,4.5,'#dfc88d');ellipse(ctx,-1.5,-2.5,2,2,'#e6d39f');ctx.restore();
    if(game.ambient<12&&!game.running){ctx.save();ctx.globalAlpha=Math.max(0,1-game.ambient/12);ctx.font='9px Segoe UI';ctx.textAlign='center';ctx.fillStyle='#faf7e6';ctx.shadowColor='#12271c';ctx.shadowBlur=5;ctx.fillText('VOCÊ',p.x,p.y-22);ctx.restore();}
  }
  function sign(){ctx.save();ctx.shadowColor='#12201970';ctx.shadowBlur=3;ctx.shadowOffsetY=3;rect(ctx,653,376,131,19,'#c3b084',2);ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.font='8px Georgia';ctx.textAlign='center';ctx.fillStyle='#3e4d32';ctx.fillText('MIOSÓTIS · forget-me-not',718.5,389);ctx.restore();}
  function cloudPositions(){return clouds.map((c,i)=>({...c,x:c.x+(game.reduced?0:Math.sin(game.ambient*.016+i)*70)+game.ambient*(game.reduced?0:c.speed*.18)}));}
  function updateCamera(dt){
    const k=game.reduced?1:Math.min(1,dt*5);
    game.zoom=F.lerp(game.zoom,game.targetZoom,k);
    const follow=game.targetZoom>1.15&&!game.running;
    const cinemaX=W<760?(game.time<7?F.lerp(490,680,F.clamp(game.time/7)):680):600;
    const target=game.pan||(follow?game.player:{x:game.running?cinemaX:(W<760?680:600),y:380});
    const frame=C.frame(W,H,game.zoom,{x:F.lerp(game.camera.x,target.x,k),y:F.lerp(game.camera.y,target.y,k)});
    game.camera.x=frame.x;game.camera.y=frame.y;scale=frame.scale;offsetX=frame.offsetX;offsetY=frame.offsetY;
  }
  function updateEnvironment(force=false){
    const now=new Date(),minute=Math.floor(+now/60000);if(!force&&minute===lastEnvironmentMinute)return;
    environment=E.at(now,hemisphere);lastEnvironmentMinute=minute;
    $('season').textContent=environment.season;$('day-period').textContent=environment.light.period;
    $('local-clock').textContent=environment.clock;$('local-clock').dateTime=environment.date;
    $('day-icon').textContent=environment.light.daylight>.4?'☀':'☾';
    $('moon-icon').textContent=environment.moon.icon;$('moon-phase').textContent=environment.moon.name;
    $('moon-percent').textContent=Math.round(environment.moon.illumination*100)+'% iluminada';
    $('environment-summary').title='Horário local · '+environment.timezone+' · Hemisfério '+(hemisphere==='south'?'Sul':'Norte')+' · Ver detalhes';
    $('environment-details').textContent='Agora: '+environment.clock+' ('+environment.timezone+'). '+environment.moon.name+', com '+(environment.moon.illumination*100).toFixed(1).replace('.',',')+'% da face visível iluminada. Estação atual: '+environment.season.toLowerCase()+'.';
    $('hemisphere').value=hemisphere;
  }
  function applyEnvironment(){
    const d=environment.light.daylight,g=environment.light.golden;
    const seasonal={'Primavera':[244,255,235],'Verão':[255,249,217],'Outono':[249,224,188],'Inverno':[218,231,247]}[environment.season];
    const night=[65,83,125],rgb=seasonal.map((n,i)=>Math.round(F.lerp(night[i],n,d)*(i===2?1-g*.22:1)));
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb('+rgb.join(',')+')';ctx.fillRect(0,0,W,H);ctx.restore();
    if(d<.75){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=1-d;
      for(const p of [[218,431,43],[352,464,24],[390,647,25],[1005,648,24]]){radial(ctx,p[0],p[1],p[2],'rgba(255,190,84,.65)','rgba(255,149,49,0)');ellipse(ctx,p[0],p[1],1.4,1.4,'#ffe7ac');}
      ctx.restore();
    }
  }
  function render(dt){
    updateCamera(dt);ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
    ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);ctx.drawImage(ground,WORLD.x,WORLD.y,WORLD.width,WORLD.height);ctx.drawImage(crops,0,0);sign();
    const cloudList=cloudPositions();
    // Cloud shadows move with their clouds, at a lower elevation than the aircraft.
    for(const c of cloudList){ctx.save();ctx.globalAlpha=.16;ctx.drawImage(c.shadow,c.x+38,c.y+62,620*c.s,360*c.s);ctx.restore();}
    let tp;
    if(game.time<6)tp={x:387,y:604,angle:-Math.PI/2};
    else if(game.time<8){const t=(game.time-6)/2;tp={x:F.lerp(387,F.route[0].x,t),y:F.lerp(604,F.route[0].y,t),angle:Math.atan2(F.route[0].y-604,F.route[0].x-387)};}
    else if(game.time<=34)tp=F.routePosition(F.state(game.time).harvest);
    else{const end=F.routePosition(1),t=F.clamp((game.time-34)/2);tp={x:F.lerp(end.x,1006,t),y:F.lerp(end.y,640,t),angle:.6};}
    tractorAngle=angleLerp(tractorAngle,tp.angle,Math.min(1,dt*14));tractor(tp.x,tp.y,tractorAngle);person();
    if(game.time>7){ctx.drawImage(smokeShadowLayer,0,0);ctx.drawImage(smokeLayer,0,0);}
    const p=planeState(dt);if(p.x<1350)airplane(p);
    for(const c of cloudList){ctx.save();ctx.globalAlpha=game.running?.65:.87;ctx.drawImage(c.image,c.x,c.y,620*c.s,360*c.s);ctx.restore();}
    applyEnvironment();ctx.setTransform(DPR,0,0,DPR,0,0);
    const vignette=ctx.createRadialGradient(W*.45,H*.45,Math.min(W,H)*.2,W*.5,H*.5,Math.max(W,H)*.7);vignette.addColorStop(0,'#0c241500');vignette.addColorStop(1,'#0c241550');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
  }
  const obstacles=[{x:113,y:287,w:218,h:147},{x:F.field.x-7,y:F.field.y-7,w:F.field.cols*F.field.cellW+14,h:F.field.rows*F.field.cellH+14},{x:1034,y:434,w:135,h:201}];
  function move(dt){
    let dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
    if(!dx&&!dy)return;game.pan=null;const len=Math.hypot(dx,dy),p=game.player;dx=dx/len*95*dt;dy=dy/len*95*dt;
    const allowed=(x,y)=>!obstacles.some(o=>x>o.x-6&&x<o.x+o.w+6&&y>o.y-6&&y<o.y+o.h+6);
    const nx=F.clamp(p.x+dx,25,1175),ny=F.clamp(p.y+dy,30,722);if(allowed(nx,p.y))p.x=nx;if(allowed(p.x,ny))p.y=ny;p.angle=angleLerp(p.angle,Math.atan2(dy,dx),Math.min(1,dt*14));p.walk+=dt*13;
  }
  function updateUI(){
    const s=F.state(game.time),caption=game.time===0?'Tem uma surpresa crescendo por aqui.':s.caption;
    if(caption!==lastCaption){$('caption').textContent=caption;lastCaption=caption;}
    const percent=Math.round(s.progress*100);if(percent!==lastPercent){$('progress').style.width=percent+'%';document.querySelector('.progress-track').setAttribute('aria-valuenow',percent);lastPercent=percent;}
    if(s.done&&!game.finished){game.finished=true;game.running=false;$('harvest').disabled=false;$('harvest').innerHTML='<span>↻</span> Repetir a surpresa <span class="button-arrow">♡</span>';$('pause').disabled=true;$('scene-note').textContent='Hoje e em todas as primaveras.';document.querySelector('.action-dock').classList.add('is-finished');}
  }
  function tick(now){
    const dt=game.last?Math.min((now-game.last)/1000,.05):.016;game.last=now;
    if(!document.hidden&&!game.paused){game.ambient+=dt;move(dt);if(game.running){game.time=Math.min(F.duration,game.time+dt);if(game.time>=8){const index=F.routePosition(F.state(game.time).harvest).index;for(;game.harvestIndex<=index;game.harvestIndex++)cutCell(F.route[game.harvestIndex]);}addSmoke();}}
    updateEnvironment();updateUI();render(game.paused?0:dt);requestAnimationFrame(tick);
  }
  function start(){if(game.running)return;game.time=0;game.running=true;game.finished=false;game.paused=false;game.cut.clear();game.harvestIndex=0;smokeIndex=0;smokeCtx.clearRect(0,0,1200,760);smokeShadowCtx.clearRect(0,0,1200,760);seedField();game.targetZoom=1;game.pan=null;planeAngle=0;$('harvest').disabled=true;$('harvest').innerHTML='<span>♡</span> A surpresa está florescendo…';$('pause').disabled=false;$('pause').textContent='Ⅱ';$('scene-note').textContent='UM POUQUINHO DE AMOR, NO CÉU E NA TERRA.';document.querySelector('.action-dock').classList.remove('is-finished');canvas.focus({preventScroll:true});}
  $('harvest').addEventListener('click',start);
  $('pause').addEventListener('click',()=>{game.paused=!game.paused;$('pause').textContent=game.paused?'▷':'Ⅱ';$('pause').setAttribute('aria-label',game.paused?'Continuar sequência':'Pausar sequência');});
  function toggleMusic(open){const panel=$('music-panel');panel.hidden=!open;$('music').setAttribute('aria-expanded',String(open));if(open&&!$('spotify-player').src)$('spotify-player').src=$('spotify-player').dataset.src;}
  $('music').addEventListener('click',()=>toggleMusic($('music-panel').hidden));
  $('close-music').addEventListener('click',()=>toggleMusic(false));
  function setMotion(){$('motion').setAttribute('aria-pressed',String(game.reduced));$('motion').title=game.reduced?'Movimento reduzido ativado':'Reduzir movimentos decorativos';}
  $('motion').addEventListener('click',()=>{game.reduced=!game.reduced;setMotion();});setMotion();
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('game').requestFullscreen)await $('game').requestFullscreen();else $('fullscreen').title='O jogo já ocupa toda a janela';}catch{$('fullscreen').title='Use F11 no navegador para tela cheia';}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));resize();});
  function zoomBy(amount){game.targetZoom=F.clamp(game.targetZoom+amount,1,3);game.pan=null;}
  $('zoom-in').addEventListener('click',()=>zoomBy(.25));$('zoom-out').addEventListener('click',()=>zoomBy(-.25));$('reset-view').addEventListener('click',()=>{game.targetZoom=1;game.pan=null;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?.12:-.12);},{passive:false});
  const pointers=new Map();let drag=null,pinch=null;
  function gestureStart(){
    const list=[...pointers.values()];
    if(list.length===2){const a=list[0],b=list[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;pinch={distance:Math.hypot(b.x-a.x,b.y-a.y),zoom:game.targetZoom,worldX:(mx-offsetX)/scale,worldY:(my-offsetY)/scale};drag=null;}
    else if(list.length===1){drag={...list[0],cx:game.camera.x,cy:game.camera.y};pinch=null;}
    else{drag=null;pinch=null;}
  }
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gestureStart();});
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()];game.targetZoom=F.clamp(pinch.zoom*Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,pinch.distance),1,3);const f=C.frame(W,H,game.targetZoom,game.camera);game.pan={x:pinch.worldX-((a.x+b.x)/2-W/2)/f.scale,y:pinch.worldY-((a.y+b.y)/2-H*(W<760?.44:.5))/f.scale};}
    else if(drag)game.pan={x:drag.cx-(e.clientX-drag.x)/scale,y:drag.cy-(e.clientY-drag.y)/scale};
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,e=>{pointers.delete(e.pointerId);gestureStart();}));
  const controls=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']);
  window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(controls.has(key)&&!$('flower-dialog').open&&!$('environment-dialog').open&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();keys.add(key);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();pointers.clear();gestureStart();});document.addEventListener('visibilitychange',()=>{keys.clear();pointers.clear();gestureStart();game.last=0;updateEnvironment(true);});
  document.querySelectorAll('[data-key]').forEach(button=>{button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>keys.delete(button.dataset.key)));});
  $('flower-info').addEventListener('click',()=>{keys.clear();$('flower-dialog').showModal();});$('close-dialog').addEventListener('click',()=>$('flower-dialog').close());
  $('environment-summary').addEventListener('click',()=>{keys.clear();updateEnvironment(true);$('environment-dialog').showModal();});
  $('close-environment').addEventListener('click',()=>$('environment-dialog').close());
  $('hemisphere').addEventListener('change',()=>{hemisphere=$('hemisphere').value;try{localStorage.setItem('love-farm-hemisphere',hemisphere);}catch{}updateEnvironment(true);});
  function resize(){const bounds=$('game').getBoundingClientRect();W=bounds.width;H=bounds.height;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);render(.016);}
  window.addEventListener('resize',resize);if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);updateEnvironment(true);resize();requestAnimationFrame(tick);
  window.loveFarm=Object.freeze({snapshot:()=>({time:game.time,running:game.running,paused:game.paused,finished:game.finished,harvested:game.cut.size,player:{...game.player},assetReady:game.assetReady,cloudReady:game.cloudReady,zoom:game.zoom,environment:JSON.parse(JSON.stringify(environment)),camera:{x:game.camera.x,y:game.camera.y,scale,offsetX,offsetY},world:{...WORLD},viewport:{width:W,height:H}})});
})();
