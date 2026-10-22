// Fase secreta "Trilha do Boto": corrida curta (cerca de 1 minuto) no estilo Pitfall,
// pela floresta amazônica. Ao final, o Kauã entrega o Cocar dos Guardiões.
const TRILHA_CHAO = 330;               // altura do chão (topo da grama)
const TRILHA_AGUA = TRILHA_CHAO + 18;  // superfície da água nos rios e poças
const TRILHA_GRAV = 1500, TRILHA_PULO = 560, TRILHA_VEL = 165;

// Trechos da trilha, em ordem (w = largura em pixels).
// chao: terra firme | buraco: pule | poca: pule (piranhas!) | rio: atravesse pelo cipó
const TRILHA_MAPA = [
  { t: 'chao', w: 420 },
  { t: 'buraco', w: 70 },
  { t: 'chao', w: 440, troncos: 1 },
  { t: 'poca', w: 80 },
  { t: 'chao', w: 300, marco: true },
  { t: 'rio', w: 260 },
  { t: 'chao', w: 260 },
  { t: 'buraco', w: 85 },
  { t: 'chao', w: 160 },
  { t: 'buraco', w: 85 },
  { t: 'chao', w: 440, troncos: 1, marco: true },
  { t: 'poca', w: 85 },
  { t: 'chao', w: 180 },
  { t: 'poca', w: 80 },
  { t: 'chao', w: 300, marco: true },
  { t: 'rio', w: 280 },
  { t: 'chao', w: 420, troncos: 1 },
  { t: 'buraco', w: 80 },
  { t: 'chao', w: 220, marco: true },
  { t: 'rio', w: 300 },
  { t: 'chao', w: 160 },
  { t: 'poca', w: 85 },
  { t: 'chao', w: 640, fim: true }
];

