// Batalha no estilo Undertale: ninguém se machuca.
// O jogador desvia dos ataques com a "semente" e usa AGIR para acalmar a ameaça.
const CAIXA_TEXTO  = { x: 40,  y: 195, w: 688, h: 140 };
const CAIXA_ATAQUE = { x: 279, y: 190, w: 210, h: 150 };
const BOTOES = ['OBSERVAR', 'AGIR', 'ITEM', 'POUPAR'];
const DURACAO_ATAQUE = 6;

// Padrões de ataque. Cada um cria "balas" dentro da caixa.
const PADROES = {
  brasas(b, dt) {
    const c = b.caixa, intervalo = 0.3 + (1 - b.furia / 100) * 0.25;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const x = c.x + 12 + Math.random() * (c.w - 24);
      b.balas.push({ tipo: 'brasa', x, bx: x, y: c.y - 8, vx: 0, vy: 80 + Math.random() * 45, r: 5, osc: 10, fase: Math.random() * 6, t: 0 });
    }
  },
  labaredas(b, dt) {
    const c = b.caixa, intervalo = 1.5;
    b.acum += dt;
    if (b.acum < intervalo && b.balas.length) return;
    b.acum = 0;
    const daEsquerda = (b.contador++ % 2) === 0;
    const vao = c.y + 34 + Math.random() * (c.h - 68);
    for (let y = c.y + 6; y < c.y + c.h; y += 14) {
      if (Math.abs(y - vao) < 27) continue;
      b.balas.push({ tipo: 'chama', x: daEsquerda ? c.x - 10 : c.x + c.w + 10, y, vx: daEsquerda ? 105 : -105, vy: 0, r: 6, t: 0 });
    }
  },
  fumaca(b, dt) {
    const c = b.caixa, intervalo = 0.85;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const esq = Math.random() < 0.5;
      const x = esq ? c.x - 6 : c.x + c.w + 6, y = c.y + 10 + Math.random() * (c.h - 20);
      const ang = Math.atan2(b.alma.y - y, b.alma.x - x);
      b.balas.push({ tipo: 'fumaca', x, y, vx: Math.cos(ang) * 55, vy: Math.sin(ang) * 55, r: 6, cresce: true, dano: 2, vida: 4.5, t: 0 });
    }
  }
};

// Ataques do Secão (Pantanal).
Object.assign(PADROES, {
  // Rachaduras: uma linha pisca como aviso e depois "abre" no chão.
  rachaduras(b, dt) {
    const c = b.caixa, intervalo = 0.75 + (1 - b.furia / 100) * 0.35;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const horizontal = (b.contador++ % 2) === 0;
      const mirar = Math.random() < 0.5;
      const pos = horizontal
        ? (mirar ? b.alma.y : c.y + 15 + Math.random() * (c.h - 30))
        : (mirar ? b.alma.x : c.x + 15 + Math.random() * (c.w - 30));
      b.balas.push({ tipo: 'linha', horizontal, pos, x: c.x + c.w / 2, y: c.y + c.h / 2, vx: 0, vy: 0, r: 0, aviso: 0.75, vida: 1.25, t: 0 });
    }
  },
  // Raios de sol caindo em leque.
  raios(b, dt) {
    const c = b.caixa, intervalo = 0.8 + (1 - b.furia / 100) * 0.3;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const ox = c.x + c.w / 2 + (Math.random() - 0.5) * 60, desvio = (Math.random() - 0.5) * 0.3;
      for (let i = 0; i < 5; i++) {
        const ang = Math.PI / 2 + (i - 2) * 0.32 + desvio;
        b.balas.push({ tipo: 'raio', x: ox, y: c.y - 6, vx: Math.cos(ang) * 105, vy: Math.sin(ang) * 105, r: 5, t: 0 });
      }
    }
  },
  // Redemoinhos de poeira que quicam nas paredes.
  redemoinhos(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    const vivos = b.balas.filter(x => x.tipo === 'redemoinho').length;
    if (b.acum > 1.1 && vivos < (b.furia > 50 ? 3 : 2)) {
      b.acum = 0;
      b.balas.push({ tipo: 'redemoinho', quica: true, x: c.x + 15 + Math.random() * (c.w - 30), y: c.y + 12,
        vx: (Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 35), vy: 45 + Math.random() * 25, r: 9, dano: 2, vida: 4.2, t: 0 });
    }
  }
});

// Ataques do Seu Derruba (Amazônia).
Object.assign(PADROES, {
  // Troncos rolando de um lado para o outro.
  troncos(b, dt) {
    const c = b.caixa, intervalo = b.fase2 ? 0.7 : 0.95;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const daEsquerda = (b.contador++ % 2) === 0, w = 70 + Math.random() * 40;
      const y = Math.random() < 0.4 ? b.alma.y : c.y + 14 + Math.random() * (c.h - 28);
      b.balas.push({ tipo: 'tronco', x: daEsquerda ? c.x - w / 2 : c.x + c.w + w / 2, y, w, h: 16,
        vx: (daEsquerda ? 1 : -1) * (115 + Math.random() * 40), vy: 0, r: 0, t: 0 });
    }
  },
  // Lâmina da motosserra quicando pela caixa.
  motosserra(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    const vivas = b.balas.filter(x => x.tipo === 'serra').length;
    if (b.acum > 1.2 && vivas < (b.fase2 ? 2 : 1) + 1) {
      b.acum = 0;
      b.balas.push({ tipo: 'serra', quica: true, x: c.x + 20 + Math.random() * (c.w - 40), y: c.y + 14,
        vx: (Math.random() < 0.5 ? -1 : 1) * (95 + Math.random() * 40), vy: 80 + Math.random() * 30, r: 11, dano: 4, vida: 4.5, t: 0 });
    }
  },
  // Gotas de mercúrio que caem e se dividem no chão.
  mercurio(b, dt) {
    const c = b.caixa, intervalo = b.fase2 ? 0.45 : 0.6;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      b.balas.push({ tipo: 'gota', x: c.x + 12 + Math.random() * (c.w - 24), y: c.y - 6, vx: 0, vy: 30, ay: 220, r: 5, t: 0, divide: true });
    }
  },
  // Fase 2: motosserra e mercúrio ao mesmo tempo.
  desespero(b, dt) {
    const salvo = b.acum;
    b.acum = b.acum2 || 0; PADROES.motosserra(b, dt); b.acum2 = b.acum;
    b.acum = salvo; PADROES.mercurio(b, dt);
  }
});

