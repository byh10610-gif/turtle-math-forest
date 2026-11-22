export const groups = [
  ['숫자 놀이', '🌱', '세고, 비교하고, 하나씩', [1,2,3]],
  ['10까지', '🍄', '작은 수의 덧셈과 뺄셈', [4,5,6]],
  ['20까지', '🍃', '10을 만들고 넘어가기', [7,8,9]],
  ['두 자리 계산', '🐿️', '받아올림과 받아내림', [10,11,12]],
  ['곱셈', '🦋', '묶음으로 세고 구구 연습', [13,14]],
  ['수 감각 놀이터', '🐞', '수 읽기·자릿값·크기 비교', [15,16,17]],
  ['도전 연산','🚀','큰 수로 계산하기',[18,19,20,21]]
];
const both = ['mixed','add','sub'];
export const stages = {
  1:['작은 수량 알아보기',['count']], 2:['숫자와 개수 연결',['match','compare','zero']],
  3:['하나 더, 하나 덜',both], 4:['5 이내 덧셈·뺄셈',both],
  5:['가르기·모으기와 10 만들기',['mixed','merge','split','ten']],
  6:['10 이내 덧셈·뺄셈',both],
  7:['10 묶음과 20 이내 기본 계산',['mixed','bundle','add','sub']],
  8:['10을 넘는 덧셈',['add']], 9:['10을 넘나드는 뺄셈',['sub']],
  10:['두 자리 기본 덧셈·뺄셈',both],
  11:['받아올림이 있는 덧셈',['mixed','one','two']],
  12:['받아내림이 있는 뺄셈',['mixed','one','two']],
  13:['곱셈의 뜻 이해하기',['groups']],
  14:['곱셈구구 연습',['mixed','2','3','4','5','6','7','8','9']],
  15:['수 읽기',['read']],16:['자릿값',['place']],17:['크기 비교',['compare']],
  18:['세 자리 덧셈',['add']],19:['세 자리 뺄셈',['sub']],20:['두 자리 수 곱하기 한 자리 수',['multiply']],21:['나누어떨어지는 나눗셈',['divide']]
};
export const labels = {mixed:'골고루',add:'덧셈',sub:'뺄셈',count:'수량 찾기',match:'숫자와 개수',compare:'크기 비교',zero:'0 알아보기',merge:'모으기',split:'가르기',ten:'10 만들기',bundle:'10 묶음',one:'한 자리 수와',two:'두 자리 수끼리',groups:'같은 수의 묶음',read:'수 읽기',place:'자릿값',basic:'기본 계산만',understand:'이해 문제도 함께',calc:'기본',blank:'빈칸',relation:'덧셈과 뺄셈 관계',triple:'세 수 계산',story:'상황과 식'};
export const modes = {picture:'그림 선택',choice:'5지선다',pad:'숫자패드'};
export const variantsFor = level => [4,6,7,8,9,10,11,12].includes(level)
  ? ['blank','relation',...([4,6,7,10].includes(level)?['triple']:[]),'story']
  : [];
