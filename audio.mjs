const noteHz = note=>440*2**((note-69)/12);
const effects = {
  tap:[[74,0,0.065,0.09]],
  right:[[72,0,0.15,0.11],[76,0.085,0.19,0.11],[79,0.17,0.25,0.10]],
  wrong:[[64,0,0.15,0.10],[60,0.13,0.22,0.09]]
};
const tune=[
  [48,[72,76,79,76]],[45,[72,76,81,76]],[41,[69,72,77,72]],[43,[71,74,79,74]],
  [48,[76,79,84,79]],[45,[76,81,84,81]],[41,[77,76,72,69]],[43,[74,71,67,71]]
];

function forestLoop(context) {
  const rate=24000, beat=0.48;
  const buffer=context.createBuffer(1,Math.round(rate*tune.length*4*beat),rate);
  const samples=buffer.getChannelData(0);
  function add(note,start,length,volume) {
    const frequency=noteHz(note)*Math.PI*2;
    const first=Math.round(start*rate);
    const count=Math.min(Math.round(length*rate),samples.length-first);
    for (let i=0;i<count;i++) {
      const t=i/rate;
      const envelope=Math.min(t/0.015,1)*Math.exp(-t*5)*Math.min(1,(count-i)/rate/0.06);
      samples[first+i]+=volume*envelope*(Math.sin(frequency*t)+0.15*Math.sin(2*frequency*t));
    }
  }
  tune.forEach(([bass,melody],bar)=>{
    const start=bar*4*beat;
    add(bass,start,1.1,0.25);
    add(bass+7,start+beat*2,0.85,0.15);
    melody.forEach((note,i)=>add(note,start+i*beat,0.46,0.22));
  });
  return buffer;
}

export class ForestAudio {
  #context;
  #musicGain;
  #loop;
  #wantsMusic=false;
  #ducked=false;

  unlock() {
    try {
      const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;
      if (!Audio) return;
      if (!this.#context) {
        this.#context=new Audio();
        this.#musicGain=this.#context.createGain();
        this.#musicGain.gain.value=0;
        this.#musicGain.connect(this.#context.destination);
      }
      if (this.#context.state!=='running') {
        this.#context.resume().then(()=>this.#sync()).catch(()=>{});
      }
      this.#sync();
    } catch {}
  }

  play(kind) {
    this.unlock();
    const context=this.#context;
    if (!context) return;
    const start=context.currentTime+0.01;
    for (const [note,delay,length,volume] of effects[kind]) {
      const time=start+delay;
      const oscillator=context.createOscillator();
      const gain=context.createGain();
      oscillator.type=kind==='tap'?'sine':'triangle';
      oscillator.frequency.value=noteHz(note);
      gain.gain.setValueAtTime(0.0001,time);
      gain.gain.exponentialRampToValueAtTime(volume,time+0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001,time+length);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(time);
      oscillator.stop(time+length+0.02);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }
  }

  music(enabled) {
    this.#wantsMusic=enabled;
    this.#sync();
  }
  duck(enabled) {
    this.#ducked=enabled;
    this.#sync();
  }
  #sync() {
    const context=this.#context;
    if (!context || !this.#musicGain) return;
    if (this.#wantsMusic && context.state==='running' && !this.#loop) {
      this.#loop=context.createBufferSource();
      this.#loop.buffer=forestLoop(context);
      this.#loop.loop=true;
      this.#loop.connect(this.#musicGain);
      this.#loop.start();
    }
    const level=this.#wantsMusic?(this.#ducked?0.035:0.16):0;
    this.#musicGain.gain.setTargetAtTime(level,context.currentTime,0.045);
  }
}

export function pulse(kind) {
  if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    globalThis.navigator?.vibrate?.(kind==='right'?[14,35,18]:kind==='wrong'?35:12);
  }
}