// Ataques do Zé Arapuca (Caatinga).
Object.assign(PADROES, {
  // Redes descendo com um buraco para escapar.
  redes(b, dt) {
    const c = b.caixa, intervalo = 1.3 - (1 - b.furia / 100) * 0.2;
    b.acum += dt;
    if (b.acum < intervalo && b.balas.length) return;
    b.acum = 0;
    const vao = c.x + 26 + Math.random() * (c.w - 52);
    for (let x = c.x + 7; x < c.x + c.w; x += 14) {
      if (Math.abs(x - vao) < 22) continue;
      b.balas.push({ tipo: 'no', x, y: c.y - 6, vx: 0, vy: 72, r: 4, t: 0 });
    }
  },
  // Gaiolas caindo.
  gaiolas(b, dt) {
    const c = b.caixa, intervalo = 0.75;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const x = Math.random() < 0.35 ? b.alma.x : c.x + 16 + Math.random() * (c.w - 32);
      b.balas.push({ tipo: 'gaiola', x, y: c.y - 14, w: 24, h: 26, vx: 0, vy: 20, ay: 150, r: 0, t: 0 });
    }
  },
  // Arapucas: um círculo avisa onde a armadilha vai fechar.
  arapucas(b, dt) {
    const c = b.caixa, intervalo = 0.9 - (1 - b.furia / 100) * 0.2;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const mirar = (b.contador++ % 2) === 0;
      const x = mirar ? b.alma.x : c.x + 20 + Math.random() * (c.w - 40);
      const y = mirar ? b.alma.y : c.y + 20 + Math.random() * (c.h - 40);
      b.balas.push({ tipo: 'arapuca', x, y, vx: 0, vy: 0, r: 0, aviso: 0.8, vida: 1.2, t: 0 });
    }
  }
});

// Ataques do Annoni (Pampa).
Object.assign(PADROES, {
  // Sementes voando com o vento, ondulando.
  sementes(b, dt) {
    const c = b.caixa, intervalo = 0.24 + (1 - b.furia / 100) * 0.12, daEsquerda = b.turno % 2 === 0;
    b.acum += dt;
    while (b.acum > intervalo) {
      b.acum -= intervalo;
      const y = c.y + 10 + Math.random() * (c.h - 20);
      b.balas.push({ tipo: 'semente', x: daEsquerda ? c.x - 6 : c.x + c.w + 6, y, y0: y, oscY: 10, fase: Math.random() * 6,
        vx: (daEsquerda ? 1 : -1) * (105 + Math.random() * 40), vy: 0, r: 4, t: 0 });
    }
  },
  // Touceiras que brotam do chão (com aviso antes).
  touceiras(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    while (b.acum > 0.7) {
      b.acum -= 0.7;
      const x = Math.random() < 0.4 ? b.alma.x : c.x + 14 + Math.random() * (c.w - 28);
      b.balas.push({ tipo: 'touceira', x, y: c.y + c.h, vx: 0, vy: 0, r: 0, alt: c.h * (0.45 + Math.random() * 0.25), aviso: 0.6, vida: 1.5, t: 0 });
    }
  },
  // Vento minuano: empurra a semente para os lados e traz mais sementes.
  minuano(b, dt) {
    const c = b.caixa;
    b.tVento = (b.tVento || 0) + dt;
    const dir = Math.floor(b.tVento / 1.6) % 2 === 0 ? 1 : -1;
    b.alma.x += dir * 55 * dt;
    b.acum += dt;
    while (b.acum > 0.35) {
      b.acum -= 0.35;
      const y = c.y + 10 + Math.random() * (c.h - 20);
      b.balas.push({ tipo: 'semente', x: dir > 0 ? c.x - 6 : c.x + c.w + 6, y, y0: y, oscY: 6, fase: Math.random() * 6, vx: dir * (150 + Math.random() * 40), vy: 0, r: 4, t: 0 });
      b.balas.push({ tipo: 'vento', inofensivo: true, x: dir > 0 ? c.x - 20 : c.x + c.w + 20, y: c.y + 10 + Math.random() * (c.h - 20), vx: dir * 260, vy: 0, r: 0, t: 0 });
    }
  }
});

// Altura atual de uma touceira (cresce, fica e encolhe).
function alturaTouceira(b) {
  if (b.t < b.aviso) return 0;
  return b.alt * Math.min(1, (b.t - b.aviso) / 0.25) * Math.min(1, Math.max(0, (b.vida - b.t) / 0.3));
}

