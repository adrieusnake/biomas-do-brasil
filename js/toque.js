// Modo tablet/toque: layout em tela cheia, direcional deslizante,
// tocar para andar e toques diretos na batalha e nos diálogos.

const Toque = {
  ativo: false,

  ativar() {
    if (this.ativo) return;
    this.ativo = true;
    document.body.classList.add('toque');
    this.ajustarLayout();
  },

  // Calcula o tamanho do jogo e dos controles para caber na tela sem rolagem.
  ajustarLayout() {
    if (!this.ativo) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const lados = vw / vh > 1.9;          // tela bem larga (celular deitado): controles nas laterais
    const retrato = vh > vw;
    document.body.classList.toggle('lados', lados);
    document.body.classList.toggle('retrato', retrato);
    let larguraJogo, pad;
    if (lados) {
      const lateral = Math.min(260, vw * 0.21);
      larguraJogo = Math.min(vw - 2 * lateral, vh * 16 / 9);
      pad = Math.max(110, Math.min(lateral - 16, vh * 0.42));
    } else {
      const faixa = Math.max(150, Math.min(270, vh * 0.25));
      larguraJogo = Math.min(vw, (vh - faixa) * 16 / 9);
      const sobra = vh - larguraJogo * 9 / 16;
      pad = Math.max(120, Math.min(250, sobra - 24, vw * 0.3));
    }
    $('tela').style.width = Math.floor(larguraJogo) + 'px';
    document.documentElement.style.setProperty('--pad', Math.floor(pad) + 'px');
  },

  // Converte a posição do dedo para coordenadas do canvas (768x432).
  noCanvas(e) {
    const r = canvas.getBoundingClientRect(), borda = 3;
    return {
      x: (e.clientX - r.left - borda) * W / (r.width - borda * 2),
      y: (e.clientY - r.top - borda) * H / (r.height - borda * 2)
    };
  },

  tocouCanvas(e, tipo) {
    if (Jogo.painelAberto || Jogo.fadeEstado || Jogo.modo === 'transicao') return;
    const { x, y } = this.noCanvas(e);
    if (Jogo.modo === 'batalha') { Batalha.toque(x, y, tipo); return; }
    if (Jogo.modo === 'final') { if (tipo === 'down') Input.pulso('ok'); return; }
    if (tipo !== 'down') return;
    if (Dialogo.ativo) { Dialogo.toque(x, y); return; }
    const tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) Mundo.irPara(tx, ty);
  }
};

// ---------- Toques no canvas (também funciona com o mouse) ----------
canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') Toque.ativar();
  e.preventDefault();
  Som.iniciar();
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
  Toque.tocouCanvas(e, 'down');
});
canvas.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') Toque.tocouCanvas(e, 'move'); });
for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, e => Toque.tocouCanvas(e, 'up'));

// ---------- Direcional deslizante ----------
(() => {
  const pad = $('dpad'), setas = {};
  pad.querySelectorAll('.seta').forEach(s => setas[s.dataset.dir] = s);
  let atual = null, dedo = null;
  const definir = dir => {
    if (dir === atual) return;
    if (atual) { Input.soltar(atual); setas[atual].classList.remove('ativa'); }
    atual = dir;
    if (atual) { Input.apertar(atual); setas[atual].classList.add('ativa'); }
  };
  const ler = e => {
    const r = pad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.12) return null;            // zona morta no meio
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };
  pad.addEventListener('pointerdown', e => {
    e.preventDefault(); Som.iniciar(); dedo = e.pointerId;
    try { pad.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
    definir(ler(e));
  });
  pad.addEventListener('pointermove', e => { if (e.pointerId === dedo) definir(ler(e)); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'])
    pad.addEventListener(ev, e => { if (e.pointerId === dedo) { dedo = null; definir(null); } });
})();

// ---------- Tela cheia ----------
(() => {
  const btn = $('telaCheiaBtn'), raiz = document.documentElement;
  const pedir = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
  if (!pedir) return;                     // ex.: iPhone; no iPad use "Adicionar à Tela de Início"
  btn.classList.add('disponivel');
  btn.onclick = () => {
    const sair = document.exitFullscreen || document.webkitExitFullscreen;
    if (document.fullscreenElement || document.webkitFullscreenElement) sair.call(document);
    else pedir.call(raiz);
  };
})();

// ---------- Detecção e proteção contra gestos do navegador ----------
if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 && !matchMedia('(hover: hover)').matches) Toque.ativar();
window.addEventListener('touchstart', () => Toque.ativar(), { once: true, passive: true });
window.addEventListener('resize', () => Toque.ajustarLayout());
window.addEventListener('orientationchange', () => setTimeout(() => Toque.ajustarLayout(), 200));
document.addEventListener('contextmenu', e => { if (Toque.ativo) e.preventDefault(); });
document.addEventListener('gesturestart', e => e.preventDefault());   // pinça no Safari
document.addEventListener('dblclick', e => { if (Toque.ativo) e.preventDefault(); });
