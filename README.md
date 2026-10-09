# Love Farm 🌼

Uma pequena fazenda ilustrada, feita com HTML, CSS e JavaScript puro. Funciona offline, sem instalação, banco de dados, fontes remotas ou bibliotecas externas.

## Jogar no computador

Abra **index.html** com um navegador moderno. Mantenha os arquivos da pasta juntos.

- **WASD ou setas:** caminhar pela fazenda.
- **Colheita automática:** iniciar a surpresa de aproximadamente 36 segundos.
- **Pausar / Continuar:** pausar e retomar a sequência.
- **Repetir a surpresa:** replantar o campo e assistir novamente.
- **Som:** ativar uma melodia suave, sintetizada no próprio navegador; começa desligado.
- **Movimento reduzido:** desativar o balanço das flores, as borboletas e movimentos decorativos. Os movimentos essenciais da colheita permanecem; use Pausar quando desejar. A preferência do sistema é respeitada ao abrir.
- **No celular:** usar o controle de setas na tela. Girar o aparelho pode facilitar a visualização.
- **Cartão das miosótis:** abrir o detalhe das flores; Escape fecha o detalhe.

O avião aquece a hélice, percorre a pista, decola e desenha **A ❤️ R** com fumaça. O trator atravessa o campo e corta as flores nas células que formam **I LOVE U**, deixando o restante do jardim azul. As miosótis têm cinco pétalas azuis e centro amarelo, além de um canteiro permanente com plaquinha.

## Publicação no GitHub Pages

O projeto inclui `.github/workflows/pages.yml`. No repositório, configure **Settings → Pages → Build and deployment → Source → GitHub Actions**. Cada envio para `main` executa os testes e publica os arquivos estáticos. Nenhum segredo precisa ser adicionado ao código.

Para um novo repositório, envie **o conteúdo desta pasta** para a raiz. A pasta `.github` também precisa ser enviada. O nome do repositório pode ser `love-farm`.

## Arquivos

- `index.html`: interface, instruções e detalhe das flores.
- `style.css`: layout responsivo.
- `farm-core.js`: geometria das mensagens e cronologia da sequência.
- `game.js`: desenho Canvas, animação, som e controles.
- `favicon.svg`: ícone local.
- `tests/core.test.cjs`: verificações da trajetória, desenho e cronologia.

## Verificação de desenvolvimento

O jogo não precisa de Node.js. Para executar os testes opcionais com Node.js 22 ou superior:

```sh
node --check game.js
node --check farm-core.js
node --test tests/core.test.cjs
```

Toda a ilustração é desenhada pelo código. Não há rastreamento, pedidos de rede ou armazenamento de dados pessoais. O estado é reiniciado ao recarregar a página.
