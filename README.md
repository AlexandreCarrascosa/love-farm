# Love Farm 🌼

Um refúgio de fazenda em **vista aérea**, com terreno natural detalhado, nuvens volumosas em movimento, sombras, miosótis e uma surpresa romântica. HTML, CSS e JavaScript puro, sem banco de dados ou dependências externas.

**Jogar:** https://alexandrecarrascosa.github.io/love-farm/

## Uso local

Abra `index.html` em um navegador moderno. Mantenha a pasta `assets` junto dos arquivos: as imagens são locais e o jogo funciona offline.

O jogo ocupa toda a janela, sem rolagem. O botão **Tela cheia** também permite esconder a interface do navegador quando suportado.

- **WASD / setas:** caminhar; no celular, use os botões sobre o cenário.
- **+ / − / roda do mouse:** aproximar ou afastar a câmera. Ao aproximar e caminhar, a câmera acompanha o personagem.
- **Arrastar o cenário:** mover a câmera.
- **⌖:** enquadrar a fazenda inteira.
- **Colheita automática:** iniciar a sequência de 36 segundos. A câmera se afasta para mostrar as mensagens.
- **Ⅱ / ▷:** pausar e continuar.
- **Repetir a surpresa:** restaurar as flores e recomeçar.
- **♪:** ativar/desativar a melodia, desligada inicialmente.
- **≈:** reduzir movimentos decorativos; respeita a preferência do sistema ao abrir. Os movimentos essenciais da colheita permanecem; use Pausar quando desejar.
- **Cartão / flor azul:** ver o detalhe das miosótis. Escape fecha o detalhe.

O avião prepara a decolagem na pista e escreve **A ❤️ R** em fumaça sobre o terreno. O trator percorre o canteiro, revelando **I LOVE U** entre as flores azuis.

## Projeto

- `index.html` e `style.css`: interface sobre o jogo, responsiva e sem margens.
- `game.js`: renderização Canvas, câmera, veículos, nuvens, controles e áudio.
- `farm-core.js`: trajetórias e cronologia da surpresa.
- `assets/farm-aerial.webp`: cenário aéreo realista.
- `assets/cloud.webp`: nuvem com transparência.
- `assets/README.md`: origem das artes e prompts usados.
- `tests/core.test.cjs`: verificações da geometria e da sequência.

As camadas de terreno, flores, fumaça e sombras das nuvens são armazenadas em memória para evitar redesenhar detalhes estáticos a cada quadro.

## Publicação

O GitHub Pages está configurado para publicação por GitHub Actions. Cada envio para `main` verifica o JavaScript, executa os testes e publica os arquivos, incluindo `assets/`. Não é necessário adicionar segredos ao código.

Para outro repositório, envie o conteúdo desta pasta para a raiz e selecione **Settings → Pages → Source → GitHub Actions**.

## Verificações

Com Node.js 22 ou superior (opcional; não necessário para jogar):

```sh
node --check game.js
node --check farm-core.js
node --test tests/core.test.cjs
```

A reformulação foi verificada no navegador em tela de computador, celular vertical e horizontal: carregamento offline, movimento, zoom, tela cheia, detalhe das flores, colheita progressiva, pausa, mensagens completas, repetição e som.

Sem rastreamento, armazenamento de dados pessoais ou chamadas de rede durante o jogo. O estado recomeça ao recarregar.