// Sprites desenhados em código como "mapas de caracteres".
// Cada letra é uma cor da paleta; "." é transparente. Um contorno escuro é
// adicionado automaticamente. São provisórios: dá para trocar por PNGs do Piskel.
const Pixel = {
  criar(linhas, paleta, escala = 3, contorno = '#141414') {
    const h = linhas.length, w = Math.max(...linhas.map(l => l.length));
    const pad = contorno ? 1 : 0;
    const c = document.createElement('canvas');
    c.width = (w + pad * 2) * escala;
    c.height = (h + pad * 2) * escala;
    const x = c.getContext('2d');
    const cheio = (i, j) => { const l = linhas[j]; return !!l && i >= 0 && i < l.length && l[i] !== '.'; };
    if (contorno) {
      x.fillStyle = contorno;
      for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
        if (cheio(i, j)) continue;
        if (cheio(i - 1, j) || cheio(i + 1, j) || cheio(i, j - 1) || cheio(i, j + 1))
          x.fillRect((i + pad) * escala, (j + pad) * escala, escala, escala);
      }
    }
    for (let j = 0; j < h; j++) for (let i = 0; i < linhas[j].length; i++) {
      const ch = linhas[j][i];
      if (ch === '.') continue;
      x.fillStyle = paleta[ch] || '#f0f';
      x.fillRect((i + pad) * escala, (j + pad) * escala, escala, escala);
    }
    return c;
  },
  espelhar(linhas) {
    const w = Math.max(...linhas.map(l => l.length));
    return linhas.map(l => l.padEnd(w, '.').split('').reverse().join(''));
  }
};

const MAPAS = {
  alma: [
    '.gg.gg.',
    'gGggggg',
    'gGggggg',
    '.ggggg.',
    '..ggg..',
    '...g...'
  ],
  humano: [
    '....HHHH....',
    '...HHHHHH...',
    '..HHHHHHHH..',
    '...SSSSSS...',
    '...SKSSKS...',
    '...SSSSSS...',
    '....SSSS....',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.SCCCCCCCCS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..PPP..PPP..',
    '..BBB..BBB..'
  ],
  pesquisadora: [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '..HGKGGKGH..',
    '..HSSSSSSH..',
    '..H.SSSS.H..',
    '..CCCCCCCC..',
    '.CCCCcCCCCC.',
    '.SCCCcCCCCS.',
    '.SCCCcCCCCS.',
    '..CCCcCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..PPP..PPP..',
    '..BBB..BBB..'
  ],
  brigadista: [
    '....HHHH....',
    '...HHHHHH...',
    '.HHHHHHHHHH.',
    '...SSSSSS...',
    '...SKSSKS...',
    '...SSSSSS...',
    '....SSSS....',
    '..CCCCCCCC..',
    '.CCCCCCCCCC.',
    '.SRRRRRRRRS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..PRP..PRP..',
    '..BBB..BBB..'
  ],
  seuZe: [
    '....HHHH....',
    '...HhHHhH...',
    'HHHHHHHHHHHH',
    '...SSSSSS...',
    '...SKSSKS...',
    '...SMMMMS...',
    '....SSSS....',
    '..CRCRCRCR..',
    '.CRCRCRCRCR.',
    '.SCRCRCRCRS.',
    '.SRCRCRCRCS.',
    '..CRCRCRCR..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..PPP..PPP..',
    '..BBB..BBB..'
  ],
  lobo: [
    '...............k..k.',
    '...............kk.kk',
    '...............ooooo',
    '...............okoooo',
    '..........kkkkoooooookk',
    'ww......kkkkkkkoowww',
    'wo...ooooooookkoowww',
    '.oo.oooooooooooooww',
    '..ooooooooooooooo',
    '...ooooooooooooo',
    '....oooddddddooo',
    '....kk.kk...kk.kk',
    '....kk.kk...kk.kk',
    '....kk.kk...kk.kk',
    '....kk.kk...kk.kk',
    '...kkk.kkk.kkk.kkk'
  ],
  fumareu: [
    '.........r..........',
    '........ro.....r....',
    '........roo...ro....',
    '...r...rooo..roo....',
    '...rr..roooorooo..r.',
    '...ror.rooyooooo.ror',
    '..roooorooyyooooorr.',
    '..rooooooyyyoooooor.',
    '..roooooyyyyyooooor.',
    '.rooooyyyyyyyyyooooor',
    '.roooykkyyyyyykkyooor',
    '.rooyyywwkyyywwkyyoor',
    '.rooyyywkkyyywkkyyoor',
    '.rooyyyyyyyyyyyyyyoor',
    '.rooyyykyyyyyyykyyoor',
    '.roooyyykkkkkkkyyooor',
    '..roooyyyyyyyyyyyoor.',
    '..rrooooyyyyyyyoooor.',
    '...rroooooooooooorr..',
    '....rrrooooooooorr...',
    '......rrrrrrrrrr.....'
  ],
  chama: [
    '...r....',
    '..ro..r.',
    '..roo.r.',
    '.rooorro',
    '.royyoor',
    'royyyyor',
    'royyyyor',
    '.ryyyyr.',
    '..rrrr..'
  ],
  placa: [
    '.mmmmmmmmmmmm.',
    'mWWWWWWWWWWWWm',
    'mWkkWkkkWkkWWm',
    'mWWWWWWWWWWWWm',
    'mWkkkWkkWkkkWm',
    'mWWWWWWWWWWWWm',
    '.mmmmmmmmmmmm.',
    '......mm......',
    '......mm......',
    '.....mmmm.....'
  ],
  pequi: [
    '....nn....',
    '...nn.....',
    '..GGGGGG..',
    '.GGgGGGGG.',
    'GGggGGGGGG',
    'GGgGGGGGGG',
    'GGGGGGGGGG',
    '.GGGGGGGd.',
    '..GGGGdd..',
    '...dddd...'
  ],
  computador: [
    'wwwwwwwwwwwwww',
    'wggggggggggggw',
    'wgGGGgggGGgggw',
    'wggggggggggggw',
    'wgGGgGGGggGggw',
    'wggggggggggggw',
    'wwwwwwwwwwwwww',
    '.....wwww.....',
    '...wwwwwwww...',
    'tttttttttttttt',
    't.tt......tt.t',
    't.tt......tt.t'
  ],
  vaso: [
    '..f.ff.f..',
    '.ffFfFff..',
    'ffFfffFff.',
    '.fffFfff..',
    '..ffFff...',
    '..cccccc..',
    '..cCCCCc..',
    '...cccc...',
    '...cccc...'
  ]
};

