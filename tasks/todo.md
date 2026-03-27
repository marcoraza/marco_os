# Marco OS V2 - Mission Control Import

## Objetivo

Trazer o `builderz-labs/mission-control` para dentro deste repo como base do Marco OS V2, preservando o V1 atual no root e aplicando o design system do Marco OS por cima da base importada.

## Estrategia escolhida

- [x] Manter o V1 intacto no root atual
- [x] Abrir o V2 como app paralelo em `apps/marco-os-v2`
- [x] Tratar o `mission-control` como produto vendorado, nao como referencia para reimplementar
- [x] Puxar upstream para inspeção local e validação de estrutura
- [ ] Definir mecanismo de sync com upstream, preferencia por `git subtree`
- [x] Subir o V2 standalone sem alterar o runtime do V1
- [x] Aplicar camada inicial de brand tokens do Marco OS
- [x] Desligar login temporariamente para abrir direto no shell do Marco OS
- [x] Integrar navegacao do V1 para abrir o V2 sem quebrar fallback
- [x] Mapear quais dados continuam no backend do Mission Control e quais devem consumir bridges do Marco OS
- [x] Definir plano de migracao gradual de dados e contexto

## Fases

### Fase 0 - Freeze arquitetural

- [x] Confirmar que o root atual continua sendo o V1
- [x] Confirmar que o V2 nasce em pasta paralela
- [x] Confirmar se o modo de acesso inicial do V2 sera rota dedicada com proxy interno

### Fase 1 - Vendor import

- [x] Clonar `builderz-labs/mission-control` em area temporaria
- [x] Inspecionar entrypoints, theming, painéis e dependencias
- [x] Importar base em `apps/marco-os-v2/vendor/mission-control`
- [x] Registrar comando de sync futuro com upstream

### Fase 2 - Boot local

- [x] Rodar o V2 standalone com o runtime original dele
- [x] Validar `pnpm install`
- [x] Validar `pnpm typecheck`
- [x] Validar build por `webpack`
- [ ] Validar build default do Next/Turbopack fora do sandbox
- [x] Documentar env vars e dependencias especificas do V2

### Fase 3 - Branding

- [x] Extrair tokens visuais centrais do Marco OS atual
- [x] Aplicar tokens e tema no V2 sem reescrever painéis
- [ ] Ajustar shell, typography, badges, cards e superfícies

### Fase 4 - Integracao

- [x] Definir entrada do V2 no menu do Marco OS
- [x] Criar contrato de navegacao entre V1 e V2
- [x] Mapear conectores: OpenClaw, bridge HTTP, memoria, tasks
- [x] Definir onde a fonte da verdade vive para cada dominio
- [x] Bridgear `tasks`, `projects` e `standup` do V2 via `MC_DATA_BACKEND=marco`, sem dual-write local

### Fase 5 - Hardening

- [x] Smoke test manual do V2
- [ ] Revisar impacto de manutencao do fork vendorado
- [ ] Definir criterio de rollback para continuar no V1

## Riscos

- O `mission-control` usa stack e runtime diferentes do V1 atual
- Importar cedo para dentro do root atual aumentaria o risco de quebrar o app existente
- Sync com upstream sem disciplina vira fork dificil de manter
- Tentar aplicar branding junto com integracao funcional aumenta demais a superficie de falha

## Proximo passo recomendado

- Executar o Sprint 1 do roadmap `docs/ROADMAP-2026-03-27-marco-os-v2-delivery-sprints.md`, congelando o contrato real da bridge e decidindo explicitamente o destino de `projects` e `standup-history`

## Review

