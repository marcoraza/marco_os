# Story: Tests, Polish and Final Optimization

## Context
A base ja estava estavel, mas ainda faltava ampliar cobertura nos pontos criticos, unificar parte do feedback visual e fechar pequenos gargalos restantes no shell.

## Scope
- Cobrir helpers criticos de roster, validacao e feedback visual
- Padronizar variantes de toast e reaproveitar empty states
- Tirar o sync de status do caminho inicial do shell com import dinamico
- Validar bundle final sem regressao

## Checklist
- [x] Testes para roster live, validacao de missao e feedback visual
- [x] Toast com variantes reais de sucesso, erro e info
- [x] Empty states mais consistentes em planner, notes e agent detail
- [x] Import dinamico para sync de status no app shell
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- App.tsx
- components/AgentDetailView.tsx
- components/MissionModal.tsx
- components/NotesPanel.tsx
- components/Planner.tsx
- components/ui/Toast.tsx
- hooks/useAgentRosterSync.ts
- tests/workflows-and-feedback.test.ts
