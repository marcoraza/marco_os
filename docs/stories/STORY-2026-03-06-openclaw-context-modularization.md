# STORY-2026-03-06-openclaw-context-modularization

## Context
- `OpenClawContext.tsx` concentrava contrato, gateway, bridge polling, parsing e actions.
- Esse acoplamento deixava manutenção e evolução do shell mais caras.

## Scope
- Separar o contexto por responsabilidades sem mudar a API pública dos hooks.
- Manter comportamento atual de fallback/mock, gateway e bridge.

## Checklist
- [x] Extrair contrato/tipos do contexto
- [x] Extrair mapeadores e parsers de payload
- [x] Extrair gateway sync para hook dedicado
- [x] Extrair bridge polling/actions para hook dedicado
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`
- [x] Atualizar file list

## File List
- [contexts/OpenClawContext.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/OpenClawContext.tsx)
- [contexts/openclaw/types.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/openclaw/types.ts)
- [contexts/openclaw/mappers.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/openclaw/mappers.ts)
- [contexts/openclaw/bridge.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/openclaw/bridge.ts)
- [contexts/openclaw/gateway.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/contexts/openclaw/gateway.ts)