- `builderz-labs/mission-control` foi clonado e sincronizado para `apps/marco-os-v2/vendor/mission-control`
- `pnpm install` concluiu com `better-sqlite3` compilado corretamente
- O repo raiz agora expõe `npm run mc:v2:*` para operar o V2 sem entrar no vendor
- `scripts/mc-v2/run.sh` centraliza env, sync, build e boot do V2
- `apps/marco-os-v2/.env.example` documenta o runtime local fora do vendor
- `npm run mc:v2:typecheck` passou com `next typegen` antes do `tsc`
- `npm run mc:v2:build:webpack` passou
- `npm run mc:v2:dev` subiu em `http://127.0.0.1:3000/setup`
- `npm run mc:v2:start:standalone` passou com bind correto em `0.0.0.0:3000`
- O smoke test no browser confirmou a tela de criacao de admin do Mission Control
- O runtime local ficou em `apps/marco-os-v2/.data`, com `AUTH_SECRET` e `API_KEY` auto-gerados
- `pnpm build` default do Next falhou no sandbox com erro interno do Turbopack ao processar CSS do Scalar
- Foi removida a dependencia de Google Fonts no `layout.tsx` do V2 para permitir build offline
- Foi corrigido um erro real do upstream em `src/app/api/sessions/transcript/route.ts`, extraindo `readHermesTranscriptFromDbPath` para `src/lib/session-transcript-hermes.ts`
- O V2 agora abre com tema default `marco-os`, usando a paleta do V1 como base do shell
- Login e setup exibem `Marco OS V2` com assinatura `Powered by Mission Control`
- A sidebar passou a usar cards internos do projeto no lugar dos banners externos do upstream
- O shell publico foi validado no browser, mas o shell autenticado ainda nao foi revisado porque isso exigiria criar uma conta local
- O V2 agora sobe por default em modo sem login, com bypass controlado por `MC_DISABLE_AUTH=1`
- A home `/` abre direto no shell, e `/login` e `/setup` redirecionam de volta para `/`
- O onboarding inicial tambem fica suprimido enquanto o bypass de auth estiver ativo
- O V1 agora expõe entrada direta para o V2 na sidebar, na navegação mobile e na command palette
- `lib/marcoOsV2.ts` centraliza a URL do launcher com fallback para `http://127.0.0.1:3000/` e override por `VITE_MARCO_OS_V2_URL`
- O launcher do V1 foi coberto por teste unitario em `tests/marco-os-v2-launcher.test.ts`
- O smoke no browser confirmou o V1 em `http://127.0.0.1:3000/marco_os/` abrindo o V2 em nova aba apontando para `http://127.0.0.1:3001/`
- O mismatch de hidratacao por `nonce` e o bloqueio CSP do bootstrap de tema foram corrigidos no `src/app/layout.tsx` do V2
- No boot limpo do V2, o console ficou sem erros de hidratacao ou CSP; restaram apenas `400` de APIs opcionais sem configuracao, como OpenClaw doctor e GitHub stats
- O mapeamento de dominios confirmou que `tasks`, `projects` e `standup` devem continuar com source of truth no Marco OS, enquanto `sessions`, `memory`, `cron`, `skills`, `logs` e `system-monitor` devem continuar locais no V2
- `agents` e `activities` ficaram definidos como dominios hibridos, com estado operacional local no V2 e eventual metadata de produto federada depois
- A recomendacao de rollout ficou registrada na story `STORY-2026-03-27-marco-os-v2-data-bridge-map.md`, com fase inicial dedicada a adapters de bridge no V2 em vez de reescrita dos painéis
- O V2 agora suporta `MC_DATA_BACKEND=marco`, com adapter server-side em `src/lib/marco-data.ts` e fallback para as envs ja existentes do root, como `VITE_BRIDGE_URL` e `VITE_FORM_API_URL`
- As rotas `/api/tasks`, `/api/projects`, `/api/projects/[id]/tasks`, `/api/standup` e `/api/standup/history` passam a ler e mutar pelo backend do Marco OS quando o modo `marco` esta ativo, sem gravar `tasks`, `projects` ou `standup` no SQLite local
- O runner `scripts/mc-v2/run.sh` agora importa envs do root antes do vendor e ativa `MC_DATA_BACKEND=marco` automaticamente quando encontra configuracao de bridge
- Foi adicionado teste unitario dedicado para o adapter e corrigido um bug real de filtro onde `project_id=NaN` podia zerar a lista de tasks bridgeadas
- Validacoes concluidas nesta rodada: `pnpm exec vitest run src/lib/marco-data.test.ts`, `npm run mc:v2:typecheck`, lint direcionado do vendor, `npm run lint`, `npm test` e `npm run mc:v2:test`
- O shell agora espelha `MC_DATA_BACKEND` no browser por `NEXT_PUBLIC_MC_DATA_BACKEND`, para a UI conseguir degradar acoes ainda nao federadas
- O `Project Management` passou a tratar `assigned agents` como read-only no modo `marco`, sem tentar chamar `/api/projects/[id]/agents` no save
- Foram adicionados testes para a flag client-side e para o modal em `project-manager-modal.test.tsx`, cobrindo o branch de read-only
- As rotas `/api/tasks`, `/api/projects`, `/api/standup` e `/api/standup/history` agora retornam payload guiado com `backend.code=bridge_missing_config` no modo `marco` sem URL de bridge, em vez de `500`
- `Task Board`, `Project Management` e `Standup` passaram a renderizar callout orientado com envs esperadas, mantendo as acoes dependentes desabilitadas ate a bridge existir
- O smoke no browser com `MC_DATA_BACKEND=marco` e sem `MC_MARCO_API_URL` confirmou o callout no `Task Board`, no modal `Project Management` e no `Standup`, sem erro bruto do shell
- Validacoes concluidas nesta rodada: `pnpm exec vitest run src/lib/marco-data.test.ts src/lib/__tests__/marco-runtime.test.ts src/components/modals/project-manager-modal.test.tsx src/components/panels/standup-panel.test.tsx`, lint direcionado do vendor, `npm run mc:v2:typecheck`, `npm run mc:v2:test`, `npm run lint` e `npm test`
- `npm run typecheck` no root continua falhando em arquivos do V1 ja alterados fora desta rodada, como `components/focus/DeepWorkPanel.tsx` e `hooks/useAppPersistence.ts`
- O V2 agora traduz indisponibilidade do upstream federado em `backend.code=bridge_unavailable`, mantendo `/api/tasks`, `/api/projects`, `/api/standup` e `/api/standup/history` vivos com payload guiado em vez de `5xx`
- `Task Board`, `Project Management` e `Standup` passaram a diferenciar "bridge ausente" de "bridge configurada, mas fora do ar", com copy especifica para cada caso
- Foi adicionada cobertura de rota para esse contrato em `src/lib/__tests__/marco-read-routes.test.ts`, alem da extensao dos testes de runtime, data adapter e UI
- O locale `pt` do vendor recebeu a chave `taskBoard.loadingTasks`, que estava gerando ruido de i18n no smoke do `Task Board`
- A validacao real da bridge inferida do V1 confirmou `https://api.clawdia.com.br/api` respondendo `502 Bad Gateway`; mesmo assim, o browser passou a receber `200` com guidance nas rotas federadas
- Validacoes concluidas nesta rodada: `pnpm exec vitest run src/lib/__tests__/marco-runtime.test.ts src/lib/marco-data.test.ts src/lib/__tests__/marco-read-routes.test.ts src/components/modals/project-manager-modal.test.tsx src/components/panels/standup-panel.test.tsx`, `npm run mc:v2:typecheck`, `npm run mc:v2:test`, `npm run lint` e `npm test`
- O backend real da bridge nao existe neste repo. A propria doc do V1 o descreve como `Flask (notion_form_api.py)` rodando numa VPS separada, em `api.clawdia.com.br`, porta `8744`, atras de Nginx
- A verificacao de rede fechou a fronteira da falha: `https://api.clawdia.com.br/` responde `200` com a pagina default do Nginx, enquanto `https://api.clawdia.com.br/api/tasks`, `/api/projects`, `/api/standup` e `/api/standup/history` respondem `502 Bad Gateway`
- A tentativa direta em `http://api.clawdia.com.br:8744/` expirou no timeout, reforcando que o upstream Flask nao esta acessivel deste lado
- O repo agora tem `npm run mc:v2:bridge:check`, que testa a bridge configurada e resume o estado de `tasks`, `projects`, `standup` e `standup/history` sem precisar subir o browser
- Foi adicionado o runbook `docs/runbooks/marco-bridge-vps-recovery.md` com a sequencia de SSH, systemd, curl local e Nginx para recuperar a bridge na VPS
- Validacoes desta rodada de diagnostico: `npm run mc:v2:bridge:check` sem env, falhando com guidance de configuracao, e `MC_MARCO_API_URL=https://api.clawdia.com.br/api npm run mc:v2:bridge:check`, confirmando `root 200` e endpoints criticos em `502`
- A bridge real foi recuperada na VPS ao reiniciar o service user-level `notion-form-api` do usuario `clawd`, que voltou a ouvir em `127.0.0.1:8744`
- O contrato real do backend foi provado em producao: `GET /api/tasks` e `GET /api/standup` exigem bearer token, enquanto `projects` e `standup-history` nao existem como endpoints dedicados
- O script `scripts/mc-v2/check-bridge.sh` foi alinhado a esse contrato. Agora ele envia `MC_MARCO_API_TOKEN` ou `VITE_FORM_API_TOKEN` quando existir e trata `projects` e `standup-history` como fallbacks locais, em vez de falso negativo
- O smoke real do V2 com a bridge viva e token valido confirmou `200` em `http://127.0.0.1:3000/api/tasks`, `/api/projects` e `/api/standup/history`, alem do shell carregando no browser com dados vivos
- O roadmap completo ate o go-live foi consolidado em `docs/ROADMAP-2026-03-27-marco-os-v2-delivery-sprints.md`, com 7 sprints, gates de saida e backlog pos-go-live


