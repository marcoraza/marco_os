# Story: Notes Second Brain, Daily Systems and Final Pass

## Context
Com agents e planner já mais operacionais, faltava elevar o uso recorrente: notas como memória navegável, finance/health mais acionáveis e um passe final de coesão suportado por helpers e testes.

## Scope
- Tornar Notes mais útil para organização e recuperação
- Melhorar ação diária em Finance e Health com base nos dados reais
- Consolidar helpers testáveis para o passe final do ciclo

## Checklist
- [x] Notas com favoritos, filtros úteis e relações rápidas
- [x] Finance com fechamento mensal e próximos vencimentos derivados dos dados
- [x] Health com streak e resumo semanal reais
- [x] Helpers novos cobertos por testes
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- components/NotesPanel.tsx
- components/finance/FinanceOverview.tsx
- components/Health.tsx
- data/models.ts
- lib/notesWorkflows.ts
- lib/dailySystems.ts
- tests/notes-and-daily-systems.test.ts