// Ataques do DEVASTRON (Mata Atlântica): o chefe final.
const combo = (a, b) => (bt, dt) => {
  const salvo = bt.acum;
  bt.acum = bt.acum2 || 0; PADROES[a](bt, dt); bt.acum2 = bt.acum;
  bt.acum = salvo; PADROES[b](bt, dt);
};
Object.assign(PADROES, {
  // Paredes de metal da esteira, com um vão para passar.
  esteira(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    if (b.acum < 1.25 && b.balas.some(x => x.tipo === 'metal')) return;
    b.acum = 0;
    const daEsquerda = (b.contador++ % 2) === 0, vao = c.y + 30 + Math.random() * (c.h - 60);
    for (let y = c.y + 6; y < c.y + c.h; y += 13) {
      if (Math.abs(y - vao) < 26) continue;
      b.balas.push({ tipo: 'metal', x: daEsquerda ? c.x - 10 : c.x + c.w + 10, y, vx: (daEsquerda ? 1 : -1) * 125, vy: 0, r: 6, t: 0 });
    }
  },
  // Fumaça tóxica que cai da chaminé e persegue a semente.
  fumacaToxica(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    while (b.acum > 0.5) {
      b.acum -= 0.5;
      const x = c.x + 20 + Math.random() * (c.w - 40);
      b.balas.push({ tipo: 'fumacaT', x, y: c.y - 8, vx: (b.alma.x - x) * 0.45, vy: 55, r: 6, cresce: true, dano: 3, vida: 4, t: 0 });
    }
  },
  // Óleo pingando: cada gota vira uma mancha no chão por um tempo.
  oleo(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    while (b.acum > 0.5) {
      b.acum -= 0.5;
      b.balas.push({ tipo: 'oleo', x: c.x + 12 + Math.random() * (c.w - 24), y: c.y - 6, vx: 0, vy: 40, ay: 240, r: 5, t: 0, mancha: true });
    }
  },
  // Lasers dos olhos: uma cruz mirando a semente.
  laser(b, dt) {
    b.acum += dt;
    while (b.acum > 1.05) {
      b.acum -= 1.05;
      const c = b.caixa;
      b.balas.push({ tipo: 'linha', cor: 'laser', horizontal: true, pos: b.alma.y, x: c.x + c.w / 2, y: c.y + c.h / 2, vx: 0, vy: 0, r: 0, aviso: 0.6, vida: 0.95, t: 0 });
      b.balas.push({ tipo: 'linha', cor: 'laser', horizontal: false, pos: b.alma.x, x: c.x + c.w / 2, y: c.y + c.h / 2, vx: 0, vy: 0, r: 0, aviso: 0.6, vida: 0.95, t: 0 });
    }
  },
  // Várias serras quicando.
  serras(b, dt) {
    const c = b.caixa;
    b.acum += dt;
    if (b.acum > 0.9 && b.balas.filter(x => x.tipo === 'serra').length < 3) {
      b.acum = 0;
      b.balas.push({ tipo: 'serra', quica: true, x: c.x + 20 + Math.random() * (c.w - 40), y: c.y + 14,
        vx: (Math.random() < 0.5 ? -1 : 1) * (110 + Math.random() * 40), vy: 90 + Math.random() * 30, r: 11, dano: 4, vida: 5, t: 0 });
    }
  },
  caos1: combo('laser', 'fumacaToxica'),
  caos2: combo('serras', 'oleo'),
  caos3: combo('esteira', 'oleo')
});

