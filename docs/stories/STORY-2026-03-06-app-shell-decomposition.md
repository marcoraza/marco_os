# STORY-2026-03-06-app-shell-decomposition

## Context
- `App.tsx` ainda concentrava actions de dominio e roteamento do conteudo principal.
- O shell precisava ficar mais proximo de composicao e menos de logica de negocio.

## Scope
- Extrair actions de dominio do app.
- Extrair o roteamento de conteudo para componente proprio.
- Preservar code splitting e comportamento atual.

## Checklist
- [x] Extrair actions de dominio para hook dedicado
- [x] Extrair roteador de conteudo para componente proprio
- [x] Preservar code splitting apos a extracao
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`

## Impact
- `App.tsx` ficou mais orientado a layout/composicao
- Actions de dominio foram centralizadas em hook proprio
- O build final ficou com `index` em ~`473.6 kB`; essa rodada foi estrutural, nao de bundle

## File List
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
- [AppContentRouter.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/AppContentRouter.tsx)
- [useAppDomainActions.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAppDomainActions.ts)
