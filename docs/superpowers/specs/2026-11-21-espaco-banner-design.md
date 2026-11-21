# Espaço entre o menu e o banner — design

## Problema

Na tela inicial, o conteúdo do banner (selo do streaming, logo do filme, nota, sinopse, botão) é alinhado por baixo dentro de uma altura fixa (70% da tela). Quando o filme tem logo grande e sinopse de 3 linhas, o conteúdo sobe e o selo do streaming fica colado no menu do topo (que fica por cima do banner).

## Solução escolhida (opção C)

1. **Selo junto da nota:** o logo do streaming sai do topo do conteúdo e vai para a linha da nota, com o nome ao lado: `[logo] Paramount+   ★ 7,8   2024`. O logo vira decorativo (`alt=""`), porque o nome já aparece em texto (leitor de tela não lê duas vezes).
2. **Margem reservada no topo:** o conteúdo ganha `pt-36` (celular, onde o menu tem duas linhas) e `sm:pt-28` (telas maiores). O banner passa de altura fixa para altura mínima (`min-h-[max(75vh,34rem)]`, `sm:min-h-[max(65vh,28rem)]`, `lg:min-h-[max(70vh,28rem)]`): em tela baixa, ele cresce em vez de o conteúdo subir.

## Fora do escopo

Menu do topo, bolinhas, rotação e fade continuam iguais.
