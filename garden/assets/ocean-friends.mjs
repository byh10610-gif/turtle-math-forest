// Each entry keeps a stable reward kind, a name, and a full-body illustration.
const fish = (name, shape, body, fin, marks = 'belly') => ({name,shape,body,fin,marks});
const other = (name, shape, body, fin) => ({name,shape,body,fin});
export const newOceanFriends = Object.freeze({
  clownfish:fish('흰동가리','round','#e9905b','#b9634b','clown'),
  'blue-tang':fish('블루탱','oval','#708bd2','#e7c462','tang'),
  'yellow-tang':fish('옐로탱','oval','#edcf65','#d9a94f'),
  butterflyfish:fish('나비고기','tall','#ead797','#d9ae5a','eye-stripe'),
  angelfish:fish('천사고기','angel','#b2c8bf','#709a9b','stripes'),
  'moorish-idol':fish('뿔나비고기','banner','#f4deb5','#c6a454','banner'),
  parrotfish:fish('앵무고기','round','#7bbea3','#dc9da4','scales'),
  lionfish:fish('쏠배감펭','lion','#d29a80','#ad7162','stripes'),
  triggerfish:fish('쥐치','tall','#93b2ad','#d6b876','trigger'),
  anthias:fish('안티아스','round','#e7a1ae','#bd718d','scales'),
  goby:fish('망둑어','slim','#bda98e','#8e8471','spots'),
  sardine:fish('정어리','slim','#b3cbd0','#7eabbb','spots'),
  anchovy:fish('멸치','slim','#d6d6cc','#9bb3bf','belt'),
  tuna:fish('참다랑어','torpedo','#789aaa','#597e98'),
  mackerel:fish('고등어','torpedo','#86b4b1','#65958f','mackerel'),
  marlin:fish('청새치','spear','#72a3ba','#517ca4','belt'),
  flyingfish:fish('날치','flying','#99bacf','#75a7be','belt'),
  lanternfish:fish('샛비늘치','slim','#8d7eaa','#645e8b','lights'),
  moray:other('곰치','eel','#ad9d69','#79744e'),
  'ribbon-eel':other('리본곰치','ribbon','#739aca','#eed17a'),
  hammerhead:other('귀상어','hammer','#9aafb8','#647f8e'),
  'whale-shark':other('고래상어','spotted-shark','#86a5ba','#617e94'),
  'reef-shark':other('산호초상어','shark','#9ba8bb','#62778f'),
  ray:other('만타가오리','manta','#8798ad','#63748c'),
  stingray:other('노랑가오리','stingray','#b99e8d','#e7c28d'),
  beluga:other('흰고래','beluga','#dce7df','#a2c5c9'),
  orca:other('범고래','orca','#566573','#eef4e9'),
  seal:other('물범','seal','#a3aeb4','#798e9a'),
  'sea-lion':other('바다사자','sea-lion','#bf987a','#98735f'),
  'sea-otter':other('해달','otter','#a98468','#e4c9a6'),
  'sea-turtle':other('바다거북','turtle','#8eaf92','#779476'),
  nautilus:other('앵무조개','nautilus','#d4a58b','#9a716a'),
  cuttlefish:other('갑오징어','cuttle','#d1a8b4','#a07f9a'),
  starfish:other('불가사리','star','#dd9d87','#f5c9aa'),
  urchin:other('성게','urchin','#9b90bc','#786797'),
  'sea-cucumber':other('해삼','cucumber','#aab47e','#82915e'),
  scallop:other('가리비','scallop','#dbb1be','#a6819c'),
});

export const restsOnSeafloor = kind => ['starfish','urchin','sea-cucumber','scallop'].includes(kind);

