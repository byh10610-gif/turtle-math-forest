/*
 * Turtle Garden 2 — dependency-free interactive component.
 * Load assets/characters.js + garden-geometry.js first.
 * mountGarden(host,{items,profileId,onChange,onExit,backgroundUrl,effects,voiceEnabled})
 * returns {destroy,getState,undo,showHelp}. onChange receives a complete item array.
 * Ownership belongs to the host application: this component never awards items.
 */
(function(){
  'use strict';
  const LABELS={daisy:'데이지',flower:'분홍 꽃',ladybug:'무당벌레',tulip:'튤립',butterfly:'나비',mushroom:'버섯',squirrel:'다람쥐',hyacinth:'히아신스',duck:'아기 오리',sunflower:'해바라기',rabbit:'토끼',clover:'네잎클로버',lotus:'연꽃',fish:'아기 물고기',tree:'작은 나무',snail:'달팽이',firefly:'반딧불이',dragonfly:'잠자리'};
  const ICONS={
    back:'<path d="m14 6-6 6 6 6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 15.1A8 8 0 0 1 8.9 4 8.5 8.5 0 1 0 20 15.1Z"/>',
    sound:'<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
    mute:'<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="m17 9 5 6m0-6-5 6"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.3.8-1.5 1.1-1.5 2.5M12 17h.01"/>',
    undo:'<path d="m7 4-4 4 4 4M3 8h10a6 6 0 0 1 0 12h-3"/>',
    water:'<path d="M5 12h10l-1 8H6ZM7 12V8a3 3 0 0 1 6 0v4M15 14l5-5 2 2-6 6M4 13H2v4h3M19 5l1-2m2 4 1-1"/>',
    heart:'<path fill="currentColor" stroke="none" d="M12 21 3.5 12.5C-2 6.5 6-1 12 5c6-6 14 1.5 8.5 7.5Z"/>',
    leaf:'<path fill="currentColor" stroke="none" d="M20 3C5 1 0 10 6 16c6 6 15 0 14-13Z"/><path stroke="#fff9" d="M5 20 16 7"/>',
    sparkle:'<path fill="currentColor" stroke="none" d="m12 1 3.1 7.9L23 12l-7.9 3.1L12 23l-3.1-7.9L1 12l7.9-3.1Z"/>'
  };
  const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.sparkle)+'</svg>';
  let mountSerial=0;
  const copy=items=>items.map(i=>({...i}));
  const moreArt={};
  function artwork(kind,id){
    return moreArt[kind]||window.GardenArt[kind]?.(id)||'';
  }
  function addFriends(friends) {
    for(const [kind,[name,emoji]] of Object.entries(friends)){
      LABELS[kind]=name;
      moreArt[kind]='<span class="tg-emoji" aria-hidden="true">'+emoji+'</span>';
    }
  }
  function oceanGeometry(base) {
    const FISH={x:.5,y:.54,rx:.38,ry:.31};
    const point=p=>{
      const distance=Math.max(1,Math.sqrt(base.ellipse(p,FISH)));
      return {x:FISH.x+(p.x-FISH.x)/distance,y:FISH.y+(p.y-FISH.y)/distance};
    };
    return {...base,FISH,fishPoint:point,inPond:p=>base.ellipse(p,FISH)<=1,
      landPoint:point,walkPath:(_start,target)=>[point(target)]};
  }
  function mountGarden(host,options={}){
    if(!host||!window.GardenArt||!window.GardenGeometry)throw new Error('Garden requires a host, characters.js and garden-geometry.js');
    const ocean=Boolean(options.ocean),base=window.GardenGeometry;
    const G=ocean?oceanGeometry(base):base,mountId='tg'+(++mountSerial);
    const supported=new Set(Object.keys(LABELS));
    let items=copy(options.items||[]);
    const ids=new Set();
    for(const item of items){
      if(!item.id||ids.has(item.id)||!supported.has(item.kind))throw new Error('Unsupported or duplicate garden item. Keep the original saved data.');
      ids.add(item.id);
      if(item.placed&&(!Number.isFinite(item.x)||!Number.isFinite(item.y)||item.x<0||item.x>1||item.y<0||item.y>1))throw new Error('Invalid garden position. Validate through the migration adapter.');
    }
    let serial=0,destroyed=false,night=false,watering=false,audioOn=Boolean(options.effects),selectedId=null;
    let drag=null,pendingPointer=null,ignoreClickUntil=0,frame=0,lastFrame=0,clock=0;
    let worldRect={left:0,top:0,width:1000,height:625},turtleSize=180,toastTimer=null,bubbleTimer=null;
    let audioContext=null,spokenUnavailable=false,appOwnedSpeech=false;
    const timers=new Set(),undoStack=[],actors=new Map(),abort=new AbortController();
    const reduceQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced=reduceQuery.matches;
    const after=(fn,delay)=>{const id=setTimeout(()=>{timers.delete(id);if(!destroyed)fn();},delay);timers.add(id);return id;};
    const stopTimer=id=>{if(id){clearTimeout(id);timers.delete(id);}};
    const random=(a,b)=>a+Math.random()*(b-a);
    const flying=k=>['ladybug','butterfly','firefly','dragonfly','bee','bird','owl','beetle','grasshopper'].includes(k);
    const swimming=k=>(ocean&&!['shell','coral'].includes(k))||['fish','duck'].includes(k);
    const walking=k=>['rabbit','squirrel','snail','hedgehog','fox','frog','raccoon','chipmunk','deer','mouse'].includes(k);
    const watery=k=>swimming(k)||k==='lotus';
    const mobile=k=>flying(k)||swimming(k)||walking(k);
    const makeArt=kind=>artwork(kind,mountId+'-art-'+(++serial));
    const background=options.backgroundUrl||'./assets/garden-background.png';
    host.innerHTML=`<section class="tg-app${ocean?' is-ocean':''}" aria-label="${ocean?'바닷속 지도':'친구들이 사는 정원'}">
      <div class="tg-stage">
        <div class="tg-world" aria-label="정원. 잔디를 누르면 거북이가 걸어와요." tabindex="0">
          ${ocean?'<div class="ocean-scene" aria-hidden="true"><span>🪸</span><span>🪸</span><span>🌿</span><span>🫧</span><span>🫧</span><span>🐚</span></div>':'<img class="tg-background" alt="큰 나무와 꽃, 잔디 산책길과 푸른 연못이 있는 정원" draggable="false">'}
          <button class="tg-hotspot tg-tree-hotspot" data-action="tree" aria-label="나무를 톡, 나뭇잎 날리기"></button>
          <button class="tg-hotspot tg-pond-hotspot" data-action="pond" aria-label="연못을 톡, 물결 만들기"></button>
          <div class="tg-light"></div><div class="tg-placement-marker"></div>
        </div>
        <div class="tg-topbar"><div class="tg-topbar-group">
          <button class="tg-round" data-action="exit" aria-label="${options.demo?'미리보기 안내':'돌아가기'}">${icon(options.demo?'help':'back')}</button>
          ${options.onMap?`<button class="tg-round tg-map-button" data-action="map">${ocean?'🌿 정원':'🌊 바닷속'}</button>`:''}
          ${options.demo?'<span class="tg-preview-label">새 정원 미리보기</span>':''}
        </div><div class="tg-topbar-group">
          <button class="tg-round" data-action="sound" aria-label="소리 켜기" aria-pressed="false">${icon('mute')}</button>
          <button class="tg-round" data-action="night" aria-label="반딧불이 저녁으로 바꾸기" aria-pressed="false">${icon('sun')}</button>
          ${options.demo?'':`<button class="tg-round" data-action="help" aria-label="정원에서 노는 방법">${icon('help')}</button>`}
        </div></div>
        <div class="tg-hint">${ocean?'물을 톡! 친구들이 물결을 따라와요.':'거북이를 톡! 잔디를 누르면 따라와요.'}</div>
      </div>
      <div class="tg-tray" aria-label="아직 정원에 놓지 않은 선물">
        <div class="tg-tray-copy"><h2 class="tg-tray-title">새로 온 친구들 <span class="tg-count">0</span></h2><p>꾹 끌어 정원에 놓아요.<br>하나 누르고, 정원을 톡 해도 돼요.</p></div>
        <div class="tg-tray-list" role="group" aria-label="정원에 놓을 선물. 옆으로 넘겨 볼 수 있어요." tabindex="0"></div>
        <div class="tg-tray-actions">
          <button class="tg-tool" data-action="water" aria-label="물뿌리개" aria-pressed="false">${icon('water')}<span class="tg-tool-label">물주기</span></button>
          <button class="tg-tool" data-action="undo" aria-label="마지막 배치 되돌리기" disabled>${icon('undo')}<span class="tg-tool-label">되돌리기</span></button>
        </div>
      </div>
      <div class="tg-toast" role="status" aria-live="polite"></div>
      <div class="tg-sr-only" aria-live="polite" data-live></div>
    </section>`;
    const app=host.firstElementChild,stage=app.querySelector('.tg-stage'),world=app.querySelector('.tg-world'),tray=app.querySelector('.tg-tray'),trayList=app.querySelector('.tg-tray-list');
    const hint=app.querySelector('.tg-hint'),toastEl=app.querySelector('.tg-toast'),marker=app.querySelector('.tg-placement-marker'),live=app.querySelector('[data-live]');
    const bg=world.querySelector('.tg-background');
    if(bg){stage.style.setProperty('--garden-bg','url('+JSON.stringify(background)+')');bg.src=background;}
    let imageRatio=1586/992;
    bg?.addEventListener('load',()=>{imageRatio=bg.naturalWidth/bg.naturalHeight||imageRatio;resize();},{signal:abort.signal});
    bg?.addEventListener('error',()=>toast('배경을 불러오지 못했어요. assets 폴더가 함께 있는지 확인해 주세요.',10000),{signal:abort.signal});
    const turtleEl=document.createElement('button');
    turtleEl.className='tg-entity tg-turtle';turtleEl.dataset.action='turtle';turtleEl.setAttribute('aria-label','초롱이에게 인사하기');
    turtleEl.innerHTML='<span class="tg-art">'+makeArt('turtle')+'</span><span class="tg-speech" aria-hidden="true"></span>';
    world.appendChild(turtleEl);
    const bubble=turtleEl.querySelector('.tg-speech');
    const turtle={x:.38,y:.77,face:1,path:[],speed:0,idle:4,arrive:null,happy:0};
    for(let i=0;i<12;i++){
      const dot=document.createElement('span');dot.className='tg-firefly';dot.style.cssText=`left:${random(8,92)}%;top:${random(24,80)}%;animation-delay:${random(-6,0)}s`;world.appendChild(dot);
    }
    function pointFromClient(x,y){return{x:(x-worldRect.left)/worldRect.width,y:(y-worldRect.top)/worldRect.height};}
    function insideWorld(p){return p.x>=.02&&p.x<=.98&&p.y>=.06&&p.y<=.94;}
    function placementFor(kind,p){
      if(ocean)return{point:G.fishPoint(p),adjusted:false};
      if(watery(kind))return{point:G.fishPoint(p),adjusted:!G.inPond(p)};
      if(flying(kind))return{point:{x:G.clamp(p.x,.09,.92),y:G.clamp(p.y,.30,.83)},adjusted:false};
      return{point:G.landPoint(p),adjusted:G.inPond(p)||p.y<.49};
    }
    function resize(){
      if(destroyed)return;
      const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
      const width=Math.min(r.width,r.height*imageRatio),height=width/imageRatio;
      world.style.width=width+'px';world.style.height=height+'px';
      worldRect=world.getBoundingClientRect();
      turtleSize=G.clamp(worldRect.width*.147,105,192);
      world.style.setProperty('--turtle-size',turtleSize+'px');
      for(const actor of actors.values())sizeActor(actor);
      renderPositions();
    }
    function sizeActor(actor){
      const ratios={ladybug:.055,butterfly:.065,fish:.067,duck:.079,rabbit:.079,squirrel:.079,lotus:.079,tree:.14,dragonfly:.075,firefly:.047};
      actor.size=G.clamp(worldRect.width*(ratios[actor.item.kind]||.068),48,actor.item.kind==='tree'?170:110);
      actor.el.style.setProperty('--entity-size',actor.size+'px');
    }
    function renderPositions(){
      turtleEl.style.translate=`${turtle.x*worldRect.width-turtleSize*.50}px ${turtle.y*worldRect.height-turtleSize*.76}px`;
      turtleEl.style.zIndex=String(60+Math.round(turtle.y*200));
      turtleEl.querySelector('.tg-art').style.transform=`scaleX(${turtle.face})`;
      for(const actor of actors.values()){
        const bob=(swimming(actor.item.kind)?Math.sin(clock*1.6+actor.phase)*2:0);
        actor.el.style.translate=`${actor.x*worldRect.width-actor.size*.5}px ${actor.y*worldRect.height-actor.size*.73-actor.lift+bob}px`;
        actor.el.style.zIndex=String(flying(actor.item.kind)?330:swimming(actor.item.kind)?24:45+Math.round(actor.y*200));
        actor.el.querySelector('.tg-art').style.transform=`scaleX(${actor.face})`;
      }
    }
    function notify(){
      app.querySelector('[data-action="undo"]').disabled=undoStack.length===0;
      try{options.onChange?.(copy(items));}catch(error){console.error('Garden save failed',error);toast('배치를 저장하지 못했어요. 창을 닫기 전에 저장 공간을 확인해 주세요.',8000);}
    }
    function remember(){undoStack.push(copy(items));if(undoStack.length>30)undoStack.shift();}
    function createActor(item){
      const el=document.createElement('button');el.className='tg-entity tg-'+item.kind;el.dataset.itemId=item.id;
      el.setAttribute('aria-label',LABELS[item.kind]+' 친구. 톡 누르면 반응해요. 끌어서 옮길 수 있어요.');
      el.innerHTML='<span class="tg-art">'+makeArt(item.kind)+'</span>';world.appendChild(el);
      const at=placementFor(item.kind,item).point;
      const actor={item,el,x:at.x,y:at.y,face:1,size:80,phase:Math.random()*10,rest:random(2,7),route:null,lift:0};
      sizeActor(actor);actors.set(item.id,actor);return actor;
    }
    function reconcile(){
      const focusItemId=app.contains(document.activeElement)?document.activeElement.closest('[data-item-id]')?.dataset.itemId:null;
      const placed=new Set(items.filter(i=>i.placed).map(i=>i.id));
      for(const [id,actor]of actors)if(!placed.has(id)){actor.el.remove();actors.delete(id);}
      for(const item of items)if(item.placed){
        const actor=actors.get(item.id);if(!actor)createActor(item);else actor.item=item;
      }
      const previousScroll=trayList.scrollLeft;
      trayList.replaceChildren();
      const unplaced=items.filter(i=>!i.placed);
      app.querySelector('.tg-count').textContent=String(unplaced.length);
      if(!unplaced.length){const empty=document.createElement('p');empty.className='tg-empty';empty.textContent='모두 정원에 놀러 갔어요! 친구를 끌어 여기로 데려올 수도 있어요.';trayList.appendChild(empty);}
      for(const item of unplaced){
        const btn=document.createElement('button');btn.className='tg-card';btn.dataset.itemId=item.id;
        btn.setAttribute('aria-label',LABELS[item.kind]+' 꺼내 놓기');btn.setAttribute('aria-pressed',String(selectedId===item.id));
        if(selectedId===item.id)btn.classList.add('selected');
        btn.innerHTML='<span class="tg-card-art">'+makeArt(item.kind)+'</span><span class="tg-card-name"></span>';
        btn.querySelector('.tg-card-name').textContent=LABELS[item.kind];trayList.appendChild(btn);
      }
      trayList.scrollLeft=previousScroll;renderPositions();
      if(focusItemId){const nextFocus=[...trayList.querySelectorAll('[data-item-id]')].find(el=>el.dataset.itemId===focusItemId)||actors.get(focusItemId)?.el||world;nextFocus.focus({preventScroll:true});}
    }
    function toast(text,ms=3200){toastEl.textContent=text;toastEl.classList.add('show');stopTimer(toastTimer);toastTimer=after(()=>toastEl.classList.remove('show'),ms);}
    function speak(text,ms=4200){
      bubble.textContent=text;bubble.classList.add('show');live.textContent=text;
      stopTimer(bubbleTimer);bubbleTimer=after(()=>bubble.classList.remove('show'),ms);
      if(audioOn&&options.voiceEnabled!==false&&'speechSynthesis'in window){
        const voices=window.speechSynthesis.getVoices(),voice=voices.find(v=>v.lang.startsWith('ko')&&v.localService);
        if(voice){if(appOwnedSpeech)window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang='ko-KR';utterance.rate=.88;utterance.pitch=1.18;utterance.volume=.68;appOwnedSpeech=true;utterance.onend=()=>{appOwnedSpeech=false;};window.speechSynthesis.speak(utterance);}
        else if(!spokenUnavailable){spokenUnavailable=true;toast('한국어 목소리가 없으면 말풍선으로 인사해요.');}
      }
    }
    function chime(type='tap'){
      if(!audioOn)return;
      try{
        const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
        audioContext=audioContext||new Context();if(audioContext.state==='suspended')audioContext.resume();
        const start=audioContext.currentTime,notes=type==='welcome'?[523.25,659.25,783.99]:type==='water'?[740,587.33]:[523.25];
        notes.forEach((note,i)=>{const o=audioContext.createOscillator(),gain=audioContext.createGain();o.type='sine';o.frequency.value=note;gain.gain.setValueAtTime(0,start+i*.11);gain.gain.linearRampToValueAtTime(.045,start+i*.11+.025);gain.gain.exponentialRampToValueAtTime(.001,start+i*.11+.3);o.connect(gain);gain.connect(audioContext.destination);o.start(start+i*.11);o.stop(start+i*.11+.32);});
      }catch(_){/* Audio is optional. */}
    }
    function burst(p,type='heart',count=5){
      if(reduced)count=1;
      for(let i=0;i<count;i++){
        const el=document.createElement('span');el.className='tg-spark';el.innerHTML=icon(type);
        el.style.left=(p.x*100+random(-3,3))+'%';el.style.top=(p.y*100+random(-4,0))+'%';
        el.style.setProperty('--spark-color',type==='heart'?'#e6a4a3':type==='leaf'?'#b5cc70':'#f3d578');
        el.style.setProperty('--float-x',random(-24,24)+'px');el.style.animationDelay=(i*.045)+'s';
        world.appendChild(el);after(()=>el.remove(),1700+i*50);
      }
    }
    function ripple(p){
      chime('water');const center=G.fishPoint(p);
      for(let i=0;i<(reduced?1:3);i++)after(()=>{const el=document.createElement('span');el.className='tg-ripple';el.style.left=center.x*100+'%';el.style.top=center.y*100+'%';world.appendChild(el);after(()=>el.remove(),1600);},i*200);
      for(const actor of actors.values())if(swimming(actor.item.kind))setRoute(actor,G.fishPoint({x:center.x+random(-.03,.03),y:center.y+random(-.03,.03)}),random(3,4));
    }
    function happy(text){turtle.happy=2.5;turtleEl.classList.add('is-happy');burst({x:turtle.x+.02,y:turtle.y-.16},'heart',4);speak(text);chime('welcome');}
    function goTurtle(target,onArrive){
      turtle.path=G.walkPath(turtle,G.landPoint(target));turtle.idle=6;turtle.arrive=onArrive||null;turtleEl.classList.remove('is-sleeping');
      if(reduced){const dest=turtle.path[turtle.path.length-1];if(dest){turtle.x=dest.x;turtle.y=dest.y;}turtle.path=[];renderPositions();if(turtle.arrive){const fn=turtle.arrive;turtle.arrive=null;fn();}}
    }
    function welcome(item,position){
      speak('새 친구가 왔네! 만나러 갈까?');chime('welcome');
      const approach=G.landPoint({x:position.x-.07,y:position.y+.045});
      goTurtle(approach,()=>{
        if(!items.some(i=>i.id===item.id&&i.placed))return;
        happy((item.kind==='fish'?'물고기야':LABELS[item.kind]+'야')+', 안녕! 같이 놀자.');
        const friend=actors.get(item.id);if(friend){friend.rest=1.3;friend.el.classList.add('is-greeting');after(()=>friend.el.classList.remove('is-greeting'),900);}
      });
      const friend=actors.get(item.id);
      if(friend){let travel=0,from=turtle;for(const to of turtle.path){travel+=Math.hypot((to.x-from.x)*worldRect.width,(to.y-from.y)*worldRect.height);from=to;}friend.route=null;friend.rest=travel/Math.max(17,worldRect.width*.033)+4;}
    }
    function place(id,p){
      const item=items.find(i=>i.id===id);if(!item)return;
      const result=placementFor(item.kind,p),fresh=!item.placed;remember();
      item.placed=true;item.x=result.point.x;item.y=result.point.y;selectedId=null;
      const old=actors.get(id);if(old){old.x=item.x;old.y=item.y;old.route=null;old.rest=4;old.lift=0;old.el.classList.remove('is-flying');}
      reconcile();const actor=actors.get(id);actor.el.classList.add('is-popping');after(()=>actor.el.classList.remove('is-popping'),700);
      if(result.adjusted)toast(watery(item.kind)?'물 친구는 연못에 놓아 줄게요.':'여기 잔디가 편하겠다!');
      burst(result.point,'sparkle',4);if(fresh)welcome(item,result.point);else chime();notify();hint.classList.add('is-hidden');
    }
    function returnToTray(id){
      const item=items.find(i=>i.id===id);if(!item?.placed)return;remember();item.placed=false;item.x=null;item.y=null;selectedId=null;turtle.arrive=null;reconcile();notify();toast('바구니에서 조금 쉬자. 언제든 다시 꺼내 줘!');
    }
    function select(id){
      selectedId=selectedId===id?null:id;watering=false;app.querySelector('[data-action="water"]').setAttribute('aria-pressed','false');
      reconcile();if(selectedId){const item=items.find(i=>i.id===selectedId);toast(LABELS[item.kind]+'를 놓을 곳을 톡 눌러 주세요.',4200);}chime();
    }
    function setRoute(actor,to,duration){
      const from={x:actor.x,y:actor.y};
      actor.route={from,to,elapsed:0,duration};actor.rest=0;
      if(Math.abs(to.x-from.x)>.015)actor.face=to.x>from.x?1:-1;
      if(flying(actor.item.kind))actor.el.classList.add('is-flying');
    }
    function interact(actor){
      if(watering){waterAt(actor);return;}
      const k=actor.item.kind;chime();
      if(flying(k)){
        const target=G.FOLIAGE[Math.floor(Math.random()*G.FOLIAGE.length)];
        setRoute(actor,{x:target.x+random(-.025,.025),y:target.y+random(-.02,.02)},random(2.5,4));
        burst(actor,'sparkle',3);speak(k==='ladybug'?'무당벌레야, 나무에서 만나!':'살랑살랑, 같이 놀자!');
      }else if(swimming(k)){ripple(actor);speak(k==='duck'?'오리야, 물놀이 재밌니?':LABELS[k]+' 친구가 헤엄치네!');}
      else if(walking(k)){actor.el.classList.add('is-greeting');after(()=>actor.el.classList.remove('is-greeting'),850);goTurtle({x:actor.x-.08,y:actor.y+.04},()=>happy(LABELS[k]+'야, 만나서 반가워!'));}
      else{actor.el.classList.add('is-popping');after(()=>actor.el.classList.remove('is-popping'),700);burst(actor,k==='clover'?'sparkle':'heart',4);speak(k==='mushroom'?'동글동글, 버섯 쉼터야!':'예쁜 꽃향기가 나네. 고마워!');}
    }
    function waterAt(actor){
      const k=actor.item.kind;
      if(mobile(k)){toast('꽃이나 나무에 물을 줘 볼까?');return;}
      for(let i=0;i<(reduced?2:12);i++)after(()=>{const drop=document.createElement('span');drop.className='tg-drop';drop.style.left=(actor.x*100+random(-2,2))+'%';drop.style.top=(actor.y*100-5)+'%';world.appendChild(drop);after(()=>drop.remove(),700);},i*35);
      actor.el.classList.add('is-popping');after(()=>actor.el.classList.remove('is-popping'),850);burst(actor,'sparkle',4);chime('water');speak('쑥쑥! 돌봐 줘서 고마워.');
    }
    function treeTap(){
      burst({x:.23,y:.33},'leaf',reduced?1:9);chime();speak('나뭇잎이 살랑살랑!');
      const bug=[...actors.values()].find(a=>a.item.kind==='ladybug');if(bug)setRoute(bug,{x:.19,y:.39},3.6);
      if(watering){burst({x:.16,y:.48},'sparkle',5);speak('나무도 시원하대!');}
    }
    function undo(){
      if(!undoStack.length)return;cancelDrag();items=undoStack.pop();selectedId=null;
      turtle.arrive=null;turtle.path=[];turtle.speed=0;turtle.idle=5;turtleEl.classList.remove('is-walking');
      for(const actor of actors.values())actor.el.remove();actors.clear();reconcile();notify();toast('조금 전 정원으로 돌아왔어요.');
    }
    function cleanupPointer(){
      marker.classList.remove('show');tray.classList.remove('is-drop-target');
      const previous=pendingPointer;pendingPointer=null;
      if(previous){try{app.releasePointerCapture(previous.pointerId);}catch(_){}}
    }
    function cancelDrag(){
      if(drag){drag.ghost.remove();drag.el.classList.remove('is-dragging');drag=null;}
      cleanupPointer();
    }
    function startDrag(p,e){
      const item=items.find(i=>i.id===p.id);if(!item)return;
      const ghost=document.createElement('div');ghost.className='tg-drag-ghost';ghost.innerHTML=makeArt(item.kind);document.body.appendChild(ghost);
      drag={id:p.id,el:p.el,ghost,kind:item.kind,fromTray:!item.placed};p.el.classList.add('is-dragging');
      selectedId=null;moveDrag(e);hint.classList.add('is-hidden');
    }
    function moveDrag(e){
      if(!drag)return;
      drag.ghost.style.transform=`translate3d(${e.clientX-52}px,${e.clientY-96}px,0)`;
      const p=pointFromClient(e.clientX,e.clientY),inside=insideWorld(p),tr=tray.getBoundingClientRect(),overTray=e.clientY>=tr.top&&e.clientY<=tr.bottom&&e.clientX>=tr.left&&e.clientX<=tr.right;
      drag.ghost.classList.toggle('invalid',!inside&&!overTray);tray.classList.toggle('is-drop-target',overTray&&!drag.fromTray);
      marker.classList.toggle('show',inside);
      if(inside){const target=placementFor(drag.kind,p).point;marker.style.left=target.x*100+'%';marker.style.top=target.y*100+'%';}
    }
    function pointerDown(e){
      if(!e.isPrimary||e.button!==0||pendingPointer||app.querySelector('.tg-dialog-wrap'))return;
      ignoreClickUntil=0; // A fresh tap is not the synthetic click of the previous drag.
      const el=e.target.closest('[data-item-id]');if(!el)return;
      e.preventDefault();pendingPointer={id:el.dataset.itemId,el,pointerId:e.pointerId,x:e.clientX,y:e.clientY,inTray:Boolean(el.closest('.tg-card')),scrollLeft:trayList.scrollLeft,scrolling:false};
      try{app.setPointerCapture(e.pointerId);}catch(_){}
    }
    function pointerMove(e){
      const p=pendingPointer;if(!p||e.pointerId!==p.pointerId)return;
      e.preventDefault();const dx=e.clientX-p.x,dy=e.clientY-p.y;
      if(!drag&&p.inTray){
        const aboveTray=e.clientY<tray.getBoundingClientRect().top-6;
        if(aboveTray&&dy<-30){
          if(p.scrolling)trayList.scrollLeft=p.scrollLeft;
          p.scrolling=false;
        }else{
          if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.3)p.scrolling=true;
          if(p.scrolling){trayList.scrollLeft=p.scrollLeft-dx;return;}
        }
      }
      if(!drag&&Math.hypot(dx,dy)>8)startDrag(p,e);if(drag)moveDrag(e);
    }
    function pointerUp(e){
      const p=pendingPointer;if(!p||e.pointerId!==p.pointerId)return;e.preventDefault();ignoreClickUntil=performance.now()+450;
      if(p.scrolling){cleanupPointer();return;}
      if(drag){
        const id=drag.id,pos=pointFromClient(e.clientX,e.clientY),tr=tray.getBoundingClientRect();
        const overTray=e.clientY>=tr.top&&e.clientY<=tr.bottom&&e.clientX>=tr.left&&e.clientX<=tr.right;
        cancelDrag();if(insideWorld(pos))place(id,pos);else if(overTray)returnToTray(id);else toast('놓지 않았어요. 다시 꺼내 볼까?');
      }else{const id=p.id;cleanupPointer();const item=items.find(i=>i.id===id);if(item?.placed)interact(actors.get(id));else select(id);}
    }
    function onClick(e){
      if(e.detail!==0&&performance.now()<ignoreClickUntil)return;
      const itemEl=e.target.closest('[data-item-id]');
      if(itemEl){const item=items.find(i=>i.id===itemEl.dataset.itemId);if(item?.placed)interact(actors.get(item.id));else select(item?.id);return;}
      const action=e.target.closest('[data-action]')?.dataset.action;
      if(action==='close-help'){closeHelp();return;}
      if(action==='reset-demo'){options.onReset?.();closeHelp();return;}
      if(action==='map'){options.onMap?.();return;}
      if(action==='exit'){options.onExit?options.onExit():showHelp();return;}
      if(action==='help'){showHelp();return;}
      if(action==='undo'){undo();return;}
      if(action==='water'){watering=!watering;selectedId=null;reconcile();app.querySelector('[data-action="water"]').setAttribute('aria-pressed',String(watering));toast(watering?'꽃이나 나무를 톡 눌러 물을 주세요.':'물뿌리개를 내려놓았어요.');return;}
      if(action==='night'){night=!night;app.classList.toggle('is-night',night);const btn=app.querySelector('[data-action="night"]');btn.setAttribute('aria-pressed',String(night));btn.setAttribute('aria-label',night?'밝은 낮으로 바꾸기':'반딧불이 저녁으로 바꾸기');btn.innerHTML=icon(night?'moon':'sun');speak(night?'반짝반짝, 반딧불이가 나왔어.':'햇살이 따뜻해!');return;}
      if(action==='sound'){audioOn=!audioOn;updateSoundButton();if(!audioOn&&appOwnedSpeech){window.speechSynthesis?.cancel();appOwnedSpeech=false;}if(audioOn){chime('welcome');speak('안녕! 나는 초롱이야.');}return;}
      const worldClick=e.target.closest('.tg-world');if(!worldClick)return;
      const p=e.detail===0?{x:.40,y:.73}:pointFromClient(e.clientX,e.clientY);
      if(selectedId){place(selectedId,p);return;}
      if(action==='turtle'){goTurtle(turtle);happy(['안녕! 만나서 반가워.','쓰담쓰담, 기분 좋아!','우리 같이 산책할까?'][Math.floor(Math.random()*3)]);return;}
      if(action==='tree'){treeTap();return;}
      if(ocean){ripple(p);goTurtle(p);speak('보글보글! 같이 헤엄치자.');return;}
      if(action==='pond'||G.inPond(p)){ripple(p);speak([...actors.values()].some(a=>a.item.kind==='fish')?'물고기야, 여기로 와!':'퐁당! 물결이 동그랗게 퍼져.');return;}
      if(watering){burst(p,'sparkle',4);chime('water');speak('풀도 시원하대. 고마워!');return;}
      if(insideWorld(p)){burst(p,'sparkle',2);goTurtle(p,()=>speak('여기까지 왔어!'));speak('응, 그쪽으로 갈게!');}
    }
    function updateSoundButton(){const btn=app.querySelector('[data-action="sound"]');btn.setAttribute('aria-pressed',String(audioOn));btn.setAttribute('aria-label',audioOn?'소리 끄기':'소리 켜기');btn.innerHTML=icon(audioOn?'sound':'mute');}
    let helpFocus=null;
    function showHelp(){
      if(app.querySelector('.tg-dialog-wrap'))return;cancelDrag();helpFocus=document.activeElement;
      const wrap=document.createElement('div');wrap.className='tg-dialog-wrap';
      wrap.innerHTML=`<section class="tg-dialog" role="dialog" aria-modal="true" aria-labelledby="${mountId}-help-title"><h2 id="${mountId}-help-title">우리 정원에서 놀자</h2><p>아래 친구를 <strong>끌어서 놓거나</strong>, 친구를 고른 뒤 정원을 톡 눌러 주세요.</p><p><strong>거북이</strong>를 쓰다듬고, <strong>잔디</strong>를 눌러 불러 보세요.<br><strong>나무</strong>는 나뭇잎을, <strong>연못</strong>은 물결을 보내 줘요.</p><p>친구를 다시 옮기려면 끌어 주세요. 아래 바구니로 데려오면 잠시 쉬어요. 물뿌리개로 꽃도 돌볼 수 있어요.</p><p>${options.demo?'이 화면은 정원 교체용 체험 예제예요. 물고기를 포함한 친구들은 체험용이며, 기존 수학숲 학습 기록과 별도로 저장해요.':'아이마다 받은 선물과 정원 배치를 따로 보관해요.'}</p><p>가로 화면에서 정원이 가장 크게 보여요. 소리 버튼을 켜면 효과음이 나고, 기기에 한국어 목소리가 있으면 인사도 들려요.</p><button class="tg-primary" data-action="close-help">이제 놀러 가자!</button>${options.onReset?'<button class="tg-secondary" data-action="reset-demo">체험 정원을 처음 모습으로</button>':''}</section>`;
      app.appendChild(wrap);app.classList.add('motion-paused');wrap.querySelector('.tg-primary').focus();
    }
    function closeHelp(){app.querySelector('.tg-dialog-wrap')?.remove();app.classList.remove('motion-paused');if(helpFocus?.isConnected)helpFocus.focus();lastFrame=0;}
    function onKey(e){
      if(e.key==='Escape'){cancelDrag();selectedId=null;watering=false;app.querySelector('[data-action="water"]').setAttribute('aria-pressed','false');closeHelp();reconcile();return;}
      const modal=app.querySelector('.tg-dialog-wrap');
      if(!modal&&e.target===trayList&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();trayList.scrollBy({left:e.key==='ArrowRight'?140:-140,behavior:reduced?'instant':'smooth'});return;}
      if(modal&&e.key==='Tab'){const nodes=[...modal.querySelectorAll('button')],first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
      if(!modal&&e.target===world&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(selectedId)place(selectedId,{x:.4,y:.74});else goTurtle({x:.4,y:.74});}
    }
    function tickTurtle(dt){
      turtle.happy=Math.max(0,turtle.happy-dt);turtleEl.classList.toggle('is-happy',turtle.happy>0);
      if(turtle.path.length){
        const dest=turtle.path[0],dx=dest.x-turtle.x,dy=dest.y-turtle.y;
        const distance=Math.hypot(dx*worldRect.width,dy*worldRect.height),speed=Math.max(17,worldRect.width*.033);
        turtle.speed=Math.min(speed,turtle.speed+dt*speed*1.5);const step=Math.min(distance,turtle.speed*dt);
        if(distance<2.2){turtle.x=dest.x;turtle.y=dest.y;turtle.path.shift();if(!turtle.path.length){turtle.speed=0;turtle.idle=random(4,8);if(turtle.arrive){const fn=turtle.arrive;turtle.arrive=null;fn();}}}
        else{turtle.x+=dx*step/distance;turtle.y+=dy*step/distance;if(Math.abs(dx)>.005)turtle.face=dx>0?1:-1;}
      }else{turtle.idle-=dt;if(turtle.idle<=0&&turtle.happy<=0){if(night&&Math.random()<.3){turtleEl.classList.add('is-sleeping');turtle.idle=9;speak('바람이 포근해… 잠깐 쉴까?');}else{goTurtle({x:random(.25,.67),y:random(.58,.87)});}}}
      turtleEl.classList.toggle('is-walking',turtle.path.length>0&&turtle.happy<=0);
    }
    function tickActor(actor,dt){
      if(drag?.id===actor.item.id)return;
      const k=actor.item.kind;if(!mobile(k))return;
      if(actor.route){
        const route=actor.route;route.elapsed+=dt;const t=G.clamp(route.elapsed/route.duration,0,1),ease=t*t*(3-2*t);
        actor.x=route.from.x+(route.to.x-route.from.x)*ease;actor.y=route.from.y+(route.to.y-route.from.y)*ease;
        actor.lift=flying(k)?Math.sin(t*Math.PI)*worldRect.height*.055:0;
        if(t===1){actor.route=null;actor.lift=0;actor.rest=swimming(k)?random(.3,1):random(4,10);actor.el.classList.remove('is-flying');}
      }else{actor.rest-=dt;if(actor.rest<=0){
        if(flying(k)){const target=G.FOLIAGE[Math.floor(Math.random()*G.FOLIAGE.length)];setRoute(actor,{x:target.x+random(-.025,.025),y:target.y+random(-.015,.015)},random(3.8,6));}
        else if(swimming(k)){const angle=random(0,Math.PI*2),radius=random(.2,.9);setRoute(actor,{x:G.FISH.x+Math.cos(angle)*G.FISH.rx*radius,y:G.FISH.y+Math.sin(angle)*G.FISH.ry*radius},random(5,9));}
        else{const target=G.landPoint({x:actor.item.x+random(-.06,.06),y:actor.item.y+random(-.035,.035)});if(G.segmentSafe(actor,target))setRoute(actor,target,k==='snail'?16:5);else actor.rest=5;}
      }}
    }
    function loop(time){
      if(destroyed)return;
      const dt=lastFrame?Math.min((time-lastFrame)/1000,.05):0;lastFrame=time;
      const paused=Boolean(app.querySelector('.tg-dialog-wrap'))||document.hidden||reduced;
      if(!paused){clock+=dt;tickTurtle(dt);for(const actor of actors.values())tickActor(actor,dt);renderPositions();}
      frame=requestAnimationFrame(loop);
    }
    function visibility(){
      app.classList.toggle('motion-paused',document.hidden||Boolean(app.querySelector('.tg-dialog-wrap')));
      if(document.hidden){cancelAnimationFrame(frame);cancelDrag();if(appOwnedSpeech){window.speechSynthesis?.cancel();appOwnedSpeech=false;}}
      else{lastFrame=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);}
    }
    app.addEventListener('pointerdown',pointerDown,{signal:abort.signal});
    app.addEventListener('pointermove',pointerMove,{signal:abort.signal});
    app.addEventListener('pointerup',pointerUp,{signal:abort.signal});
    app.addEventListener('pointercancel',e=>{if(e.pointerId===pendingPointer?.pointerId)cancelDrag();},{signal:abort.signal});
    app.addEventListener('lostpointercapture',()=>{if(pendingPointer)cancelDrag();},{signal:abort.signal});
    app.addEventListener('click',onClick,{signal:abort.signal});
    app.addEventListener('keydown',onKey,{signal:abort.signal});
    app.addEventListener('contextmenu',e=>{if(e.target.closest('[data-item-id]'))e.preventDefault();},{signal:abort.signal});
    document.addEventListener('visibilitychange',visibility,{signal:abort.signal});
    window.addEventListener('blur',cancelDrag,{signal:abort.signal});
    const reducedChange=()=>{reduced=reduceQuery.matches;};reduceQuery.addEventListener?.('change',reducedChange);
    const observer=new ResizeObserver(resize);observer.observe(stage);
    resize();reconcile();updateSoundButton();
    after(()=>speak('안녕! 오늘은 어떤 친구가 올까?',4400),650);
    after(()=>hint.classList.add('is-hidden'),10500);
    frame=requestAnimationFrame(loop);
    return{
      getState:()=>copy(items),undo,showHelp,
      destroy(){
        if(destroyed)return;destroyed=true;cancelAnimationFrame(frame);abort.abort();observer.disconnect();cancelDrag();
        for(const id of timers)clearTimeout(id);timers.clear();reduceQuery.removeEventListener?.('change',reducedChange);
        if(appOwnedSpeech){window.speechSynthesis?.cancel();appOwnedSpeech=false;}
        if(audioContext)audioContext.close().catch(()=>{});actors.clear();host.replaceChildren();
      }
    };
  }
  window.GardenApp=Object.freeze({mountGarden,labels:LABELS,artwork,addFriends});
})();
