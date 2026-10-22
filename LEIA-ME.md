# Biomas do Brasil

Jogo educativo no estilo Undertale: explore os 6 biomas do Brasil, descubra pistas e resgate animais **sem machucar ninguém**.

🎮 **Jogue agora:** https://adrieusnake.github.io/biomas-do-brasil/

## Como rodar
Abra a pasta com um servidor local (por exemplo `python servidor.py`, que evita o navegador usar arquivos antigos) e acesse `http://localhost:8765`.

### No tablet
Com o servidor rodando no PC, conecte o tablet na mesma rede Wi-Fi e abra `http://<IP-do-PC>:8765`.
O modo toque liga sozinho. Para jogar em tela cheia: botão ⛶ (Android) ou "Adicionar à Tela de Início" (iPad).

## Publicar uma nova versão
O site é publicado pelo **GitHub Pages** a partir da branch `main`. Para atualizar:

```bash
git add -A
git commit -m "Descreva a mudança"
git push
```

Em 1 ou 2 minutos o site atualiza sozinho.

## Estrutura
| Arquivo | O que tem |
|---|---|
| `js/dados.js` | **Todo o conteúdo**: biomas, mapas das áreas, companheiros, missões, falas, ações da batalha. Edite aqui para revisar textos. |
| `js/mundo.js` | Exploração: chão, vegetação, colisão, trilhas, minimapa. |
| `js/batalha.js` | Batalha: menu OBSERVAR/AGIR/ITEM/POUPAR, padrões de ataque, desvio. |
| `js/dialogo.js` | Caixa de diálogo com texto letra a letra. |
| `js/jogo.js` | Estado, controles, painéis (mapa, companheiros, Biomadex), salvamento. |
| `js/trilha.js` | Fase secreta "Trilha do Boto" (estilo Pitfall): entre falando com um boto na Amazônia. O mapa da corrida fica em `TRILHA_MAPA`. |
| `js/rio.js` | Minijogo secreto "Corrida do Jacaré" (estilo River Raid): entre falando com o jacaré do Pantanal. Libera a ficha bônus e guarda o recorde. |
| `js/toque.js` | Modo tablet: layout em tela cheia, direcional deslizante, tocar para andar, toques na batalha, tela cheia. |
| `js/pixel.js` | Sprites provisórios desenhados em código (NPCs, Fumaréu, lobo-guará...) e os 6 companheiros (`COMP_MAPAS`, 2 quadros de caminhada cada). |
| `assets/` | PNGs do rascunho original (árvores, terreno, professor, jogador). |

## Como criar uma nova missão
Copie o bloco `MISSOES[1]` (Cerrado) em `js/dados.js`, troque as entidades, as falas e a `batalha`, e inclua o bioma em `ORDEM_MISSOES`.
Novos padrões de ataque entram em `PADROES` no `js/batalha.js`.