const SPR = {};
function prepararSprites() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  SPR.alma = Pixel.criar(MAPAS.alma, { g: '#3fe060', G: '#c9ffcf' }, 2, null);
  SPR.pesquisadora = Pixel.criar(MAPAS.pesquisadora,
    { H: '#3a2418', S: pele.c, K: '#111', G: '#555', C: '#f2f2f2', c: '#c9c9c9', P: '#3b4a6b', B: '#2a2a2a' }, 3);
  SPR.brigadista = Pixel.criar(MAPAS.brigadista,
    { H: '#f0c21a', S: pele.a, K: '#111', C: '#e39b17', R: '#e8e8e8', P: '#4d5a2f', B: '#222' }, 3);
  SPR.seuZe = Pixel.criar(MAPAS.seuZe,
    { H: '#d9b45a', h: '#a8813a', S: pele.b, K: '#111', M: '#ddd', C: '#3d6fb5', R: '#27497d', P: '#6b4a2b', B: '#2a1d12' }, 3);
  const corLobo = { o: '#d9772b', d: '#b85c1e', k: '#1d1410', w: '#f3e6c9' };
  SPR.lobo = Pixel.criar(MAPAS.lobo, corLobo, 3);
  SPR.loboEsq = Pixel.criar(Pixel.espelhar(MAPAS.lobo), corLobo, 3);
  SPR.loboMini = [Pixel.criar(MAPAS.lobo, corLobo, 2), Pixel.criar(Pixel.espelhar(MAPAS.lobo), corLobo, 2)];
  const corFogo = { r: '#c2261b', o: '#ff7a1a', y: '#ffd23f', w: '#fff', k: '#2b0d06' };
  SPR.fumareu = Pixel.criar(MAPAS.fumareu, corFogo, 6);
  SPR.fumareuMundo = Pixel.criar(MAPAS.fumareu, corFogo, 3);
  SPR.chama = [Pixel.criar(MAPAS.chama, corFogo, 4, null), Pixel.criar(Pixel.espelhar(MAPAS.chama), corFogo, 4, null)];
  SPR.placa = Pixel.criar(MAPAS.placa, { m: '#6b4423', W: '#c08a4e', k: '#4a2e17' }, 3);
  SPR.pequi = Pixel.criar(MAPAS.pequi, { G: '#7aa33a', g: '#b9d873', d: '#56772a', n: '#5a3a1f' }, 3);
  SPR.computador = Pixel.criar(MAPAS.computador, { w: '#9aa4ad', g: '#1f8f4e', G: '#7dffa9', t: '#7a5634' }, 3);
  SPR.vaso = Pixel.criar(MAPAS.vaso, { f: '#2f8a3a', F: '#59c35f', c: '#a0522d', C: '#c8743f' }, 4);
  prepararCompanheiros();
  prepararPantanal();
  prepararMissaoPantanal();
  prepararAmazonia();
  prepararCaatinga();
  prepararPampa();
  prepararMata();
  // Jacaré e onça vistos de cima (minijogo do rio). O rabo do jacaré balança em 2 quadros.
  const corpoJacare = [
    '....ddd....', '...ddddd...', '...dEdEd...', '...ddddd...', '....ddd....', '..d.ddd.d..', '.dd.ddd.dd.',
    '...dkdkd...', '...ddddd...', '...dkdkd...', '...ddddd...', '.dd.ddd.dd.', '..d.ddd.d..', '....ddd....', '....dkd....'
  ];
  const corJacare = { d: '#6d6a3a', k: '#3a3820', E: '#ffd23f' };
  SPR.jacareCima = [
    Pixel.criar([...corpoJacare, '....dd.....', '...dd......', '...d.......'], corJacare, 2),
    Pixel.criar([...corpoJacare, '.....dd....', '......dd...', '.......d...'], corJacare, 2)
  ];
  SPR.oncaCima = Pixel.criar([
    '..o...o..', '.ooooooo.', '.okoooko.', '..ooRoo..', '..ooooo..', '.oKoooKo.',
    '.ooKoKoo.', '..ooooo..', '..oKoKo..', '...ooo...', '....o....'
  ], { o: '#e8a33a', k: '#1a1a1a', K: '#3a2410', R: '#d77a7a' }, 3);
  // Fauna do Cerrado (com curiosidades no mapa)
  const ambosC = (mapa, paleta) => [Pixel.criar(mapa, paleta, 3), Pixel.criar(Pixel.espelhar(mapa), paleta, 3)];
  Object.assign(SPR.fauna, {
    lobo: [SPR.lobo, SPR.loboEsq],
    seriema: ambosC([
      '....g.g...', '...gggg...', '..gggkgr..', '...ggg.rr.', '...gg.....', '...gg.....', '..gggg....',
      '.ggGgGgg..', 'gggGgGggg.', '.ggggggg..', '...r..r...', '...r..r...', '...r..r...', '..rr.rr...'
    ], { g: '#a89c88', G: '#8a7e6a', k: '#1a1a1a', r: '#d9603a' }),
    tamandua: ambosC([
      '..............kk...', 'ttt..........gggk..', 'tttt.....ggggggggkk', 'tttttgggggwwkkgg...',
      '.tttggggwwkkkgg....', '..ttgggwkkkggg.....', '....ggggggggg......', '....kk.kk..kk.kk...'
    ], { t: '#5a4a3a', g: '#8a7a68', w: '#f0e8d8', k: '#1a1a1a' }),
    arara: ambosC([
      '...bbb...', '..bwkbk..', '..bbbkk..', '.bbbbb...', 'bbyyyy...', 'bbyyyy...', '.byyyy...', '..bbb....', '..bb.....', '..b......', '.bb......'
    ], { b: '#2a7ad5', y: '#f2c230', w: '#f4f4f0', k: '#1a1a1a' }),
    tatu: ambosC([
      '....AaAaAaA.....', '..AaAaAaAaAaAa..', '.AaAaAaAaAaAaAahh', 'AaAaAaAaAaAaAahhk', '.ff....ff...ff...'
    ], { A: '#a89070', a: '#7a6448', h: '#c8b090', k: '#1a1a1a', f: '#5a4a3a' })
  });
  // Cocar dos Guardiões (item da fase secreta)
  SPR.cocar = Pixel.criar([
    '.....r.y.b.g.r.....',
    '...b.r.y.b.g.r.y...',
    '..gb.ryybbggrr.yr..',
    '.rgbbryybbggrryyrr.',
    '.rggbbyybbggrryyrr.',
    '..ggbbyybbggrryy...',
    '...kkkkkkkkkkkkk...',
    '...kwkwkwkwkwkwk...',
    '...kkkkkkkkkkkkk...'
  ], { r: '#d9302c', y: '#f2d23a', b: '#2a6ad5', g: '#3f9a3a', k: '#6b4a2a', w: '#f4ead8' }, 3);
}

