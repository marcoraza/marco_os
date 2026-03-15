## Story: Hardening da fundacao do frontend

**Como** mantenedor do Marco OS
**Quero** corrigir a base de tipagem, contratos de dados e configuracao minima do projeto
**Para** evoluir a aplicacao com menor risco de regressao e sem expor segredo explicitamente no bundle

### Acceptance Criteria
- [x] O projeto possui uma story registrada em `docs/stories/`
- [x] A configuracao do Vite/TypeScript suporta `import.meta.env` corretamente
- [x] O contrato de chat persistido deixa de apontar para tipos e stores inexistentes
- [x] As duplicacoes estruturais em `data/models.ts` sao removidas
- [x] O bundle deixa de injetar `GEMINI_API_KEY` via `define`

### Tasks
- [x] Criar story e registrar escopo
- [x] Corrigir configuracao base de ambiente e tipagem
- [x] Ajustar schema do IndexedDB para sessoes de chat
- [x] Atualizar documentacao basica do projeto
- [x] Validar build/typecheck e registrar resultados

### Dev Notes
- Escopo desta rodada: fundacao tecnica. Nao inclui refatoracao completa de arquitetura nem remocao total de tokens `VITE_*` do browser.

### Checklist
- [x] `npm run build`
- [x] `npm run typecheck`

### File List
- `docs/stories/STORY-2026-03-05-foundation-hardening.md`
- `.env.example`
- `App.tsx`
- `README.md`
- `components/CommandPalette.tsx`
- `components/capture/QuickCaptureModal.tsx`
- `components/dashboard/KanbanBoard.tsx`
- `components/finance/FinanceCashflow.tsx`
- `components/finance/FinanceCrypto.tsx`
- `components/finance/FinanceDebts.tsx`
- `components/finance/FinanceInvestments.tsx`
- `components/finance/FinanceTransactions.tsx`
- `components/ui/Card.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/FilterPills.tsx`
- `components/ui/FormModal.tsx`
- `components/ui/SectionJourney.tsx`
- `components/ui/StatusDot.tsx`
- `components/ui/TabNav.tsx`
- `components/ui/Toast.tsx`
- `data/db.ts`
- `data/models.ts`
- `hooks/useHotkeys.ts`
- `package-lock.json`
- `package.json`
- `tsconfig.json`
- `vite-env.d.ts`
- `vite.config.ts`
