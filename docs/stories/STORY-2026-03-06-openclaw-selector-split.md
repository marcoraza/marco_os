# STORY-2026-03-06-openclaw-selector-split

## Context
- O `OpenClawContext` ainda expunha um objeto unico gigante.
- Qualquer mudanca de um dominio podia forcar rerender amplo nos consumidores.

## Scope
- Dividir o provider em contextos internos por dominio.
- Manter a API publica existente.
- Trocar consumidores obvios para hooks mais granulares.

## Checklist
- [x] Separar provider em contextos internos (`connection`, `agents`, `kanban`, `cron`, etc.)
- [x] Manter compatibilidade com `useOpenClaw`
- [x] Adicionar hooks granulares novos
- [x] Migrar consumidores obvios para hooks granulares
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`

## Impact
- O custo de rerender agora fica mais localizado para quem usa hooks especificos
- `useOpenClaw` segue disponivel para compatibilidade
- O ganho principal foi arquitetural; o bundle nao caiu nessa rodada

## File List
- [contexts/OpenClawContext.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/OpenClawContext.tsx)
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
- [AgentCommandCenter.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/AgentCommandCenter.tsx)
- [AgentKanban.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/AgentKanban.tsx)
- [AgentConfig.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/AgentConfig.tsx)
- [AgentMemory.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/AgentMemory.tsx)
- [AgentCronJobs.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/AgentCronJobs.tsx)
- [TokenUsageCard.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/agents/TokenUsageCard.tsx)