// Floresta, fauna, personagens e o robô Devastron da Mata Atlântica.
function prepararMata() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  const ambos = (mapa, paleta, escala) => [Pixel.criar(mapa, paleta, escala), Pixel.criar(Pixel.espelhar(mapa), paleta, escala)];

  // Árvores
  const tronco = [];
  for (let i = 0; i < 16; i++) tronco.push(i % 3 === 0 ? '..........tTtt..........' : '..........ttTt..........');
  SPR.araucaria = Pixel.criar([
    '.gg...gg...gg...gg...gg.',
    'gGGg.gGGg.gGGg.gGGg.gGGg',
    'gggggggggggggggggggggggg',
    '.tt...tt....tt...tt..tt.',
    '...tt...tt..tt..tt..tt..',
    '.....tt..tttttt..tt.....',
    '.......tttttttttt.......',
    ...tronco,
    '.........ttTTtt.........'
  ], { g: '#2f5a2a', G: '#4f7a3a', t: '#6b4a2e', T: '#8e6a44' }, 3);
  SPR.jucaraPalm = Pixel.criar([
    '..f....f....f...', '...f...f...f....', 'f...ff.f.ff...f.', '.ff..fffff..ff..', '...fffffffff....',
    'ff.ffFfffFff.ff.', '..ffFf.tt.fFff..', '.f.f.a.tt..f.f..', 'f...aaatt.......', '....aaatt.......',
    '.....a.tt.......', '.......tt.......', '.......tT.......', '.......tt.......', '.......Tt.......',
    '.......tt.......', '.......tt.......', '.......tT.......', '.......tt.......', '......tttt......'
  ], { f: '#2f7a32', F: '#5cb04a', t: '#8a8a7a', T: '#a8a898', a: '#2a1a2a' }, 3);
  SPR.paubrasil = Pixel.criar(mapaArvore({ largura: 22, copaAltura: 10, troncoAltura: 9, troncoLargura: 3, raizes: 1, semente: 91 }),
    { g: '#3f8a35', G: '#f2d23a', d: '#2a6a28', t: '#8a3a2a', T: '#a84a3a' }, 3);
  SPR.quaresmeira = Pixel.criar(mapaArvore({ largura: 20, copaAltura: 9, troncoAltura: 8, troncoLargura: 2, raizes: 1, semente: 101 }),
    { g: '#7a4aa8', G: '#b07ad8', d: '#5a2a88', t: '#6b5a4a', T: '#8a7866' }, 3);
  SPR.embauba = Pixel.criar(mapaArvore({ largura: 18, copaAltura: 8, troncoAltura: 12, troncoLargura: 2, raizes: 1, semente: 111 }),
    { g: '#98a890', G: '#e0e8d8', d: '#6a7a68', t: '#b0b0a8', T: '#d0d0c8' }, 3);
  SPR.samambaiacu = Pixel.criar([
    'f.......ff.......f', '.ff....f..f....ff.', '...ff.f....f.ff...', '.....ffffffff.....', '..fffFfffffFfff...',
    'ff....fFfFf....ff.', '.....f.kkk.f......', '.......kKk........', '.......kkk........', '.......kKk........',
    '.......kkk........', '.......kKk........', '.......kkk........', '......kkkkk.......'
  ], { f: '#3f9a3a', F: '#7cd25a', k: '#4a3020', K: '#6a4a30' }, 3);

  // Fauna
  Object.assign(SPR.fauna, {
    muriqui: ambos([
      '....kkk.....', '...kwwwk....', '...kwkwk....', '....www.....', '..bbbbbbb...', '.b.bbbbb.b..',
      'b..bbbbb..b.', 'b..bbbbb..b.', '...b...b...b', '...b...b..b.', '..bb...bb...'
    ], { b: '#d8c8a8', w: '#4a3a3a', k: '#c8b898' }, 3),
    preguica: ambos([
      '...gggg.....', '..gwkwkg....', '..gwwwwg....', '.kkkkkkkk...', 'gggggggggg..', 'gggggggggg..', '.gg....gg...', 'kk......kk..'
    ], { g: '#8a7a68', w: '#d8c8b0', k: '#2a2018' }, 3),
    jacutinga: ambos([
      '..ww......', '.wkkk.....', '.kbkbk....', '..kkky....', '..rr......', '.kkkkkk...', 'kkwwkkkk..', 'kkkwwkkk..', '.kkkkkkk..', '...y.y....'
    ], { w: '#f4f4f0', k: '#1a1a1a', b: '#6a9ad8', r: '#d9302c', y: '#c8a070' }, 3),
    tucano: ambos([
      '..kkk.......', '.kwkkGGGGGr.', '.kkkkYYYYY..', '..yyyk......', '.kkkkk......', 'kkkkkkk.....', '.kkkkk......', '..k.k.......'
    ], { k: '#1a1a1a', w: '#f4f4f0', G: '#7ac040', Y: '#f2d23a', r: '#d9302c', y: '#f2d23a' }, 3),
    saira: ambos(['.ggg...', 'gkgg...', '.gtttt.', 'otttkko', '.ttttk.', '..k.k..'],
      { g: '#4ad06a', k: '#1a1a1a', t: '#2ab8d8', o: '#f08a20' }, 3),
    sapinho: ambos(['o.o.o', 'ooooo', '.ooo.'], { o: '#f29a1a' }, 3),
    onca: [SPR.comp.onca.dir[0], SPR.comp.onca.esq[0]]
  });

  // Micos-leões-dourados
  const mico = ['..oooo....', '.oOOOOo...', '.oOkOkO...', '..OddO....', '..oooo....', '.oooooo..o', '.oooooo.o.', '..o..o.o..', '..o..o....'];
  const corMico = { o: '#f0a020', O: '#ffc040', k: '#1a1a1a', d: '#6a3a20' };
  SPR.mico = Pixel.criar(mico, corMico, 3);
  const micoP = Pixel.criar(mico, corMico, 2), micoPE = Pixel.criar(Pixel.espelhar(mico), corMico, 2);
  const arvore = Pixel.criar(mapaArvore({ largura: 22, copaAltura: 10, troncoAltura: 12, troncoLargura: 3, raizes: 1, semente: 121 }),
    { g: '#2f7a32', G: '#5cb04a', d: '#1f5424', t: '#6b4a2e', T: '#8e6a44' }, 3);
  const c = document.createElement('canvas'); c.width = arvore.width; c.height = arvore.height;
  const x = c.getContext('2d');
  x.drawImage(arvore, 0, 0);
  x.drawImage(micoP, 6, 10); x.drawImage(micoPE, arvore.width - 30, 4); x.drawImage(micoP, arvore.width / 2 - 8, 24);
  SPR.micosArvore = c;

  // Itens e objetos
  SPR.jucaraItem = Pixel.criar(['...n....', '..nnn...', '.aAaAa..', 'aAaaaAa.', '.aaAaaa.', '..aaAa..', '...aa...'],
    { a: '#2a1a2a', A: '#5a3a5a', n: '#4a7a2a' }, 3);
  SPR.pinhaoItem = Pixel.criar(['.p..p.', 'pPp.pP', 'pPp.pP', '.p..p.'], { p: '#7a3a1e', P: '#b06a3a' }, 3);
  SPR.viveiro = Pixel.criar([
    '.g..g..g..g..g..', 'gGg.gGg.gGg.gGg.', '.g..g..g..g..g..', 'kkk.kkk.kkk.kkk.', 'kkk.kkk.kkk.kkk.'
  ], { g: '#3f9a3a', G: '#7cd25a', k: '#2a2a2a' }, 3);

  // Personagens
  SPR.helena = Pixel.criar(MAPAS.pesquisadora,
    { H: '#5a3a1a', S: pele.a, K: '#111', G: '#444', C: '#5a8a5a', c: '#3a6a3a', P: '#4a4a3a', B: '#3a2a1a' }, 3);
  SPR.jaci = Pixel.criar(MAPAS.humano, { H: '#e8b030', S: pele.c, K: '#111', C: '#3a8a5a', P: '#4a4a3a', B: '#2a2a1a' }, 3);
  SPR.damiao = Pixel.criar(MAPAS.seuZe,
    { H: '#d9b45a', h: '#a8813a', S: pele.b, K: '#111', M: '#ddd', C: '#5a7a3a', R: '#3a5a2a', P: '#5a4a3a', B: '#2a1d12' }, 3);
  SPR.caio = Pixel.criar([
    '...HHHHHH...', '..HHHHHHHH..', '..HSSSSSSH..', '..SSKSSKSS..', '...SSSSSS...', '....SSSS....', '..CCCCCCCC..',
    '.SCCCYYCCCS.', '.SCCCCCCCCS.', '..PPPPPPPP..', '..PPP..PPP..', '..SSS..SSS..', '..BBB..BBB..'
  ], { H: '#2a1a10', S: pele.b, K: '#111', C: '#3a8ad5', Y: '#f2d23a', P: '#3a4a6a', B: '#e0e0e0' }, 3);

  // DEVASTRON: chaminé, visor vermelho, serra de um lado e cano de óleo do outro.
  const robo = [
    '....cc..................',
    '....cc..kkkkkkkk........',
    '....cc.kMMMMMMMMk.......',
    '....cc.kMrrrrrrMk.......',
    '....cc.kMMMMMMMMk.......',
    '..kkkkkkkkkkkkkkkkkk....',
    '.kMMMMMMMMMMMMMMMMMMk...',
    '.kMyKyKyKyKyKyKyKyMMk...',
    '.kMMMMMMMMMMMMMMMMMMk...',
    'ZkMMMMMMoooooMMMMMMMkPP.',
    'ZZMMMMMMoGGGoMMMMMMMkPP.',
    'ZkMMMMMMoooooMMMMMMMk.P.',
    '.kMMMMMMMMMMMMMMMMMMk.d.',
    '.kkkkkkkkkkkkkkkkkkkk...',
    '..kTTTTTTTTTTTTTTTTk....',
    '..kTkTkTkTkTkTkTkTTk....',
    '..kTTTTTTTTTTTTTTTTk....'
  ];
  const corRobo = { c: '#5a5a5a', k: '#1a1a1a', M: '#9aa0a8', r: '#ff2a2a', y: '#f2c230', K: '#2a2a2a', o: '#5a6068',
                    G: '#ff8a2a', Z: '#c8ccd0', P: '#6a5a3a', d: '#1a1a1a', T: '#3a3a3a' };
  SPR.robo = Pixel.criar(robo, corRobo, 6);
  SPR.roboMundo = Pixel.criar(robo, corRobo, 5);
}

// Prende um sprite atrás de um aramado (postes e fios).
function aramadoSobre(spr) {
  const c = document.createElement('canvas');
  c.width = spr.width + 18; c.height = spr.height + 8;
  const x = c.getContext('2d');
  x.drawImage(spr, 9, 6);
  x.fillStyle = '#7a5a3a'; x.fillRect(2, 0, 5, c.height); x.fillRect(c.width - 7, 0, 5, c.height);
  x.fillStyle = '#b0b4b8';
  for (const y of [8, 18, 28]) x.fillRect(2, y, c.width - 4, 2);
  // Fio enroscado
  x.strokeStyle = '#d0d4d8'; x.lineWidth = 2;
  x.beginPath(); x.arc(c.width / 2, 22, 7, 0, Math.PI * 2); x.stroke();
  return c;
}

