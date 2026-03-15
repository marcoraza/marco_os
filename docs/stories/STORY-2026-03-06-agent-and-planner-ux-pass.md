# Story: Agent and Planner UX Pass

## Context
Os fluxos de agentes, planner e notes estavam funcionais, mas ainda com falhas silenciosas e estados vazios pouco guiados. Esta rodada melhora a confiabilidade perceptível sem alterar a arquitetura principal.

## Scope
- Melhorar feedback de dispatch em Mission Control
- Tornar o contexto operacional do agente mais claro em AgentDetailView
- Dar feedback visível para comentarios e erros de status no kanban de agentes
- Melhorar clareza de filtros vazios no planner
- Acelerar criacao e captura em notes

## Checklist
- [x] Feedback de sucesso/erro em dispatch de missao
- [x] Resumo operacional no detalhe do agente
- [x] Feedback de comentario enviado no kanban
- [x] Estado vazio filtrado no planner
- [x] CTA de brain dump e criacao mais clara em notes
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- components/AgentCommandCenter.tsx
- components/AgentDetailView.tsx
- components/agents/AgentKanban.tsx
- components/Planner.tsx
- components/NotesPanel.tsx