const Batalha = {
  ativo: false,

  iniciar(def, aoVencer) {
    this.def = def; this.aoVencer = aoVencer; this.ativo = true;
    const comp = Estado.companheiro;
    this.pvMax = 20 + (comp === 'capivara' ? 6 : 0);
    this.pv = this.pvMax;
    this.furia = def.furia;
    this.fase2 = false; this.faseAtual = 0;
    this.usadas = new Set();
    this.turno = 0; this.tempo = 0; this.menu = 0;
    this.balas = []; this.inv = 0; this.encolher = 0; this.encolhendo = false;
    this.tremor = 0; this.tremorTela = 0;
    this.caixa = { ...CAIXA_TEXTO }; this.alvo = CAIXA_TEXTO;
    this.alma = { x: 384, y: 265 };
    this.sabor = null;
    this.mostrar([def.intro], () => this.irMenu(true));
  },

  // ---------- Fluxo ----------
  mostrar(passos, depois) {
    this.fila = passos.map(p => typeof p === 'string' ? { texto: p } : p);
    this.depois = depois;
    this.alvo = CAIXA_TEXTO;
    this.proximo();
  },
  proximo() {
    if (!this.fila.length) { const d = this.depois; this.depois = null; if (d) d(); return; }
    const p = this.fila.shift();
    if (p.som) Som[p.som]();
    if (p.encolher) this.encolhendo = true;
    if (p.fala) { this.estado = 'fala'; this.maquina = new Maquina(p.fala, this.def.voz); }
    else { this.estado = 'texto'; this.maquina = new Maquina(p.texto); }
  },
  irMenu(novoSabor) {
    this.estado = 'menu'; this.alvo = CAIXA_TEXTO; this.balas = [];
    if (novoSabor || !this.sabor) {
      const s = this.furia <= 0 ? this.def.calmo : this.def.sabores[Math.floor(Math.random() * this.def.sabores.length)];
      this.sabor = new Maquina(s);
    }
  },
  abrirSubmenu(opcoes) {
    this.estado = 'submenu'; this.opcoes = opcoes; this.sub = 0;
  },

  escolherBotao() {
    Som.ok();
    switch (this.menu) {
      case 0: this.mostrar(this.def.observar, () => this.irMenu(false)); break;
      case 1: this.abrirAcoes(); break;
      case 2: this.abrirItens(); break;
      case 3:
        if (this.furia <= 0) this.vencer();
        else this.mostrar(this.def.pouparCedo, () => this.atacar());
    }
  },

  abrirAcoes() {
    const estrela = Estado.companheiro === 'arara';
    this.abrirSubmenu(this.def.acoes.map(a => {
      const bloqueada = a.pista && !Estado.pistas.includes(a.pista);
      const usada = !a.repetir && this.usadas.has(a.id);
      if (bloqueada) return { rotulo: '??? (falta pista)', apagada: true,
        acao: () => this.mostrar(['* Você ainda não sabe fazer isso.', '* Converse com as pessoas do bioma para descobrir pistas!'], () => this.abrirAcoes()) };
      if (usada) return { rotulo: a.nome + ' ✓', apagada: true,
        acao: () => this.mostrar(['* Você já fez isso. Tente outra coisa!'], () => this.abrirAcoes()) };
      return { rotulo: a.nome, estrela: estrela && !a.errada && a.efeito <= -30, acao: () => this.usarAcao(a) };
    }));
  },

  usarAcao(a) {
    this.usadas.add(a.id);
    let ef = a.efeito;
    if (ef < 0 && Estado.companheiro === 'onca') ef -= 10;
    this.furia = Math.max(0, Math.min(this.def.furia, this.furia + ef));
    this.tremor = 0.4;
    if (a.errada) Som.erro();
    const passos = [...a.texto, { fala: a.fala }];
    // Chefe: entra na segunda fase quando a fúria cai abaixo do limite.
    const fases = this.fases();
    while (this.faseAtual < fases.length && this.furia > 0 && this.furia <= fases[this.faseAtual].limite) {
      passos.push({ fala: fases[this.faseAtual].fala, som: 'alerta' });
      this.faseAtual++;
    }
    this.fase2 = this.faseAtual > 0;
    if (this.furia <= 0) passos.push(this.def.calmo);
    this.mostrar(passos, () => this.furia <= 0 ? this.irMenu(true) : this.atacar());
  },

  abrirItens() {
    if (!Estado.itens.length) { this.mostrar(['* Sua mochila está vazia.'], () => this.irMenu(false)); return; }
    this.abrirSubmenu(Estado.itens.map((id, i) => ({
      rotulo: ITENS[id].nome,
      acao: () => {
        if (ITENS[id].especial === 'chefe') { this.usarCocar(i); return; }
        Estado.itens.splice(i, 1); salvar();
        this.pv = Math.min(this.pvMax, this.pv + ITENS[id].cura);
        Som.cura();
        this.mostrar([ITENS[id].usar], () => this.atacar());
      }
    })));
  },

  // Cocar dos Guardiões: só diante de um chefe. A fúria vai a zero de uma vez.
  usarCocar(i) {
    if (!this.def.chefe) {
      this.mostrar(['* Você pensa em mostrar o cocar...', '* Mas o Kauã disse para guardá-lo para um grande desafio: um CHEFE.'], () => this.abrirItens());
      return;
    }
    Estado.itens.splice(i, 1); Estado.cocar = 'usado'; salvar();
    this.furia = 0;
    this.faseAtual = this.fases().length; this.fase2 = this.faseAtual > 0;
    this.tremor = 0.6;
    this.mostrar([
      { texto: '* Você ergue o COCAR DOS GUARDIÕES.', som: 'pista' },
      '* Os guardiões da floresta aparecem ao seu lado: indígenas, ribeirinhos, brigadistas, cientistas... e todos os animais que você ajudou!',
      { fala: this.def.falaCocar || 'Tanta gente unida... Tá bom, eu paro!' },
      '* A fúria do chefe foi a ZERO! Agora é só POUPAR.'
    ], () => this.irMenu(true));
  },

  atacar() {
    this.estado = 'ataque';
    this.alvo = CAIXA_ATAQUE;
    this.alma = { x: CAIXA_ATAQUE.x + CAIXA_ATAQUE.w / 2, y: CAIXA_ATAQUE.y + CAIXA_ATAQUE.h / 2 };
    this.balas = []; this.acum = 0; this.acum2 = 0; this.contador = 0; this.tAtaque = 0; this.tVento = 0;
    const fases = this.fases();
    const lista = this.faseAtual > 0 ? fases[this.faseAtual - 1].ataques : this.def.ataques;
    this.padrao = lista[this.turno % lista.length];
    this.turno++;
  },

  // Lista de fases do chefe (aceita o formato antigo "fase2").
  fases() { return this.def.fases || (this.def.fase2 ? [this.def.fase2] : []); },

  vencer() {
    this.mostrar(this.def.vitoria, () => { this.ativo = false; this.aoVencer(); });
  },

  ferir(d) {
    if (Estado.companheiro === 'pirarucu') d = Math.max(1, d - 1);
    this.pv = Math.max(0, this.pv - d);
    this.inv = Estado.companheiro === 'jacare' ? 1.6 : 1.0;
    this.tremorTela = 0.25;
    Som.dano();
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) { /* sem vibração */ }
    if (this.pv <= 0) {
      this.balas = [];
      this.mostrar(this.def.derrota, () => { this.pv = this.pvMax; this.irMenu(true); });
    }
  },

  // ---------- Atualização ----------
  atualizar(dt) {
    this.tempo += dt;
    const k = Math.min(1, dt * 12);
    for (const p of ['x', 'y', 'w', 'h']) this.caixa[p] += (this.alvo[p] - this.caixa[p]) * k;
    this.inv = Math.max(0, this.inv - dt);
    this.tremor = Math.max(0, this.tremor - dt);
    this.tremorTela = Math.max(0, this.tremorTela - dt);
    if (this.encolhendo) this.encolher = Math.min(1, this.encolher + dt);

    switch (this.estado) {
      case 'menu':
        this.sabor.atualizar(dt);
        if (Input.bateu('left'))  { this.menu = (this.menu + 3) % 4; Som.sel(); }
        if (Input.bateu('right')) { this.menu = (this.menu + 1) % 4; Som.sel(); }
        if (Input.bateu('ok')) this.escolherBotao();
        break;
      case 'submenu':
        if (Input.bateu('up'))   { this.sub = (this.sub + this.opcoes.length - 1) % this.opcoes.length; Som.sel(); }
        if (Input.bateu('down')) { this.sub = (this.sub + 1) % this.opcoes.length; Som.sel(); }
        if (Input.bateu('back')) { this.irMenu(false); Som.sel(); }
        else if (Input.bateu('ok')) { Som.ok(); this.opcoes[this.sub].acao(); }
        break;
      case 'texto':
      case 'fala':
        this.maquina.atualizar(dt);
        if (Input.bateu('back')) this.maquina.completar();
        if (Input.bateu('ok')) { if (this.maquina.pronto) this.proximo(); else this.maquina.completar(); }
        break;
      case 'ataque':
        this.atualizarAtaque(dt);
        break;
    }
  },

  atualizarAtaque(dt) {
    const c = this.caixa, a = this.alma;
    const vel = 135 * (Estado.companheiro === 'lobo' ? 1.25 : 1);
    if (Input.segurando('left'))  a.x -= vel * dt;
    if (Input.segurando('right')) a.x += vel * dt;
    if (Input.segurando('up'))    a.y -= vel * dt;
    if (Input.segurando('down'))  a.y += vel * dt;
    a.x = Math.max(c.x + 10, Math.min(c.x + c.w - 10, a.x));
    a.y = Math.max(c.y + 10, Math.min(c.y + c.h - 10, a.y));

    // Chefes mais difíceis aceleram os ataques (e mais ainda a cada fase).
    const ritmo = (this.def.ritmo || 1) * (1 + 0.1 * (this.faseAtual || 0));
    const db = dt * ritmo, duracao = this.def.duracao || DURACAO_ATAQUE;
    this.tAtaque += dt;
    if (this.tAtaque > duracao) { this.irMenu(true); return; }
    if (this.tAtaque > 0.4 && this.tAtaque < duracao - 0.8) PADROES[this.padrao](this, db);

    for (const b of this.balas) {
      b.t += db;
      if (b.ay) b.vy += b.ay * db;
      b.y += b.vy * db;
      if (b.osc) { b.bx += b.vx * db; b.x = b.bx + Math.sin(b.t * 4 + b.fase) * b.osc; }
      else b.x += b.vx * db;
      if (b.cresce) b.r = 6 + Math.min(6, b.t * 3);
      if (b.oscY) b.y = b.y0 + Math.sin(b.t * 5 + b.fase) * b.oscY;
      if (b.quica) {
        if (b.x < c.x + b.r || b.x > c.x + c.w - b.r) { b.vx = -b.vx; b.x = Math.max(c.x + b.r, Math.min(c.x + c.w - b.r, b.x)); }
        if (b.y < c.y + b.r || b.y > c.y + c.h - b.r) { b.vy = -b.vy; b.y = Math.max(c.y + b.r, Math.min(c.y + c.h - b.r, b.y)); }
      }
      let acertou;
      if (b.tipo === 'linha') acertou = b.t > b.aviso && Math.abs((b.horizontal ? a.y : a.x) - b.pos) < 9;
      else if (b.inofensivo) acertou = false;
      else if (b.tipo === 'touceira') acertou = Math.abs(a.x - b.x) < 11 && a.y > c.y + c.h - alturaTouceira(b) - 4;
      else if (b.tipo === 'arapuca') acertou = b.t > b.aviso && Math.hypot(b.x - a.x, b.y - a.y) < 18;
      else if (b.w) acertou = Math.abs(a.x - b.x) < b.w / 2 + 4 && Math.abs(a.y - b.y) < b.h / 2 + 4;
      else acertou = Math.hypot(b.x - a.x, b.y - a.y) < b.r + 4;
      if (this.inv <= 0 && acertou) { this.ferir((b.dano || 3) + (this.def.danoExtra || 0)); if (this.estado !== 'ataque') return; }
    }
    // Óleo vira mancha no chão.
    for (const b of this.balas) if (b.mancha && b.y > c.y + c.h - 8) {
      b.morta = true;
      this.balas.push({ tipo: 'manchaOleo', x: b.x, y: c.y + c.h - 6, w: 34, h: 10, vx: 0, vy: 0, r: 0, vida: 1.8, t: 0 });
    }
    // Gotas de mercúrio se dividem ao bater no chão.
    for (const b of this.balas) if (b.divide && b.y > c.y + c.h - 8) {
      b.morta = true;
      for (const lado of [-1, 1]) this.balas.push({ tipo: 'gota', x: b.x, y: c.y + c.h - 10, vx: lado * 80, vy: -120, ay: 300, r: 3, t: 0, vida: 1.1 });
    }
    this.balas = this.balas.filter(b => !b.morta &&
      b.x > c.x - 40 - (b.w || 0) && b.x < c.x + c.w + 40 + (b.w || 0) && b.y < c.y + c.h + 20 && !(b.vida && b.t > b.vida));
  },

  // ---------- Toque ----------
  // Toque/clique na tela da batalha, em coordenadas do canvas.
  toque(x, y, tipo) {
    const dentro = (rx, ry, rw, rh) => x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    if (tipo === 'move') {
      if (this.arrasto && this.estado === 'ataque') {
        this.alma.x += x - this.arrasto.x; this.alma.y += y - this.arrasto.y;
        this.arrasto = { x, y };
      }
      return;
    }
    if (tipo === 'up') { this.arrasto = null; return; }
    const c = this.caixa;
    switch (this.estado) {
      case 'ataque':
        this.arrasto = { x, y };   // arrastar o dedo em qualquer lugar move a semente
        break;
      case 'menu': {
        const i = BOTOES.findIndex((_, k) => dentro(40 + k * 176, 378, 160, 44));
        if (i >= 0) { this.menu = i; Input.pulso('ok'); }
        else if (dentro(c.x, c.y, c.w, c.h)) this.sabor.completar();
        break;
      }
      case 'submenu': {
        const i = this.opcoes.findIndex((_, k) => dentro(c.x, c.y + 10 + k * 24, c.w, 24));
        if (i >= 0) { this.sub = i; Input.pulso('ok'); }
        else Input.pulso('back');
        break;
      }
      case 'texto':
      case 'fala':
        Input.pulso('ok');
        break;
    }
  },

  // ---------- Desenho ----------
  desenhar(ctx, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (this.tremorTela > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    ctx.font = '24px ' + FONTE; ctx.textBaseline = 'top';
    this.desenharInimigo(ctx, t);
    this.desenharCaixa(ctx, t);
    this.desenharStatus(ctx);
    this.desenharBotoes(ctx);
    ctx.restore();
  },

  desenharInimigo(ctx, t) {
    const spr = SPR[this.def.sprite];
    const s = 1 - this.encolher * 0.7;
    const w = spr.width * s, h = spr.height * s;
    const sx = this.tremor > 0 ? (Math.random() - 0.5) * 10 : 0;
    const cx = 384 + sx, base = 160 + Math.sin(t * 3) * 3;
    ctx.drawImage(spr, cx - w / 2, base - h, w, h);
    // Fagulhas flutuando
    if (this.def.particulas === 'fumaca') for (let i = 0; i < 6; i++) {
      // Fumaça saindo da chaminé
      const f = (t * 0.5 + i / 6) % 1;
      ctx.fillStyle = `rgba(90,90,95,${0.8 - f * 0.7})`;
      ctx.beginPath(); ctx.arc(cx - w * 0.3 + Math.sin(t + i) * 8 + f * 20, base - h - f * 60 + 10, 6 + f * 14, 0, Math.PI * 2); ctx.fill();
    }
    if (this.encolher < 1 && this.def.particulas !== 'fumaca') for (let i = 0; i < 6; i++) {
      const f = (t * 0.6 + i / 6) % 1;
      ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff7a1a';
      ctx.fillRect(cx - 70 + i * 28 + Math.sin(t * 2 + i) * 8, base - 20 - f * 130, 4, 4);
    }
    // O animal em perigo, ao lado
    const animal = SPR[this.def.animal + 'Esq'] || SPR[this.def.animal];
    const tremeAnimal = this.furia > 0 ? Math.sin(t * 40) * 1.5 : 0;
    ctx.drawImage(animal, 560 + tremeAnimal, 160 - animal.height);
    // Nome e barra de fúria
    ctx.fillStyle = this.furia <= 0 ? '#ffe14d' : '#fff';
    ctx.fillText(this.def.nome, 60, 40);
    ctx.fillStyle = '#fff'; ctx.fillText('FÚRIA', 60, 66);
    ctx.fillStyle = '#400'; ctx.fillRect(122, 70, 120, 16);
    ctx.fillStyle = this.fase2 ? '#ff2a2a' : '#ff5a1a'; ctx.fillRect(122, 70, 120 * this.furia / this.def.furia, 16);
    if (this.def.chefe) { ctx.fillStyle = '#ff4a4a'; ctx.fillText(this.def.final ? '★ CHEFE FINAL ★' : '★ CHEFE ★', 60, 92); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(122, 70, 120, 16);
  },

  desenharCaixa(ctx, t) {
    const c = this.caixa;
    ctx.fillStyle = '#000'; ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(c.x, c.y, c.w, c.h);
    const tx = c.x + 24, ty = c.y + 18, tw = c.w - 48;
    if (this.estado === 'menu') this.sabor.desenhar(ctx, tx, ty, tw, 26);
    else if (this.estado === 'texto') this.maquina.desenhar(ctx, tx, ty, tw, 26);
    else if (this.estado === 'fala') this.desenharBalao(ctx);
    else if (this.estado === 'submenu') {
      this.opcoes.forEach((o, i) => {
        const y = c.y + 12 + i * 24;
        ctx.fillStyle = o.apagada ? '#777' : (i === this.sub ? '#ffe14d' : '#fff');
        ctx.fillText('* ' + o.rotulo + (o.estrela ? '  ★' : ''), tx + 30, y);
        if (i === this.sub) ctx.drawImage(SPR.alma, tx + 6, y + 6);
      });
    } else if (this.estado === 'ataque') {
      ctx.save();
      ctx.beginPath(); ctx.rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4); ctx.clip();
      for (const b of this.balas) this.desenharBala(ctx, b, t);
      ctx.restore();
      if (this.inv <= 0 || Math.floor(t * 12) % 2 === 0)
        ctx.drawImage(SPR.alma, Math.round(this.alma.x - SPR.alma.width / 2), Math.round(this.alma.y - SPR.alma.height / 2));
    }
  },

  desenharBala(ctx, b, t) {
    const c = this.caixa;
    if (b.tipo === 'linha' && b.cor === 'laser') {
      if (b.t < b.aviso) {
        ctx.fillStyle = `rgba(255,60,60,${0.3 + 0.4 * Math.abs(Math.sin(b.t * 16))})`;
        if (b.horizontal) ctx.fillRect(c.x, b.pos - 1, c.w, 2); else ctx.fillRect(b.pos - 1, c.y, 2, c.h);
        return;
      }
      ctx.fillStyle = '#ff2a2a';
      if (b.horizontal) ctx.fillRect(c.x, b.pos - 6, c.w, 12); else ctx.fillRect(b.pos - 6, c.y, 12, c.h);
      ctx.fillStyle = '#ffffff';
      if (b.horizontal) ctx.fillRect(c.x, b.pos - 2, c.w, 4); else ctx.fillRect(b.pos - 2, c.y, 4, c.h);
      return;
    }
    if (b.tipo === 'metal') {
      ctx.fillStyle = '#9aa0a8'; ctx.fillRect(Math.round(b.x - 6), Math.round(b.y - 6), 12, 12);
      ctx.fillStyle = '#f2c230'; ctx.fillRect(Math.round(b.x - 6), Math.round(b.y - 6), 12, 3);
      return;
    }
    if (b.tipo === 'fumacaT') {
      ctx.fillStyle = 'rgba(120,100,140,.9)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(170,150,190,.8)'; ctx.beginPath(); ctx.arc(b.x - b.r / 3, b.y - b.r / 3, b.r / 2.5, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (b.tipo === 'oleo') {
      ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a5aa0'; ctx.fillRect(b.x - 2, b.y - 3, 2, 2);
      return;
    }
    if (b.tipo === 'manchaOleo') {
      ctx.fillStyle = '#1a1a1e'; ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), b.w, b.h);
      ctx.fillStyle = 'rgba(140,100,200,.6)'; ctx.fillRect(Math.round(b.x - b.w / 4), Math.round(b.y - 2), b.w / 2, 2);
      return;
    }
    if (b.tipo === 'linha') {
      if (b.t < b.aviso) {
        // Aviso tracejado e pulsante: mostra onde o chão vai rachar.
        ctx.fillStyle = `rgba(255,207,63,${0.35 + 0.35 * Math.abs(Math.sin(b.t * 14))})`;
        for (let s = 0; s < (b.horizontal ? c.w : c.h); s += 12) {
          if (b.horizontal) ctx.fillRect(c.x + s, b.pos - 2, 7, 4); else ctx.fillRect(b.pos - 2, c.y + s, 4, 7);
        }
        return;
      }
      ctx.fillStyle = '#8a5a2b';
      for (let s = 0; s < (b.horizontal ? c.w : c.h); s += 8) {
        const z = Math.sin(s * 0.7 + b.pos) * 3;
        if (b.horizontal) ctx.fillRect(c.x + s, b.pos - 5 + z, 9, 10); else ctx.fillRect(b.pos - 5 + z, c.y + s, 10, 9);
      }
      ctx.fillStyle = '#ffb02e';
      if (b.horizontal) ctx.fillRect(c.x, b.pos - 1, c.w, 2); else ctx.fillRect(b.pos - 1, c.y, 2, c.h);
      return;
    }
    if (b.tipo === 'raio') {
      ctx.fillStyle = '#ffcf3f'; ctx.fillRect(Math.round(b.x - 5), Math.round(b.y - 5), 10, 10);
      ctx.fillStyle = '#fff6c2'; ctx.fillRect(Math.round(b.x - 2), Math.round(b.y - 2), 4, 4);
      return;
    }
    if (b.tipo === 'semente') {
      ctx.fillStyle = '#e8dcb0'; ctx.fillRect(Math.round(b.x - 3), Math.round(b.y - 2), 6, 4);
      ctx.fillStyle = '#b0a070'; ctx.fillRect(Math.round(b.x - (b.vx > 0 ? 9 : -3)), Math.round(b.y), 6, 1);
      return;
    }
    if (b.tipo === 'vento') {
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(Math.round(b.x - 18), Math.round(b.y), 36, 2);
      return;
    }
    if (b.tipo === 'touceira') {
      const base = c.y + c.h;
      if (b.t < b.aviso) {
        if (Math.floor(b.t * 10) % 2) return;
        ctx.fillStyle = '#8f9e78';
        for (let i = -2; i <= 2; i++) ctx.fillRect(Math.round(b.x + i * 4), base - 6, 2, 6);
        return;
      }
      const h = alturaTouceira(b);
      ctx.fillStyle = '#6a7a5a';
      for (let i = -2; i <= 2; i++) ctx.fillRect(Math.round(b.x + i * 4 - 1), base - h * (1 - Math.abs(i) * 0.15), 3, h);
      ctx.fillStyle = '#d8d0b0';
      for (let i = -2; i <= 2; i += 2) ctx.fillRect(Math.round(b.x + i * 4 - 2), base - h * (1 - Math.abs(i) * 0.15) - 4, 5, 4);
      return;
    }
    if (b.tipo === 'no') {
      ctx.fillStyle = '#d8ccb0';
      ctx.fillRect(Math.round(b.x - 7), Math.round(b.y), 14, 1);
      ctx.fillRect(Math.round(b.x), Math.round(b.y - 7), 1, 14);
      ctx.fillStyle = '#f4ead0'; ctx.fillRect(Math.round(b.x - 3), Math.round(b.y - 3), 6, 6);
      return;
    }
    if (b.tipo === 'gaiola') {
      const x0 = Math.round(b.x - b.w / 2), y0 = Math.round(b.y - b.h / 2);
      ctx.fillStyle = '#c8ccd0';
      for (let i = 0; i <= b.w; i += 6) ctx.fillRect(x0 + i, y0 + 3, 2, b.h - 3);
      ctx.fillRect(x0, y0 + 3, b.w + 2, 3); ctx.fillRect(x0, y0 + b.h - 3, b.w + 2, 3);
      ctx.fillRect(x0 + b.w / 2 - 1, y0 - 3, 3, 6);
      return;
    }
    if (b.tipo === 'arapuca') {
      if (b.t < b.aviso) {
        ctx.strokeStyle = `rgba(255,207,63,${0.4 + 0.4 * Math.abs(Math.sin(b.t * 12))})`; ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(b.x, b.y, 18, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      // Arapuca: pirâmide de gravetos
      ctx.fillStyle = '#8a5a2b';
      for (let i = 0; i < 5; i++) {
        const l = 36 - i * 7, y = b.y + 14 - i * 6;
        ctx.fillRect(Math.round(b.x - l / 2), Math.round(y), l, 3);
      }
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(Math.round(b.x - 1), Math.round(b.y - 18), 2, 8);
      return;
    }
    if (b.tipo === 'tronco') {
      ctx.fillStyle = '#7a4f28'; ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), b.w, b.h);
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), b.w, 3);
      ctx.fillStyle = '#d9b07a';
      ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), 5, b.h); ctx.fillRect(Math.round(b.x + b.w / 2 - 5), Math.round(b.y - b.h / 2), 5, b.h);
      return;
    }
    if (b.tipo === 'serra') {
      ctx.fillStyle = '#b8c0c8'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8eef2';
      for (let i = 0; i < 8; i++) { const a = t * 14 + i * Math.PI / 4; ctx.fillRect(b.x + Math.cos(a) * b.r - 2, b.y + Math.sin(a) * b.r - 2, 4, 4); }
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (b.tipo === 'gota') {
      ctx.fillStyle = '#c8d0d8'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - b.r / 2, b.y - b.r / 2, Math.max(1, b.r / 2), Math.max(1, b.r / 2));
      return;
    }
    if (b.tipo === 'redemoinho') {
      ctx.strokeStyle = '#c9a26a'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(b.x, b.y - 4 + i * 4, b.r - i * 2.5, t * 9 + i, t * 9 + i + 4); ctx.stroke();
      }
      return;
    }
    if (b.tipo === 'fumaca') {
      ctx.fillStyle = 'rgba(170,170,170,.85)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(220,220,220,.7)';
      ctx.beginPath(); ctx.arc(b.x - b.r / 3, b.y - b.r / 3, b.r / 2.5, 0, Math.PI * 2); ctx.fill();
      return;
    }
    const pisca = Math.floor(t * 10 + b.y) % 2;
    ctx.fillStyle = b.tipo === 'chama' ? (pisca ? '#ff7a1a' : '#ffd23f') : (pisca ? '#ffd23f' : '#ff5a1a');
    const r = b.r;
    ctx.fillRect(Math.round(b.x - r), Math.round(b.y - r), r * 2, r * 2);
    ctx.fillStyle = '#c2261b';
    ctx.fillRect(Math.round(b.x - r), Math.round(b.y + r - 3), r * 2, 3);
  },

  desenharBalao(ctx) {
    const x = 470, y = 30, w = 250;
    if (!this.maquina.linhas) this.maquina.linhas = quebrarLinhas(ctx, this.maquina.texto, w - 24);
    const h = this.maquina.linhas.length * 24 + 18;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x - 16, y + 30); ctx.lineTo(x, y + 36); ctx.fill();
    this.maquina.desenhar(ctx, x + 12, y + 9, w - 24, 24, '#000');
  },

  desenharStatus(ctx) {
    const comp = COMPANHEIROS.find(c => c.id === Estado.companheiro);
    const y = 346;
    ctx.fillStyle = '#fff';
    ctx.fillText('VOCÊ', 60, y);
    if (comp) desenharCompanheiro(ctx, comp.id, 160, y + 26, Math.floor(this.tempo * 3) % 2, false, this.tempo, true);
    ctx.fillText('PV', 250, y);
    ctx.fillStyle = '#c00'; ctx.fillRect(285, y + 3, this.pvMax * 4, 18);
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(285, y + 3, this.pv * 4, 18);
    ctx.fillStyle = '#fff'; ctx.fillText(this.pv + ' / ' + this.pvMax, 300 + this.pvMax * 4, y);
  },

  desenharBotoes(ctx) {
    BOTOES.forEach((nome, i) => {
      const x = 40 + i * 176, y = 378, w = 160, h = 44;
      const sel = this.estado === 'menu' && i === this.menu;
      ctx.strokeStyle = sel ? '#ffe14d' : '#ff8c1a'; ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = sel ? '#ffe14d' : '#ff8c1a';
      ctx.font = '28px ' + FONTE;
      ctx.fillText(nome, x + 40, y + 9);
      if (sel) ctx.drawImage(SPR.alma, x + 14, y + 16);
    });
    ctx.font = '24px ' + FONTE;
  }
};
