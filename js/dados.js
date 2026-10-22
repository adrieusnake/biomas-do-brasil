// Todo o conteúdo do jogo (textos, missões, mapas) fica aqui,
// separado do código, para facilitar a revisão pedagógica.

const BIOMAS = [
  { nome: 'LABORATÓRIO',    ceu: '#c9d7e3' },
  { nome: 'CERRADO',        ceu: '#bfe6ff', trilha: '#e2c27a' },
  { nome: 'AMAZÔNIA',       ceu: '#87c7b2', trilha: '#6b5434' },
  { nome: 'MATA ATLÂNTICA', ceu: '#9bc7d8', trilha: '#7a5c3a' },
  { nome: 'PAMPA',          ceu: '#b9ddf2', trilha: '#c8a870' },
  { nome: 'CAATINGA',       ceu: '#f5d69a', trilha: '#e0a865' },
  { nome: 'PANTANAL',       ceu: '#b7d9e8', trilha: '#d2b878' }
];

// Posição [coluna, linha] de cada uma das 6 áreas no mapa do bioma.
// Áreas vizinhas (lado a lado) ficam ligadas por uma trilha.
const LAYOUTS = {
  1: [[0,1],[1,1],[2,1],[1,0],[1,2],[2,2]],
  2: [[0,1],[1,1],[2,1],[1,0],[1,2],[0,2]],
  3: [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]], // corrigido: antes havia áreas desconectadas
  4: [[0,0],[1,0],[2,0],[1,1],[2,1],[2,2]],
  5: [[0,0],[1,0],[0,1],[1,1],[2,1],[2,2]],
  6: [[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]]
};

// Coluna do atlas de árvores (arvores.png) e quadros de moita (terreno.png) por bioma.
const VEGETACAO = {
  1: { arvore: 1, moitas: [],       densidade: 0.09 },
  2: { arvore: 0, moitas: [],       densidade: 0.17, amazonia: true },  // rios, árvores e fauna: ver mundo.js
  3: { arvore: 4, moitas: [],       densidade: 0.2, mata: true },  // cachoeiras, araucárias e bromélias: ver mundo.js
  4: { arvore: 1, moitas: [],       densidade: 0.06, pampa: true },  // coxilhas, sangas e estâncias: ver mundo.js
  5: { arvore: 2, moitas: [],       densidade: 0.19, caatinga: true },  // cactos, lajedos e rios secos: ver mundo.js
  6: { arvore: 3, moitas: [],       densidade: 0.08, pantanal: true }  // água, palmeiras e fauna: ver mundo.js
};

// Curiosidades ao interagir com a paisagem do Pantanal.
const FALAS_PANTANAL = {
  baiaSeca: ['A baía secou antes da hora. A lama rachou e os peixes que sobraram estão presos.'],
  agua:     ['O Pantanal é a maior planície alagável do mundo!', 'Na época das cheias, os rios transbordam e a água cobre boa parte do bioma. Na seca, ela baixa e sobram lagoas chamadas BAÍAS.'],
  palmeira: ['Esta palmeira é um CARANDÁ.', 'Ela aguenta ficar com o "pé" dentro d’água durante a cheia. Por isso forma grandes palmeirais no Pantanal.'],
  piuva:    ['Esta árvore é a PIÚVA, o ipê-rosa do Pantanal.', 'Ela floresce na época da seca e pinta a paisagem de rosa!'],
  tuiuiu:   ['Um TUIUIÚ! Ele é a ave-símbolo do Pantanal.', 'Pode passar de 1 metro de altura e faz ninhos enormes no alto das árvores.'],
  garca:    ['Uma GARÇA-BRANCA pescando na beira d’água.', 'Muitas garças se juntam para fazer ninhos no mesmo lugar. Esses lugares se chamam NINHAIS.'],
  jacare:   ['Um JACARÉ-DO-PANTANAL tomando sol. Ele não vai te incomodar se você mantiver distância.', 'Ele já foi muito caçado. Com a proteção da lei, a população voltou a crescer!']
};

// Curiosidades ao interagir com a paisagem da Amazônia.
const FALAS_AMAZONIA = {
  agua:        ['Um IGARAPÉ: é assim que os povos da Amazônia chamam os riozinhos que cortam a floresta.', 'A água é escura porque as folhas que caem se desmancham nela, como um chá!'],
  recuperando: ['O garimpo foi fechado. A água ainda está turva, mas aos poucos a lama assenta e o rio volta a ficar limpo.'],
  garimpo:     ['Esta é a cava do garimpo ilegal. A água ficou barrenta e cheia de lama.', 'O garimpo usa MERCÚRIO, um veneno que contamina os peixes e as pessoas.'],
  samauma:     ['Uma SAMAÚMA, a "rainha da floresta"!', 'Ela pode passar de 50 metros de altura. As raízes enormes, chamadas sapopemas, parecem paredes.'],
  castanheira: ['Uma CASTANHEIRA, árvore que dá a castanha-do-pará.', 'Ela é protegida por lei: é proibido derrubar castanheiras!'],
  acai:        ['Uma palmeira de AÇAÍ.', 'Os cachos de frutinhas roxas são colhidos por quem vive na floresta, sem precisar derrubar a palmeira.'],
  toco:        ['Aqui havia uma árvore enorme. Ela foi derrubada sem autorização.', 'Uma árvore grande da Amazônia pode levar mais de 100 anos para crescer.'],
  muda:        ['Uma muda de árvore, plantada para recuperar a floresta.', 'Replantar ajuda, mas a floresta leva muitos e muitos anos para voltar a ser como era.'],
  boto:        ['Um BOTO-COR-DE-ROSA! É o maior golfinho de rio do mundo.', '⚠ Está EM PERIGO DE EXTINÇÃO por causa da pesca ilegal, da poluição dos rios e das barragens.'],
  ariranha:    ['Uma ARIRANHA, a maior lontra do mundo! Vive em grupos familiares e é ótima nadadora.', '⚠ Está AMEAÇADA DE EXTINÇÃO: foi muito caçada por causa da pele e hoje sofre com rios poluídos.'],
  harpia:      ['Uma HARPIA, também chamada gavião-real. É uma das águias mais fortes do mundo!', '⚠ É VULNERÁVEL À EXTINÇÃO: precisa de árvores muito altas, como a samaúma, para fazer o ninho.'],
  ararajuba:   ['Uma ARARAJUBA! Amarela e verde, ela tem as cores da bandeira do Brasil.', '⚠ É VULNERÁVEL À EXTINÇÃO por causa do desmatamento e do tráfico de animais. Só existe na Amazônia brasileira.'],
  sauim:       ['Um SAUIM-DE-COLEIRA, macaquinho que parece usar uma "coleira" branca.', '⚠ Está CRITICAMENTE EM PERIGO: só vive na região de Manaus, e a cidade cresceu sobre a floresta dele.']
};

// Curiosidades ao interagir com a paisagem da Caatinga.
const FALAS_CAATINGA = {
  agua:        ['Um AÇUDE: um reservatório que guarda a água da chuva para os meses de seca.', 'No sertão, guardar água é questão de sobrevivência!'],
  mandacaru:   ['Um MANDACARU, o cacto símbolo do sertão.', 'Quando ele floresce, o povo do sertão diz que a chuva está chegando!'],
  xiquexique:  ['Um XIQUE-XIQUE, cacto cheio de espinhos que se espalha pelas pedras.', 'Na seca, vaqueiros tiram os espinhos e usam a polpa para alimentar o gado.'],
  coroa:       ['Uma COROA-DE-FRADE: um cacto redondinho com um "chapéu" vermelho.', 'As flores e frutinhos nascem nesse chapéu e alimentam pássaros e lagartos.'],
  umbuzeiro:   ['Um UMBUZEIRO, a "árvore sagrada do sertão".', 'Suas raízes guardam água em "batatas" embaixo da terra. Por isso ele aguenta meses sem chuva!'],
  juazeiro:    ['Um JUAZEIRO. Ele fica verde mesmo na seca mais forte!', 'Sua sombra é o refúgio de gente e de bicho no calor do sertão.'],
  catingueira: ['Uma árvore sem folhas. Ela não morreu: perdeu as folhas para economizar água na seca.', 'Quando a chuva volta, a Caatinga fica verdinha em poucos dias!'],
  caraibeira:  ['Uma CARAIBEIRA, de flores amarelas, na beira do riacho.', 'É nos ocos dessas árvores que a ararinha-azul faz o ninho.'],
  pedra:       ['Um LAJEDO: grandes pedras que aparecem no meio da Caatinga.', 'Nas frestas vivem mocós, lagartos e plantinhas que guardam água.'],
  tatubola:    ['Um TATU-BOLA! Quando se assusta, ele se fecha e vira uma bola perfeita.', '⚠ Está VULNERÁVEL À EXTINÇÃO e só existe no Brasil. Foi o mascote da Copa do Mundo de 2014!'],
  lear:        ['Uma ARARA-AZUL-DE-LEAR! Ela faz ninhos nos paredões de pedra do sertão da Bahia.', '⚠ Está AMEAÇADA DE EXTINÇÃO, principalmente por causa do tráfico de animais.'],
  soldadinho:  ['Um SOLDADINHO-DO-ARARIPE, com seu "capacete" vermelho!', '⚠ Está CRITICAMENTE EM PERIGO: só vive nas matas úmidas da Chapada do Araripe, no Ceará.'],
  asabranca:   ['Uma ASA-BRANCA, a pomba que inspirou a famosa música de Luiz Gonzaga.', 'Quando a seca aperta, ela voa para longe em busca de água e comida.'],
  moco:        ['Um MOCÓ, roedor que mora nas frestas dos lajedos.', 'Ele só existe na Caatinga e sobe nas pedras com muita agilidade!'],
  calango:     ['Um CALANGO tomando sol. Os lagartos da Caatinga aguentam muito calor!', 'Eles comem insetos e ajudam a espalhar sementes de cactos.'],
  galo:        ['Um GALO-DE-CAMPINA livre de novo! Ele é um dos pássaros mais traficados do Nordeste.'],
  canario:     ['Um CANÁRIO-DA-TERRA voando livre! Muitos são capturados por causa do canto bonito.']
};

