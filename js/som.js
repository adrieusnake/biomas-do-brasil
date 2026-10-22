// Efeitos sonoros simples gerados na hora (sem arquivos de áudio).
const Som = {
  ctx: null,
  mudo: false,
  ultimoBlip: 0,

  iniciar() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* sem áudio */ }
  },

  tom(freq, dur, tipo = 'square', vol = 0.05, deslize = 0) {
    if (this.mudo || !this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    if (deslize) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + deslize), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },

  sequencia(notas, passo, dur, tipo, vol) {
    notas.forEach((f, i) => setTimeout(() => this.tom(f, dur, tipo, vol), i * passo));
  },

  // "Voz" do texto, como em Undertale: cada personagem tem um tom.
  blip(voz = 1) {
    const t = performance.now();
    if (t - this.ultimoBlip < 45) return;
    this.ultimoBlip = t;
    this.tom(300 * voz + Math.random() * 25, 0.04, 'square', 0.03);
  },
  sel()     { this.tom(660, 0.05, 'square', 0.035); },
  ok()      { this.sequencia([520, 780], 55, 0.07, 'square', 0.045); },
  erro()    { this.tom(180, 0.18, 'sawtooth', 0.05, -60); },
  dano()    { this.tom(150, 0.22, 'sawtooth', 0.08, -100); },
  cura()    { this.sequencia([523, 659, 784], 70, 0.09, 'triangle', 0.07); },
  pista()   { this.sequencia([659, 784, 988, 1318], 80, 0.1, 'triangle', 0.07); },
  alerta()  { this.sequencia([880, 880], 140, 0.1, 'square', 0.06); },
  vitoria() { this.sequencia([523, 659, 784, 1046, 784, 1046], 120, 0.16, 'triangle', 0.08); }
};