export const randomInt = (min,max) => min + Math.floor(Math.random() * (max-min+1));
const pick = list => list[randomInt(0,list.length-1)];
export function shuffle(list) {
  const result = [...list];
  for (let i=result.length-1;i>0;i--) {
    const j=randomInt(0,i);
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
export function options(answer,max=Infinity) {
  const nearby = [];
  for (let d=1;nearby.length<Math.min(8,max);d++) {
    if (answer+d<=max) nearby.push(answer+d);
    if (answer-d>=0 && nearby.length<8) nearby.push(answer-d);
  }
  return shuffle([answer,...shuffle(nearby).slice(0,4)]);
}
const ceilings=[0,5,9,5,5,10,10,20,18,9,99,198,99,25,81,9999,9,9999,1998,899,891,99];
const korean = n => {
  if (!n) return '영';
  return String(n).split('').map((digit,i,all)=>{
    const place=all.length-i-1;
    return Number(digit) ? (digit==='1' && place ? '' : '영일이삼사오육칠팔구'[digit]) + ['', '십','백','천'][place] : '';
  }).join('');
};
const make = (level,topic,answer,data={}) => {
  const q={level,topic,variant:'calc',answer,instruction:'빈칸에 알맞은 답을 골라요.',...data};
  q.choices=data.choices ?? options(answer,ceilings[level]);
  q.signature=JSON.stringify([level,q.topic,q.variant,q.answer,q.expression,q.visual,q.instruction,q.cards?.map(card=>card.text)]);
  return q;
};
function cardsQuestion(level,topic,instruction,cards,hint,extra={}) {
  const ordered=shuffle(cards);
  const answer=ordered.findIndex(card=>card.correct)+1;
  return make(level,topic,answer,{instruction,cards:ordered,choices:ordered.map((_,i)=>i+1),hint,...extra});
}
export function arithmetic(level,a,b,op,variant='calc',topic=op==='+'?'add':'sub',c=0) {
  const result=op==='+'?a+b:op==='−'?a-b:a*b;
  const sign=op==='−'?'빼기':op==='×'?'곱하기':'더하기';
  let hint=op==='+'?'두 수를 순서대로 더해 봐요.':op==='−'?'처음 수에서 두 번째 수만큼 빼 봐요.':'한 묶음의 개수를 묶음 수만큼 더해 봐요.';
  if ([8,11].includes(level)) {
    const needed=10-a%10;
    hint=b>=needed?'먼저 '+needed+'을(를) 더해 '+(a+needed)+'을(를) 만들어요. 그다음 남은 수를 더해 봐요.':hint;
  }
  if ([9,12].includes(level)) hint=a%10
    ? '먼저 '+a%10+'을 빼서 '+(a-a%10)+'을 만들어요. 그다음 남은 수를 빼 봐요.'
    : '십 묶음 하나를 낱개 10개로 바꿔요. 낱개에서 먼저 빼 봐요.';
  const data={a,b,op,hint,speech:a+' '+sign+' '+b+'는 얼마일까요?'};
  const expression=a+' '+op+' '+b;
  if (variant==='blank') return make(level,topic,b,{...data,variant,expression:a+' '+op+' □ = '+result,speech:a+' '+sign+' 빈칸은 '+result+'. 빈칸에 어떤 수가 들어갈까요?',hint:'처음 수 '+a+'에서 결과 '+result+'까지 얼마나 바뀌었는지 살펴봐요.'});
  if (variant==='relation') {
    const total=op==='+'?result:a;
    const part=op==='+'?a:result;
    const relatedOp=op==='+'?'−':'+';
    const left=relatedOp==='−'?total:part;
    const relatedSign=relatedOp==='−'?'빼기':'더하기';
    return make(level,topic,relatedOp==='−'?part:total,{...data,variant,expression:left+' '+relatedOp+' '+b+' = □',instruction:expression+' = '+result+'을 보고 풀어요.',speech:expression+'은 '+result+'. '+left+' '+relatedSign+' '+b+'는 얼마일까요?',hint:'전체는 '+total+'이고, 두 부분을 합치면 전체가 돼요.'});
  }
  if (variant==='triple') {
    const answer=op==='+'?result+c:result-c;
    return make(level,topic,answer,{...data,variant,c,expression:expression+' '+op+' '+c+' = □',speech:a+' '+sign+' '+b+' '+sign+' '+c+'는 얼마일까요?',hint:'앞의 두 수를 먼저 계산한 뒤, 마지막 수를 계산해요.'});
  }
  if (variant==='story') {
    const story='나뭇잎 '+a+'개 중 '+b+'개를 '+(op==='+'?'더 주웠어요.':'먹었어요.');
    const wording=op==='+'?'나뭇잎이 '+a+'개 있었어요. '+b+'개를 더 주웠어요.':story;
    const wrongOp=op==='+'?'−':'+';
    return cardsQuestion(level,topic,wording,[
      {text:expression,correct:true},{text:a+' '+wrongOp+' '+b},
      {text:(a+1)+' '+op+' '+b},{text:a+' '+op+' '+(b+1)},{text:(a+1)+' '+wrongOp+' '+b}
    ],null,{...data,variant:'story',instruction:wording,speech:wording+' 알맞은 식을 찾아요.',hint:op==='+'?'개수가 늘어나는 식을 찾아요.':'개수가 줄어드는 식을 찾아요.'});
  }
  return make(level,topic,result,{...data,expression:expression+' = □'});
}

export function generate(level,selection='mixed',format='basic',forcedVariant) {
  const roll=randomInt;
  if(level===18)return arithmetic(level,roll(100,999),roll(100,999),'+');
  if(level===19){const a=roll(101,999);return arithmetic(level,a,roll(100,a-1),'−');}
  if(level===20)return arithmetic(level,roll(10,99),roll(2,9),'×','calc','multiply');
  if(level===21){
    const answer=roll(2,25),b=roll(2,9),a=answer*b;
    return make(level,'divide',answer,{a,b,op:'÷',expression:a+' ÷ '+b+' = □',hint:b+'에 어떤 수를 곱하면 '+a+'이 될까요?'});
  }
  const selectable=stages[level][1].filter(k=>k!=='mixed' && !(level===7 && ['blank','relation','triple','story'].includes(format) && k==='bundle'));
  const topic=selection==='mixed'?pick(selectable):selection;
  const add=topic==='add';
  const op=add?'+':'−';
  const available=level===7&&topic==='bundle'?[]:variantsFor(level);
  const variant=forcedVariant ?? (format==='understand'?pick(['calc',...available]):available.includes(format)?format:'calc');
  if (level===1 || (level===2 && topic==='zero')) {
    const n=level===1?roll(1,5):0;
    return make(level,topic,n,{instruction:n+'개 있는 그림을 찾아요.',speech:korean(n)+' 개 있는 그림을 찾아요.',hint:'그림을 하나씩 짚으며 세어 봐요. 빈 칸에는 아무것도 없어요.'});
  }
  if (level===2 && topic==='match') {
    const n=roll(1,9);
    return make(level,topic,n,{instruction:'열매가 몇 개일까요?',visual:[n],hint:'열매를 왼쪽부터 하나씩 세어요.'});
  }
  if (level===2 || level===17) {
    const max=level===2?9:9999;
    const a=roll(1,max-1), b=roll(a+1,max);
    const more=roll(0,1)===1;
    return cardsQuestion(level,topic,more?'더 많은 쪽을 골라요.':'더 적은 쪽을 골라요.',[
      {text:String(a),quantity:a,correct:!more},{text:String(b),quantity:b,correct:more}
    ],level===2?'두 그림의 개수를 각각 세어 봐요.':'왼쪽의 큰 자릿값부터 비교해요.',{compare:true});
  }
  if (level===3) {
    const n=add?roll(1,4):roll(1,5);
    return make(level,topic,n+(add?1:-1),{instruction:'열매가 '+n+'개 있어요. '+(add?'하나 더 생겼어요.':'하나가 줄었어요.'),visual:[n],expression:add?'+ 1':'− 1',hint:'열매를 세고, 하나 '+(add?'더해요.':'빼요.')});
  }
  if (level===5) {
    const total=topic==='ten'?10:roll(4,10), part=roll(1,total-1);
    if (topic==='merge') return make(level,topic,total,{instruction:'두 묶음을 모으면 모두 몇 개일까요?',expression:part+' + '+(total-part)+' = □',visual:[part,total-part],hint:'두 묶음의 열매를 모두 세어요.'});
    return make(level,topic,total-part,{instruction:topic==='ten'?'몇 개를 채우면 10이 될까요?':'나머지 한 묶음은 몇 개일까요?',expression:part+' + □ = '+total,visual:[part],frame:total,hint:'빈 자리가 몇 칸인지 세어 봐요.'});
  }
  if (level===7 && topic==='bundle') {
    const b=roll(1,10);
    return make(level,topic,10+b,{instruction:b===10?'10 묶음 둘을 모두 세어요.':'10 묶음과 낱개를 모두 세어요.',visual:[10,b],expression:'10 + '+b+' = □',hint:b===10?'한 묶음이 10이면 둘은 20이에요.':'한 묶음은 10이에요. 거기에 낱개를 더해요.'});
  }
  if (level===13 || level===14) {
    const a=level===13?roll(2,5):topic==='mixed'?roll(2,9):Number(topic);
    const b=roll(1,level===13?5:9);
    const q=arithmetic(level,a,b,'×','calc',topic==='mixed'?String(a):topic);
    if (level===13) {
      q.visual=Array(b).fill(a);
      q.instruction='한 묶음에 '+a+'개씩 있어요. 모두 몇 개일까요?';
      q.speech=q.instruction;
    }
    return q;
  }
  if (level===15) {
    const n=roll(10,9999);
    return make(level,topic,n,{instruction:'‘'+korean(n)+'’을 수로 나타내요.',hint:'천, 백, 십, 일 순서로 생각해요.'});
  }
  if (level===16) {
    const n=roll(1000,9999);
    const place=roll(0,3), digit=Number(String(n)[3-place]), unit=['일','십','백','천'][place];
    return make(level,topic,digit,{instruction:unit+'의 자리 숫자는 무엇일까요?',expression:String(n),hint:'오른쪽부터 일, 십, 백, 천의 자리예요.',choices:options(digit,9)});
  }
  let a,b,c=0;
  if (level===4 || level===6) {
    const max=level===4?5:10, triple=variant==='triple';
    a=roll(triple && !add?2:1,max-(add?(triple?2:1):0));
    b=roll(1,add?max-a-(triple?1:0):a-(triple?1:0));
    if (triple) c=roll(1,add?max-a-b:a-b);
  }
  if (level===7) {
    const triple=variant==='triple';
    a=roll(add?10:(triple?12:11),add?(triple?17:18):19);
    b=roll(1,add?19-a-(triple?1:0):a-10-(triple?1:0));
    if (triple) c=roll(1,add?19-a-b:a-10-b);
  }
  if (level===8) {a=roll(2,9);b=roll(11-a,9);}
  if (level===9) {a=roll(11,18);b=roll(a%10+1,9);}
  if (level===10) {
    const triple=variant==='triple';
    const aT=roll(!add&&triple?2:1,add?(triple?7:8):9), aU=roll(0,9);
    const bT=roll(1,add?9-aT-(triple?1:0):aT-(triple?1:0)), bU=roll(0,add?9-aU:aU);
    a=aT*10+aU;
    b=bT*10+bU;
    if (triple) c=roll(1,add?9-aT-bT:aT-bT)*10+roll(0,add?9-aU-bU:aU-bU);
  }
  if (level===11) {
    const unit=roll(1,9);
    a=roll(1,9)*10+unit;
    b=(topic==='two'?roll(1,9)*10:0)+roll(10-unit,9);
  }
  if (level===12) {
    const tens=roll(topic==='two'?2:1,9), unit=roll(0,8);
    a=tens*10+unit;
    b=(topic==='two'?roll(1,tens-1)*10:0)+roll(unit+1,9);
  }
  const q=arithmetic(level,a,b,level===11?'+':level===12?'−':op,variant,topic,c);
  if (level===4 && variant==='calc') q.visual=add?[a,b]:[a];
  return q;
}

export function assessment(profile) {
  if (profile==='young') return [
    ...[2,4].map(n=>make(1,'count',n,{instruction:n+'개 있는 그림을 찾아요.',hint:'열매를 하나씩 세어 봐요.'})),
    ...[5,7].map(n=>make(2,'match',n,{instruction:'열매가 몇 개일까요?',visual:[n],hint:'열매를 하나씩 세어 봐요.'})),
    generate(3,'add'),generate(3,'sub')
  ];
  return [
    arithmetic(6,4,3,'+'),arithmetic(6,9,4,'−'),
    arithmetic(5,6,4,'+','blank','ten'),
    arithmetic(7,10,3,'+','calc','bundle'),arithmetic(7,17,7,'−'),arithmetic(7,17,10,'−'),
    arithmetic(8,8,5,'+'),arithmetic(9,13,6,'−'),
    arithmetic(8,7,6,'+'),arithmetic(9,15,7,'−')
  ];
}
const key='turtle-math-forest.v1';
export const fresh = profile => ({mode:'choice',inputVersion:2,level:profile==='older'?7:1,topic:'mixed',format:'basic',history:[],checkpoint:null,active:null,result:null,rewards:0,garden:[],sound:true,music:true,effects:true,haptics:true});
export function load(storage) {
  let raw;
  try {raw=JSON.parse(storage.getItem(key));} catch {}
  return Object.fromEntries(['older','young'].map(id=>{
    const saved=raw?.[id];
    const profile={...fresh(id),...saved};
    if (saved && saved.inputVersion!==2) {
      profile.mode='choice';
      profile.inputVersion=2;
      for (const q of profile.active?.questions ?? []) {
        if (q.cards || q.choices.length>=5) continue;
        const extra=options(q.answer,ceilings[q.level]).filter(value=>!q.choices.includes(value));
        q.choices.push(...extra.slice(0,5-q.choices.length));
      }
    }
    return [id,profile];
  }));
}
export function save(storage,state) {storage.setItem(key,JSON.stringify(state));}
export function saveGardenLayout(storage,id,layout) {
  const raw=storage.getItem(key);
  const saved=raw===null?{}:JSON.parse(raw);
  saved[id]={...saved[id],gardenV2:layout};
  storage.setItem(key,JSON.stringify(saved));
}
export function record(question,answers,hint,skip=false,date=new Date()) {
  const localDay=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
  const wrong=answers.filter(answer=>answer!==question.answer);
  const status=skip?'skipped':wrong.length?'retry':hint?'hint':'independent';
  const {level,topic,variant,signature,answer,expression,instruction}=question;
  return {level,topic,variant,signature,answer,expression,instruction,answers:[...answers],hint,wrong,status,day:localDay};
}
const topicKey = item => [item.level,item.topic,item.variant].join('.');
export function reviewTargets(history) {
  const scores=new Map();
  for (const item of history.slice(-150)) {
    const key=topicKey(item);
    const current=scores.get(key)?.score ?? 0;
    scores.set(key,{item,score:item.status==='independent'?Math.max(0,current-1):current+(item.wrong.length?3:2)});
  }
  return [...scores.values()].filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.item);
}
export function batch(level,topic,format,review=[],previous=[]) {
  const questions=[];
  for (let i=0;i<5;i++) {
    const target=review[i%review.length];
    let q;
    for (let attempt=0;attempt<40;attempt++) {
      q=target?generate(target.level,target.topic,format,target.variant):generate(level,topic,format);
      if (q.signature!==target?.signature && !previous.includes(q.signature) && !questions.some(other=>other.signature===q.signature)) break;
    }
    questions.push(q);
  }
  return questions;
}
export function nextSuggestion(history,level,topic) {
  if (level>=14) return null;
  const forLevel=history.filter(item=>item.level===level && (topic==='mixed'||topic===item.topic)).slice(-12);
  const success=forLevel.filter(item=>item.status==='independent');
  const days=new Set(success.map(item=>item.day));
  const distinct=new Set(success.map(item=>item.signature));
  const recentIssues=forLevel.slice(-5).filter(item=>item.status!=='independent').length;
  if (distinct.size<4 || days.size<2 || recentIssues>1) return null;
  if (level===7 && topic==='sub') return 9;
  if (level===8 && topic==='add') return 10;
  if (level===10 && topic==='sub') return 12;
  return level+1;
}
export function assess(profile,results) {
  const good=i=>results[i]?.status==='independent';
  if (profile==='young') {
    const count=[0,1].every(good), connect=[2,3].every(good);
    const add=count&&connect&&good(4)?3:count?2:1;
    const sub=count&&connect&&good(5)?3:count?2:1;
    return {add,sub,ten:false,unconfirmed:results.some(x=>x.status==='skipped')};
  }
  return { add:good(6)||good(8)?8:good(0)&&good(3)?7:6,
    sub:good(7)||good(9)?9:good(1)&&(good(4)||good(5))?7:6,
    ten:!good(2),unconfirmed:results.some(x=>x.status==='skipped')};
}

