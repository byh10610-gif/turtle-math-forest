/* Pure geometry shared by the interactive garden and Node verification. */
(function(root){
  'use strict';
  const POND={x:.77,y:.565,rx:.225,ry:.185};
  const FISH={x:.77,y:.565,rx:.157,ry:.105};
  const FOLIAGE=[{x:.16,y:.42},{x:.32,y:.38},{x:.48,y:.40},{x:.64,y:.36},{x:.87,y:.37},{x:.39,y:.75}];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const ellipse=(p,e=POND)=>((p.x-e.x)/e.rx)**2+((p.y-e.y)/e.ry)**2;
  const inPond=p=>ellipse(p)<=1;
  function fishPoint(p){
    const dx=p.x-FISH.x,dy=p.y-FISH.y,d=Math.sqrt(ellipse(p,FISH));
    return d<=1?{x:p.x,y:p.y}:{x:FISH.x+dx/d,y:FISH.y+dy/d};
  }
  function canWalk(p){return p.x>=.13&&p.x<=.89&&p.y>=.49&&p.y<=.90&&ellipse(p)>1.16;}
  function landPoint(p){
    const q={x:clamp(p.x,.13,.89),y:clamp(p.y,.49,.90)};
    if(canWalk(q))return q;
    let best={x:.43,y:.69},score=Infinity;
    for(let x=.13;x<=.89;x+=.01)for(let y=.49;y<=.90;y+=.01){
      const a={x,y};if(canWalk(a)&&dist(q,a)<score){best=a;score=dist(q,a);}
    }
    return best;
  }
  function segmentSafe(a,b){
    if(!canWalk(a)||!canWalk(b))return false;
    // Minimize the exact ellipse metric along the whole segment, including
    // the space between rendered frames. The rectangular bounds are convex.
    const ax=(a.x-POND.x)/POND.rx,ay=(a.y-POND.y)/POND.ry;
    const dx=(b.x-a.x)/POND.rx,dy=(b.y-a.y)/POND.ry;
    const d=dx*dx+dy*dy,t=d?clamp(-(ax*dx+ay*dy)/d,0,1):0;
    return (ax+dx*t)**2+(ay+dy*t)**2>1.16;
  }
  function walkPath(from,to){
    const start=landPoint(from),end=landPoint(to);
    if(segmentSafe(start,end))return[end];
    const nodes=[start,end,{x:.42,y:.50},{x:.43,y:.66},{x:.46,y:.79},{x:.53,y:.83},{x:.64,y:.83},{x:.76,y:.83},{x:.87,y:.83},{x:.30,y:.82}];
    const costs=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set();costs[0]=0;
    while(done.size<nodes.length){
      let u=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(u<0||costs[i]<costs[u]))u=i;
      if(u<0||!Number.isFinite(costs[u]))break;
      if(u===1)break;done.add(u);
      for(let v=0;v<nodes.length;v++)if(!done.has(v)&&segmentSafe(nodes[u],nodes[v])){
        const d=costs[u]+dist(nodes[u],nodes[v]);if(d<costs[v]){costs[v]=d;prev[v]=u;}
      }
    }
    if(!Number.isFinite(costs[1]))return[start];
    const out=[];for(let i=1;i>0;i=prev[i]){if(i<0)break;out.unshift(nodes[i]);}return out;
  }
  const api={POND,FISH,FOLIAGE,clamp,dist,ellipse,inPond,fishPoint,canWalk,landPoint,segmentSafe,walkPath};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.GardenGeometry=api;
})(typeof window!=='undefined'?window:null);
