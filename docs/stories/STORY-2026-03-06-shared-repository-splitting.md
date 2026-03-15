# STORY-2026-03-06-shared-repository-splitting

## Context
- O shell ainda carregava `data/repository` e `data/db` cedo por conta da hidratacao/persistencia do app.
- Isso mantinha parte da stack de IndexedDB no `index`.

## Scope
- Trocar acessos do shell para `repository` por imports dinamicos.
- Manter o comportamento atual de hidratacao, persistencia e criacao de agente.

## Checklist
- [x] Remover import estatico de `data/repository` do shell
- [x] Carregar `repository` dinamicamente em hidratacao/persistencia
- [x] Carregar `putAgent` dinamicamente ao criar agente
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`

## Impact
- Novos chunks:
  - `repository` ~`5.8 kB`
  - `db` ~`4.9 kB`
- `index` caiu para ~`466.0 kB` (`134.1 kB` gzip)

## File List
- [useAppPersistence.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAppPersistence.ts)
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
