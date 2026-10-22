const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = id => document.getElementById(id);

// ---------- Progresso salvo ----------
const CHAVE_SAVE = 'biomas-save-v1';
const ESTADO_INICIAL = () => ({ companheiro: null, pistas: [], itens: [], coletados: [], conversou: {}, poupados: [], resgatados: [] });
let Estado = ESTADO_INICIAL();
function carregar() {
  try { const s = JSON.parse(localStorage.getItem(CHAVE_SAVE)); if (s) Estado = Object.assign(ESTADO_INICIAL(), s); } catch (e) { /* sem save */ }
}
function salvar() {
  try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(Estado)); } catch (e) { /* armazenamento indisponível */ }
}

// ---------- Controles (teclado e toque) ----------
const Input = {
  seg: {}, apertados: new Set(), ordemDirs: [],
  apertar(k) {
    if (!this.seg[k]) this.apertados.add(k);
    this.seg[k] = true;
    if (DIRS[k]) { this.ordemDirs = this.ordemDirs.filter(d => d !== k); this.ordemDirs.push(k); }
  },
  soltar(k) { this.seg[k] = false; this.ordemDirs = this.ordemDirs.filter(d => d !== k); },
  // Um "aperto" instantâneo, usado pelos toques na tela.
  pulso(k) { this.apertados.add(k); },
  bateu(k) { if (this.apertados.has(k)) { this.apertados.delete(k); return true; } return false; },
  segurando(k) { return !!this.seg[k]; },
  // Direção segurada mais recente; um toque rápido (apertou e soltou no mesmo quadro) também conta.
  direcao() { return this.ordemDirs[this.ordemDirs.length - 1] || Object.keys(DIRS).find(d => this.apertados.has(d)) || null; },
  fimQuadro() { this.apertados.clear(); },
  limpar() { this.seg = {}; this.apertados.clear(); this.ordemDirs = []; }
};
const TECLAS = {
  arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
  enter: 'ok', z: 'ok', ' ': 'ok', x: 'back', escape: 'back', shift: 'back', m: 'mapa'
};
document.addEventListener('keydown', e => {
  Som.iniciar();
  if (Jogo.painelAberto) { if (e.key === 'Escape') Jogo.fecharPainel(); return; }
  const k = TECLAS[e.key.toLowerCase()];
  if (!k) return;
  e.preventDefault();
  if (!e.repeat) Input.apertar(k);
});
document.addEventListener('keyup', e => { const k = TECLAS[e.key.toLowerCase()]; if (k) Input.soltar(k); });
window.addEventListener('blur', () => Input.limpar());
function botaoToque(id, k) {
  const el = $(id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); Som.iniciar(); Input.apertar(k); el.classList.add('ativo'); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, e => { e.preventDefault(); Input.soltar(k); el.classList.remove('ativo'); });
}
botaoToque('action', 'ok'); botaoToque('back', 'back');