// Paisagem, fauna, gaúchos e o Annoni do Pampa.
function prepararPampa() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  const ambos = (mapa, paleta, escala) => [Pixel.criar(mapa, paleta, escala), Pixel.criar(Pixel.espelhar(mapa), paleta, escala)];

  SPR.umbuPampa = Pixel.criar(mapaArvore({ largura: 28, copaAltura: 10, troncoAltura: 7, troncoLargura: 6, raizes: 3, raizLargura: 2, semente: 61 }),
    { g: '#2f6a2a', G: '#4f8a3a', d: '#1f4a1f', t: '#8a7a6a', T: '#a89a88' }, 3);
  SPR.corticeira = Pixel.criar(mapaArvore({ largura: 18, copaAltura: 8, troncoAltura: 8, troncoLargura: 2, raizes: 1, semente: 71 }),
    { g: '#4a7a3a', G: '#e0302a', d: '#a02020', t: '#7a6a5a', T: '#9a8a76' }, 3);
  SPR.capao = Pixel.criar(mapaArvore({ largura: 22, copaAltura: 11, troncoAltura: 5, troncoLargura: 2, raizes: 1, semente: 83 }),
    { g: '#3a7a32', G: '#5ca04a', d: '#2a5a26', t: '#6b4a2e', T: '#8e6a44' }, 3);
  SPR.butiazeiro = Pixel.criar([
    '.....b.b.b......',
    '..b..b.b.b..b...',
    'b..bbBbbbBbb..b.',
    '.bbBbbbBbbbBbb..',
    'bBbbBbbbbbBbbBb.',
    '.b.bbBbobbBbb.b.',
    'b..b.bboob.b..b.',
    '......ooo.......',
    '.......tt.......',
    '.......TT.......',
    '.......tt.......',
    '.......TT.......',
    '.......tt.......',
    '.......TT.......',
    '.......tt.......',
    '......tttt......'
  ], { b: '#6a9a9a', B: '#9ac0b8', o: '#f0a020', t: '#7a6a5a', T: '#5a4a3a' }, 3);
  SPR.cerca = Pixel.criar([
    'pp..............',
    'pwwwwwwwwwwwwwww',
    'pp..............',
    'pp..............',
    'pwwwwwwwwwwwwwww',
    'pp..............',
    'pp..............',
    'pwwwwwwwwwwwwwww',
    'pp..............',
    'pp..............'
  ], { p: '#7a5a3a', w: '#b0b4b8' }, 3, null);
  SPR.taipa = Pixel.criar([
    '.pPp.pPPp.pPp.pP',
    'pPPPpPPPPpPPPpPP',
    'PPpPPPpPPPPpPPPp',
    'pPPPPpPPPpPPPPpP',
    'PPPpPPPPpPPPpPPP',
    'pPPPPPpPPPPPPpPP'
  ], { P: '#a8a29a', p: '#6e6a64' }, 3);
  SPR.touceira = Pixel.criar([
    's..s.s..s.',
    '.g.g.g.g..',
    'g.ggggg.g.',
    '.gGgGgGg..',
    'gGgGgGgGg.',
    '.ggggggg..'
  ], { s: '#d8d0b0', g: '#6a7a5a', G: '#8f9e78' }, 3);

  // Estância
  SPR.galpao = Pixel.criar([
    '..........rrrrrrrrrrrrrrrr..........',
    '........rrRRRRRRRRRRRRRRRRrr........',
    '......rrRRRRRRRRRRRRRRRRRRRRrr......',
    '....rrRRRRRRRRRRRRRRRRRRRRRRRRrr....',
    '..rrRRRRRRRRRRRRRRRRRRRRRRRRRRRRrr..',
    'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
    '.mMmMmMmMmMmMmMmMmMmMmMmMmMmMmMmMm.',
    '.mMmMmMmMmMmMmMmMmMmMmMmMmMmMmMmMm.',
    '.mMmMddddddMmMmMmMmMmMmMmMwwwwmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMwbbwmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMwbbwmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMwwwwmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMmMmMmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMmMmMmMmM.',
    '.mMmMdkkkkdMmMmMmMmMmMmMmMmMmMmMmM.'
  ], { r: '#7a2a1a', R: '#a8402a', m: '#8a6a44', M: '#a88458', d: '#5a3a1e', k: '#2a1a0e', w: '#5a3a1e', b: '#f2d07a' }, 3);
  SPR.chaleira = Pixel.criar(['..kkk...', '.kkkkk.k', 'kkkkkkkk', 'kkkkkkk.', '.kkkkk..'], { k: '#2a2a2a' }, 3, '#555');
  const cuia = ['...s.', '.ccsc', 'cCccc', 'ccccc', '.ccc.'];
  SPR.cuia = Pixel.criar(cuia, { c: '#6a7a3a', C: '#8a9a4a', s: '#d0d0d0' }, 3);
  SPR.butiaItem = Pixel.criar(['..n.n...', '.oOo.oo.', 'oOooOoo.', '.ooOooo.', '..ooo...'], { o: '#f0a020', O: '#ffd060', n: '#5a7a2a' }, 3);

  // Fauna e criação
  Object.assign(SPR.fauna, {
    ema: ambos([
      '....gg......', '...gggk.....', '....gg......', '....gg......', '....gg......', '....gg......',
      '..gggggggg..', '.gGgGgGgGgg.', 'gGgGgGgGgGgg', '.gggggggggg.', '...gggggg...',
      '....y..y....', '....y..y....', '....y..y....', '...yy..yy...'
    ], { g: '#8a8a80', G: '#a8a89e', k: '#e0c070', y: '#c8b080' }, 3),
    queroquero: ambos([
      '..kk.....', '.kggg....', '.gGrgy...', '..gggg...', '.kkkkk...', 'gwwwwwgg.', '.wwwwwgg.', '..r..r...', '..r..r...'
    ], { g: '#9a9a90', G: '#c8c8c0', k: '#1a1a1a', w: '#f4f4f0', r: '#d9603a', y: '#e8b030' }, 3),
    joao: ambos([
      '..nnnn....', '.nnnnnn...', 'nnnoonnn..', 'nnnoonnn..', 'nnnnnnnn..', '....pp..b.', '....pp.bbb',
      '....pp.bB.', '....pp....', '....pp....', '....pp....', '...pppp...'
    ], { n: '#a8703a', o: '#3a2210', p: '#7a5a3a', b: '#a8784a', B: '#e8d0a0' }, 3),
    graxaim: ambos([
      '...........k.', '..........ggk', '.........gggg', '..gggggggggwgn', '.gggggggggggg.', 'ggg.ggggggg...', 'gg..g.g..g.g..', '....k.k..k.k..'
    ], { g: '#8a8478', w: '#e8e0d0', k: '#2a2a2a', n: '#1a1a1a' }, 3),
    gatopalheiro: ambos([
      '.........k.k', '.........ggg', '........gkgk', '..ggSgSgggg.', '.ggggggggg..', 'g.gSggSgg...', 'g..g.g.g.g..'
    ], { g: '#c8b48a', S: '#6a5a3a', k: '#2a2a2a' }, 3),
    cardeal: ambos([
      '..kk...', '.kkk...', '.yyky..', '.yyyyo.', 'yyyyyy.', '.gyyyy.', '..gyy..', '..k.k..'
    ], { y: '#f2d23a', k: '#1a1a1a', g: '#5a6a3a', o: '#3a3a3a' }, 3),
    vaca: ambos([
      '.............ww.', '..rrrrrrrrrrwwww', '.rrrrrrrrrrrwkww', 'rrrrrrrrrrrrwwwn', 'wrrrrrwwwrrrrww.',
      '.rrrrrrrrrrrr...', '.rr.rr...rr.rr..', '.kk.kk...kk.kk..'
    ], { r: '#9a3a1e', w: '#f4f0e8', k: '#2a1a0e', n: '#d98a8a' }, 3),
    ovelha: ambos([
      '..wWwWwW....', '.wWwWwWwWkk.', 'wWwWwWwWwkek', 'wWwWwWwWwkk.', '.wWwWwWwW...', '..k.k..k.k..', '..k.k..k.k..'
    ], { w: '#f4f0e4', W: '#dcd6c8', k: '#2a2a2a', e: '#e8e0d0' }, 3),
    cavalo: ambos([
      '............m..', '...........mbb.', '..........mbbbb', '..........bbkbn', '..........bbb..', '.mbbbbbbbbbbb..',
      'mbbbbbbbbbbbb..', 'm.bbbbbbbbbb...', '..bbbbbbbbbb...', '..b.b....b.b...', '..b.b....b.b...', '..k.k....k.k...'
    ], { b: '#8a5a2e', m: '#2a1a0e', k: '#1a1a1a', n: '#1a1a1a' }, 3)
  });

  // Filhote de veado-campeiro (com pintinhas) preso no aramado.
  const veado = [
    '..........kk..', '.........oook.', '.........okoon', '.........ooo..', '..owowooooo...', '.oooooooooo...',
    'woooowwwwoo...', '.ooooooooo....', '..o.o...o.o...', '..o.o...o.o...', '..k.k...k.k...'
  ];
  SPR.veadoPreso = aramadoSobre(Pixel.criar(Pixel.espelhar(veado), { o: '#c8935a', w: '#f4ead8', k: '#3a2a1a', n: '#1a1a1a' }, 3));
  SPR.veadoLivre = Pixel.criar(veado, { o: '#c8935a', w: '#f4ead8', k: '#3a2a1a', n: '#1a1a1a' }, 3);

  // Gaúchos
  SPR.tonho = Pixel.criar([
    '...HHHHHH...', '..HHHHHHHH..', 'HHHHHHHHHHHH', '...SSSSSS...', '...SKSSKS...', '...SMMMMS...', '....RRRR....',
    '..CCRRRRCC..', '.CCCCRRCCCC.', '.SCCCCCCCCS.', '.SCCCCCCCCS.', '..LLLYLLLL..', '.PPPPPPPPPP.', 'PPPPP..PPPPP',
    '.PPP....PPP.', '.BBB....BBB.', '.BBB....BBB.'
  ], { H: '#1a1a1a', S: pele.a, K: '#111', M: '#5a3a1a', R: '#c8322c', C: '#f4f0e8', L: '#5a3a1e', Y: '#d0b060', P: '#a8906a', B: '#2a1a0e' }, 3);
  SPR.prenda = Pixel.criar([
    '...HHHHHH...', '..HHHHHHHH..', '..HHrHHHHH..', '..HSSSSSSH..', '..HSKSSKSH..', '..HSSSSSSH..', '..H.SSSS.H..',
    '...DDDDDD...', '..DDDDDDDD..', '.SDDDDDDDDS.', '.SDDwDDwDDS.', '..DDDDDDDD..', '.DDDDDDDDDD.', 'DDwDDwDDwDDD',
    'DDDDDDDDDDDD', '.wwwwwwwwww.', '...BB..BB...'
  ], { H: '#6b3a1a', r: '#d9302c', S: pele.b, K: '#111', D: '#e89ab8', w: '#ffffff', B: '#3a2a1a' }, 3);
  SPR.guarda = Pixel.criar(MAPAS.humano,
    { H: '#4a5a2a', S: pele.c, K: '#111', C: '#8a8a5a', P: '#5a5a3a', B: '#2a2a1a' }, 3);

  // Annoni: uma touceira de capim invasor com cara de poucos amigos.
  const annoni = [
    '...s....s...s....s..', '..s.s..s.s.s.s..s.s.', '...g....g...g....g..', '..g.g..gg..g.g..g...',
    '.g...g.g.gg...g.g...', '..g..gggggg..g.g....', 'g.gggGGGGGGgggg..g..', '.ggGGGGGGGGGGGgg.g..',
    '..GGGkkGGGGkkGGGg...', '.gGGwwkGGGGwwkGGGg..', '.gGGwkkGGGGwkkGGGg..', '.gGGGGGGGGGGGGGGGg..',
    '..gGGGkGGGGGkGGGg...', '..gGGGGkkkkkGGGGg...', '...gGGGGGGGGGGGg....', '....ggGGGGGGGgg.....',
    '.....gggggggg.......', '....bbb.bb.bbb......', '...b..b.b..b..b.....'
  ];
  const corAnnoni = { s: '#d8d0b0', g: '#6a7a5a', G: '#8f9e78', k: '#1a1a1a', w: '#fff', b: '#7a5a3a' };
  SPR.annoni = Pixel.criar(annoni, corAnnoni, 6);
  SPR.annoniMundo = Pixel.criar(annoni, corAnnoni, 3);
}

