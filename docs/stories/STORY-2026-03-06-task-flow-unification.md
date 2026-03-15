# Story: Task Flow Unification

## Context
Ainda havia dois desvios no fluxo de tarefas: o quick capture do dashboard usava um caminho paralelo ao resto da app e a mudanca de status em mission detail nao sincronizava o backend quando esse canal existia.

## Scope
- Reusar as mesmas factories de captura de tarefa no dashboard
- Sincronizar status alterado em mission detail
- Remover duplicacao de extractor no Mission Control Bar

## Checklist
- [x] Dashboard quick capture usa factory compartilhada
- [x] Mission detail propaga sync de status quando disponivel
- [x] Mission Control Bar reaproveita providerData
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- components/Dashboard.tsx
- components/AppContentRouter.tsx
- components/dashboard/MissionControlBar.tsx
