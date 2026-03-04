# Marco OS — PRD v1.0

**Data:** 04/03/2026
**Autor:** Marco + Frank
**Status:** Em construção (documento vivo)

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

### Onde queremos chegar
- **Curto prazo (30 dias):** Marco OS 100% funcional — todos os botões funcionam, dados reais, real-time updates, central de comando de verdade.
- **Médio prazo (90 dias):** Template-ready — qualquer pessoa pode inicializar do zero, preencher wizard de onboarding, e ter seu próprio "OS" funcionando.
- **Longo prazo (6 meses):** Produto SaaS — Marco OS como plataforma, cada usuário com seu sistema, agentes configuráveis, monetização.

### Quem usa
- **Hoje:** Apenas Marco (single-user).
- **Futuro:** Qualquer empreendedor/profissional que quer centralizar gestão de vida e negócios com auxílio de IA. Template inicializável do zero.

---

## 2. Arquitetura Atual

### Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite, hospedado em GitHub Pages (marcoraza.github.io/marco_os)
- **Backend:** Flask (Python), porta 8744, proxy via Nginx + SSL (api.clawdia.com.br)
- **Agentes:** OpenClaw gateway (porta 18789), 3 agentes: main (Frank, Claude Opus 4.6), coder (GPT-5.3 Codex), researcher (Gemini 2.5 Pro)
- **Banco de dados:** Notion (15+ DBs), IndexedDB (frontend local), arquivos JSON estáticos (public/data/)
- **Auth:** Bearer token (notion_form_token.txt)
- **Deploy:** git push → GitHub Pages (manual via script)

### Endpoints Bridge API (31 total)
Leitura: agents, runs, crons, heartbeats, tokens, memory, memory/content, config, tasks, standup, activities, github/issues, audit, search, pipelines, webhooks, tasks/comments
Escrita: notion (POST), dispatch (POST), crons (POST/PATCH/DELETE), config (PATCH), tasks (PATCH), tasks/review (PATCH), tasks/comments (POST), pipelines (POST), pipelines/run (POST), webhooks (POST/DELETE), chat (POST)

### Notion DBs (15)
Research, Deep Dives, Criadores, Projetos, Reuniões, Pessoas, Content, Brain Dump, Checklists, Financas, Saude, Skills, Decision Journal, Crons (via jobs.json)

### Design System
- rounded-sm (nunca rounded-lg/xl)
- font-mono em números
- CSS variables via Tailwind (zero hex)
- bg-surface border border-border-panel para cards
- Icon component (Material Symbols, zero emoji no código)
- Tema dark exclusivo

---

## 3. Arquitetura Alvo (com Supabase)

### Por que Supabase
- **Real-time nativo:** WebSocket subscriptions. Dado muda → frontend atualiza instantâneo.
- **Sem rate limit prático:** Free tier = 500MB, 50K rows, unlimited API calls.
- **Row Level Security:** Quando virar multi-user, já está pronto.
- **PostgREST:** API REST automática para qualquer tabela.
- **Custo:** R$0 (free tier suficiente).

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

### Tabelas Supabase (espelho Notion + extras)

tasks, projects, meetings, research, finance, health, contacts, content, creators, decisions, skills, brain_dumps, agent_events, notifications, user_preferences

### Notion permanece como source of truth
- Marco edita no Notion (familiar, flexível)
- Agentes escrevem no Notion via API
- Sync Worker propaga Notion → Supabase a cada 5min
- Frontend lê do Supabase (real-time, sem rate limit)
- Escrita: frontend → Bridge API → Notion → sync → Supabase

---

## 4. Seções e Features

