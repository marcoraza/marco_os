# STORY-2026-03-06-domain-factories-and-agent-feedback

## Context
- A criacao de entidades do app ainda estava espalhada em callbacks do shell.
- Fluxos de kanban/comentarios de agentes falhavam com pouco feedback.

## Scope
- Consolidar factories de dominio reutilizaveis.
- Reusar factories nos hooks do shell.
- Melhorar feedback de erro em `AgentKanban`.
- Aumentar cobertura de testes nessas areas.

## Checklist
- [x] Criar factories de dominio
- [x] Reusar factories nos hooks do shell
- [x] Melhorar feedback de erro no kanban/comentarios
- [x] Adicionar testes para factories/merge
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`

## Impact
- Contratos de criacao de projeto/task/note/event ficaram centralizados
- `AgentKanban` agora expõe erro de move/comentario em vez de falha silenciosa
- Suite de testes subiu de 4 para 6 testes

## File List
- [domainFactories.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/data/domainFactories.ts)
- [useAppDomainActions.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAppDomainActions.ts)
- [useAgentRosterSync.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/hooks/useAgentRosterSync.ts)
- [AgentKanban.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/AgentKanban.tsx)
- [utils.test.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/tests/utils.test.ts)
