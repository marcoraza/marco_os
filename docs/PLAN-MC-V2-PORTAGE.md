# Plano de Portagem MC V2 para Marco OS

> Portar 100% das funcionalidades do Mission Control V2 para a secao Agentes do Marco OS,
> com design system proprio (dark theme, Inter, CSS vars, rounded-sm, sem emojis).
> Backend: MC V2 rodando em localhost:3001 (Next.js + SQLite).
> Frontend: React + Vite + Tailwind + Framer Motion (Marco OS).

---

## Fase 0: Fundacao (types + API client + mock data real)

### 0.1 Mapear response shapes reais

Bater em cada endpoint GET do V2 (`localhost:3001/api/*`) e capturar os JSON responses.
Criar types em `store/mcTypes.ts` que refletem EXATAMENTE o que a API retorna.

| Endpoint | Type | Campos-chave |
|----------|------|-------------|
| GET /api/agents | MCAgent[] | id, name, role, status, session_key, soul_content, last_seen, config |
| GET /api/tasks | MCTask[] | id, title, status, priority, assigned_to, tags, metadata, due_date, estimated/actual_hours |
| GET /api/sessions | MCSession[] | id, key, agent, kind, model, tokens, cost, active, startTime |
| GET /api/activities | MCActivity[] | id, type, entity_type, entity_id, actor, description, data, created_at |
| GET /api/chat | MCConversation[] | id, participants, lastMessage, updated_at |
| GET /api/channels | MCChannel[] | id, name, members, type |
| GET /api/skills | MCSkill[] | id, name, source, path, description, security_status |
| GET /api/memory | MCMemoryFile[] | path, name, type, size, modified, children |
| GET /api/tokens | MCTokenUsage[] | model, sessionId, date, inputTokens, outputTokens, cost |
| GET /api/cron | MCCronJob[] | id, name, schedule, command, enabled, lastRun, nextRun |
| GET /api/webhooks | MCWebhook[] | id, name, url, events, enabled, last_fired_at, last_status |
| GET /api/alerts | MCAlertRule[] | id, name, entity_type, condition_*, action_*, cooldown, trigger_count |
| GET /api/settings | MCSettings | key-value pairs by category |
| GET /api/audit | MCAuditEntry[] | id, action, actor, target_type, detail, created_at |
| GET /api/status | MCSystemStatus | uptime, version, dbSize, agentCount, sessionCount |
| GET /api/notifications | MCNotification[] | id, recipient, type, title, message, read_at |
| GET /api/workflows | MCWorkflow[] | id, name, steps, model, task_prompt |
| GET /api/pipelines | MCPipeline[] | id, name, steps, use_count |
| GET /api/github | MCGitHubSync | repos, prs, issues, last_sync |
| GET /api/security-audit | MCSecurityReport | findings, score, last_scan |
| GET /api/exec-approvals | MCExecApproval[] | id, task_id, agent, command, status |
| GET /api/nodes | MCNode[] | id, name, status, type |

### 0.2 Reescrever mcApi.ts

Client HTTP que bate em `VITE_MC_API_URL` (default: `http://localhost:3001`).
Cada familia de endpoints vira um namespace:

```typescript
export const mcApi = {
  agents: { list, get, create, update, delete },
  tasks: { list, get, create, update, move, comment, subscribe },
  sessions: { list, get, end },
  chat: { conversations, messages, send },
  skills: { list, get, install, remove },
  memory: { browse, search, indexRebuild },
  tokens: { usage, byAgent, byModel },
  cron: { list, create, update, toggle, delete },
  webhooks: { list, create, update, delete, deliveries },
  alerts: { list, create, update, delete },
  settings: { get, update },
  audit: { list },
  status: { health, monitor },
  workflows: { list, create, run },
  pipelines: { list, create, run, status },
  github: { status, sync, repos },
  security: { scan, report },
  approvals: { list, approve, reject },
  nodes: { list },
  notifications: { list, markRead },
  auth: { login, logout, profile },
}
```

### 0.3 Mock data com shapes reais

Criar `store/mcMockDataV2.ts` com mock data que simula EXATAMENTE os response shapes.
Usado quando `connectionStatus !== 'connected'`.

---

## Fase 1: Navegacao e Layout (Sprint 1)

### Estrutura de tabs/paineis

O V2 tem 4 grupos de navegacao. No Marco OS, tudo fica dentro da secao Agentes,
organizado como tabs horizontais + sub-areas via sidebar.

**Mapeamento V2 -> Marco OS:**

