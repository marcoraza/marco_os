# Marco OS — PRD v2.0

**Data:** 04/03/2026
**Autor:** Marco + Frank
**Status:** Em construção (documento vivo)
**Versão anterior:** PRD v2.5 (03/03/2026, Frank + Aria + Uma + Atlas)
**Changelog:** v2.0 — Merge com PRD v2.5. Adicionado: Design System detalhado, Feature Backlog priorizado, Quick Wins Phase 1.5, UX Standards, Open Questions, Supabase como arquitetura alvo.

---

## 1. Briefing

### O que é o Marco OS
Sistema operacional pessoal que centraliza toda a gestão de vida e negócios num único lugar, integrado com um sistema de multiagentes de IA. O grande diferencial: não é só um dashboard — os agentes agem sobre os dados, executam tarefas, e mantêm tudo atualizado em tempo real.

### De onde viemos
- Marco, 35 anos, empreendedor em Florianópolis. 11 meses sem receita após queda de R$40k/mês para zero.
- Infraestrutura construída ao longo de fev-mar/2026: OpenClaw gateway, 3 agentes (Frank/Coder/Researcher), Notion como base de dados, ~20 crons automatizados, Bridge API com 31 endpoints.
- Frontend React + Tailwind em GitHub Pages, ~6000+ linhas, 50+ componentes.
- Backend Flask (notion_form_api.py) na VPS em api.clawdia.com.br.
- Notion com 15+ databases como source of truth.
- Dados de pesquisa, pipelines de conteúdo, e sistema de agentes 100% operacional.
- PRD v2.5 definiu a base (DataProvider interface, NotionDataContext, SyncBadge, chat architecture). Muito já foi implementado e superado.

### Onde queremos chegar
- **Curto prazo (30 dias):** Marco OS 100% funcional — todos os botões funcionam, dados reais, real-time updates, central de comando de verdade.
- **Médio prazo (90 dias):** Template-ready — qualquer pessoa pode inicializar do zero, preencher wizard de onboarding, e ter seu próprio "OS" funcionando.
- **Longo prazo (6 meses):** Produto SaaS — Marco OS como plataforma, cada usuário com seu sistema, agentes configuráveis, monetização.

### Quem usa
- **Hoje:** Apenas Marco (single-user).
- **Futuro:** Qualquer empreendedor/profissional que quer centralizar gestão de vida e negócios com auxílio de IA. Template inicializável do zero.
- **TurboClaw:** Projeto separado que vive *dentro* do Marco OS como um projeto ativo. Sem link técnico — só um item no Kanban/Projetos.

---

## 2. Design System (OBRIGATÓRIO — não alterar)

### Tema (CSS Custom Properties)

```css
/* Dark (default) */
--color-bg-base: #0D0D0F;
--color-bg-header: #121212;
--color-bg-surface: #1C1C1C;
--color-bg-surface-hover: #252525;
--color-border-panel: #2A2A2A;
--color-text-primary: #E1E1E1;
--color-text-secondary: #8E8E93;
--color-brand-mint: #00FF95;
--color-brand-flame: #FF5500;
--color-accent-blue: #0A84FF;
--color-accent-red: #FF453A;
--color-accent-orange: #FF9F0A;
--color-accent-purple: #BF5AF2;

/* Light */
--color-bg-base: #E8E6E1;
--color-bg-header: #F0EEE9;
--color-bg-surface: #F5F3EF;
--color-text-primary: #1C1917;
--color-text-secondary: #78716C;
--color-brand-mint: #059669;
```

### Tipografia
- Font: Inter (300-900 weights)
- Labels: `text-[8px]` a `text-[10px]`, `font-bold` ou `font-black`, `uppercase`, `tracking-widest`
- Body: `text-xs` a `text-sm`
- Monospace para dados: `font-mono`
- Ícones: Material Symbols Outlined (via Google Fonts CDN), componente `<Icon>`

### Hierarquia Visual (4 níveis)
- **L1** número principal: `text-[24px] font-black font-mono`
- **L2** subtítulo/label: `text-[10px] font-bold uppercase tracking-widest text-text-secondary`
- **L3** corpo: `text-xs text-text-primary`
- **L4** meta/timestamp: `text-[8px] font-mono text-text-secondary`

