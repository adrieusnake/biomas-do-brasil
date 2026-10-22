// Minijogo "Corrida do Jacaré": um River Raid pacífico pelo rio do Pantanal.
// O jacaré nada rio acima desviando de onças, troncos e redes, e pega peixes para manter o fôlego.
const RIO_COMPRIMENTO = 9600;   // distância até a baía (em pixels do mundo): cerca de 1 minuto
const RIO_Y = 350;              // altura do jacaré na tela
const RIO_GASTO = { normal: 10, acelerando: 14 };   // fôlego gasto por segundo: acaba em 10 s sem peixes
const RIO_VEL = { normal: 175, rapido: 255, lento: 105 };

// Curiosidades das placas na margem (aparecem quando o jacaré passa por elas).
const RIO_CURIOSIDADES = [
  'No Pantanal, as ONÇAS-PINTADAS caçam jacarés. E elas nadam muito bem!',
  'O jacaré consegue passar muito tempo debaixo d’água prendendo a respiração.',
  'Redes de pesca abandonadas viram armadilhas para jacarés, ariranhas e aves.',
  'O AGUAPÉ é uma planta que flutua e serve de abrigo para peixinhos.',
  'O jacaré-do-pantanal já foi muito caçado por causa do couro. Com a proteção, a população se recuperou!',
  'Sabia? O sexo dos filhotes de jacaré depende da temperatura do ninho!',
  'Jacarés comem peixes e caramujos e ajudam a manter os rios equilibrados.'
];

