// Browser game: state, movement, scoring, canvas drawing, and input.
(()=>{
  'use strict';
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),N=20,C=32,$=id=>document.getElementById(id);
  let body=[],dir={
    x:1,y:0
  }
  ,queue=[],items=[],score=0,best=0,state='ready',growth=0,mode='cozy',last=0,acc=0,particles=[],sound=false,audio;
  try{
    // Keep scores from the game's previous name on the same browser origin.
    best=Math.max(Number(localStorage.getItem('cozy-sweep-best'))||0,Number(localStorage.getItem('sweep-sweet-best'))||0);
    localStorage.setItem('cozy-sweep-best',String(best))
  }
  catch{
  }
  $('best').textContent=String(best).padStart(3,'0');
  const vectors={
    up:{
      x:0,y:-1
    }
    ,down:{
      x:0,y:1
    }
    ,left:{
      x:-1,y:0
    }
    ,right:{
      x:1,y:0
    }
  }
  ;
  function reset(){
    body=[{
      x:8,y:10
    }
    ,{
      x:7,y:10
    }
    ,{
      x:6,y:10
    }
    ,{
      x:5,y:10
    }
    ];
    dir={
      x:1,y:0
    }
    ;
    queue=[];
    items=[];
    score=0;
    growth=0;
    particles=[];
    acc=0;
    for(let i=0;
    i<4;
    i++)spawn(i===3?'trash':'dirt');
    updateScore()
  }
  function spawn(type){
    const free=[];
    for(let y=0;
    y<N;
    y++)for(let x=0;
    x<N;
    x++)if(!body.some(p=>p.x===x&&p.y===y)&&!items.some(p=>p.x===x&&p.y===y))free.push({
      x,y
    }
    );
    if(!free.length)return;
    items.push({
      ...free[Math.floor(Math.random()*free.length)],type
    }
    )
  }
  function updateScore(){
    $('score').textContent=String(score).padStart(3,'0');
    if(score>best){
      best=score;
      try{
        localStorage.setItem('cozy-sweep-best',String(best))
      }
      catch{
      }
    }
    $('best').textContent=String(best).padStart(3,'0')
  }
  function overlay(title,text,button,note){
    $('overlay-title').textContent=title;
    $('overlay-text').textContent=text;
    $('play').textContent=button;
    $('overlay-note').textContent=note;
    $('overlay').classList.remove('hidden')
  }
  function start(){
    if(state!=='paused')reset();
    state='playing';
    acc=0;
    $('overlay').classList.add('hidden');
    $('pause').textContent='Ⅱ';
    $('pause').setAttribute('aria-label','Pause game');
    $('status').textContent=mode==='cozy'?'Soft edges. Endless possibilities.':'Watch the walls & your handle.';
    $('board').focus({
      preventScroll:true
    }
    )
  }
  function pause(){
    if(state==='playing'){
      state='paused';
      overlay('A little breather.','Your broom can wait. Take your time.','Keep sweeping →','Pick up right where you left off.');
      $('pause').textContent='▶';
      $('pause').setAttribute('aria-label','Resume game');
      $('status').textContent='Taking a breather'
    }
    else if(state==='paused')start()
  }
  function turn(d){
    if(state!=='playing')return;
    const v=vectors[d],prev=queue.length?queue[queue.length-1]:dir;
    if(v.x===-prev.x&&v.y===-prev.y)return;
    if(v.x===prev.x&&v.y===prev.y)return;
    if(queue.length<2)queue.push(v)
  }
  function tone(freq){
    if(!sound)return;
    try{
      audio=audio||new(window.AudioContext||window.webkitAudioContext)();
      audio.resume();
      let o=audio.createOscillator(),g=audio.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(freq,audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq*1.4,audio.currentTime+.1);
      g.gain.setValueAtTime(.06,audio.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);
      o.connect(g);
      g.connect(audio.destination);
      o.start();
      o.stop(audio.currentTime+.2)
    }
    catch{
    }
  }
  function end(win=false){
    state='over';
    tone(160);
    overlay(win?'Spotless. Spectacular.':'Oops, a little tangle.',win?'Every corner is clean. You swept the entire floor!':`You swept up ${score} points. Your broom deserves another little adventure.`, 'Sweep again ↻',`Personal best: ${best} · ${body.length} pieces of handle`);
    $('status').textContent=win?'A perfect clean!':'A fresh start is always lovely';
    $('pause').textContent='Ⅱ'
  }
  function tick(){
    if(queue.length)dir=queue.shift();
    let h={
      x:body[0].x+dir.x,y:body[0].y+dir.y
    }
    ;
    if(mode==='cozy'){
      h.x=(h.x+N)%N;
      h.y=(h.y+N)%N
    }
    else if(h.x<0||h.x>=N||h.y<0||h.y>=N){
      end();
      return
    }
    const index=items.findIndex(p=>p.x===h.x&&p.y===h.y),eaten=index>=0?items[index]:null;
    const gain=eaten?(eaten.type==='trash'?3:1):0;
    const collisionLength=body.length-((growth+gain)>0?0:1);
    if(body.slice(0,collisionLength).some(p=>p.x===h.x&&p.y===h.y)){
      end();
      return
    }
    body.unshift(h);
    growth+=gain;
    if(growth>0)growth--;
    else body.pop();
    if(eaten){
      items.splice(index,1);
      score+=eaten.type==='trash'?30:10;
      updateScore();
      tone(eaten.type==='trash'?750:540);
      for(let i=0;
      i<12;
      i++)particles.push({
        x:(h.x+.5)*C,y:(h.y+.5)*C,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,life:1,color:['#d8b5c8','#adc8a8','#e5cd9b'][i%3]
      }
      );
      spawn(eaten.type)
    }
    if(body.length===N*N)end(true)
  }
  function round(x,y,w,h,r,fill){
    ctx.fillStyle=fill;
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
    ctx.fill()
  }
  function dirt(x,y,t){
    ctx.save();
    ctx.translate((x+.5)*C,(y+.5)*C);
    if(t==='dirt'){
      ctx.fillStyle='#beab8e';
      for(const [dx,dy,r]of[[-6,3,3],[1,5,4],[7,2,2.5],[-2,-2,2],[6,-5,1.5],[-8,-5,1.4]]){
        ctx.beginPath();
        ctx.arc(dx,dy,r,0,Math.PI*2);
        ctx.fill()
      }
    }
    else{
      round(-10,-5,12,13,3,'#c8b5d4');
      ctx.save();
      ctx.rotate(.3);
      round(1,-10,10,15,2,'#d9bc9c');
      ctx.strokeStyle='#a9bfa8';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(-7,7);
      ctx.lineTo(6,7);
      ctx.lineTo(9,0);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle='#f4eaf6';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(-8,-2);
      ctx.lineTo(-3,2);
      ctx.lineTo(-7,5);
      ctx.stroke()
    }
    ctx.restore()
  }
  function draw(time){
    ctx.clearRect(0,0,640,640);
    ctx.fillStyle='#f1f4e9';
    ctx.fillRect(0,0,640,640);
    ctx.strokeStyle='#e5ebdc';
    ctx.lineWidth=1;
    for(let i=1;
    i<N;
    i++){
      ctx.beginPath();
      ctx.moveTo(i*C,0);
      ctx.lineTo(i*C,640);
      ctx.moveTo(0,i*C);
      ctx.lineTo(640,i*C);
      ctx.stroke()
    }
    for(const p of items)dirt(p.x,p.y,p.type);
    if(body.length){
      ctx.lineJoin='round';
      ctx.lineCap='round';
      for(let i=body.length-1;
      i>0;
      i--){
        let a=body[i],b=body[i-1];
        if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)>1)continue;
        ctx.strokeStyle='#c7a686';
        ctx.lineWidth=13;
        ctx.beginPath();
        ctx.moveTo((a.x+.5)*C,(a.y+.5)*C);
        ctx.lineTo((b.x+.5)*C,(b.y+.5)*C);
        ctx.stroke();
        ctx.strokeStyle='#ddc3a4';
        ctx.lineWidth=5;
        ctx.stroke()
      }
      for(let i=1;
      i<body.length;
      i++){
        let p=body[i];
        round(p.x*C+11,p.y*C+11,10,10,5,'#c7a686')
      }
      let h=body[0];
      ctx.save();
      ctx.translate((h.x+.5)*C,(h.y+.5)*C);
      ctx.rotate(Math.atan2(dir.y,dir.x)+Math.PI/2);
      ctx.fillStyle='#dfb785';
      ctx.beginPath();
      ctx.moveTo(-8,-4);
      ctx.lineTo(8,-4);
      ctx.lineTo(14,-14);
      ctx.quadraticCurveTo(0,-20,-14,-14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle='#bf9365';
      ctx.lineWidth=1.3;
      for(let j=-9;
      j<=9;
      j+=4){
        ctx.beginPath();
        ctx.moveTo(j*.65,-5);
        ctx.lineTo(j,-14);
        ctx.stroke()
      }
      round(-9,-5,18,7,2,'#a9bba2');
      ctx.fillStyle='#f3dec1';
      ctx.beginPath();
      ctx.arc(0,7,3,0,Math.PI*2);
      ctx.fill();
      ctx.restore()
    }
    for(const p of particles){
      ctx.globalAlpha=p.life;
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,3*p.life,0,Math.PI*2);
      ctx.fill()
    }
    ctx.globalAlpha=1
  }
  let prev=0;
  function frame(t){
    const dt=Math.min(t-prev||16,50);
    prev=t;
    if(state==='playing'){
      acc+=dt;
      const speed=mode==='cozy'?175:Math.max(80,145-Math.floor(score/60)*5);
      while(acc>=speed&&state==='playing'){
        tick();
        acc-=speed
      }
    }
    for(const p of particles){
      p.x+=p.vx;
      p.y+=p.vy;
      p.life-=dt/500
    }
    particles=particles.filter(p=>p.life>0);
    draw(t);
    requestAnimationFrame(frame)
  }
  $('play').onclick=start;
  $('pause').onclick=pause;
  $('restart').onclick=()=>{
    reset();
    state='ready';
    overlay('A fresh little start.','Sweep up dirt and trash. Keep clear of your growing handle.',"Let's sweep →",mode==='cozy'?'Cozy · wraparound edges':'Classic · solid walls')
  }
  ;
  $('mode').onchange=e=>{
    mode=e.target.value;
    reset();
    state='ready';
    overlay(mode==='cozy'?'Keep it cozy.':'A little challenge.',mode==='cozy'?'Drift through the edges and come back around. Just watch your handle.':'The walls are solid and the pace picks up. How much can you sweep?',"Let's sweep →",mode==='cozy'?'Gentle pace · wraparound edges':'Faster pace · solid walls')
  }
  ;
  $('sound').onclick=()=>{
    sound=!sound;
    $('sound').textContent=sound?'♫':'♪';
    $('sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');
    $('sound').style.background=sound?'#d4e9d9':'';
    if(sound)tone(600)
  }
  ;
  const keys={
    ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'
  }
  ;
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='SELECT')return;
    const k=keys[e.key]||keys[e.key.toLowerCase()];
    if(k){
      e.preventDefault();
      turn(k)
    }
    if(e.code==='Space'&&!['BUTTON','SELECT'].includes(e.target.tagName)){
      e.preventDefault();
      if(state==='ready'||state==='over')start();
      else pause()
    }
    if(e.key==='Escape'&&state==='playing')pause()
  }
  );
  document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{
    e.preventDefault();
    turn(b.dataset.dir)
  }
  ));
  let touchStart=null;
  $('board').addEventListener('pointerdown',e=>{
    touchStart={
      x:e.clientX,y:e.clientY
    }
    ;
    if(e.target===canvas)$('board').setPointerCapture(e.pointerId)
  }
  );
  $('board').addEventListener('pointermove',e=>{
    if(!touchStart||state!=='playing')return;
    let dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))>18){
      turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
      touchStart={
        x:e.clientX,y:e.clientY
      }
    }
  }
  );
  const clearTouch=()=>touchStart=null;
  $('board').addEventListener('pointerup',clearTouch);
  $('board').addEventListener('pointercancel',clearTouch);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&state==='playing')pause()
  }
  );
  window.addEventListener('blur',()=>{
    if(state==='playing')pause()
  }
  );
  reset();
  requestAnimationFrame(frame);
}
)();