// ---------- Jogo ----------
const Jogo = {
  modo: 'mundo',          // 'mundo' | 'batalha' | 'transicao'
  painelAberto: null,
  fadeEstado: null,       // { a, fase, cb }
  ultimoInfo: '',

  iniciar() {
    carregar();
    prepararSprites();
    Mundo.entrar(0, 0, 5, 5);
    if (!Estado.companheiro) this.aviso('Fale com o Professor! Chegue perto dele e aperte AÇÃO.', 4500);
    else this.aviso('Bem-vindo de volta! Seu progresso foi carregado.', 3000);
    requestAnimationFrame(t => this.loop(t));
  },

  loop(t) {
    const agora = t / 1000;
    const dt = Math.min(0.05, agora - (this.ultimo || agora));
    this.ultimo = agora;
    this.atualizar(dt, agora);
    this.desenhar(agora);
    Input.fimQuadro();
    requestAnimationFrame(t2 => this.loop(t2));
  },

  atualizar(dt, agora) {
    if (this.fadeEstado) { this.atualizarFade(dt); return; }
    if (this.painelAberto) return;
    if (this.modo === 'transicao') {
      this.tTransicao -= dt;
      if (this.tTransicao <= 0) { this.modo = 'batalha'; document.body.classList.add('em-batalha'); }
      return;
    }
    if (this.modo === 'batalha') { Batalha.atualizar(dt); return; }
    if (this.modo === 'final') {
      if (Input.bateu('ok') && agora - this.finalDesde > 1.5) { this.modo = 'mundo'; Som.ok(); document.body.classList.remove('em-batalha'); }
      return;
    }
    if (Dialogo.ativo) { Dialogo.atualizar(dt); return; }
    if (Input.bateu('mapa')) { this.abrirMapa(); return; }
    if (Input.bateu('ok') && !Mundo.jogador.anda) { this.interagir(); return; }
    Mundo.atualizar(dt);
  },

  desenhar(t) {
    if (this.modo === 'batalha') Batalha.desenhar(ctx, t);
    else if (this.modo === 'transicao') this.desenharTransicao(t);
    else if (this.modo === 'final') this.desenharFinal(t);
    else {
      ctx.fillStyle = BIOMAS[Mundo.bioma].ceu; ctx.fillRect(0, 0, W, H);
      Mundo.desenhar(ctx, t);
      Dialogo.desenhar(ctx, t);
    }
    if (this.fadeEstado) { ctx.fillStyle = `rgba(0,0,0,${this.fadeEstado.a})`; ctx.fillRect(0, 0, W, H); }
    this.atualizarInfo();
    if (this.msgAte && performance.now() > this.msgAte) { $('msg').style.display = 'none'; this.msgAte = 0; }
  },

  atualizarInfo() {
    let html = `BIOMA: <b>${BIOMAS[Mundo.bioma].nome}</b>`;
    if (Mundo.bioma) html += `<br>ÁREA: <b>${Mundo.area + 1}/6</b>`;
    const comp = COMPANHEIROS.find(c => c.id === Estado.companheiro);
    if (comp) html += `<br>COMP.: <b>${comp.emoji} ${comp.nome}</b>`;
    const m = MISSOES[Mundo.bioma];
    if (m && !m.emBreve) {
      const daMissao = [...new Set(m.entidades.filter(e => e.pista).map(e => e.pista))];
      const total = daMissao.length, tem = daMissao.filter(p => Estado.pistas.includes(p)).length;
      html += Estado.resgatados.includes(m.id) ? '<br>MISSÃO: <b>CONCLUÍDA ✓</b>' : `<br>PISTAS: <b>${tem}/${total}</b>`;
    }
    if (html !== this.ultimoInfo) { $('info').innerHTML = html; this.ultimoInfo = html; }
  },

  aviso(texto, ms = 2500) {
    const e = $('msg'); e.textContent = texto; e.style.display = 'block';
    this.msgAte = performance.now() + ms;
  },

  // ---------- Transições ----------
  fade(cb) { this.fadeEstado = { a: 0, fase: 'sai', cb }; },
  atualizarFade(dt) {
    const f = this.fadeEstado;
    if (f.fase === 'sai') { f.a += dt * 5; if (f.a >= 1) { f.a = 1; f.fase = 'entra'; f.cb && f.cb(); } }
    else { f.a -= dt * 5; if (f.a <= 0) { this.fadeEstado = null; } }
  },
  desenharTransicao(t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const j = Mundo.jogador;
    if (Math.floor(t * 8) % 2 === 0) ctx.drawImage(SPR.alma, j.px + T / 2 - 7, j.py + 10);
  },

  // ---------- Mundo ----------
  aoPisar() {
    const j = Mundo.jogador;
    const enc = Mundo.entidades().find(e => e.tipo === 'encontro');
    if (enc && Math.max(Math.abs(enc.x - j.x), Math.abs(enc.y - j.y)) <= 3) this.comecarEncontro();
  },

  interagir() {
    const e = Mundo.entidadeProxima();
    const j = Mundo.jogador, [fx, fy] = DIRS[j.dir];
    const naFrente = e && e.x === j.x + fx && e.y === j.y + fy;
    if (Mundo.compNaFrente() && !naFrente) { this.falarComp(); return; }
    if (!e) {
      const fala = Mundo.falaEm(j.x + fx, j.y + fy);
      if (fala) Dialogo.abrir(fala);
      return;
    }
    // Vira o jogador para a entidade
    if (e.x > j.x) j.dir = 'right'; else if (e.x < j.x) j.dir = 'left'; else if (e.y < j.y) j.dir = 'up'; else j.dir = 'down';
    switch (e.tipo) {
      case 'professor': this.falarProfessor(); break;
      case 'computador': this.abrirDex(); break;
      case 'placa': Dialogo.abrir(e.falas.map(t => ({ nome: 'PLACA', texto: t }))); break;
      case 'npc': this.falarNpc(e); break;
      case 'item': this.pegarItem(e); break;
      case 'encontro': this.comecarEncontro(); break;
      case 'animal': Dialogo.abrir(e.falas); break;
      case 'ninho':
      case 'gaiola':
      case 'objeto':
      case 'veiculo': Dialogo.abrir(e.falas); break;
      case 'fogo': Dialogo.abrir(['(O fogo está forte demais. Melhor não chegar perto!)']); break;
    }
  },

  falarComp() {
    const comp = COMPANHEIROS.find(c => c.id === Estado.companheiro);
    Dialogo.abrir(comp.falas.map(t => ({ nome: comp.nome.toUpperCase(), texto: t, voz: 1.6 })));
  },

  falarNpc(e) {
    const primeira = !Estado.conversou[e.id];
    const falas = primeira || !e.falasDepois ? e.falas : e.falasDepois;
    const paginas = falas.map(t => ({ nome: e.nome, texto: t, voz: e.voz }));
    if (primeira && e.pista) paginas.push({ texto: '★ PISTA: ' + PISTAS[e.pista].nome + ' (nova ação em AGIR!)', som: 'pista' });
    if (primeira && e.item) paginas.push({ texto: '★ Você recebeu: ' + ITENS[e.item].nome.toUpperCase() + '.', som: 'cura' });
    Dialogo.abrir(paginas, () => {
      if (!primeira) return;
      Estado.conversou[e.id] = true;
      if (e.pista && !Estado.pistas.includes(e.pista)) Estado.pistas.push(e.pista);
      if (e.item) Estado.itens.push(e.item);
      salvar();
    });
  },

  pegarItem(e) {
    const paginas = [...e.falas, { texto: '★ Você guardou: ' + ITENS[e.item].nome.toUpperCase() + '. (Recupera ' + ITENS[e.item].cura + ' PV na batalha.)', som: 'cura' }];
    Dialogo.abrir(paginas, () => {
      Estado.coletados.push(e.id); Estado.itens.push(e.item); salvar();
      Mundo.gerar();
    });
  },

  // A missão final só abre quando as exigidas já foram concluídas.
  missaoLiberada(m) { return !m.requer || m.requer.every(id => Estado.resgatados.includes(id)); },

  // Próxima missão pronta que ainda não foi concluída.
  proximaMissao() {
    const b = ORDEM_MISSOES.find(i => !Estado.resgatados.includes(MISSOES[i].id));
    return b === undefined ? null : b;
  },

  falarProfessor() {
    const P = t => ({ nome: 'PROFESSOR', texto: t });
    if (!Estado.companheiro) {
      Dialogo.abrir([
        P('Olá! Eu sou o Professor. Este é o laboratório de proteção aos biomas.'),
        P('Os biomas brasileiros precisam de ajuda: animais estão em perigo por causa de queimadas, desmatamento e tráfico.'),
        P('Você vai resgatá-los. Mas não sozinho! Escolha um companheiro.')
      ], () => this.abrirEscolha());
      return;
    }
    const b = this.proximaMissao();
    if (b === null) {
      Dialogo.abrir([
        P('Você completou todas as missões prontas! Veja as fichas no computador: é a BIOMADEX.'),
        P('As outras missões ainda estão sendo preparadas. Volte em breve!')
      ]);
      return;
    }
    const m = MISSOES[b];
    const conversou = m.entidades.some(e => Estado.conversou[e.id]);
    if (Estado.missaoAtual !== m.id && !conversou) { this.briefing(b, false); return; }
    Dialogo.abrir([
      P(`O ${m.animal.toLowerCase()} conta com você! Converse com as pessoas do ${BIOMAS[b].nome} e junte as pistas.`),
      { nome: 'PROFESSOR', texto: `Quer que eu te leve para o ${BIOMAS[b].nome} agora?`, opcoes: ['Sim', 'Não'],
        aoEscolher: i => { if (i === 0) this.viajar(b); } }
    ]);
  },

  // Explica a missão do bioma `b` e teletransporta o jogador.
  briefing(b = this.proximaMissao(), primeiraVez = true) {
    const comp = COMPANHEIROS.find(c => c.id === Estado.companheiro);
    const P = t => ({ nome: 'PROFESSOR', texto: t });
    const m = MISSOES[b];
    Estado.missaoAtual = m.id; salvar();
    Dialogo.abrir([
      ...(primeiraVez ? [P(`Excelente escolha! ${comp.nome} vai te ajudar. ${comp.bonus}`)] : []),
      ...m.briefing.map(P),
      P('Vou te teletransportar. Boa sorte!')
    ], () => this.viajar(b));
  },

  viajar(bioma) {
    this.fecharPainel();
    this.fade(() => {
      if (bioma === 0) Mundo.entrar(0, 0, 5, 5);
      else Mundo.entrar(bioma, 0, CENTRO_X, CENTRO_Y);
      const m = MISSOES[bioma];
      if (bioma && m.emBreve) this.aviso(`${BIOMAS[bioma].nome}: missão em breve! Explore a paisagem.`, 3200);
      else if (bioma) this.aviso(`Você chegou ao ${BIOMAS[bioma].nome}!`, 2400);
    });
  },

  // ---------- Final do jogo ----------
  finalDoJogo() {
    const P = t => ({ nome: 'PROFESSOR', texto: t });
    Dialogo.abrir([
      P('Você conseguiu! Os seis biomas do Brasil estão mais seguros graças a você.'),
      P('Cerrado, Pantanal, Amazônia, Caatinga, Pampa e Mata Atlântica: cada um é único, e todos estão ligados.'),
      P('Lembre: proteger a natureza não é só coisa de herói de videogame. Plantar árvores, economizar água, não comprar bicho silvestre e denunciar crimes ambientais... tudo isso conta!'),
      { nome: 'PROFESSOR', texto: 'A partir de hoje, você é um GUARDIÃO DOS BIOMAS!', som: 'vitoria' }
    ], () => { this.modo = 'final'; this.finalDesde = performance.now() / 1000; document.body.classList.add('em-batalha'); });
  },

  desenharFinal(t) {
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i))})`;
      ctx.fillRect((i * 137) % W, (i * 71) % 170, 2, 2);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffe14d'; ctx.font = '44px ' + FONTE;
    ctx.fillText('GUARDIÃO DOS BIOMAS', W / 2, 40 + Math.sin(t * 2) * 3);
    ctx.fillStyle = '#fff'; ctx.font = '22px ' + FONTE;
    ctx.fillText('Você salvou os seis biomas do Brasil!', W / 2, 92);
    const animais = [
      [SPR.lobo, 'Lobo-guará', 'Cerrado'], [SPR.fauna.tuiuiu[0], 'Tuiuiú', 'Pantanal'], [SPR.peixeboi, 'Peixe-boi', 'Amazônia'],
      [SPR.comp.arara.dir[0], 'Ararinha-azul', 'Caatinga'], [SPR.veadoLivre, 'Veado-campeiro', 'Pampa'], [SPR.mico, 'Mico-leão', 'Mata Atlântica']
    ];
    animais.forEach(([spr, nome, bioma], i) => {
      const cx = 70 + i * 126, base = 260 + Math.sin(t * 3 + i) * 4;
      ctx.drawImage(spr, Math.round(cx - spr.width / 2), Math.round(base - spr.height));
      ctx.fillStyle = '#fff'; ctx.font = '20px ' + FONTE; ctx.fillText(nome, cx, 272);
      ctx.fillStyle = '#9fd49f'; ctx.font = '18px ' + FONTE; ctx.fillText(bioma, cx, 294);
    });
    const comp = COMPANHEIROS.find(c => c.id === Estado.companheiro);
    if (comp) desenharCompanheiro(ctx, comp.id, W / 2, 372, Math.floor(t * 3) % 2, false, t);
    ctx.fillStyle = '#fff'; ctx.font = '20px ' + FONTE;
    if (comp) ctx.fillText(`E um obrigado especial ao seu companheiro: ${comp.nome}!`, W / 2, 380);
    if (performance.now() / 1000 - this.finalDesde > 1.5 && Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#ffe14d'; ctx.fillText('Obrigado por jogar! Aperte AÇÃO para continuar explorando.', W / 2, 404);
    }
    ctx.textAlign = 'left';
  },

  // ---------- Encontro e batalha ----------
  comecarEncontro() {
    const m = MISSOES[Mundo.bioma];
    Mundo.cancelarRota();
    Dialogo.abrir(m.preBatalha, () => {
      Som.alerta();
      this.modo = 'transicao'; this.tTransicao = 0.9;
      Input.limpar();
      Batalha.iniciar(m.batalha, () => this.aoVencer(m));
    });
  },

  aoVencer(m) {
    document.body.classList.remove('em-batalha');
    this.fade(() => {
      this.modo = 'mundo';
      Estado.poupados.push(m.id); salvar();
      Mundo.gerar();
      Dialogo.abrir(m.resgate, () => {
        Estado.resgatados.push(m.id); salvar();
        this.fade(() => {
          Mundo.entrar(0, 0, 7, 5);
          Mundo.jogador.dir = 'up';
          if (m.final) this.finalDoJogo();
          else this.aviso('Missão concluída! Fale com o Professor ou abra a BIOMADEX.', 4000);
        });
      });
    });
  },

  // ---------- Painéis ----------
  abrirPainel(id) {
    this.painelAberto = id;
    $(id).style.display = 'block';
    Input.limpar();
    // Foco com atraso: evita que a tecla que abriu o painel já clique numa opção.
    setTimeout(() => { const b = $(id).querySelector('button:not(:disabled)'); if (b && this.painelAberto === id) b.focus(); }, 300);
  },
  fecharPainel() {
    if (!this.painelAberto) return;
    $(this.painelAberto).style.display = 'none';
    this.painelAberto = null;
    Input.limpar();
    canvas.focus && canvas.focus();
  },

  abrirEscolha() {
    const c = $('starterChoices'); c.innerHTML = '';
    for (const comp of COMPANHEIROS) {
      const b = document.createElement('button'); b.className = 'opcao';
      b.innerHTML = `<img class="retrato" src="${retratoCompanheiro(comp.id)}" alt="">${comp.nome.toUpperCase()}<small>${comp.bonus}</small>`;
      b.onclick = () => {
        Som.ok(); Estado.companheiro = comp.id; salvar();
        Mundo.posicionarCompanheiro();
        this.fecharPainel(); this.briefing();
      };
      c.appendChild(b);
    }
    this.abrirPainel('starterPanel');
  },

  abrirMapa() {
    if (!Estado.companheiro) { this.aviso('O mapa será liberado depois que você falar com o Professor.', 2600); return; }
    if (this.modo !== 'mundo' || Dialogo.ativo) return;
    const c = $('mapChoices'); c.innerHTML = '';
    BIOMAS.forEach((b, i) => {
      const m = MISSOES[i];
      let status = 'Seu ponto de partida';
      const trancada = m && !this.missaoLiberada(m);
      if (m) status = Estado.resgatados.includes(m.id) ? '✓ Missão concluída' : m.emBreve ? 'Missão em breve'
        : trancada ? '🔒 Missão final: complete as outras 5 missões' : m.final ? '★ MISSÃO FINAL disponível!' : '★ Missão disponível!';
      const btn = document.createElement('button'); btn.className = 'opcao';
      btn.innerHTML = `${b.nome}<small>${status}</small>`;
      btn.disabled = trancada;
      btn.onclick = () => { Som.ok(); this.viajar(i); };
      c.appendChild(btn);
    });
    this.abrirPainel('mapPanel');
  },

  abrirDex() {
    const c = $('dexCards'); c.innerHTML = '';
    for (let i = 1; i <= 6; i++) {
      const m = MISSOES[i], ok = Estado.resgatados.includes(m.id);
      const d = document.createElement('div'); d.className = 'ficha' + (ok ? ' ok' : '');
      d.innerHTML = ok
        ? `<h3>${m.emoji} ${m.animal}</h3><div>${BIOMAS[i].nome} • ${m.ameaca}</div><ul>${m.ficha.map(f => `<li>${f}</li>`).join('')}</ul>`
        : `<h3>??? </h3><div>${BIOMAS[i].nome}</div><div style="color:#999">${m.emBreve ? 'Missão em breve' : 'Ainda não resgatado'}</div>`;
      c.appendChild(d);
    }
    this.abrirPainel('dexPanel');
  }
};

// Imagem do companheiro para o painel de escolha.
function retratoCompanheiro(id) {
  const c = document.createElement('canvas'); c.width = 84; c.height = 64;
  desenharCompanheiro(c.getContext('2d'), id, 42, 60, 0, false, 0);
  return c.toDataURL();
}

// Botões fixos
$('mapBtn').onclick = () => { Som.iniciar(); Jogo.abrirMapa(); };
$('somBtn').onclick = () => { Som.iniciar(); Som.mudo = !Som.mudo; $('somBtn').textContent = Som.mudo ? '🔇' : '🔊'; };
document.querySelectorAll('[data-fecha]').forEach(b => b.onclick = () => Jogo.fecharPainel());
$('apagarBtn').onclick = () => {
  if (!confirm('Apagar todo o progresso e começar de novo?')) return;
  try { localStorage.removeItem(CHAVE_SAVE); } catch (e) { /* ok */ }
  Estado = ESTADO_INICIAL();
  Jogo.fecharPainel();
  Mundo.entrar(0, 0, 5, 5);
  Jogo.aviso('Progresso apagado. Fale com o Professor!', 3000);
};

// Começa quando as imagens (e a fonte) estiverem prontas.
Promise.all([
  carregarImagens({
    arvores: 'assets/arvores.png', terreno: 'assets/terreno.png', professor: 'assets/professor.png',
    parado: 'assets/jogador_parado.png',
    andando0: 'assets/jogador_andando_0.png', andando1: 'assets/jogador_andando_1.png',
    andando2: 'assets/jogador_andando_2.png', andando3: 'assets/jogador_andando_3.png'
  }),
  Promise.race([document.fonts.load('24px VT323'), new Promise(r => setTimeout(r, 1500))]).catch(() => {})
]).then(() => Jogo.iniciar());
