## Story: Code splitting por feature

**Como** mantenedor do Marco OS
**Quero** quebrar o carregamento de features pesadas em chunks menores
**Para** reduzir o peso inicial das páginas e adiar a carga de charts e subtelas até o momento de uso

### Acceptance Criteria
- [x] `Finance` carrega subtabs pesadas via lazy loading
- [x] `Dashboard` adia widgets pesados com `Suspense`
- [x] `Health` separa o painel de tendências em chunk próprio
- [x] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam

### Tasks
- [x] Criar story e registrar escopo
- [x] Aplicar lazy loading em subtabs de `Finance`
- [x] Aplicar lazy loading em widgets pesados de `Dashboard`
- [x] Extrair painel de tendências de `Health`
- [x] Validar os quality gates e revisar saída de build

### Checklist
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

### File List
- `docs/stories/STORY-2026-03-06-feature-code-splitting.md`
- `components/Dashboard.tsx`
- `components/Finance.tsx`
- `components/Health.tsx`
- `components/health/HealthTrendsPanel.tsx`