// Coloca um sprite dentro de uma gaiola.
function gaiolaCom(spr) {
  const c = document.createElement('canvas');
  c.width = spr.width + 16; c.height = spr.height + 22;
  const x = c.getContext('2d');
  x.drawImage(spr, 8, 14);
  x.fillStyle = '#c8ccd0';
  for (let i = 3; i < c.width - 2; i += 7) x.fillRect(i, 10, 2, c.height - 14);
  x.fillRect(1, 10, c.width - 2, 3); x.fillRect(1, c.height - 5, c.width - 2, 3);
  x.fillRect(c.width / 2 - 1, 2, 2, 8); x.fillRect(c.width / 2 - 5, 1, 10, 2);
  x.fillStyle = '#5a5e62'; x.fillRect(1, c.height - 2, c.width - 2, 2);
  return c;
}

// Plantas, pedras, fauna, personagens e o Zé Arapuca da Caatinga.
function prepararCaatinga() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  const ambos = (mapa, paleta, escala) => [Pixel.criar(mapa, paleta, escala), Pixel.criar(Pixel.espelhar(mapa), paleta, escala)];

  SPR.xiquexique = Pixel.criar([
    '.....g.....',
    '....gwg....',
    '.g..gGg..g.',
    'gwg.ggg.gwg',
    'gGg.gGw.gGg',
    'ggw.ggg.ggg',
    'gGgggGgggGg',
    '.ggggGgwgg.',
    '....ggg....',
    '....gGg....',
    '....ggg....'
  ], { g: '#5f8a5a', G: '#86b07a', w: '#f0e8c8' }, 3);
  SPR.coroa = Pixel.criar([
    '..rrrr..',
    '.rRrrRr.',
    '.gGgGgg.',
    'gGgGgGgg',
    'gGgGgGgg',
    '.gGgGgg.',
    '..gggg..'
  ], { r: '#c0303a', R: '#ff6070', g: '#4f7a4a', G: '#7aa06a' }, 3);
  SPR.umbuzeiro = Pixel.criar(mapaArvore({ largura: 26, copaAltura: 8, troncoAltura: 7, troncoLargura: 3, raizes: 1, semente: 31 }),
    { g: '#6f8a4a', G: '#9ab06a', d: '#c8c84a', t: '#7a6a5a', T: '#9a8a76' }, 3);
  SPR.juazeiro = Pixel.criar(mapaArvore({ largura: 20, copaAltura: 11, troncoAltura: 7, troncoLargura: 3, raizes: 1, semente: 41 }),
    { g: '#3f8a35', G: '#6cc050', d: '#2a6a28', t: '#6b5a4a', T: '#8a7866' }, 3);
  SPR.caraibeira = Pixel.criar(mapaArvore({ largura: 18, copaAltura: 9, troncoAltura: 9, troncoLargura: 2, raizes: 1, semente: 53 }),
    { g: '#e8c020', G: '#ffe060', d: '#c09010', t: '#7a6a5a', T: '#9a8a76' }, 3);
  SPR.pedra = Pixel.criar([
    '....pppppp......',
    '..ppPPPPPPpp....',
    '.pPPPPPPPPPPpp..',
    'pPPPPPPPPPPPPPp.',
    'pPPPPPPPPPPPPPPp',
    'pPPPPPdPPPPPPPPp',
    '.pPPPPPPPPPPPPp.',
    '..pppppppppppp..'
  ], { P: '#b0aaa0', p: '#6e6a64', d: '#8a857e' }, 3);

  Object.assign(SPR.fauna, {
    tatubola: ambos([
      '...AaAaA....',
      '..AaAaAaAa..',
      '.AaAaAaAaAah',
      'AaAaAaAaAahk',
      '.ff....ff...'
    ], { A: '#c8b07a', a: '#8f7a4a', h: '#d8c08a', k: '#2a2a2a', f: '#6a5a3a' }, 3),
    lear: ambos([
      '...BBB...',
      '..BByBk..',
      '..BBBkk..',
      '.BBBBB...',
      'BBBBBB...',
      'BBBBBB...',
      '.BBBBB...',
      '..BBB....',
      '..BB.....',
      '..B......',
      '.BB......'
    ], { B: '#2a4f9e', y: '#f2d23a', k: '#222' }, 3),
    soldadinho: ambos([
      '.rrrr..',
      'rrrrrrr',
      '.wkwww.',
      '.wwwww.',
      'kwwwwwk',
      '.kwwwk.',
      '..k.k..'
    ], { r: '#e0302a', w: '#f4f4f0', k: '#1a1a1a' }, 3),
    asabranca: ambos([
      '......gg.',
      '.....gggk',
      '.gggggggg',
      'ggwwwgggg',
      '.ggwwggg.',
      '...k.k...'
    ], { g: '#8a7e72', w: '#f4f4f0', k: '#3a2a22' }, 3),
    moco: ambos([
      '.......ee.',
      '..ooooooook',
      '.ooooooooo',
      'oooooooooo',
      '.oo....oo.'
    ], { o: '#8a7a6a', e: '#6a5a4a', k: '#1a1a1a' }, 3),
    calango: ambos([
      '........ggk.',
      'gggggGgGggg.',
      '..g.g..g.g..'
    ], { g: '#7a8a4a', G: '#4a5a2a', k: '#1a1a1a' }, 3)
  });

  // Passarinhos traficados: soltos (fauna) e presos (gaiolas).
  const galo = ['.rr...', 'rrrr..', 'rkrrk.', '.wwww.', 'wwwwww', '.kwwk.'];
  const canario = ['.yy...', 'yyyy..', 'ykyyo.', '.yyyy.', 'yyyyyy', '.kyyk.'];
  const corGalo = { r: '#d9302c', k: '#1a1a1a', w: '#c8c8c8' }, corCanario = { y: '#f2d23a', k: '#1a1a1a', o: '#e08a2a' };
  SPR.fauna.galo = ambos(galo, corGalo, 3);
  SPR.fauna.canario = ambos(canario, corCanario, 3);
  SPR.gaiolaGalo = gaiolaCom(Pixel.criar(galo, corGalo, 3));
  SPR.gaiolaCanario = gaiolaCom(Pixel.criar(canario, corCanario, 3));
  SPR.ararinhaPresa = gaiolaCom(SPR.comp.arara.dir[0]);

  SPR.caminhonete = Pixel.criar([
    '...............wwwwww..',
    '..............wbbbbbbw.',
    '.............wbbbbbbbbw',
    'RRRRRRRRRRRRRRRRRRRRRRR',
    'RgGgGgGgGgRRRRRRRRRRRRR',
    'RgyGgrGgyGRRRRRRRRRRRRL',
    'RRRRRRRRRRRRRRRRRRRRRRR',
    '.KKK..............KKK..',
    '.KkK..............KkK..'
  ], { R: '#9a4a2a', w: '#5a2a1a', b: '#bfe3f0', g: '#c8ccd0', G: '#8a8e92', y: '#f2d23a', r: '#d9302c', K: '#1a1a1a', k: '#777', L: '#ffe680' }, 3);

  SPR.umbuItem = Pixel.criar([
    '...n.n...',
    '..yYy.yy.',
    '.yYyyyYy.',
    '.yyyYyyy.',
    '..yyyyy..'
  ], { y: '#b8c84a', Y: '#e0e88a', n: '#5a7a2a' }, 3);

  // Personagens
  SPR.biologa = Pixel.criar(MAPAS.pesquisadora,
    { H: '#2a1a10', S: pele.b, K: '#111', G: '#333', C: '#c9b07a', c: '#a8905a', P: '#5a5a4a', B: '#3a2a1a' }, 3);
  SPR.zefa = Pixel.criar(MAPAS.humano,
    { H: '#f2d23a', S: pele.c, K: '#111', C: '#4a9a5a', P: '#3a7a4a', B: '#7a4a2a' }, 3);
  SPR.vaqueiro = Pixel.criar([
    '..HHHHHHHH..',
    '.HHhHHHHhHH.',
    'HHHHHHHHHHHH',
    '...SSSSSS...',
    '...SKSSKS...',
    '...SSSSSS...',
    '...HSSSSH...',
    '..CCRCCRCC..',
    '.CCRCCCCRCC.',
    '.SCCCRRCCCS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..BBB..BBB..',
    '..BBB..BBB..'
  ], { H: '#6b4020', h: '#4a2a14', S: pele.b, K: '#111', C: '#8a5a2e', R: '#c08a4e', P: '#6b4a2a', B: '#3a2416' }, 3);

  // Zé Arapuca: chapéu de palha, colete e uma gaiola na mão.
  const ze = [
    '.....HHHHHH.........',
    '....HhHHHHhH........',
    '..HHHHHHHHHHHH......',
    '....SSSSSSSS........',
    '....SKSSSSKS........',
    '....SSSSSSSS........',
    '....SSKWWKSS........',
    '.....SSSSSS.........',
    '...VVVCCCCVVV.......',
    '..VVVVCCCCVVVV.ggg..',
    '..VVVVCCCCVVVVSgbgg.',
    '..VVVVCCCCVVVVSgbbg.',
    '..SVVVCCCCVVVV.gggg.',
    '..S.VVCCCCVV........',
    '....PPPPPPPP........',
    '....PPP..PPP........',
    '....PPP..PPP........',
    '...BBBB..BBBB.......'
  ];
  const corZe = { H: '#d9b45a', h: '#a8813a', S: '#d9a07a', K: '#111', W: '#fff', V: '#6b5a3a', C: '#e8e0c8',
                  g: '#c8ccd0', b: '#2a7ad5', P: '#4a4a3a', B: '#3a2416' };
  SPR.ze = Pixel.criar(ze, corZe, 6);
  SPR.zeMundo = Pixel.criar(ze, corZe, 3);
}

