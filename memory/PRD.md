# Caça-Palavras Tech — PRD
## Problema original
Jogo de caça-palavras com 25 palavras (peças do computador e aplicativos de PC), guia lateral que risca a palavra encontrada e explica para que serve.
## Escolhas
Ensino fundamental; horizontal/vertical/diagonal (sem invertidas); nova grade por partida; cronômetro + ranking; tudo em MAIÚSCULAS.
## Implementado (2026-06)
- Grade 16x16 aleatória, seleção por arrastar (mouse/toque), 15 peças + 10 aplicativos
- Guia lateral com risco automático, modal explicativo, reabrir explicação
- Cronômetro, dica (+10s), novo jogo, tela de vitória, ranking (FastAPI + MongoDB /api/scores, top 10)
## Backlog
- P1: Níveis de dificuldade (tamanho da grade/palavras invertidas)
- P2: Sons e confete na vitória, modo professor com listas próprias