// Curiosidades ao interagir com a paisagem do Pampa.
const FALAS_PAMPA = {
  agua:        ['Uma SANGA: riacho pequeno que corta o campo.', 'Os banhados e as sangas do Pampa são berçários de peixes, sapos e aves.'],
  umbu:        ['Um UMBU, a árvore solitária do Pampa.', 'O tronco é enorme, mas a madeira é mole como esponja. Sua sombra é o descanso de quem atravessa o campo.'],
  corticeira:  ['Uma CORTICEIRA-DO-BANHADO, de flores vermelhas.', 'Ela gosta de lugares úmidos, perto das sangas e dos banhados.'],
  butiazeiro:  ['Um BUTIAZEIRO! Seus frutinhos amarelos, os butiás, viram suco e geleia.', 'Ele cresce devagar e pode viver centenas de anos.'],
  capao:       ['Um CAPÃO DE MATO: uma ilha de árvores no meio do campo.', 'Os capões são abrigo e sombra para muitos bichos.'],
  cerca:       ['Um ARAMADO: cerca de arame que divide os campos das estâncias.', 'Às vezes os animais silvestres ficam presos nos fios.'],
  taipa:       ['Uma TAIPA: muro de pedras empilhadas, construído há muito tempo para dividir os campos.', 'Muitas taipas do Pampa têm mais de cem anos!'],
  annoni:      ['Uma touceira de CAPIM-ANNONI, planta invasora vinda da África.', 'O gado quase não come, e ela vai tomando o lugar dos capins nativos.'],
  ema:         ['Uma EMA, a maior ave do Brasil! Ela não voa, mas corre muito rápido.', 'Curiosidade: é o macho quem choca os ovos e cuida dos filhotes.'],
  queroquero:  ['Um QUERO-QUERO, ave símbolo do Rio Grande do Sul!', 'Ele grita "quero-quero!" bem alto para proteger o ninho. É o sentinela dos pampas.'],
  joao:        ['Um JOÃO-DE-BARRO e sua casinha em forma de forno, feita de barro e palha!', 'O casal constrói a casa juntinho, em cima de postes e árvores.'],
  graxaim:     ['Um GRAXAIM, parente das raposas.', 'Ele sai mais à noite e come de tudo: frutas, insetos e pequenos animais.'],
  gatopalheiro:['Um GATO-PALHEIRO, gato selvagem pequeno do campo.', '⚠ Está AMEAÇADO DE EXTINÇÃO porque o campo nativo está sumindo.'],
  cardeal:     ['Um CARDEAL-AMARELO, com seu topete preto!', '⚠ Está EM PERIGO DE EXTINÇÃO, principalmente por causa do tráfico de aves.'],
  vaca:        ['Gado pastando no campo nativo.', 'Quando o pastoreio é bem feito, o gado ajuda a manter o Pampa conservado!'],
  ovelha:      ['Ovelhas! Da lã delas se faz o PONCHO, que protege o gaúcho do frio do minuano.'],
  cavalo:      ['Um CAVALO CRIOULO, raça forte e resistente.', 'É o companheiro do gaúcho na lida do campo e nos desfiles da Semana Farroupilha.']
};

// Curiosidades ao interagir com a paisagem da Mata Atlântica.
const FALAS_MATA = {
  agua:         ['Um rio de água limpinha da Mata Atlântica.', 'A floresta protege as nascentes: é daqui que vem a água de muitas cidades.'],
  poluida:      ['O rio está coberto de óleo e lixo do Devastron.', 'Poluição mata os peixes e estraga a água que as cidades bebem.'],
  recuperando:  ['A água ainda está escura, mas sem o óleo novo ela vai se limpar aos poucos.'],
  cachoeira:    ['Uma CACHOEIRA! A água desce das serras cobertas de floresta.', 'Sem a mata em volta, a terra desce junto com a chuva e suja os rios.'],
  araucaria:    ['Uma ARAUCÁRIA, o pinheiro-do-paraná. É ela que dá o pinhão!', '⚠ Está CRITICAMENTE EM PERIGO: restou muito pouco das florestas de araucária.'],
  jucara:       ['Uma palmeira JUÇARA.', '⚠ Está AMEAÇADA porque cortam a palmeira inteira para tirar o palmito. Os frutos, porém, podem ser colhidos sem derrubá-la!'],
  paubrasil:    ['Um PAU-BRASIL, a árvore que deu nome ao Brasil!', '⚠ Está AMEAÇADO DE EXTINÇÃO. Sua madeira já foi levada em grande quantidade para a Europa.'],
  quaresmeira:  ['Uma QUARESMEIRA, cheia de flores roxas!', 'Ela costuma florir na época da Quaresma, por isso tem esse nome.'],
  samambaiacu:  ['Um SAMAMBAIAÇU: parece uma palmeira, mas é uma samambaia gigante!', 'As samambaias existem desde antes dos dinossauros.'],
  embauba:      ['Uma EMBAÚBA, de folhas prateadas.', 'Ela cresce rápido em clareiras e é a árvore preferida das preguiças!'],
  toco:         ['Aqui havia uma árvore da Mata Atlântica. O Devastron derrubou.', 'Cada árvore derrubada é casa a menos para os bichos.'],
  muda:         ['Uma muda plantada pelo Reflorestron!', 'Em alguns anos, aqui vai ser floresta de novo.'],
  muriqui:      ['Um MURIQUI, o maior macaco das Américas! Ele é muito pacífico e vive em grupos.', '⚠ Está EM PERIGO DE EXTINÇÃO por causa do desmatamento e da caça.'],
  preguica:     ['Uma PREGUIÇA-DE-COLEIRA, com sua "gola" escura!', '⚠ É VULNERÁVEL À EXTINÇÃO e só existe na Mata Atlântica.'],
  jacutinga:    ['Uma JACUTINGA! Ela come os frutos da palmeira juçara e espalha as sementes.', '⚠ Está EM PERIGO DE EXTINÇÃO por causa da caça e da perda da floresta.'],
  tucano:       ['Um TUCANO-DE-BICO-VERDE! Com esse bico enorme, ele alcança frutas na ponta dos galhos.'],
  saira:        ['Uma SAÍRA-SETE-CORES, um dos pássaros mais coloridos do Brasil!', 'Ela só vive na Mata Atlântica.'],
  sapinho:      ['Um SAPINHO-PINGO-DE-OURO! Ele é menor que uma unha.', 'Vive no chão da floresta, entre as folhas, e só existe na Mata Atlântica.'],
  onca:         ['Uma ONÇA-PINTADA! Na Mata Atlântica restam poucas.', '⚠ Aqui ela está CRITICAMENTE AMEAÇADA, porque a floresta virou pedacinhos.']
};

const COMPANHEIROS = [
  { id: 'lobo',     nome: 'Lobo-guará',    emoji: '🐺', bonus: 'Semente veloz: você se move mais rápido nas batalhas.',
    falas: ['(O lobo-guará abana o rabo.)', 'Sabia? O lobo-guará é onívoro: come frutas, como a lobeira, e pequenos animais.'] },
  { id: 'onca',     nome: 'Onça-pintada',  emoji: '🐆', bonus: 'Coragem: suas boas ações acalmam mais.',
    falas: ['(A onça-pintada se espreguiça.)', 'Sabia? A onça-pintada é o maior felino das Américas. E ela adora nadar!'] },
  { id: 'arara',    nome: 'Ararinha-azul', emoji: '🦜', bonus: 'Olhar atento: marca com ★ as melhores ações.',
    falas: ['(A ararinha-azul pousa no seu ombro.)', 'Sabia? A ararinha-azul chegou a desaparecer da natureza. Em 2022, algumas voltaram a voar livres na Caatinga!'] },
  { id: 'capivara', nome: 'Capivara',      emoji: '🦫', bonus: 'Calma de capivara: você começa com mais PV.',
    falas: ['(A capivara mastiga um capim, tranquila.)', 'Sabia? A capivara é o maior roedor do mundo e consegue ficar alguns minutos debaixo d’água!'] },
  { id: 'pirarucu', nome: 'Pirarucu',      emoji: '🐟', bonus: 'Escamas fortes: você recebe menos dano.',
    falas: ['(O pirarucu faz bolhinhas dentro da bolha d’água.)', 'Sabia? O pirarucu é um dos maiores peixes de água doce do mundo e sobe à superfície para respirar ar!'] },
  { id: 'jacare',   nome: 'Jacaré-açu',    emoji: '🐊', bonus: 'Paciência: fica protegido por mais tempo após um golpe.',
    falas: ['(O jacaré-açu pisca devagar.)', 'Sabia? O jacaré-açu é o maior jacaré da América do Sul e vive nos rios e lagos da Amazônia.'] }
];

const ITENS = {
  cantil: { nome: 'Cantil', cura: 8,  usar: '* Você bebe água do cantil. Recuperou 8 PV!' },
  pequi:  { nome: 'Pequi',  cura: 10, usar: '* Você come a polpa do pequi (com cuidado!). Recuperou 10 PV!' },
  bocaiuva: { nome: 'Bocaiuva', cura: 10, usar: '* Você come bocaiuvas docinhas. Recuperou 10 PV!' },
  acai:     { nome: 'Açaí',     cura: 10, usar: '* Você come açaí fresquinho. Recuperou 10 PV!' },
  castanha: { nome: 'Castanha', cura: 12, usar: '* Você come castanhas-do-pará. Recuperou 12 PV!' },
  umbu:     { nome: 'Umbu',     cura: 10, usar: '* Você chupa uns umbus azedinhos. Recuperou 10 PV!' },
  rapadura: { nome: 'Rapadura', cura: 12, usar: '* Você come um pedaço de rapadura. Recuperou 12 PV!' },
  chimarrao: { nome: 'Chimarrão', cura: 10, usar: '* Você toma um chimarrão quentinho, bah! Recuperou 10 PV!' },
  butia:     { nome: 'Butiá',     cura: 10, usar: '* Você come butiás docinhos. Recuperou 10 PV!' },
  jucara:    { nome: 'Juçara',    cura: 10, usar: '* Você come polpa de juçara. Recuperou 10 PV!' },
  pinhao:    { nome: 'Pinhão',    cura: 14, usar: '* Você come pinhões cozidos. Recuperou 14 PV!' }
};

const PISTAS = {
  raizes:  { nome: 'RAÍZES PROFUNDAS' },
  aceiro:  { nome: 'ACEIRO' },
  lobeira: { nome: 'LOBEIRA' },
  pulso:     { nome: 'PULSO DAS ÁGUAS' },
  nascentes: { nome: 'NASCENTES' },
  brigada:   { nome: 'BRIGADA' },
  rios_voadores: { nome: 'RIOS VOADORES' },
  mercurio:      { nome: 'MERCÚRIO' },
  guardioes:     { nome: 'GUARDIÕES DA FLORESTA' },
  extincao:    { nome: 'QUASE EXTINTA' },
  nao_compre:  { nome: 'QUEM COMPRA, ALIMENTA O TRÁFICO' },
  caraibeiras: { nome: 'CARAIBEIRAS' },
  pecuaria:  { nome: 'PASTOREIO NO CAMPO NATIVO' },
  nativas:   { nome: 'CAMPO NATIVO' },
  invasoras: { nome: 'ESPÉCIE INVASORA' },
  corredores:  { nome: 'CORREDORES ECOLÓGICOS' },
  agua:        { nome: 'ÁGUA DAS CIDADES' },
  reflorestar: { nome: 'REFLORESTAMENTO' },
  lei:         { nome: 'LEI DA MATA ATLÂNTICA' }
};