// Gerador de números pseudoaleatórios com semente: o rio é sempre igual (recorde justo).
function rioAleatorio(semente) {
  let s = semente >>> 0;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const Rio = {
  iniciar() {
    const rnd = rioAleatorio(2026);
    // Curvas do rio: pontos de controle a cada 320 de distância (centro e largura).
    this.pontos = [];
    for (let d = 0; d <= RIO_COMPRIMENTO + 1200; d += 320) {
      const largo = d < 600 || d > RIO_COMPRIMENTO - 300;
      this.pontos.push({ c: largo ? W / 2 : 260 + rnd() * 248, w: largo ? 360 : 190 + rnd() * 150 });
    }
    // Objetos ao longo do rio
    this.objetos = [];
    let placa = 0;
    for (let d = 520; d < RIO_COMPRIMENTO - 400; d += 210 + rnd() * 60) {
      const { c, w } = this.margens(d), dif = d / RIO_COMPRIMENTO;   // fica mais difícil com a distância
      const x = c + (rnd() - 0.5) * (w - 70);
      const r = rnd();
      if (r < 0.32 + dif * 0.1) this.objetos.push({ tipo: 'onca', d, x, vx: (rnd() < 0.5 ? -1 : 1) * (45 + dif * 50) });
      else if (r < 0.48 + dif * 0.1) this.objetos.push({ tipo: 'oncaPula', d, lado: rnd() < 0.5 ? -1 : 1, x: 0, vx: 0, pulou: false });
      else if (r < 0.62) this.objetos.push({ tipo: 'tronco', d, x, vx: (rnd() < 0.5 ? -1 : 1) * (35 + dif * 45) });
      else if (r < 0.74) this.objetos.push({ tipo: 'rede', d, x });
      else this.objetos.push({ tipo: 'aguape', d, x });
    }
    for (let d = 420; d < RIO_COMPRIMENTO - 300; d += 400) {
      const { c, w } = this.margens(d + 100);
      this.objetos.push({ tipo: 'peixes', d: d + 100, x: c + (rnd() - 0.5) * (w - 90) });
    }
    for (let d = 700; d < RIO_COMPRIMENTO - 400 && placa < RIO_CURIOSIDADES.length; d += 950)
      this.objetos.push({ tipo: 'placa', d, lado: placa % 2 ? 1 : -1, texto: RIO_CURIOSIDADES[placa++] });
    this.estado = 'intro';
    this.t = 0;
    this.reiniciar();
  },

  reiniciar() {
    this.dist = 0; this.tempo = 0; this.vidas = 3; this.folego = 100;
    this.x = W / 2; this.vel = RIO_VEL.normal; this.inv = 1.5; this.lento = 0; this.banner = null; this.dedo = null;
    for (const o of this.objetos) { o.pegou = false; o.lida = false; if (o.tipo === 'oncaPula') { o.pulou = false; o.vx = 0; } }
    for (const o of this.objetos) if (o.tipo === 'onca' || o.tipo === 'tronco') { o.x0 = o.x0 ?? o.x; o.vx0 = o.vx0 ?? o.vx; o.x = o.x0; o.vx = o.vx0; }
  },

  // Centro e largura do rio numa distância d (curvas suaves entre os pontos de controle).
  margens(d) {
    const i = Math.max(0, Math.floor(d / 320)), f = (d - i * 320) / 320, k = (1 - Math.cos(Math.PI * f)) / 2;
    const a = this.pontos[Math.min(i, this.pontos.length - 1)], b = this.pontos[Math.min(i + 1, this.pontos.length - 1)];
    return { c: a.c + (b.c - a.c) * k, w: a.w + (b.w - a.w) * k };
  },

  telaY(d) { return RIO_Y - (d - this.dist); },

  // ---------- Atualização ----------
  atualizar(dt) {
    this.t += dt;
    if (this.estado === 'intro') {
      if (Input.bateu('ok')) { this.estado = 'nadando'; Som.ok(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'pausa' || this.estado === 'perdeu') {
      if (Input.bateu('ok')) { if (this.estado === 'perdeu') this.reiniciar(); this.estado = 'nadando'; Som.ok(); }
      else if (Input.bateu('back')) this.sair(false);
      return;
    }
    if (this.estado === 'chegou') { if (Input.bateu('ok')) this.sair(true); return; }
    if (this.estado !== 'nadando') return;
    if (Input.bateu('back')) { this.estado = 'pausa'; Som.sel(); return; }

    this.tempo += dt;
    this.inv = Math.max(0, this.inv - dt);
    this.lento = Math.max(0, this.lento - dt);

    // Velocidade: ▲ acelera, ▼ freia (o aguapé deixa lento por um tempo)
    let alvo = Input.segurando('up') ? RIO_VEL.rapido : Input.segurando('down') ? RIO_VEL.lento : RIO_VEL.normal;
    if (this.lento > 0) alvo = RIO_VEL.lento;
    this.vel += (alvo - this.vel) * Math.min(1, dt * 4);
    this.dist += this.vel * dt;

    // Desvio para os lados (teclas, direcional ou o dedo na tela)
    let dir = (Input.segurando('right') ? 1 : 0) - (Input.segurando('left') ? 1 : 0);
    if (this.dedo !== null && !dir) dir = Math.abs(this.dedo - this.x) < 6 ? 0 : Math.sign(this.dedo - this.x);
    this.x += dir * 230 * dt;

    // Fôlego: gasta mais quando acelera
    this.folego -= dt * (this.vel > RIO_VEL.normal + 20 ? RIO_GASTO.acelerando : RIO_GASTO.normal);
    if (this.folego <= 0) { this.folego = 100; this.bater('Sem fôlego! Pegue os peixes para recuperar.'); if (this.estado !== 'nadando') return; }

    // Margens
    const { c, w } = this.margens(this.dist);
    if (this.inv <= 0 && (this.x - 13 < c - w / 2 || this.x + 13 > c + w / 2)) {
      this.bater('O jacaré bateu na margem!');
      if (this.estado !== 'nadando') return;
      this.x = c;
    }
    this.x = Math.max(c - w / 2 + 4, Math.min(c + w / 2 - 4, this.x));

    // Objetos
    for (const o of this.objetos) {
      const y = this.telaY(o.d);
      if (y < -80 || y > H + 80) continue;
      const m = this.margens(o.d);
      if (o.tipo === 'onca' || o.tipo === 'tronco') {
        // Onças nadam e troncos boiam de um lado para o outro, batendo nas margens
        const folga = o.tipo === 'tronco' ? 46 : 18;
        o.x += o.vx * dt;
        if (o.x < m.c - m.w / 2 + folga) { o.x = m.c - m.w / 2 + folga; o.vx = Math.abs(o.vx); }
        if (o.x > m.c + m.w / 2 - folga) { o.x = m.c + m.w / 2 - folga; o.vx = -Math.abs(o.vx); }
      }
      if (o.tipo === 'oncaPula') {
        // Espera na margem e pula na água quando o jacaré chega perto
        if (!o.pulou) { o.x = m.c + o.lado * (m.w / 2 + 26); if (y > RIO_Y - 230) { o.pulou = true; o.t = 0; o.vx = -o.lado * 170; Som.tom(260, 0.15, 'sawtooth', 0.04, -80); } }
        else { o.t += dt; o.x += o.vx * dt; if (o.t > 0.7) o.vx *= 0.96; o.x = Math.max(m.c - m.w / 2 + 16, Math.min(m.c + m.w / 2 - 16, o.x)); }
      }
      const dx = Math.abs(o.x - this.x), dy = Math.abs(y - RIO_Y);
      if (o.tipo === 'peixes' && !o.pegou && dx < 34 && dy < 30) {
        o.pegou = true; this.folego = Math.min(100, this.folego + 35); Som.cura();
      }
      if (o.tipo === 'placa' && !o.lida && y > RIO_Y - 40) { o.lida = true; this.banner = { texto: o.texto, ate: this.t + 4 }; Som.sel(); }
      if (o.tipo === 'aguape' && dx < 34 && dy < 26 && this.lento <= 0) { this.lento = 1.2; Som.tom(200, 0.12, 'triangle', 0.05); }
      if (this.inv > 0) continue;
      const perigo = (o.tipo === 'onca' || (o.tipo === 'oncaPula' && o.pulou)) ? [18, 22]
        : o.tipo === 'tronco' ? [44, 16] : o.tipo === 'rede' ? [34, 26] : null;
      if (perigo && dx < perigo[0] && dy < perigo[1]) {
        this.bater(o.tipo === 'rede' ? 'O jacaré se enroscou numa rede abandonada!' : o.tipo === 'tronco' ? 'Cuidado com os troncos!' : 'Uma onça quase pegou o jacaré!');
        if (this.estado !== 'nadando') return;
      }
    }

    if (this.dist >= RIO_COMPRIMENTO) this.chegar();
  },

  bater(motivo) {
    this.vidas--;
    Som.dano();
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) { /* sem vibração */ }
    this.banner = { texto: motivo, ate: this.t + 2.5, alerta: true };
    if (this.vidas <= 0) { this.estado = 'perdeu'; return; }
    this.inv = 2;
  },

  chegar() {
    this.estado = 'chegou';
    Som.vitoria();
    const tempo = Math.floor(this.tempo);
    this.novoRecorde = !Estado.recordeRio || tempo < Estado.recordeRio;
    if (this.novoRecorde) Estado.recordeRio = tempo;
    this.fichaNova = !(Estado.fichasBonus || []).includes('jacare');
    Estado.fichasBonus = [...new Set([...(Estado.fichasBonus || []), 'jacare'])];
    salvar();
  },

  sair(completou) {
    Jogo.fade(() => {
      Jogo.modo = 'mundo';
      document.body.classList.remove('em-batalha');
      Input.limpar();
      Jogo.aviso(completou ? (this.fichaNova ? 'Ficha bônus do jacaré na BIOMADEX!' : 'Corrida concluída!') : 'Você voltou para a margem.', 3200);
    });
  },

  toque(x, tipo) { this.dedo = tipo === 'up' ? null : x; },

  relogio(seg) {
    const s = Math.floor(seg);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },

  // ---------- Desenho ----------
  desenhar(t) {
    // Margens e água, em faixas horizontais
    for (let y = 0; y < H; y += 6) {
      const d = this.dist + (RIO_Y - y), { c, w } = this.margens(d);
      const l = c - w / 2, r = c + w / 2;
      ctx.fillStyle = (Math.floor(d / 24) % 2) ? '#5f9a3e' : '#5a943a';
      ctx.fillRect(0, y, W, 6);
      ctx.fillStyle = '#c9ad72'; ctx.fillRect(l - 8, y, w + 16, 6);
      ctx.fillStyle = '#3d7fa6'; ctx.fillRect(l, y, w, 6);
    }
    // Reflexos na água
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 18; i++) {
      const d = Math.floor((this.dist + i * 61) / 61) * 61 - i * 7, y = this.telaY(d) % H;
      const { c, w } = this.margens(d);
      ctx.fillRect(c - w / 2 + 20 + ((i * 97) % Math.max(20, w - 50)), (y + H) % H, 14, 2);
    }
    // Árvores nas margens
    for (let d = Math.floor((this.dist - 120) / 90) * 90; d < this.dist + H; d += 90) {
      const y = this.telaY(d), { c, w } = this.margens(d);
      for (const lado of [-1, 1]) {
        const k = ((d / 90) * 7 + (lado > 0 ? 3 : 0)) % 5, x = c + lado * (w / 2 + 50 + (k * 23) % 60);
        if (x < -40 || x > W + 40) continue;
        if (k < 2 && SPR.palmeira) ctx.drawImage(SPR.palmeira, x - SPR.palmeira.width / 4, y - SPR.palmeira.height / 2, SPR.palmeira.width / 2, SPR.palmeira.height / 2);
        else { ctx.fillStyle = k === 2 ? '#e86aa8' : '#3f8a35'; ctx.beginPath(); ctx.arc(x, y - 20, 22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - 3, y - 4, 6, 14); }
      }
    }
    // Baía de chegada
    const yBaia = this.telaY(RIO_COMPRIMENTO);
    if (yBaia > -200) {
      ctx.fillStyle = '#3d7fa6'; ctx.fillRect(0, yBaia - 200, W, 200);
      ctx.fillStyle = '#ffe14d'; ctx.font = '30px ' + FONTE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BAÍA DOS JACARÉS', W / 2, yBaia - 120);
      for (let i = 0; i < 5; i++) this.desenharJacare(W / 2 - 160 + i * 80, yBaia - 60, t + i, 0.8);
      ctx.textAlign = 'left';
    }
    // Objetos
    for (const o of this.objetos) {
      const y = this.telaY(o.d);
      if (y < -80 || y > H + 80) continue;
      if (o.tipo === 'peixes' && !o.pegou) this.desenharPeixes(o.x, y, t);
      if (o.tipo === 'aguape') this.desenharAguape(o.x, y);
      if (o.tipo === 'tronco') this.desenharTronco(o.x, y);
      if (o.tipo === 'rede') this.desenharRede(o.x, y);
      if (o.tipo === 'onca' || o.tipo === 'oncaPula') this.desenharOnca(o, y, t);
      if (o.tipo === 'placa') {
        const { c, w } = this.margens(o.d), x = c + o.lado * (w / 2 + 30);
        if (SPR.placa) ctx.drawImage(SPR.placa, x - SPR.placa.width / 2, y - SPR.placa.height);
      }
    }
    // Jacaré
    if (this.inv <= 0 || Math.floor(t * 12) % 2) this.desenharJacare(this.x, RIO_Y, t, 1);
    this.desenharHud();
    if (this.banner && this.t < this.banner.ate) {
      ctx.font = '22px ' + FONTE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const linhas = quebrarLinhas(ctx, this.banner.texto, 560);
      const h = linhas.length * 24 + 16;
      ctx.fillStyle = this.banner.alerta ? 'rgba(120,20,20,.9)' : 'rgba(0,0,0,.82)'; ctx.fillRect(W / 2 - 300, 78, 600, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 300, 78, 600, h);
      ctx.fillStyle = '#fff'; linhas.forEach((l, i) => ctx.fillText(l, W / 2, 78 + 20 + i * 24));
      ctx.textAlign = 'left';
    }
    if (this.estado === 'intro') this.painel([
      'CORRIDA DO JACARÉ',
      '',
      '◀ ▶ desviar     ▲ acelerar     ▼ frear',
      'Desvie das ONÇAS, dos troncos e das redes.',
      'Pegue os PEIXES para não ficar sem fôlego.',
      'O aguapé deixa o jacaré mais lento.',
      Estado.recordeRio ? 'Seu recorde: ' + this.relogio(Estado.recordeRio) : 'Chegue à baía dos jacarés!',
      '',
      'Aperte AÇÃO para nadar'
    ]);
    if (this.estado === 'pausa') this.painel(['PAUSA', '', 'AÇÃO: continuar', 'VOLTAR: sair do rio']);
    if (this.estado === 'perdeu') this.painel(['O jacaré cansou...', '', 'AÇÃO: tentar de novo', 'VOLTAR: sair do rio']);
    if (this.estado === 'chegou') this.painel([
      'CHEGOU À BAÍA!',
      '',
      'Tempo: ' + this.relogio(this.tempo) + (this.novoRecorde ? '   ★ NOVO RECORDE! ★' : '   (recorde: ' + this.relogio(Estado.recordeRio) + ')'),
      this.fichaNova ? '★ Ficha bônus do jacaré liberada na BIOMADEX!' : 'A família de jacarés agradece a visita!',
      '',
      'Aperte AÇÃO para voltar'
    ]);
  },

  desenharJacare(x, y, t, escala) {
    const spr = SPR.jacareCima && SPR.jacareCima[Math.floor(t * 4) % 2];
    if (!spr) return;
    const w = spr.width * escala, h = spr.height * escala;
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x - w / 2 - 4, y + h / 2 - 4, w + 8, 3);
    ctx.drawImage(spr, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
  },

  desenharOnca(o, y, t) {
    const spr = SPR.oncaCima;
    if (!spr) return;
    const pulando = o.tipo === 'oncaPula' && o.pulou && o.t < 0.7;
    const esc = pulando ? 1 + Math.sin(Math.PI * Math.min(1, o.t / 0.7)) * 0.35 : 1;
    if (!(o.tipo === 'oncaPula' && !o.pulou)) {
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(o.x, y + 10, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.translate(o.x, y);
    if (o.vx) ctx.rotate(Math.sign(o.vx) * 0.5);
    ctx.drawImage(spr, -spr.width * esc / 2, -spr.height * esc / 2, spr.width * esc, spr.height * esc);
    ctx.restore();
  },

  desenharPeixes(x, y, t) {
    for (let i = 0; i < 5; i++) {
      const a = t * 2 + i * 1.26, px = x + Math.cos(a) * 18, py = y + Math.sin(a) * 10;
      ctx.fillStyle = '#d8e0e8'; ctx.beginPath(); ctx.ellipse(px, py, 6, 3, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
    }
  },

  desenharAguape(x, y) {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#3f9a46' : '#57b552';
      ctx.beginPath(); ctx.arc(x - 20 + (i % 3) * 20, y - 8 + Math.floor(i / 3) * 16, 12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#b48ad8'; ctx.fillRect(x - 4, y - 4, 7, 7); ctx.fillRect(x + 14, y + 6, 6, 6);
  },

  desenharTronco(x, y) {
    ctx.fillStyle = '#7a4f28'; ctx.fillRect(x - 44, y - 9, 88, 18);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x - 44, y - 9, 88, 4);
    ctx.fillStyle = '#d9b07a'; ctx.fillRect(x - 44, y - 9, 6, 18); ctx.fillRect(x + 38, y - 9, 6, 18);
  },

  desenharRede(x, y) {
    ctx.strokeStyle = 'rgba(240,240,240,.85)'; ctx.lineWidth = 1;
    for (let i = -32; i <= 32; i += 8) { ctx.beginPath(); ctx.moveTo(x + i, y - 24); ctx.lineTo(x + i, y + 24); ctx.stroke(); }
    for (let j = -24; j <= 24; j += 8) { ctx.beginPath(); ctx.moveTo(x - 32, y + j); ctx.lineTo(x + 32, y + j); ctx.stroke(); }
    ctx.fillStyle = '#e04a2a'; for (let i = -32; i <= 32; i += 16) ctx.fillRect(x + i - 3, y - 27, 6, 6);
  },

  desenharHud() {
    ctx.font = '22px ' + FONTE; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(8, 8, 270, 62);
    ctx.fillStyle = '#ffe14d'; ctx.fillText('CORRIDA DO JACARÉ', 18, 11);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < this.vidas ? '#e0302a' : '#444';
      const hx = 18 + i * 24, hy = 40;
      ctx.fillRect(hx, hy, 7, 7); ctx.fillRect(hx + 9, hy, 7, 7); ctx.fillRect(hx + 2, hy + 5, 12, 6); ctx.fillRect(hx + 5, hy + 11, 6, 4);
    }
    ctx.fillStyle = '#fff'; ctx.fillText(this.relogio(this.tempo), 100, 36);
    // Fôlego
    ctx.fillStyle = '#fff'; ctx.fillText('FÔLEGO', 150, 36);
    ctx.fillStyle = '#333'; ctx.fillRect(208, 41, 60, 12);
    ctx.fillStyle = this.folego < 25 ? '#e0302a' : '#4ad0e8'; ctx.fillRect(208, 41, 60 * Math.max(0, this.folego) / 100, 12);
    // Progresso até a baía
    const prog = Math.min(1, this.dist / RIO_COMPRIMENTO);
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(W - 40, 70, 24, 300);
    ctx.fillStyle = '#3d7fa6'; ctx.fillRect(W - 36, 74 + 292 * (1 - prog), 16, 292 * prog);
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(W - 40, 70 + 292 * (1 - prog), 24, 6);
  },

  painel(linhas) {
    const h = linhas.length * 30 + 40, y = (H - h) / 2;
    ctx.fillStyle = 'rgba(0,0,0,.86)'; ctx.fillRect(90, y, W - 180, h);
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