### Padrões de Componentes
- Cards: `bg-surface border border-border-panel rounded-sm`
- Section labels: `<SectionLabel>` component
- Status indicators: `<StatusDot>` com `color` e `glow` props
- Buttons: `bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest`
- Page transitions: Framer Motion `opacity + y` com 0.25s ease

### Regras Absolutas
- Zero emojis na UI
- Zero `rounded-lg` ou maior — sempre `rounded-sm`
- Zero shadows
- Zero hex no código — usar CSS variables via Tailwind
- Material Symbols Outlined only (componente `<Icon>`)
- Labels PT-BR, código/comentários em inglês
- `npm run build` deve funcionar sempre
- Mock data fallback sempre presente

---

## 3. Arquitetura Atual

### Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite, hospedado em GitHub Pages
- **Backend:** Flask (Python), porta 8744, proxy via Nginx + SSL (api.clawdia.com.br)
- **Agentes:** OpenClaw gateway (porta 18789), 3 agentes: main (Frank, Claude Opus 4.6), coder (GPT-5.3 Codex), researcher (Gemini 2.5 Pro)
- **Banco de dados:** Notion (15+ DBs), IndexedDB (frontend local), arquivos JSON estáticos (public/data/)
- **Auth:** Bearer token (notion_form_token.txt)
- **Deploy:** git push → GitHub Pages (manual via script)

### Endpoints Bridge API (31 total)
**Leitura:** agents, runs, crons, heartbeats, tokens, memory, memory/content, config, tasks, standup, activities, github/issues, audit, search, pipelines, webhooks, tasks/comments
**Escrita:** notion (POST), dispatch (POST), crons (POST/PATCH/DELETE), config (PATCH), tasks (PATCH), tasks/review (PATCH), tasks/comments (POST), pipelines (POST), pipelines/run (POST), webhooks (POST/DELETE), chat (POST)

### Notion DBs (15)

| Database | DB ID | Seção |
|----------|-------|-------|
| Research | `30bb72d5-042d-8176-a902-deaef821c5f2` | learning |
| Deep Dives | `310b72d5-042d-8122-8590-ca967b0ee686` | learning |
| Criadores | `30cb72d5-042d-81dd-8a48-ec715b1033e3` | learning |
| Projetos | `30bb72d5-042d-819a-a583-c029400082bc` | planner |
| Reuniões | `30bb72d5-042d-812f-bd97-ce23f4f9d2cd` | crm |
| Pessoas | `30bb72d5-042d-8138-ae67-dec4f0315630` | crm |
| Content | `30bb72d5-042d-81a2-93f3-fcfe40f23bb9` | planner |
| Brain Dump | `30bb72d5-042d-810b-92cd-ed5924a84410` | notes |
| Checklists | `30fb72d5-042d-81d2-bc6b-e2515ca8d3e2` | planner |
| Financas | `318b72d5-042d-8184-95fc-c5b9a65e0249` | finance |
| Saude | `318b72d5-042d-8179-9398-fc1ed4c6c297` | health |
| Skills | `318b72d5-042d-810e-9f8e-ca073a1b4587` | learning |
| Decision Journal | `318b72d5-042d-812b-91a4-f1bde3362a59` | learning |

### Sidebar (9 seções — fixas)
```
Central de Comando | Financas | Saude | Aprendizado
Projetos | Notas | Network | Agentes | Configuracoes
```

---

## 4. Arquitetura Alvo (com Supabase)

### Por que Supabase (e não só Bridge API)
- **Notion rate limit:** 3 req/s. Dashboard com 10 widgets = throttled.
- **Latência:** Notion API 200-800ms × N widgets = dashboard lento.
- **Real-time nativo:** WebSocket subscriptions. Dado muda → frontend atualiza instantâneo.
- **Sem rate limit prático:** Free tier = 500MB, 50K rows, unlimited API calls.
- **Row Level Security:** Quando virar multi-user, já está pronto.
- **Custo:** R$0.