// Ordem em que o Professor oferece as missões prontas.
const ORDEM_MISSOES = [1, 6, 2, 5, 4, 3];   // a Mata Atlântica é a última

const LAB_ENTIDADES = [
  { id: 'professor',  tipo: 'professor',  x: 7,  y: 3 },
  { id: 'computador', tipo: 'computador', x: 12, y: 1, sprite: 'computador' },
  { id: 'vaso1',      tipo: 'decor',      x: 2,  y: 1, sprite: 'vaso' },
  { id: 'vaso2',      tipo: 'decor',      x: 14, y: 1, sprite: 'vaso' }
];

// Índice do bioma -> missão.
const MISSOES = {
  1: {
    id: 'cerrado',
    titulo: 'O Lobo e o Fumaréu',
    animal: 'Lobo-guará', emoji: '🐺',
    ameaca: 'Queimadas',
    briefing: [
      'Acabei de receber um alerta: um incêndio está se espalhando no CERRADO e um lobo-guará ficou encurralado!',
      'Quem está por trás do incêndio é o FUMARÉU. Você não vai lutar com ele: vai desviar dos ataques e CONVENCÊ-LO a parar.',
      'Converse com quem vive no Cerrado. Cada PISTA que você descobrir vira uma nova ação em AGIR.'
    ],
    areaEncontro: 5,
    ficha: [
      'Maior canídeo (família dos cães) da América do Sul.',
      'Pernas compridas: chega a quase 1 metro de altura e enxerga por cima do capim.',
      'Come frutos, como a lobeira, e pequenos animais. Espalha sementes pelo Cerrado.',
      'É tímido e solitário. Não ataca pessoas.',
      'Ameaças: queimadas, perda de habitat e atropelamentos.',
      'Aparece na nota de 200 reais!'
    ],
    entidades: [
      { id: 'c-placa1', area: 0, x: 5, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'PARQUE DO CERRADO. Bem-vindo à savana com a maior variedade de plantas e animais do mundo!',
        'Aqui nascem rios importantes do Brasil. Por isso o Cerrado é chamado de BERÇO DAS ÁGUAS.'
      ]},
      { id: 'c-iris', area: 1, x: 11, y: 2, tipo: 'npc', sprite: 'pesquisadora', nome: 'DRA. ÍRIS', voz: 1.4, pista: 'raizes', falas: [
        'Oi! Sou a Dra. Íris. Eu estudo as plantas do Cerrado.',
        'Repare nas árvores: troncos tortos e casca bem grossa. A casca protege a planta do calor do fogo.',
        'E as raízes vão muito fundo, atrás de água. Tem tanta planta embaixo da terra que chamam o Cerrado de "floresta de cabeça para baixo"!',
        'Mas atenção: elas aguentam um fogo fraco de vez em quando. Incêndios enormes, todo ano, acabam com tudo.'
      ], falasDepois: [
        'As raízes do Cerrado são incríveis, né? Use isso para convencer o Fumaréu!'
      ]},
      { id: 'c-placa2', area: 2, x: 4, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'SABIA? O lobo-guará é o maior canídeo da América do Sul. As pernas compridas ajudam a enxergar por cima do capim alto.',
        'Ele é tão importante que aparece na nota de 200 reais!'
      ]},
      { id: 'c-pequi', area: 2, x: 12, y: 2, tipo: 'item', sprite: 'pequi', item: 'pequi', falas: [
        'Você encontrou um PEQUI, fruto típico do Cerrado!',
        'Cuidado: o caroço tem espinhos por dentro. Nunca morda o caroço!'
      ]},
      { id: 'c-bia', area: 3, x: 5, y: 2, tipo: 'npc', sprite: 'brigadista', nome: 'BIA, BRIGADISTA', voz: 1.2, pista: 'aceiro', item: 'cantil', falas: [
        'Ei! Sou a Bia, brigadista. A gente protege o Cerrado do fogo.',
        'Na seca, o capim fica muito seco. Uma bituca de cigarro ou lixo queimado já vira incêndio.',
        'Nosso truque é o ACEIRO: uma faixa de terra sem plantas. Quando o fogo chega lá, não tem o que queimar e para!',
        'Leve este cantil. Na batalha, use em ITEM para recuperar o fôlego.'
      ], falasDepois: [
        'Fique longe da fumaça! E lembre do aceiro.'
      ]},
      { id: 'c-ze', area: 4, x: 11, y: 6, tipo: 'npc', sprite: 'seuZe', nome: 'SEU ZÉ', voz: 0.8, pista: 'lobeira', falas: [
        'Opa! Sou o Seu Zé. Moro no Cerrado faz muito tempo.',
        'Tá vendo essa fruta? É a lobeira, a fruta-do-lobo. O lobo-guará adora!',
        'Ele come a fruta e espalha as sementes por aí. Sem perceber, o lobo planta o Cerrado!',
        'Ele é tímido e não ataca gente. Se encontrar um, fale baixinho e mantenha distância.'
      ], falasDepois: [
        'O lobo-guará é o jardineiro do Cerrado!'
      ]},
      { id: 'c-fumareu', area: 5, x: 10, y: 3, tipo: 'encontro', sprite: 'fumareuMundo' },
      { id: 'c-lobo', area: 5, x: 12, y: 5, tipo: 'animal', sprite: 'lobo',
        falas: ['(O lobo-guará está assustado. Primeiro é preciso acalmar o FUMARÉU!)'] },
      { id: 'c-fogo1', area: 5, x: 13, y: 2, tipo: 'fogo' },
      { id: 'c-fogo2', area: 5, x: 14, y: 6, tipo: 'fogo' },
      { id: 'c-fogo3', area: 5, x: 11, y: 7, tipo: 'fogo' },
      { id: 'c-fogo4', area: 5, x: 12, y: 1, tipo: 'fogo' }
    ],
    preBatalha: [
      { nome: 'FUMARÉU', voz: 0.6, texto: 'HA HA HA! Capim seco, vento forte... ESTA É A MINHA FESTA!' },
      { nome: 'FUMARÉU', voz: 0.6, texto: 'E esse lobo aí? Daqui ele não sai!' },
      { texto: '(O lobo-guará está encolhido, com medo do fogo.)' }
    ],
    resgate: [
      { texto: '(O fogo se apagou. O lobo-guará está assustado e com uma pata machucada.)' },
      { texto: '(Você mantém distância e chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Muito bem! Nunca tente pegar um animal silvestre no colo: ele pode se assustar e se machucar mais.' },
      { nome: 'PROFESSOR', texto: 'Quem encontra um animal ferido deve avisar a Polícia Ambiental, os Bombeiros ou o Ibama.' },
      { nome: 'PROFESSOR', texto: 'A equipe de resgate já chegou. Depois de tratado, ele volta para a natureza!' },
      { texto: '★ LOBO-GUARÁ RESGATADO! A ficha dele foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'FUMARÉU',
      sprite: 'fumareu',
      animal: 'lobo',
      furia: 100,
      voz: 0.6,
      intro: '* O FUMARÉU bloqueia o caminho! O lobo-guará está encurralado.',
      observar: [
        '* FUMARÉU: um incêndio fora de controle.',
        '* Começou com uma bituca de cigarro jogada na beira da estrada. Adora vento e capim seco.'
      ],
      acoes: [
        { id: 'calma', nome: 'Pedir calma', efeito: -15, repetir: true,
          texto: ['* Você pede calma com gestos. O Fumaréu diminui um pouquinho...'],
          fala: 'Calma?! Eu sou FOGO! ...Mas tá bom, um pouquinho.' },
        { id: 'raizes', nome: 'Explicar as raízes', pista: 'raizes', efeito: -35,
          texto: ['* Você mostra as raízes e a casca grossa das árvores.',
                  '* Elas aguentam um fogo fraco de vez em quando, mas incêndios enormes todo ano destroem o Cerrado.'],
          fala: 'Então... eu estou exagerando?' },
        { id: 'aceiro', nome: 'Fazer um aceiro', pista: 'aceiro', efeito: -35,
          texto: ['* Você e seu companheiro limpam uma faixa de terra sem plantas.',
                  '* O Fumaréu chega no aceiro e... não tem nada para queimar!'],
          fala: 'Ei! Cadê o capim?!' },
        { id: 'lobeira', nome: 'Mostrar a lobeira', pista: 'lobeira', efeito: -30,
          texto: ['* Você mostra uma lobeira. O lobo-guará levanta as orelhas!',
                  '* Sem o lobo, menos sementes de lobeira se espalham. O Cerrado inteiro perde.'],
          fala: 'Hmm... se o lobo some, o Cerrado sofre também...' },
        { id: 'gritar', nome: 'Gritar com ele', efeito: 10, repetir: true, errada: true,
          texto: ['* Você bate os pés e faz barulho!',
                  '* O lobo-guará se assusta... e o Fumaréu fica ainda mais bravo.',
                  '* (Gritar não ajuda. Use o que você aprendeu!)'],
          fala: 'HA! Barulho só me deixa mais animado!' }
      ],
      ataques: ['brasas', 'labaredas', 'fumaca'],
      sabores: [
        '* O ar está cheio de fumaça.',
        '* O lobo-guará treme num canto.',
        '* O Fumaréu estala e crepita.',
        '* Faz muito calor. O capim está seco.'
      ],
      calmo: '* O Fumaréu parece calmo. Talvez seja hora de POUPAR.',
      pouparCedo: ['* O Fumaréu ainda está furioso demais para ouvir.'],
      vitoria: [
        { fala: 'Eu... só queria um pouco de calor...' },
        { texto: '* O Fumaréu encolhe até virar uma chaminha.', encolher: true },
        { fala: 'E se eu aparecer pequenininho, no começo da seca, com os brigadistas cuidando? Posso ajudar?' },
        { texto: '* Isso existe! Chama-se MANEJO INTEGRADO DO FOGO.' },
        { texto: '* Brigadistas fazem queimas pequenas e controladas na época certa. Assim sobra menos capim seco para grandes incêndios.' },
        { texto: '* Você poupou o FUMARÉU!', som: 'vitoria' }
      ],
      derrota: [
        '* Você ficou sem fôlego por causa da fumaça...',
        '* Mas você não desiste! Respire fundo e tente de novo.'
      ]
    }
  },
  2: {
    id: 'amazonia',
    titulo: 'O Peixe-boi e o Seu Derruba',
    animal: 'Peixe-boi-da-amazônia', emoji: '🌊',
    ameaca: 'Desmatamento ilegal e garimpo',
    areaEncontro: 5,
    desmatada: true,       // a área do chefe fica desmatada até ele ser poupado
    briefing: [
      'Alerta máximo na AMAZÔNIA! Os satélites mostram uma clareira enorme crescendo no meio da floresta.',
      'Quem está por trás é o SEU DERRUBA: ele desmata sem autorização e abriu um garimpo ilegal na beira do rio.',
      'A água do garimpo ficou barrenta e cheia de mercúrio. Um filhote de peixe-boi ficou preso numa poça perto dali!',
      'Ele é o adversário mais difícil até agora: um CHEFE. Converse com quem vive na floresta e junte TODAS as pistas.'
    ],
    ficha: [
      'Mamífero que vive só em água doce. É o menor peixe-boi do mundo, mas pode passar de 2 metros!',
      'É herbívoro: passa o dia comendo capins e plantas aquáticas.',
      'Os filhotes ficam muito tempo junto da mãe, mamando e aprendendo.',
      'Está ameaçado de extinção (vulnerável): foi muito caçado e hoje sofre com rios poluídos e redes de pesca.',
      'Filhotes órfãos são cuidados por especialistas e, depois de alguns anos, voltam para os rios.'
    ],
    entidades: [
      { id: 'a-placa1', area: 0, x: 5, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'AMAZÔNIA. A maior floresta tropical do mundo! Ela ocupa quase metade do território do Brasil.',
        'Aqui vivem milhares de espécies de árvores, peixes, aves e mamíferos. Muitas ainda nem foram descobertas!'
      ]},
      { id: 'a-marina', area: 1, x: 11, y: 2, tipo: 'npc', sprite: 'marina', nome: 'DRA. MARINA', voz: 1.35, pista: 'rios_voadores', falas: [
        'Olá! Sou a Dra. Marina, pesquisadora da floresta.',
        'As árvores da Amazônia puxam água do solo e soltam vapor pelas folhas. Esse vapor forma nuvens enormes.',
        'O vento leva essas nuvens para outras regiões do Brasil. São os RIOS VOADORES: eles levam chuva para plantações e cidades bem longe daqui!',
        'Quando a floresta é derrubada, os rios voadores enfraquecem e falta chuva em muitos lugares.'
      ], falasDepois: [
        'A floresta em pé faz chover no Brasil inteiro!'
      ]},
      { id: 'a-placa2', area: 2, x: 4, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'ESPÉCIES AMEAÇADAS: boto-cor-de-rosa, peixe-boi, ariranha, harpia, ararajuba e sauim-de-coleira vivem aqui e correm risco de desaparecer.',
        'Chegue perto dos animais da floresta e aperte AÇÃO para conhecer cada um!'
      ]},
      { id: 'a-acai', area: 2, x: 12, y: 6, tipo: 'item', sprite: 'acaiItem', item: 'acai', falas: [
        'Você encontrou um cacho de AÇAÍ!',
        'O açaí nasce numa palmeira e é alimento tradicional dos povos da Amazônia.'
      ]},
      { id: 'a-kaua', area: 3, x: 5, y: 2, tipo: 'npc', sprite: 'kaua', nome: 'KAUÃ', voz: 1.25, pista: 'guardioes', item: 'castanha', falas: [
        'Oi! Eu sou o Kauã. Meu povo vive nesta floresta há muitas gerações.',
        'Para a gente, a floresta é casa, farmácia, escola e mercado. A gente cuida dela, e ela cuida da gente.',
        'Sabia? As TERRAS INDÍGENAS estão entre as partes mais preservadas da Amazônia. Os povos indígenas são GUARDIÕES DA FLORESTA.',
        'Mas o garimpo ilegal invade nossas terras e suja nossos rios. Leve esta castanha: ela dá força!'
      ], falasDepois: [
        'A floresta é de todos nós. Cuidar dela é cuidar do futuro.'
      ]},
      { id: 'a-raimundo', area: 4, x: 11, y: 6, tipo: 'npc', sprite: 'raimundo', nome: 'SEU RAIMUNDO', voz: 0.85, pista: 'mercurio', falas: [
        'Opa! Sou o Seu Raimundo, ribeirinho. Vivo da pesca e do açaí, na beira do rio.',
        'Desde que abriram aquele garimpo, a água ficou barrenta. Os peixes sumiram.',
        'O garimpo usa MERCÚRIO para separar o ouro. Esse veneno vai para o rio, entra nos peixes... e chega em quem come o peixe.',
        'O mercúrio faz muito mal à saúde, principalmente das crianças. Rio limpo é vida!'
      ], falasDepois: [
        'Sem rio limpo, não tem peixe nem gente com saúde.'
      ]},
      { id: 'a-placa3', area: 5, x: 3, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'A placa diz: "FAZENDA DO SEU DERRUBA. PROIBIDO ENTRAR."',
        'Mas esta área é floresta pública! Derrubar a mata aqui sem autorização é crime ambiental.'
      ]},
      { id: 'a-toras', area: 5, x: 13, y: 1, tipo: 'decor', sprite: 'toras' },
      { id: 'a-derruba', area: 5, x: 10, y: 3, tipo: 'encontro', sprite: 'derrubaMundo' },
      { id: 'a-peixeboi', area: 5, x: 12, y: 6, tipo: 'animal', sprite: 'peixeboi', poca: true,
        falas: ['(O filhote de peixe-boi está preso numa poça barrenta. Primeiro é preciso convencer o SEU DERRUBA!)'] }
    ],
    preBatalha: [
      { nome: 'SEU DERRUBA', voz: 0.55, texto: 'Ei, você aí! Esta terra agora é MINHA. Vou derrubar tudo e plantar capim pro gado!' },
      { nome: 'SEU DERRUBA', voz: 0.55, texto: 'E o ouro do rio também é meu! Esse bicho aí na lama que se vire!' },
      { texto: '(O filhote de peixe-boi está preso numa poça barrenta, sem conseguir voltar para o rio.)' }
    ],
    resgate: [
      { texto: '(O garimpo foi fechado. Aos poucos, a água do rio vai voltar a ficar limpa.)' },
      { texto: '(O filhote de peixe-boi está fraco e sozinho. Você mantém distância e chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Muito bem! Filhotes órfãos de peixe-boi são levados para centros de reabilitação.' },
      { nome: 'PROFESSOR', texto: 'Lá eles recebem leite e cuidados por alguns anos. Depois, voltam a nadar livres nos rios!' },
      { texto: '★ PEIXE-BOI-DA-AMAZÔNIA RESGATADO! A ficha foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'SEU DERRUBA',
      chefe: true,
      sprite: 'derruba',
      animal: 'peixeboi',
      furia: 130,
      voz: 0.55,
      intro: '* SEU DERRUBA liga a motosserra! O filhote de peixe-boi está preso na água barrenta.',
      observar: [
        '* SEU DERRUBA: fazendeiro que desmata sem autorização e mantém um garimpo ilegal.',
        '* Ele só pensa em lucro rápido e diz que "floresta em pé não dá dinheiro".',
        '* (Atenção: muitos produtores rurais trabalham dentro da lei. O problema é o desmatamento ILEGAL.)'
      ],
      acoes: [
        { id: 'desligar', nome: 'Pedir para desligar a motosserra', efeito: -15, repetir: true,
          texto: ['* Você aponta para a motosserra e faz sinal para desligar.'],
          fala: 'Desligar? Tempo é dinheiro, criança!' },
        { id: 'rios_voadores', nome: 'Falar dos rios voadores', pista: 'rios_voadores', efeito: -35,
          texto: ['* Você explica que as árvores da Amazônia fazem chover em outras partes do Brasil.',
                  '* Sem floresta, falta chuva até nas fazendas... inclusive na dele!'],
          fala: 'Peraí... minha plantação depende dessa chuva?' },
        { id: 'mercurio', nome: 'Mostrar o mercúrio no rio', pista: 'mercurio', efeito: -35,
          texto: ['* Você mostra a água barrenta do garimpo e explica o perigo do mercúrio.',
                  '* O veneno vai para os peixes e chega até as pessoas, inclusive as crianças.'],
          fala: 'Mas... meus netos comem peixe desse rio...' },
        { id: 'guardioes', nome: 'Chamar os guardiões da floresta', pista: 'guardioes', efeito: -30,
          texto: ['* Kauã e seu povo chegam para defender o território.',
                  '* Juntos, vocês mostram que a floresta é de todos nós e das próximas gerações.'],
          fala: 'Tá cheio de gente aqui... Eu tô cercado!' },
        { id: 'ouro', nome: 'Aceitar uma pepita de ouro', efeito: 15, repetir: true, errada: true,
          texto: ['* Seu Derruba oferece uma pepita de ouro para você ficar quieto...',
                  '* Aceitar seria virar cúmplice do crime!',
                  '* (A floresta não está à venda. Use o que você aprendeu!)'],
          fala: 'HA! Todo mundo tem um preço!' }
      ],
      ataques: ['troncos', 'motosserra', 'mercurio'],
      // Segunda fase do chefe: quando a fúria cai abaixo do limite, ele se desespera.
      fase2: {
        limite: 60,
        fala: 'Chega de conversa! Vou derrubar tudo de uma vez!',
        ataques: ['desespero', 'troncos', 'desespero', 'mercurio']
      },
      sabores: [
        '* O barulho da motosserra assusta os bichos.',
        '* O filhote de peixe-boi respira com dificuldade na água barrenta.',
        '* Tocos de árvores para todo lado.',
        '* Cheiro de fumaça de diesel no ar.'
      ],
      calmo: '* Seu Derruba desligou a motosserra. Talvez seja hora de POUPAR.',
      pouparCedo: ['* Seu Derruba ainda está decidido a derrubar tudo.'],
      vitoria: [
        { fala: 'Eu... achava que floresta derrubada era progresso.' },
        { texto: '* Seu Derruba guarda a motosserra e olha em volta, em silêncio.' },
        { fala: 'Vou fechar o garimpo e replantar o que derrubei. Prometo!' },
        { texto: '* Uma equipe de fiscalização ambiental chega. Desmatamento e garimpo ilegais são CRIMES.' },
        { texto: '* A área é embargada. Seu Derruba vai responder à Justiça e terá que recuperar a floresta.' },
        { texto: '* Você poupou o SEU DERRUBA... e a floresta também!', som: 'vitoria' }
      ],
      derrota: [
        '* O barulho e a poeira te deixaram tonto...',
        '* Respire fundo. A floresta conta com você!'
      ]
    }
  },
  3: {
    id: 'mata',
    titulo: 'O Mico-leão e o Devastron',
    animal: 'Mico-leão-dourado', emoji: '🐒',
    ameaca: 'Desmatamento, fumaça e rios poluídos',
    areaEncontro: 5,
    desmatada: true,
    final: true,           // missão final: só libera depois das outras cinco
    requer: ['cerrado', 'pantanal', 'amazonia', 'caatinga', 'pampa'],
    briefing: [
      'Esta é a missão FINAL. Tudo o que você aprendeu vai ser necessário!',
      'Na MATA ATLÂNTICA, um robô gigante chamado DEVASTRON está derrubando a floresta, soltando fumaça e poluindo os rios.',
      'Uma família de micos-leões-dourados ficou presa numa árvore isolada, no meio da destruição.',
      'O Devastron é muito mais forte que os outros. Junte as QUATRO pistas e leve itens para recuperar o fôlego!'
    ],
    ficha: [
      'Macaco pequeno, de pelo laranja-dourado, que só existe na Mata Atlântica do Rio de Janeiro.',
      'Nos anos 1970, restavam só cerca de 200 na natureza!',
      'Graças a reintroduções, proteção e corredores de floresta, hoje são alguns milhares.',
      'Vive em famílias, e o pai e os irmãos ajudam a carregar os filhotes.',
      'Ameaças: floresta em pedaços, febre amarela e tráfico de animais.'
    ],
    entidades: [
      { id: 'm-placa1', area: 0, x: 5, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'MATA ATLÂNTICA. Quando os portugueses chegaram, ela cobria boa parte do litoral do Brasil.',
        'Hoje restam só cerca de 12% da floresta original. Mesmo assim, é uma das florestas com mais espécies do planeta!',
        'E 7 em cada 10 brasileiros vivem na região da Mata Atlântica.'
      ]},
      { id: 'm-helena', area: 1, x: 11, y: 2, tipo: 'npc', sprite: 'helena', nome: 'DRA. HELENA', voz: 1.3, pista: 'corredores', falas: [
        'Olá! Sou a Dra. Helena. Estudo os micos-leões-dourados há muitos anos.',
        'Nos anos 1970, restavam só uns 200 micos na natureza. Eles quase desapareceram!',
        'O problema é que a Mata Atlântica virou pedacinhos de floresta separados por pastos e estradas. Os micos ficam presos em "ilhas".',
        'A solução são os CORREDORES ECOLÓGICOS: faixas de floresta que ligam os pedaços. Assim, os bichos podem se encontrar de novo!'
      ], falasDepois: [
        'Floresta conectada é floresta viva!'
      ]},
      { id: 'm-jaci', area: 2, x: 11, y: 6, tipo: 'npc', sprite: 'jaci', nome: 'JACI, GUIA DE TRILHAS', voz: 1.1, pista: 'agua', falas: [
        'E aí! Sou o Jaci, guia de trilhas. Já viu a cachoeira? Que água limpinha!',
        'Muitos rios que abastecem grandes cidades do Brasil nascem aqui, na Mata Atlântica.',
        'A floresta funciona como uma esponja: segura a chuva e solta a água devagar nas nascentes.',
        'Sem mata, as nascentes secam e falta ÁGUA NAS TORNEIRAS de milhões de pessoas!'
      ], falasDepois: [
        'Cada copo de água começa numa floresta!'
      ]},
      { id: 'm-jucara', area: 2, x: 4, y: 6, tipo: 'item', sprite: 'jucaraItem', item: 'jucara', falas: [
        'Você encontrou frutos de JUÇARA!',
        'Dá para fazer uma polpa parecida com açaí sem cortar a palmeira. Assim ela continua dando frutos!'
      ]},
      { id: 'm-damiao', area: 3, x: 5, y: 2, tipo: 'npc', sprite: 'damiao', nome: 'SEU DAMIÃO, VIVEIRISTA', voz: 0.85, pista: 'reflorestar', item: 'pinhao', falas: [
        'Opa! Sou o Seu Damião e cuido de um viveiro de mudas nativas.',
        'Aqui tem muda de pau-brasil, palmito-juçara, araucária, ipê... tudo árvore daqui mesmo.',
        'Já vi fazenda toda pelada virar floresta de novo depois de anos de REFLORESTAMENTO. As nascentes voltaram e os bichos também!',
        'Plantar árvore nativa é plantar futuro. Leve uns pinhões, que dão energia!'
      ], falasDepois: [
        'Uma muda hoje, uma floresta amanhã!'
      ]},
      { id: 'm-viveiro', area: 3, x: 11, y: 6, tipo: 'objeto', sprite: 'viveiro', falas: [
        'O VIVEIRO do Seu Damião: centenas de mudas de árvores nativas esperando para ir para a terra.',
        'Plantar árvores da própria região é o melhor jeito de trazer a floresta de volta.'
      ]},
      { id: 'm-caio', area: 4, x: 11, y: 2, tipo: 'npc', sprite: 'caio', nome: 'CAIO', voz: 1.6, pista: 'lei', item: 'cantil', falas: [
        'Oi! Eu sou o Caio, tenho 10 anos e sou do clube de ciências da escola!',
        'Sabia que existe uma LEI DA MATA ATLÂNTICA? Ela protege o que sobrou da floresta.',
        'Desmatar sem autorização é crime. E satélites ajudam a descobrir onde estão derrubando árvores!',
        'Se a gente vê algo errado, pode pedir para um adulto denunciar. Criança também protege a floresta! Leve meu cantil.'
      ], falasDepois: [
        'Bora salvar a Mata Atlântica!'
      ]},
      { id: 'm-placa2', area: 4, x: 4, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'PAU-BRASIL: a árvore que deu nome ao nosso país!',
        'Foi tão explorada para tirar tinta vermelha que hoje está ameaçada de extinção.'
      ]},
      { id: 'm-robo', area: 5, x: 10, y: 5, tipo: 'encontro', sprite: 'roboMundo' },
      { id: 'm-micos', area: 5, x: 13, y: 6, tipo: 'animal', sprite: 'micosArvore',
        falas: ['(A família de micos-leões-dourados está presa numa árvore isolada. Primeiro é preciso parar o DEVASTRON!)'] }
    ],
    preBatalha: [
      { texto: '(O chão treme. Árvores caem uma atrás da outra...)' },
      { nome: 'DEVASTRON', voz: 0.45, texto: 'BIP. EU SOU DEVASTRON. PROGRAMAÇÃO: DERRUBAR, LUCRAR, REPETIR.' },
      { nome: 'DEVASTRON', voz: 0.45, texto: 'FLORESTA DETECTADA. INICIANDO DESTRUIÇÃO TOTAL.' },
      { texto: '(Uma família de micos-leões-dourados se abraça no galho de uma árvore isolada.)' }
    ],
    resgate: [
      { texto: '(A floresta fica em silêncio... e então os pássaros voltam a cantar.)' },
      { texto: '(Os micos-leões-dourados estão assustados no alto da árvore. Você chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Incrível! Os especialistas vão levar a família para uma área de floresta maior e protegida.' },
      { nome: 'PROFESSOR', texto: 'E com os corredores ecológicos, eles vão poder encontrar outros grupos de micos!' },
      { texto: '★ MICO-LEÃO-DOURADO RESGATADO! A ficha foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'DEVASTRON',
      chefe: true,
      final: true,
      sprite: 'robo',
      animal: 'micosArvore',
      particulas: 'fumaca',
      furia: 180,
      voz: 0.45,
      ritmo: 1.15,          // ataques mais rápidos que nas outras fases
      danoExtra: 1,         // cada golpe tira 1 PV a mais
      duracao: 7,           // cada ataque dura mais
      intro: '* DEVASTRON avança soltando fumaça! É o desafio final!',
      observar: [
        '* DEVASTRON: robô gigante que desmata, solta fumaça e despeja óleo nos rios.',
        '* Foi programado para "lucro a qualquer custo". Talvez dê para REPROGRAMÁ-LO com o que você aprendeu...',
        '* (Chefe final: os ataques são mais rápidos e mais fortes!)'
      ],
      acoes: [
        { id: 'desligar', nome: 'Procurar o botão de desligar', efeito: -15, repetir: true,
          texto: ['* Você procura um botão de desligar... mas o robô não para de se mexer!'],
          fala: 'DESLIGAR? COMANDO NEGADO. BIP.' },
        { id: 'corredores', nome: 'Mostrar os corredores ecológicos', pista: 'corredores', efeito: -35,
          texto: ['* Você mostra no mapa: pedaços de floresta isolados não sustentam os bichos.',
                  '* Ligando os pedaços com CORREDORES de floresta, os micos podem se encontrar de novo!'],
          fala: 'RECALCULANDO... FLORESTA CONECTADA = MAIS VIDA?' },
        { id: 'agua', nome: 'Explicar a água das cidades', pista: 'agua', efeito: -35,
          texto: ['* Você explica que a floresta protege as nascentes que abastecem as cidades.',
                  '* Sem mata, falta água nas torneiras de milhões de pessoas!'],
          fala: 'ÁGUA... EU TAMBÉM USO ÁGUA PARA ME RESFRIAR. ERRO DE LÓGICA!' },
        { id: 'reflorestar', nome: 'Ensinar a reflorestar', pista: 'reflorestar', efeito: -35,
          texto: ['* Você mostra as mudas do viveiro e como plantar espécies nativas.',
                  '* Onde a floresta foi replantada, as nascentes e os bichos voltaram!'],
          fala: 'NOVA FUNÇÃO DETECTADA: PLANTAR... INSTALANDO...' },
        { id: 'lei', nome: 'Mostrar a Lei da Mata Atlântica', pista: 'lei', efeito: -35,
          texto: ['* Você mostra que existe uma lei especial que protege o que resta da Mata Atlântica.',
                  '* Desmatar sem autorização é crime, e qualquer pessoa pode denunciar!'],
          fala: 'ALERTA: OPERAÇÃO ILEGAL DETECTADA. PROTOCOLO DE PARADA...' },
        { id: 'arvorezinhas', nome: 'Deixar cortar só umas arvorezinhas', efeito: 20, repetir: true, errada: true,
          texto: ['* Você pensa: "só umas arvorezinhas não fazem diferença..."',
                  '* Mas restam só cerca de 12% da Mata Atlântica. Cada pedaço faz diferença!',
                  '* (Use o que você aprendeu!)'],
          fala: 'OBRIGADO! MAIS ÁRVORES PARA DERRUBAR! BIP BIP!' }
      ],
      ataques: ['esteira', 'fumacaToxica', 'oleo'],
      // Três fases: o robô fica mais perigoso conforme perde a fúria.
      fases: [
        { limite: 120, fala: 'ATENÇÃO: MODO TURBO ATIVADO! FUMAÇA MÁXIMA!', ataques: ['laser', 'serras', 'fumacaToxica', 'oleo'] },
        { limite: 60, fala: 'ERRO... ERRO... SISTEMA SOBRECARREGADO! TODAS AS FERRAMENTAS ATIVADAS!', ataques: ['caos1', 'caos2', 'caos3'] }
      ],
      sabores: [
        '* O motor do Devastron ronca alto.',
        '* Os micos-leões-dourados se abraçam no galho.',
        '* Uma fumaça escura cobre o céu.',
        '* Gotas de óleo pingam no rio.'
      ],
      calmo: '* Os olhos do Devastron ficaram verdes. Talvez seja hora de POUPAR.',
      pouparCedo: ['* O Devastron ainda está programado para destruir.'],
      vitoria: [
        { fala: 'REPROGRAMAÇÃO CONCLUÍDA. NOVO OBJETIVO: PROTEGER A FLORESTA.' },
        { texto: '* O Devastron desliga a serra, fecha a chaminé e para de despejar óleo.' },
        { fala: 'SUGESTÃO DE NOVO NOME: REFLORESTRON. POSSO PLANTAR MIL MUDAS POR DIA. BIP!' },
        { texto: '* Os fiscais ambientais apreendem a máquina, e os responsáveis pelo desmatamento vão responder à Justiça.' },
        { texto: '* E o Reflorestron vai ajudar a ligar os pedaços de floresta com corredores verdes!' },
        { texto: '* Você poupou o DEVASTRON!', som: 'vitoria' }
      ],
      derrota: [
        '* A fumaça te deixou sem fôlego...',
        '* Este é o desafio final. Respire fundo: você já salvou cinco biomas!'
      ]
    }
  },
  4: {
    id: 'pampa',
    titulo: 'O Veado-campeiro e o Annoni',
    animal: 'Veado-campeiro', emoji: '🦌',
    ameaca: 'Espécie invasora e perda do campo nativo',
    areaEncontro: 5,
    invadida: true,        // a área do encontro fica tomada pelo capim-annoni até ele ser poupado
    briefing: [
      'Bah, chegou um chamado do PAMPA!',
      'Um capim invasor, o ANNONI, está tomando conta dos campos nativos e expulsando os bichos.',
      'Um filhote de veado-campeiro ficou preso num aramado, fugindo do capinzal. Ele está fraco e com fome.',
      'Fale com o povo da campanha. Os gaúchos conhecem o campo como a palma da mão!'
    ],
    ficha: [
      'Veado típico dos campos abertos da América do Sul.',
      'Os machos soltam um cheiro forte, que dá para sentir de longe!',
      'Vive em grupos pequenos e come brotos de capins e ervas do campo nativo.',
      '⚠ No Rio Grande do Sul, está CRITICAMENTE EM PERIGO: restam poucos grupos.',
      'Ameaças: perda do campo nativo, caça, cercas e doenças levadas pelo gado.'
    ],
    entidades: [
      { id: 'p4-placa1', area: 0, x: 4, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'PAMPA. No Brasil, ele só existe no Rio Grande do Sul, mas continua no Uruguai e na Argentina.',
        'São campos a perder de vista, as COXILHAS, com centenas de tipos de capins e flores nativas.',
        'É um dos biomas brasileiros com menos áreas protegidas.'
      ]},
      { id: 'p4-galpao', area: 0, x: 11, y: 2, largura: 3, tipo: 'objeto', sprite: 'galpao', falas: [
        'Um GALPÃO de estância. É aqui que a peonada se reúne em volta do fogo de chão.',
        'No galpão se toma chimarrão, se contam causos e se toca gaita até tarde da noite.'
      ]},
      { id: 'p4-fogo', area: 0, x: 13, y: 3, tipo: 'objeto', desenho: 'fogochao', falas: [
        'O FOGO DE CHÃO esquenta a chaleira para o chimarrão.',
        'É um fogo pequeno, cercado de pedras e sempre vigiado. Fogo sem cuidado, no campo seco, vira incêndio!'
      ]},
      { id: 'p4-tonho', area: 0, x: 10, y: 3, tipo: 'npc', sprite: 'tonho', nome: 'SEU TONHO, PEÃO', voz: 0.8, pista: 'pecuaria', item: 'chimarrao', falas: [
        'Bah, buenas, tchê! Sou o Seu Tonho, peão desta estância. Chegue, que o chimarrão tá pronto!',
        'O chimarrão é feito com erva-mate na cuia e tomado pela bomba. A cuia passa de mão em mão: é sinal de amizade.',
        'Aqui a gente cria gado no CAMPO NATIVO há séculos. Com o pastoreio bem cuidado, o capim nativo se mantém e o Pampa fica de pé.',
        'O que acaba com o Pampa é trocar o campo nativo por outra coisa. Leve uma cuia para a viagem!'
      ], falasDepois: [
        'Campo nativo bem cuidado é tri bom pro gado e pros bichos!'
      ]},
      { id: 'p4-luiza', area: 1, x: 11, y: 6, tipo: 'npc', sprite: 'prenda', nome: 'LUIZA, PRENDA', voz: 1.35, pista: 'nativas', falas: [
        'Oi! Eu sou a Luiza. Sou prenda no CTG e estudo agronomia.',
        'Prenda é como chamamos as moças que dançam e guardam as tradições gaúchas. Este é o vestido de prenda!',
        'O Pampa parece "só grama", mas tem MAIS DE 400 TIPOS DE CAPINS e centenas de flores nativas.',
        'Esse CAMPO NATIVO alimenta o gado, guarda água no solo e é a casa do veado-campeiro, da ema e do quero-quero.'
      ], falasDepois: [
        'Cada florzinha do campo conta. O Pampa é um jardim gigante!'
      ]},
      { id: 'p4-catavento', area: 1, x: 5, y: 6, tipo: 'objeto', desenho: 'catavento', falas: [
        'Um CATA-VENTO de estância.',
        'Ele usa a força do vento para puxar água do poço para o gado beber.'
      ]},
      { id: 'p4-placa2', area: 2, x: 4, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'TRADIÇÃO GAÚCHA: em setembro acontece a SEMANA FARROUPILHA, com música, dança, churrasco e desfiles a cavalo.',
        'O 20 de Setembro é o Dia do Gaúcho! Os CTGs (Centros de Tradições Gaúchas) guardam a cultura: a bombacha, o lenço, a prenda e as danças.'
      ]},
      { id: 'p4-butia', area: 2, x: 12, y: 2, tipo: 'item', sprite: 'butiaItem', item: 'butia', falas: [
        'Você encontrou BUTIÁS, frutinhos amarelos do butiazeiro!',
        'No Pampa, o butiá vira suco e geleia.'
      ]},
      { id: 'p4-bento', area: 3, x: 5, y: 2, tipo: 'npc', sprite: 'guarda', nome: 'SEU BENTO, GUARDA-PARQUE', voz: 0.95, pista: 'invasoras', item: 'cantil', falas: [
        'Bom dia! Sou o Seu Bento, guarda-parque. Cuido de uma área protegida do Pampa.',
        'Tá vendo aquelas touceiras acinzentadas? É o CAPIM-ANNONI. Ele veio da África por engano, misturado com outras sementes.',
        'Ele se espalha rápido, o gado quase não come e as plantas nativas perdem espaço. Isso é uma ESPÉCIE INVASORA.',
        'As sementes pegam carona em máquinas e no pelo dos bichos. Limpar as máquinas ajuda a frear o invasor. Leve este cantil!'
      ], falasDepois: [
        'Invasor se combate cedo, antes de tomar conta!'
      ]},
      { id: 'p4-placa3', area: 4, x: 12, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'VOCÊ SABIA? O campo nativo bem cuidado guarda muito carbono no solo, assim como as florestas.',
        'Conservar o Pampa também ajuda a combater as mudanças do clima!'
      ]},
      { id: 'p4-annoni', area: 5, x: 10, y: 5, tipo: 'encontro', sprite: 'annoniMundo' },
      { id: 'p4-veado', area: 5, x: 13, y: 6, tipo: 'animal', sprite: 'veadoPreso',
        falas: ['(O filhote de veado-campeiro está preso no arame. Primeiro é preciso acalmar o ANNONI!)'] }
    ],
    preBatalha: [
      { nome: 'ANNONI', voz: 0.65, texto: 'Shhhh... Eu cresço, eu espalho, eu tomo conta! Este campo agora é MEU!' },
      { nome: 'ANNONI', voz: 0.65, texto: 'Capim nativo? Florzinha? Veado? Nada disso vai sobrar!' },
      { texto: '(O filhote de veado-campeiro está preso no arame da cerca, assustado.)' }
    ],
    resgate: [
      { texto: '(O campo nativo começa a se recuperar. As flores voltam a aparecer!)' },
      { texto: '(O filhote de veado-campeiro está preso no arame. Você não tenta soltar sozinho: chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Muito bem! Um animal preso em arame pode se machucar ainda mais se a gente puxar.' },
      { nome: 'PROFESSOR', texto: 'A equipe de resgate vai cortar o arame com cuidado, tratar o filhote e levá-lo de volta para o grupo.' },
      { texto: '★ VEADO-CAMPEIRO RESGATADO! A ficha foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'ANNONI',
      sprite: 'annoni',
      animal: 'veadoPreso',
      furia: 100,
      voz: 0.65,
      intro: '* O ANNONI se espalha pelo campo! O filhote de veado-campeiro está preso no aramado.',
      observar: [
        '* ANNONI: capim invasor que veio de longe.',
        '* Cresce em touceiras duras e espalha milhares de sementes com o vento minuano.'
      ],
      acoes: [
        { id: 'licenca', nome: 'Pedir licença, tchê', efeito: -15, repetir: true,
          texto: ['* Você tira o chapéu e pede licença, bem educado.'],
          fala: 'Licença? Eu nunca peço licença pra crescer! ...Mas que educado.' },
        { id: 'pecuaria', nome: 'Chamar o gado do Seu Tonho', pista: 'pecuaria', efeito: -30,
          texto: ['* O gado chega pastando o campo nativo, do jeito certo.',
                  '* Com o pastoreio bem cuidado, o capim nativo fica forte e não sobra espaço para o invasor.'],
          fala: 'Ei! Esse capim nativo tá ficando forte demais!' },
        { id: 'nativas', nome: 'Mostrar as plantas nativas', pista: 'nativas', efeito: -35,
          texto: ['* Você mostra os capins e as flores do campo nativo: centenas de espécies juntinhas!',
                  '* Um campo cheio de plantas nativas é muito mais difícil de ser invadido.'],
          fala: 'Tanta planta diferente... nem sei onde me meter!' },
        { id: 'invasoras', nome: 'Limpar as sementes das máquinas', pista: 'invasoras', efeito: -35,
          texto: ['* Você ajuda a limpar as máquinas e os cascos dos animais.',
                  '* Sem carona, as sementes do Annoni não chegam a outros campos!'],
          fala: 'Minhas sementes! Elas perderam a carona!' },
        { id: 'lavrar', nome: 'Lavrar o campo inteiro', efeito: 10, repetir: true, errada: true,
          texto: ['* Você pensa em arar o campo todo e plantar outra coisa...',
                  '* Mas lavrar destrói o campo nativo e deixa a terra pronta para o Annoni se espalhar!',
                  '* (Use o que você aprendeu!)'],
          fala: 'Isso! Terra pelada é tudo o que eu quero!' }
      ],
      ataques: ['sementes', 'touceiras', 'minuano'],
      sabores: [
        '* O vento minuano assobia nas coxilhas.',
        '* O filhote de veado-campeiro chama pela mãe.',
        '* Um quero-quero grita ao longe.',
        '* Touceiras acinzentadas cobrem o campo.'
      ],
      calmo: '* O Annoni parou de se espalhar. Talvez seja hora de POUPAR.',
      pouparCedo: ['* O Annoni ainda está se espalhando por todo lado.'],
      vitoria: [
        { fala: 'Tá bom, tá bom... Eu não sou daqui mesmo. Este campo é dos capins nativos.' },
        { texto: '* O Annoni para de se espalhar e encolhe.', encolher: true },
        { texto: '* Controlar uma espécie invasora dá trabalho e leva tempo. Cuidar do campo nativo é o melhor remédio.' },
        { fala: 'Os guarda-parques vão ficar de olho em mim, né? Justo...' },
        { texto: '* Você poupou o ANNONI!', som: 'vitoria' }
      ],
      derrota: [
        '* As sementes do Annoni te deixaram espirrando...',
        '* Respire o ar do Pampa e tente de novo, tchê!'
      ]
    }
  },
  5: {
    id: 'caatinga',
    titulo: 'A Ararinha e o Zé Arapuca',
    animal: 'Ararinha-azul', emoji: '🦜',
    ameaca: 'Tráfico de animais silvestres',
    areaEncontro: 5,
    briefing: [
      'Notícia urgente da CAATINGA! Alguém está capturando aves para vender ilegalmente.',
      'O suspeito é o ZÉ ARAPUCA. Ele espalha armadilhas e esconde pássaros em gaiolas na carroceria da caminhonete.',
      'O pior: entre as aves presas está uma ARARINHA-AZUL, uma das aves mais raras do planeta!',
      'Converse com o povo do sertão. Eles conhecem a Caatinga como ninguém.'
    ],
    ficha: [
      'Ave azul que só existe no Brasil, no sertão da Bahia, perto de riachos com caraibeiras.',
      'Em 2019 foi considerada EXTINTA NA NATUREZA: só restavam ararinhas sob cuidados humanos.',
      'Em 2022, ararinhas criadas em cativeiro foram soltas em Curaçá, na Bahia, e voltaram a voar livres!',
      'O tráfico de animais e a destruição das caraibeiras quase acabaram com a espécie.',
      'Ficou famosa no mundo todo com o filme de animação "Rio".'
    ],
    entidades: [
      { id: 'k-placa1', area: 0, x: 5, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'CAATINGA. O único bioma que existe SOMENTE no Brasil!',
        'O nome vem do tupi e quer dizer "mata branca": na seca, as plantas perdem as folhas e a paisagem fica clarinha.',
        'Muitos rios daqui são INTERMITENTES: só correm na época das chuvas. Na seca, viram caminhos de areia.'
      ]},
      { id: 'k-lu', area: 1, x: 11, y: 2, tipo: 'npc', sprite: 'biologa', nome: 'LU, BIÓLOGA', voz: 1.35, pista: 'extincao', falas: [
        'Oi! Sou a Lu, bióloga de um projeto que cuida das ararinhas-azuis.',
        'A ararinha-azul ficou tão rara que, em 2019, não existia mais nenhuma livre na natureza. Só em cativeiro.',
        'O principal motivo foi o TRÁFICO: pessoas capturavam as aves para vender como bicho de estimação.',
        'Em 2022, conseguimos soltar algumas ararinhas no sertão da Bahia. Cada uma delas é preciosa!'
      ], falasDepois: [
        'Toda ararinha livre é uma vitória para a Caatinga!'
      ]},
      { id: 'k-placa2', area: 2, x: 4, y: 6, tipo: 'placa', sprite: 'placa', falas: [
        'TRÁFICO DE ANIMAIS É CRIME! Capturar, vender ou comprar animais silvestres sem autorização dá multa e até prisão.',
        'Animais apreendidos vão para centros de triagem, onde são tratados antes de voltar para a natureza.'
      ]},
      { id: 'k-umbu', area: 2, x: 12, y: 6, tipo: 'item', sprite: 'umbuItem', item: 'umbu', falas: [
        'Você encontrou UMBUS, frutinhas azedinhas do umbuzeiro!',
        'No sertão, o umbu vira suco, doce e a famosa umbuzada.'
      ]},
      { id: 'k-zefa', area: 3, x: 5, y: 6, tipo: 'npc', sprite: 'zefa', nome: 'DONA ZEFA', voz: 1.15, pista: 'nao_compre', falas: [
        'Bom dia, criança! Sou a Dona Zefa, agricultora aqui do sertão.',
        'Na feira da cidade, vi passarinho preso em gaiola sendo vendido escondido. Me cortou o coração.',
        'Quem compra bicho silvestre está pagando o tráfico. Se ninguém comprar, ninguém captura!',
        'E muitos bichos morrem no caminho, presos e apertados. Lugar de passarinho é solto, cantando no pé de umbu.'
      ], falasDepois: [
        'Passarinho bonito é passarinho livre!'
      ]},
      { id: 'k-chico', area: 4, x: 11, y: 2, tipo: 'npc', sprite: 'vaqueiro', nome: 'SEU CHICO, VAQUEIRO', voz: 0.8, pista: 'caraibeiras', item: 'rapadura', falas: [
        'Eita! Sou o Seu Chico, vaqueiro. Essa roupa de couro é o GIBÃO: protege dos espinhos da Caatinga.',
        'Desde menino eu via ararinhas nos pés de CARAIBEIRA, aquelas árvores de flor amarela na beira dos riachos.',
        'É nos ocos das caraibeiras que a ararinha faz o ninho. Sem caraibeira, não tem ararinha.',
        'Tome uma rapadura, para dar sustância na viagem!'
      ], falasDepois: [
        'Cuide das caraibeiras, que as ararinhas agradecem!'
      ]},
      { id: 'k-caminhonete', area: 5, x: 3, y: 6, tipo: 'veiculo', sprite: 'caminhonete', falas: [
        'A caminhonete do Zé Arapuca, cheia de gaiolas escondidas.',
        'Os animais traficados viajam apertados, sem água e sem comida. Muitos morrem no caminho.'
      ]},
      { id: 'k-gaiola1', area: 5, x: 14, y: 2, tipo: 'gaiola', sprite: 'gaiolaGalo', falas: [
        'Um GALO-DE-CAMPINA preso numa gaiola apertada.',
        'Ele é um dos pássaros mais traficados do Nordeste, por causa da cor e do canto.'
      ]},
      { id: 'k-gaiola2', area: 5, x: 5, y: 2, tipo: 'gaiola', sprite: 'gaiolaCanario', falas: [
        'Um CANÁRIO-DA-TERRA preso. Muitos são capturados por causa do canto bonito.'
      ]},
      { id: 'k-ze', area: 5, x: 11, y: 5, tipo: 'encontro', sprite: 'zeMundo' },
      { id: 'k-ararinha', area: 5, x: 13, y: 6, tipo: 'animal', sprite: 'ararinhaPresa',
        falas: ['(A ararinha-azul está presa numa gaiola. Primeiro é preciso convencer o ZÉ ARAPUCA!)'] }
    ],
    preBatalha: [
      { nome: 'ZÉ ARAPUCA', voz: 0.7, texto: 'Opa! Chegou um curioso... Esses passarinhos aqui? Tão "guardadinhos", vão pra feira!' },
      { nome: 'ZÉ ARAPUCA', voz: 0.7, texto: 'E essa ararinha azul vale uma fortuna! Ninguém vai estragar meu negócio!' },
      { texto: '(A ararinha-azul se debate dentro de uma gaiola apertada.)' }
    ],
    resgate: [
      { texto: '(A Polícia Ambiental leva as gaiolas apreendidas para um centro de triagem.)' },
      { texto: '(A ararinha-azul está fraca e com as penas machucadas. Você chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Muito bem! No centro de triagem, veterinários vão examinar e cuidar de cada animal.' },
      { nome: 'PROFESSOR', texto: 'Quando a ararinha estiver forte, a equipe do projeto vai soltá-la junto com o bando, perto das caraibeiras.' },
      { texto: '★ ARARINHA-AZUL RESGATADA! A ficha foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'ZÉ ARAPUCA',
      sprite: 'ze',
      animal: 'ararinhaPresa',
      furia: 100,
      voz: 0.7,
      intro: '* ZÉ ARAPUCA arma suas arapucas! A ararinha-azul está presa na gaiola.',
      observar: [
        '* ZÉ ARAPUCA: captura aves silvestres para vender ilegalmente.',
        '* Ele diz que "passarinho nasceu pra viver em gaiola". Não é verdade!'
      ],
      acoes: [
        { id: 'abrir', nome: 'Pedir para abrir as gaiolas', efeito: -15, repetir: true,
          texto: ['* Você aponta para as gaiolas e faz sinal para abri-las.'],
          fala: 'Abrir? E perder meu dinheiro? ...Bom, talvez uma.' },
        { id: 'extincao', nome: 'Contar a história da ararinha', pista: 'extincao', efeito: -35,
          texto: ['* Você conta que a ararinha-azul chegou a desaparecer da natureza por causa do tráfico.',
                  '* Esta ararinha pode ser uma das poucas que voltaram a voar livres!'],
          fala: 'Uma das últimas?! Eu... não sabia que era tão sério.' },
        { id: 'nao_compre', nome: 'Avisar que ninguém vai comprar', pista: 'nao_compre', efeito: -35,
          texto: ['* Você explica que quem compra bicho silvestre alimenta o tráfico.',
                  '* E que o povo do sertão não quer mais comprar: lugar de passarinho é livre!'],
          fala: 'Se ninguém compra... eu vou vender pra quem?' },
        { id: 'caraibeiras', nome: 'Mostrar as caraibeiras', pista: 'caraibeiras', efeito: -30,
          texto: ['* Você mostra as caraibeiras floridas na beira do riacho.',
                  '* É lá que a ararinha faz o ninho e cria os filhotes. É lá que ela tem que estar!'],
          fala: 'Lembro de ver ararinhas ali quando eu era menino...' },
        { id: 'comprar', nome: 'Comprar um passarinho para soltar', efeito: 10, repetir: true, errada: true,
          texto: ['* Você pensa em comprar um passarinho para soltar depois...',
                  '* Mas aí o Zé ganha dinheiro e vai capturar ainda mais!',
                  '* (Comprar, mesmo para soltar, alimenta o tráfico. Use o que você aprendeu!)'],
          fala: 'Opa, freguês! Tenho mais um monte!' }
      ],
      ataques: ['redes', 'gaiolas', 'arapucas'],
      sabores: [
        '* Os passarinhos piam baixinho nas gaiolas.',
        '* O sol do sertão esquenta as pedras.',
        '* A ararinha-azul olha para o céu.',
        '* Um mandacaru faz uma sombra fininha.'
      ],
      calmo: '* Zé Arapuca parece arrependido. Talvez seja hora de POUPAR.',
      pouparCedo: ['* Zé Arapuca ainda não quer largar o "negócio".'],
      vitoria: [
        { fala: 'Tá certo... Eu pegava passarinho desde menino. Achava que não fazia mal.' },
        { texto: '* Zé Arapuca entrega todas as gaiolas e desarma as arapucas.' },
        { texto: '* A Polícia Ambiental chega: capturar e vender animais silvestres é CRIME. Zé vai responder pelo que fez.' },
        { fala: 'E se eu usar o que sei sobre os pássaros para trabalhar como guia de observação de aves?' },
        { texto: '* Ótima ideia! Observar aves livres atrai visitantes e ajuda a proteger a Caatinga.' },
        { texto: '* Você poupou o ZÉ ARAPUCA!', som: 'vitoria' }
      ],
      derrota: [
        '* Você se enrolou nas redes...',
        '* Respire fundo e tente de novo. As aves contam com você!'
      ]
    }
  },
  6: {
    id: 'pantanal',
    titulo: 'O Tuiuiú e o Secão',
    animal: 'Tuiuiú', emoji: '🐦',
    ameaca: 'Seca extrema e incêndios',
    areaEncontro: 5,
    baiaSeca: true,        // a baía do encontro fica seca até o Secão ser poupado
    briefing: [
      'Recebi um pedido de socorro do PANTANAL!',
      'Uma seca fora do normal está secando as baías antes da hora, e focos de fogo estão aparecendo.',
      'Um filhote de tuiuiú caiu do ninho perto de uma baía seca. Quem está por trás disso é o SECÃO.',
      'Converse com quem vive no Pantanal: pescadores, peões e brigadistas. Eles sabem como a água funciona por lá.'
    ],
    ficha: [
      'Ave-símbolo do Pantanal, também chamada de jaburu.',
      'Pode passar de 1 metro de altura. Com as asas abertas, mede mais de 2 metros!',
      'Come peixes, caramujos e outros bichinhos que ficam presos nas baías durante a seca.',
      'O casal faz ninhos enormes no alto das árvores e costuma usar o mesmo ninho por vários anos.',
      'Ameaças: incêndios, secas extremas e a perda das árvores onde faz os ninhos.'
    ],
    entidades: [
      { id: 'p-placa1', area: 0, x: 5, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'PANTANAL. A maior planície alagável do mundo e Patrimônio Natural da Humanidade!',
        'Aqui vivem onças-pintadas, jacarés, ariranhas, araras-azuis e centenas de espécies de aves.'
      ]},
      { id: 'p-bene', area: 1, x: 11, y: 6, tipo: 'npc', sprite: 'pescadora', nome: 'DONA BENÊ', voz: 1.3, pista: 'pulso', falas: [
        'Bom dia! Sou a Dona Benê. Pesco nessas águas desde menina.',
        'Aqui a água tem ritmo: na CHEIA os rios transbordam e alagam o campo. Na SECA a água baixa e fica só nas baías.',
        'Esse vai e vem se chama PULSO DAS ÁGUAS. Na seca, os peixes se juntam nas baías e viram comida para o tuiuiú e outras aves.',
        'Mas seca demais, comprida demais, não é normal. Aí as baías somem e os bichos sofrem.'
      ], falasDepois: [
        'Cheia e seca, uma depois da outra. É assim que o Pantanal respira!'
      ]},
      { id: 'p-placa2', area: 2, x: 4, y: 2, tipo: 'placa', sprite: 'placa', falas: [
        'ATENÇÃO: em 2020, uma seca muito forte e grandes incêndios queimaram cerca de um quarto do Pantanal.',
        'Milhões de animais morreram. Prevenir o fogo e cuidar da água é tarefa de todos!'
      ]},
      { id: 'p-bocaiuva', area: 2, x: 12, y: 6, tipo: 'item', sprite: 'bocaiuva', item: 'bocaiuva', falas: [
        'Você encontrou BOCAIUVAS, frutos de uma palmeira comum no Pantanal e no Cerrado!',
        'A polpa amarelinha é doce e nutritiva.'
      ]},
      { id: 'p-tiao', area: 3, x: 5, y: 6, tipo: 'npc', sprite: 'peao', nome: 'SEU TIÃO', voz: 0.75, pista: 'nascentes', falas: [
        'Ô, de casa! Sou o Seu Tião, peão pantaneiro. Lido com gado nessas terras faz tempo.',
        'Sabia que quase toda a água do Pantanal vem de rios que nascem nas terras altas em volta?',
        'Quando desmatam lá em cima, as NASCENTES enfraquecem e a terra solta desce e entope os rios.',
        'Proteger as nascentes e as matas da beira do rio é proteger o Pantanal!'
      ], falasDepois: [
        'Água boa começa lá na nascente!'
      ]},
      { id: 'p-iara', area: 4, x: 11, y: 2, tipo: 'npc', sprite: 'iara', nome: 'IARA, BRIGADISTA', voz: 1.2, pista: 'brigada', item: 'cantil', falas: [
        'Oi! Eu sou a Iara, da brigada comunitária. Aqui no Pantanal tem brigadas nas aldeias, nas fazendas e nas cidades.',
        'Na seca, a gente fica de olho no horizonte procurando fumaça.',
        'Fogo descoberto cedo é pequeno e fácil de apagar. Se ver fumaça, chame a brigada ou os Bombeiros pelo 193!',
        'Leve este cantil. Com esse calor, você vai precisar!'
      ], falasDepois: [
        'Viu fumaça? Avise logo!'
      ]},
      { id: 'p-secao', area: 5, x: 10, y: 3, tipo: 'encontro', sprite: 'secaoMundo' },
      { id: 'p-ninho', area: 5, x: 13, y: 3, tipo: 'ninho', falas: [
        'No alto da piúva está o ninho do tuiuiú, feito de galhos.',
        'O casal costuma usar o mesmo ninho por vários anos!'
      ]},
      { id: 'p-filhote', area: 5, x: 12, y: 5, tipo: 'animal', sprite: 'filhote',
        falas: ['(O filhote de tuiuiú está fraco. Primeiro é preciso acalmar o SECÃO!)'] },
      { id: 'p-fogo1', area: 5, x: 14, y: 6, tipo: 'fogo' },
      { id: 'p-fogo2', area: 5, x: 9, y: 7, tipo: 'fogo' }
    ],
    preBatalha: [
      { nome: 'SECÃO', voz: 0.5, texto: 'Ahh, que calorzinho bom! Baía seca, capim seco... PERFEITO!' },
      { nome: 'SECÃO', voz: 0.5, texto: 'Esse filhote aí? Vai ter que se virar sem água!' },
      { texto: '(O filhote de tuiuiú pia, fraco, no chão rachado.)' }
    ],
    resgate: [
      { texto: '(A chuva apagou os focos de fogo. A baía começa a encher de novo!)' },
      { texto: '(O filhote de tuiuiú está fraco. Você mantém distância e chama o Professor pelo rádio.)' },
      { nome: 'PROFESSOR', texto: 'Ótimo trabalho! Filhote caído do ninho não deve ser pego por quem não tem treino.' },
      { nome: 'PROFESSOR', texto: 'A equipe de resgate vai cuidar dele. Quando estiver forte, ele volta para perto da família.' },
      { texto: '★ FILHOTE DE TUIUIÚ RESGATADO! A ficha foi adicionada à BIOMADEX.', som: 'vitoria' }
    ],
    batalha: {
      nome: 'SECÃO',
      sprite: 'secao',
      animal: 'filhote',
      furia: 100,
      voz: 0.5,
      intro: '* O SECÃO aparece no meio da baía seca! O filhote de tuiuiú está sem forças.',
      observar: [
        '* SECÃO: uma seca fora do normal.',
        '* Ele seca as baías antes da hora e deixa o capim pronto para pegar fogo. Adora óculos escuros.'
      ],
      acoes: [
        { id: 'tregua', nome: 'Pedir uma trégua', efeito: -15, repetir: true,
          texto: ['* Você faz sinal de paz. O Secão abaixa um pouquinho os óculos...'],
          fala: 'Trégua? Eu nem suei ainda! ...Tá, um pouquinho.' },
        { id: 'pulso', nome: 'Explicar o pulso das águas', pista: 'pulso', efeito: -35,
          texto: ['* Você explica: no Pantanal, a cheia e a seca se revezam todo ano. É o PULSO DAS ÁGUAS.',
                  '* A seca concentra peixes e alimenta as aves. Mas, se a cheia não volta, tudo sofre.'],
          fala: 'Então... eu tenho que dar a vez para a cheia?' },
        { id: 'nascentes', nome: 'Proteger as nascentes', pista: 'nascentes', efeito: -35,
          texto: ['* Você mostra que os rios do Pantanal nascem nas terras altas ao redor.',
                  '* Com as nascentes e as matas da beira do rio protegidas, mais água chega até a planície.'],
          fala: 'Mais água?! Assim eu fico... molhado.' },
        { id: 'brigada', nome: 'Chamar a brigada', pista: 'brigada', efeito: -30,
          texto: ['* Você chama a brigada pelo rádio. Os brigadistas chegam rapidinho!',
                  '* Fogo descoberto cedo é pequeno e fácil de apagar.'],
          fala: 'Ei! Eles apagaram minhas faíscas!' },
        { id: 'queimar', nome: 'Queimar o capim seco', efeito: 10, repetir: true, errada: true,
          texto: ['* Você pensa em queimar o capim seco para "limpar" o campo...',
                  '* Péssima ideia! Na seca, qualquer queimada pode virar um grande incêndio.',
                  '* (Use o que você aprendeu!)'],
          fala: 'ISSO! Mais calor pra mim!' }
      ],
      ataques: ['rachaduras', 'raios', 'redemoinhos'],
      sabores: [
        '* A terra da baía está toda rachada.',
        '* O filhote de tuiuiú pia baixinho.',
        '* Um calor seco sobe do chão.',
        '* Os últimos peixes se juntam na pouca água que sobrou.'
      ],
      calmo: '* O Secão parece mais fresco. Talvez seja hora de POUPAR.',
      pouparCedo: ['* O Secão ainda está quente demais para ouvir.'],
      vitoria: [
        { fala: 'Ufa... está ficando úmido por aqui...' },
        { texto: '* Nuvens escuras chegam. Começa a chover!', encolher: true },
        { fala: 'Tá bom, tá bom! Eu volto só na época certa, e não tão forte.' },
        { texto: '* No Pantanal, a seca e a cheia precisam se revezar. Esse ritmo mantém o bioma vivo.' },
        { texto: '* Você poupou o SECÃO!', som: 'vitoria' }
      ],
      derrota: [
        '* O calor te deixou sem fôlego...',
        '* Beba água, respire fundo e tente de novo!'
      ]
    }
  }
};
