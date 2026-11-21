let model;
function weights() {
  if(!model) model=fetch('./digits.bin').then(async r=>{
    if(!r.ok) throw Error('model');
    const w=new Float32Array(await r.arrayBuffer());
    if(w.length!==21370) throw Error('model size');
    return w;
  }).catch(err=>{model=null;throw err});
  return model;
}
function recognize(canvas,w) {
  const ctx=canvas.getContext('2d'), size=canvas.width;
  const rgba=ctx.getImageData(0,0,size,size).data;
  let left=size,right=-1,top=size,bottom=-1;
  for(let i=0;i<size*size;i++) if(rgba[4*i+3]>25) {
    const x=i%size,y=Math.floor(i/size);
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)return '';
  const width=right-left+1,height=bottom-top+1,scale=14/Math.max(width,height);
  const dw=Math.max(1,Math.round(width*scale)),dh=Math.max(1,Math.round(height*scale));
  const small=document.createElement('canvas');small.width=small.height=16;
  const g=small.getContext('2d');g.imageSmoothingQuality='high';
  g.drawImage(canvas,left,top,width,height,Math.floor((16-dw)/2),Math.floor((16-dh)/2),dw,dh);
  const data=g.getImageData(0,0,16,16).data;
  const scores=Array.from(w.slice(-10));
  for(let j=0;j<80;j++) {
    let h=w[20480+j];
    for(let i=0;i<256;i++) h+=data[4*i+3]/255*w[i*80+j];
    for(let k=0;k<10;k++)scores[k]+=Math.max(0,h)*w[20560+j*10+k];
  }
  return String(scores.indexOf(Math.max(...scores)));
}
export function bindInk(root,row,persist) {
  const input=root.querySelector('.ink-value');
  if(!input)return;
  const boxes=[...root.querySelectorAll('.ink-box')];
  const update=()=>{row.draft=input.value;const cell=root.querySelector(".current .answerbox");if(cell)cell.textContent=input.value||"　";persist();root.querySelector('[data-do="ink-submit"]').disabled=!input.value};
  input.oninput=()=>{input.value=input.value.replace(/\D/g,'').slice(0,4);update()};
  const strokes=row.strokes??=boxes.map(()=>[]);
  boxes.forEach((canvas,index)=>{
    const g=canvas.getContext('2d');
    function line(points){
      g.lineWidth=9;g.strokeStyle='#234536';g.lineCap=g.lineJoin='round';g.beginPath();
      points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      if(points.length===1)g.lineTo(points[0][0]+.1,points[0][1]);
      g.stroke();
    }
    for(const path of strokes[index]??[])line(path);
    let path=null;
    const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*128/r.width,(e.clientY-r.top)*128/r.height]};
    canvas.onpointerdown=e=>{if(path)return;canvas.setPointerCapture(e.pointerId);path=[point(e)];(strokes[index]??=[]).push(path);line(path)};
    canvas.onpointermove=e=>{if(!path)return;path.push(point(e));line(path.slice(-2))};
    canvas.onpointerup=canvas.onpointercancel=async()=>{
      if(!path)return;path=null;persist();
      try {const w=await weights();if(!canvas.isConnected)return;
        input.value=boxes.map(box=>recognize(box,w)).join('');update();
      }catch{input.placeholder='숫자를 입력해요';input.focus()}
    };
  });
  weights().catch(()=>{});
}