### 4.1 Dashboard (Centro de Comando)
- Morning Brief: reuniões de hoje, projetos ativos, resumo financeiro (NotionData → Supabase)
- Mission Control Bar: métricas em tempo real
- Kanban: tasks do Notion Checklists
- Agenda: Google Calendar (via gog CLI ou API)
- Ações Rápidas: briefing diário, triar inbox, health check, sync memória — todos funcionais
- Notificações: derivadas de audit log + agent events + cron results
- Predictive Widgets: cálculos sobre dados reais
- Gamification: XP, streaks, levels baseados em ações reais
- **Project Switcher:** barra inferior "Pessoal" / "Zaremba Gestão" — muda contexto do sistema inteiro

### 4.2 Finanças
- 6 sub-tabs: Visão Geral, Transações, Débitos, Fluxo de Caixa, Investimentos, Cripto
- Wizard de configuração opt-in (botão "Configurar" em cada tab)
- Mock data como fallback inteligente (badge "Dados de exemplo")
- Preenchimento: manual via wizard + futuro: integração Open Finance / importação
- Supabase table: finance (sync do Notion Financas DB)

### 4.3 Saúde
- 2 sub-tabs: Registro Diário, Tendências
- Wizard opt-in
- Preenchimento: manual + futuro: Apple Health, importação de exames
- Supabase table: health

### 4.4 Aprendizado
- Sub-tabs: Currículo, Conhecimento, Recursos, Chronicle, Knowledge Graph, Criadores, Content Pipeline, Decision Journal, Skills, Exploração
- NotionData já funcional para maioria
- Supabase tables: research, creators, skills, decisions, content

### 4.5 Planner (expandir)
- Robusto: precisa de 8-9 abas
- Notas migram para dentro do Planner (não seção separada)
- Sub-tabs sugeridas: Visão Geral, Tarefas, Calendário, Content Calendar, Notas, Brain Dump, Deep Work, Rotina, Metas
- Supabase tables: tasks, brain_dumps + nova: planner_entries

### 4.6 Projetos (expandir para 8-9 abas)
- Cada projeto é uma entidade completa com: Overview, Kanban, Timeline, Documentação, Equipe, Budget, Métricas, Configurações, Notas
- **Project Switcher** (barra inferior do Dashboard) muda contexto global
- Seções globais (sempre visíveis): Dashboard, Finanças, Planner, CRM, Agentes
- Seções contextuais (podem não aparecer por projeto): Saúde, Aprendizado
- Supabase table: projects (com campo context_sections: string[])

### 4.7 CRM / Network
- Pessoas, Reuniões, Contatos
- NotionData já funcional
- Supabase tables: contacts, meetings

### 4.8 Agentes (100% funcional)
- 15 tabs por agente: Kanban, Execuções, Cron Jobs, Heartbeat, Memória, Config, Standup, Atividade, Chat, GitHub, Revisão, Auditoria, Busca, Pipelines, Webhooks
- Bridge API: 31 endpoints, tudo real
- Futuro: agentes atuam sobre dados pessoais (finance, health, tasks)

### 4.9 Configurações
- Painel de jornadas (status por tab)
- Tema, preferências, integrações
- API keys management
- Supabase table: user_preferences

---

## 5. Project Switcher — Conceito

### Comportamento
- Barra inferior do Dashboard: lista projetos ativos
- Clicar alterna contexto global
- "Pessoal" = modo padrão (todas as seções visíveis)
- Projetos de negócio = seções filtradas (sem Saúde, sem Aprendizado)

### Implementação
- Cada projeto tem campo `visibleSections: string[]` no Supabase
- Context provider: `ActiveProjectContext` com `projectId`, `visibleSections`
- Sidebar filtra seções baseado no projeto ativo
- Todos os dados filtram por `projectId` quando aplicável

### Perguntas em aberto
- Finanças são globais ou por projeto? (ex: budget de projeto vs finanças pessoais)
- Tasks pertencem a um projeto ou podem ser globais?
- Como o Dashboard agrega quando está em "Pessoal"? (mostra tudo de todos os projetos?)

---

## 6. Workflow de Dados — Preenchimento Inteligente

### Princípio: mock → manual → assistido → automático

