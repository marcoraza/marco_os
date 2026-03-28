# MC V2 Portage Plan v2

> Plano definitivo de portage do Mission Control V2 para Marco OS.
> Substitui `docs/PLAN-MC-V2-PORTAGE.md`.
> Data: 2026-03-27 | Versao: 2.0

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Arquitetura: 7 Tabs + Overlays](#2-arquitetura--7-tabs--overlays)
3. [Detalhamento por Tab](#3-detalhamento-por-tab)
   - 3.1 [Tab 1: PAINEL](#31-tab-1-painel)
   - 3.2 [Tab 2: TAREFAS](#32-tab-2-tarefas)
   - 3.3 [Tab 3: OBSERVAR](#33-tab-3-observar)
   - 3.4 [Tab 4: CHAT](#34-tab-4-chat)
   - 3.5 [Tab 5: AUTOMACAO](#35-tab-5-automacao)
   - 3.6 [Tab 6: RELATORIOS](#36-tab-6-relatorios)
   - 3.7 [Tab 7: SISTEMA](#37-tab-7-sistema)
4. [State Management (Zustand)](#4-state-management-zustand)
5. [Novos Componentes (7)](#5-novos-componentes-7)
6. [Arquivos a Modificar](#6-arquivos-a-modificar)
7. [Sprint Execution](#7-sprint-execution)
8. [Regras de Implementacao](#8-regras-de-implementacao)
9. [Verificacao](#9-verificacao)

---

## 1. Visao Geral

Marco OS absorve 100% das funcionalidades do Mission Control V2 na secao **Agentes** (view ID: `agents-overview`). O backend MC V2 roda em `localhost:3000` (Next.js + SQLite). O frontend usa React 19 + Vite + Tailwind + Framer Motion + Zustand.

### O que ja existe

| Categoria | Contagem | Local |
|-----------|----------|-------|
| Componentes MC | 25 | `components/agents/mc/` |
| Zustand store | 1 | `store/missionControl.ts` |
| API client | 1 | `lib/mcApi.ts` |
| Polling hook | 1 | `hooks/useMCPoll.ts` |
| Mock data | 1 | `store/mcMockData.ts` |
| Shell | 1 | `components/agents/MCAgentsShell.tsx` |

**Componentes existentes em `components/agents/mc/`:**

```
MCActivityPanel.tsx       MCAgentAvatar.tsx        MCAgentKanban.tsx
MCAgentProfile.tsx        MCAgentSessions.tsx      MCAgentTaskStrip.tsx
MCChatPanel.tsx           MCConfigShell.tsx         MCCronPanel.tsx
MCDashboardPanel.tsx      MCLivePulse.tsx           MCLogTerminal.tsx
MCLogViewerPanel.tsx      MCMemoryBrowserPanel.tsx  MCMetricBar.tsx
MCOverviewPanel.tsx       MCReportsPanel.tsx        MCRightSidebar.tsx
MCSkillsPanel.tsx         MCStandupPanel.tsx        MCSystemMonitorPanel.tsx
MCTaskBoardPanel.tsx      MCTeamHealthScore.tsx     MCTokenDashboardPanel.tsx
MCWebhookPanel.tsx
```

**Zustand store (`store/missionControl.ts`) tipos registrados:**
`MCAgent`, `MCTask`, `MCSession`, `MCActivity`, `MCLogEntry`, `MCCronJob`, `MCMemoryFile`, `MCTokenUsage`, `MCStandupReport`, `MCProject`, `MCNotification`, `MCInterAgentMessage`

**Shell atual (`MCAgentsShell.tsx`):**
- MCMetricBar (sticky top)
- AlertBanner (condicional, expansivel)
- 6 tabs: Painel | Tarefas | Skills | Sistema | Cron | Relatorios
- MCRightSidebar (chat + inter-agent + activity feed, xl only, 320px permanentes)
- Chat Panel overlay (400px, z-50)

### Problema

Os 6 tabs atuais nao cobrem Chat, Activity, Memory, Logs, Webhooks, Standup e Tokens como tabs proprios. MCRightSidebar ocupa 320px permanentes, comprimindo o conteudo principal em telas menores. Agent Detail e rota separada (`agent-detail` no AppContentRouter). MCConfigShell e rota paralela (condicional dentro de `agents-overview`).

### Solucao

Reorganizar de 6 tabs para **7 tabs** agrupados por modelo mental do usuario, com sub-tabs para funcionalidades granulares. Substituir MCRightSidebar e rotas separadas por **overlays on-demand** que nao comprimem o layout.

---

## 2. Arquitetura: 7 Tabs + Overlays

### 7 Tabs (reorganizados por modelo mental do usuario)

| # | Tab ID | Label (PT-BR) | Icon | Keyboard | Conteudo |
|---|--------|---------------|------|----------|----------|
| 1 | `painel` | Painel | `dashboard` | `1` | Dashboard: agents grid, tasks summary, cost 7d, sessions, system health |
| 2 | `tarefas` | Tarefas | `task_alt` | `2` | Kanban 5 colunas + filter pills + task detail drawer |
| 3 | `observar` | Observar | `monitoring` | `3` | Sub-tabs: Atividade, Sessoes, Tokens, Logs |
| 4 | `chat` | Chat | `forum` | `4` | Conversations list + thread + inter-agent strip |
| 5 | `automacao` | Automacao | `autoplay` | `5` | Sub-tabs: Cron, Webhooks, Alertas |
| 6 | `relatorios` | Relatorios | `analytics` | `6` | Sub-tabs: Dashboard (charts), Standup |
| 7 | `sistema` | Sistema | `settings_suggest` | `7` | Sub-tabs: Monitor, Skills, Memoria, Config |

### Overlays (substituem MCRightSidebar + rotas separadas)

| Overlay | Width | z-index | Trigger | Componente |
|---------|-------|---------|---------|------------|
| Agent Profile | `w-[480px]` | `z-50` | Click em agent | `MCAgentProfile.tsx` (existente) |
| Task Detail | `w-[380px]` | `z-50` | Click em task card | `MCTaskDetailDrawer.tsx` (NOVO) |
| Chat Drawer | `w-[400px]` | `z-50` | Atalho ou click | `MCChatPanel.tsx` (existente) |
| Log Terminal | full-width bottom | `z-40` | `Cmd+L` | `MCLogTerminal.tsx` (existente) |

### Pattern overlay (padrao Framer Motion)

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative w-[480px] h-full bg-bg-base border-l border-border-panel flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
      >
        {/* content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

**Regras para overlays:**
- Backdrop `bg-black/40`, click fecha
- Escape fecha qualquer overlay aberto
- Overlay nao comprime conteudo principal (modo flutuante, nao push)
- Transicao: `x: '100%' -> 0`, `duration: 0.25s`, `type: 'tween'`
- Mobile: full-width takeover

---

## 3. Detalhamento por Tab

### 3.1 Tab 1: PAINEL

**Componente existente:** `MCDashboardPanel.tsx` (reutilizado, redirecionado via `MCOverviewPanel.tsx`)

**Layout:**
```
Row 1: grid-cols-3 gap-3
  [AgentsCard]  [TasksCard]  [CostCard]

Row 2: grid-cols-2 gap-3
  [CostPerAgentCard]  [SystemCard]

Row 3: full-width
  [SessionsCard]
```

**Row 1 — 3 colunas:**

| Card | Conteudo | Dados |
|------|----------|-------|
| AgentsCard | Online count (badge brand-mint), lista mini (avatar + name + status dot), click abre overlay | `s.agents` |
| TasksCard | Contagem por status (inbox, assigned, in_progress, review, done), mini bar chart horizontal | `s.tasks` |
| CostCard | Total 7d (hero number `text-[28px] font-black font-mono`), sparkline 7 barras SVG | `s.tokenUsage` |

**Row 2 — 2 colunas:**

| Card | Conteudo | Dados |
|------|----------|-------|
| CostPerAgentCard | Donut chart SVG (cores: accent-purple, accent-blue, brand-mint, accent-orange), legenda lateral | `s.tokenUsage`, `s.agents` |
| SystemCard | Uptime badge, DB size, services status (MC Service, Gateway, Bridge) com StatusDot | `s.connectionStatus`, API `/api/status` |

**Row 3 — full-width:**

| Card | Conteudo | Dados |
|------|----------|-------|
| SessionsCard | Table: key, agent, model, tokens, cost, active badge (brand-mint glow). Scroll horizontal se necessario | `s.sessions` |

**Interacoes:**
- Agent click: `store.setProfileAgentId(String(agent.id))` -> abre overlay Agent Profile
- Session click: scroll para detalhes (inline expand)

**Store selectors:**
```typescript
const agents = useMissionControlStore((s) => s.agents);
const tasks = useMissionControlStore((s) => s.tasks);
const sessions = useMissionControlStore((s) => s.sessions);
const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
```

**Empty state:**
```tsx
<div className="flex flex-col items-center gap-3 py-12">
  <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">hub</span>
  <p className="text-text-secondary text-xs text-center">MC Service Indisponivel</p>
  <p className="text-text-secondary text-[9px] text-center max-w-[280px]">
    Inicie o MC Service em localhost:3000
  </p>
  <button
    className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
    onClick={checkHealth}
  >
    Verificar Conexao
  </button>
</div>
```

**Loading state:**
```tsx
<div className="space-y-3 p-3">
  <div className="grid grid-cols-3 gap-3">
    <div className="bg-border-panel animate-pulse rounded-sm h-32" />
    <div className="bg-border-panel animate-pulse rounded-sm h-32" />
    <div className="bg-border-panel animate-pulse rounded-sm h-32" />
  </div>
  <div className="grid grid-cols-2 gap-3">
    <div className="bg-border-panel animate-pulse rounded-sm h-40" />
    <div className="bg-border-panel animate-pulse rounded-sm h-40" />
  </div>
  <div className="bg-border-panel animate-pulse rounded-sm h-48 w-full" />
</div>
```

---

### 3.2 Tab 2: TAREFAS

**Componente existente:** `MCTaskBoardPanel.tsx`

**Layout:**
```
Top: Filter pills strip (horizontal, gap-2)
Body: Kanban grid (5 colunas, scroll horizontal em mobile)
```

**Filter pills (usando FilterPills pattern):**

| Pill | Filtro |
|------|--------|
| Todos | Sem filtro (default) |
| Minhas | `assigned_to === currentUser` |
| Urgentes | `priority === 'critical' \|\| priority === 'urgent'` |
| Esta Semana | `due_date` dentro da semana corrente |

```tsx
<div className="flex items-center gap-2 px-3 py-2 border-b border-border-panel">
  {pills.map((pill) => (
    <button
      key={pill.id}
      onClick={() => setActiveFilter(pill.id)}
      className={cn(
        'text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border transition-all',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        activeFilter === pill.id
          ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
          : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary'
      )}
    >
      {pill.label}
    </button>
  ))}
</div>
```

**Kanban 5 colunas:**

| Coluna | Status mapeados | Header color |
|--------|----------------|--------------|
| Entrada | `inbox` | `text-text-secondary` |
| Atribuido | `assigned` | `text-accent-blue` |
| Em Progresso | `in_progress` | `text-accent-orange` |
| Revisao | `review`, `quality_review` | `text-accent-purple` |
| Concluido | `done` | `text-brand-mint` |

**Task card (dentro de cada coluna):**
```tsx
<div className="bg-surface border border-border-panel rounded-sm p-3 cursor-pointer hover:bg-surface-hover transition-all">
  <div className="flex items-start justify-between mb-1">
    <span className="text-xs font-bold text-text-primary line-clamp-2">{task.title}</span>
    <PriorityBadge priority={task.priority} />
  </div>
  <div className="flex items-center gap-2 mt-2">
    {task.assigned_to && (
      <span className="text-[8px] text-text-secondary">{task.assigned_to}</span>
    )}
    {task.ticket_ref && (
      <span className="text-[8px] font-mono text-accent-blue">{task.ticket_ref}</span>
    )}
    {task.due_date && (
      <span className="text-[8px] font-mono text-text-secondary">{formatDate(task.due_date)}</span>
    )}
  </div>
  {task.tags && task.tags.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
      {task.tags.map((tag) => (
        <span key={tag} className="text-[7px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-2 py-0.5 rounded-sm text-text-secondary">
          {tag}
        </span>
      ))}
    </div>
  )}
</div>
```

**PriorityBadge mapping:**

| Priority | Classes |
|----------|---------|
| `critical` | `text-accent-red border-accent-red/30 bg-accent-red/10` |
| `urgent` | `text-accent-red border-accent-red/30 bg-accent-red/10` |
| `high` | `text-accent-orange border-accent-orange/30 bg-accent-orange/10` |
| `medium` | `text-accent-blue border-accent-blue/30 bg-accent-blue/10` |
| `low` | `text-text-secondary border-border-panel bg-surface` |

**Interacoes:**
- Task click: `store.setTaskDetailId(task.id)` -> abre MCTaskDetailDrawer overlay
- Drag-and-drop: futuro (nao neste portage)

**Store selectors:**
```typescript
const tasks = useMissionControlStore((s) => s.tasks);
const agents = useMissionControlStore((s) => s.agents);
```

**Empty state por coluna:**
```tsx
<p className="text-[9px] text-text-secondary text-center py-8">Sem tarefas</p>
```

---

### 3.3 Tab 3: OBSERVAR

**NOVO wrapper:** `MCObservePanel.tsx`

**Layout:**
```
Top: FilterPills sub-tab switcher
Body: Sub-tab content (lazy loaded)
```

**Sub-tabs via FilterPills:**

| Sub-tab ID | Label | Default |
|------------|-------|---------|
| `atividade` | Atividade | Sim |
| `sessoes` | Sessoes | Nao |
| `tokens` | Tokens | Nao |
| `logs` | Logs | Nao |

**Sub-tab state:** `store.activeObserveSubTab`

#### Sub-tab "Atividade"

**Componente existente:** `MCActivityPanel.tsx`

Timeline vertical com dots coloridos por tipo de evento:

| Tipo | Dot color | Icon |
|------|-----------|------|
| `task.created` | `accent-blue` | `add_circle` |
| `task.completed` | `brand-mint` | `check_circle` |
| `task.status_changed` | `text-text-secondary` | `swap_horiz` |
| `agent.status_changed` | `accent-orange` | `person` |
| `error` | `accent-red` | `error` |
| Outros | `text-text-secondary` | `info` |

**Store selectors:** `s.activities`

#### Sub-tab "Sessoes"

Expanded session table (mesmo pattern do SessionsCard no Painel, mas full-width com mais colunas):

| Coluna | Dado | Classe |
|--------|------|--------|
| Key | `session.key` | `font-mono text-[9px]` |
| Agent | `session.agent` | `text-xs` |
| Model | `session.model` | `font-mono text-[9px] text-accent-blue` |
| Tokens | `session.tokens` | `font-mono text-[9px]` |
| Cost | `session.cost` | `font-mono text-[9px] text-brand-mint` |
| Active | badge | StatusDot `color={session.active ? 'mint' : 'neutral'}` |
| Age | `session.age` | `font-mono text-[8px] text-text-secondary` |

**Store selectors:** `s.sessions`

#### Sub-tab "Tokens"

**Componente existente:** `MCTokenDashboardPanel.tsx`

Layout:
```
MetricStrip (4 cards inline): Total Tokens | Total Cost | Avg Cost/Day | Top Model
Sparkline 30d (full-width, SVG 7-30 bars)
Row 2 grid-cols-2: Model Breakdown Donut | Per-Agent Donut
```

**Store selectors:** `s.tokenUsage`

#### Sub-tab "Logs"

**Componente existente:** `MCLogViewerPanel.tsx` (embedded, nao floating)

Layout: Terminal-style, full-width, dark background (`bg-bg-base`), mono font.
- Filter por level: info | warn | error | debug (toggle pills)
- Filter por source: dropdown
- Auto-scroll para bottom (toggle)
- Cada linha: `[timestamp] [level badge] [source] message`

**Store selectors:** `s.logs`

---

### 3.4 Tab 4: CHAT

**Componente existente:** `MCChatPanel.tsx` (promovido de overlay para tab completo)

**Layout:**
```
Left panel: w-56 (conversation list)
  - Header: "Conversas" label + [+ Nova] button
  - List: agent name + last message preview + timestamp
  - Active: bg-brand-mint/10 border-l-2 border-brand-mint

Right panel: flex-1 (thread + input)
  - Header: agent name + StatusDot + [X] close
  - Body: messages (scroll, reversed)
  - Input: fixed bottom

Bottom strip: MCInterAgentStrip (NOVO, collapsible)
```

**User bubble:**
```tsx
<div className="bg-brand-mint/10 border border-brand-mint/30 rounded-sm px-3 py-2 max-w-[80%] ml-auto">
  <p className="text-xs text-text-primary">{message.content}</p>
  <span className="text-[8px] font-mono text-text-secondary mt-1 block text-right">{formatTime(message.timestamp)}</span>
</div>
```

**Agent bubble:**
```tsx
<div className="bg-bg-base border border-border-panel rounded-sm px-3 py-2 max-w-[80%]">
  <p className="text-xs text-text-primary">{message.content}</p>
  <span className="text-[8px] font-mono text-text-secondary mt-1 block">{formatTime(message.timestamp)}</span>
</div>
```

**Input:**
```tsx
<div className="border-t border-border-panel px-3 py-2 bg-bg-base">
  <div className="flex items-end gap-2">
    <textarea
      className="flex-1 bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs text-text-primary resize-none focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
      rows={1}
      placeholder="Mensagem..."
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
      }}
    />
    <button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm p-2 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none">
      <Icon name="send" size="sm" />
    </button>
  </div>
</div>
```

**Teclado:** Enter (send), Shift+Enter (newline)

**Store selectors:**
```typescript
const agents = useMissionControlStore((s) => s.agents);
const interAgentMessages = useMissionControlStore((s) => s.interAgentMessages);
```

---

### 3.5 Tab 5: AUTOMACAO

**NOVO wrapper:** `MCAutomationPanel.tsx`

**Sub-tabs via FilterPills:**

| Sub-tab ID | Label | Default |
|------------|-------|---------|
| `cron` | Cron | Sim |
| `webhooks` | Webhooks | Nao |
| `alertas` | Alertas | Nao |

**Sub-tab state:** `store.activeAutomacaoSubTab`

#### Sub-tab "Cron"

**Componente existente:** `MCCronPanel.tsx`

Layout: List com cada cron job como card.

| Campo | Exibicao |
|-------|----------|
| Nome | `text-xs font-bold text-text-primary` |
| Schedule | `font-mono text-[9px] text-text-secondary` (cron expression) |
| Modelo | `text-[8px] font-mono text-accent-blue` |
| Ultimo Run | `font-mono text-[8px]` + StatusDot (success=mint, error=red, running=orange) |
| Proximo Run | `font-mono text-[8px] text-text-secondary` |
| Toggle | Switch enable/disable |
| Action | `[Executar Agora]` button (secondary style) |

**Footer:** `[+ Novo Cron]` button (primary CTA)

**Store selectors:** `s.cronJobs`

#### Sub-tab "Webhooks"

**Componente existente:** `MCWebhookPanel.tsx`

Layout: Table.

| Coluna | Dado |
|--------|------|
| Nome | `text-xs font-bold` |
| URL | `font-mono text-[9px] truncate max-w-[200px]` |
| Eventos | Badge pills (event names) |
| Status | StatusDot (green=active, red=failing) |
| Ultimo Disparo | `font-mono text-[8px]` |
| Toggle | Switch enable/disable |

Cada row e expandivel para mostrar delivery history (ultimos 10 dispatches com status code e timestamp).

**Store selectors:** `s.webhooks` (novo campo no store)

#### Sub-tab "Alertas"

**NOVO componente:** `MCAlertRulesPanel.tsx`

Layout: List de alert rules com toggle + `[+ Nova Regra]` button no header.

Cada rule card:
```tsx
<div className="bg-surface border border-border-panel rounded-sm p-3 flex items-center justify-between">
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-bold text-text-primary">{rule.name}</span>
      <ConditionBadge condition={rule.condition} />
    </div>
    <div className="flex items-center gap-2">
      {rule.threshold != null && (
        <span className="text-[8px] font-mono text-text-secondary">threshold: {rule.threshold}</span>
      )}
      <ChannelBadge channel={rule.channel} />
      {rule.lastTriggered && (
        <span className="text-[8px] font-mono text-text-secondary">
          ultimo: {formatRelative(rule.lastTriggered)}
        </span>
      )}
    </div>
  </div>
  <ToggleSwitch enabled={rule.enabled} onChange={(v) => toggleRule(rule.id, v)} />
</div>
```

**ConditionBadge mapping:**

| Condition | Label | Color |
|-----------|-------|-------|
| `agent_offline` | Agent Offline | `accent-red` |
| `task_overdue` | Task Atrasada | `accent-orange` |
| `cost_threshold` | Custo Excedido | `accent-purple` |
| `error_rate` | Taxa de Erros | `accent-red` |
| `cron_failure` | Falha no Cron | `accent-orange` |

**ChannelBadge mapping:**

| Channel | Label | Color |
|---------|-------|-------|
| `toast` | Toast | `text-text-secondary` |
| `banner` | Banner | `accent-orange` |
| `webhook` | Webhook | `accent-blue` |

**Create/edit:** Inline form que expande abaixo do botao `[+ Nova Regra]`.
- Name input
- Condition dropdown (5 opcoes)
- Threshold input (numerico, condicional ao condition)
- Channel selector (3 opcoes, radio buttons)
- `[Salvar]` primary + `[Cancelar]` secondary

**Store selectors:** `s.alertRules` (novo campo no store)

---

### 3.6 Tab 6: RELATORIOS

**Componente existente:** `MCReportsPanel.tsx` (modificar para incluir sub-tabs)

**Sub-tabs via FilterPills:**

| Sub-tab ID | Label | Default |
|------------|-------|---------|
| `dashboard` | Dashboard | Sim |
| `standup` | Standup | Nao |

**Sub-tab state:** `store.activeRelatoriosSubTab`

#### Sub-tab "Dashboard"

Layout: `grid-cols-2 gap-3`

| Card | Tipo Chart | Dados | Cores |
|------|-----------|-------|-------|
| CostTrendCard | MiniLineAreaChart 30d | `s.tokenUsage` agrupado por dia | `brand-mint` fill, `brand-mint/30` area |
| CostByModelCard | MiniDonutChart | `s.tokenUsage` agrupado por model | `accent-purple`, `accent-blue`, `brand-mint` |
| CostByAgentCard | MiniDonutChart | `s.tokenUsage` agrupado por agent (via session) | `accent-orange`, `accent-blue`, `brand-mint`, `accent-purple` |
| TaskVelocityCard | MiniBarChart | `s.tasks` completed per week (4 semanas) | `brand-mint` bars |
| SystemHealthCard | Ring (score 0-100) | Computed: uptime, error rate, task velocity | `brand-mint` (>70), `accent-orange` (40-70), `accent-red` (<40) |
| HeatmapCard | HeatmapGrid 13 semanas | `s.activities` agrupado por dia | Escala: `bg-surface` -> `brand-mint/20` -> `brand-mint/40` -> `brand-mint/60` -> `brand-mint` |

**Charts sao SVG puro** (via `LightweightCharts.tsx` ou inline SVG). Sem Recharts, sem bibliotecas de charting.

**Store selectors:** `s.tokenUsage`, `s.tasks`, `s.agents`, `s.activities`

#### Sub-tab "Standup"

**Componente existente:** `MCStandupPanel.tsx`

Layout:
```
Summary pills (horizontal strip):
  [agents: N] [concluidas: N] [em progresso: N] [bloqueios: N]

Agent report cards (vertical stack):
  Per-agent card com:
    - Agent name + role + StatusDot
    - Completed today (list)
    - In progress (list)
    - Blockers (list, accent-red highlight)
```

**Store selectors:** `s.currentStandup`

---

### 3.7 Tab 7: SISTEMA

**NOVO wrapper:** `MCSystemPanel.tsx`

**Sub-tabs via FilterPills:**

| Sub-tab ID | Label | Default |
|------------|-------|---------|
| `monitor` | Monitor | Sim |
| `skills` | Skills | Nao |
| `memoria` | Memoria | Nao |
| `config` | Config | Nao |

**Sub-tab state:** `store.activeSistemaSubTab`

#### Sub-tab "Monitor"

**Componente existente:** `MCSystemMonitorPanel.tsx`

Layout: `grid-cols-3 gap-3` de cards com metricas.

| Card | Dado | Formato |
|------|------|---------|
| Uptime | Tempo desde ultimo restart | `font-mono text-[28px] font-black` hero number |
| DB Size | SQLite file size | `font-mono` |
| Agents | Count total + online | `N online / N total` |
| Sessions | Active count | `font-mono` |
| Memory | Heap usage (se disponivel via API) | Progress bar |
| Services | MC Service, Gateway, Bridge | StatusDot per service |

**StatusDot mapping por service:**

| Status | Dot |
|--------|-----|
| Connected | `<StatusDot color="mint" glow />` |
| Degraded | `<StatusDot color="orange" />` |
| Disconnected | `<StatusDot color="red" />` |
| Unknown | `<StatusDot color="neutral" />` |

**Store selectors:** `s.connectionStatus`, `s.agents`, `s.sessions`

#### Sub-tab "Skills"

**Componente existente:** `MCSkillsPanel.tsx`

Layout: Master/Detail.
```
Left: w-64 (skill list)
  - Search input (top)
  - Skill items: name + StatusDot (active/inactive) + source badge

Right: flex-1 (detail)
  - Name (text-xs font-bold)
  - Source (badge)
  - Description (textarea, editable)
  - Trigger words (tag input)
  - Model select (dropdown)
  - Auto-run toggle (switch)
  - Security status (badge: approved/pending/blocked)
  - Code viewer (mono, bg-bg-base, readonly)
```

**Store selectors:** `s.skills` (novo campo opcional, ou via API fetch direto)

#### Sub-tab "Memoria"

**Componente existente:** `MCMemoryBrowserPanel.tsx`

Layout:
```
Top: Search bar (full-width)
Left: Tree view (w-64, recursive MCMemoryFile)
Right: Content preview (flex-1, mono, readonly)
```

Tree item:
```tsx
<button className={cn(
  'flex items-center gap-2 px-2 py-1 w-full text-left rounded-sm transition-all',
  'hover:bg-surface-hover',
  'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
  selected && 'bg-brand-mint/10 border-l-2 border-brand-mint',
)}>
  <Icon name={item.type === 'directory' ? 'folder' : 'description'} size="xs" />
  <span className="text-[9px] text-text-primary truncate">{item.name}</span>
  {item.size && <span className="text-[8px] font-mono text-text-secondary ml-auto">{formatSize(item.size)}</span>}
</button>
```

**Store selectors:** `s.memoryFiles`

#### Sub-tab "Config"

**NOVO componente:** `MCSettingsPanel.tsx`

Layout: Form com campos empilhados.

```tsx
<div className="max-w-lg space-y-4">
  {/* Connection status */}
  <div className="bg-surface border border-border-panel rounded-sm p-3">
    <SectionLabel>STATUS DA CONEXAO</SectionLabel>
    <div className="flex items-center gap-2 mt-2">
      <StatusDot color={connected ? 'mint' : 'red'} glow={connected} />
      <span className="text-xs text-text-primary">{connected ? 'Conectado' : 'Desconectado'}</span>
      <span className="text-[8px] font-mono text-text-secondary ml-auto">{baseUrl}</span>
    </div>
  </div>

  {/* Gateway URL */}
  <div>
    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">
      Gateway URL
    </label>
    <input
      type="text"
      value={gatewayUrl}
      onChange={(e) => setGatewayUrl(e.target.value)}
      className="w-full bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs text-text-primary font-mono focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
    />
  </div>

  {/* API Key */}
  <div>
    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">
      API Key
    </label>
    <input
      type="password"
      value={apiKey}
      onChange={(e) => setApiKey(e.target.value)}
      className="w-full bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs text-text-primary font-mono focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
    />
  </div>

  {/* Polling intervals */}
  <div>
    <SectionLabel>INTERVALOS DE POLLING</SectionLabel>
    <div className="grid grid-cols-3 gap-3 mt-2">
      <PollingInput label="Tasks" value={15} unit="s" />
      <PollingInput label="Status" value={30} unit="s" />
      <PollingInput label="Skills" value={60} unit="s" />
    </div>
  </div>

  {/* Save button */}
  <button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none">
    Salvar Configuracoes
  </button>
</div>
```

**Store selectors:** `s.connectionStatus`

---

## 4. State Management (Zustand)

### Mudancas em `store/missionControl.ts`

#### 4.1 Atualizar MCAgentTab type

**Antes:**
```typescript
export type MCAgentTab = 'painel' | 'tarefas' | 'skills' | 'sistema' | 'cron' | 'relatorios';
```

**Depois:**
```typescript
export type MCAgentTab = 'painel' | 'tarefas' | 'observar' | 'chat' | 'automacao' | 'relatorios' | 'sistema';
```

#### 4.2 Novos tipos

```typescript
/** Sub-tab types for tabs with sub-navigation */
export type MCObserveSubTab = 'atividade' | 'sessoes' | 'tokens' | 'logs';
export type MCAutomacaoSubTab = 'cron' | 'webhooks' | 'alertas';
export type MCRelatoriosSubTab = 'dashboard' | 'standup';
export type MCSistemaSubTab = 'monitor' | 'skills' | 'memoria' | 'config';

/** Alert rule definition */
export interface MCAlertRule {
  id: string;
  name: string;
  condition: 'agent_offline' | 'task_overdue' | 'cost_threshold' | 'error_rate' | 'cron_failure';
  threshold?: number;
  channel: 'toast' | 'banner' | 'webhook';
  enabled: boolean;
  lastTriggered?: number;
}

/** Webhook configuration */
export interface MCWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastFired?: number;
  lastStatus?: number;
  deliveryHistory?: Array<{
    timestamp: number;
    statusCode: number;
    success: boolean;
  }>;
}
```

#### 4.3 Novos campos no state

```typescript
interface MissionControlState {
  // ... campos existentes ...

  // Sub-tab state (4 pairs: getter + setter)
  activeObserveSubTab: MCObserveSubTab;
  setActiveObserveSubTab: (tab: MCObserveSubTab) => void;

  activeAutomacaoSubTab: MCAutomacaoSubTab;
  setActiveAutomacaoSubTab: (tab: MCAutomacaoSubTab) => void;

  activeRelatoriosSubTab: MCRelatoriosSubTab;
  setActiveRelatoriosSubTab: (tab: MCRelatoriosSubTab) => void;

  activeSistemaSubTab: MCSistemaSubTab;
  setActiveSistemaSubTab: (tab: MCSistemaSubTab) => void;

  // Overlay state (2 pairs: getter + setter)
  profileAgentId: string | null;
  setProfileAgentId: (id: string | null) => void;

  taskDetailId: number | null;
  setTaskDetailId: (id: number | null) => void;

  // New domain data
  alertRules: MCAlertRule[];
  setAlertRules: (rules: MCAlertRule[]) => void;

  webhooks: MCWebhook[];
  setWebhooks: (webhooks: MCWebhook[]) => void;
}
```

#### 4.4 Defaults no create()

```typescript
// Sub-tab state
activeObserveSubTab: 'atividade',
setActiveObserveSubTab: (tab) => set({ activeObserveSubTab: tab }),

activeAutomacaoSubTab: 'cron',
setActiveAutomacaoSubTab: (tab) => set({ activeAutomacaoSubTab: tab }),

activeRelatoriosSubTab: 'dashboard',
setActiveRelatoriosSubTab: (tab) => set({ activeRelatoriosSubTab: tab }),

activeSistemaSubTab: 'monitor',
setActiveSistemaSubTab: (tab) => set({ activeSistemaSubTab: tab }),

// Overlay state
profileAgentId: null,
setProfileAgentId: (id) => set({ profileAgentId: id }),

taskDetailId: null,
setTaskDetailId: (id) => set({ taskDetailId: id }),

// New domain
alertRules: [],
setAlertRules: (rules) => set({ alertRules: rules }),

webhooks: [],
setWebhooks: (webhooks) => set({ webhooks }),
```

#### 4.5 Data flow pattern

```
mcApi.get('/api/...') -> useMCPoll (visibility-aware) -> store.setX(data) -> component via selector
```

#### 4.6 Selector rule

Um selector por campo. Nunca destructure do store.

```typescript
// CORRETO
const agents = useMissionControlStore((s) => s.agents);
const tasks = useMissionControlStore((s) => s.tasks);

// ERRADO — causa re-render em cascata
const { agents, tasks } = useMissionControlStore();
```

#### 4.7 Campos a remover (deprecated)

| Campo | Motivo |
|-------|--------|
| `showConfigView` | Substituido por tab `sistema` sub-tab `config` |
| `setShowConfigView` | Idem |
| `activeConfigTab` | Substituido por `activeSistemaSubTab` |
| `setActiveConfigTab` | Idem |

Manter com `@deprecated` tag durante S0-S5 para backwards compat, remover em S6.

---

## 5. Novos Componentes (7)

### 5.1 MCObservePanel.tsx

**Path:** `components/agents/mc/MCObservePanel.tsx`

**Props interface:**
```typescript
// Nenhuma prop externa — tudo via store
export function MCObservePanel(): JSX.Element
```

**Layout:**
```tsx
<div className="flex flex-col h-full">
  {/* Sub-tab pills */}
  <div className="flex items-center gap-2 px-3 py-2 border-b border-border-panel">
    {SUB_TABS.map((tab) => (
      <SubTabPill key={tab.id} tab={tab} active={activeSubTab === tab.id} onClick={setActiveSubTab} />
    ))}
  </div>

  {/* Content */}
  <div className="flex-1 overflow-y-auto p-3">
    <Suspense fallback={<div className="bg-border-panel animate-pulse rounded-sm h-48 w-full" />}>
      {activeSubTab === 'atividade' && <MCActivityPanel />}
      {activeSubTab === 'sessoes' && <SessionsTable />}
      {activeSubTab === 'tokens' && <MCTokenDashboardPanel />}
      {activeSubTab === 'logs' && <MCLogViewerPanel />}
    </Suspense>
  </div>
</div>
```

**Data source:** `store.activeObserveSubTab` para sub-tab state. Cada sub-panel usa seus proprios selectors.

**Empty state:** Delegada para cada sub-panel.

**Loading state:** Skeleton `h-48 w-full`.

---

### 5.2 MCAutomationPanel.tsx

**Path:** `components/agents/mc/MCAutomationPanel.tsx`

**Props interface:**
```typescript
export function MCAutomationPanel(): JSX.Element
```

**Layout:** Mesmo pattern do MCObservePanel com 3 sub-tabs: Cron | Webhooks | Alertas.

**Data source:** `store.activeAutomacaoSubTab`.

**Empty state:** Delegada para cada sub-panel.

**Loading state:** Skeleton `h-48 w-full`.

---

### 5.3 MCSystemPanel.tsx

**Path:** `components/agents/mc/MCSystemPanel.tsx`

**Props interface:**
```typescript
export function MCSystemPanel(): JSX.Element
```

**Layout:** Mesmo pattern com 4 sub-tabs: Monitor | Skills | Memoria | Config.

**Data source:** `store.activeSistemaSubTab`.

**Empty state:** Delegada para cada sub-panel.

**Loading state:** Skeleton `h-48 w-full`.

---

### 5.4 MCTaskDetailDrawer.tsx

**Path:** `components/agents/mc/MCTaskDetailDrawer.tsx`

**Props interface:**
```typescript
interface MCTaskDetailDrawerProps {
  taskId: number;
  onClose: () => void;
}

export function MCTaskDetailDrawer({ taskId, onClose }: MCTaskDetailDrawerProps): JSX.Element
```

**Layout:** Overlay right drawer, `w-[380px]`.

```tsx
<AnimatePresence>
  {taskId && (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative w-[380px] h-full bg-bg-base border-l border-border-panel flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-panel">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Detalhes da Tarefa</span>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm">
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <input className="w-full text-sm font-bold text-text-primary bg-transparent border-none outline-none" value={task.title} onChange={...} />

          {/* Description */}
          <textarea className="w-full bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs text-text-primary resize-none min-h-[80px] focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none" value={task.description} onChange={...} />

          {/* Priority selector */}
          <Field label="Prioridade">
            <PrioritySelector value={task.priority} onChange={...} />
          </Field>

          {/* Assigned agent */}
          <Field label="Atribuido a">
            <AgentSelector value={task.assigned_to} agents={agents} onChange={...} />
          </Field>

          {/* Status */}
          <Field label="Status">
            <StatusSelector value={task.status} onChange={...} />
          </Field>

          {/* Due date */}
          <Field label="Data Limite">
            <input type="date" value={...} className="bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs font-mono text-text-primary focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none" />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <TagInput tags={task.tags} onChange={...} />
          </Field>

          {/* Ticket ref */}
          <Field label="Ticket">
            <input className="w-full bg-surface border border-border-panel rounded-sm px-3 py-2 text-xs font-mono text-text-primary focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none" value={task.ticket_ref} onChange={...} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-panel">
          <button className="bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-accent-red/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none">
            Excluir
          </button>
          <button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none">
            Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

**Data source:** `store.tasks.find(t => t.id === taskId)` + `store.agents` (for assignment selector).

**API endpoint:** `PUT /api/tasks/:id` via `mcApi.put()`.

**Empty state:** N/A (drawer so abre quando taskId existe).

---

### 5.5 MCAlertRulesPanel.tsx

**Path:** `components/agents/mc/MCAlertRulesPanel.tsx`

**Props interface:**
```typescript
export function MCAlertRulesPanel(): JSX.Element
```

**Layout:**
```tsx
<div className="space-y-3">
  {/* Header with add button */}
  <div className="flex items-center justify-between">
    <SectionLabel>REGRAS DE ALERTA</SectionLabel>
    <button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none">
      <Icon name="add" size="xs" /> Nova Regra
    </button>
  </div>

  {/* Inline create form (conditional) */}
  {showCreateForm && <AlertRuleForm onSave={handleCreate} onCancel={() => setShowCreateForm(false)} />}

  {/* Rules list */}
  {alertRules.map((rule) => (
    <AlertRuleCard key={rule.id} rule={rule} onToggle={toggleRule} onEdit={editRule} />
  ))}
</div>
```

**Data source:** `store.alertRules`.

**API endpoint:** `GET/POST/PUT/DELETE /api/alert-rules` via `mcApi`.

**Empty state:**
```tsx
<div className="flex flex-col items-center gap-3 py-8">
  <span className="material-symbols-outlined text-[28px] text-text-secondary opacity-40">notifications_off</span>
  <p className="text-text-secondary text-xs text-center">Nenhuma regra de alerta configurada</p>
  <p className="text-text-secondary text-[9px] text-center max-w-[200px]">
    Crie regras para ser notificado sobre eventos criticos
  </p>
</div>
```

**Loading state:** Skeleton list (3 items, `h-16 w-full`).

---

### 5.6 MCSettingsPanel.tsx

**Path:** `components/agents/mc/MCSettingsPanel.tsx`

**Props interface:**
```typescript
export function MCSettingsPanel(): JSX.Element
```

**Layout:** Descrito na Secao 3.7 Sub-tab "Config".

**Data source:** `store.connectionStatus` + `mcApi.baseUrl()` para display. Settings sao locais (localStorage ou store).

**API endpoint:** `GET /api/status` para health check.

**Empty state:** N/A (form sempre renderiza).

**Loading state:** N/A (form sempre renderiza com defaults).

---

### 5.7 MCInterAgentStrip.tsx

**Path:** `components/agents/mc/MCInterAgentStrip.tsx`

**Props interface:**
```typescript
export function MCInterAgentStrip(): JSX.Element
```

**Layout:**
```tsx
<div className="border-t border-border-panel">
  {/* Header (always visible) */}
  <button
    onClick={toggle}
    className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-hover transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
  >
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Inter-Agent</span>
      <span className="text-[7px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-2 py-0.5 rounded-sm text-text-secondary">
        {count}
      </span>
    </div>
    <Icon name={expanded ? 'expand_more' : 'expand_less'} size="xs" className="text-text-secondary" />
  </button>

  {/* Body (collapsible) */}
  <AnimatePresence>
    {expanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="max-h-[200px] overflow-y-auto px-3 pb-2 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="text-[8px] font-bold text-accent-purple shrink-0">{msg.from}</span>
              <Icon name="arrow_forward" size="xs" className="text-text-secondary shrink-0 mt-0.5" />
              <span className="text-[8px] font-bold text-accent-blue shrink-0">{msg.to}</span>
              <span className="text-[9px] text-text-primary flex-1">{msg.content}</span>
              {msg.taskRef && (
                <span className="text-[7px] font-mono text-accent-blue shrink-0">{msg.taskRef}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

**Data source:** `store.interAgentMessages`.

**Empty state:**
```tsx
<p className="text-[9px] text-text-secondary text-center py-3">Sem mensagens inter-agent</p>
```

---

## 6. Arquivos a Modificar

| Arquivo | Mudanca Exata |
|---------|---------------|
| `store/missionControl.ts` | Alterar `MCAgentTab` de 6 para 7 valores. Adicionar tipos `MCObserveSubTab`, `MCAutomacaoSubTab`, `MCRelatoriosSubTab`, `MCSistemaSubTab`, `MCAlertRule`, `MCWebhook`. Adicionar 4 pares sub-tab state, 2 pares overlay state, `alertRules` + `setAlertRules`, `webhooks` + `setWebhooks`. Deprecar `showConfigView`, `activeConfigTab`. |
| `components/agents/MCAgentsShell.tsx` | Atualizar TABS array de 6 para 7 items (substituir `skills`/`cron` por `observar`/`chat`/`automacao`/`sistema`). Atualizar ActivePanel switch para 7 cases. Remover import/render de MCRightSidebar. Adicionar overlay renders para Agent Profile e Task Detail (via store `profileAgentId` e `taskDetailId`). Atualizar useMCKeyboardNav para teclas 1-7. |
| `components/AppContentRouter.tsx` | Remover case `agent-detail` (linhas 106-108, Agent Profile agora e overlay dentro de MCAgentsShell). Remover condicional `showConfigView` + MCConfigShell (linhas 101-103, Config agora e sub-tab de Sistema). |
| `components/agents/mc/MCReportsPanel.tsx` | Adicionar FilterPills sub-tab toggle (Dashboard vs Standup). Renderizar MCStandupPanel condicionalmente quando sub-tab === 'standup'. |
| `components/agents/mc/MCChatPanel.tsx` | Adicionar MCInterAgentStrip como secao collapsible no bottom do tab. Adicionar conversation list no left panel quando usado como tab (vs overlay mode). |
| `components/agents/mc/MCDashboardPanel.tsx` | Alterar agent click de navegacao (`onNavigate('agent-detail')`) para `store.setProfileAgentId(String(agent.id))` (abre overlay). |
| `components/agents/mc/MCTaskBoardPanel.tsx` | Alterar task click de modal/navegacao para `store.setTaskDetailId(task.id)` (abre overlay MCTaskDetailDrawer). |

### Arquivos a criar

| Arquivo | Tipo |
|---------|------|
| `components/agents/mc/MCObservePanel.tsx` | Wrapper sub-tabs |
| `components/agents/mc/MCAutomationPanel.tsx` | Wrapper sub-tabs |
| `components/agents/mc/MCSystemPanel.tsx` | Wrapper sub-tabs |
| `components/agents/mc/MCTaskDetailDrawer.tsx` | Overlay drawer |
| `components/agents/mc/MCAlertRulesPanel.tsx` | CRUD panel |
| `components/agents/mc/MCSettingsPanel.tsx` | Config form |
| `components/agents/mc/MCInterAgentStrip.tsx` | Collapsible strip |

### Arquivos a remover (post-migration, S6+)

| Arquivo | Motivo |
|---------|--------|
| `components/agents/mc/MCRightSidebar.tsx` | Substituido por overlays + tab Chat |
| `components/agents/mc/MCConfigShell.tsx` | Substituido por tab Sistema > Config |
| `components/agents/MCAgentDetail.tsx` | Se existir, substituido por overlay Agent Profile |

---

## 7. Sprint Execution

| Sprint | Foco | Entregas | Tempo | Deps |
|--------|------|----------|-------|------|
| **S0** | Foundation | Store changes (tipos, sub-tabs, overlays) + 7 tab TABS array + keyboard nav 1-7 | 0.5d | -- |
| **S1** | Observe | `MCObservePanel.tsx` + sub-tab wiring (4 sub-tabs) | 0.5d | S0 |
| **S2** | Automation | `MCAutomationPanel.tsx` + `MCAlertRulesPanel.tsx` (mock data) | 0.5d | S0 |
| **S3** | System | `MCSystemPanel.tsx` + `MCSettingsPanel.tsx` | 0.5d | S0 |
| **S4** | Chat | `MCChatPanel.tsx` promoted to tab + `MCInterAgentStrip.tsx` | 0.5d | S0 |
| **S5** | Overlays | `MCTaskDetailDrawer.tsx` + Agent Profile overlay + remover MCRightSidebar | 1d | S0-S4 |
| **S6** | Polish | Reports sub-tabs + empty states + skeletons + keyboard polish + remover deprecated | 0.5d | S5 |
| **S7** | Gaps | Alert rules CRUD real, Exec Approvals, GitHub badge, audit trail | 1-2d | S6 |

**S1-S4 sao independentes e podem rodar em paralelo.**

### Diagrama de dependencias

```
S0 (Foundation)
 ├── S1 (Observe)     ─┐
 ├── S2 (Automation)   ├── S5 (Overlays) ── S6 (Polish) ── S7 (Gaps)
 ├── S3 (System)       │
 └── S4 (Chat)        ─┘
```

### Criterios de conclusao por sprint

**S0 — Foundation:**
- [ ] `MCAgentTab` type atualizado para 7 valores
- [ ] 4 sub-tab state pairs adicionados ao store
- [ ] 2 overlay state pairs adicionados ao store
- [ ] `MCAlertRule` e `MCWebhook` types definidos
- [ ] TABS array em MCAgentsShell atualizado
- [ ] Keyboard nav 1-7 funcionando
- [ ] `npm run build` passa

**S1 — Observe:**
- [ ] `MCObservePanel.tsx` criado com 4 sub-tabs
- [ ] Sub-tab switching via FilterPills funcionando
- [ ] Cada sub-panel renderiza (ActivityPanel, Sessions table, TokenDashboard, LogViewer)
- [ ] Sub-tab state persiste no store
- [ ] `npm run build` passa

**S2 — Automation:**
- [ ] `MCAutomationPanel.tsx` criado com 3 sub-tabs
- [ ] `MCAlertRulesPanel.tsx` criado com mock data
- [ ] Cron panel renderiza dentro do wrapper
- [ ] Webhook panel renderiza dentro do wrapper
- [ ] Toggle enable/disable funciona (local state)
- [ ] `npm run build` passa

**S3 — System:**
- [ ] `MCSystemPanel.tsx` criado com 4 sub-tabs
- [ ] `MCSettingsPanel.tsx` criado com form fields
- [ ] Monitor, Skills, Memory panels renderizam dentro do wrapper
- [ ] Config form mostra status de conexao
- [ ] `npm run build` passa

**S4 — Chat:**
- [ ] MCChatPanel renderiza como tab completo (conversation list + thread)
- [ ] `MCInterAgentStrip.tsx` criado e integrado no bottom
- [ ] Expand/collapse funciona
- [ ] User/Agent bubbles estilizados corretamente
- [ ] Send via Enter, newline via Shift+Enter
- [ ] `npm run build` passa

**S5 — Overlays:**
- [ ] `MCTaskDetailDrawer.tsx` criado (380px, right drawer)
- [ ] Agent Profile abre como overlay (480px) via store.profileAgentId
- [ ] MCRightSidebar removido de MCAgentsShell
- [ ] Escape fecha overlays
- [ ] Backdrop click fecha overlays
- [ ] Framer Motion transitions suaves
- [ ] AppContentRouter limpo (sem agent-detail case, sem MCConfigShell)
- [ ] `npm run build` passa

**S6 — Polish:**
- [ ] MCReportsPanel com sub-tabs (Dashboard + Standup)
- [ ] Empty states para todos os panels
- [ ] Loading skeletons para todos os panels
- [ ] Keyboard nav completo (1-7 tabs, j/k agents, Enter abre, Escape fecha)
- [ ] Deprecated fields removidos do store
- [ ] `npm run build` passa

**S7 — Gaps:**
- [ ] Alert rules CRUD via API (nao apenas mock)
- [ ] Webhook delivery history
- [ ] GitHub badge em task cards (se ticket_ref presente)
- [ ] Activity audit trail
- [ ] `npm run build` passa

---

## 8. Regras de Implementacao

1. **Todos os labels em PT-BR.** Nomes de variaveis, tipos e comments em English.

2. **Design system tokens mandatorios.** Cores via CSS variables (`var(--color-*)`), Tailwind classes (`text-brand-mint`, `bg-surface`, etc.). Nunca hex direto. Consultar `CLAUDE.md` secao Design System.

3. **Zustand selectors granulares.** Um selector por campo. Nunca destructure do store. Referencia: Secao 4.6.

4. **Sem dependencias novas.** Stack fixa: React 19 + Tailwind + Framer Motion + Zustand + idb. Sem shadcn, sem Radix, sem MUI, sem Recharts.

5. **Charts via SVG puro.** Usar `LightweightCharts.tsx` ou inline SVG. Sparklines, donuts, bars, rings, heatmaps sao todos SVG simples.

6. **Mock data quando MC service offline.** Store ja e seeded com mocks via `mcMockData.ts`. Panels devem funcionar com dados mock sem crashes.

7. **Cada tab preenche 100% do espaco disponivel.** `h-full` no wrapper, `flex-1 overflow-y-auto` no content.

8. **Empty state padrao para cada panel.** Icone Material Symbols (32px, opacity-40) + texto descritivo + CTA opcional. Sem ilustracoes, sem emojis.

9. **Loading skeleton padrao para cada panel.** `bg-border-panel animate-pulse rounded-sm` com dimensoes que correspondem ao layout final.

10. **Focus ring em todos os interativos:** `focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none`. Sem excecoes.

11. **Framer Motion transitions padrao:**
    - Page/tab: `opacity: 0->1, y: 8->0`, `duration: 0.2s`, ease `[0.25, 0.46, 0.45, 0.94]`
    - Overlay: `x: '100%'->0`, `duration: 0.25s`, `type: 'tween'`
    - Expand/collapse: `height: 0->auto`, `duration: 0.2s`
    - Hover: `transition-all duration-300 ease-out` (via Tailwind)

12. **Nao usar `rounded-lg`, `rounded-xl`, `shadow-lg`.** Apenas `rounded-sm` para cards/containers, `rounded-md` (4px) para agent cards com hover, `rounded-full` apenas para StatusDot e avatars ate 32px.

13. **Borders sempre `border border-border-panel`.** Nunca `border-2` exceto `border-b-2` para tab active indicator.

14. **Mobile touch targets:** `min-h-[44px]` para todos os interativos em mobile (WCAG).

---

## 9. Verificacao

### Checklist de validacao pos-sprint

| # | Teste | Criterio |
|---|-------|----------|
| 1 | Build | `npm run build` sem erros |
| 2 | 7 tabs | Navegar todos os 7 tabs, componentes carregam sem crash |
| 3 | Overlay Agent Profile | Click em agent no Painel abre overlay 480px com profile |
| 4 | Overlay Task Detail | Click em task card no Tarefas abre drawer 380px com detalhes |
| 5 | Log Terminal | `Cmd+L` abre/fecha terminal de logs no bottom |
| 6 | Sub-tabs Observar | 4 sub-tabs (Atividade, Sessoes, Tokens, Logs) alternam corretamente |
| 7 | Sub-tabs Automacao | 3 sub-tabs (Cron, Webhooks, Alertas) alternam corretamente |
| 8 | Sub-tabs Relatorios | 2 sub-tabs (Dashboard, Standup) alternam corretamente |
| 9 | Sub-tabs Sistema | 4 sub-tabs (Monitor, Skills, Memoria, Config) alternam corretamente |
| 10 | Empty states | Todos os panels mostram empty state quando MC offline |
| 11 | Keyboard nav | 1-7 troca tabs, j/k navega agents, Enter abre profile, Escape fecha overlays |
| 12 | Framer Motion | Transitions suaves (0.25s tween) em tabs, overlays, expand/collapse |
| 13 | Focus rings | Tab traversal mostra focus ring em todos os interativos |
| 14 | Selectors | Nenhum destructure de store (grep por `useMissionControlStore()` sem selector) |
| 15 | Design system | Nenhum hex direto, nenhum `rounded-lg`, nenhum `shadow-lg` (grep) |
| 16 | Labels | Todos os labels de UI em PT-BR |
| 17 | Chat | Enter envia, Shift+Enter faz newline, MCInterAgentStrip expande/colapsa |
| 18 | Overlays backdrop | Click no backdrop fecha overlay |

### Comandos de verificacao automatizada

```bash
# Build
npm run build

# Lint
npm run lint

# Typecheck
npm run typecheck

# Grep por violacoes de design system
grep -r "rounded-lg\|rounded-xl\|shadow-lg\|shadow-xl" components/agents/mc/ --include="*.tsx"

# Grep por hex direto (false positives possiveis, verificar manualmente)
grep -r "#[0-9A-Fa-f]\{6\}" components/agents/mc/ --include="*.tsx" | grep -v "import\|require\|//"

# Grep por destructure de store (violacao de selector rule)
grep -r "useMissionControlStore()" components/agents/ --include="*.tsx"

# Grep por emojis na UI (nao permitido)
grep -rP "[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F1E0}-\x{1F1FF}]" components/agents/mc/ --include="*.tsx"
```

---

*Versao: 2.0 | Data: 2026-03-27 | Baseline: 25 componentes MC existentes, 6 tabs -> 7 tabs + overlays*
