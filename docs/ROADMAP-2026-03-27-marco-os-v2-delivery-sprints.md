# Roadmap: Marco OS V2 até Go-Live

## Premissas

- Planejamento baseado no estado real validado em `2026-03-27`
- Cadencia recomendada: sprints de 5 dias uteis
- O V1 continua como fallback ate o fim do cutover
- O objetivo nao e reescrever o vendor. O objetivo e fechar integracao, operacao, UX e rollout em cima do `mission-control`
- O backend da bridge do Marco OS continua fora deste repo e entra explicitamente no plano

## Estado de partida

- O V2 ja sobe standalone em `apps/marco-os-v2`
- O shell inicial ja esta brandado e abre sem login no modo de desenvolvimento
- O V1 ja abre o V2 via launcher
- `tasks`, `projects` e `standup` ja possuem adapter federado no V2
- A bridge real na VPS foi recuperada e esta saudavel
- O contrato real da bridge hoje e este:
  - `GET /api/tasks`, com bearer token
  - `GET /api/standup`, com bearer token
  - sem endpoint dedicado de `projects`
  - sem endpoint dedicado de `standup/history`
- O V2 ja faz fallback local para `projects` e `standup-history`
- O root ainda tem typecheck quebrado em arquivos legados do V1 fora do escopo do V2

## Regra de corte

So considero a implementacao encerrada quando estes 6 pontos estiverem verdes:

1. V2 sobe em ambiente real com auth controlada, sem bypass acidental
2. Fluxos principais do operador funcionam com dados vivos
3. Bridge e dominios hibridos tem contrato fechado e observavel
4. Build, testes, smoke e rollback estao documentados e repetiveis
5. V1 permanece como fallback claro durante o cutover
6. Existe criterio explicito para promover o V2 a caminho primario

## Sequencia recomendada de sprints

### Sprint 1, Contract Freeze da bridge e modo federado

**Objetivo**

Congelar o contrato real entre V2 e backend do Marco OS, removendo as ambiguidades atuais de `projects`, `standup-history` e auth.

**Entra**

- Definir o contrato v1 da bridge, com payloads, auth, erros e headers
- Decidir de forma explicita entre duas opcoes para `projects`:
  - implementar `GET/POST/PATCH/DELETE /api/projects` na bridge
  - ou assumir `projects` como read-only derivado de tasks ate segunda ordem
- Decidir de forma explicita entre duas opcoes para `standup-history`:
  - implementar endpoint dedicado
  - ou manter fallback para ultimo report e refletir isso na UI
- Persistir envs reais de bridge no ambiente local e no ambiente de deploy do V2
- Fechar smoke automatizavel do modo `marco` com token valido

**Nao entra**

- Polimento visual profundo
- Mudanca de auth final
- Cutover de producao

**Saida obrigatoria**

- `npm run mc:v2:bridge:check` verde com token
- Contrato v1 documentado
- Decisao fechada sobre `projects` e `standup-history`
- Nenhum falso negativo restante no modo federado

### Sprint 2, Fluxos operacionais do operador

**Objetivo**

Fechar o que o operador realmente precisa usar no dia a dia dentro do V2, sem telas que parecem prontas mas falham no backend real.

**Entra**

- Task Board federado completo:
  - listar
  - filtrar
  - criar
  - editar
  - mover status
  - comentar
  - revisar
- Project Manager alinhado com a decisao do Sprint 1
- Standup atual e historico alinhados com a decisao do Sprint 1
- Tratamento consistente de loading, empty state, auth failure e upstream unavailable
- Testes de integracao focados em `marco-data.ts` e nas rotas federadas do V2

**Nao entra**

- Refatoracao ampla do vendor
- Mudancas de arquitetura fora dos dominios federados

**Saida obrigatoria**

- Operador consegue usar `tasks`, `projects` e `standup` sem ambiguidade
- Tudo que nao tiver suporte real fica escondido ou bloqueado com copy honesta
- Browser smoke completo dos fluxos principais

### Sprint 3, Shell final e UX de produto

**Objetivo**

Parar de parecer um vendor retematizado e virar de fato um shell coerente do Marco OS.

**Entra**

- Ajustar shell, typography, badges, cards e superficies que ainda estao em meio-termo
- Revisar overview, navegação lateral, command palette e feedback global
- Fechar responsividade mobile e estados vazios
- Consolidar copy em pt-BR onde o produto final precisa falar portugues
- Revisar os avisos opcionais de OpenClaw doctor e GitHub stats para nao poluirem a primeira impressao

