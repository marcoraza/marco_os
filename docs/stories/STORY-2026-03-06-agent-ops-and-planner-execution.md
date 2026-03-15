# Story: Agent Ops Continuity and Planner Execution

## Context
O bloco inicial de agentes melhorou dispatch e leitura rápida, mas ainda faltava visão operacional por agente. No planner, o fluxo já gerava plano e exportava tarefas, mas ainda sem continuidade explícita nem reconciliação visível com a execução.

## Scope
- Fechar a continuidade operacional dos agentes no Mission Control
- Aproximar planner de execução com export estruturado e retomada do último plano
- Adicionar helpers e testes para o workflow do planner

## Checklist
- [x] Mission Control com visão operacional curta por agente
- [x] Planner com retomada do último plano e rascunho persistido
- [x] Export do plano registrando vínculo com tarefas geradas
- [x] Resumo de execução do plano dentro do planner
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- components/AgentCommandCenter.tsx
- components/AppContentRouter.tsx
- components/Planner.tsx
- data/models.ts
- hooks/useAppDomainActions.ts
- lib/plannerWorkflows.ts
- tests/planner-workflows.test.ts