| V2 Panel | V2 Grupo | Marco OS Tab | Marco OS Sub-area |
|----------|----------|-------------|-------------------|
| Overview | Core | **Painel** | Tab principal |
| Agents | Core | **Agentes** | Lista + detail |
| Tasks | Core | **Tarefas** | Kanban por agente |
| Chat | Core | Sidebar direita | Chat com agente |
| Channels | Core | Sidebar direita | Sub-tab "Canais" |
| Skills | Core | **Skills** | Editor master/detail |
| Memory | Core | Agent Profile | Secao colapsavel |
| Activity | Observe | Sidebar direita | Feed de atividades |
| Logs | Observe | Overlay (Cmd+L) | Log Terminal |
| Cost Tracker | Observe | **Custos** | Dashboard de custos |
| Nodes | Observe | **Sistema** | Sub-tab "Nodes" |
| Exec Approvals | Observe | **Tarefas** | Sub-tab "Aprovacoes" |
| Office | Observe | **Painel** | Widget |
| Monitor | Observe | **Sistema** | Sub-tab "Monitor" |
| Cron | Automate | **Automacao** | Sub-tab "Cron" |
| Webhooks | Automate | **Automacao** | Sub-tab "Webhooks" |
| Alerts | Automate | **Automacao** | Sub-tab "Alertas" |
| GitHub | Automate | **Automacao** | Sub-tab "GitHub" |
| Security | Admin | **Admin** | Sub-tab "Seguranca" |
| Users | Admin | **Admin** | Sub-tab "Usuarios" |
| Audit | Admin | **Admin** | Sub-tab "Auditoria" |
| Gateways | Admin | **Admin** | Sub-tab "Gateways" |
| Gateway Config | Admin | **Admin** | Sub-tab "Config GW" |
| Integrations | Admin | **Admin** | Sub-tab "Integracoes" |
| Debug | Admin | **Admin** | Sub-tab "Debug" |
| Settings | Admin | **Config** | Preferencias |

**Tabs principais (8):**

```
[Painel] [Agentes] [Tarefas] [Skills] [Custos] [Automacao] [Sistema] [Admin]
```

**Sidebar direita (permanente, 3 secoes):**
- Chat com agente selecionado
- Canais / inter-agente
- Feed de atividades

**Overlays:**
- Log Terminal (Cmd+L)
- Chat expandido (full panel)

---

## Fase 2: Paineis Core (Sprint 2-4)

Cada painel descrito com layout Marco OS. Todas as regras do design system aplicam:
- Cores: CSS vars (bg-surface, border-border-panel, text-brand-mint, etc.)
- Tipografia: Inter, text-[8px] uppercase para headers, font-mono para dados
- Cards: bg-surface border border-border-panel rounded-sm p-3
- Botoes: primary=brand-mint/10, secondary=surface, danger=accent-red/10
- Icons: Material Symbols Outlined via <Icon>
- Sem emojis, sem rounded-lg, sem shadows

### 2.1 Painel (Overview Dashboard)

```
+-------------------+-------------------+-------------------+
| AGENTES ATIVOS    | TASKS EM ANDAMENTO| CUSTO HOJE        |
| [avatares + status]| [contagem/status] | [sparkline + $]   |
+-------------------+-------------------+-------------------+
| SESSOES ATIVAS                        | SAUDE DO SISTEMA  |
| [lista com model badges, tokens, $]   | [Ring 0-100]      |
+---------------------------------------+-------------------+
| ACOES RAPIDAS                         | GATEWAY HEALTH    |
| [Criar Task] [Enviar Missao] [Standup]| [status dots]     |
+---------------------------------------+-------------------+
| EVENT STREAM (ultimos 10 eventos em tempo real)           |
| [timeline compacta com dots coloridos]                    |
+-----------------------------------------------------------+
```

Widgets do V2 a incluir: metric-cards, quick-actions, event-stream, gateway-health,
runtime-health, session-workbench, task-flow, onboarding-checklist (se primeiro uso).

### 2.2 Agentes (Agent List + Detail)

**Lista:**
```
+----------------------------------------------------------+
| [Buscar...]  [+ Registrar Agente]  Online: 3/4           |
+----------------------------------------------------------+
| AVATAR  NOME        ROLE       STATUS  TASKS  CUSTO 7D   |
| [FR]    Frank       coord.    ● idle   3/18   $0.45      |
| [CC]    Claude Code developer ● busy   5/37   $1.20      |
| [CX]    Codex CLI   developer ○ off    0/12   $0.30      |
| [RE]    Researcher  analyst   ● idle   1/7    $0.17      |
+----------------------------------------------------------+
```

