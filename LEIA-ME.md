# Biomas do Brasil — protótipo v0.2

Jogo educativo no estilo Undertale: explore 6 biomas, descubra pistas e resgate animais **sem machucar ninguém**.

## Como rodar
Abra a pasta com um servidor local (por exemplo `python servidor.py`, que evita o navegador usar arquivos antigos) e acesse `http://localhost:8765`.

### No tablet
Com o servidor rodando no PC, conecte o tablet na mesma rede Wi-Fi e abra `http://<IP-do-PC>:8765`.
O modo toque liga sozinho. Para jogar em tela cheia: botão ⛶ (Android) ou "Adicionar à Tela de Início" (iPad).

## Estrutura
| Arquivo | O que tem |
|---|---|
| `js/dados.js` | **Todo o conteúdo**: biomas, mapas das áreas, companheiros, missões, falas, ações da batalha. Edite aqui para revisar textos. |
| `js/mundo.js` | Exploração: chão, vegetação, colisão, trilhas, minimapa. |
| `js/batalha.js` | Batalha: menu OBSERVAR/AGIR/ITEM/POUPAR, padrões de ataque, desvio. |
| `js/dialogo.js` | Caixa de diálogo com texto letra a letra. |
| `js/jogo.js` | Estado, controles, painéis (mapa, companheiros, Biomadex), salvamento. |
| `js/toque.js` | Modo tablet: layout em tela cheia, direcional deslizante, tocar para andar, toques na batalha, tela cheia. |
| `js/pixel.js` | Sprites provisórios desenhados em código (NPCs, Fumaréu, lobo-guará...) e os 6 companheiros (`COMP_MAPAS`, 2 quadros de caminhada cada). |
| `assets/` | PNGs do rascunho original (árvores, terreno, professor, jogador). |

## Como criar uma nova missão
Copie o bloco `MISSOES[1]` (Cerrado) em `js/dados.js`, troque as entidades, as falas e a `batalha`, e remova `emBreve: true`.
Novos padrões de ataque entram em `PADROES` no `js/batalha.js`.
