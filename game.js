(() => {
  'use strict';
  const F = window.FarmCore, canvas = document.getElementById('farm'), ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const keys = new Set(), reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const game = { time:0, ambient:0, running:false, paused:false, finished:false, reduced:reducedQuery.matches, sound:false, cut:new Set(), player:{x:305,y:555,walk:0,face:1}, last:0 };
  let audio, nextNote = 0, lastCaption = '', lastPercent = -1;
  const colors = { grass:'#b5c791', leaf:'#728e60', dark:'#526d50', soil:'#9b8061', cream:'#f5e6bc', blue:'#7aa9e0' };
  const obstacles = [{x:79,y:324,w:216,h:157},{x:382,y:425,w:650,h:195},{x:83,y:580,w:159,h:76}];
  const noise = n => { const v = Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function rect(x,y,w,h,color,r=0){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function line(points,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
  function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
  function text(value,x,y,size,color,font='Georgia',align='center'){ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.textAlign=align;ctx.fillText(value,x,y);}
  function flower(x,y,size=1,seed=0){
    const sway = game.reduced ? 0 : Math.sin(game.ambient*1.7+seed)*1.3;
    line([[x,y+7*size],[x+sway,y]],'#5c8056',Math.max(.7,size));
    ellipse(x-2*size,y+5*size,3*size,1.5*size,'#789957');
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;ellipse(x+sway+Math.cos(a)*3*size,y+Math.sin(a)*3*size,2.5*size,2.7*size,seed%3===0?'#a1c6f0':'#7aabe4');}
    ellipse(x+sway,y,1.8*size,1.8*size,'#f7d56c');
  }
  function cloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(0,0,46,13,'#fff9e5a8');ellipse(-20,-9,22,15,'#fff9e5a8');ellipse(15,-15,26,19,'#fff9e5a8');ctx.restore();}
  function tree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(0,14,42,12,'#647e5020');line([[0,10],[0,-49]],'#8e8260',12);line([[0,-15],[-15,-39]],'#8e8260',6);ellipse(-23,-55,31,35,'#819c69');ellipse(19,-57,31,39,'#789565');ellipse(0,-85,33,32,'#8ca774');ellipse(-13,-86,20,23,'#9db783');for(let i=0;i<8;i++)ellipse(-27+noise(i+3)*54,-80+noise(i+42)*42,2.5,2.5,'#bdc990');ctx.restore();}
  function fence(x,y,count){line([[x,y+7],[x+count*24,y+7]],'#e2d6aa',5);line([[x,y+19],[x+count*24,y+19]],'#e2d6aa',5);for(let i=0;i<=count;i++){rect(x+i*24-3,y,6,32,'#f5e8c3',1);poly([[x+i*24-3,y],[x+i*24,y-5],[x+i*24+3,y]],'#f5e8c3');}}
  function house(){
    ellipse(187,480,127,20,'#71835428');
    rect(82,353,210,117,'#e9d5a8',4);rect(98,344,179,119,'#f8e8c4');
    for(let y=360;y<465;y+=13)line([[99,y],[278,y]],'#dfcda9',1);
    rect(246,296,20,47,'#c48b76');rect(242,293,28,8,'#d9a38b',2);
    poly([[60,354],[188,269],[308,354]],'#8b655d');
    poly([[69,347],[188,277],[301,347]],'#bc8072');
    for(let i=0;i<5;i++)line([[89+i*19,336-i*12],[286-i*18,336-i*12]],'#a76f64',2);
    line([[66,352],[188,274],[306,352]],'#e5b09a',5);
    rect(167,385,43,78,'#8d9f83',3);rect(176,397,24,31,'#c3d2b2',2);ellipse(202,438,2,2,'#e9d5a0');
    for(const x of [112,233]){rect(x,382,31,37,'#6c8d8d',2);rect(x+3,385,25,31,'#b7d5cd');line([[x+15,385],[x+15,416]],'#fff1d1',3);line([[x+3,400],[x+28,400]],'#fff1d1',3);rect(x-4,420,39,10,'#c39879',2);for(let i=0;i<5;i++)flower(x+i*7,415,.7,i);}
    rect(157,462,65,8,'#c5b38a',2);rect(149,470,81,7,'#d8c69c',2);
    text('♡',188,370,24,'#b98179');
    rect(78,475,22,30,'#c09073',3);ellipse(89,474,17,9,'#7d9867');
    rect(276,475,22,30,'#c09073',3);ellipse(287,474,17,9,'#7d9867');
  }
  function garden(){
    rect(83,580,159,77,'#a28a69',10);rect(89,587,147,63,'#829863',7);
    for(let i=0;i<42;i++)flower(96+noise(i+10)*132,592+noise(i+115)*49,1.1,i);
    line([[163,644],[163,687]],'#9e8969',5);rect(97,655,132,30,'#f1e5c4',4);text('forget-me-not',163,674,12,'#5e7358');
    ellipse(75,673,17,6,'#78834b22');
  }
  function windmill(){
    poly([[1070,343],[1081,260],[1100,260],[1116,343]],'#d4c7a0');rect(1068,337,51,7,'#b9ac8c',2);ellipse(1090,259,7,7,'#8c9274');
    const a=game.reduced? .4:game.ambient*.25;
    ctx.save();ctx.translate(1090,259);ctx.rotate(a);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);rect(4,-4,51,8,'#f6ebcf',2);rect(26,-5,30,15,'#eadfbe',2);line([[5,0],[55,0]],'#aaa789',1);}ctx.restore();
  }
  function scene(){
    const sky=ctx.createLinearGradient(0,0,0,290);sky.addColorStop(0,'#b3d4d5');sky.addColorStop(1,'#e4e6c8');ctx.fillStyle=sky;ctx.fillRect(0,0,1200,760);
    ellipse(1047,98,39,39,'#f8ebba');ellipse(1047,98,51,51,'#f6e9b32b');
    cloud(155+(game.reduced?0:Math.sin(game.ambient*.07)*20),94,1.3);cloud(330,62,.7);cloud(943,172,.9);cloud(1125,63,.75);
    ctx.fillStyle='#a5bda0';ctx.beginPath();ctx.moveTo(0,260);ctx.bezierCurveTo(120,185,210,228,360,270);ctx.bezierCurveTo(560,167,710,209,875,268);ctx.bezierCurveTo(1040,199,1120,190,1200,246);ctx.lineTo(1200,380);ctx.lineTo(0,380);ctx.fill();
    ctx.fillStyle='#92ae88';ctx.beginPath();ctx.moveTo(0,300);ctx.bezierCurveTo(280,222,280,300,500,309);ctx.bezierCurveTo(800,218,1000,254,1200,290);ctx.lineTo(1200,410);ctx.lineTo(0,410);ctx.fill();
    rect(0,324,1200,436,colors.grass);ellipse(650,365,670,57,'#bed09b');
    for(let i=0;i<230;i++){const x=noise(i)*1200,y=342+noise(i+503)*380;line([[x,y],[x-2,y-3]],i%2?'#91aa7470':'#d6dfaf90',1.5);}
    // Winding paths connect the farmhouse, runway, flower garden and field.
    line([[184,474],[196,528],[288,558],[350,642],[760,659],[1030,651],[1207,709]],'#d2c594',39);
    line([[184,474],[196,528],[288,558],[350,642],[760,659],[1030,651],[1207,709]],'#e4d4a7',31);
    line([[318,370],[358,408],[351,622]],'#e0d1a5',23);
    rect(135,337,254,31,'#c3ba95',15);for(let i=0;i<9;i++)rect(146+i*27,351,13,2,'#ede5c5',1);
    fence(412,362,24);fence(35,519,4);fence(1045,423,5);fence(31,692,10);fence(856,697,13);
    tree(39,371,1.35);tree(335,316,.7);tree(1160,405,1.35);tree(1147,585,1.1);tree(48,619,.75);
    windmill();house();garden();
    ellipse(1014,338,37,10,'#7d975d33');rect(1007,303,10,37,'#ac9a70');ellipse(1009,291,33,27,'#829d6c');ellipse(993,277,23,22,'#96af76');
    // Little pond with an illustrated duck.
    ellipse(1061,638,57,31,'#8dac97');ellipse(1061,635,50,25,'#9fc2bf');line([[1034,632],[1060,632]],'#cee0cd',2);line([[1070,647],[1088,647]],'#cee0cd',2);ellipse(1070,628,11,6,'#fff1cf');ellipse(1076,619,6,7,'#fff1cf');poly([[1080,619],[1088,621],[1080,623]],'#d3a763');ellipse(1078,618,1,1,'#52644e');
    rect(318,475,5,34,'#987e64');rect(317,469,24,15,'#be8880',5);rect(324,471,2,10,'#e4b49d');
    for(let i=0;i<18;i++)flower(264+noise(i+223)*45,596+noise(i+350)*31,.8,i);
  }
  function crop(){
    const f=F.field;
    rect(f.x-14,f.y-15,f.cols*f.cellW+28,190,'#899b62',10);rect(f.x-8,f.y-8,f.cols*f.cellW+16,177,'#927d5e',7);
    for(let r=0;r<7;r++)for(let c=0;c<f.cols;c++){
      const x=f.x+c*f.cellW,y=f.y+r*f.cellH,cut=game.cut.has(r+','+c);
      rect(x,y,15,23,cut?'#eedbb0':(r%2?'#6e8854':'#758f59'));
      if(cut){line([[x+4,y+11],[x+4,y+8]],'#bfa579',1);line([[x+11,y+17],[x+11,y+14]],'#cfb586',1);}
      else {flower(x+7.5,y+9,.8,r*43+c);flower(x+3,y+18,.48,c);}
    }
    // A permanent specimen and a readable sign emphasize the blue flowers.
    line([[751,390],[751,421]],'#a18b65',5);rect(670,385,162,30,'#f6e8c6',4);text('MIOSÓTIS  ·  ❀',751,404,12,'#5e7157');
    for(let i=0;i<5;i++)flower(420+i*15,413,1,i);
  }
  function tractor(x,y,angle=0){
    ctx.save();ctx.translate(x,y);ctx.scale(Math.cos(angle)<0? -1:1,1);ellipse(0,11,29,8,'#40533e25');
    rect(-25,0,43,16,'#607b53',3);rect(2,-13,29,21,'#c7916d',4);rect(25,-11,7,17,'#e1b48a',2);rect(19,-24,4,15,'#646c56',1);
    rect(-17,-27,20,24,'#aec9b1',2);rect(-20,-31,27,5,'#597d5e',2);line([[-17,-27],[-17,-3]],'#5a7355',3);line([[2,-27],[2,-3]],'#5a7355',3);
    ellipse(-12,11,13,13,'#485548');ellipse(-12,11,7,7,'#dcbb84');ellipse(24,13,9,9,'#485548');ellipse(24,13,4,4,'#dcbb84');
    for(let i=0;i<8;i++){const a=i*Math.PI/4+(game.running?game.time*4:0);line([[-12+Math.cos(a)*10,11+Math.sin(a)*10],[-12+Math.cos(a)*12,11+Math.sin(a)*12]],'#7b7e60',2);}
    rect(-36,8,11,4,'#c49e70');line([[-36,7],[-36,17]],'#b8996c',2);ctx.restore();
  }
  function airplane(x,y,angle,scale=1){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
    ellipse(-4,13,28,4,'#748c6922');
    poly([[-7,-4],[-26,-29],[-12,-31],[15,-5]],'#b9786e');poly([[-8,4],[-24,30],[-10,32],[16,5]],'#cf9481');
    rect(-38,-6,66,12,'#f5dfaf',7);poly([[-27,-5],[-42,-19],[-31,-20],[-18,-5]],'#be8174');poly([[-30,4],[-41,16],[-30,18],[-18,4]],'#b97b71');
    ellipse(5,-3,9,5,'#7b9b9c');rect(27,-4,9,8,'#a27462',3);
    const prop=game.running&&!game.reduced?Math.cos(game.time*70):.9;line([[36,-17*prop],[36,17*prop]],'#7d8064',3);ellipse(36,0,2,2,'#eee4c2');ctx.restore();
  }
  function planeState(){
    const t=game.time;
    if(!game.running&&!game.finished&&t===0)return{x:211,y:347,a:0,s:.82};
    if(t<3)return{x:211+(game.reduced?0:Math.sin(t*25)),y:347,a:0,s:.82};
    if(t<5){const p=(t-3)/2;return{x:F.lerp(211,349,p*p),y:347,a:0,s:.82};}
    if(t<7){const p=(t-5)/2;return{x:F.lerp(349,418,p),y:F.lerp(347,200,p),a:-1.1,s:.82+p*.18};}
    if(t<23){const i=Math.min(F.smoke.length-2,Math.floor((t-7)/16*(F.smoke.length-1))),a=F.smoke[i],b=F.smoke[i+1];return{x:a.x,y:a.y,a:Math.atan2(b.y-a.y,b.x-a.x),s:.68};}
    const p=F.clamp((t-23)/5),last=F.smoke[F.smoke.length-1];return{x:F.lerp(last.x,1320,p),y:F.lerp(last.y,64,p),a:-.3,s:.68};
  }
  function skywriting(){
    const count=Math.floor(F.state(game.time).writing*F.smoke.length);
    if(count===0)return;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(let layer=0;layer<2;layer++){
      ctx.strokeStyle=layer?'#fff9e8':'#7899a345';ctx.lineWidth=layer?10:16;ctx.beginPath();let pen=false;
      for(let i=0;i<count;i++){const p=F.smoke[i];if(!p.ink){pen=false;continue;}if(!pen){ctx.moveTo(p.x,p.y);pen=true;}else ctx.lineTo(p.x,p.y);}ctx.stroke();
    }
    for(let i=0;i<count;i+=5){const p=F.smoke[i];if(p.ink)ellipse(p.x,p.y,5+noise(i)*2,5+noise(i)*2,'#fffdf040');}
    ctx.restore();
  }
  function person(){
    const p=game.player,step=Math.sin(p.walk)*3;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.face,1);ellipse(0,5,13,5,'#5e734c28');
    line([[-5,-2],[-5+step,6]],'#57685e',6);line([[5,-2],[5-step,6]],'#57685e',6);
    rect(-9,-23,18,23,'#c48979',5);rect(-7,-10,14,10,'#718b89',2);line([[-10,-18],[-13,-8+step]],'#e9c19a',5);line([[10,-18],[13,-8-step]],'#e9c19a',5);
    ellipse(0,-33,11,12,'#e5bd92');ellipse(4,-34,1.1,1.1,'#555a48');rect(-11,-42,22,8,'#7f6b52',3);ellipse(0,-43,19,5,'#e1c88e');rect(-11,-52,22,10,'#edd49a',4);rect(-11,-45,22,3,'#bca177');ctx.restore();
  }
  function decorations(){
    if(!game.reduced)for(let i=0;i<5;i++){
      const x=320+Math.sin(game.ambient*.38+i*1.7)*180,y=427+Math.cos(game.ambient*.7+i*2)*45,flap=2+Math.abs(Math.sin(game.ambient*7+i))*3;
      ellipse(x-3,y,flap,3,'#f5e7baa8');ellipse(x+3,y,flap,3,'#e9cfb8b0');
    }
    if(game.time>33){for(let i=0;i<14;i++){const p=((game.time-33)*.12+i*.13)%1;const x=300+noise(i+444)*720,y=680-p*300;ctx.globalAlpha=Math.sin(p*Math.PI)*.6;text('♡',x,y,12+noise(i)*15,'#b87e7f');}ctx.globalAlpha=1;}
  }
  function render(){
    ctx.setTransform(canvas.width/1200,0,0,canvas.height/760,0,0);
    scene();crop();skywriting();
    const s=F.state(game.time);let tp;
    if(game.time<6)tp={x:322,y:622,angle:0};
    else if(game.time<8){const p=(game.time-6)/2;tp={x:F.lerp(322,F.route[0].x,p),y:F.lerp(622,F.route[0].y,p),angle:0};}
    else if(game.time<=34)tp=F.routePosition(s.harvest);
    else{const end=F.routePosition(1),p=F.clamp((game.time-34)/2);tp={x:F.lerp(end.x,1063,p),y:F.lerp(end.y,575,p),angle:0};}
    tractor(tp.x,tp.y,tp.angle);person();const ps=planeState();airplane(ps.x,ps.y,ps.a,ps.s);decorations();
  }
  function move(dt){
    let dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));
    let dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
    if(!dx&&!dy)return;const len=Math.hypot(dx,dy),p=game.player;
    dx=dx/len*110*dt;dy=dy/len*110*dt;
    const allowed=(x,y)=>!obstacles.some(o=>x>o.x-10&&x<o.x+o.w+10&&y>o.y-2&&y<o.y+o.h+14);
    const nx=F.clamp(p.x+dx,22,1178),ny=F.clamp(p.y+dy,380,710);
    if(allowed(nx,p.y))p.x=nx;if(allowed(p.x,ny))p.y=ny;
    if(dx)p.face=Math.sign(dx);p.walk+=dt*10;
  }
  function updateUI(){
    const s=F.state(game.time),caption=game.time===0?'Aqui, cada flor guarda um pouquinho de nós.':s.caption;
    if(caption!==lastCaption){$('caption').textContent=caption;lastCaption=caption;}
    const percent=Math.round(s.progress*100);
    if(percent!==lastPercent){$('progress').style.width=percent+'%';document.querySelector('.progress-track').setAttribute('aria-valuenow',percent);lastPercent=percent;}
    if(s.done&&!game.finished){game.finished=true;game.running=false;$('harvest').disabled=false;$('harvest').innerHTML='<span>↻</span> Repetir a surpresa';$('pause').disabled=true;$('scene-note').textContent='Uma lembrança para guardar. Um amor para cultivar.';}
  }
  function tone(freq,duration=.7,volume=.025){if(!audio||!game.sound)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0,audio.currentTime);gain.gain.linearRampToValueAtTime(volume,audio.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}
  function tick(now){
    const dt=game.last?Math.min((now-game.last)/1000,.05):0;game.last=now;
    if(!document.hidden&&!game.paused){game.ambient+=dt;move(dt);if(game.running){game.time=Math.min(F.duration,game.time+dt);if(game.time>=8){const index=F.routePosition(F.state(game.time).harvest).index;for(let i=game.harvestIndex||0;i<=index;i++){const p=F.route[i];if(p.cut)game.cut.add(p.row+','+p.col);}game.harvestIndex=index+1;}}}
    if(game.sound&&!game.paused&&!document.hidden&&game.ambient>nextNote){const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];tone(notes[Math.floor(game.ambient/1.8)%notes.length]);nextNote=game.ambient+1.8;}
    updateUI();render();requestAnimationFrame(tick);
  }
  function start(){
    if(game.running)return;game.time=0;game.running=true;game.finished=false;game.paused=false;game.cut.clear();game.harvestIndex=0;
    $('harvest').disabled=true;$('harvest').innerHTML='<span>♡</span> A surpresa está florescendo…';$('pause').disabled=false;$('pause').textContent='Pausar';$('scene-note').textContent='Cultivando um amor que floresce';canvas.focus({preventScroll:true});
  }
  $('harvest').addEventListener('click',start);
  $('pause').addEventListener('click',()=>{game.paused=!game.paused;$('pause').textContent=game.paused?'Continuar':'Pausar';});
  $('sound').addEventListener('click',async()=>{
    try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();await audio.resume();game.sound=!game.sound;$('sound').setAttribute('aria-pressed',String(game.sound));$('sound').innerHTML='♪ <span>Som '+(game.sound?'ligado':'desligado')+'</span>';if(game.sound)tone(523.25);}
    catch{$('sound').innerHTML='♪ <span>Som indisponível</span>';}
  });
  function setMotion(){ $('motion').setAttribute('aria-pressed',String(game.reduced));$('motion').textContent=game.reduced?'Movimento reduzido':'Movimento suave'; }
  $('motion').addEventListener('click',()=>{game.reduced=!game.reduced;setMotion();});setMotion();
  const controls=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']);
  window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(controls.has(key)&&!$('flower-dialog').open&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();keys.add(key);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  window.addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{keys.clear();game.last=0;});
  document.querySelectorAll('[data-key]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>keys.delete(button.dataset.key)));
  });
  $('flower-info').addEventListener('click',()=>{keys.clear();$('flower-dialog').showModal();});
  [$('close-dialog'),$('dialog-ok')].forEach(button=>button.addEventListener('click',()=>$('flower-dialog').close()));
  function resize(){const ratio=Math.min(window.devicePixelRatio||1,2),width=canvas.getBoundingClientRect().width;canvas.width=Math.round(width*ratio);canvas.height=Math.round(width*760/1200*ratio);render();}
  window.addEventListener('resize',resize);resize();requestAnimationFrame(tick);
  // Read-only snapshot for diagnostics and browser tests; it cannot change the scene.
  window.loveFarm=Object.freeze({snapshot:()=>({time:game.time,running:game.running,paused:game.paused,finished:game.finished,harvested:game.cut.size,player:{...game.player}})});
})();