| Fase | Como funciona | Quando |
|------|--------------|--------|
| Mock | Dados de exemplo pré-carregados, badge visual | Sempre (fallback) |
| Manual | Wizard opt-in, botão "Configurar" em cada tab | Usuário decide quando |
| Assistido | Agente sugere: "Vi que você mencionou gasto X, quer que eu registre?" | Quando tem dados de contexto |
| Automático | Integração direta: Open Finance, Apple Health, Google Calendar | Quando integração configurada |

### Para Marco (agora)
- Finance: preenchimento manual via wizard + agentes auxiliam (Frank pode perguntar via Telegram)
- Health: manual + futuro Apple Health
- Tasks: já funcional via Notion Checklists
- Calendar: já funcional via calendar.json (gog export)
- Research/Learning: já funcional via Notion

### Para template/produto (futuro)
- Wizard de onboarding obrigatório na primeira visita
- Importação de dados: CSV, APIs, integrações
- Agente configura wizards baseado no perfil do usuário

---

## 7. Roadmap de Sprints

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
- **S7:** Predictive Widgets com dados reais
- **S8:** Project Switcher + contexto por projeto

### Fase 4: Expansão (S9-S11)
- **S9:** Planner robusto (8-9 abas, Notes migrado pra dentro)
- **S10:** Projetos robusto (8-9 abas por projeto)
- **S11:** Integrações externas (Open Finance, Google Calendar API, Apple Health)

### Fase 5: Template (S12-S14)
- **S12:** Onboarding wizard obrigatório para novos usuários
- **S13:** Template inicializável (criar instância do zero)
- **S14:** Auth multi-user (Supabase Auth + RLS por user)

---

## 8. Stack Definitiva

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Frontend | React 18 + TypeScript + Tailwind + Vite | SPA |
| Hosting frontend | GitHub Pages (migrar Vercel quando produto) | Deploy |
| Backend API | Flask (notion_form_api.py) | Bridge para agentes + Notion |
| Real-time DB | Supabase (PostgreSQL + Realtime) | Dados + subscriptions |
| Source of truth | Notion (15+ DBs) | Edição humana + escrita de agentes |
| Sync | Python cron (Notion → Supabase, 5min) | Propagação |
| Agentes | OpenClaw (main/coder/researcher) | Execução de tarefas |
| Auth | Bearer token (hoje) → Supabase Auth (futuro) | Autenticação |
| SSL/Proxy | Nginx + Certbot (api.clawdia.com.br) | HTTPS |
| Domain | clawdia.com.br (backend) | API |

---

## 9. Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Notion como source of truth | Manter | Marco já usa, agentes já escrevem lá |
| Supabase como camada real-time | Adicionar | Polling é limitado, WebSocket é melhor |
| Mock data como fallback | Manter sempre | Nunca perder visão da UI para iterar |
| Wizard opt-in (não obrigatório) | Botão "Configurar" | Não bloquear uso, permitir exploração |
| Project Switcher | Contexto global | Projetos são entidades de primeiro nível |
| Notes dentro do Planner | Migrar | Simplificar sidebar |
| Bridge API continua | Sim | Ações de agentes não passam por Supabase |

---

## 10. Credenciais Necessárias

- [ ] Supabase URL do projeto
- [ ] Supabase anon key (pública → frontend)
- [ ] Supabase service_role key (privada → backend/sync)
- [x] Notion token (já configurado)
- [x] OpenClaw gateway (já configurado)
- [x] Google Calendar/Drive (gog CLI, já configurado)
- [x] GitHub (gh CLI, já configurado)

---

## 11. Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Tempo de carregamento do Dashboard | <2s |
| Delay de atualização (dados Notion → UI) | <5min (warm), <60s (tasks) |
| Botões funcionais | 100% |
| Seções com dados reais | >80% |
| Uptime Bridge API | >99% |
| Build errors | 0 |

---

**Próximos passos:**
1. Marco cria projeto Supabase e passa keys
2. Frank executa S0 (setup tabelas)
3. Sprints sequenciais conforme roadmap