const Trilha = {
  iniciar() {
    let x = 0;
    this.segs = TRILHA_MAPA.map(s => { const seg = { ...s, x }; x += s.w; return seg; });
    this.total = x;
    const ultimo = this.segs[this.segs.length - 1];
    this.fimX = ultimo.x + 380;
    this.estado = 'intro';
    this.t = 0;
    this.reiniciar();
  },

  reiniciar() {
    this.vidas = 3;
    this.tempo = 0;
    this.marco = 60;
    this.colocarNoMarco();
  },

  colocarNoMarco() {
    this.p = { x: this.marco, y: TRILHA_CHAO, vx: 0, vy: 0, noChao: true, dir: 1, cipo: null, soltou: 1, queda: null };
    this.inv = 1.2;
  },

  segEm(x) { return this.segs.find(s => x >= s.x && x < s.x + s.w); },
  apoiado(x) { return [x - 8, x + 8].some(px => { const s = this.segEm(px); return s && s.t === 'chao'; }); },

  // Posição do cipó de um rio: um pêndulo preso no alto das árvores.
  cipo(seg) {
    const ax = seg.x + seg.w / 2, ay = 26, L = 250, fase = 2.1 * this.t + seg.x * 0.01;
    const th = 0.72 * Math.sin(fase), dth = 0.72 * 2.1 * Math.cos(fase);
    return { ax, ay, L, th, dth, tx: ax + L * Math.sin(th), ty: ay + L * Math.cos(th) };
  },

  // Piranhas de uma poça: saltam para fora d'água em intervalos.
  piranhas(seg) {
    // Ciclo de 2,6 s: cada piranha passa 0,8 s fora d'água; sobra ~1,5 s seguro para pular.
    // Bolhas aparecem 0,5 s antes do salto, avisando o perigo.
    return [[0.32, 0], [0.68, 0.3]].map(([fx, off]) => {
      const ciclo = (this.t + off + seg.x * 0.003) % 2.6, p = ciclo / 0.8;
      return { x: seg.x + seg.w * fx, y: p < 1 ? TRILHA_AGUA - 130 * Math.sin(Math.PI * p) : TRILHA_AGUA + 20,
               fora: p < 1, p, bolhas: ciclo > 2.1 };
    });
  },

  // Troncos rolando para a esquerda no meio de um trecho de chão.
  // As pontas do trecho ficam livres: onde se pousa de um pulo e onde se espera antes de pular.
  troncos(seg) {
    const lista = [], inicio = seg.x + 120, fim = seg.x + seg.w - 160, faixa = fim - inicio;
    for (let k = 0; k < (seg.troncos || 0); k++)
      lista.push({ x: fim - ((this.t * 75 + k * faixa / seg.troncos) % faixa), y: TRILHA_CHAO - 10 });
    return lista;
  },

  // ---------- Atualização ----------
  atualizar(dt) {
    this.t += dt;
    if (this.estado === 'intro') {
      if (Input.bateu('ok') || Input.bateu('up')) { this.estado = 'jogando'; Som.ok(); }
      if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'pausa') {
      if (Input.bateu('ok')) { this.estado = 'jogando'; Som.sel(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'gameover') {
      if (Input.bateu('ok')) { this.reiniciar(); this.estado = 'jogando'; Som.ok(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado !== 'jogando') return;
    if (Input.bateu('back')) { this.estado = 'pausa'; Som.sel(); return; }

    this.tempo += dt;
    this.inv = Math.max(0, this.inv - dt);
    const p = this.p, pular = Input.bateu('ok') || Input.bateu('up');
    p.soltou += dt;

    if (p.cipo) {
      // Pendurado no cipó: balança junto; ao pular, solta com o embalo.
      const c = this.cipo(p.cipo);
      p.x = c.tx; p.y = c.ty + 40;
      if (pular) {
        p.vx = c.L * c.dth * Math.cos(c.th);
        p.vy = -c.L * c.dth * Math.sin(c.th) - 320;
        p.dir = p.vx >= 0 ? 1 : -1;
        p.cipo = null; p.soltou = 0; p.noChao = false;
        Som.tom(520, 0.08, 'square', 0.04);
      }
    } else {
      const dir = (Input.segurando('right') ? 1 : 0) - (Input.segurando('left') ? 1 : 0);
      if (p.noChao) p.vx = dir * TRILHA_VEL;
      else if (dir) p.vx += dir * 600 * dt, p.vx = Math.max(-TRILHA_VEL * 1.6, Math.min(TRILHA_VEL * 1.6, p.vx));
      if (dir) p.dir = dir;
      if (pular && p.noChao) { p.vy = -TRILHA_PULO; p.noChao = false; Som.tom(440, 0.09, 'square', 0.04, 300); }
      const yAntes = p.y;
      p.vy += TRILHA_GRAV * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.x = Math.max(12, Math.min(this.total - 12, p.x));
      // Chão
      if (p.y >= TRILHA_CHAO && yAntes <= TRILHA_CHAO + 2 && this.apoiado(p.x)) { p.y = TRILHA_CHAO; p.vy = 0; p.noChao = true; p.queda = null; }
      else if (p.noChao && !this.apoiado(p.x)) p.noChao = false;
      // Dentro de um buraco ou da água, não dá para atravessar a parede de terra.
      if (p.y > TRILHA_CHAO + 2) {
        p.queda = p.queda || this.segEm(p.x);
        if (p.queda) p.x = Math.max(p.queda.x + 8, Math.min(p.queda.x + p.queda.w - 8, p.x));
        const s = p.queda;
        if (s && (s.t === 'rio' || s.t === 'poca') && p.y > TRILHA_AGUA + 6) { this.cair('agua'); return; }
        if (p.y > TRILHA_CHAO + 100) { this.cair('buraco'); return; }
      }
      // Agarrar um cipó
      if (p.soltou > 0.5) for (const s of this.segs) if (s.t === 'rio' && Math.abs(s.x + s.w / 2 - p.x) < 260) {
        const c = this.cipo(s);
        if (Math.hypot(c.tx - p.x, c.ty - (p.y - 30)) < 30) { p.cipo = s; p.vx = p.vy = 0; Som.tom(330, 0.06, 'triangle', 0.05); break; }
      }
    }

    // Pontos de controle
    for (const s of this.segs) if (s.marco && p.x > s.x + 40 && this.marco < s.x + 40) { this.marco = s.x + 40; Som.tom(880, 0.08, 'triangle', 0.05); }

    // Perigos: piranhas e troncos
    if (this.inv <= 0) {
      const corpo = { x: p.x - 9, y: p.y - 34, w: 18, h: 34 };
      const bate = (x, y, w, h) => corpo.x < x + w && corpo.x + corpo.w > x && corpo.y < y + h && corpo.y + corpo.h > y;
      for (const s of this.segs) {
        if (Math.abs(s.x - p.x) > 700) continue;
        if (s.t === 'poca') for (const f of this.piranhas(s)) if (f.fora && bate(f.x - 12, f.y - 8, 24, 16)) return this.ferir();
        if (s.troncos) for (const tr of this.troncos(s)) if (bate(tr.x - 17, tr.y - 10, 34, 20)) return this.ferir();
      }
    }

    // Chegou ao fim da trilha
    if (p.x >= this.fimX - 30) this.chegar();
  },

  ferir() {
    this.vidas--;
    Som.dano();
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) { /* sem vibração */ }
    if (this.vidas <= 0) { this.estado = 'gameover'; return; }
    this.inv = 1.5;
    if (!this.p.cipo) { this.p.vy = -260; this.p.noChao = false; }
  },

  cair(onde) {
    Som.erro();
    this.splash = onde === 'agua' ? { x: this.p.x, t: 0 } : null;
    this.vidas--;
    if (this.vidas <= 0) { this.estado = 'gameover'; return; }
    this.colocarNoMarco();
  },

  chegar() {
    this.estado = 'fim';
    const K = t => ({ nome: 'KAUÃ', texto: t, voz: 1.25 });
    const paginas = [{ texto: '(No fim da trilha, o boto mergulha e some. Na beira do rio, alguém está esperando...)' }];
    if (!Estado.cocar) {
      paginas.push(
        K('Você seguiu o boto até aqui? Ele só mostra este caminho para quem protege a floresta!'),
        K('Meu povo preparou este COCAR para você. Ele não é uma arma: é um símbolo da força dos guardiões da floresta.'),
        K('Cada povo indígena tem seus próprios cocares, com cores e significados diferentes. Eles são usados em cerimônias e momentos importantes, por isso não são fantasia.'),
        K('Quando enfrentar um grande desafio, um CHEFE, mostre o cocar. Todos os guardiões vão estar ao seu lado!'),
        { texto: '★ Você recebeu: COCAR DOS GUARDIÕES! (Use em ITEM contra um chefe: a fúria dele vai a zero.)', som: 'pista' }
      );
    } else {
      paginas.push(K('Você de novo! O boto gosta de você. Correr pela trilha é sempre uma aventura, né?'));
    }
    Dialogo.abrir(paginas, () => {
      if (!Estado.cocar) { Estado.cocar = 'tem'; Estado.itens.push('cocar'); salvar(); }
      this.sair(true);
    });
  },

  sair(completou) {
    Jogo.fade(() => {
      Jogo.modo = 'mundo';
      document.body.classList.remove('em-batalha');
      Input.limpar();
      Jogo.aviso(completou ? `Trilha concluída em ${this.relogio()}!` : 'Você voltou da trilha secreta.', 3000);
    });
  },

  relogio() {
    const s = Math.floor(this.tempo);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },

  // ---------- Desenho ----------
  desenhar(t) {
    const p = this.p;
    const cam = Math.max(0, Math.min(this.total - W, p.x - 260));
    this.desenharFundo(cam);
    ctx.save(); ctx.translate(-Math.round(cam), 0);
    for (const s of this.segs) {
      if (s.x + s.w < cam - 40 || s.x > cam + W + 40) continue;
      this.desenharTrecho(s);
    }
    for (const s of this.segs) {
      if (s.x + s.w < cam - 300 || s.x > cam + W + 300) continue;
      if (s.t === 'rio') this.desenharCipo(s);
      if (s.t === 'poca') for (const f of this.piranhas(s)) {
        if (f.fora) this.desenharPiranha(f);
        else if (f.bolhas) {
          ctx.fillStyle = 'rgba(255,255,255,.8)';
          for (let i = 0; i < 3; i++) ctx.fillRect(f.x - 8 + i * 7, TRILHA_AGUA - 4 - ((this.t * 40 + i * 5) % 10), 4, 4);
        }
      }
      if (s.troncos) for (const tr of this.troncos(s)) this.desenharTronco(tr);
    }
    this.desenharFinal();
    this.desenharJogador(t);
    ctx.restore();
    this.desenharHud();
    if (this.estado === 'intro') this.painel([
      'TRILHA SECRETA DO BOTO',
      '',
      '◀ ▶  andar      ▲ ou AÇÃO  pular',
      'Pule nos CIPÓS para atravessar os rios.',
      'Aperte de novo para soltar, com o embalo para a frente!',
      'Cuidado com buracos, troncos e as piranhas das poças.',
      '',
      'Aperte AÇÃO para começar'
    ]);
    if (this.estado === 'pausa') this.painel(['PAUSA', '', 'AÇÃO: continuar', 'VOLTAR: sair da trilha']);
    if (this.estado === 'gameover') this.painel(['Ops! Você caiu muitas vezes...', '', 'AÇÃO: tentar de novo', 'VOLTAR: sair da trilha']);
  },

  desenharFundo(cam) {
    ctx.fillStyle = '#0f2a18'; ctx.fillRect(0, 0, W, H);
    // Camada distante: troncos escuros (andam devagar)
    for (let i = -1; i < 14; i++) {
      const base = i * 70 - (cam * 0.3) % 70, larg = 16 + ((i * 37) % 3) * 6;
      ctx.fillStyle = '#183a20'; ctx.fillRect(base, 40, larg, TRILHA_CHAO - 40);
    }
    // Camada do meio: troncos maiores e folhagem
    for (let i = -1; i < 9; i++) {
      const k = Math.floor((cam * 0.6) / 120) + i;
      const base = k * 120 - cam * 0.6 + 30, larg = 26 + (k * 13 % 3) * 8;
      ctx.fillStyle = '#2a4a24'; ctx.fillRect(base, 30, larg, TRILHA_CHAO - 30);
      ctx.fillStyle = '#3a5a2e'; ctx.fillRect(base + 4, 30, 4, TRILHA_CHAO - 30);
    }
    // Copa das árvores no alto, com cipós pendurados
    for (let x = -40; x < W + 40; x += 36) {
      const k = Math.floor((x + cam * 0.8) / 36);
      const bx = x - (cam * 0.8) % 36;
      ctx.fillStyle = k % 2 ? '#1f5a2a' : '#2a6a32';
      ctx.beginPath(); ctx.arc(bx, 10, 34 + (k * 7 % 12), 0, Math.PI * 2); ctx.fill();
      if (k % 3 === 0) { ctx.fillStyle = '#3e8f3a'; ctx.fillRect(bx, 30, 2, 40 + (k * 11 % 50)); }
    }
  },

  desenharTrecho(s) {
    const x = s.x, w = s.w;
    if (s.t === 'chao') {
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x, TRILHA_CHAO, w, H - TRILHA_CHAO);
      ctx.fillStyle = '#3f8a35'; ctx.fillRect(x, TRILHA_CHAO, w, 8);
      ctx.fillStyle = '#4a2e18';
      for (let i = 0; i < w; i += 23) ctx.fillRect(x + i + ((i * 7) % 9), TRILHA_CHAO + 20 + ((i * 13) % 50), 6, 4);
      ctx.fillStyle = '#5cb04a';
      for (let i = 4; i < w; i += 17) ctx.fillRect(x + i, TRILHA_CHAO - 4, 2, 4);
      if (s.marco) {
        // Ponto de controle: um totem de madeira com folha
        const mx = x + 40;
        ctx.fillStyle = '#7a5a3a'; ctx.fillRect(mx - 3, TRILHA_CHAO - 40, 6, 40);
        ctx.fillStyle = this.marco >= mx ? '#7cd25a' : '#a8a8a0'; ctx.fillRect(mx - 9, TRILHA_CHAO - 48, 18, 10);
      }
      return;
    }
    if (s.t === 'buraco') {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x, TRILHA_CHAO, w, H - TRILHA_CHAO);
      ctx.fillStyle = '#3a2412'; ctx.fillRect(x, TRILHA_CHAO, 4, H - TRILHA_CHAO); ctx.fillRect(x + w - 4, TRILHA_CHAO, 4, H - TRILHA_CHAO);
      return;
    }
    // Rio ou poça
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x, TRILHA_AGUA + 40, w, H);
    ctx.fillStyle = s.t === 'rio' ? '#2c4a40' : '#3a5a3a';
    ctx.fillRect(x, TRILHA_AGUA, w, H - TRILHA_AGUA);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < w - 20; i += 40) ctx.fillRect(x + 10 + i + Math.sin(this.t * 2 + i) * 6, TRILHA_AGUA + 6 + (i % 3) * 8, 14, 2);
    if (s.t === 'rio') {
      // O boto acompanha você, saltando no rio
      const fase = ((this.t + s.x * 0.002) % 3.2) / 1.1;
      if (fase < 1 && SPR.fauna && SPR.fauna.boto) {
        const b = SPR.fauna.boto[0];
        const bx = x + w * 0.2 + fase * w * 0.6, by = TRILHA_AGUA - Math.sin(Math.PI * fase) * 50;
        ctx.drawImage(b, Math.round(bx - b.width / 2), Math.round(by - b.height / 2));
      }
    }
  },

  desenharCipo(s) {
    const c = this.cipo(s);
    ctx.strokeStyle = '#4a7a2a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(c.ax, c.ay); ctx.lineTo(c.tx, c.ty); ctx.stroke();
    ctx.fillStyle = '#5cb04a';
    for (let i = 1; i < 6; i++) {
      const f = i / 6;
      ctx.fillRect(c.ax + (c.tx - c.ax) * f + (i % 2 ? 3 : -9), c.ay + (c.ty - c.ay) * f, 6, 4);
    }
    ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.arc(c.tx, c.ty, 6, 0, Math.PI * 2); ctx.fill();
  },

  desenharPiranha(f) {
    ctx.save(); ctx.translate(f.x, f.y);
    ctx.rotate(f.p < 0.5 ? -0.6 : 0.6);
    ctx.fillStyle = '#7a8a90'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e04a2a'; ctx.beginPath(); ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#7a8a90'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-20, -7); ctx.lineTo(-20, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(7, 1, 2, 3); ctx.fillRect(10, 1, 2, 3);
    ctx.fillStyle = '#111'; ctx.fillRect(5, -4, 3, 3);
    ctx.restore();
  },

  desenharTronco(tr) {
    ctx.fillStyle = '#7a4f28'; ctx.fillRect(Math.round(tr.x - 17), tr.y - 10, 34, 20);
    ctx.fillStyle = '#5a3a1e';
    const giro = (this.t * 6) % 8;
    for (let i = -16; i < 16; i += 8) ctx.fillRect(Math.round(tr.x + i + giro) - 1, tr.y - 10, 2, 20);
    ctx.fillStyle = '#d9b07a'; ctx.fillRect(Math.round(tr.x - 17), tr.y - 10, 4, 20);
  },

  desenharFinal() {
    const x = this.fimX;
    // Kauã esperando ao lado do cocar
    if (SPR.kaua) ctx.drawImage(SPR.kaua, x + 30, TRILHA_CHAO - SPR.kaua.height + 2);
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 6, TRILHA_CHAO - 30, 12, 30);
    if (!Estado.cocar && SPR.cocar) ctx.drawImage(SPR.cocar, Math.round(x - SPR.cocar.width / 2), TRILHA_CHAO - 30 - SPR.cocar.height + Math.sin(this.t * 3) * 3);
  },

  desenharJogador(t) {
    const p = this.p;
    if (this.inv > 0 && Math.floor(t * 12) % 2) return;
    const andando = p.noChao && Math.abs(p.vx) > 1;
    const img = !p.noChao || p.cipo ? IMG.andando1 : andando ? IMG['andando' + (Math.floor(t / 0.12) % 4)] : IMG.parado;
    if (!img) return;
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));
    if (p.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -32, -46, 64, 64);
    ctx.restore();
    if (p.cipo) { ctx.fillStyle = '#6b4a2a'; ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 46, 6, 8); }
    if (this.splash) {
      this.splash.t += 1 / 60;
      if (this.splash.t > 0.6) this.splash = null;
    }
  },

  desenharHud() {
    ctx.font = '24px ' + FONTE; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(8, 8, 300, 56);
    ctx.fillStyle = '#ffe14d'; ctx.fillText('TRILHA DO BOTO', 18, 12);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < this.vidas ? '#e0302a' : '#444';
      const hx = 18 + i * 26, hy = 42;
      ctx.fillRect(hx, hy, 8, 8); ctx.fillRect(hx + 10, hy, 8, 8); ctx.fillRect(hx + 2, hy + 6, 14, 6); ctx.fillRect(hx + 6, hy + 12, 6, 4);
    }
    ctx.fillStyle = '#fff'; ctx.fillText(this.relogio(), 120, 38);
    // Progresso até o fim da trilha
    const prog = Math.min(1, this.p.x / this.fimX);
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(W - 230, 14, 216, 22);
    ctx.fillStyle = '#3f9a3a'; ctx.fillRect(W - 226, 18, 208 * prog, 14);
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(W - 226 + 208 * prog - 3, 15, 6, 20);
  },

  painel(linhas) {
    const h = linhas.length * 30 + 40, y = (H - h) / 2;
    ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(90, y, W - 180, h);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(92, y + 2, W - 184, h - 4);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    linhas.forEach((l, i) => {
      ctx.font = (i === 0 ? '34px ' : '24px ') + FONTE;
      ctx.fillStyle = i === 0 ? '#ffe14d' : '#fff';
      ctx.fillText(l, W / 2, y + 20 + i * 30);
    });
    ctx.textAlign = 'left';
  }
};