### Diagrama

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Marco OS (SPA) │────▶│  Supabase    │◀────│  Notion     │
│  GitHub Pages   │     │  (PostgreSQL │     │  (source of │
│                 │◀────│   + Realtime │     │   truth)    │
│  - React        │ WS  │   + Auth)    │     │             │
│  - Tailwind     │     └──────┬───────┘     └──────▲──────┘
└─────────────────┘            │                     │
                               │              ┌──────┴──────┐
                         ┌─────▼─────┐        │ Sync Worker │
                         │ Bridge API│        │ (cron 5min) │
                         │ (Flask)   │────────│ Notion→Supa │
                         │ Port 8744 │        └─────────────┘
                         └─────┬─────┘
                               │
                         ┌─────▼─────┐
                         │ OpenClaw  │
                         │ Gateway   │
                         │ (agents)  │
                         └───────────┘
```

### Camadas de atualização

| Camada | Frequência | Fonte | Dados |
|--------|-----------|-------|-------|
| Real-time (10s) | 10s | Bridge API | Agents, runs, heartbeats, chat, dispatch |
| Near-real-time (60s) | 60s | Bridge API → Notion | Tasks/Kanban, notifications, audit |
| Warm cache (5min) | 5min | Sync Worker → Supabase | Finance, saúde, projetos, reuniões |
| Cold cache (30min) | 30min | Sync Worker → Supabase | Criadores, skills, content, decisions |

### Tabelas Supabase

tasks, projects, meetings, research, finance, health, contacts, content, creators, decisions, skills, brain_dumps, agent_events, notifications, user_preferences

### Fluxo de dados
- **Leitura:** Frontend → Supabase (real-time subscriptions)
- **Escrita:** Frontend → Bridge API → Notion → Sync Worker → Supabase → Frontend
- **Agentes:** OpenClaw → Notion → Sync Worker → Supabase → Frontend
- **Notion permanece source of truth** — Marco edita lá, agentes escrevem lá

### Credenciais Supabase
- Projeto: `rznqgjrlbirdzwpskdxy` (região Americas)
- URL: `https://rznqgjrlbirdzwpskdxy.supabase.co`
- Keys: `/home/clawd/.openclaw/credentials/supabase.env`

---

## 5. Seções e Features

### 5.1 Dashboard (Centro de Comando)
- Morning Brief: reuniões de hoje, projetos ativos, resumo financeiro
- Mission Control Bar: métricas em tempo real
- Kanban: tasks do Notion Checklists
- Agenda: Google Calendar (via gog CLI)
- Ações Rápidas: briefing diário, triar inbox, health check, sync memória — todos funcionais
- Notificações: derivadas de audit log + agent events + cron results
- Predictive Widgets: cálculos sobre dados reais
- Gamification: XP, streaks, levels baseados em ações reais
- Activity Heatmap: grid 90 dias (tasks + treinos + conteúdo)
- Cross-Domain Health Score: 0-100 (tasks 20% + saúde 20% + finanças 20% + projetos 20% + follow-ups 20%)
- **Project Switcher:** barra inferior — muda contexto do sistema inteiro
- **Mission Control Mode:** visual vermelho quando métricas críticas (saldo negativo, agente caído, prazo estourado)
- **Context-Aware:** layout muda por horário (manhã=agenda, tarde=projetos, noite=review)

### 5.2 Finanças
- 6 sub-tabs: Visão Geral, Transações, Débitos, Fluxo de Caixa, Investimentos, Cripto
- Wizard de configuração opt-in (botão "Configurar" em cada tab)
- Mock data como fallback inteligente (badge "Dados de exemplo")
- Scenario Planner: "E se eu cancelar assinatura X?" → projeção N meses
- Savings Goals: barras de progresso para metas
- Preenchimento: manual via wizard → agentes assistem → Open Finance (futuro)

### 5.3 Saúde
- 2 sub-tabs: Registro Diário, Tendências
- Wizard opt-in
- Energy Map: input diário 1-5, correlacionar com output (commits, tasks, conteúdo)
- Após 30 dias: descobrir horários ótimos para deep work
- Preenchimento: manual → Apple Health (futuro)

