// Minijogo "Travessia do Lobo" (estilo Frogger): o lobo-guará atravessa a rodovia e o riacho
// para chegar às lobeiras. Ensina sobre atropelamentos de fauna e passagens de fauna.
const TRAV_LINHAS = 9;                   // 0 = lobeiras, 1-2 = riacho, 3 = canteiro, 4-7 = rodovia, 8 = início
const TRAV_LOBEIRAS = [3, 8, 13];        // colunas das 3 lobeiras (uma por travessia)
const TRAV_ACELERACAO = 0.45;            // quanto o trânsito acelera a cada lobeira
const TRAV_FATOS = [
  'Muito bem! O lobo-guará anda muitos quilômetros por noite atrás de comida, e muitas vezes precisa cruzar estradas.',
  'Sabia? Os atropelamentos estão entre as maiores ameaças ao lobo-guará e ao tamanduá-bandeira.',
  'PASSAGENS DE FAUNA (túneis e pontes sob as estradas), cercas que guiam os bichos e redutores de velocidade salvam vidas!'
];

// Faixas: veículos na rodovia e troncos no riacho. vel em px/s (sinal = sentido).
// itens: [posição inicial, largura, tipo]
const TRAV_FAIXAS = [
  { linha: 1, vel: 55,   rio: true, itens: [[0, 150, 'tronco'], [300, 190, 'tronco'], [620, 150, 'tronco']] },
  { linha: 2, vel: -75,  rio: true, itens: [[80, 190, 'tronco'], [430, 150, 'tronco'], [720, 150, 'tronco']] },
  { linha: 4, vel: -70,  itens: [[100, 130, 'caminhao'], [520, 130, 'caminhao']] },
  { linha: 5, vel: 105,  itens: [[0, 70, 'carro'], [300, 70, 'carro'], [600, 70, 'carro']] },
  { linha: 6, vel: -150, itens: [[150, 40, 'moto'], [560, 40, 'moto']] },
  { linha: 7, vel: 85,   itens: [[60, 70, 'carro'], [380, 70, 'carro'], [700, 70, 'carro']] }
];
const TRAV_CORES = ['#d9302c', '#2a6ad5', '#f2c230', '#f4f4f0', '#3f9a3a'];

