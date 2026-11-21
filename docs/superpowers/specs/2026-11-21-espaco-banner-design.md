# Espaço entre o menu e o banner — design

## Problema

Na tela inicial, o conteúdo do banner (selo do streaming, logo do filme, nota, sinopse, botão) é alinhado por baixo dentro de uma altura fixa (70% da tela). Quando o filme tem logo grande e sinopse de 3 linhas, o conteúdo sobe e o selo do streaming fica colado no menu do topo (que fica por cima do banner).

## Solução escolhida (opção C)

1. **Selo junto da nota:** o logo do streaming sai do topo do conteúdo e vai para a linha da nota, com o nome ao lado: `[logo] Paramount+   ★ 7,8   2024`. O logo vira decorativo (`alt=""`), porque o nome já aparece em texto (leitor de tela não lê duas vezes).
2. **Espaço garantido para o menu:** o menu do topo (`TopBar overlay`) passa a ser renderizado **dentro** do banner (prop `header` do `HeroBanner`), em fluxo normal (`relative`, não `absolute`). Assim ele empurra o conteúdo pela altura real dele — que varia de 1 a 4 linhas (no celular: logo+abas, busca, conta, logos dos streamings). A primeira versão usava `pt-36`/`sm:pt-28` fixos, mas o revisor mostrou que a linha dos streamings não cabia nessa conta. O banner passa de altura fixa para altura mínima (`min-h-[max(75vh,34rem)]`, `sm:min-h-[max(65vh,28rem)]`, `lg:min-h-[max(70vh,28rem)]`): em tela baixa, ele cresce em vez de o conteúdo subir.
3. **Mesma altura para todos os destaques:** o título tem altura fixa (`h-24 sm:h-28`; título em texto com no máximo 2 linhas, `text-5xl`) e a sinopse sempre ocupa 3 linhas (`min-h-[3lh]`). Assim, quando o banner cresce numa tela baixa, ele não muda de altura a cada troca de destaque (a página não "pula").

## Fora do escopo

Menu do topo, bolinhas, rotação e fade continuam iguais.