// Gera o mapa de caracteres de uma árvore: copa oval, tronco e raízes.
function mapaArvore(o) {
  let s = o.semente || 7;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const w = o.largura, linhas = [];
  for (let y = 0; y < o.copaAltura; y++) {
    let l = '';
    for (let x = 0; x < w; x++) {
      const dx = (x - (w - 1) / 2) / (w / 2), dy = (y - (o.copaAltura - 1) / 2) / (o.copaAltura / 2);
      if (dx * dx + dy * dy < 1 - rnd() * 0.18) l += rnd() < 0.22 ? 'G' : (rnd() < 0.1 ? 'd' : 'g');
      else l += '.';
    }
    linhas.push(l);
  }
  // Cipós pendurados
  if (o.cipos) for (let k = 0; k < o.cipos; k++) {
    const x = 2 + Math.floor(rnd() * (w - 4)), comp = 3 + Math.floor(rnd() * 6);
    for (let y = o.copaAltura - 2; y < o.copaAltura - 2 + comp; y++) {
      while (linhas.length <= y) linhas.push('.'.repeat(w));
      const l = linhas[y]; if (l[x] === '.') linhas[y] = l.slice(0, x) + 'v' + l.slice(x + 1);
    }
  }
  const tx = Math.floor((w - o.troncoLargura) / 2);
  const inicio = o.copaAltura - 1;
  for (let i = 0; i < o.troncoAltura; i++) {
    const y = inicio + i;
    const extra = Math.max(0, i - (o.troncoAltura - o.raizes - 1)) * (o.raizLargura || 1);
    const a = Math.max(0, tx - extra), b = Math.min(w, tx + o.troncoLargura + extra);
    while (linhas.length <= y) linhas.push('.'.repeat(w));
    let l = linhas[y].split('');
    for (let x = a; x < b; x++) l[x] = (x === tx + 1 || (x - a) % 5 === 2) ? 'T' : 't';
    linhas[y] = l.join('');
  }
  return linhas;
}

