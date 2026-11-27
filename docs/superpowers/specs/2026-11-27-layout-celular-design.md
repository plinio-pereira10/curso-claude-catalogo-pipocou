# Layout no celular (topo e filtros) — Design

## Por quê

No celular, a tela inicial empilha coisas demais antes do conteúdo: logado, o menu do topo ocupa
4 linhas (logo + abas · conta · busca · streamings) e os filtros mais 4 linhas desalinhadas
(Gênero · Nota · Ordem · Todos/Doramas). O uso principal no celular é **olhar o que tem de novo em
cada streaming**, ou seja, chegar rápido ao banner e às fileiras.

## Objetivos

- Topo com **2 linhas** no celular, logado ou não.
- Filtros com **1 linha** no celular (botão "Filtros" + Todos/Doramas).
- Banner e fileiras aparecem mais cedo.

## Não-objetivos

- **Notebook / telas a partir de 640px (`sm:`) não mudam.** Tudo aqui vale só abaixo disso.
- Não muda o que os filtros fazem, nem a URL, nem a busca no servidor.
- Não muda o banner, as fileiras nem os cartões.

## Anti-objetivos (seria falha mesmo funcionando)

- Esconder os streamings ou o Doramas atrás de menus no celular.
- Quebrar o uso por teclado / leitor de tela (botões novos precisam de nome e foco visível).
- Fazer o "Entrar" ou a conta piscar no carregamento (hoje a conta fica em `<Suspense fallback={null}>`).

## Abordagens consideradas

- **A · Compacto — escolhida pelo dono.** 2 linhas no topo; busca vira ícone; conta vira o círculo
  com menu; Gênero/Nota/Ordem num painel "Filtros"; Doramas à vista.
- **B · Faixas que rolam.** 3 linhas no topo (busca sempre à vista); filtros numa faixa que rola.
  Descartada: o topo continua mais alto.
- **C · Mínimo.** 2 linhas, abas e streamings numa faixa só; tudo de filtro no painel. Descartada:
  esconde Doramas e deixa as abas menos visíveis.

## Como fica (celular)

```
┌──────────────────────────────────────┐
│ 🍿Pipocou  [Filmes] Séries     🔍  (P) │  linha 1
│ [N][prime][tv][D+][P+][max][globo] → │  linha 2 (rola para o lado, como hoje)
├──────────────────────────────────────┤
│            banner                    │
├──────────────────────────────────────┤
│ [⚙ Filtros (2)]  [Todos|🌸 Doramas]   │  1 linha
│   (painel aberto: Gênero, Nota, Ordem)│
│ Netflix                    Ver todos │
```

### 1. Conta (círculo "P")

- Celular, logado: só o círculo com a inicial. Tocar abre um menu pequeno logo abaixo, alinhado à
  direita, com **Minhas listas** e **Sair**.
- Fecha ao tocar fora, ao apertar Esc ou ao escolher uma opção.
- Celular, sem login: o botão "Entrar" continua como hoje (cabe na linha 1).
- Notebook: igual a hoje ("Minhas listas" · círculo · "Sair").

### 2. Busca (ícone 🔍)

- Celular: na linha 1 aparece só o botão 🔍 ("Buscar"). Tocar abre uma linha com o campo de busca
  e o botão Buscar logo abaixo da linha 1, já com o cursor no campo, e um ✕ para fechar.
- Quando já existe uma busca na URL (`?q=`), a linha da busca já começa aberta, mostrando o texto.
- Notebook: campo sempre à vista, como hoje.

### 3. Filtros

- Celular: botão **"Filtros"** com o número de filtros ativos entre Gênero, Nota e Ordem
  (ex.: "Filtros (2)"; sem número quando nenhum). Tocar abre/fecha um painel logo abaixo, que
  empurra o conteúdo para baixo, com Gênero, Nota e Ordem um embaixo do outro, todos da mesma
  largura.
- Todos/Doramas fica ao lado do botão, sempre à vista.
- Durante uma busca, como hoje, os filtros ficam desligados e aparece o aviso da busca.
- Notebook: a faixa atual, sem botão.

## Decisões minhas (o dono pode corrigir)

- Painel de filtros abre **na própria página** (empurrando o conteúdo), não como gaveta por cima:
  mais simples e sem camada sobre o banner.
- A busca abre como **linha extra** abaixo da linha 1, em vez de cobrir o logo.
- O número em "Filtros (n)" conta só Gênero, Nota e Ordem diferentes do padrão (Doramas já está
  visível ao lado).
- Menu da conta é um componente cliente pequeno; a leitura do usuário continua no servidor
  (`AccountNav`), só a parte visual do celular muda.

## Deixado para quem implementa

- Estrutura dos componentes, nomes, classes Tailwind, ícones em SVG inline (o projeto não usa
  biblioteca de ícones).
- Testes de comportamento (abrir/fechar menu, painel e busca; contagem de filtros; nomes
  acessíveis) e conferência visual com fotos do Edge headless em celular e notebook.
- Acabamento visual com a skill `frontend-design`, dentro da paleta e fonte atuais.
