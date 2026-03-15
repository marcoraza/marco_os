# Story: Projects, Agents, Planner and CRM Expansion

## Context
Depois da expansão operacional inicial, faltava fortalecer quatro superfícies com valor direto de produto: projeto como torre de controle, memória curta de agentes, planner com milestones simples e CRM com follow-ups reais.

## Scope
- Transformar o projeto ativo em uma control tower mais clara
- Expor memória operacional recente no detalhe do agente
- Enriquecer o planner com milestones derivados do plano
- Trocar o CRM de filas fake para follow-ups reais derivados dos contatos

## Checklist
- [x] Project switcher com resumo operacional do projeto ativo
- [x] Agent detail com dispatches recentes
- [x] Planner com milestones simples derivados
- [x] CRM com fila de follow-up real e timeline derivada
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- App.tsx
- components/AgentDetailView.tsx
- components/CRM.tsx
- components/Planner.tsx
- components/layout/ProjectSwitcher.tsx
- data/models.ts
- lib/projectControl.ts
- tests/project-control.test.ts