### 5.4 Aprendizado
- Sub-tabs: Pipeline (Research DB), Análises (Deep Dives), Roster (Criadores), Skills, Chronicle, Knowledge Graph, Content Pipeline, Decision Journal, Exploração
- Knowledge Graph: mapa visual de conexões research→deep dive→criador→projeto
- NotionData já funcional para maioria

### 5.5 Planner (expandir — 8-9 abas)
- Notas migram para dentro do Planner
- Sub-tabs: Visão Geral, Tarefas, Calendário, Content Calendar, Notas, Brain Dump, Deep Work, Rotina, Metas
- Deep Work Session: foco + pomodoro + live commit count

### 5.6 Projetos (expandir — 8-9 abas por projeto)
- Cada projeto: Overview, Kanban, Timeline, Documentação, Equipe, Budget, Métricas, Configurações, Notas
- Dev Pulse: último commit, PRs abertos, CI status (via `gh` CLI)
- **Project Switcher** muda contexto global
- Seções globais: Dashboard, Finanças, Planner, CRM, Agentes
- Seções contextuais (por projeto): Saúde e Aprendizado podem não aparecer

### 5.7 CRM / Network
- Pessoas, Reuniões, Contatos
- NotionData já funcional

### 5.8 Agentes (100% funcional)
- 15 tabs por agente: Kanban, Execuções, Cron Jobs, Heartbeat, Memória, Config, Standup, Atividade, Chat, GitHub, Revisão, Auditoria, Busca, Pipelines, Webhooks
- Bridge API: 31 endpoints, tudo real
- Thought Log: painel expandível com raciocínio do agente (tool calls, decisões, erros)
- Execution Replay: timeline visual de execuções para debugging
- Futuro: agentes atuam sobre dados pessoais (finance, health, tasks)

### 5.9 Configurações
- Painel de jornadas (status por tab)
- Tema, preferências, integrações
- API keys management

---

## 6. Project Switcher — Conceito

### Comportamento
- Barra inferior do Dashboard: lista projetos ativos
- Clicar alterna contexto global
- "Pessoal" = modo padrão (todas as seções visíveis)
- Projetos de negócio = seções filtradas

### Implementação
- Cada projeto tem campo `visibleSections: string[]` no Supabase
- Context provider: `ActiveProjectContext` com `projectId`, `visibleSections`
- Sidebar filtra seções baseado no projeto ativo
- Todos os dados filtram por `projectId` quando aplicável

### Perguntas em aberto
- Finanças são globais ou por projeto? (budget de projeto vs finanças pessoais)
- Tasks pertencem a um projeto ou podem ser globais?
- Como o Dashboard agrega em modo "Pessoal"?

---

## 7. Workflow de Dados — Preenchimento Inteligente

### Princípio: mock → manual → assistido → automático

| Fase | Como funciona | Quando |
|------|--------------|--------|
| Mock | Dados de exemplo pré-carregados, badge visual | Sempre (fallback) |
| Manual | Wizard opt-in, botão "Configurar" em cada tab | Usuário decide quando |
| Assistido | Agente sugere: "Vi que você mencionou gasto X, quer que eu registre?" | Quando tem dados de contexto |
| Automático | Integração direta: Open Finance, Apple Health, Google Calendar | Quando integração configurada |

### Para Marco (agora)
- Finance: manual via wizard + agentes auxiliam via Telegram
- Health: manual + futuro Apple Health
- Tasks: já funcional via Notion Checklists
- Calendar: já funcional via calendar.json (gog export)
- Research/Learning: já funcional via Notion

### Para template/produto (futuro)
- Wizard de onboarding obrigatório na primeira visita
- Importação de dados: CSV, APIs, integrações
- Agente configura wizards baseado no perfil do usuário

---

## 8. UX Standards (transversal — aplicar em todas as seções)

### Loading States (Skeleton)
```tsx
<Skeleton className="h-4 w-32" /> // placeholder enquanto carrega
// bg-border-panel animate-pulse rounded-sm
```