Click abre Agent Profile (scrollavel, secoes colapsaveis):
- Header: avatar lg + nome + role + status + acoes [Chat] [Missao] [Editar]
- Soul Content: textarea editavel com SOUL.md do agente
- Tasks: kanban filtrado por agente
- Sessoes: lista com model, tokens, cost, timeline bar
- Atividade: timeline ultimos 20 eventos
- Memoria: browser de arquivos + busca FTS
- Memory Graph: grafo visual de relacoes
- Historico: timeline completa de acoes
- Custo: sparkline 30d + breakdown por modelo
- Configuracao: key-value editavel
- Squad: se faz parte de um squad

### 2.3 Tarefas (Kanban + Aprovacoes)

**Sub-tabs: [Board] [Aprovacoes]**

Board: Kanban com 6 colunas (inbox, assigned, in_progress, review, quality_review, done).
Filtro por agente no topo. Drag-and-drop entre colunas.
Cada card: titulo, prioridade (cor), ticket_ref, assigned_to, due_date, comment count.
Click abre modal de detalhe: descricao, comentarios thread, time tracking, tags, metadata.
Botoes: [Mover] [Atribuir] [Comentar] [Concluir]

Aprovacoes: lista de exec-approvals pendentes.
Cada item: agente, comando, timestamp, [Aprovar] [Rejeitar].

### 2.4 Skills (Editor Completo)

```
+------------------------+--------------------------------------+
| [Buscar...]  [Refresh] | DETALHE DA SKILL                     |
|                        |                                      |
| SKILLS (24)            | Nome: commit                         |
| ● commit        ✓     | Source: ~/.claude/skills/commit/      |
| ● review        ✓     | Seguranca: ✓ Verificada              |
| ● browse        ✓     |                                      |
| ● qa            ✓     | Descricao:                           |
|   ship          ○     | [textarea editavel]                  |
|   diagnose      ✓     |                                      |
|                        | Trigger Words:                       |
|                        | [commit] [git commit] [ship] [+]     |
|                        |                                      |
|                        | Modelo: [select]                     |
|                        | Auto-run: [toggle]                   |
|                        | Security Status: [badge]             |
|                        |                                      |
|                        | Arquivo:                             |
|                        | [code viewer com syntax highlight]   |
|                        |                                      |
|                        | [Salvar] [Testar] [Desabilitar]      |
+------------------------+--------------------------------------+
```

Security scan results inline. Cache status. Multi-source (local + installed).

### 2.5 Custos (Cost Tracker)

```
+-----------------------------------------------------------+
| CUSTO TOTAL 7D: $2.12    CUSTO HOJE: $0.27               |
| [LineAreaChart 30 dias - custo diario]                    |
+----------------------------+------------------------------+
| POR MODELO                 | POR AGENTE                   |
| [DonutChart]               | [DonutChart]                 |
| opus: $1.40 (66%)         | CC: $1.20 (57%)             |
| sonnet: $0.52 (24%)       | Frank: $0.45 (21%)          |
| haiku: $0.20 (10%)        | Codex: $0.30 (14%)          |
+----------------------------+------------------------------+
| DETALHAMENTO POR SESSAO                                   |
| Sessao       Modelo      Tokens    Custo    Duracao       |
| sess-001     opus-4-6    4.2k      $0.06    12m          |
| sess-002     sonnet-4-6  1.8k      $0.01    45m          |
+-----------------------------------------------------------+
```

### 2.6 Chat System (Sidebar + Expandido)

**Sidebar (default):**
- Lista de conversas recentes (truncadas)
- Input de mensagem rapida
- Click expande pra full panel

**Full panel (overlay ou sub-tab):**
- Lista de conversas (esquerda, w-64)
- Area de mensagens (direita, flex-1)
- Bolhas: operador=brand-mint/10 right, agente=bg-base left
- Input com [Enviar] e shortcuts
- @mentions com autocomplete

**Canais:**
- Lista de canais por tipo (agent-to-agent, broadcast)
- Cada canal mostra participantes + ultimo msg

---

## Fase 3: Paineis Observe (Sprint 5-6)

### 3.1 Activity Feed (sidebar permanente)

Timeline vertical com dots coloridos por tipo:
- task.created = accent-blue
- task.completed = brand-mint
- agent.status_changed = accent-orange
- comment.added = accent-purple
- session.started = accent-blue
- error = accent-red

Cada entry: dot + actor + descricao + tempo relativo. Max 20 visíveis, scroll.

### 3.2 Log Terminal (overlay Cmd+L)

Ja implementado. Manter e conectar ao endpoint real `/api/logs`.

