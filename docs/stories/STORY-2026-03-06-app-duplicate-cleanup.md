## Story: Limpeza de duplicados do app

**Como** mantenedor do Marco OS
**Quero** remover arquivos duplicados idênticos com sufixo ` 2`
**Para** reduzir ruído operacional, risco de drift e confusão sobre a fonte da verdade

### Acceptance Criteria
- [x] Os duplicados do app com sufixo ` 2` e conteúdo idêntico são removidos
- [x] O código de produção continua apontando para a mesma fonte da verdade
- [x] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam após a limpeza

### Tasks
- [x] Criar story e registrar escopo
- [x] Remover duplicados idênticos em `components/`, `contexts/`, `hooks/`, `public/data/` e `utils/`
- [x] Validar quality gates
- [x] Atualizar checklist e file list

### Dev Notes
- Escopo limitado aos duplicados do app já verificados como idênticos byte a byte.
- Não inclui limpeza de duplicados dentro de `.aios-core`, `node_modules` ou outros diretórios auxiliares.

### Checklist
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

### File List
- `docs/stories/STORY-2026-03-06-app-duplicate-cleanup.md`
- `components/dashboard/ActivityHeatmapWidget 2.tsx`
- `components/dashboard/DashboardWidgetGrid 2.tsx`
- `components/dashboard/MissionControlBar 2.tsx`
- `components/dashboard/MorningBriefCard 2.tsx`
- `components/dashboard/PredictiveWidgets 2.tsx`
- `components/finance/BudgetRing 2.tsx`
- `components/finance/FinancePatrimonio 2.tsx`
- `contexts/NotionDataContext 2.tsx`
- `hooks/useAgentChat 2.ts`
- `hooks/useFinanceData 2.ts`
- `hooks/useFlowState 2.ts`
- `hooks/useGhostMode 2.ts`
- `public/data/checklists 2.json`
- `public/data/content 2.json`
- `utils/statusTokens 2.ts`
