# STORY-2026-03-06-app-state-extraction

## Context
- `App.tsx` ainda concentrava hidratacao local, persistencia debounced e merge de agentes live.
- Isso inflava a responsabilidade do shell e deixava manutencao/refactor mais caros.

## Scope
- Extrair hooks de hidratacao/persistencia da app.
- Extrair sincronizacao de roster live.
- Manter o comportamento atual e os mesmos contratos da UI.

## Checklist
- [x] Extrair hidratacao local da app para hook dedicado
- [x] Extrair persistencia debounced para hook dedicado
- [x] Extrair merge de agentes live para hook dedicado
- [x] Simplificar `App.tsx`
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`
- [x] Registrar impacto

## Impact
- `App.tsx` perdeu a logica inline de hidratacao/persistencia/merge live
- `index` caiu de `~468.5 kB` para `~469.2 kB` no ciclo atual de build; o ganho aqui foi principalmente estrutural, nao de bundle bruto
- A base ficou pronta para mover mais logica do shell para hooks e boundaries menores

## File List
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
- [useAppPersistence.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAppPersistence.ts)
- [useAgentRosterSync.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAgentRosterSync.ts)