### 3.3 Nodes Panel (sub-tab de Sistema)

Lista de nodes registrados com status, tipo, ultimo heartbeat.

### 3.4 Exec Approvals (sub-tab de Tarefas)

Lista de comandos pendentes de aprovacao. [Aprovar] [Rejeitar] por item.

### 3.5 System Monitor (sub-tab de Sistema)

Cards: Uptime, DB size, Agent count, Session count, Memory usage.
Service status: MC Service, Gateway, Bridge.
Runtime health: CPU, memory, disk (quando disponivel).

---

## Fase 4: Paineis Automate (Sprint 7-8)

### 4.1 Cron Management

Lista de cron jobs com: nome, schedule (cron expression), modelo, ultimo run, proximo run.
Toggle enable/disable. Botao [Executar Agora]. Historico de execucoes.
[+ Novo Cron] abre form: nome, schedule, comando, modelo, agente.

### 4.2 Webhooks

Lista com: nome, URL, eventos, status, ultimo disparo.
Toggle enable/disable. [+ Novo Webhook] form.
Click expande: historico de deliveries (status code, response, duracao).

### 4.3 Alert Rules

Lista de regras: nome, entity_type, condicao, acao, cooldown, trigger count.
Toggle enable/disable. [+ Nova Regra] form com builder visual.

### 4.4 GitHub Sync

Status de sync com repos. Lista de PRs e Issues sincronizados.
[Sync Agora] botao. Config de repo mapping.

### 4.5 Pipelines + Workflows

Lista de templates de workflow. [+ Novo Template] form.
Pipelines multi-step: visualizacao de steps, status de execucao.
[Executar Pipeline] com selecao de agente.

---

## Fase 5: Paineis Admin (Sprint 9-10)

### 5.1 Security Audit

Scan results com findings categorizados por severidade.
Score geral. Historico de scans. [Rodar Scan] botao.

### 5.2 Users

Lista de usuarios com role, ultimo login, status.
[+ Novo Usuario] form. Editar role/senha.

### 5.3 Audit Trail

Timeline de acoes administrativas: quem fez o que, quando.
Filtro por ator, acao, target. Export.

### 5.4 Gateway Management

Lista de gateways com status, latencia, config.
[+ Adicionar Gateway] form. Config JSON editavel.
Health logs com historico de probes.

### 5.5 Integrations

Lista de integracoes disponiveis/ativas.
Toggle per integration. Config per integration.

### 5.6 Debug Panel

Info de debug: versao, env vars, connection status, cache stats.
[Limpar Cache] [Rebuild Index] [Health Check] botoes.

### 5.7 Settings

Config por categoria (general, security, notifications, appearance).
Key-value editavel com descricao. [Salvar] por categoria.

---

## Fase 6: Conexao com Backend (Sprint 11)

1. Apontar `VITE_MC_API_URL=http://localhost:3001` no `.env.local`
2. Implementar auth flow (login -> cookie/token -> requests autenticados)
3. Substituir mock data por chamadas reais em `mcApi.ts`
4. Implementar polling strategy (15s tasks, 30s status, 60s skills)
5. Testar cada painel com dados reais
6. Corrigir divergencias de shape

---

## Regras de Implementacao

1. **Todos os labels em PT-BR.** Nenhum texto em ingles visivel ao usuario.
2. **Design system mandatorio.** Cada componente segue CLAUDE.md sem excecao.
3. **Types first.** Criar o type antes do componente. Type deve bater com API response.
4. **Mock data realista.** Simular exatamente o que a API retorna, nao inventar.
5. **Selectors granulares.** Zustand: um selector por campo, nunca destructuring.
6. **Sem deps novas.** React + Tailwind + Framer Motion + idb. Graficos via LightweightCharts.tsx.
7. **Cada painel preenche 100% do espaco.** Nenhum espaco vazio.
8. **Interatividade real.** Botoes fazem coisas (mesmo que console.log ate conectar ao back).

---

## Sequencia de Execucao

```
Fase 0 (fundacao)     -> 1 sessao
Fase 1 (navegacao)    -> 1 sessao
Fase 2 (core panels)  -> 2-3 sessoes
Fase 3 (observe)      -> 1 sessao
Fase 4 (automate)     -> 1-2 sessoes
Fase 5 (admin)        -> 1-2 sessoes
Fase 6 (backend)      -> 1 sessao
Total estimado: 8-11 sessoes
```

---

*Plano v1.0 | 2026-03-27 | Baseado no inventario completo do MC V2 (builderz-labs/mission-control)*