const Travessia = {
  iniciar() {
    this.estado = 'intro';
    this.t = 0;
    this.reiniciar();
  },

  reiniciar() {
    this.vidas = 3; this.tempo = 0; this.cheias = []; this.tVias = 0; this.banner = null;
    this.colocarNoInicio();
  },

  colocarNoInicio() {
    this.lobo = { col: 8, x: 8 * T + T / 2, linha: 8, de: null, tPulo: 0, dir: 1 };
    this.inv = 0.8;
  },

  // O trânsito acelera bastante a cada lobeira alcançada (+45%: na última travessia, quase o dobro).
  ritmo() { return 1 + this.cheias.length * TRAV_ACELERACAO; },

  // Posição atual dos itens de uma faixa (andam em círculo, saindo de um lado e voltando do outro).
  itens(f) {
    const periodo = W + 260;
    return f.itens.map(([x0, w, tipo], i) => {
      const x = (((x0 + f.vel * this.tVias) % periodo) + periodo) % periodo - 130;
      return { x, w, tipo, cor: TRAV_CORES[(i + f.linha) % TRAV_CORES.length] };
    });
  },

  yDa(linha) { return linha * T; },

  // ---------- Atualização ----------
  atualizar(dt) {
    this.t += dt;
    if (this.estado === 'intro') {
      if (Input.bateu('ok')) { this.estado = 'jogando'; Som.ok(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'pausa' || this.estado === 'perdeu') {
      if (Input.bateu('ok')) { if (this.estado === 'perdeu') this.reiniciar(); this.estado = 'jogando'; Som.ok(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'venceu') { if (Input.bateu('ok')) this.sair(true); return; }
    if (this.estado === 'fato') { if (Input.bateu('ok')) { this.estado = 'jogando'; Som.sel(); } return; }
    if (this.estado !== 'jogando') return;
    if (Input.bateu('back')) { this.estado = 'pausa'; Som.sel(); return; }

    this.tempo += dt;
    this.tVias += dt * this.ritmo();
    this.inv = Math.max(0, this.inv - dt);
    const l = this.lobo;

    // Pulo: uma casa por toque (como no Frogger)
    if (l.de) {
      l.tPulo += dt;
      if (l.tPulo >= 0.12) { l.de = null; this.aoPousar(); if (this.estado !== 'jogando') return; }
    } else {
      for (const [k, dc, dl] of [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]]) {
        if (!Input.bateu(k)) continue;
        const nl = l.linha + dl, nx = l.x + dc * T;
        if (nl > 8 || nx < T / 2 - 2 || nx > W - T / 2 + 2) break;
        if (nl === 0) {
          // Só dá para subir perto de uma lobeira livre (até uma coluna de distância: o lobo se encaixa nela)
          const col = Math.floor(nx / T);
          const alvo = TRAV_LOBEIRAS.find(c => Math.abs(c - col) <= 1 && !this.cheias.includes(c));
          if (alvo === undefined || this.cheias.includes(alvo)) { Som.erro(); break; }
          l.x = alvo * T + T / 2;
        } else l.x = nx;
        if (dc) l.dir = dc;
        l.de = { linha: l.linha }; l.linha = nl; l.tPulo = 0;
        Som.tom(520 + (8 - nl) * 30, 0.05, 'square', 0.035);
        break;
      }
    }

    // No riacho, o lobo é levado pelo tronco
    const faixa = TRAV_FAIXAS.find(f => f.linha === l.linha);
    if (faixa && faixa.rio && !l.de) {
      l.x += faixa.vel * this.ritmo() * dt;
      if (l.x < 0 || l.x > W) { this.perder('O tronco levou o lobo embora!'); return; }
    }

    // Colisões
    if (!l.de && faixa) {
      const sobre = this.itens(faixa).some(it => l.x > it.x + 6 && l.x < it.x + it.w - 6);
      if (faixa.rio && !sobre) { this.perder('Splash! Caiu no riacho.'); return; }
      if (!faixa.rio && this.inv <= 0 && this.itens(faixa).some(it => l.x + 14 > it.x && l.x - 14 < it.x + it.w)) {
        this.perder('Cuidado com os carros!'); return;
      }
    }
  },

  aoPousar() {
    const l = this.lobo;
    if (l.linha !== 0) return;
    const col = Math.floor(l.x / T);
    this.cheias.push(col);
    Som.pista();
    if (this.cheias.length >= TRAV_LOBEIRAS.length) { this.vencer(); return; }
    // Pausa para a curiosidade, sem esconder o trânsito durante o jogo
    this.fato = TRAV_FATOS[this.cheias.length - 1];
    this.estado = 'fato';
    this.colocarNoInicio();
  },

  perder(motivo) {
    this.vidas--;
    Som.dano();
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) { /* sem vibração */ }
    this.banner = { texto: motivo, ate: this.t + 2.5, alerta: true };
    if (this.vidas <= 0) { this.estado = 'perdeu'; return; }
    this.colocarNoInicio();
  },

  vencer() {
    this.estado = 'venceu';
    Som.vitoria();
    const tempo = Math.floor(this.tempo);
    this.novoRecorde = !Estado.recordeLobo || tempo < Estado.recordeLobo;
    if (this.novoRecorde) Estado.recordeLobo = tempo;
    this.fichaNova = !(Estado.fichasBonus || []).includes('passagens');
    Estado.fichasBonus = [...new Set([...(Estado.fichasBonus || []), 'passagens'])];
    salvar();
  },

  sair(venceu) {
    Jogo.fade(() => {
      Jogo.modo = 'mundo';
      document.body.classList.remove('em-batalha');
      Input.limpar();
      Jogo.aviso(venceu ? (this.fichaNova ? 'Ficha bônus "Passagens de fauna" na BIOMADEX!' : 'O lobo chegou às lobeiras!') : 'O lobo voltou para a beira da estrada.', 3200);
    });
  },

  // Toque: tocar acima, abaixo ou dos lados do lobo faz ele pular para lá.
  toque(x, y) {
    if (this.estado !== 'jogando') { Input.pulso('ok'); return; }
    const l = this.lobo, dx = x - l.x, dy = y - (this.yDa(l.linha) + T / 2);
    if (Math.abs(dx) > Math.abs(dy)) Input.pulso(dx > 0 ? 'right' : 'left');
    else Input.pulso(dy > 0 ? 'down' : 'up');
  },

  relogio(seg) {
    const s = Math.floor(seg);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },

  // ---------- Desenho ----------
  desenhar(t) {
    // Lobeiras (linha 0)
    ctx.fillStyle = '#4f7a2a'; ctx.fillRect(0, 0, W, T);
    for (let x = 0; x < W; x += 24) { ctx.fillStyle = '#3a5a22'; ctx.fillRect(x + 4, 6 + (x % 3) * 4, 14, 10); }
    for (const c of TRAV_LOBEIRAS) {
      const x = c * T;
      ctx.fillStyle = '#c99b3d'; ctx.fillRect(x + 2, 2, T - 4, T - 4);
      ctx.fillStyle = '#3f8a35'; ctx.beginPath(); ctx.arc(x + T / 2, T / 2, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9ac040';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 14 + i * 10, T / 2 + (i % 2) * 6, 6, 0, Math.PI * 2); ctx.fill(); }
      if (this.cheias.includes(c) && SPR.loboMini) ctx.drawImage(SPR.loboMini[0], x + T / 2 - SPR.loboMini[0].width / 2, T - SPR.loboMini[0].height);
    }
    // Riacho (linhas 1 e 2)
    ctx.fillStyle = '#3d7fa6'; ctx.fillRect(0, T, W, 2 * T);
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    for (let i = 0; i < 16; i++) ctx.fillRect((i * 53 + this.t * 30) % W, T + 10 + (i % 4) * 22, 14, 2);
    // Canteiro (linha 3) com placa de passagem de fauna
    ctx.fillStyle = '#c99b3d'; ctx.fillRect(0, 3 * T, W, T);
    ctx.fillStyle = '#d9ad4b'; for (let x = 0; x < W; x += 30) ctx.fillRect(x + 6, 3 * T + 10 + (x % 4) * 6, 10, 4);
    this.desenharPlaca(W - 70, 3 * T + 4);
    // Rodovia (linhas 4 a 7)
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(0, 4 * T, W, 4 * T);
    ctx.fillStyle = '#f2c230'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, 6 * T - 2, 34, 4);
    ctx.fillStyle = '#e8e8e8'; for (let x = 0; x < W; x += 60) { ctx.fillRect(x + 20, 5 * T - 1, 24, 2); ctx.fillRect(x + 20, 7 * T - 1, 24, 2); }
    ctx.fillRect(0, 4 * T, W, 3); ctx.fillRect(0, 8 * T - 3, W, 3);
    // Início (linha 8)
    ctx.fillStyle = '#c99b3d'; ctx.fillRect(0, 8 * T, W, T);
    // Troncos e veículos
    for (const f of TRAV_FAIXAS) for (const it of this.itens(f)) this.desenharItem(it, this.yDa(f.linha), f.vel);
    // Lobo
    const l = this.lobo;
    if (l && (this.inv <= 0 || Math.floor(t * 12) % 2) && SPR.loboMini) {
      const k = l.de ? Math.min(1, l.tPulo / 0.12) : 1;
      const y = (l.de ? this.yDa(l.de.linha) + (this.yDa(l.linha) - this.yDa(l.de.linha)) * k : this.yDa(l.linha)) + T / 2;
      const spr = SPR.loboMini[l.dir < 0 ? 1 : 0], salto = l.de ? Math.sin(Math.PI * k) * 8 : 0;
      ctx.drawImage(spr, Math.round(l.x - spr.width / 2), Math.round(y - spr.height / 2 - salto));
    }
    this.desenharHud();
    // Aviso curto no rodapé (linha de início, onde não há perigo)
    if (this.banner && this.t < this.banner.ate) {
      ctx.font = '22px ' + FONTE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(120,20,20,.92)'; ctx.fillRect(W / 2 - 160, 8 * T + 8, 320, 32);
      ctx.fillStyle = '#fff'; ctx.fillText(this.banner.texto, W / 2, 8 * T + 24);
      ctx.textAlign = 'left';
    }
    if (this.estado === 'fato') {
      ctx.font = '24px ' + FONTE;
      this.painel(['LOBEIRA ' + this.cheias.length + '/3!', '', ...quebrarLinhas(ctx, this.fato, W - 260), '', 'AÇÃO: próxima travessia (mais rápida!)']);
    }
    if (this.estado === 'intro') this.painel([
      'TRAVESSIA DO LOBO',
      '',
      '◀ ▶ ▲ ▼  um pulo por toque',
      'Leve o lobo-guará até as 3 LOBEIRAS.',
      'Cuidado com os carros e não caia no riacho:',
      'pule nos troncos para atravessar!',
      Estado.recordeLobo ? 'Seu recorde: ' + this.relogio(Estado.recordeLobo) : 'O trânsito fica BEM mais rápido a cada lobeira!',
      '',
      'Aperte AÇÃO para começar'
    ]);
    if (this.estado === 'pausa') this.painel(['PAUSA', '', 'AÇÃO: continuar', 'VOLTAR: sair']);
    if (this.estado === 'perdeu') this.painel(['Ufa, foi por pouco...', '', 'AÇÃO: tentar de novo', 'VOLTAR: sair']);
    if (this.estado === 'venceu') this.painel([
      'O LOBO CHEGOU ÀS LOBEIRAS!',
      '',
      'Tempo: ' + this.relogio(this.tempo) + (this.novoRecorde ? '   ★ NOVO RECORDE! ★' : '   (recorde: ' + this.relogio(Estado.recordeLobo) + ')'),
      this.fichaNova ? '★ Ficha bônus "Passagens de fauna" na BIOMADEX!' : 'Reduza a velocidade: um bicho pode atravessar!',
      '',
      'Aperte AÇÃO para voltar'
    ]);
  },

  desenharItem(it, y, vel) {
    const x = Math.round(it.x);
    if (it.tipo === 'tronco') {
      ctx.fillStyle = '#7a4f28'; ctx.fillRect(x, y + 8, it.w, T - 16);
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x, y + 8, it.w, 4);
      ctx.fillStyle = '#d9b07a'; ctx.fillRect(x, y + 8, 6, T - 16); ctx.fillRect(x + it.w - 6, y + 8, 6, T - 16);
      return;
    }
    const frente = vel > 0 ? x + it.w : x;
    if (it.tipo === 'caminhao') {
      ctx.fillStyle = '#8a8e92'; ctx.fillRect(x, y + 6, it.w, T - 12);
      ctx.fillStyle = '#c0392b'; ctx.fillRect(vel > 0 ? x + it.w - 34 : x, y + 8, 34, T - 16);
      ctx.fillStyle = '#bfe3f0'; ctx.fillRect(vel > 0 ? x + it.w - 12 : x + 4, y + 12, 8, T - 24);
    } else if (it.tipo === 'carro') {
      ctx.fillStyle = it.cor; ctx.fillRect(x, y + 10, it.w, T - 20);
      ctx.fillStyle = '#bfe3f0'; ctx.fillRect(x + it.w / 2 - 12, y + 13, 24, T - 26);
    } else {
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x, y + 18, it.w, 12);
      ctx.fillStyle = it.cor; ctx.fillRect(x + 10, y + 14, 20, 20);
    }
    // Faróis
    ctx.fillStyle = '#ffe680'; ctx.fillRect(vel > 0 ? frente - 4 : frente, y + 12, 4, 6); ctx.fillRect(vel > 0 ? frente - 4 : frente, y + T - 18, 4, 6);
  },

  desenharPlaca(x, y) {
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 22, y + 26, 4, 18);
    ctx.fillStyle = '#f2c230'; ctx.beginPath(); ctx.moveTo(x + 24, y); ctx.lineTo(x + 48, y + 24); ctx.lineTo(x + 24, y + 48 - 20); ctx.lineTo(x, y + 24); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x + 15, y + 15, 18, 6); ctx.fillRect(x + 16, y + 21, 3, 5); ctx.fillRect(x + 29, y + 21, 3, 5); ctx.fillRect(x + 31, y + 11, 4, 5);
  },

  desenharHud() {
    ctx.font = '22px ' + FONTE; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(W - 250, 8 * T + 6, 242, 36);
    ctx.fillStyle = '#ffe14d'; ctx.fillText('LOBEIRAS ' + this.cheias.length + '/3', W - 240, 8 * T + 12);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < this.vidas ? '#e0302a' : '#444';
      const hx = W - 120 + i * 22, hy = 8 * T + 16;
      ctx.fillRect(hx, hy, 7, 7); ctx.fillRect(hx + 9, hy, 7, 7); ctx.fillRect(hx + 2, hy + 5, 12, 6); ctx.fillRect(hx + 5, hy + 11, 6, 4);
    }
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(8, 8 * T + 6, 120, 36);
    ctx.fillStyle = '#fff'; ctx.fillText('⏱ ' + this.relogio(this.tempo), 18, 8 * T + 12);
  },

  painel(linhas) {
    const h = linhas.length * 30 + 40, y = (H - h) / 2;
    ctx.fillStyle = 'rgba(0,0,0,.88)'; ctx.fillRect(90, y, W - 180, h);
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
