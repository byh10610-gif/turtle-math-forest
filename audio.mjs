const noteHz = note=>440*2**((note-69)/12);
const effects = {
  tap:[[74,0,0.065,0.09]],
  right:[[72,0,0.15,0.11],[76,0.085,0.19,0.11],[79,0.17,0.25,0.10]],
  wrong:[[64,0,0.15,0.10],[60,0.13,0.22,0.09]]
};
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
    if (!this.#loop && this.#wantsMusic) {
      this.#loop=new Audio('./piano.ogg');
      this.#loop.loop=true;
    }
    if (!this.#loop)return;
    this.#loop.volume=this.#ducked?0.08:0.26;
    if(this.#wantsMusic && this.#loop.paused)this.#loop.play().catch(()=>{});
    if(!this.#wantsMusic)this.#loop.pause();
  }
}

export function pulse(kind) {
  if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    globalThis.navigator?.vibrate?.(kind==='right'?[14,35,18]:kind==='wrong'?35:12);
  }
}

