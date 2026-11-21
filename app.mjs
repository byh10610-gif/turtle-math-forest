import {groups,stages,labels,modes,variantsFor,batch,assessment,assess,record,reviewTargets,nextSuggestion,load,save} from './math.mjs';
import {ForestAudio,pulse} from './audio.mjs';
import {profileNames} from './profile-names.mjs';

const app = document.querySelector('#app');
const announce = document.querySelector('#announce');
const {names,customized}=profileNames(localStorage,location.hash);
if (customized) history.replaceState(null,'',location.pathname+location.search);
const avatars = {older:'🐰',young:'🐥'};
const decorations = ['🌼','🐞','🌷','🦋','🍄','🐿️','🪻','🦆','🌻','🐇','🍀','🪷'];
const state = load(localStorage);
const audio = new ForestAudio();
let child = null, screen = 'profiles', group = 0, slot = null, installPrompt = null;
let offlineReady = false;
let warning = '';
let arrangement = {level:7,topic:'mixed',mode:'choice',format:'basic'};

function profile() {return state[child];}
function syncMusic() {audio.music(screen==='practice' && !document.hidden && profile().music);}
function feedback(kind,p=profile()) {
  if (!p) return;
  if (p.effects) audio.play(kind);
  else if (p.music) audio.unlock();
  if (p.haptics) pulse(kind);
}
function stopNarration() {
  window.speechSynthesis?.cancel();
  audio.duck(false);
}
function persist() {
  try {save(localStorage,state);warning='';}
  catch {warning='기기 저장 공간을 사용할 수 없어요. 브라우저의 사이트 저장 설정을 확인해 주세요.';}
}
const act = (action,text,classes='button',attrs='') => '<button type="button" class="'+classes+'" data-do="'+action+'" '+attrs+'>'+text+'</button>';
const muted = text=>'<p class="muted">'+text+'</p>';
const icon = (emoji,classes='')=>'<span class="emoji '+classes+'" aria-hidden="true">'+emoji+'</span>';
const stageName = id=>stages[id][0];
const levelName = id=>id<=14?id+'단계':'보조 과정';
const topicName = id=>labels[id] ?? id+'단';
const chip = (name,value,text,active)=>act(name+':'+value,text,'chip'+(active?' selected':''),'aria-pressed="'+active+'"');
const mascot = '<span class="mascot" aria-hidden="true"></span>';
const label = (emoji,text)=>icon(emoji)+text;
const remaining = p=>p.active ? p.active.questions.length-p.active.index : 0;
function recommendations(history,level,topic) {
  const candidates=topic==='mixed'&&[7,10].includes(level)?['add','sub']:[topic];
  return candidates.map(key=>[nextSuggestion(history,level,key),key])
    .filter(([id])=>id)
    .map(([id,key])=>act('recommend:'+id+'.'+key,(candidates.length>1?labels[key]+' ':'')+id+'단계 해 보기','chip'))
    .join('');
}