**Nao entra**

- Autenticacao final
- Deploy

**Saida obrigatoria**

- Design pass coerente aprovado internamente
- Nenhuma tela principal com visual de placeholder
- Smoke visual desktop e mobile documentado

### Sprint 4, Auth, workspace e modo de acesso

**Objetivo**

Tirar o bypass temporario de auth do centro do produto e transformar isso num modo de desenvolvimento, nao num comportamento default implícito.

**Entra**

- Reativar auth real com feature flag de dev clara
- Definir bootstrap de operador, seed admin e politica de sessao
- Revisar `login`, `setup`, `auth/me` e redirects
- Fechar o comportamento esperado por workspace, tenant e usuario local
- Garantir que o V2 abre sem friccao em dev e com gate real fora de dev

**Nao entra**

- Cutover do V1
- Sync com upstream

**Saida obrigatoria**

- Auth real funcionando
- Bypass disponivel apenas onde precisa
- Nenhuma rota publica acidental

### Sprint 5, Dominios hibridos e conectores secundarios

**Objetivo**

Fechar os painéis que ainda estao entre dois mundos para impedir regressao silenciosa depois do go-live.

**Entra**

- Implementar a estrategia final para `agents` e `activities`, hoje mapeados como dominios hibridos
- Revisar fronteira de `sessions`, `memory`, `cron`, `skills`, `logs` e `system-monitor`
- Fechar degradacao limpa de integrações opcionais
- Revisar quais painéis do vendor ficam no go-live e quais devem ficar ocultos na primeira entrega

**Nao entra**

- Polimento de deploy
- Remocao do V1

**Saida obrigatoria**

- Ownership matrix 100% implementada na UI e no backend adapter
- Nenhum painel critica depende de backend errado
- Conectores opcionais degradam sem quebrar o shell

### Sprint 6, Engenharia de release e manutencao do vendor

**Objetivo**

Fechar a parte chata que vira problema caro se ficar para depois.

**Entra**

- Definir e testar estrategia de sync com upstream, preferencia por `git subtree`
- Registrar patch ledger do vendor, deixando claro o que e override do projeto
- Validar build default do Next/Turbopack fora do sandbox
- Montar pipeline de qualidade para root e V2
- Definir rollback para seguir no V1 em caso de regressao
- Fechar plano de deploy, envs, portas, host e proxy

**Nao entra**

- Novas features
- Reescrita de painéis

**Saida obrigatoria**

- Processo de release repetivel
- Rollback testado
- Sync com upstream disciplinado
- Gates objetivos de build, lint, typecheck, tests e smoke

### Sprint 7, Cutover controlado e go-live

**Objetivo**

Promover o V2 a caminho primario sem perder a seguranca operacional do V1.

**Entra**

- Deploy do V2 no host alvo
- Ajuste final do launcher do V1 para o endpoint real do V2
- Smoke de browser em ambiente real
- Observabilidade minima de erros e health
- Janela de cutover com fallback claro para o V1
- Checklist de aprovacao final

**Nao entra**

- Desligamento do V1
- Limpeza estrutural grande

**Saida obrigatoria**

- V2 acessivel no ambiente real
- Fluxos criticos verdes
- Fallback para V1 validado
- Time sabe como voltar e como diagnosticar

## Backlog pos-go-live, fora do caminho critico

- Desligar gradualmente o V1
- Reavaliar se `iframe` ou launcher ainda fazem sentido
- Expandir dominio federado alem de `tasks/projects/standup`
- Limpar warnings legados do V1 fora do escopo atual
- Evoluir UX secundaria e paineis menos usados

## Dependencias criticas

### Bloqueadores reais

- O contrato final da bridge no Sprint 1
- A decisao de auth no Sprint 4
- A politica de release e rollback no Sprint 6

### Paralelizacao segura

- Sprint 3 pode rodar em paralelo parcial com Sprint 2, desde que nao reabra contrato de dados
- Parte de Sprint 6 pode comecar durante Sprint 5, se o contrato ja estiver congelado

## Recomendacao executiva

O caminho mais seguro e tocar **7 sprints**, nesta ordem, e tratar o **Sprint 1 como gate duro**. Se o contrato da bridge nao for congelado agora, todo o resto vira retrabalho caro em UI, auth e deploy.

Se precisar comprimir cronograma, eu recomendo compactar **Sprint 3 + Sprint 5**, mas **nao** mexer na ordem de **Sprint 1, Sprint 4 e Sprint 6**.
