# STORY-2026-03-06-shell-provider-scoping

## Context
- O `NotionDataProvider` ainda ficava montado no topo da aplicação inteira.
- Isso mantinha polling e custo de contexto ativos mesmo em views que não consomem dados do Notion.

## Scope
- Escopar o provider apenas para views que realmente usam `useNotionData`.
- Lazy-load do provider para reduzir peso do shell.
- Alinhar dependências removendo `recharts` do manifesto do projeto.

## Checklist
- [x] Mapear views que dependem de `useNotionData`
- [x] Lazy-load do `NotionDataProvider`
- [x] Escopar provider por view no `App.tsx`
- [x] Remover `recharts` do manifesto
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`
- [x] Registrar impacto

## Impact
- `NotionDataProvider` saiu do shell global e virou chunk lazy de `~2.5 kB`
- `index` caiu de `~469.9 kB` para `~468.5 kB`
- Polling de dados Notion deixa de rodar em views que nao usam `useNotionData`

## File List
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
- [package.json](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/package.json)
- [package-lock.json](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/package-lock.json)