// Árvores, fauna, personagens e o chefe da Amazônia.
function prepararAmazonia() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  const verde = { g: '#2f7a32', G: '#5cb04a', d: '#1f5424', v: '#3e8f3a', t: '#6b4a2e', T: '#8e6a44' };
  SPR.samauma = Pixel.criar(mapaArvore({ largura: 32, copaAltura: 13, troncoAltura: 20, troncoLargura: 4, raizes: 6, raizLargura: 2, cipos: 4, semente: 11 }), verde, 4);
  SPR.castanheira = Pixel.criar(mapaArvore({ largura: 22, copaAltura: 8, troncoAltura: 22, troncoLargura: 3, raizes: 2, semente: 23 }),
    { ...verde, g: '#3b8a34', G: '#7cc456' }, 3);
  SPR.acai = Pixel.criar([
    '..f....f....f...',
    '...f...f...f....',
    'f...ff.f.ff...f.',
    '.ff..fffff..ff..',
    '...fffffffff....',
    'ff.ffFfffFff.ff.',
    '..ffFf.tt.fFff..',
    '.f.f.a.tt..f.f..',
    'f...aaatt.......',
    '....aaatt.......',
    '.....a.tt.......',
    '.......tt.......',
    '.......tT.......',
    '.......tt.......',
    '.......Tt.......',
    '.......tt.......',
    '.......tt.......',
    '.......tT.......',
    '.......tt.......',
    '.......Tt.......',
    '.......tt.......',
    '......tttt......'
  ], { f: '#3f8a35', F: '#7cc25a', t: '#7a6a4a', T: '#9c8a64', a: '#5a1f5e' }, 3);
  SPR.toco = Pixel.criar([
    '.cyyyyyyc.',
    'cyyoooyyyc',
    'cyyyyyyyyc',
    '.cccccccc.',
    'cccccccccc',
    'cc..cc..cc'
  ], { c: '#5a3a1e', y: '#d9b07a', o: '#a8783e' }, 3);
  SPR.muda = Pixel.criar([
    '..g..g..',
    '.gGg.Gg.',
    '..gGgg..',
    '...gG...',
    '....t...',
    '....t...',
    '..bbbbb.'
  ], { g: '#3f9a3a', G: '#7cd25a', t: '#6b4a2e', b: '#5a3a1e' }, 3);
  SPR.toras = Pixel.criar([
    '...ccc..ccc...',
    '..cyyyccyyyc..',
    '..cyoyccyoyc..',
    '..cyyyccyyyc..',
    '.ccc.ccc.ccc..',
    'cyyyccyyyccyyyc',
    'cyoyccyoyccyoyc',
    'cyyyccyyyccyyyc',
    '.ccc..ccc..ccc.'
  ], { c: '#5a3a1e', y: '#d9b07a', o: '#a8783e' }, 3);

  const ambos = (mapa, paleta, escala) => [Pixel.criar(mapa, paleta, escala), Pixel.criar(Pixel.espelhar(mapa), paleta, escala)];
  Object.assign(SPR.fauna, {
    boto: ambos([
      '......PPPP....',
      '....PPPPPPPP..',
      '...PPPPPPPPPP.',
      '..PPkPPPPPPPPP',
      'PPPPPPPPPPpppp'
    ], { P: '#f29bb0', p: '#d9768f', k: '#3a1a22' }, 3),
    ariranha: ambos([
      '.............kk.',
      '....ooooooooookk',
      '..oooooooooooooo',
      'oooooooooooowwo.',
      'ooo.ooooooooooo.',
      '.oo..oo....oo...'
    ], { o: '#5a3a22', w: '#efe2c0', k: '#1a120c' }, 3),
    harpia: ambos([
      '..g.g..g.g..',
      '...gggggg...',
      '..gggggggg..',
      '..gKgggKgg..',
      '...ggYYgg...',
      '..kkkkkkkk..',
      '.kwwwwwwwwk.',
      'kkwwwwwwwwkk',
      'kkwwwwwwwwkk',
      'kk.wwwwww.kk',
      'k..wwwwww..k',
      '....wwww....',
      '....y..y....',
      '...yy..yy...'
    ], { g: '#8f949a', K: '#111', Y: '#2a2a2a', k: '#2b2b30', w: '#f2f2ee', y: '#e8c13a' }, 3),
    ararajuba: ambos([
      '...yyy..',
      '..yykyb.',
      '..yyyy..',
      '.yyyyy..',
      'yyyyyyy.',
      'gyyyyyg.',
      'gg.yy.gg',
      '....y...',
      '....y...',
      '...yy...'
    ], { y: '#f5cf1f', g: '#3f9a3a', k: '#111', b: '#e8e0c8' }, 3),
    sauim: ambos([
      '...kkk....',
      '..kkkkk...',
      '..kekek...',
      '..kkkkk...',
      '.wwwwwww..',
      '.wwwwwww..',
      '..ooooo...',
      '..ooooo..o',
      '..o...o..o',
      '.oo...oo.o',
      '.........o'
    ], { k: '#1a1a1a', e: '#e8d8a8', w: '#f4f1e6', o: '#7a5434' }, 3)
  });

  // Filhote de peixe-boi (fica dentro de uma poça barrenta).
  const peixeboi = [
    '..gggggggg......',
    '.gggggggggggg...',
    'gkgggggggggggg.g',
    'gggggggggggggggg',
    '.gggggggggggggg.',
    '..gg.......gg...'
  ];
  const corPeixeboi = { g: '#7d8890', k: '#1a1a1a' };
  SPR.peixeboi = Pixel.criar(peixeboi, corPeixeboi, 3);
  SPR.peixeboiEsq = Pixel.criar(Pixel.espelhar(peixeboi), corPeixeboi, 3);

  SPR.acaiItem = Pixel.criar([
    '...n....',
    '..nnn...',
    '.aAaAa..',
    'aAaaaAa.',
    '.aaAaaa.',
    '..aaAa..',
    '...aa...'
  ], { a: '#4a1a50', A: '#8a4a90', n: '#4a7a2a' }, 3);

  // Personagens
  SPR.marina = Pixel.criar(MAPAS.pesquisadora,
    { H: '#b8622a', S: pele.a, K: '#111', G: '#444', C: '#6b8f4a', c: '#4f6f36', P: '#5a4a3a', B: '#3a2a1a' }, 3);
  SPR.kaua = Pixel.criar([
    '....HHHH....',
    '...HHHHHH...',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '..HSKSSKSH..',
    '...SSSSSS...',
    '....SSSS....',
    '..CRYRYRYC..',
    '.CCCRYRYCCC.',
    '.SCCCCCCCCS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..SSS..SSS..',
    '..SSS..SSS..'
  ], { H: '#111', S: pele.c, K: '#111', C: '#2f7a5a', R: '#c0392b', Y: '#2a1a10', P: '#3b4a6b' }, 3);
  SPR.raimundo = Pixel.criar(MAPAS.seuZe,
    { H: '#d9b45a', h: '#a8813a', S: pele.c, K: '#111', M: '#2a2a2a', C: '#e8e0c8', R: '#c8b896', P: '#5a6a7a', B: '#2a1d12' }, 3);

  // O chefe: Seu Derruba, com chapéu, corrente de ouro e motosserra.
  const derruba = [
    '......HHHHHH...........',
    '.....HHHHHHHH..........',
    '...HHHHHHHHHHHH........',
    '.....SSSSSSSS..........',
    '.....SKKSSKKS..........',
    '.....SWKSSWKS..........',
    '.....SSSSSSSS..........',
    '.....SMMMMMMS..........',
    '......SSSSSS...........',
    '....CCCCOOCCCC.........',
    '...CCCCCOOCCCCC........',
    '..CCCCCCOOCCCCCC.......',
    '..CCCCCCCCCCCCCSLLLZZZZ',
    '..SCCCCCCCCCCCCSLLLZZZZ',
    '..SCCCCCCCCCCCC.LL.....',
    '...CCCCCCCCCCC.........',
    '...BBBBBYBBBBB.........',
    '...PPPPPPPPPPP.........',
    '...PPPPP.PPPPP.........',
    '...PPPP...PPPP.........',
    '...PPPP...PPPP.........',
    '..KKKKK...KKKKK........'
  ];
  const corDerruba = { H: '#7a4a24', S: '#e0a07a', K: '#1a1a1a', W: '#fff', M: '#3a2a1a', C: '#c94a3a', O: '#ffcc33',
                       L: '#f07a1a', Z: '#b8c0c8', B: '#3a2416', Y: '#ffcc33', P: '#3b5a8a' };
  SPR.derruba = Pixel.criar(derruba, corDerruba, 6);
  SPR.derrubaMundo = Pixel.criar(derruba, corDerruba, 3);
}

// Personagens e objetos da missão do Pantanal.
function prepararMissaoPantanal() {
  const pele = { a: '#f0c39a', b: '#c68a5e', c: '#8d5a3b' };
  // Dona Benê: lenço na cabeça e vestido.
  SPR.pescadora = Pixel.criar(MAPAS.humano,
    { H: '#d94f4f', S: pele.b, K: '#111', C: '#5aa0c8', P: '#4a8ab0', B: '#7a4a2a' }, 3);
  // Seu Tião: chapéu de couro e lenço vermelho no pescoço.
  SPR.peao = Pixel.criar([
    '....HHHH....',
    '...HhHHhH...',
    'HHHHHHHHHHHH',
    '...SSSSSS...',
    '...SKSSKS...',
    '...SMMMMS...',
    '....RRRR....',
    '..CCRRRRCC..',
    '.CCCCRRCCCC.',
    '.SCCCCCCCCS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PPP..PPP..',
    '..BBB..BBB..',
    '..BBB..BBB..'
  ], { H: '#7a4a24', h: '#5a3418', S: pele.b, K: '#111', M: '#3a2a1a', R: '#c8322c', C: '#efe6d2', P: '#3b4a6b', B: '#4a2e17' }, 3);
  // Iara: brigadista com uniforme amarelo.
  SPR.iara = Pixel.criar(MAPAS.brigadista,
    { H: '#f0c21a', S: pele.c, K: '#111', C: '#e8b020', R: '#e8e8e8', P: '#4d5a2f', B: '#222' }, 3);
  SPR.bocaiuva = Pixel.criar([
    '....nn....',
    '...n......',
    '..YYY.YY..',
    '.YyYYYyYY.',
    '.YYYYYYYY.',
    '..YYyYYY..',
    '.YYYYYyY..',
    '..YYYYY...'
  ], { Y: '#e8a21a', y: '#ffd76a', n: '#6b4a2a' }, 3);
  // Filhote de tuiuiú: penugem acinzentada, cabeça escura.
  const filhote = [
    '...kk.....',
    '..kkkkkk..',
    '..kkk.....',
    '...kk.....',
    '..wwww....',
    '.wwwwww...',
    'wwwgwwww..',
    'wwgwwwww..',
    '.wwwwww...',
    '..k..k....',
    '.kk.kkk...'
  ];
  const corFilhote = { k: '#2a2a2a', w: '#e2e2da', g: '#b5b5ad' };
  SPR.filhote = Pixel.criar(filhote, corFilhote, 3);
  SPR.filhoteEsq = Pixel.criar(Pixel.espelhar(filhote), corFilhote, 3);
  // Secão: um sol de barro rachado, de óculos escuros.
  const secao = [
    '..y.......y.......y..',
    '...y......y......y...',
    '.......ccccccc.......',
    '.....ccCCCCCCCcc.....',
    'yy..cCCCCkCCCCCCc..yy',
    '...cCCCCCkkCCCCCCc...',
    '..cCCCCCCCkCCCCkCCc..',
    '..cCggggggCggggggCc..',
    'yycCgGggggCgGggggCcyy',
    '..cCCggggCCCggggCCc..',
    '..cCCCCCCCCCCCCCCCc..',
    '..cCkCCCCCCCCCCCCCc..',
    '...cCkkCCCCCkkkkCc...',
    'yy..cCCCkkkkkCCCc..yy',
    '.....ccCCCCCCCcc.....',
    '.......ccccccc.......',
    '...y......y......y...',
    '..y.......y.......y..'
  ];
  const corSecao = { c: '#9a5a2a', C: '#d9924a', k: '#5a3418', y: '#ffcf3f', g: '#1d1d2b', G: '#8fa6ff' };
  SPR.secao = Pixel.criar(secao, corSecao, 6);
  SPR.secaoMundo = Pixel.criar(secao, corSecao, 3);
}