### Empty States
Ícone Material Symbols `inbox` (32px) + "Nenhum item encontrado" + botão "Sincronizar" (refetch).

### Error Feedback
Toast quando fetch falha e cache > 10min.

### Mobile Touch Targets
Sidebar items mobile: `min-h-[44px]`. Bottom nav = Phase 4.

### SyncBadge
Toda seção que consome dados externos mostra timestamp de sync: "Sincronizado há 4min" / "Sincronizando..." / "Sem dados". Posição: top-right do header. Style: `text-[8px] font-mono text-text-secondary`.

---

## 9. Feature Backlog — Priorizado

### Prioridade ALTA

| Feature | Seção | Descrição | Esforço |
|---------|-------|-----------|---------|
| Cross-Domain Health Score | Dashboard | Score 0-100 agregando tasks, saúde, finanças, projetos, follow-ups | 3h |
| Conversational Analytics | Global (Chat) | "Quanto gastei com assinaturas?" → resposta com mini-chart SVG | 4h |
| Quick Capture Universal | Global (Cmd+N) | Captura rápida, Frank classifica: Brain Dump / Task / Meeting | 3h |
| Thought Log | Agentes | Painel expandível com raciocínio real-time do agente | 4h |
| Smart Morning Brief | Dashboard | brief_builder.py + Google Calendar real | 2h |
| Google Calendar no Dashboard | Dashboard | Próximos 5 eventos, agenda do dia via `gog cal` | 3h |

### Prioridade MÉDIA

| Feature | Seção | Descrição | Esforço |
|---------|-------|-----------|---------|
| Ghost Mode | Global (Cmd+Shift+G) | Tela mínima: 1 saldo, 1 task, 1 timer. ESC pra sair. | 2h |
| Energy Map | Saúde | Input diário 1-5, heatmap, correlação com output | 3h |
| Deep Work Session | Planner | Focus mode + pomodoro + live commit count | 3h |
| Scenario Planner | Finanças | What-if: toggle assinaturas, ver projeção N meses | 3h |
| Mission Control Mode | Dashboard | Visual vermelho em métricas críticas | 2h |
| Flow State Detector | Global | Frank detecta padrão de flow → UI reduz informação | 4h |
| Content Pipeline Visual | Aprendizado | Funil: Ideia → Draft → Revisão → Publicado com métricas | 3h |
| Activity Heatmap | Dashboard/Saúde | Grid 90 dias, intensidade por atividade | 3h |
| Execution Replay | Agentes | Timeline visual de agent executions para debugging | 4h |
| Dev Pulse per Project | Projetos | Último commit, PRs abertos, CI status | 3h |

### Prioridade BAIXA (backlog futuro)

| Feature | Descrição |
|---------|-----------|
| Atomic Notes Bidirecionais | Links automáticos entre notas (estilo Roam/Obsidian) |
| Knowledge Graph | Mapa visual SVG/Canvas de conexões entre entidades |
| Second Brain Layer | Decision Journal + Mental Model Library + Outcome Tracking |
| Savings Goals | Barras de progresso para metas financeiras |
| Agent Token Meter | Custo diário/semanal/mensal por agente |
| Stop Button + Checkpoints | Parar agente + checkpoints em ops de risco |
| MercadoPago Integration | Transações reais na seção Finance |
| Marco Chronicle Semanal | Relatório estruturado via frank-weekly-curation.sh |

---

## 10. Roadmap de Sprints

### Fase 1: Fundação Supabase (S0-S2)
- **S0:** Setup Supabase (projeto, tabelas, RLS, keys)
- **S1:** Sync Worker Notion → Supabase (cron Python 5min)
- **S2:** Frontend Supabase client (substituir NotionDataContext, Realtime subscriptions)

### Fase 2: Dados Vivos (S3-S5)
- **S3:** Mock fallback inteligente + badge "Dados de exemplo"
- **S4:** Tudo clicável (notificações navegam, ações rápidas executam, cards linkam)
- **S5:** Agentes → dados pessoais (Frank escreve em finance/health/tasks via Notion, sync propaga)

