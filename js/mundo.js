const T = 48, COLS = 16, ROWS = 9, W = 768, H = 432;
const CENTRO_X = 8, CENTRO_Y = 4;          // trilhas: linha 4 e coluna 8 ficam sempre livres
const PASSO = 0.16;                         // segundos para andar um bloco
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const IMG = {};
function carregarImagens(lista) {
  return Promise.all(Object.entries(lista).map(([nome, src]) => new Promise(ok => {
    const img = new Image();
    img.onload = () => { IMG[nome] = img; ok(); };
    img.onerror = () => { console.warn('Falha ao carregar', src); ok(); };
    img.src = src;
  })));
}

const PALETAS_SOLO = {
  1: { base: '#c99b3d', mid: '#d9ad4b', dark: '#9a6c2c', light: '#e7c45e' },
  2: { base: '#2f5a2a', mid: '#3b6e30', dark: '#234522', light: '#4f8a3a' },
  3: { base: '#2e6a32', mid: '#3a7c3a', dark: '#1f4f26', light: '#5a9a48' },
  4: { base: '#7fa046', mid: '#90b04e', dark: '#678a3a', light: '#a8c45e' },
  5: { base: '#c08a50', mid: '#cf9a5e', dark: '#9a6a3a', light: '#ddb070' },
  6: { base: '#5f9a3e', mid: '#6fab47', dark: '#4c8233', light: '#8cc25a' }
};

// Cores da água por tipo de ambiente.
const AGUA = {
  pantanal: { base: '#3d7fa6', claro: '#4b90b8', escuro: '#346f94', margem: '#c9ad72', plantas: 'pantanal' },
  igarape:  { base: '#2c4a40', claro: '#3e6356', escuro: '#20372f', margem: '#6e5232', plantas: 'amazonia' },
  limpa:    { base: '#3a8aa8', claro: '#58a8c0', escuro: '#2a7090', margem: '#5a4a32', plantas: 'mata' },
  poluida:  { base: '#34343a', claro: '#5a4a6a', escuro: '#222226', margem: '#4a3a2a', plantas: null },
  sanga:    { base: '#4a86a8', claro: '#5a98b8', escuro: '#3a7698', margem: '#7a6a3a', plantas: 'sanga' },
  acude:    { base: '#5a7a5a', claro: '#6e8e6a', escuro: '#4a6a4a', margem: '#b89a6a', plantas: null },
  recuperando: { base: '#5e6a3a', claro: '#6e7a46', escuro: '#4a5530', margem: '#4f3a22', plantas: null },
  garimpo:  { base: '#c9a23a', claro: '#dcb956', escuro: '#a07c26', margem: '#4f3a22', plantas: null }
};

// Curiosidades da paisagem por bioma.
const FALAS_PAISAGEM = () => ({ 1: FALAS_CERRADO, 2: FALAS_AMAZONIA, 3: FALAS_MATA, 4: FALAS_PAMPA, 5: FALAS_CAATINGA, 6: FALAS_PANTANAL });

