# Love Farm 🌼

Um refúgio de fazenda em **vista aérea**, com terreno natural detalhado, nuvens volumosas em movimento, sombras, miosótis e uma surpresa romântica. HTML, CSS e JavaScript puro, sem banco de dados nem dependências externas para jogar.

**Jogar:** https://alexandrecarrascosa.github.io/love-farm/

## Uso local

Abra `index.html` em um navegador moderno. Mantenha a pasta `assets` junto dos arquivos: as imagens são locais e o jogo funciona offline. O player opcional do Spotify exige conexão com a internet.

O jogo ocupa toda a janela, sem rolagem. O botão **Tela cheia** também permite esconder a interface do navegador quando suportado.

- **WASD / setas:** caminhar; no celular, use os botões sobre o cenário.
- **+ / − / roda do mouse:** aproximar ou afastar a câmera (ou faça pinça no celular). Ao aproximar e caminhar, a câmera acompanha o personagem.
- **Arrastar o cenário:** mover a câmera.
- **⌖:** enquadrar a fazenda inteira.
- **Colheita automática:** iniciar a sequência de 36 segundos. A câmera se afasta para mostrar as mensagens.
- **Ⅱ / ▷:** pausar e continuar.
- **Repetir a surpresa:** restaurar as flores e recomeçar.
- **♪ Música:** abrir o player oficial da faixa no Spotify. Clique em Play no player; a disponibilidade e a duração da reprodução dependem do Spotify e do navegador. Há também um link para abrir a faixa no Spotify.
- **≈:** reduzir movimentos decorativos; respeita a preferência do sistema ao abrir. Os movimentos essenciais da colheita permanecem; use Pausar quando desejar.
- **Cartão / flor azul:** ver o detalhe das miosótis. Escape fecha o detalhe.

O avião prepara a decolagem na pista e escreve **A ❤️ R** em fumaça sobre o terreno. O trator percorre o canteiro, revelando **I LOVE U** entre as flores azuis.

## Projeto

- `index.html` e `style.css`: interface sobre o jogo, responsiva e sem margens.
- `game.js`: renderização Canvas, câmera, veículos, nuvens, controles e integração do player oficial.
- `farm-core.js`: trajetórias e cronologia da surpresa.
- `assets/farm-aerial.webp`: cenário aéreo realista.
- `assets/cloud.webp`: nuvem com transparência.
- `assets/README.md`: origem das artes, licença da fotografia e prompts usados.
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

A reformulação foi verificada no navegador em tela de computador, celular vertical e horizontal: carregamento offline do jogo, movimento, zoom, tela cheia, detalhe das flores, colheita progressiva, pausa, mensagens completas e repetição.

O jogo em si não usa rastreamento nem armazena dados pessoais. O player do Spotify só é carregado quando você abre o painel de música e segue as políticas da plataforma. A preferência de hemisfério pode ser salva localmente. O estado recomeça ao recarregar.
## Paisagem contínua e ambiente em tempo real

A câmera agora utiliza um mapa ampliado único (`assets/farm-world.webp`), sem espelhamento, repetição de textura ou faixas nas bordas. Seus limites garantem cobertura completa também em retrato, paisagem e telas ultralargas. No celular, use as setas para andar, arraste para olhar ao redor e faça o gesto de pinça para aproximar ou afastar; os botões de zoom continuam disponíveis. A visão geral enquadra o campo e as mensagens, ajustando o trecho visível à proporção da tela.

O painel superior informa **hora local, período do dia, estação e fase da Lua**, incluindo percentual iluminado. A luz passa por amanhecer, dia, entardecer e noite; as cores acompanham a estação e a fazenda acende luzes à noite. As informações são recalculadas a cada minuto e ao voltar para a aba.

As estações seguem os equinócios e solstícios calculados. O padrão é **Hemisfério Sul (Brasil)**; toque no painel para alternar para o Norte. Somente essa preferência é guardada no dispositivo. A fase lunar usa o instante atual, sem chamadas de rede. A iluminação é uma interpretação do relógio local, não uma previsão meteorológica nem um cálculo de nascer do Sol para a localização exata.

O projeto inclui uma cópia local do **Astronomy Engine 2.1.19**, com licença MIT em `vendor/`. Continua funcionando offline e não precisa de instalação nem de dependências externas em tempo de execução.

Verificações adicionais: `node --test tests/*.test.cjs`. Incluem cobertura de câmera em diferentes telas e zooms, mudanças de estação, fases lunares comparadas às datas do USNO e iluminação ao meio-dia/meia-noite.