### Fase 3: Features Avançadas (S6-S8)
- **S6:** Gamification real (XP, streak, levels derivados de ações)
- **S7:** Predictive Widgets + Cross-Domain Health Score + Morning Brief real
- **S8:** Project Switcher + contexto por projeto

### Fase 4: Expansão (S9-S11)
- **S9:** Planner robusto (8-9 abas, Notes migrado, Deep Work)
- **S10:** Projetos robusto (8-9 abas por projeto, Dev Pulse)
- **S11:** Integrações externas (Open Finance, Google Calendar API, Apple Health)

### Fase 5: Template (S12-S14)
- **S12:** Onboarding wizard obrigatório para novos usuários
- **S13:** Template inicializável (criar instância do zero)
- **S14:** Auth multi-user (Supabase Auth + RLS por user)

---

## 11. Stack Definitiva

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Frontend | React 18 + TypeScript + Tailwind + Vite | SPA |
| Hosting | GitHub Pages → Vercel (quando produto) | Deploy |
| Backend API | Flask (notion_form_api.py) | Bridge agentes + Notion |
| Real-time DB | Supabase (PostgreSQL + Realtime) | Dados + subscriptions |
| Source of truth | Notion (15+ DBs) | Edição humana + agentes |
| Sync | Python cron (Notion → Supabase, 5min) | Propagação |
| Agentes | OpenClaw (main/coder/researcher) | Execução |
| Auth | Bearer token → Supabase Auth (futuro) | Autenticação |
| SSL/Proxy | Nginx + Certbot | HTTPS |
| Domain | api.clawdia.com.br | API backend |

---

## 12. Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Notion como source of truth | Manter | Marco já usa, agentes já escrevem lá |
| Supabase como camada real-time | Adicionar | Polling limitado, WS melhor, rate limit Notion |
| Mock data como fallback | Manter sempre | Nunca perder visão da UI |
| Wizard opt-in | Botão "Configurar" | Não bloquear uso |
| Project Switcher | Contexto global | Projetos = entidades de primeiro nível |
| Notes dentro do Planner | Migrar | Simplificar sidebar |
| Bridge API continua | Sim | Ações de agentes não passam por Supabase |
| 9 seções sidebar | Fixas | Não adicionar mais seções |
| DataProvider abstraction | Não mais | Supabase client resolve direto |

---

## 13. Credenciais

| Serviço | Status | Localização |
|---------|--------|------------|
| Supabase URL | ✅ | credentials/supabase.env |
| Supabase anon key | ✅ | credentials/supabase.env |
| Supabase service_role | ✅ | credentials/supabase.env |
| Notion token | ✅ | credentials/notion_token.txt |
| OpenClaw gateway | ✅ | openclaw.json |
| Google Calendar/Drive | ✅ | gog CLI |
| GitHub | ✅ | gh CLI |
| Bridge API token | ✅ | credentials/notion_form_token.txt |

---

## 14. Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Tempo de carregamento Dashboard | <2s |
| Delay atualização Notion → UI | <5min (warm), <60s (tasks) |
| Botões funcionais | 100% |
| Seções com dados reais | >80% |
| Uptime Bridge API | >99% |
| Build errors | 0 |

---

## 15. Open Questions

| # | Pergunta | Owner |
|---|----------|-------|
| 1 | Finanças: categorias finais para transações? | Marco |
| 2 | Saúde: Apple Health/Strava ou só manual por agora? | Marco |
| 3 | Mobile: quais 5 seções no bottom nav? | Marco |
| 4 | Project Switcher: finanças globais ou por projeto? | Marco |
| 5 | Project Switcher: tasks globais ou por projeto? | Marco |
| 6 | Dashboard em modo "Pessoal": agrega tudo de todos os projetos? | Marco |
| 7 | Content DB: quais statuses para o pipeline? | Marco |

---

**Próximos passos:**
1. ~~Marco cria projeto Supabase e passa keys~~ ✅
2. Frank executa S0 (setup tabelas Supabase)
3. Sprints sequenciais conforme roadmap