const Mundo = {
  bioma: 0, area: 0,
  jogador: { x: 5, y: 5, px: 5 * T, py: 5 * T, dir: 'down', anda: false, de: null, t: 0 },
  // O companheiro segue o jogador ocupando sempre o bloco onde ele estava.
  comp: { x: 5, y: 5, px: 5 * T, py: 5 * T, de: null, esq: false, anda: false },
  obstaculos: [],
  solidos: new Set(),
  fundo: null,
  visitadas: {},
  rota: [], aoChegar: null,   // caminho do "tocar para andar"
  marca: null,                // círculo onde o dedo tocou

  entrar(bioma, area, x, y) {
    this.bioma = bioma; this.area = area;
    Object.assign(this.jogador, { x, y, px: x * T, py: y * T, anda: false });
    this.visitadas[bioma + ':' + area] = true;
    this.cancelarRota();
    this.gerar();
    this.posicionarCompanheiro();
  },

  // Coloca o companheiro atrás do jogador (ou no mesmo bloco, se atrás não couber).
  posicionarCompanheiro() {
    const j = this.jogador, c = this.comp, [dx, dy] = DIRS[j.dir];
    const bx = j.x - dx, by = j.y - dy;
    const livre = bx >= 0 && bx < COLS && by >= 0 && by < ROWS && !this.solidos.has(bx + ',' + by);
    Object.assign(c, livre ? { x: bx, y: by } : { x: j.x, y: j.y }, { anda: false });
    c.px = c.x * T; c.py = c.y * T;
    if (dx) c.esq = dx < 0;
  },

  celulas(b = this.bioma) { return b === 0 ? [] : LAYOUTS[b]; },

  vizinhos(i = this.area) {
    const c = this.celulas(), p = c[i], r = {};
    if (!p) return r;
    c.forEach((q, j) => {
      if (q[0] === p[0] + 1 && q[1] === p[1]) r.right = j;
      if (q[0] === p[0] - 1 && q[1] === p[1]) r.left = j;
      if (q[0] === p[0] && q[1] === p[1] + 1) r.down = j;
      if (q[0] === p[0] && q[1] === p[1] - 1) r.up = j;
    });
    return r;
  },

  // Entidades visíveis na área atual, de acordo com o progresso salvo.
  entidades() {
    if (this.bioma === 0) return LAB_ENTIDADES;
    const m = MISSOES[this.bioma];
    return this.todasEntidades().filter(e => entidadeVisivel(m, e));
  },
  // Inclui as que já sumiram: a vegetação não muda quando uma entidade some.
  todasEntidades() {
    const m = MISSOES[this.bioma];
    if (!m || !m.entidades) return [];
    return m.entidades.filter(e => e.area === this.area);
  },

  rnd(x, y, s = 0) {
    const n = Math.sin(x * 91.7 + y * 57.3 + (this.bioma * 997 + this.area * 113 + s) * 13.1) * 43758.5453;
    return n - Math.floor(n);
  },

  gerar() {
    const ents = this.entidades();
    this.obstaculos = [];
    this.solidos = new Set();
    this.agua = new Set(); this.pontes = new Set(); this.areia = new Set(); this.queda = new Set(); this.rochas = new Set();
    const missao = MISSOES[this.bioma];
    this.baiaSeca = !!(missao && missao.baiaSeca && this.area === missao.areaEncontro && !Estado.poupados.includes(missao.id));
    const naAreaDoChefe = !!(missao && missao.desmatada && this.area === missao.areaEncontro);
    this.desmatada = naAreaDoChefe && !Estado.poupados.includes(missao.id);
    this.replantada = naAreaDoChefe && !this.desmatada;
    this.invadida = !!(missao && missao.invadida && this.area === missao.areaEncontro && !Estado.poupados.includes(missao.id));
    this.estiloAgua = this.bioma === 2 ? (this.desmatada ? AGUA.garimpo : this.replantada ? AGUA.recuperando : AGUA.igarape)
                    : this.bioma === 3 ? (this.desmatada ? AGUA.poluida : this.replantada ? AGUA.recuperando : AGUA.limpa)
                    : this.bioma === 5 ? AGUA.acude : this.bioma === 4 ? AGUA.sanga : AGUA.pantanal;
    if (this.bioma === 0) {
      for (let x = 0; x < COLS; x++) this.solidos.add(x + ',0');
    } else {
      const cfg = VEGETACAO[this.bioma];
      // Bloqueios: trilhas, área em volta das entidades e um caminho de cada entidade até a trilha.
      const reservado = new Set();
      for (const e of this.todasEntidades()) {
        const raio = e.tipo === 'encontro' ? 2 : 1, rx = raio + (e.largura ? 1 : 0);
        for (let dy = -raio; dy <= raio; dy++) for (let dx = -rx; dx <= rx; dx++) reservado.add((e.x + dx) + ',' + (e.y + dy));
        const passo = e.y < CENTRO_Y ? 1 : -1;
        for (let y = e.y; y !== CENTRO_Y; y += passo) reservado.add(e.x + ',' + y);
      }
      if (cfg.pantanal) this.gerarAgua(reservado);
      if (cfg.amazonia) this.gerarAmazonia(reservado);
      else if (cfg.caatinga) this.gerarCaatinga(reservado);
      else if (cfg.pampa) this.gerarPampa(reservado);
      else if (cfg.mata) this.gerarMata(reservado);
      else for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
        if (y === CENTRO_Y || x === CENTRO_X || reservado.has(x + ',' + y) || this.agua.has(x + ',' + y)) continue;
        const r = this.rnd(x, y);
        if (cfg.pantanal && r < cfg.densidade) {
          // Carandás (palmeiras) e piúvas (ipê-rosa) ou árvores verdes.
          const q = this.rnd(x, y, 7);
          if (q < 0.5) this.obstaculos.push({ tipo: 'palmeira', x, y, fala: 'palmeira' });
          else this.obstaculos.push({ tipo: 'arvore', x, y, variante: q < 0.78 ? 0 : 1, col: cfg.arvore, fala: q < 0.78 ? 'piuva' : null });
        }
        else if (r < cfg.densidade) this.obstaculos.push({ tipo: 'arvore', x, y, variante: this.rnd(x, y, 7) < 0.5 ? 0 : 1, col: cfg.arvore });
        else if (r < cfg.densidade * 1.5 && cfg.moitas.length) this.obstaculos.push({ tipo: 'moita', x, y, quadro: cfg.moitas[Math.floor(this.rnd(x, y, 11) * cfg.moitas.length)] });
      }
    }
    if (VEGETACAO[this.bioma] && VEGETACAO[this.bioma].pantanal && !this.baiaSeca) this.gerarFauna();
    if (this.bioma === 1) this.gerarFaunaCerrado();
    for (const o of this.obstaculos) this.solidos.add(o.x + ',' + o.y);
    for (const k of this.agua) if (!this.pontes.has(k)) this.solidos.add(k);
    for (const k of this.rochas) this.solidos.add(k);
    for (const e of ents) for (let dx = -(e.largura ? 1 : 0); dx <= (e.largura ? 1 : 0); dx++) this.solidos.add((e.x + dx) + ',' + e.y);
    this.fundo = this.desenharFundo(ents);
  },

  // ---------- Mata Atlântica ----------
  gerarMata(reservado) {
    const livre = (x, y) => x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1 && x !== CENTRO_X && y !== CENTRO_Y && !reservado.has(x + ',' + y);
    const ocupado = new Set();
    const por = o => { this.obstaculos.push(o); ocupado.add(o.x + ',' + o.y); };
    const chefe = this.naAreaDoChefe();
    // Rio (sempre na área da cachoeira e na do chefe)
    if (this.area === 2 || chefe || this.rnd(3, 3, 800) < 0.6) {
      const horiz = this.area === 2 ? false : chefe ? true : this.rnd(4, 4, 801) < 0.5;
      const base = horiz ? 6.4 : (this.rnd(6, 6, 803) < 0.5 ? 3 : 12.5);
      const fase = this.rnd(7, 7, 804) * 6, amp = horiz ? 0.8 : 1.2;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const k = x + ',' + y;
        if (reservado.has(k)) continue;
        if (Math.abs((horiz ? y : x) - (base + Math.sin((horiz ? x : y) * 0.6 + fase) * amp)) < 0.75) {
          this.agua.add(k);
          if (x === CENTRO_X || y === CENTRO_Y) this.pontes.add(k);
        }
      }
      // Cachoeira descendo do paredão de pedra, no alto da área
      if (!horiz && (this.area === 2 || this.rnd(5, 5, 805) < 0.5)) {
        for (let y = 0; y < 2; y++) for (let x = 0; x < COLS; x++) {
          const k = x + ',' + y;
          if (this.agua.has(k) && !this.pontes.has(k)) this.queda.add(k);
          else if (!this.agua.has(k) && x !== CENTRO_X && !reservado.has(k) &&
            [-2, -1, 1, 2].some(d => this.agua.has((x + d) + ',' + y))) this.rochas.add(k);
        }
      }
    }
    // Vegetação: floresta densa
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (!livre(x, y) || this.agua.has(k) || this.rochas.has(k)) continue;
      const r = this.rnd(x, y);
      if (this.desmatada) { if (r < 0.2) por({ tipo: 'sprite', sprite: 'toco', x, y, fala: 'toco' }); continue; }
      if (this.replantada) { if (r < 0.26) por({ tipo: 'sprite', sprite: 'muda', x, y, fala: 'muda' }); continue; }
      if (r >= VEGETACAO[3].densidade) continue;
      const q = this.rnd(x, y, 7);
      if (q < 0.15) por({ tipo: 'sprite', sprite: 'araucaria', x, y, fala: 'araucaria' });
      else if (q < 0.33) por({ tipo: 'sprite', sprite: 'jucaraPalm', x, y, fala: 'jucara' });
      else if (q < 0.44) por({ tipo: 'sprite', sprite: 'paubrasil', x, y, fala: 'paubrasil' });
      else if (q < 0.55) por({ tipo: 'sprite', sprite: 'quaresmeira', x, y, fala: 'quaresmeira' });
      else if (q < 0.66) por({ tipo: 'sprite', sprite: 'samambaiacu', x, y, fala: 'samambaiacu' });
      else if (q < 0.76) por({ tipo: 'sprite', sprite: 'embauba', x, y, fala: 'embauba' });
      else por({ tipo: 'arvore', x, y, variante: q < 0.88 ? 0 : 1, col: 4 });
    }
    // Fauna (nenhuma na área devastada)
    if (this.desmatada) return;
    const ents = this.entidades();
    const livres = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      if (!livre(x, y) || ocupado.has(x + ',' + y) || this.agua.has(x + ',' + y) || this.rochas.has(x + ',' + y)) continue;
      if (ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1)) continue;
      livres.push({ x, y });
    }
    livres.sort((a, b) => this.rnd(a.x, a.y, 810) - this.rnd(b.x, b.y, 810));
    const especies = ['muriqui', 'preguica', 'jacutinga', 'tucano', 'saira', 'sapinho'];
    const quantos = 2 + (this.rnd(1, 4, 811) < 0.4 ? 1 : 0);
    for (let i = 0; i < quantos && livres[i]; i++) {
      const p = livres[i];
      const bicho = this.rnd(i, 5, 812) < 0.06 ? 'onca' : especies[Math.floor(this.rnd(i, 6, 813) * especies.length)];
      por({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: this.rnd(p.x, p.y, 814) < 0.5, fala: bicho });
    }
  },

  // Chão da floresta: bromélias, samambaias, musgo e florzinhas.
  chaoMata(g) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const k = x + ',' + y, px = x * T, py = y * T, r = this.rnd(x, y, 95);
      if (this.agua.has(k)) continue;
      if (this.rochas.has(k)) {
        g.fillStyle = '#7a7a72'; g.fillRect(px, py, T, T);
        g.fillStyle = '#5e5e58'; for (let i = 0; i < 4; i++) g.fillRect(px + (i % 2) * 24 + 2, py + Math.floor(i / 2) * 24 + 2, 20, 20);
        g.fillStyle = '#4a8a3a'; g.fillRect(px + 4, py + 2, 10, 4); g.fillRect(px + 28, py + 26, 12, 4);
        continue;
      }
      if (this.desmatada || this.replantada) {
        g.fillStyle = 'rgba(140,100,60,.55)'; g.fillRect(px, py, T, T);
        continue;
      }
      const ox = px + 6 + Math.floor(this.rnd(x, y, 96) * 28), oy = py + 8 + Math.floor(this.rnd(x, y, 97) * 26);
      if (r < 0.14) {
        // Bromélia
        g.fillStyle = '#3f8a3a';
        for (let i = -2; i <= 2; i++) g.fillRect(ox + i * 3, oy + Math.abs(i) * 2, 3, 10 - Math.abs(i) * 2);
        g.fillStyle = '#e0302a'; g.fillRect(ox - 1, oy - 2, 5, 5);
      } else if (r < 0.3) {
        g.fillStyle = '#4fa040';
        for (let i = -2; i <= 2; i++) g.fillRect(ox + i * 3, oy - Math.abs(i) * 2, 2, 9 - Math.abs(i));
      } else if (r < 0.42) {
        g.fillStyle = '#6a9a3a'; g.fillRect(ox, oy, 12, 4); g.fillRect(ox + 4, oy - 2, 6, 2);
      } else if (r < 0.5) {
        g.fillStyle = this.rnd(x, y, 98) < 0.5 ? '#f0a0c0' : '#f4f4f0';
        g.fillRect(ox, oy, 3, 3); g.fillRect(ox + 8, oy + 5, 3, 3);
      } else if (r < 0.58) {
        const cores = ['#8a5a2a', '#b0702a', '#6b4a22'];
        for (let i = 0; i < 3; i++) { g.fillStyle = cores[i]; g.fillRect(ox + i * 5, oy + (i % 2) * 4, 5, 3); }
      }
    }
  },

  // Pedrinhas com musgo dentro do rio limpo.
  plantaMata(g, px, py, r) {
    if (r > 0.3) return;
    g.fillStyle = '#7a7a72'; g.fillRect(px + 14, py + 20, 10, 7); g.fillRect(px + 28, py + 12, 7, 6);
    g.fillStyle = '#4a8a3a'; g.fillRect(px + 14, py + 20, 10, 2);
  },

  // Água caindo da cachoeira e fumaça sobre a área devastada (desenhadas a cada quadro).
  efeitosMata(ctx, t) {
    for (const k of this.queda) {
      const [x, y] = k.split(',').map(Number), px = x * T, py = y * T;
      ctx.fillStyle = '#9fd4e8'; ctx.fillRect(px + 4, py, T - 8, T);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 4; i++) {
        const yy = ((t * 120 + i * 13 + x * 7) % T);
        ctx.fillRect(px + 8 + i * 9, py + yy, 3, 10);
      }
    }
    if (this.queda.size) {
      // Espuma no pé da cachoeira
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      for (const k of this.queda) {
        const [x, y] = k.split(',').map(Number);
        if (y === 1) for (let i = 0; i < 4; i++) ctx.fillRect(x * T + 4 + i * 11, 2 * T + 2 + Math.sin(t * 6 + i) * 2, 8, 3);
      }
    }
    if (this.desmatada) {
      for (let i = 0; i < 7; i++) {
        const x = ((t * 18 + i * 140) % (W + 200)) - 100, y = 40 + (i * 57) % 320;
        ctx.fillStyle = 'rgba(70,70,75,.22)';
        ctx.beginPath(); ctx.arc(x, y, 60 + (i % 3) * 20, 0, Math.PI * 2); ctx.fill();
      }
    }
  },

  // ---------- Pampa ----------
  gerarPampa(reservado) {
    const livre = (x, y) => x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1 && x !== CENTRO_X && y !== CENTRO_Y && !reservado.has(x + ',' + y);
    const ocupado = new Set();
    const por = o => { this.obstaculos.push(o); ocupado.add(o.x + ',' + o.y); };
    // Sanga (riacho estreito)
    if (this.rnd(3, 3, 700) < 0.55) {
      const horiz = this.rnd(4, 4, 701) < 0.5;
      const base = horiz ? (this.rnd(5, 5, 702) < 0.5 ? 1.7 : 6.3) : (this.rnd(6, 6, 703) < 0.5 ? 3 : 12.5);
      const fase = this.rnd(7, 7, 704) * 6, amp = horiz ? 0.8 : 1.3;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const k = x + ',' + y;
        if (reservado.has(k)) continue;
        if (Math.abs((horiz ? y : x) - (base + Math.sin((horiz ? x : y) * 0.6 + fase) * amp)) < 0.6) {
          this.agua.add(k);
          if (x === CENTRO_X || y === CENTRO_Y) this.pontes.add(k);
        }
      }
    }
    // Aramado ou taipa de pedra (com uma porteira aberta na trilha)
    if (this.rnd(1, 9, 705) < 0.6 && !this.invadida) {
      const y = this.rnd(2, 9, 706) < 0.5 ? 2 : 6, x0 = 1 + Math.floor(this.rnd(3, 9, 707) * 6), comp = 4 + Math.floor(this.rnd(4, 9, 708) * 5);
      const tipo = this.rnd(5, 9, 709) < 0.65 ? 'cerca' : 'taipa';
      for (let x = x0; x < Math.min(COLS - 1, x0 + comp); x++)
        if (livre(x, y) && !this.agua.has(x + ',' + y)) por({ tipo: 'sprite', sprite: tipo, x, y, fala: tipo });
    }
    // Vegetação: campo aberto, com árvores esparsas
    let umbus = 0;
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (!livre(x, y) || this.agua.has(k) || ocupado.has(k)) continue;
      const r = this.rnd(x, y);
      if (this.invadida) { if (r < 0.16) por({ tipo: 'sprite', sprite: 'touceira', x, y, fala: 'annoni' }); continue; }
      const beiraAgua = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.agua.has((x + dx) + ',' + (y + dy)));
      if (beiraAgua && r < 0.12) { por({ tipo: 'sprite', sprite: 'corticeira', x, y, fala: 'corticeira' }); continue; }
      if (r >= VEGETACAO[4].densidade) continue;
      const q = this.rnd(x, y, 7);
      if (q < 0.22 && umbus++ < 1) por({ tipo: 'sprite', sprite: 'umbuPampa', x, y, fala: 'umbu' });
      else if (q < 0.5) por({ tipo: 'sprite', sprite: 'capao', x, y, fala: 'capao' });
      else por({ tipo: 'sprite', sprite: 'butiazeiro', x, y, fala: 'butiazeiro' });
    }
    // Fauna e criação
    const ents = this.entidades();
    const livres = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      if (!livre(x, y) || ocupado.has(x + ',' + y) || this.agua.has(x + ',' + y)) continue;
      if (ents.some(e => Math.abs(e.x - x) <= 1 + (e.largura ? 1 : 0) && Math.abs(e.y - y) <= 1)) continue;
      livres.push({ x, y });
    }
    livres.sort((a, b) => this.rnd(a.x, a.y, 710) - this.rnd(b.x, b.y, 710));
    const add = (bicho, i) => { const p = livres[i]; if (p) por({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: this.rnd(p.x, p.y, 711) < 0.5, fala: bicho }); };
    if (this.invadida) { add('queroquero', 0); return; }
    const criacao = ['vaca', 'ovelha', 'cavalo'], silvestres = ['ema', 'queroquero', 'joao', 'graxaim', 'gatopalheiro', 'cardeal'];
    add(criacao[Math.floor(this.rnd(1, 3, 712) * 3)], 0);
    if (this.rnd(2, 3, 713) < 0.5) add(criacao[Math.floor(this.rnd(3, 3, 714) * 3)], 1);
    add(silvestres[Math.floor(this.rnd(4, 3, 715) * silvestres.length)], 2);
    if (this.rnd(5, 3, 716) < 0.5) add(silvestres[Math.floor(this.rnd(6, 3, 717) * silvestres.length)], 3);
  },

  // Coxilhas (ondulações suaves de luz) e flores do campo nativo.
  chaoPampa(g) {
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? 'rgba(255,255,210,.07)' : 'rgba(30,60,10,.07)';
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) g.lineTo(x, i * 80 + Math.sin(x / 140 + i * 1.7 + this.area) * 26);
      g.lineTo(W, H); g.closePath(); g.fill();
    }
    const flores = ['#f4f4f0', '#f2d23a', '#a070d0', '#f0a0c0'];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (this.agua.has(x + ',' + y)) continue;
      const px = x * T, py = y * T, r = this.rnd(x, y, 95);
      const ox = px + 6 + Math.floor(this.rnd(x, y, 96) * 28), oy = py + 8 + Math.floor(this.rnd(x, y, 97) * 26);
      if (this.invadida) {
        // Campo tomado pelo annoni: touceiras acinzentadas
        g.fillStyle = 'rgba(110,120,90,.45)'; g.fillRect(px, py, T, T);
        if (r < 0.6) { g.fillStyle = '#6a7a5a'; for (let i = 0; i < 5; i++) g.fillRect(ox + i * 3, oy - (i % 2) * 4, 2, 9 + (i % 2) * 4); g.fillStyle = '#d8d0b0'; g.fillRect(ox + 3, oy - 6, 2, 3); }
        continue;
      }
      if (r < 0.28) {
        g.fillStyle = flores[Math.floor(this.rnd(x, y, 98) * flores.length)];
        g.fillRect(ox, oy, 3, 3); g.fillRect(ox + 10, oy + 6, 3, 3); g.fillRect(ox + 4, oy + 12, 3, 3);
      } else if (r < 0.5) {
        g.fillStyle = '#5f8a34';
        g.fillRect(ox, oy, 2, 7); g.fillRect(ox + 3, oy - 2, 2, 9); g.fillRect(ox + 6, oy + 1, 2, 6);
      }
    }
  },

  // Taboas na beira da sanga.
  plantaSanga(g, px, py, r) {
    if (r > 0.45) return;
    for (let i = 0; i < 3; i++) {
      const x = px + 8 + i * 12 + Math.floor(r * 10);
      g.fillStyle = '#4f8a3a'; g.fillRect(x, py + 10, 2, 22);
      g.fillStyle = '#6b4a2a'; g.fillRect(x - 1, py + 8, 4, 8);
    }
  },

  desenharFogoDeChao(ctx, px, py, t) {
    const cx = px + T / 2, cy = py + T - 10;
    ctx.fillStyle = '#7a7a72';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.fillRect(cx + Math.cos(a) * 16 - 3, cy + Math.sin(a) * 6 - 3, 7, 5); }
    const ch = SPR.chama[Math.floor(t * 6) % 2];
    ctx.drawImage(ch, cx - ch.width / 4, cy - ch.height / 2 - 2, ch.width / 2, ch.height / 2);
    ctx.drawImage(SPR.chaleira, cx + 10, cy - 18);
    ctx.drawImage(SPR.cuia, cx - 30, cy - 14);
  },

  desenharCatavento(ctx, px, py, t) {
    const cx = px + T / 2, base = py + T - 2, topo = py - 70;
    ctx.strokeStyle = '#8a8e92'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 14, base); ctx.lineTo(cx - 3, topo); ctx.moveTo(cx + 14, base); ctx.lineTo(cx + 3, topo); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) { const y = base - (base - topo) * i / 5, w = 14 - 11 * i / 5; ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
    ctx.fillStyle = '#c8ccd0';
    for (let i = 0; i < 8; i++) {
      const a = t * 3 + i * Math.PI / 4;
      ctx.save(); ctx.translate(cx, topo); ctx.rotate(a); ctx.fillRect(4, -3, 20, 6); ctx.restore();
    }
    ctx.fillStyle = '#c0392b'; ctx.fillRect(cx + 4, topo - 4, 22, 8);
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(cx, topo, 4, 0, Math.PI * 2); ctx.fill();
  },

  // ---------- Cerrado ----------
  // Fauna com curiosidades. Na área central sempre há um lobo-guará na beira da estrada:
  // é ele quem leva ao minijogo "Travessia do Lobo".
  gerarFaunaCerrado() {
    const m = MISSOES[1];
    if (this.area === m.areaEncontro && !Estado.poupados.includes(m.id)) return;   // área do incêndio
    const ents = this.todasEntidades();
    const ocupado = new Set(this.obstaculos.map(o => o.x + ',' + o.y));
    const livre = (x, y) => {
      if (x < 1 || y < 1 || x > COLS - 2 || y > ROWS - 2 || x === CENTRO_X || y === CENTRO_Y || ocupado.has(x + ',' + y)) return false;
      // Longe das entidades e fora do caminho delas até a trilha
      return !ents.some(e => (Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1) ||
        (e.x === x && (y - e.y) * (CENTRO_Y - e.y) >= 0 && Math.abs(y - e.y) <= Math.abs(CENTRO_Y - e.y)));
    };
    const livres = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (livre(x, y)) livres.push({ x, y });
    livres.sort((a, b) => this.rnd(a.x, a.y, 900) - this.rnd(b.x, b.y, 900));
    const add = (bicho, p) => { if (p) { this.obstaculos.push({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: this.rnd(p.x, p.y, 901) < 0.5, fala: bicho }); ocupado.add(p.x + ',' + p.y); } };
    if (this.area === 1) add('lobo', livres.find(p => p.y >= 5) || livres[0]);
    const especies = ['seriema', 'tamandua', 'arara', 'tatu'];
    const quantos = 1 + (this.rnd(2, 2, 902) < 0.5 ? 1 : 0);
    for (let i = 0; i < quantos; i++) add(especies[Math.floor(this.rnd(i, 3, 903) * especies.length)], livres.find(p => !ocupado.has(p.x + ',' + p.y)));
  },

  // ---------- Caatinga ----------
  gerarCaatinga(reservado) {
    const livre = (x, y) => x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1 && x !== CENTRO_X && y !== CENTRO_Y && !reservado.has(x + ',' + y);
    const ocupado = new Set();
    const por = (o) => { this.obstaculos.push(o); ocupado.add(o.x + ',' + o.y); };
    // Rio seco (intermitente): areia por onde dá para andar
    if (this.rnd(3, 3, 400) < 0.6) {
      const horiz = this.rnd(4, 4, 401) < 0.5;
      const base = horiz ? (this.rnd(5, 5, 402) < 0.5 ? 1.8 : 6.2) : (this.rnd(6, 6, 403) < 0.5 ? 3.5 : 12);
      const fase = this.rnd(7, 7, 404) * 6, amp = horiz ? 0.8 : 1.4;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const centro = base + Math.sin((horiz ? x : y) * 0.6 + fase) * amp;
        if (Math.abs((horiz ? y : x) - centro) < 0.8) this.areia.add(x + ',' + y);
      }
    }
    // Açude em algumas áreas
    if (this.rnd(4, 4, 405) < 0.35) {
      const cx = 3 + this.rnd(1, 1, 406) * 10, cy = 1.5 + this.rnd(2, 2, 407) * 5;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const k = x + ',' + y;
        if (reservado.has(k) || ((x - cx) / 1.9) ** 2 + ((y - cy) / 1.2) ** 2 >= 1) continue;
        this.agua.add(k); this.areia.delete(k);
        if (x === CENTRO_X || y === CENTRO_Y) this.pontes.add(k);
      }
    }
    // Lajedos (grupos de pedras)
    const nPedras = 1 + (this.rnd(5, 1, 408) < 0.5 ? 1 : 0);
    for (let i = 0; i < nPedras; i++) {
      const cx = 1 + Math.floor(this.rnd(i, 3, 409) * 13), cy = 1 + Math.floor(this.rnd(i, 4, 410) * 6);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const x = cx + dx, y = cy + dy;
        if (livre(x, y) && !this.agua.has(x + ',' + y) && this.rnd(x, y, 411) < 0.8) por({ tipo: 'sprite', sprite: 'pedra', x, y, fala: 'pedra' });
      }
    }
    // Vegetação
    const cfg = VEGETACAO[5];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (!livre(x, y) || this.agua.has(k) || ocupado.has(k)) continue;
      const r = this.rnd(x, y);
      if (this.areia.has(k)) { if (r < 0.05) por({ tipo: 'sprite', sprite: 'coroa', x, y, fala: 'coroa' }); continue; }
      const beiraRio = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.areia.has((x + dx) + ',' + (y + dy)));
      if (beiraRio && r < 0.16) { por({ tipo: 'sprite', sprite: 'caraibeira', x, y, fala: 'caraibeira' }); continue; }
      if (r >= cfg.densidade) continue;
      const q = this.rnd(x, y, 7);
      if (q < 0.25) por({ tipo: 'arvore', x, y, variante: 0, col: 2, fala: 'mandacaru' });
      else if (q < 0.42) por({ tipo: 'sprite', sprite: 'xiquexique', x, y, fala: 'xiquexique' });
      else if (q < 0.54) por({ tipo: 'sprite', sprite: 'coroa', x, y, fala: 'coroa' });
      else if (q < 0.66) por({ tipo: 'sprite', sprite: 'umbuzeiro', x, y, fala: 'umbuzeiro' });
      else if (q < 0.76) por({ tipo: 'sprite', sprite: 'juazeiro', x, y, fala: 'juazeiro' });
      else por({ tipo: 'arvore', x, y, variante: 1, col: 2, fala: 'catingueira' });
    }
    this.gerarFaunaCaatinga(ocupado);
  },

  gerarFaunaCaatinga(ocupado) {
    const ents = this.entidades();
    const m = MISSOES[5];
    const chefe = this.naAreaDoChefe() || (m && this.area === m.areaEncontro);
    const poupado = m && Estado.poupados.includes(m.id);
    const livres = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (x === CENTRO_X || y === CENTRO_Y || ocupado.has(k) || this.agua.has(k)) continue;
      if (ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1)) continue;
      livres.push({ x, y });
    }
    livres.sort((a, b) => this.rnd(a.x, a.y, 500) - this.rnd(b.x, b.y, 500));
    const add = (bicho, p) => { if (!p) return; this.obstaculos.push({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: this.rnd(p.x, p.y, 501) < 0.5, fala: bicho }); ocupado.add(p.x + ',' + p.y); };
    const proximo = () => livres.find(p => !ocupado.has(p.x + ',' + p.y));
    if (chefe) {
      // Na área do Zé Arapuca: só um calango antes; passarinhos livres depois.
      if (poupado) { add('galo', proximo()); add('canario', proximo()); add('asabranca', proximo()); }
      else add('calango', proximo());
      return;
    }
    // Mocó perto das pedras
    const pedras = this.obstaculos.filter(o => o.sprite === 'pedra');
    const pertoPedra = livres.find(p => !ocupado.has(p.x + ',' + p.y) && pedras.some(o => Math.abs(o.x - p.x) + Math.abs(o.y - p.y) === 1));
    if (pertoPedra && this.rnd(1, 1, 502) < 0.6) add('moco', pertoPedra);
    const especies = ['tatubola', 'lear', 'soldadinho', 'asabranca', 'calango'];
    const quantos = 1 + (this.rnd(2, 2, 503) < 0.5 ? 1 : 0);
    for (let i = 0; i < quantos; i++) add(especies[Math.floor(this.rnd(i, 7, 504) * especies.length)], proximo());
  },

  // Chão do sertão: rio seco de areia, pedrinhas, gravetos e capim seco.
  chaoCaatinga(g) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const k = x + ',' + y, px = x * T, py = y * T, r = this.rnd(x, y, 95);
      if (this.agua.has(k)) continue;
      if (this.areia.has(k)) {
        g.fillStyle = '#e6cc94'; g.fillRect(px, py, T, T);
        g.fillStyle = '#d4b67a';
        for (let i = 0; i < 3; i++) g.fillRect(px + Math.floor(this.rnd(x, y, 600 + i) * 38), py + Math.floor(this.rnd(x, y, 610 + i) * 40), 8, 2);
        g.fillStyle = '#a89070';
        for (let i = 0; i < 3; i++) g.fillRect(px + Math.floor(this.rnd(x, y, 620 + i) * 42), py + Math.floor(this.rnd(x, y, 630 + i) * 42), 3, 3);
        // Margem do rio seco
        g.fillStyle = '#b08458';
        if (!this.areia.has(x + ',' + (y - 1)) && y > 0) g.fillRect(px, py, T, 3);
        if (!this.areia.has(x + ',' + (y + 1)) && y < ROWS - 1) g.fillRect(px, py + T - 3, T, 3);
        if (!this.areia.has((x - 1) + ',' + y) && x > 0) g.fillRect(px, py, 3, T);
        if (!this.areia.has((x + 1) + ',' + y) && x < COLS - 1) g.fillRect(px + T - 3, py, 3, T);
        continue;
      }
      const ox = px + 6 + Math.floor(this.rnd(x, y, 96) * 28), oy = py + 8 + Math.floor(this.rnd(x, y, 97) * 26);
      if (r < 0.22) {
        // Capim seco
        g.fillStyle = '#d8c070';
        g.fillRect(ox, oy, 2, 8); g.fillRect(ox + 3, oy - 3, 2, 11); g.fillRect(ox + 6, oy + 1, 2, 7);
      } else if (r < 0.36) {
        // Gravetos secos esbranquiçados ("mata branca")
        g.fillStyle = '#e8dcc8';
        g.fillRect(ox, oy + 6, 14, 2); g.fillRect(ox + 4, oy + 1, 2, 6); g.fillRect(ox + 9, oy + 2, 2, 5);
      } else if (r < 0.46) {
        g.fillStyle = '#8a7a6a'; g.fillRect(ox, oy, 4, 3); g.fillRect(ox + 8, oy + 5, 3, 3);
      } else if (r < 0.52) {
        // Chão rachado
        g.strokeStyle = '#9a6a3a'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(ox - 4, oy); g.lineTo(ox + 4, oy + 5); g.lineTo(ox + 12, oy + 3); g.moveTo(ox + 4, oy + 5); g.lineTo(ox + 5, oy + 13); g.stroke();
      }
    }
  },

  // ---------- Amazônia ----------
  gerarAmazonia(reservado) {
    const agua = (x, y) => {
      const k = x + ',' + y;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS || reservado.has(k)) return;
      this.agua.add(k);
      if (x === CENTRO_X || y === CENTRO_Y) this.pontes.add(k);
    };
    // Igarapé sinuoso (na maioria das áreas)
    if (this.rnd(3, 3, 200) < 0.75 || this.naAreaDoChefe()) {
      const horiz = this.rnd(4, 4, 201) < 0.5;
      const base = horiz ? (this.rnd(5, 5, 202) < 0.5 ? 1.6 : 6.4) : (this.rnd(6, 6, 203) < 0.5 ? 3 : 12.5);
      const fase = this.rnd(7, 7, 204) * 6, amp = horiz ? 0.9 : 1.6;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const centro = base + Math.sin((horiz ? x : y) * 0.7 + fase) * amp;
        if (Math.abs((horiz ? y : x) - centro) < 0.75) agua(x, y);
      }
    }
    // Cava do garimpo na área do chefe
    if (this.naAreaDoChefe())
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
        if (((x - 4) / 2.6) ** 2 + ((y - 6.5) / 1.4) ** 2 < 1) agua(x, y);

    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (y === CENTRO_Y || x === CENTRO_X || reservado.has(k) || this.agua.has(k)) continue;
      const r = this.rnd(x, y);
      if (this.desmatada) { if (r < 0.16) this.obstaculos.push({ tipo: 'sprite', sprite: 'toco', x, y, fala: 'toco' }); continue; }
      if (this.replantada) { if (r < 0.24) this.obstaculos.push({ tipo: 'sprite', sprite: 'muda', x, y, fala: 'muda' }); continue; }
      if (r >= VEGETACAO[2].densidade) continue;
      const q = this.rnd(x, y, 7);
      if (q < 0.1) this.obstaculos.push({ tipo: 'sprite', sprite: 'samauma', x, y, fala: 'samauma' });
      else if (q < 0.3) this.obstaculos.push({ tipo: 'sprite', sprite: 'castanheira', x, y, fala: 'castanheira' });
      else if (q < 0.55) this.obstaculos.push({ tipo: 'sprite', sprite: 'acai', x, y, fala: 'acai' });
      else this.obstaculos.push({ tipo: 'arvore', x, y, variante: q < 0.78 ? 0 : 1, col: 0 });
    }
    if (!this.desmatada) this.gerarFaunaAmazonia();
  },

  naAreaDoChefe() {
    const m = MISSOES[this.bioma];
    return !!(m && m.desmatada && this.area === m.areaEncontro);
  },

  // Espécies ameaçadas: boto no rio, ariranha na margem e uma ou duas na mata.
  gerarFaunaAmazonia() {
    const ocupado = new Set(this.obstaculos.map(o => o.x + ',' + o.y));
    const ents = this.entidades();
    const livre = (x, y) => {
      const k = x + ',' + y;
      return x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1 && x !== CENTRO_X && y !== CENTRO_Y &&
        !ocupado.has(k) && !this.agua.has(k) && !ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1);
    };
    const por = s => (a, b) => this.rnd(a.x, a.y, s) - this.rnd(b.x, b.y, s);
    const add = (bicho, p) => { this.obstaculos.push({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: this.rnd(p.x, p.y, 77) < 0.5, fala: bicho }); ocupado.add(p.x + ',' + p.y); };
    const rio = [...this.agua].filter(k => !this.pontes.has(k)).map(k => { const [x, y] = k.split(',').map(Number); return { x, y }; })
      .filter(p => p.x > 0 && p.x < COLS - 1 && !ents.some(e => Math.abs(e.x - p.x) <= 1 && Math.abs(e.y - p.y) <= 1));
    if (rio.length && !this.naAreaDoChefe() && this.rnd(1, 2, 300) < 0.7) add('boto', rio.sort(por(301))[0]);
    const terra = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (livre(x, y)) terra.push({ x, y });
    const margem = terra.filter(p => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.agua.has((p.x + dx) + ',' + (p.y + dy))));
    if (margem.length && this.rnd(2, 1, 302) < 0.6) add('ariranha', margem.sort(por(303))[0]);
    const daMata = ['harpia', 'ararajuba', 'sauim'];
    const quantos = 1 + (this.rnd(3, 1, 304) < 0.5 ? 1 : 0);
    terra.filter(p => livre(p.x, p.y)).sort(por(305)).slice(0, quantos)
      .forEach((p, i) => add(daMata[Math.floor(this.rnd(p.x, p.y, 306 + i) * 3)], p));
  },

  // Chão da floresta: folhas caídas, samambaias, helicônias e cogumelos.
  chaoAmazonia(g) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (this.agua.has(x + ',' + y)) continue;
      const px = x * T, py = y * T, r = this.rnd(x, y, 95);
      if (this.desmatada || this.replantada) {
        // Solo exposto da área desmatada
        g.fillStyle = 'rgba(150,105,60,.6)'; g.fillRect(px, py, T, T);
        if (r < 0.3) { g.fillStyle = '#6b4a2a'; g.fillRect(px + 8 + r * 60, py + 20, 14, 3); g.fillRect(px + 14 + r * 40, py + 30, 3, 8); }
        continue;
      }
      const ox = px + 6 + Math.floor(this.rnd(x, y, 96) * 28), oy = py + 8 + Math.floor(this.rnd(x, y, 97) * 26);
      if (r < 0.3) {
        const cores = ['#8a5a2a', '#b0702a', '#6b4a22', '#a8862a'];
        for (let i = 0; i < 4; i++) { g.fillStyle = cores[i]; g.fillRect(ox + i * 4 - 4, oy + (i % 2) * 5, 5, 3); }
      } else if (r < 0.42) {
        g.fillStyle = '#4fa040';
        for (let i = -2; i <= 2; i++) { g.fillRect(ox + i * 3, oy - Math.abs(i) * 2, 2, 9 - Math.abs(i)); }
        g.fillStyle = '#2f7030'; g.fillRect(ox, oy + 6, 2, 4);
      } else if (r < 0.49) {
        g.fillStyle = '#2f7030'; g.fillRect(ox + 2, oy, 2, 12);
        g.fillStyle = '#e0302a'; g.fillRect(ox - 2, oy, 5, 3); g.fillRect(ox + 4, oy + 4, 5, 3); g.fillRect(ox - 2, oy + 8, 5, 3);
        g.fillStyle = '#f2c230'; g.fillRect(ox - 2, oy, 2, 2); g.fillRect(ox + 7, oy + 4, 2, 2);
      } else if (r < 0.52) {
        g.fillStyle = '#e8dcc0'; g.fillRect(ox, oy + 4, 2, 4); g.fillStyle = '#c0503a'; g.fillRect(ox - 2, oy + 1, 6, 3);
      }
    }
  },

  // Vitórias-régias (folhas enormes com borda levantada) e folhinhas boiando.
  plantaAmazonica(g, px, py, r) {
    if (r < 0.3) {
      const cx = px + 24, cy = py + 24;
      g.fillStyle = '#4f9a3a'; g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#c0503a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#3a7a2a'; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); g.stroke(); }
      if (r < 0.08) { g.fillStyle = '#fbe4ee'; g.fillRect(cx + 6, cy - 12, 7, 6); g.fillStyle = '#f29bb0'; g.fillRect(cx + 8, cy - 10, 3, 3); }
    } else if (r < 0.42) {
      g.fillStyle = '#5aa04a'; g.fillRect(px + 12, py + 16, 6, 4); g.fillRect(px + 28, py + 30, 5, 4);
    }
  },

  // Raios de sol atravessando a copa das árvores.
  raiosDeLuz(ctx, t) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const x = ((i * 230 + this.area * 97) % W) + Math.sin(t * 0.4 + i) * 12;
      ctx.fillStyle = `rgba(255,240,170,${0.07 + 0.03 * Math.sin(t * 0.8 + i * 2)})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x - 60, H); ctx.lineTo(x - 130, H); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(10,40,15,.35)';
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath(); ctx.arc(x + 16, -4, 26 + (x * 7 % 13), 0, Math.PI); ctx.fill();
    }
    ctx.restore();
  },

  // ---------- Pantanal ----------
  // Baías (lagoas) em forma de elipses; onde a trilha cruza a água vira passarela.
  gerarAgua(reservado) {
    const n = 2 + Math.floor(this.rnd(1, 1, 40) * 2);
    const lagoas = [];
    for (let i = 0; i < n; i++) lagoas.push({
      cx: 1 + this.rnd(i, 2, 41) * 13, cy: 1 + this.rnd(i, 3, 42) * 6,
      rx: 1.6 + this.rnd(i, 4, 43) * 2.2, ry: 1.1 + this.rnd(i, 5, 44) * 1.4
    });
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const k = x + ',' + y;
      if (reservado.has(k)) continue;
      if (!lagoas.some(l => ((x - l.cx) / l.rx) ** 2 + ((y - l.cy) / l.ry) ** 2 < 1)) continue;
      this.agua.add(k);
      if (x === CENTRO_X || y === CENTRO_Y) this.pontes.add(k);
    }
  },

  // Tuiuiús, garças e jacarés na beira d'água.
  gerarFauna() {
    const ocupado = new Set(this.obstaculos.map(o => o.x + ',' + o.y));
    const ents = this.entidades();
    const margem = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      const k = x + ',' + y;
      if (x === CENTRO_X || y === CENTRO_Y || this.agua.has(k) || ocupado.has(k)) continue;
      if (ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1)) continue;
      const aguaEsq = this.agua.has((x - 1) + ',' + y), aguaDir = this.agua.has((x + 1) + ',' + y);
      if (aguaEsq || aguaDir || this.agua.has(x + ',' + (y - 1)) || this.agua.has(x + ',' + (y + 1)))
        margem.push({ x, y, esq: aguaEsq && !aguaDir, ordem: this.rnd(x, y, 50) });
    }
    margem.sort((a, b) => a.ordem - b.ordem);
    const tipos = ['tuiuiu', 'garca', 'jacare'];
    margem.slice(0, 2).forEach((p, i) => {
      // Na área 2 do Pantanal sempre há um jacaré (é ele quem leva ao minijogo do rio).
      const bicho = this.area === 1 && i === 0 ? 'jacare' : tipos[Math.floor(this.rnd(p.x, p.y, 51 + i) * 3)];
      this.obstaculos.push({ tipo: 'fauna', bicho, x: p.x, y: p.y, esq: p.esq, fala: bicho });
    });
  },

  desenharAgua(g) {
    const ehAgua = (x, y) => this.agua.has(x + ',' + y);
    const est = this.estiloAgua || AGUA.pantanal;
    for (const k of this.agua) {
      const [x, y] = k.split(',').map(Number), px = x * T, py = y * T;
      if (this.baiaSeca) { this.desenharLamaRachada(g, x, y); if (this.pontes.has(k)) this.desenharPonte(g, x, y); continue; }
      g.fillStyle = est.base; g.fillRect(px, py, T, T);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? est.claro : est.escuro;
        g.fillRect(px + Math.floor(this.rnd(x, y, 60 + i) * 36), py + Math.floor(this.rnd(x, y, 70 + i) * 40), 8 + i * 2, 3);
      }
      // Margem de areia/lama onde encosta na terra.
      g.fillStyle = est.margem;
      if (!ehAgua(x, y - 1) && y > 0) g.fillRect(px, py, T, 6);
      if (!ehAgua(x, y + 1) && y < ROWS - 1) g.fillRect(px, py + T - 6, T, 6);
      if (!ehAgua(x - 1, y) && x > 0) g.fillRect(px, py, 6, T);
      if (!ehAgua(x + 1, y) && x < COLS - 1) g.fillRect(px + T - 6, py, 6, T);
      if (this.pontes.has(k)) { this.desenharPonte(g, x, y); continue; }
      // Plantas aquáticas: aguapé (flor lilás) e vitória-régia.
      const r = this.rnd(x, y, 80);
      if (est.plantas === 'amazonia') { this.plantaAmazonica(g, px, py, r); continue; }
      if (est.plantas === 'sanga') { this.plantaSanga(g, px, py, r); continue; }
      if (est.plantas === 'mata') { this.plantaMata(g, px, py, r); continue; }
      if (!est.plantas) continue;
      if (r < 0.28) {
        for (let i = 0; i < 4; i++) {
          g.fillStyle = i % 2 ? '#3f9a46' : '#57b552';
          g.beginPath(); g.arc(px + 14 + i * 6, py + 18 + (i % 2) * 7, 5, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = '#b48ad8'; g.fillRect(px + 22, py + 12, 5, 5);
        g.fillStyle = '#e8d24a'; g.fillRect(px + 24, py + 14, 2, 2);
      } else if (r < 0.45) {
        g.fillStyle = '#4fa047';
        g.beginPath(); g.moveTo(px + 24, py + 26); g.arc(px + 24, py + 26, 10, 0.35, Math.PI * 2 - 0.1); g.closePath(); g.fill();
        g.strokeStyle = '#b8534a'; g.lineWidth = 2;
        g.beginPath(); g.arc(px + 24, py + 26, 10, 0.35, Math.PI * 2 - 0.1); g.stroke();
      }
    }
  },

  // Baía seca: lama rachada (enquanto o Secão não for poupado).
  desenharLamaRachada(g, x, y) {
    const px = x * T, py = y * T;
    g.fillStyle = '#a8865a'; g.fillRect(px, py, T, T);
    g.fillStyle = '#8c6c44';
    for (let i = 0; i < 3; i++) g.fillRect(px + Math.floor(this.rnd(x, y, 110 + i) * 34), py + Math.floor(this.rnd(x, y, 120 + i) * 34), 10, 8);
    g.strokeStyle = '#5e4326'; g.lineWidth = 2;
    g.beginPath();
    let cx = px + 4, cy = py + 10 + this.rnd(x, y, 130) * 28;
    g.moveTo(cx, cy);
    for (let i = 0; i < 4; i++) { cx += 10; cy += (this.rnd(x, y, 140 + i) - 0.5) * 14; g.lineTo(cx, cy); }
    g.moveTo(px + 14 + this.rnd(x, y, 150) * 20, py + 2);
    g.lineTo(px + 20 + this.rnd(x, y, 151) * 10, py + 22); g.lineTo(px + 12 + this.rnd(x, y, 152) * 24, py + T - 2);
    g.stroke();
    // Peixinho preso numa poça
    if (this.rnd(x, y, 160) < 0.15) {
      g.fillStyle = '#5f8fa8'; g.fillRect(px + 16, py + 28, 16, 8);
      g.fillStyle = '#c8c8c8'; g.fillRect(px + 20, py + 31, 6, 2);
    }
  },

  // Piúva com o ninho de galhos e um tuiuiú adulto lá em cima.
  desenharNinho(ctx, px, py, t) {
    if (IMG.arvores) ctx.drawImage(IMG.arvores, 3 * 120, 0, 120, 120, px + T / 2 - 60, py + T - 116, 120, 120);
    const nx = px + T / 2, ny = py + T - 104;
    ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.ellipse(nx, ny, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a3018'; ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(nx + i * 7 - 6, ny - 3 + (i % 2) * 3); ctx.lineTo(nx + i * 7 + 8, ny + 4 - (i % 2) * 3); ctx.stroke(); }
    const ave = SPR.fauna.tuiuiu[0];
    ctx.drawImage(ave, Math.round(nx - ave.width / 2), Math.round(ny - ave.height + 4 + Math.sin(t * 2) * 1));
  },

  desenharPonte(g, x, y) {
    const px = x * T, py = y * T, horizontal = y === CENTRO_Y;
    g.fillStyle = '#7a4f28';
    if (horizontal) g.fillRect(px, py + 8, T, T - 16); else g.fillRect(px + 8, py, T - 16, T);
    g.fillStyle = '#a06a38';
    for (let i = 0; i < 4; i++) {
      if (horizontal) g.fillRect(px + i * 12 + 1, py + 10, 10, T - 20);
      else g.fillRect(px + 10, py + i * 12 + 1, T - 20, 10);
    }
    g.fillStyle = '#4a2f17';
    if (horizontal) { g.fillRect(px, py + 6, T, 3); g.fillRect(px, py + T - 9, T, 3); g.fillRect(px + 2, py + 3, 4, 8); }
    else { g.fillRect(px + 6, py, 3, T); g.fillRect(px + T - 9, py, 3, T); g.fillRect(px + 3, py + 2, 8, 4); }
  },

  // Reflexos que se mexem na água (desenhados a cada quadro).
  brilhoAgua(ctx, t) {
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    for (const k of this.agua) {
      if (this.pontes.has(k)) continue;
      const [x, y] = k.split(',').map(Number);
      const f = this.rnd(x, y, 90) * 6;
      const dx = Math.sin(t * 1.5 + f) * 6;
      ctx.fillRect(x * T + 10 + dx, y * T + 34 + Math.sin(t + f) * 2, 10, 2);
      ctx.fillRect(x * T + 28 - dx, y * T + 12, 7, 2);
    }
  },

  // Algo da paisagem com curiosidade em (x, y): fauna, planta ou água.
  falaEm(x, y) {
    const F = FALAS_PAISAGEM()[this.bioma] || {};
    const o = this.obstaculos.find(o => o.x === x && o.y === y && o.fala);
    if (o) return F[o.fala];
    if (this.agua && this.agua.has(x + ',' + y) && !this.pontes.has(x + ',' + y))
      return this.queda.has(x + ',' + y) ? F.cachoeira
        : this.baiaSeca ? F.baiaSeca : this.desmatada ? (F.garimpo || F.poluida) : this.replantada ? F.recuperando : F.agua;
    if (this.rochas && this.rochas.has(x + ',' + y)) return F.cachoeira;
    return null;
  },

  // ---------- Movimento ----------
  atualizar(dt) {
    const j = this.jogador;
    if (j.anda) {
      j.t += dt;
      const k = Math.min(1, j.t / PASSO);
      j.px = (j.de.x + (j.x - j.de.x) * k) * T;
      j.py = (j.de.y + (j.y - j.de.y) * k) * T;
      const c = this.comp;
      if (c.anda) {
        c.px = (c.de.x + (c.x - c.de.x) * k) * T;
        c.py = (c.de.y + (c.y - c.de.y) * k) * T;
      }
      if (k < 1) return;
      j.anda = false; c.anda = false;
      Jogo.aoPisar();
      if (Jogo.modo !== 'mundo' || Dialogo.ativo) return;
    }
    let d = Input.direcao();
    if (d) this.cancelarRota();
    else if (this.rota.length) d = this.rota.shift();
    else if (this.aoChegar) { const f = this.aoChegar; this.aoChegar = null; f(); return; }
    if (!d) return;
    j.dir = d;
    const [dx, dy] = DIRS[d];
    const nx = j.x + dx, ny = j.y + dy;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) { this.tentarSair(d); return; }
    if (this.solidos.has(nx + ',' + ny)) { this.cancelarRota(); return; }
    j.de = { x: j.x, y: j.y }; j.x = nx; j.y = ny; j.anda = true; j.t = 0;
    const c = this.comp;
    if (c.x !== j.de.x || c.y !== j.de.y) {
      c.de = { x: c.x, y: c.y }; c.x = j.de.x; c.y = j.de.y; c.anda = true;
      if (c.x !== c.de.x) c.esq = c.x < c.de.x;
    } else if (dx) c.esq = dx < 0;
  },

  // ---------- Tocar para andar ----------
  cancelarRota() { this.rota = []; this.aoChegar = null; },

  // Busca em largura: menor caminho até um bloco que satisfaça `objetivo`.
  rotaAte(objetivo) {
    const j = this.jogador, inicio = j.x + ',' + j.y;
    const veio = new Map([[inicio, null]]), fila = [[j.x, j.y]];
    while (fila.length) {
      const [x, y] = fila.shift();
      if (objetivo(x, y)) {
        const rota = [];
        for (let k = x + ',' + y; veio.get(k); k = veio.get(k).de) rota.unshift(veio.get(k).dir);
        return rota;
      }
      for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || veio.has(k) || this.solidos.has(k)) continue;
        veio.set(k, { de: x + ',' + y, dir });
        fila.push([nx, ny]);
      }
    }
    return null;
  },

  // O jogador tocou no bloco (tx, ty).
  irPara(tx, ty) {
    const j = this.jogador;
    this.marca = { x: tx, y: ty, t0: performance.now() };
    if (tx === j.x && ty === j.y) { if (!j.anda) Input.pulso('ok'); return; }
    const vizinho = (x, y) => Math.abs(x - tx) + Math.abs(y - ty) === 1;
    const virarPara = () => { j.dir = tx > j.x ? 'right' : tx < j.x ? 'left' : ty < j.y ? 'up' : 'down'; };

    // Companheiro ao lado: conversa.
    if (Estado.companheiro && !j.anda && this.comp.x === tx && this.comp.y === ty && vizinho(j.x, j.y)) {
      virarPara(); Jogo.falarComp(); return;
    }
    // Pessoa, placa, item...: anda até o lado e interage.
    const ent = this.entidades().find(e => e.y === ty && Math.abs(e.x - tx) <= (e.largura ? 1 : 0) && e.tipo !== 'decor');
    if (ent || this.falaEm(tx, ty)) {
      const rota = this.rotaAte(vizinho);
      if (rota) { this.rota = rota; this.aoChegar = () => { virarPara(); Jogo.interagir(); }; }
      return;
    }
    if (this.solidos.has(tx + ',' + ty)) return;
    const rota = this.rotaAte((x, y) => x === tx && y === ty);
    if (!rota) return;
    this.rota = rota; this.aoChegar = null;
    // Tocou na saída da trilha: atravessa para a próxima área.
    const saida = tx === 0 && ty === CENTRO_Y ? 'left' : tx === COLS - 1 && ty === CENTRO_Y ? 'right'
                : ty === 0 && tx === CENTRO_X ? 'up' : ty === ROWS - 1 && tx === CENTRO_X ? 'down' : null;
    if (saida && this.bioma !== 0 && this.vizinhos()[saida] !== undefined)
      this.aoChegar = () => { j.dir = saida; this.tentarSair(saida); };
  },

  desenharMarca(ctx) {
    const m = this.marca;
    if (!m) return;
    const idade = (performance.now() - m.t0) / 500;
    if (idade >= 1) { this.marca = null; return; }
    ctx.strokeStyle = `rgba(255,225,77,${1 - idade})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(m.x * T + T / 2, m.y * T + T / 2, 8 + idade * 16, 0, Math.PI * 2); ctx.stroke();
  },

  tentarSair(dir) {
    if (this.bioma === 0) return;
    const j = this.jogador;
    const naTrilha = (dir === 'left' || dir === 'right') ? j.y === CENTRO_Y : j.x === CENTRO_X;
    const n = this.vizinhos()[dir];
    if (!naTrilha || n === undefined) return;
    const entrada = { right: [0, CENTRO_Y], left: [COLS - 1, CENTRO_Y], down: [CENTRO_X, 0], up: [CENTRO_X, ROWS - 1] }[dir];
    Jogo.fade(() => this.entrar(this.bioma, n, entrada[0], entrada[1]));
  },

  // Entidade logo à frente do jogador (ou encostada nele).
  entidadeProxima() {
    const j = this.jogador, [dx, dy] = DIRS[j.dir];
    const ents = this.entidades().filter(e => e.tipo !== 'decor');
    const larg = e => (e.largura ? 1 : 0);
    const ocupa = (e, x, y) => e.y === y && Math.abs(e.x - x) <= larg(e);
    const dist = e => Math.max(Math.max(0, Math.abs(e.x - j.x) - larg(e)), Math.abs(e.y - j.y));
    return ents.find(e => ocupa(e, j.x + dx, j.y + dy)) || ents.find(e => dist(e) <= 1);
  },

  // ---------- Desenho ----------
  desenharFundo(ents) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    if (this.bioma === 0) { this.fundoLab(g); return c; }
    const pal = PALETAS_SOLO[this.bioma];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const px = x * T, py = y * T;
      g.fillStyle = pal.base; g.fillRect(px, py, T, T);
      for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
        const r = this.rnd(x * 5 + gx, y * 5 + gy, 3);
        if (r <= 0.43) continue;
        g.fillStyle = r > 0.82 ? pal.light : (r > 0.64 ? pal.mid : pal.dark);
        g.fillRect(px + gx * 8 + Math.floor(this.rnd(gx + x * 13, gy + y * 17, 5) * 4),
                   py + gy * 8 + Math.floor(this.rnd(gx + x * 7, gy + y * 11, 6) * 4),
                   2 + Math.floor(this.rnd(gx + x * 3, gy + y * 5, 8) * 4),
                   2 + Math.floor(this.rnd(gx + x * 9, gy + y * 2, 9) * 4));
      }
    }
    // Trilhas até as saídas existentes.
    const viz = this.vizinhos();
    const trilha = [];
    if (viz.right !== undefined) for (let x = CENTRO_X; x < COLS; x++) trilha.push([x, CENTRO_Y]);
    if (viz.left !== undefined)  for (let x = 0; x <= CENTRO_X; x++) trilha.push([x, CENTRO_Y]);
    if (viz.down !== undefined)  for (let y = CENTRO_Y; y < ROWS; y++) trilha.push([CENTRO_X, y]);
    if (viz.up !== undefined)    for (let y = 0; y <= CENTRO_Y; y++) trilha.push([CENTRO_X, y]);
    if (VEGETACAO[this.bioma].amazonia) { this.chaoAmazonia(g); if (this.agua.size) this.desenharAgua(g); }
    if (VEGETACAO[this.bioma].caatinga) { this.chaoCaatinga(g); if (this.agua.size) this.desenharAgua(g); }
    if (VEGETACAO[this.bioma].pampa) { this.chaoPampa(g); if (this.agua.size) this.desenharAgua(g); }
    if (VEGETACAO[this.bioma].mata) { this.chaoMata(g); if (this.agua.size) this.desenharAgua(g); }
    if (VEGETACAO[this.bioma].pantanal) {
      // Campo alagável: touceiras de capim e florzinhas.
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        if (this.agua.has(x + ',' + y)) continue;
        const r = this.rnd(x, y, 95), px = x * T, py = y * T;
        if (r < 0.35) {
          const bx = px + 8 + Math.floor(this.rnd(x, y, 96) * 26), by = py + 14 + Math.floor(this.rnd(x, y, 97) * 22);
          g.fillStyle = '#3e7a2a';
          g.fillRect(bx, by, 2, 8); g.fillRect(bx + 3, by - 3, 2, 11); g.fillRect(bx + 6, by + 1, 2, 7); g.fillRect(bx - 3, by + 2, 2, 6);
          g.fillStyle = '#9fd36a'; g.fillRect(bx + 3, by - 3, 2, 3);
        } else if (r < 0.45) {
          g.fillStyle = this.rnd(x, y, 98) < 0.5 ? '#f2e35a' : '#f4f4f4';
          const fx = px + 10 + Math.floor(this.rnd(x, y, 99) * 26), fy = py + 10 + Math.floor(this.rnd(x, y, 100) * 26);
          g.fillRect(fx, fy, 3, 3); g.fillRect(fx + 9, fy + 6, 3, 3);
        }
      }
      this.desenharAgua(g);
    }
    for (const [x, y] of trilha) {
      if (this.pontes.has(x + ',' + y)) continue;
      g.fillStyle = BIOMAS[this.bioma].trilha;
      g.globalAlpha = 0.55; g.fillRect(x * T + 6, y * T + 6, T - 12, T - 12); g.globalAlpha = 1;
      g.fillStyle = 'rgba(0,0,0,.15)';
      for (let k = 0; k < 3; k++) g.fillRect(x * T + 8 + Math.floor(this.rnd(x, y, 20 + k) * 30), y * T + 8 + Math.floor(this.rnd(x, y, 30 + k) * 30), 4, 3);
    }
    // Chão queimado perto do Fumaréu (enquanto a missão não acaba).
    // Só escurece onde há fogo (Cerrado, Pantanal).
    const fogo = ents.some(e => e.tipo === 'fogo') && ents.find(e => e.tipo === 'encontro');
    if (fogo) {
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const d = Math.hypot(x - fogo.x - 1, y - fogo.y - 1);
        if (d < 4.5) { g.fillStyle = `rgba(40,20,10,${0.55 - d * 0.1})`; g.fillRect(x * T, y * T, T, T); }
      }
    }
    // Bordas com aberturas onde há passagem.
    g.fillStyle = '#222';
    const abre = (lado, i) => viz[lado] !== undefined && ((lado === 'up' || lado === 'down') ? i === CENTRO_X : i === CENTRO_Y);
    for (let x = 0; x < COLS; x++) {
      if (!abre('up', x)) g.fillRect(x * T, 0, T, 7);
      if (!abre('down', x)) g.fillRect(x * T, H - 7, T, 7);
    }
    for (let y = 0; y < ROWS; y++) {
      if (!abre('left', y)) g.fillRect(0, y * T, 7, T);
      if (!abre('right', y)) g.fillRect(W - 7, y * T, 7, T);
    }
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '28px ' + FONTE; g.textBaseline = 'middle'; g.textAlign = 'center';
    if (viz.right !== undefined) g.fillText('›', W - 12, CENTRO_Y * T + T / 2);
    if (viz.left !== undefined)  g.fillText('‹', 12, CENTRO_Y * T + T / 2);
    if (viz.up !== undefined)    g.fillText('ˆ', CENTRO_X * T + T / 2, 16);
    if (viz.down !== undefined)  g.fillText('ˇ', CENTRO_X * T + T / 2, H - 14);
    g.textAlign = 'left';
    return c;
  },

  fundoLab(g) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      g.fillStyle = '#e4ebef'; g.fillRect(x * T, y * T, T, T);
      if ((x + y) % 2 === 0) { g.fillStyle = '#d7e0e5'; g.fillRect(x * T + 3, y * T + 3, T - 6, T - 6); }
    }
    // Parede com prateleiras
    g.fillStyle = '#657482'; g.fillRect(0, 0, W, T);
    g.fillStyle = '#4c5864'; g.fillRect(0, T - 6, W, 6);
    const cores = ['#d9534f', '#5bc0de', '#f0ad4e', '#5cb85c', '#9b59b6'];
    for (const sx of [3, 9]) {
      g.fillStyle = '#8a6a45'; g.fillRect(sx * T, 10, T * 2.5, 6); g.fillRect(sx * T, 30, T * 2.5, 6);
      for (let k = 0; k < 9; k++) { g.fillStyle = cores[k % 5]; g.fillRect(sx * T + 6 + k * 12, 16 - 0, 8, 14 - (k % 3) * 2); }
    }
    // Tapete
    g.fillStyle = '#2e6d8e'; g.fillRect(4 * T, 5 * T, 7 * T, 3 * T);
    g.strokeStyle = '#ffe14d'; g.lineWidth = 3; g.strokeRect(4 * T + 6, 5 * T + 6, 7 * T - 12, 3 * T - 12);
    g.fillStyle = '#222';
    for (let x = 0; x < COLS; x++) { g.fillRect(x * T, H - 7, T, 7); }
    for (let y = 0; y < ROWS; y++) { g.fillRect(0, y * T, 7, T); g.fillRect(W - 7, y * T, 7, T); }
  },

  desenhar(ctx, t) {
    ctx.drawImage(this.fundo, 0, 0);
    if (this.agua.size && !this.baiaSeca) this.brilhoAgua(ctx, t);
    if (VEGETACAO[this.bioma] && VEGETACAO[this.bioma].mata) this.efeitosMata(ctx, t);
    this.desenharMarca(ctx);
    const lista = [];
    for (const o of this.obstaculos) lista.push({ y: o.y, d: () => this.desenharObstaculo(ctx, o) });
    for (const e of this.entidades()) lista.push({ y: e.y, d: () => this.desenharEntidade(ctx, e, t) });
    lista.push({ y: this.jogador.py / T + 0.01, d: () => this.desenharJogador(ctx, t) });
    if (Estado.companheiro) lista.push({ y: this.comp.py / T, d: () => this.desenharComp(ctx, t) });
    lista.sort((a, b) => a.y - b.y).forEach(o => o.d());
    if (VEGETACAO[this.bioma] && VEGETACAO[this.bioma].amazonia && !this.desmatada && !this.replantada) this.raiosDeLuz(ctx, t);
    if (this.bioma !== 0) this.desenharMinimapa(ctx);
  },

  desenharObstaculo(ctx, o) {
    const px = o.x * T, py = o.y * T;
    if (o.tipo === 'sprite') { const s = SPR[o.sprite]; ctx.drawImage(s, Math.round(px + T / 2 - s.width / 2), py + T - s.height + 2); return; }
    if (o.tipo === 'palmeira') { ctx.drawImage(SPR.palmeira, Math.round(px + T / 2 - SPR.palmeira.width / 2), py + T - SPR.palmeira.height); return; }
    if (o.tipo === 'fauna') {
      const spr = SPR.fauna[o.bicho][o.esq ? 1 : 0];
      if (o.bicho === 'boto') {
        // O boto sobe e desce na água
        const sobe = Math.max(0, Math.sin(performance.now() / 700 + o.x));
        ctx.save(); ctx.beginPath(); ctx.rect(px, py, T, T - 16); ctx.clip();
        ctx.drawImage(spr, Math.round(px + T / 2 - spr.width / 2), Math.round(py + T - 16 - spr.height * sobe));
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(px + 8, py + T - 18, T - 16, 2);
        return;
      }
      ctx.drawImage(spr, Math.round(px + T / 2 - spr.width / 2), py + T - spr.height - 2);
      return;
    }
    if (o.tipo === 'arvore' && IMG.arvores) {
      ctx.drawImage(IMG.arvores, o.col * 120, o.variante * 120, 120, 120, px + T / 2 - 60, py + T - 116, 120, 120);
    } else if (o.tipo === 'moita' && IMG.terreno) {
      ctx.drawImage(IMG.terreno, (o.quadro % 5) * 32, Math.floor(o.quadro / 5) * 32, 32, 32, px - 8, py - 14, 64, 64);
    }
  },

  desenharEntidade(ctx, e, t) {
    const px = e.x * T, py = e.y * T;
    const base = (spr, oy = 0) => ctx.drawImage(spr, Math.round(px + T / 2 - spr.width / 2), Math.round(py + T - spr.height + oy));
    switch (e.tipo) {
      case 'professor':
        if (IMG.professor) ctx.drawImage(IMG.professor, px - 8, py - 18, 64, 64);
        break;
      case 'fogo':
        base(SPR.chama[Math.floor(t * 6 + e.x) % 2], -4);
        break;
      case 'encontro':
        base(SPR[e.sprite], Math.sin(t * 4) * 3 - 4);
        break;
      case 'animal':
        if (e.poca) { ctx.fillStyle = '#9a7a3a'; ctx.beginPath(); ctx.ellipse(px + T / 2, py + T - 8, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.save(); ctx.translate(Math.sin(t * 40) * 1, 0); base(SPR[e.sprite + 'Esq'] || SPR[e.sprite], e.poca ? -4 : -2); ctx.restore();
        break;
      case 'ninho':
        this.desenharNinho(ctx, px, py, t);
        break;
      case 'objeto':
        if (e.desenho === 'fogochao') this.desenharFogoDeChao(ctx, px, py, t);
        else if (e.desenho === 'catavento') this.desenharCatavento(ctx, px, py, t);
        else base(SPR[e.sprite], -2);
        break;
      case 'item':
        base(SPR[e.sprite], Math.sin(t * 3) * 2 - 6);
        break;
      default:
        base(SPR[e.sprite], -2);
    }
    // Balão "!" sobre quem tem algo a dizer pela primeira vez.
    if (e.tipo === 'npc' && !Estado.conversou[e.id]) {
      ctx.fillStyle = '#ffe14d'; ctx.font = '28px ' + FONTE; ctx.textBaseline = 'top';
      ctx.fillText('!', px + T / 2 - 4, py - 34 + Math.sin(t * 5) * 2);
    }
  },

  desenharComp(ctx, t) {
    const c = this.comp, andando = c.anda || this.jogador.anda;
    const quadro = andando ? Math.floor(t / 0.14) % 2 : 0;
    desenharCompanheiro(ctx, Estado.companheiro, c.px + T / 2, c.py + T - 2, quadro, c.esq, t);
  },

  // O companheiro está no bloco à frente do jogador?
  compNaFrente() {
    const j = this.jogador, [dx, dy] = DIRS[j.dir];
    return !!Estado.companheiro && this.comp.x === j.x + dx && this.comp.y === j.y + dy;
  },

  desenharJogador(ctx, t) {
    const j = this.jogador;
    const img = j.anda || Input.direcao() ? IMG['andando' + (Math.floor(t / 0.13) % 4)] : IMG.parado;
    if (!img) return;
    ctx.drawImage(img, Math.round(j.px + T / 2 - 48), Math.round(j.py + T - 72), 96, 96);
  },

  desenharMinimapa(ctx) {
    const c = this.celulas(), cw = 14, ch = 10, ox = W - 14 - 3 * (cw + 3), oy = H - 4 * (ch + 3) - 10;
    const m = MISSOES[this.bioma];
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(ox - 6, oy - 6, 3 * (cw + 3) + 9, 4 * (ch + 3) + 9);
    c.forEach((p, i) => {
      const x = ox + p[0] * (cw + 3), y = oy + p[1] * (ch + 3);
      const atual = i === this.area, visitada = this.visitadas[this.bioma + ':' + i];
      ctx.fillStyle = atual ? '#ffe14d' : visitada ? '#ddd' : '#555';
      ctx.fillRect(x, y, cw, ch);
      if (m && !m.emBreve && i === m.areaEncontro && !Estado.resgatados.includes(m.id)) {
        ctx.fillStyle = '#e33'; ctx.fillRect(x + 5, y + 2, 4, 6);
      }
    });
  }
};

function entidadeVisivel(m, e) {
  if (e.tipo === 'item') return !Estado.coletados.includes(e.id);
  if (e.tipo === 'encontro' || e.tipo === 'fogo' || e.tipo === 'gaiola') return !Estado.poupados.includes(m.id);
  if (e.tipo === 'animal') return !Estado.resgatados.includes(m.id);
  return true;
}