function header() {
  return '<header class="bar">'+act('profiles',mascot+'<span>거북이 <b>수학숲</b></span>','brand','aria-label="거북이 수학숲, 프로필 선택"')+
    '<div class="bar-actions">'+(installPrompt?act('install',label('⇩','홈 화면에 추가'),'status-button'):'')+
    (screen==='practice'?act('music-toggle',profile().music?'♫':'♩','status-button music-toggle','aria-label="배경음악 '+(profile().music?'끄기':'켜기')+'" title="배경음악 '+(profile().music?'끄기':'켜기')+'" aria-pressed="'+profile().music+'"'):'')+
    (child?act('home',icon(avatars[child])+names[child]+'의 숲','profile-badge'):'<span class="ready"><i></i>'+(offlineReady?'오프라인 이용 가능':'기기에 학습 저장')+'</span>')+'</div></header>';
}
function profilesView() {
  return '<main class="page welcome"><section class="hero"><div class="hero-art" role="img" aria-label="꽃이 핀 숲속 연못과 웃는 아기 거북이"></div>'+
    '<div class="hero-caption">'+icon('🌿')+'숲속 친구들과 함께 배우는 수와 연산</div></section>'+
    '<section class="welcome-content"><p class="eyebrow"><i></i>거북이 수학숲</p><h1>누구의 숲으로<br>갈까요?</h1>'+
    '<p class="welcome-copy">거북이와 함께, 내 속도로 수학을 배워요.</p><div class="profile-list">'+
    Object.keys(names).map(id=>act('child:'+id,
      '<span class="avatar '+id+'">'+icon(avatars[id])+'</span><span class="profile-text"><strong>'+names[id]+'의 숲</strong><small>'+
      (state[id].active?'풀던 '+remaining(state[id])+'문제 이어 하기':state[id].history.length?'내 연습과 정원 보기':id==='older'?'큰 수식과 '+modes[state[id].mode]:'그림과 함께하는 수놀이')+'</small></span><span class="chevron" aria-hidden="true">›</span>','profile-card')).join('')+
    '</div><p class="privacy">'+icon('✦')+'연습 기록과 정원은 아이마다 따로 저장돼요.</p></section></main>';
}
function homeView() {
  const p=profile();
  const advice=p.checkpoint;
  const next=recommendations(p.history,p.level,p.topic);
  return '<main class="page"><div class="trail">'+act('profiles','프로필 고르기','quiet')+'</div>'+
    '<div class="home-grid"><section class="home-main panel"><p class="eyebrow"><i></i>'+names[child]+'의 숲</p><h1>오늘은 어디로<br>가 볼까요?</h1>'+
    muted(p.active?levelName(p.active.level)+' '+stageName(p.active.level)+' · '+remaining(p)+'문제 남음':levelName(p.level)+' '+stageName(p.level))+
    '<div class="home-buttons">'+act('resume',label('▶',p.active?'이어 하기':p.history.length?'지난 단계 이어 하기':'연습 시작'),'button primary')+
    act('levels',label('🌿','단계 고르기'))+act('review',label('🍂','오늘의 복습'))+'</div></section>'+
    '<aside class="home-side"><section class="picture-card"><div class="picture-note">'+mascot+'<div><strong>'+names[child]+'의 정원</strong><small>모은 보상 '+p.rewards+'개</small></div>'+act('garden','정원 보기','button mini')+'</div></section>'+
    '<section class="panel advice"><h2>내 시작점 알아보기</h2>'+
    (advice?'<p>덧셈 <b>'+advice.add+'단계</b> · 뺄셈 <b>'+advice.sub+'단계</b></p><div class="compact">'+act('advice:add','덧셈 연습','chip')+act('advice:sub','뺄셈 연습','chip')+(advice.ten?act('pick:5','10 만들기','chip'):'')+'</div>':muted(child==='older'?'10 묶음과 10을 넘는 계산을 짧게 확인해요.':'작은 수량, 숫자와 개수, 하나 더·덜을 확인해요.'))+
    act('check',advice?'시작 확인 다시 하기':'시작 확인','quiet')+
    (next?'<p>요즘 혼자 잘 풀었어요.</p><div class="compact">'+next+'</div>':'')+'</section></aside></div>'+
    '<div class="footer-actions">'+act('settings','학습·소리 설정','quiet')+act('history','학습 기록','quiet')+'</div></main>';
}
function levelsView() {
  return '<main class="page"><div class="trail">'+act('home',names[child]+'의 숲','quiet')+'</div><div class="page-heading"><div><h1>단계 고르기</h1>'+muted('연습하고 싶은 묶음을 골라요.')+'</div></div>'+
    '<div class="group-grid">'+groups.map(([title,emoji,description,items],i)=>act('group:'+i,
      icon(emoji,'tile-icon')+'<strong>'+title+'</strong><small>'+description+'</small><span class="range">'+(i<5?items[0]+'–'+items.at(-1)+'단계':'보조 과정')+'</span>','group-card group-'+i)).join('')+'</div></main>';
}
function groupView() {
  const [title,emoji,,items]=groups[group];
  return '<main class="page"><div class="trail">'+act('levels','단계 고르기','quiet')+'</div><div class="page-heading"><h1>'+icon(emoji)+title+'</h1></div>'+
    '<div class="stage-list">'+items.map(id=>act('pick:'+id,
      '<span class="stage-index">'+(id<=14?id:icon('✦'))+'</span><strong>'+stageName(id)+'</strong>'+
      (profile().level===id?'<span class="range">지난 단계</span>':'')+'<span class="chevron" aria-hidden="true">›</span>','stage-card')).join('')+'</div></main>';
}
function setupView(settings=false) {
  const {level,topic,mode,format}=arrangement;
  const options=stages[level][1];
  const formats=settings?['basic','understand']:topic==='bundle'?[]:['basic','understand',...variantsFor(level)];
  const showFormats=settings||formats.length>2;
  return '<main class="page"><div class="trail">'+act(settings?'home':'level-back',settings?names[child]+'의 숲':groups[group][0],'quiet')+'</div><section class="panel setup">'+
    '<p class="eyebrow"><i></i>'+(settings?names[child]+'의 설정':levelName(level))+'</p><h1>'+(settings?'입력·학습 설정':stageName(level))+'</h1>'+
    (!settings&&options.length>1?'<fieldset><legend>연습 내용</legend><div class="compact">'+options.map(key=>chip('topic',key,topicName(key),topic===key)).join('')+'</div></fieldset>':'')+
    '<fieldset><legend>답 입력</legend><div class="compact">'+Object.entries(modes).map(([key,title])=>chip('mode',key,title,mode===key)).join('')+'</div></fieldset>'+
    (showFormats?'<fieldset><legend>문제 구성</legend><div class="compact">'+formats.map(key=>chip('format',key,labels[key],format===key)).join('')+'</div></fieldset>':'')+
    (settings?'<fieldset><legend>소리와 진동</legend><div class="compact">'+
      [['music','배경음악'],['effects','효과음'],['sound','문제 읽기'],['haptics','진동']].map(([key,title])=>
        chip('toggle',key,title+(profile()[key]?' 켜짐':' 꺼짐'),profile()[key])).join('')+'</div></fieldset>':'')+
    act(settings?'settings-save':'start',settings?'설정 저장':'연습 시작','button primary')+'</section></main>';
}
function apples(n,mini=false,frame=0) {
  if (frame) return '<span class="ten-frame" role="img" aria-label="전체 '+frame+'칸 중 '+n+'칸 채움">'+Array.from({length:frame},(_,i)=>'<span aria-hidden="true">'+(i<n?'<i class="berry"></i>':'')+'</span>').join('')+'</span>';
  if (!n) return '<span class="objects empty" aria-label="0개"><span aria-hidden="true">비어 있어요</span></span>';
  if (n>15) {
    return '<span class="place-objects" role="img" aria-label="'+n+'">'+String(n).split('').map((digit,i,all)=>'<span class="place-tile"><small>'+['낱개','십','백','천'][all.length-i-1]+'</small><b>'+digit+'</b></span>').join('')+'</span>';
  }
  return '<span class="objects '+(mini?'tiny':'')+'" role="img" aria-label="열매 '+n+'개">'+Array.from({length:n},()=>'<i class="berry" aria-hidden="true"></i>').join('')+'</span>';
}
function helpMarkup(q) {
  const showBridge=q.variant==='calc' && (q.level===8||q.level===9);
  const showExchange=q.variant==='calc' && (q.level===11||q.level===12);
  return '<div class="hint"><strong>거북이의 도움</strong><span>'+q.hint+'</span>'+
    (showBridge?apples(q.a%10,true,10):'')+
    (showExchange?'<div class="hint-place">'+apples(q.a,true)+'<span>'+(q.op==='+'?'더하기':'빼기')+'</span>'+apples(q.b,true)+'</div>':'')+'</div>';
}
function questionVisual(q,mode) {
  if (q.visual) return '<div class="count-area" aria-label="문제의 열매 그림">'+q.visual.map((n,i)=>'<span class="count-group">'+apples(n,q.visual.length>2,i===0?q.frame:0)+'</span>').join('')+'</div>';
  if (!q.cards && mode!=='picture' && (q.level===1 || q.topic==='zero')) return '<div class="count-area"><span class="count-group">'+apples(q.answer)+'</span></div>';
  return '';
}
function cardMarkup(q,card,index,mode) {
  const number='<span class="option-number">'+(index+1)+'</span>';
  if (q.compare && q.level===2) return number+apples(card.quantity,true);
  if (q.compare&&mode==='picture') return number+apples(card.quantity,true);
  if (mode==='picture' && q.variant==='story') return number+icon(card.text.includes('+')?'➕':'➖','tile-icon')+'<strong>'+card.text+'</strong>';
  return number+'<strong>'+card.text+'</strong>';
}
function practiceView() {
  const p=profile(), s=p.active, q=s.questions[s.index], a=s.attempt;
  const locked=a.correct;
  const mode=p.mode;
  const renderAlternatives=q.cards||mode!=='pad';
  const stateText=locked?'정답이에요!':a.wrong?'한 번 더 생각해 봐요.':'';
  const instruction=!q.cards && mode!=='picture' && (q.level===1||q.topic==='zero')?'열매가 몇 개일까요?':q.instruction;
  const headerTitle=s.kind==='check'?'시작 확인':s.kind==='review'?'오늘의 복습':stageName(s.level);
  return '<main class="page practice"><div class="practice-nav">'+act('home','저장하고 나가기','quiet')+
    '<div class="progress" aria-label="'+(s.index+1)+' / '+s.questions.length+' 문제"><span>'+(s.index+1)+' / '+s.questions.length+'</span><progress max="'+s.questions.length+'" value="'+(s.index+(locked?1:0))+'"></progress></div><span class="practice-title">'+headerTitle+'</span></div>'+
    '<div class="practice-grid"><div><section class="question panel"><div class="question-head"><p>'+instruction+'</p>'+
    (p.sound?act('speak','🔊','listen','aria-label="문제 읽어 주기"'):'')+'</div>'+
    (q.expression?'<div class="expression">'+q.expression+'</div>':'')+questionVisual(q,mode)+
    (a.hint?helpMarkup(q):'')+'</section>'+
    '<div class="guide">'+mascot+'<div><strong>'+stateText+'</strong>'+(!stateText?act('hint','도움 보기','quiet',locked?'disabled':''):'')+'</div>'+
    (a.wrong&&!locked?act('hint','도움 보기','quiet'):'')+
    (s.kind==='check'&&!locked?act('skip','아직 모르겠어요','quiet'):'')+'</div></div>'+
    '<section class="answers panel"><h2>'+(q.cards&&mode==='pad'?'식이나 그림의 번호를 입력해요':q.cards?'알맞은 것을 골라요':mode==='picture'?'그림으로 답하기':mode==='choice'?'답을 골라요':'답을 써요')+'</h2>'+
    (renderAlternatives?'<div class="choices '+(q.choices.length===5?'five':'')+(mode==='picture'?' picture':'')+(q.cards?' with-cards':'')+(mode==='pad'?' examples':'')+'">'+q.choices.map((n,i)=>{
      const content=q.cards?cardMarkup(q,q.cards[i],i,mode):mode==='picture'?apples(n,true):String(n);
      return mode==='pad'?'<div class="choice-card">'+content+'</div>':act('answer:'+n,content,'choice-card'+(locked&&n===q.answer?' correct':'')+(a.wrong&&n===a.answers.at(-1)?' incorrect':''),locked?'disabled':'');
    }).join('')+'</div>':'')+
    (mode==='pad'&&locked?'<output class="pad-value" aria-label="정답">'+q.answer+'</output>':'')+
    (mode==='pad'&&!locked?'<div class="pad"><output class="pad-value" aria-label="입력한 답">'+(a.draft||'&nbsp;')+'</output><div class="keys">'+
      [1,2,3,4,5,6,7,8,9,'del',0,'submit'].map(n=>act('key:'+n,n==='del'?'⌫':n==='submit'?'확인':n,'key'+(n==='submit'?' submit':''),(n==='del'?'aria-label="한 자리 지우기" ':'')+(locked||n==='submit'&&!a.draft?'disabled':''))).join('')+'</div></div>':'')+
    (locked?act('next',s.index===s.questions.length-1?'결과 보기':'다음 문제','button primary next'):'')+'</section></div>'+
    (!locked?'<div class="modes" aria-label="답 입력 바꾸기">'+Object.entries(modes).map(([id,title])=>chip('during',id,title,mode===id)).join('')+'</div>':'')+'</main>';
}
function resultView() {
  const p=profile(), r=p.result;
  if (!r) return homeView();
  const count=status=>r.items.filter(x=>x.status===status).length;
  const advice=p.checkpoint;
  const next=recommendations(p.history,r.level,r.topic);
  return '<main class="page"><div class="trail">'+act('home',names[child]+'의 숲','quiet')+'</div><section class="panel result">'+
    mascot+'<p class="eyebrow"><i></i>'+(r.kind==='check'?'시작 확인':'연습 완료')+'</p><h1>'+(r.kind==='check'?'여기서 시작해 봐요!':'끝까지 잘했어요!')+'</h1>'+
    (r.kind==='check'?'<p>덧셈은 <b>'+advice.add+'단계</b>, 뺄셈은 <b>'+advice.sub+'단계</b>부터 연습해 봐요.</p>'+
      (advice.ten?muted('10 만들기도 함께 연습해요.'):'')+(advice.unconfirmed?muted('건너뛴 문제는 아직 확인하지 않았어요.'):'')+
      '<div class="compact center">'+act('advice:add','덧셈 시작','button primary')+act('advice:sub','뺄셈 시작','button')+'</div>':
      '<div class="result-stats">'+[['independent','처음에 혼자'],['hint','도움 받고'],['retry','다시 도전']].map(([id,title])=>'<div><strong>'+count(id)+'</strong><small>'+title+'</small></div>').join('')+'</div>'+
      '<p>'+icon(decorations[(p.rewards-1)%decorations.length])+' 정원에 새 꾸미기 보상이 생겼어요.</p>'+
      (next?'<div class="compact center">'+next+'</div>':'')+
      '<div class="compact center">'+act('garden','정원 꾸미기','button primary')+act('home','내 숲으로','button')+'</div>')+'</section></main>';
}
function gardenView() {
  const p=profile();
  const owned=decorations.slice(0,Math.min(p.rewards,decorations.length));
  const available=owned.map((emoji,i)=>{
    const cap=Math.floor((p.rewards-1-i)/decorations.length)+1;
    const placed=p.garden.filter((item,j)=>item===i&&j!==slot).length;
    return act('plant:'+i,icon(emoji)+'<small>'+Math.max(0,cap-placed)+'</small>','garden-item','aria-label="꾸미기 '+(i+1)+'번, 남은 수 '+Math.max(0,cap-placed)+'" '+(slot===null||placed>=cap?'disabled':''));
  }).join('');
  return '<main class="page"><div class="trail">'+act('home',names[child]+'의 숲','quiet')+'</div><div class="page-heading"><div><h1>'+names[child]+'의 정원</h1>'+
    muted(p.rewards?'자리를 누르고 꽃이나 친구를 골라요.':'문제를 한 묶음 풀면 정원에 친구가 찾아와요.')+'</div><span class="range">보상 '+p.rewards+'개</span></div>'+
    '<section class="garden"><div class="garden-plots">'+Array.from({length:12},(_,i)=>act('slot:'+i,p.garden[i]!=null?icon(decorations[p.garden[i]]):'<span aria-hidden="true">＋</span>','plot'+(slot===i?' selected':''),'aria-label="정원 자리 '+(i+1)+'" aria-pressed="'+(slot===i)+'"')).join('')+'</div></section>'+
    '<div class="garden-tray">'+available+(slot!==null&&p.garden[slot]!=null?act('unplant','거두기','button'):'')+'</div></main>';
}
function historyView() {
  const p=profile();
  const last=p.history.slice(-20).reverse();
  const status={independent:'처음에 혼자',hint:'도움 받고',retry:'다시 도전',skipped:'건너뜀'};
  return '<main class="page"><div class="trail">'+act('home',names[child]+'의 숲','quiet')+'</div><h1>학습 기록</h1>'+
    (!last.length?muted('문제를 풀면 여기에 기록이 쌓여요.'):'<div class="panel history"><p>최근 '+last.length+'문제 · 전체 '+p.history.length+'문제</p>'+
    last.map(x=>'<div class="history-row"><span><strong>'+stageName(x.level)+'</strong><small>'+(x.expression||x.instruction)+' · 정답 '+x.answer+'</small></span><span>'+status[x.status]+(x.hint&&x.status!=='hint'?' · 도움':'')+(x.wrong.length?' · 오답 '+x.wrong.join(', '):'')+'</span><time>'+x.day+'</time></div>').join('')+'</div>')+'</main>';
}
const views={profiles:profilesView,home:homeView,levels:levelsView,group:groupView,setup:setupView,settings:()=>setupView(true),practice:practiceView,result:resultView,garden:gardenView,history:historyView};
function render(focusAction) {
  app.innerHTML=header()+views[screen]()+ (warning?'<div role="alert" class="warning">'+warning+'</div>':'');
  if (focusAction) {
    const target=[...app.querySelectorAll('button[data-do]')].find(node=>node.dataset.do===focusAction&&!node.disabled);
    target?.focus({preventScroll:true});
  }
}
function go(page) {
  if (screen==='practice' && page!=='practice') stopNarration();
  screen=page;
  syncMusic();
  window.scrollTo(0,0);
  render();
  const heading=app.querySelector('h1') || app.querySelector('.question');
  if (heading) {heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
function openStage(level,topic) {
  const p=profile();
  group=groups.findIndex(item=>item[3].includes(level));
  const topics=stages[level][1];
  const format=variantsFor(level).includes(p.format)||p.format==='understand'?p.format:'basic';
  arrangement={level,topic:topics.includes(topic)?topic:p.level===level&&topics.includes(p.topic)?p.topic:topics[0],mode:p.mode,format};
  go('setup');
}
const emptyAttempt=()=>({answers:[],hint:false,correct:false,wrong:false,draft:''});
function start(kind) {
  const p=profile();
  const setup=kind==='practice'?arrangement:p;
  const {level,mode,format}=setup;
  const topic=stages[level][1].includes(setup.topic)?setup.topic:stages[level][1][0];
  if (p.active) {
    if (!window.confirm('풀던 연습을 새 연습으로 바꿀까요? 지금까지의 풀이 기록은 저장돼요.')) return;
    const {attempt}=p.active;
    if (!attempt.correct&&(attempt.answers.length||attempt.hint)) note(true);
    if (p.active.kind==='check') p.unfinishedCheck=p.active.items;
  }
  if (kind==='practice') Object.assign(p,{level,topic,mode,format});
  const questions=kind==='check'?assessment(child):batch(level,topic,format,kind==='review'?reviewTargets(p.history):[]);
  p.active={kind,level,topic,questions,index:0,attempt:emptyAttempt(),items:[]};
  persist();
  go('practice');
  maybeSpeak();
}
function speak(showMessage=true) {
  const p=profile(), q=p.active?.questions[p.active.index];
  if (!q||!p.sound) return;
  const synth=window.speechSynthesis;
  const localVoice=synth?.getVoices().find(voice=>voice.lang.toLowerCase().startsWith('ko')&&voice.localService);
  if (!localVoice) {
    if (showMessage) announce.textContent='이 기기에서 오프라인 한국어 음성을 찾지 못했어요. 화면의 안내를 읽어 주세요.';
    if (showMessage) showSpeechMessage();
    return;
  }
  const instruction=!q.cards&&p.mode!=='picture'&&(q.level===1||q.topic==='zero')?'열매가 몇 개일까요?':q.speech||q.instruction;
  stopNarration();
  const utterance=new SpeechSynthesisUtterance(instruction);
  utterance.voice=localVoice;
  utterance.lang='ko-KR';
  utterance.rate=0.88;
  audio.duck(true);
  utterance.onend=utterance.onerror=()=>audio.duck(false);
  synth.speak(utterance);
}
function showSpeechMessage() {
  const guide=app.querySelector('.guide strong');
  if (guide) guide.textContent=announce.textContent;
}
function maybeSpeak() {if (child==='young') speak(false);}
function note(skip=false) {
  const p=profile(), s=p.active, a=s.attempt;
  const item=record(s.questions[s.index],a.answers,a.hint,skip);
  s.items.push(item);
  if (s.kind!=='check') p.history.push(item);
}
function mark(value) {
  const p=profile(), s=p.active, a=s.attempt;
  if (a.correct) return;
  a.answers.push(Number(value));
  a.correct=Number(value)===s.questions[s.index].answer;
  a.wrong=!a.correct;
  feedback(a.correct?'right':'wrong');
  if (a.correct) note();
  else a.draft='';
  persist();
  announce.textContent=a.correct?'정답이에요!':'한 번 더 생각해 봐요.';
  render(a.correct?'next':p.mode==='pad'?'key:'+value:'answer:'+value);
}
function advance(skip=false) {
  const p=profile(), s=p.active;
  if (!s.attempt.correct&&!skip) return;
  if (skip) note(true);
  if (s.index===s.questions.length-1) {
    if (s.kind==='check') {
      p.checkpoint=assess(child,s.items);
      p.checkpoint.items=s.items;
    } else p.rewards++;
    p.result={kind:s.kind,level:s.level,topic:s.topic,items:s.items};
    p.active=null;
    persist();
    go('result');
    return;
  }
  s.index++;
  s.attempt=emptyAttempt();
  persist();
  go('practice');
  maybeSpeak();
}

app.addEventListener('click',event=>{
  const button=event.target.closest('button[data-do]');
  if (!button || button.disabled) return;
  const [action,value]=button.dataset.do.split(':');
  if (action!=='answer' && !(action==='key' && value==='submit')) feedback('tap',action==='child'?state[value]:profile());
  if (action==='install') {installPrompt?.prompt();return;}
  if (action==='profiles') {child=null;go('profiles');return;}
  if (action==='child') {child=value;go('home');return;}
  if (!child) return;
  const p=profile();
  switch (action) {
    case 'home': go('home');break;
    case 'levels': go('levels');break;
    case 'group': group=Number(value);go('group');break;
    case 'level-back': go('group');break;
    case 'pick': openStage(Number(value));break;
    case 'recommend': {
      const [level,topic]=value.split('.');
      openStage(Number(level),topic);
      break;
    }
    case 'advice': openStage(p.checkpoint[value],value);break;
    case 'settings': arrangement={level:p.level,topic:p.topic,mode:p.mode,format:p.format==='basic'?'basic':'understand'};go('settings');break;
    case 'mode': case 'topic': case 'format': arrangement[action]=value;render(button.dataset.do);break;
    case 'toggle': p[value]=!p[value];persist();render(button.dataset.do);break;
    case 'music-toggle':
      p.music=!p.music;
      if (p.music) audio.unlock();
      syncMusic();
      persist();
      render(button.dataset.do);
      break;
    case 'settings-save': Object.assign(p,{mode:arrangement.mode,format:arrangement.format});persist();go('home');break;
    case 'resume':
      if (p.active) {go('practice');maybeSpeak();}
      else {arrangement={level:p.level,topic:p.topic,mode:p.mode,format:p.format};start('practice');}
      break;
    case 'check':start('check');break;
    case 'review':start('review');break;
    case 'start':start('practice');break;
    case 'speak':speak();break;
    case 'during':p.mode=value;persist();render(button.dataset.do);break;
    case 'hint':
      if (!p.active.attempt.correct) {p.active.attempt.hint=true;persist();render(button.dataset.do);}
      break;
    case 'answer':mark(value);break;
    case 'skip':advance(true);break;
    case 'next':advance();break;
    case 'key':handleKey(value);break;
    case 'history':go('history');break;
    case 'garden':slot=null;go('garden');break;
    case 'slot':slot=Number(value);render(button.dataset.do);break;
    case 'plant':p.garden[slot]=Number(value);persist();render('slot:'+slot);break;
    case 'unplant':p.garden[slot]=null;persist();render('slot:'+slot);break;
  }
});
function handleKey(value) {
  const a=profile().active?.attempt;
  if (!a||a.correct) return;
  if (value==='submit') {if (a.draft) mark(a.draft);return;}
  if (value==='del') a.draft=a.draft.slice(0,-1);
  else if (a.draft.length<4) a.draft=a.draft==='0'?value:a.draft+value;
  persist();
  render('key:'+value);
}
document.addEventListener('keydown',event=>{
  if (screen!=='practice'||profile().mode!=='pad'||profile().active.attempt.correct||event.ctrlKey||event.altKey||event.metaKey) return;
  if (/^\d$/.test(event.key)) {event.preventDefault();feedback('tap');handleKey(event.key);}
  else if (event.key==='Backspace') {event.preventDefault();feedback('tap');handleKey('del');}
  else if (event.key==='Enter'&&document.activeElement?.tagName!=='BUTTON') {event.preventDefault();handleKey('submit');}
});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;render();});
window.addEventListener('appinstalled',()=>{installPrompt=null;render();});
document.addEventListener('visibilitychange',syncMusic);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
    offlineReady=true;
    if(screen==='profiles') render();
  }).catch(()=>{
    offlineReady=false;
  });
}
render();
window.speechSynthesis?.getVoices();