const eye = (x,y) => `<ellipse cx="${x}" cy="${y}" rx="5.7" ry="6.4" fill="#3e4b55"/><circle cx="${x-1.4}" cy="${y-1.9}" r="2" fill="#fffdf2"/>`;
const line = (d,color='#52636c',width=2) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const path = (d,color) => `<path d="${d}" fill="${color}"/>`;
const oval = (x,y,rx,ry,color) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/>`;

const fishShapes = {
  round:'M38 80Q59 49 101 52Q137 55 146 81Q135 110 97 112Q57 114 38 85Z',
  oval:'M38 81Q68 40 104 45Q135 49 145 78Q137 110 101 116Q62 118 38 87Z',
  tall:'M39 80Q58 44 98 40Q128 47 145 77Q130 116 96 122Q58 113 39 86Z',
  angel:'M39 81Q61 56 96 30Q121 42 145 77Q124 116 100 130Q64 107 39 88Z',
  banner:'M39 82Q70 51 88 34Q106 35 118 52Q132 60 146 76L139 84Q116 112 97 117Q65 117 39 89Z',
  lion:'M39 82Q61 54 96 51Q133 55 145 80Q132 109 100 111Q60 110 39 89Z',
  slim:'M37 81Q67 60 105 66Q132 69 148 82Q132 98 98 99Q61 101 37 87Z',
  torpedo:'M40 81Q76 55 110 64Q134 68 151 82Q126 101 96 103Q61 102 40 87Z',
  spear:'M40 81Q77 55 110 63Q134 68 140 81L155 86L136 88Q117 103 88 102Q62 100 40 86Z',
  flying:'M40 81Q73 61 109 67Q135 71 148 83Q125 102 92 99Q61 100 40 87Z',
};
const finPaths = {
  angel:'M101 89Q77 117 72 146Q69 112 90 85Z',
  banner:'M82 47Q71 13 32 25Q64 25 70 56Z',
  lion:'M53 66L46 38L64 57L62 29L77 52L80 24L91 51L106 32L106 60Z M89 84L46 133L77 130L100 94Z',
  spear:'M54 72Q66 31 110 32Q98 50 91 68Z',
  flying:'M85 84Q77 53 38 50Q46 70 68 90Q47 102 40 122Q75 116 96 91Z',
};
const marks = {
  clown:()=>line('M59 55Q48 84 60 115M106 51Q96 76 106 115','#fff1d7',11),
  tang:()=>line('M51 74Q78 59 110 59Q98 76 114 89Q85 101 57 92','#4d6198',9),
  'eye-stripe':()=>line('M126 50Q115 75 127 106','#817368',9)+line('M58 52Q48 77 57 108','#d9ae5a',8),
  stripes:()=>line('M61 42Q52 76 69 128M85 40Q76 81 92 128M110 43Q99 76 111 110','#896f70',7),
  banner:()=>line('M63 49Q54 80 74 116M104 40Q90 76 109 111','#6b6464',11),
  scales:()=>line('M64 75q6 11 12 0m7 6q6 11 12 0m-19 13q6 10 12 0','#f2dec2',2.8),
  trigger:()=>path('M47 50L111 96L97 117L48 85Z','#e4ca91')+line('M123 65l5 15','#658b99',4),
  spots:()=>[[57,79],[67,73],[78,77],[90,73],[101,78]].map(([x,y])=>oval(x,y,2.6,2.4,'#677b80')).join(''),
  belt:()=>line('M38 87Q94 90 140 84','#f2ecd3',4),
  mackerel:()=>line('M53 67l6 10m6-14l7 10m6-14l6 10m7-12l6 10m8-9l5 10','#527974',3),
  lights:()=>[54,64,74,85,97,106].map(x=>oval(x,92,2.8,2.8,'#f1d891')).join(''),
};
function fishDrawing(spec,uid) {
  const {shape,body,fin}=spec;
  const outline=fishShapes[shape];
  const tail=shape==='torpedo'||shape==='spear'?'M44 84L17 54L22 81L15 113L44 88Z':'M45 82Q29 66 17 64L24 83L17 104Q31 103 46 88Z';
  const fins=finPaths[shape]||'M60 68Q76 45 100 49L95 69Z M86 88Q73 110 70 114Q91 110 103 90Z';
  return path(tail,fin)+path(fins,fin)+path(outline,body)
    +`<clipPath id="${uid}">${path(outline,'white')}</clipPath><g clip-path="url(#${uid})">`
    +path('M28 93Q79 110 153 84L164 134H30Z','#fff0d2')+(marks[spec.marks]?.()||'')+'</g>'
    +path('M105 89Q94 87 81 101Q97 107 108 93Z',fin)+eye(127,76)+line('M137 86q4 3 8 0');
}

function shark(spec) {
  const {shape,body,fin}=spec;
  const head=shape==='hammer'?'Q123 61 131 64L140 57Q150 62 148 73L156 81Q149 91 142 88L128 93':'Q137 64 151 77Q148 89 129 94';
  const dots=shape==='spotted-shark'?[[48,76],[57,71],[68,79],[76,68],[88,75],[99,65],[110,72],[121,70],[132,76]].map(([x,y])=>oval(x,y,2.4,2.1,'#e9e5d1')).join(''):'';
  return path('M43 81Q22 75 14 51Q12 76 26 84L14 108Q33 105 43 88Z',fin)
    +path('M65 74L87 40Q95 41 98 73Z',fin)
    +path('M35 83Q66 61 104 63'+head+'Q86 109 36 88Z',body)
    +path('M55 91Q108 99 144 81Q131 102 83 101Z','#ecdfc8')+path('M94 85L79 113Q96 113 108 92Z',fin)
    +dots+eye(shape==='hammer'?141:130,75)+line('M135 86q6 1 10-2');
}
function eel(spec) {
  const ribbon=spec.shape==='ribbon';
  const spine='M21 113C43 111 39 63 65 63C88 63 90 113 112 100C132 88 108 52 126 46Q137 41 147 46';
  return line(spine,spec.fin,ribbon?12:21)+line(spine,spec.body,ribbon?7:15)
    +path(ribbon?'M121 45Q124 24 130 32L134 43L148 41L142 48Z':'M126 40Q142 33 152 42Q155 50 144 57L127 55Z',spec.body)
    +eye(138,45)+line('M143 51l8-2',spec.fin);
}
function ray(spec) {
  const manta=spec.shape==='manta';
  return line('M77 108Q89 124 69 144',spec.fin,4)
    +path(manta?'M80 111Q35 111 12 57Q57 80 66 54L63 39L75 48H87L101 37L97 56Q109 80 151 57Q126 109 80 111Z':'M80 110Q33 98 19 73Q40 70 53 51Q79 29 107 51Q121 70 142 73Q129 99 80 110Z',spec.body)
    +path('M45 83Q82 106 119 83Q109 109 80 114Q56 110 45 83Z','#e5d7c4')
    +line('M67 75Q80 86 97 75',spec.fin,3)+eye(72,66)+eye(90,66);
}
function whale(spec) {
  const orca=spec.shape==='orca';
  return path('M46 88Q25 92 14 68Q13 87 29 98Q16 106 15 114Q39 112 53 95Z',spec.body)
    +(orca?path('M80 70Q84 40 94 30Q106 42 103 69Z',spec.body):'')
    +path('M36 91Q63 59 100 57Q134 42 147 68Q158 92 140 104Q103 122 36 98Z',spec.body)
    +path('M46 94Q96 115 146 87Q147 109 111 112Q72 114 46 99Z',orca?'#f2f0de':'#f8f2e1')
    +(orca?oval(123,75,12,6,spec.fin):'')
    +path('M103 88Q90 92 83 109Q99 114 115 94Z',orca?spec.body:spec.fin)
    +eye(134,78)+line('M138 89q6 3 11-2');
}
function pinniped(spec) {
  const lion=spec.shape==='sea-lion';
  return path('M49 114Q27 130 16 121L23 107L13 101Q30 98 55 107Z',spec.fin)
    +path(lion?'M33 113Q47 88 82 89Q95 87 99 56Q104 35 128 41Q143 47 138 67Q129 77 119 84Q119 111 95 122Q55 128 33 113Z':'M33 111Q49 85 85 88Q93 63 113 60Q140 59 144 82Q141 105 116 114Q69 129 33 111Z',spec.body)
    +path('M81 105Q68 129 53 127Q65 107 76 101Z',spec.fin)
    +(lion?path('M101 102Q111 116 105 133L124 134Q129 117 115 98Z',spec.fin)+oval(108,57,5,8,spec.fin):oval(73,101,6,3,spec.fin)+oval(92,94,4,3,spec.fin))
    +eye(lion?124:127,lion?56:77)+oval(lion?136:141,lion?65:87,4,3,'#64565a')
    +line(lion?'M132 71l12 1m-13 1l9 4':'M133 90l17 3m-18 0l13 5');
}
function otter(spec) {
  return path('M113 101Q140 101 149 118Q129 126 109 113Z',spec.body)
    +oval(83,96,41,25,spec.body)+oval(78,93,29,17,spec.fin)
    +oval(44,84,27,24,spec.body)+oval(29,68,8,8,spec.body)+oval(47,64,7,8,spec.body)
    +oval(43,93,16,11,spec.fin)+oval(112,107,13,8,spec.body)
    +oval(64,90,10,6,spec.body)+oval(84,85,9,7,spec.body)+oval(74,89,8,6,'#a8a2ae')
    +eye(39,81)+oval(32,90,4,3,'#5b4e49');
}
function seaTurtle(spec) {
  return path('M55 91Q23 89 16 108Q22 119 63 103ZM86 94Q56 119 65 128Q83 132 106 101Z',spec.fin)
    +oval(79,78,38,26,'#87996b')+oval(79,75,31,18,'#c6bd7b')
    +line('M53 68l16 9l-6 13m6-13l19-7l12 11m-12-11l-6-11','#82916b',3)
    +oval(124,78,21,16,spec.body)+eye(129,74)+line('M135 84q4 1 8-1')
    +path('M101 84Q91 103 113 117Q122 122 122 115Q121 100 111 89Z',spec.body);
}
function tentacled(spec) {
  const cuttle=spec.shape==='cuttle';
  const arms=[65,74,83,92,101].map((y,i)=>line('M117 '+y+'q17 '+(i-2)*4+' 28 '+(i-2)*7,spec.fin,4)).join('');
  return arms+(cuttle
    ?path('M21 79Q47 50 100 61Q116 59 118 79Q118 103 92 102Q45 109 21 79Z',spec.fin)
      +oval(71,81,42,16,spec.body)+line('M48 73l6 12m9-16l5 18m11-18l5 17',spec.fin,3)
    :oval(68,79,42,38,spec.body)+line('M32 69q10 14 5 33m10-53q17 23 9 59m10-62q18 20 12 52m7-48q12 17 11 34',spec.fin,4)
      +line('M45 82q6-20 21-12q13 8 2 19q-7 4-11-3','#f3d6bb',3))
    +oval(113,81,16,14,spec.body)+eye(119,78);
}
function seafloor(spec) {
  const {shape,body,fin}=spec;
  if(shape==='star')return path('M79 29Q84 29 88 43L99 65L125 61Q139 60 129 73L108 92L117 117Q121 136 106 125L81 108L55 126Q41 133 45 116L53 91L28 73Q15 60 34 61L61 65L72 38Q75 29 79 29Z',body)+[56,69,82,95,108].map((x,i)=>oval(x,81+(i%2)*11,3,3,fin)).join('');
  if(shape==='urchin')return Array.from({length:18},(_,i)=>`<g transform="rotate(${i*20} 80 83)">${line('M80 50L80 33',fin,4)}</g>`).join('')+oval(80,83,35,33,body)+[58,70,82,94,104].map((x,i)=>oval(x,76+(i%2)*14,3,3,fin)).join('');
  if(shape==='cucumber')return path('M22 105Q15 83 34 77Q57 70 79 81Q99 83 120 70Q139 63 145 77Q152 96 126 105Q88 122 38 115Q28 113 22 105Z',body)+[37,50,63,79,95,111,127].map((x,i)=>oval(x,86+(i%2)*9,3,3,fin)).join('');
  return path('M78 117Q38 107 22 71Q20 56 34 56Q36 45 51 46Q59 34 74 42Q84 32 96 43Q108 36 121 51Q140 51 139 68Q125 106 83 117Z',body)+line('M80 108L37 63M80 108L55 53M80 108L75 48M80 108L97 49M80 108L118 59M80 108L130 68',fin,3)+path('M68 110Q81 104 94 110L90 123H70Z',fin);
}
export function oceanArtwork(kind,id) {
  const spec=newOceanFriends[kind];
  if(!spec)return '';
  const uid='sea-'+String(id||kind).replace(/[^\w-]/g,'-');
  let illustration;
  if(fishShapes[spec.shape]) illustration=fishDrawing(spec,uid);
  else if(['hammer','spotted-shark','shark'].includes(spec.shape)) illustration=shark(spec);
  else if(['eel','ribbon'].includes(spec.shape)) illustration=eel(spec);
  else if(['manta','stingray'].includes(spec.shape)) illustration=ray(spec);
  else if(['beluga','orca'].includes(spec.shape)) illustration=whale(spec);
  else if(['seal','sea-lion'].includes(spec.shape)) illustration=pinniped(spec);
  else if(spec.shape==='otter') illustration=otter(spec);
  else if(spec.shape==='turtle') illustration=seaTurtle(spec);
  else if(['nautilus','cuttle'].includes(spec.shape)) illustration=tentacled(spec);
  else illustration=seafloor(spec);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="garden-art art-${kind}" viewBox="0 0 160 160" aria-hidden="true" focusable="false">${illustration}</svg>`;
}
