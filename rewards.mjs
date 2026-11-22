import {LEGACY_CATALOG} from './garden/integration/legacy-adapter.mjs';

export const PAGE_SIZE=5;
export const REWARD_SIZE=10;
export const OCEAN_GOAL=200;
export const landFriends={
  hedgehog:['고슴도치','🦔'], fox:['여우','🦊'], frog:['개구리','🐸'],
  bee:['꿀벌','🐝'], bird:['아기 새','🐦'], owl:['부엉이','🦉'],
  raccoon:['너구리','🦝'], chipmunk:['줄무늬 다람쥐','🐿️'], deer:['아기 사슴','🦌'],
  mouse:['들쥐','🐭'], beetle:['장수풍뎅이','🪲'], grasshopper:['메뚜기','🦗'],
  strawberry:['딸기 모종','🍓'], lavender:['라벤더','🪻'],
};
export const oceanFriends={
  seahorse:['해마','🐠'], octopus:['문어','🐙'], jellyfish:['해파리','🪼'],
  crab:['꽃게','🦀'], dolphin:['돌고래','🐬'], whale:['아기 고래','🐳'],
  puffer:['복어','🐡'], tropical:['열대어','🐟'], squid:['오징어','🦑'],
  shrimp:['새우','🦐'], lobster:['바닷가재','🦞'], shell:['조개','🐚'], coral:['산호','🪸'],
};
const order=[
  'fish','snail','dragonfly','firefly','hedgehog','frog','bee','fox','owl',
  'octopus','tree','jellyfish','flower','crab','bird','dolphin',
  ...Object.keys(landFriends),...Object.keys(oceanFriends),...LEGACY_CATALOG,
];
export const solvedCount=profile=>profile.history.filter(item=>['independent','hint','retry'].includes(item.status)).length;
export const oceanOpen=profile=>solvedCount(profile)>=OCEAN_GOAL;
export const oceanKind=kind=>Object.hasOwn(oceanFriends,kind);
export function awardFriend(profile,items) {
  if (items.filter(item=>item.status!=='skipped').length<REWARD_SIZE) return null;
  const owned=new Set(Array.from({length:Math.min(profile.rewards,LEGACY_CATALOG.length)},(_,i)=>LEGACY_CATALOG[i]));
  for (const {kind} of profile.extraRewards??[]) owned.add(kind);
  const open=oceanOpen(profile);
  const kind=order.find(candidate=>!owned.has(candidate)&&(open||!oceanKind(candidate)));
  if (!kind) return null;
  profile.extraRewards=[...(profile.extraRewards??[]),{id:'friend-'+kind,kind}];
  return kind;
}

const ages=['','만 3–4세','만 4–5세','만 4–6세','만 5–6세','만 5–7세','만 6–7세','만 6–7세','만 6–8세','만 6–8세','만 7–8세','만 7–8세','만 7–8세','만 7–8세','만 7–8세','만 6–8세','만 7–8세','만 6–8세'];
export const ageHint=level=>ages[level]||'';


export const turtleMeals=Object.freeze({
  lettuce:['상추 잎','🥬'], cucumber:['오이 조각','🥒'],
  carrot:['당근 조각','🥕'], strawberry:['딸기 한 조각','🍓'],
  sweetPotato:['고구마 조각','🍠'], dandelion:['민들레 꽃','🌼'],
  apple:['사과 조각','🍎'], blueberry:['블루베리 한 알','🫐'],
  pepper:['파프리카 조각','🫑'], watermelon:['수박 한 조각','🍉'],
});
export function awardMeal(profile,items) {
  if (items.filter(item=>item.status!=='skipped').length<REWARD_SIZE) return null;
  const options=Object.keys(turtleMeals).filter(kind=>kind!==profile.result?.meal);
  const kind=options[Math.floor(Math.random()*options.length)];
  profile.turtleFood={...profile.turtleFood,[kind]:(profile.turtleFood?.[kind]??0)+1};
  return kind;
}
