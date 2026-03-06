## Story: Quality gates minimos

**Como** mantenedor do Marco OS
**Quero** ter `lint` e `test` leves e funcionais
**Para** validar mudancas comuns sem montar uma esteira pesada demais para uso pessoal

### Acceptance Criteria
- [x] O projeto possui script `npm run lint`
- [x] O projeto possui script `npm test`
- [x] Existe configuracao de ESLint compatível com TypeScript/React do projeto
- [x] Existe uma suite minima de testes automatizados cobrindo utilitarios puros
- [x] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam

### Tasks
- [x] Criar story e registrar escopo
- [x] Adicionar configuracao leve de ESLint
- [x] Adicionar configuracao minima de testes
- [x] Criar testes de utilitarios puros
- [x] Validar todos os quality gates e atualizar checklist/file list

### Dev Notes
- Escopo propositalmente enxuto. Sem endurecimento de seguranca e sem cobertura de componentes com DOM nesta rodada.

### Checklist
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

### File List
- `docs/stories/STORY-2026-03-06-minimal-quality-gates.md`
- `components/NotesPanel.tsx`
- `components/agents/TokenUsageCard.tsx`
- `eslint.config.js`
- `package-lock.json`
- `package.json`
- `tests/utils.test.ts`
