# Epic: Marco OS V2 com Mission Control Vendorado

## Decisao

O Marco OS V2 sera construido como um app paralelo dentro deste repo, usando o `builderz-labs/mission-control` como base funcional. O V1 atual permanece intacto no root para rollback rapido.

## Motivo

O objetivo nao e "parecer com o demo". O objetivo e trazer o proprio produto que gera aquela experiencia, reduzindo o delta entre expectativa e entrega.

O caminho de adaptar o `AgentCommandCenter` atual levaria a uma reimplementacao longa. O caminho vendorado preserva o comportamento do produto original e desloca o trabalho para branding e integracao.

## Topologia inicial

```text
repo root
├── App.tsx / Vite app atual                 -> Marco OS V1
├── apps/
│   └── marco-os-v2/
│       ├── vendor/mission-control/          -> upstream importado
│       └── branding/                        -> overrides do Marco OS
├── docs/
├── tasks/
└── demais pastas do V1
```

## Principios

1. V1 continua bootavel e independente.
2. V2 entra em pasta paralela, sem migracao do root neste momento.
3. O runtime do V2 fica intacto na fase inicial.
4. O branding do Marco OS entra por tema e tokens, nao por reescrita dos painéis.
5. Integracao com dados do Marco OS so entra depois do V2 standalone estar funcional.

## Fases tecnicas

### Fase 0

- congelar a arquitetura do V1
- abrir pasta `apps/marco-os-v2`
- documentar rollout e riscos

### Fase 1

- clonar repo externo para inspeção
- identificar pontos de theming
- importar base para `apps/marco-os-v2/vendor/mission-control`

### Fase 2

- subir o V2 standalone
- validar build e tela inicial
- documentar envs e dependencias

### Fase 3

- aplicar design tokens do Marco OS
- ajustar superficies principais
- manter anatomia e funcionalidades do produto original

### Fase 4

- integrar navegacao V1 -> V2
- definir proxy local e estrategia de deploy
- plugar dados e contexto necessarios

## Decisoes operacionais

- Package manager do V1 nao sera trocado agora.
- O V2 pode usar `pnpm` internamente mesmo com o V1 ainda em `npm`.
- O mecanismo preferido de sync futuro com upstream e `git subtree`, mas isso depende de worktree limpa no momento da importacao oficial.
- Para inspecao imediata, o upstream pode ser clonado em area temporaria fora do repo.
- A entrada inicial do V2 no produto deve ser rota dedicada com proxy interno. `iframe` fica apenas como fallback de exploracao, nao como arquitetura alvo.

## Validacoes ja feitas

- `builderz-labs/mission-control` clonado localmente em area temporaria
- upstream sincronizado para `apps/marco-os-v2/vendor/mission-control`
- ambiente local atende prerequisitos basicos do upstream:
  - Node `v24.13.0`
  - pnpm `10.32.1`

## Criterio de sucesso da primeira entrega

- Existe um `apps/marco-os-v2`
- O app do upstream sobe localmente
- O V1 continua funcionando sem alteracoes
- Existe um plano objetivo de branding e integracao

## Estado atual validado

- O upstream esta presente em `apps/marco-os-v2/vendor/mission-control`
- Dependencias instaladas com `pnpm install`
- `pnpm typecheck` passou
- `pnpm exec next build --webpack` passou
- O build default com Turbopack falhou apenas no sandbox atual, com erro interno ao processar CSS do Scalar

## Roadmap de entrega

- O plano detalhado de sprints ate o go-live esta em `docs/ROADMAP-2026-03-27-marco-os-v2-delivery-sprints.md`
- A recomendacao atual e tratar o Sprint 1, congelamento do contrato da bridge, como gate duro antes de seguir em UX, auth e deploy
