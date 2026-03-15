# Marco OS — Roadmap Operacional

**Base:** [PRD Atualizado](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/docs/marco-os-prd-v2.md)  
**Data:** 06/03/2026  
**Objetivo:** transformar o PRD em sequência executável de sprints curtos e defensáveis

---

## 1. North Star

Chegar num ponto em que o Marco OS seja:
- o ponto de entrada da operação diária
- rápido para abrir e usar
- confiável para planejar, executar e revisar
- simples de evoluir sem reintroduzir dívida estrutural

---

## 2. Regras de Execução

- Cada sprint deve nascer com story em `docs/stories/`
- Cada sprint deve fechar com:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- Sem abrir infraestrutura nova se o ganho puder vir de estado local, provider atual ou UI existente
- Priorizar fluxo real antes de feature cosmética

---

## 3. Bloco R1 — Weekly Review 2.0

### Objetivo
Transformar a revisão semanal em artefato navegável e recorrente, não só widget.

### Sprint R1.1 — Weekly Review Records
- criar registro persistido de review semanal
- salvar highlights, pendências, decisões e foco seguinte
- permitir revisar semanas anteriores

**Entregáveis**
- store local de weekly reviews
- UI de histórico
- CTA explícito para iniciar review

### Sprint R1.2 — Cross-Domain Weekly Summary
- consolidar tarefas, saúde, finanças, CRM e learning
- gerar resumo semanal mais útil
- destacar o que melhorou e o que degradou

**Entregáveis**
- resumo semanal com sinais cruzados
- cards de highlights e risco
- leitura rápida de progresso/atrito

### Sprint R1.3 — Review to Action
- converter achados da review em tarefas/notas/decisões
- ligar review com planner e notes
- reduzir retrabalho manual pós-review

**Definição de pronto**
- revisão semanal pode ser iniciada, salva, revisitada e convertida em ação

---

## 4. Bloco R2 — Agent Operations 3.0

### Objetivo
Fazer agents operar com mais memória, fila e clareza de capacidade.

### Sprint R2.1 — Agent Capacity
- mostrar carga por agente
- sinalizar gargalo e ociosidade
- destacar falhas recentes e tendência operacional

### Sprint R2.2 — Mission Pattern Library
- evoluir templates por tipo de missão
- reaproveitar padrões de dispatch
- guardar melhores sequências por agente/papel

### Sprint R2.3 — Operational History
- histórico mais profundo por agente
- visão de “o que fez hoje/semana”
- ligação entre dispatch, run e resultado

**Definição de pronto**
- agente deixa de parecer efêmero e passa a ter memória operacional útil

---

## 5. Bloco R3 — Planner Execution 3.0

### Objetivo
Aproximar mais plano e trabalho real.

### Sprint R3.1 — Bidirectional Reconciliation
- reconciliar tarefas criadas com plano atual
- detectar tarefas divergentes
- destacar o que ficou fora do plano

### Sprint R3.2 — Incremental Execution
- export incremental mais explícito
- blocos/etapas do plano com progresso real
- melhor leitura do que já virou execução

### Sprint R3.3 — Edit Flow
- editar plano sem perder vínculo com tarefas
- reabrir e ajustar plano ativo
- reduzir fricção entre revisão e execução

**Definição de pronto**
- planner vira camada viva de acompanhamento, não só de geração

---

## 6. Bloco R4 — Executive Briefing 2.0

### Objetivo
Tornar o dashboard ainda mais decisivo na abertura do dia.

### Sprint R4.1 — Daily Priority Stack
- consolidar prioridades cruzando tasks, agents, finance, health e CRM
- deixar claro o top 3 do dia

### Sprint R4.2 — Expanded Brief
- versão curta no card
- versão expandida com contexto suficiente para ação
- leitura diferenciada manhã / resto do dia se fizer sentido

### Sprint R4.3 — Brief to Action
- atalhos do briefing abrirem a ação certa
- reduzir passo entre leitura e execução

**Definição de pronto**
- abrir dashboard e saber imediatamente o que precisa de atenção

---

## 7. Bloco R5 — Relationship Intelligence 2.0

### Objetivo
Levar CRM de “lista inteligente” para “radar relacional”.

### Sprint R5.1 — Follow-up Assistido
- sugerir follow-up por contexto
- gerar próxima ação melhor
- destacar follow-ups vencidos com mais clareza

### Sprint R5.2 — Segment View
- agrupar melhor clientes, parceiros, investidores e pessoal
- leituras por segmento
- fila operacional segmentada

### Sprint R5.3 — Relationship Memory
- enriquecer histórico de toque
- melhor timeline
- contexto operacional por contato

**Definição de pronto**
- CRM passa a dizer quem merece atenção e por quê

---

## 8. Bloco R6 — Final Consolidation

### Objetivo
Fechar o ciclo sem deixar arestas.

### Sprint R6.1 — Product Review Pass
- revisar consistência entre superfícies
- aparar microfricções

### Sprint R6.2 — Test Coverage Expansion
- cobrir helpers e fluxos novos dos blocos R1-R5
- manter suíte rápida

### Sprint R6.3 — Docs and Release Hygiene
- atualizar PRD se necessário
- atualizar README e stories
- consolidar backlog residual

**Definição de pronto**
- ciclo fecha com produto mais forte e documentação alinhada

---

## 9. Ordem Recomendada

1. `R1` Weekly Review 2.0
2. `R2` Agent Operations 3.0
3. `R3` Planner Execution 3.0
4. `R4` Executive Briefing 2.0
5. `R5` Relationship Intelligence 2.0
6. `R6` Final Consolidation

---

## 10. Critério de Priorização

Se houver disputa de foco, priorizar nesta ordem:
1. o que reduz troca de contexto real
2. o que melhora ação diária imediata
3. o que fecha loop entre planejar, agir e revisar
4. o que expande profundidade sem criar nova complexidade estrutural

---

## 11. Métricas Práticas por Bloco

### Weekly Review
- review semanal salva e reaproveitável
- menos fricção para sair da review com ações

### Agents
- mais clareza de carga e histórico
- menos fricção para delegar e acompanhar

### Planner
- menos divergência entre plano e tarefas
- mais continuidade entre sessões

### Briefing
- leitura rápida do top 3 do dia
- menos navegação cega entre telas

### CRM
- follow-ups mais claros
- melhor leitura de quem precisa de atenção

---

## 12. Próxima Execução Recomendada

Começar por:
1. `R1.1` Weekly Review Records
2. `R1.2` Cross-Domain Weekly Summary
3. `R1.3` Review to Action
