const FONTE = "'VT323', monospace";

// Quebra um texto em linhas que cabem em `largura` pixels.
function quebrarLinhas(ctx, texto, largura) {
  const linhas = [];
  for (const paragrafo of texto.split('\n')) {
    let atual = '';
    for (const palavra of paragrafo.split(' ')) {
      const teste = atual ? atual + ' ' + palavra : palavra;
      if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = palavra; }
      else atual = teste;
    }
    linhas.push(atual);
  }
  return linhas;
}

// Texto que aparece letra por letra, com o "bip" de voz.
class Maquina {
  constructor(texto, voz = 1, vel = 50) {
    this.texto = texto; this.voz = voz; this.vel = vel; this.n = 0; this.linhas = null;
  }
  atualizar(dt) {
    const antes = Math.floor(this.n);
    this.n = Math.min(this.texto.length, this.n + dt * this.vel);
    const agora = Math.floor(this.n);
    if (agora > antes && this.texto[agora - 1] !== ' ') Som.blip(this.voz);
  }
  get pronto() { return this.n >= this.texto.length; }
  completar() { this.n = this.texto.length; }
  // Desenha o texto já revelado; a quebra de linha é calculada sobre o texto
  // completo para as palavras não "pularem" de linha enquanto aparecem.
  desenhar(ctx, x, y, largura, alturaLinha, cor = '#fff') {
    if (!this.linhas) this.linhas = quebrarLinhas(ctx, this.texto, largura);
    let resta = Math.floor(this.n);
    ctx.fillStyle = cor;
    this.linhas.forEach((l, i) => {
      if (resta <= 0) return;
      ctx.fillText(l.slice(0, resta), x, y + i * alturaLinha);
      resta -= l.length + 1;
    });
  }
}

// Caixa de diálogo do mundo (estilo Undertale), com escolhas opcionais.
const Dialogo = {
  ativo: false,
  paginas: [], i: 0, maquina: null, aoFim: null, escolha: 0,

  abrir(paginas, aoFim) {
    this.paginas = paginas.map(p => typeof p === 'string' ? { texto: p } : p);
    this.i = 0; this.aoFim = aoFim || null; this.ativo = true;
    if (typeof Mundo !== 'undefined') Mundo.cancelarRota();
    this.comecarPagina();
  },
  comecarPagina() {
    const p = this.paginas[this.i];
    this.maquina = new Maquina(p.texto, p.voz || (p.nome === 'PROFESSOR' ? 0.9 : 1));
    this.escolha = 0;
    if (p.som) Som[p.som]();
  },
  atualizar(dt) {
    const p = this.paginas[this.i];
    this.maquina.atualizar(dt);
    if (p.opcoes && this.maquina.pronto) {
      if (Input.bateu('left') || Input.bateu('up')) { this.escolha = Math.max(0, this.escolha - 1); Som.sel(); }
      if (Input.bateu('right') || Input.bateu('down')) { this.escolha = Math.min(p.opcoes.length - 1, this.escolha + 1); Som.sel(); }
    }
    if (Input.bateu('back') && !this.maquina.pronto) this.maquina.completar();
    if (Input.bateu('ok')) {
      if (!this.maquina.pronto) { this.maquina.completar(); return; }
      if (p.opcoes) Som.ok();
      this.i++;
      if (this.i < this.paginas.length && !p.opcoes) { this.comecarPagina(); return; }
      this.ativo = false;
      const fim = this.aoFim; this.aoFim = null;
      if (p.opcoes && p.aoEscolher) p.aoEscolher(this.escolha);
      if (fim) fim();
    }
  },
  // Toque/clique: avança o texto ou escolhe a opção tocada.
  toque(x, y) {
    const p = this.paginas[this.i];
    if (p.opcoes && this.maquina.pronto) {
      const i = (this.alvos || []).findIndex(a => x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h);
      if (i < 0) return;
      this.escolha = i;
    }
    Input.pulso('ok');
  },

  desenhar(ctx, t) {
    if (!this.ativo) return;
    const p = this.paginas[this.i];
    const x = 20, w = W - 40, h = 124, y = H - h - 12;
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.font = '26px ' + FONTE; ctx.textBaseline = 'top';
    if (p.nome) {
      const nw = ctx.measureText(p.nome).width + 20;
      ctx.fillStyle = '#000'; ctx.fillRect(x + 14, y - 26, nw, 30);
      ctx.strokeRect(x + 14, y - 26, nw, 30);
      ctx.fillStyle = '#ffe14d'; ctx.fillText(p.nome, x + 24, y - 23);
    }
    const destaque = p.texto.startsWith('★');
    this.maquina.desenhar(ctx, x + 22, y + 16, w - 44, 26, destaque ? '#ffe14d' : '#fff');
    if (this.maquina.pronto) {
      if (p.opcoes) {
        let ox = x + w - 30;
        this.alvos = [];
        for (let k = p.opcoes.length - 1; k >= 0; k--) {
          const rotulo = p.opcoes[k];
          ox -= ctx.measureText(rotulo).width + 40;
          this.alvos[k] = { x: ox - 12, y: y + h - 52, w: ctx.measureText(rotulo).width + 46, h: 48 };
          ctx.fillStyle = k === this.escolha ? '#ffe14d' : '#fff';
          ctx.fillText(rotulo, ox + 22, y + h - 38);
          if (k === this.escolha) ctx.drawImage(SPR.alma, ox, y + h - 34);
        }
      } else if (Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillText('▼', x + w - 34, y + h - 34);
      }
    }
  }
};