// Carandá (palmeira), tuiuiú, garça-branca e jacaré-do-pantanal.
function prepararPantanal() {
  SPR.palmeira = Pixel.criar([
    '......g.g.g.......',
    '..g...g.g.g...g...',
    '...g..ggggg..g....',
    'g...gggGggggg...g.',
    '.gg.ggGGgGGgg.gg..',
    '..gggGGgggGGggg...',
    'gggGGggGgGggGGggg.',
    '..ggGgggGgggGgg...',
    '.gg.gGGgggGGg.gg..',
    'g..g..gGGGg..g..g.',
    '......ddtdd.......',
    '.......tTt........',
    '.......tTt........',
    '.......ttT........',
    '.......tTt........',
    '.......tTt........',
    '.......Ttt........',
    '.......tTt........',
    '.......tTt........',
    '.......ttT........',
    '.......tTt........',
    '.......tTt........',
    '......ttTtt.......'
  ], { g: '#3f8a35', G: '#7cc25a', d: '#9a7a40', t: '#6e5034', T: '#9c7650' }, 4);
  const tuiuiu = [
    '......kk.......',
    '.....kkkk......',
    '.....kkkkkkkkk.',
    '.....kkk...kkk.',
    '......kk.......',
    '......rr.......',
    '.....wwww......',
    '...wwwwwww.....',
    '..wwwwwwwww....',
    '..wwwwwwwww....',
    '...wwwwwwww....',
    '....wwwwww.....',
    '......k.k......',
    '......k.k......',
    '......k.k......',
    '......k.k......',
    '.....kk.kk.....'
  ];
  const garca = [
    '....ww....',
    '...wkwyyy.',
    '...ww.....',
    '..ww......',
    '..ww......',
    '...ww.....',
    '..wwwww...',
    '.wwwwwww..',
    'wwwwwwww..',
    '.wwwwww...',
    '...k.k....',
    '...k.k....',
    '...k.k....',
    '..kk.kk...'
  ];
  const ambos = (mapa, paleta, escala) => [Pixel.criar(mapa, paleta, escala), Pixel.criar(Pixel.espelhar(mapa), paleta, escala)];
  SPR.fauna = {
    tuiuiu: ambos(tuiuiu, { k: '#151515', r: '#d9302c', w: '#f4f4f0' }, 3),
    garca:  ambos(garca,  { k: '#1a1a1a', y: '#f2c230', w: '#ffffff' }, 3),
    jacare: ambos([...COMP_MAPAS.jacare.corpo, ...COMP_MAPAS.jacare.pernas[0]],
                  { d: '#6d6a3a', k: '#3a3820', y: '#d9cf8f', e: '#ffd23f', w: '#fff' }, 3)
  };
}

// ---------- Companheiros ----------
// Dois quadros (A e B) de caminhada, todos olhando para a direita; o espelho
// é gerado para a esquerda. `voa`: fica no ar; `bolha`: anda dentro de uma bolha d'água.
const COMP_MAPAS = {
  lobo: {
    paleta: { o: '#d9772b', d: '#b85c1e', k: '#1d1410', w: '#f3e6c9' },
    corpo: [
      '............k.k.',
      '............kkkk',
      '............oooo',
      '...........ookoo',
      '........kkkooookk',
      'w.....kkkkkooww.',
      'wo..ooooooooww..',
      '.oooooooooooo...',
      '..ooooooooooo...',
      '..oooddddddoo...'
    ],
    pernas: [
      ['..kk.kk..kk.kk..', '..kk.kk..kk.kk..', '..kk.kk..kk.kk..'],
      ['.kk...kk.kk..kk.', '.kk...kk.kk..kk.', 'kk.....kkk....kk']
    ]
  },
  onca: {
    paleta: { o: '#e8a33a', k: '#2a1a0e', w: '#f6ecd2', p: '#d77a7a' },
    corpo: [
      '............kk...',
      '...........kook..',
      'k.........oooooo.',
      '.o........okooow.',
      '..o.......ooooopk',
      '..ooooooooooooo..',
      '..okoookookoooo..',
      '..ooookooookoo...',
      '..okooooookooo...',
      '..owwwwwwwwwoo...'
    ],
    pernas: [
      ['..oo.oo..oo.oo...', '..oo.oo..oo.oo...'],
      ['.oo...oo.oo..oo..', 'oo.....ooo....oo.']
    ]
  },
  arara: {
    voa: true,
    paleta: { b: '#3a7bd5', B: '#1f4f9e', g: '#9cc0e0', k: '#222' },
    quadros: [[
      '........ggg.',
      '.......ggkgk',
      '.......gggkk',
      '......bbbbk.',
      '.....bbbbb..',
      '...BBBbbbb..',
      '..BBBBbbb...',
      '.BBBbbbb....',
      'BB..bbb.....',
      'B....b.b....'
    ], [
      '........ggg.',
      '..BB...ggkgk',
      '...BBB.gggkk',
      '....BBbbbbk.',
      '.....bbbbb..',
      '.....bbbbb..',
      '....bbbbb...',
      '...bbbbb....',
      '..bb.bbb....',
      '..b...b.b...'
    ]]
  },
  capivara: {
    paleta: { o: '#8a5a35', d: '#5e3b20', k: '#111' },
    corpo: [
      '..........dd....',
      '.........oooooo.',
      '........ooookooo',
      '..oooooooooooood',
      '.ooooooooooooooo',
      'oooooooooooooo..',
      'oooooooooooooo..',
      'ooddddddddddoo..',
      '.oooooooooooo...'
    ],
    pernas: [
      ['.oo.oo....oo.oo.', '.dd.dd....dd.dd.'],
      ['oo...oo..oo...oo', 'dd...dd..dd...dd']
    ]
  },
  pirarucu: {
    bolha: true,
    paleta: { g: '#6f8f6a', r: '#c0392b', k: '#111', w: '#e9e2c6' },
    quadros: [[
      '......gggggg....',
      'rr.rrrrggggggg..',
      '.rrrrrrrgggggkg.',
      '.rrrrrrrgggggggg',
      'rr.rrrrrggggggg.',
      '.......wwwwww...'
    ], [
      '......gggggg....',
      '.r.rrrrggggggg..',
      'rrrrrrrrgggggkg.',
      'rrrrrrrrgggggggg',
      '.r.rrrrrggggggg.',
      '.......wwwwww...'
    ]]
  },
  jacare: {
    paleta: { d: '#2f3b2a', k: '#141a11', y: '#c9b45a', e: '#ffd23f', w: '#fff' },
    corpo: [
      '....k.k.k.k.k.k.......',
      '..ddddddddddddddd.e...',
      'dddddddddddddddddddddd',
      '..dddddddddddddddwdwdd',
      '....yyyyyyyyyyyy......'
    ],
    pernas: [
      ['....dd.dd....dd.dd....'],
      ['...dd...dd..dd...dd...']
    ]
  }
};

function prepararCompanheiros() {
  SPR.comp = {};
  for (const [id, def] of Object.entries(COMP_MAPAS)) {
    const quadros = def.quadros || def.pernas.map(p => [...def.corpo, ...p]);
    const fazer = escala => ({
      dir: quadros.map(q => Pixel.criar(q, def.paleta, escala)),
      esq: quadros.map(q => Pixel.criar(Pixel.espelhar(q), def.paleta, escala))
    });
    SPR.comp[id] = { ...fazer(def.bolha ? 2 : 3), mini: fazer(2), voa: !!def.voa, bolha: !!def.bolha };
  }
}

// Desenha um companheiro com os pés (ou a bolha) em (cx, base).
function desenharCompanheiro(ctx, id, cx, base, quadro, esq, t, mini = false) {
  const c = SPR.comp && SPR.comp[id];
  if (!c) return;
  const conj = mini ? c.mini : c;
  const spr = (esq ? conj.esq : conj.dir)[quadro % 2];
  let y = base - spr.height;
  if (c.voa) y -= (mini ? 6 : 16) + Math.sin(t * 6) * 3;
  if (c.bolha) {
    const r = mini ? 17 : 24, by = base - r - (mini ? 2 : 6) + Math.sin(t * 3) * 3;
    ctx.fillStyle = 'rgba(120,200,255,.35)';
    ctx.beginPath(); ctx.arc(cx, by, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(220,245,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(cx - r * 0.55, by - r * 0.6, 5, 5);
    y = by - spr.height / 2;
  } else if (!mini) {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(cx, base - 2, spr.width * 0.35, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.drawImage(spr, Math.round(cx - spr.width / 2), Math.round(y));
}
