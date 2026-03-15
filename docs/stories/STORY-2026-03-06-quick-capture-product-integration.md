# Story: Quick Capture Product Integration

## Context
A captura rapida existia como atalho visual, mas salvava tudo como nota isolada em IndexedDB e nao atualizava o estado principal da app. O fluxo precisava virar produto de verdade.

## Scope
- Integrar Quick Capture ao estado principal da app
- Salvar tarefas como tarefas reais e notas/ideias/decisoes como notas reais
- Expor entrada de captura no header
- Cobrir as novas factories com teste

## Checklist
- [x] Quick Capture cria tarefas reais no dashboard
- [x] Quick Capture cria notas reais para nota, ideia e decisao
- [x] Botao de captura exposto no header
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`

## Files
- App.tsx
- components/capture/QuickCaptureModal.tsx
- components/layout/AppHeader.tsx
- data/domainFactories.ts
- tests/utils.test.ts