## Debug atual - Mission Control tabs dos agentes

- [x] Reproduzir o fluxo em `/marco_os/` e confirmar por que as abas do detalhe do agente nao abrem os paineis esperados
- [x] Corrigir o roteamento/wiring entre Mission Control overview e detalhe do agente com o menor impacto possivel
- [x] Validar no browser e rodar `npm run lint`, `npm run typecheck` e `npm test`

## Review desta rodada

- A causa raiz estava em `useAppHydration`, que reexecutava ao trocar `activeAgentId` e sobrescrevia os ids numericos do Mission Control com ids legados da roster
- `hooks/useAppPersistence.ts` agora hidrata uma vez com refs para os ids iniciais, sem resetar a selecao do agente ao abrir o detalhe
- `components/agents/MCAgentDetail.tsx` deixou de ser placeholder e passou a montar os paineis reais de overview, tasks, activity, chat, memory, config, cron, tools e models
- O browser confirmou o fluxo em `http://127.0.0.1:5173/marco_os/`, inclusive troca de abas dentro do detalhe do agente
- `npm run lint` passou
- `npm test` passou, com 36 testes verdes
- `npm run typecheck` continua falhando por problemas ja existentes fora desta correção, incluindo `components/focus/DeepWorkPanel.tsx` e tipos antigos em `hooks/useAppPersistence.ts`

## Limpeza de typecheck

- `data/models.ts` passou a aceitar `urgent` em `StoredTaskPriority`, alinhando persistencia e runtime
- `components/focus/DeepWorkPanel.tsx` passou a ordenar e exibir tarefas `urgent` sem quebrar o tipo `Task['priority']`
- O `typecheck` do root voltou a passar, junto com `npm run lint` e `npm test`
