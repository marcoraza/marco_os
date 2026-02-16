# Marco OS — Roadmap Completo

**Versão:** 2.0  
**Data:** 16/02/2026  
**Status:** Mission Control V2 ✅ | Backend 🚧 | Integrações 📋

---

## 🎯 Visão Geral

Transformar Marco OS de um dashboard estático em uma **plataforma operacional completa** com agentes reais, persistência de dados, integrações profundas e IA.

---

## 📊 FASE 1 — Fundação (3-4 semanas)

**Objetivo:** Tornar o sistema funcional e utilizável no dia-a-dia.

### 1.1 Backend + Persistência (CRÍTICO)

**Problema:** Dados desaparecem ao refresh, não há sync entre dispositivos.

**Solução:**
- [ ] Backend Node.js + Express (ou Fastify)
- [ ] PostgreSQL como DB principal
- [ ] Supabase como alternativa all-in-one (auth + DB + real-time)
- [ ] Redis para cache e WebSocket state

**Stack Técnica:**
```typescript
// Backend
- Node.js 20+
- Express 4.x ou Fastify 4.x
- PostgreSQL 15+
- Prisma ORM
- Socket.io (WebSocket)
- Redis 7+ (cache)

// Auth
- Clerk (recomendado) ou Supabase Auth
- JWT tokens
- Session management
```

**Schema Inicial (Prisma):**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  agents    Agent[]
  tasks     Task[]
  projects  Project[]
  createdAt DateTime @default(now())
}

model Agent {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  status      AgentStatus
  task        String
  model       String
  tokens      Int
  progress    Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
}

model Task {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String?
  status      TaskStatus
  priority    Priority
  dueDate     DateTime?
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  description String?
  tasks       Task[]
  createdAt   DateTime @default(now())
}

enum AgentStatus {
  ACTIVE
  QUEUED
  COMPLETED
  FAILED
  BLOCKED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  ARCHIVED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Endpoints Iniciais:**
```typescript
// Auth
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
GET    /api/auth/me

// Agents
GET    /api/agents
POST   /api/agents
GET    /api/agents/:id
PATCH  /api/agents/:id
DELETE /api/agents/:id
POST   /api/agents/:id/kill
POST   /api/agents/:id/pause
POST   /api/agents/:id/restart

// Tasks
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

// Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

**Deliverables:**
- ✅ Backend funcionando local (localhost:3001)
- ✅ PostgreSQL schema deployed
- ✅ Auth flow completo (login/logout/register)
- ✅ CRUD de agents, tasks, projects
- ✅ WebSocket server rodando

**Estimativa:** 10 dias

---

### 1.2 Integração OpenClaw Real

**Problema:** Mission Control mostra mock data, não conecta com OpenClaw.

**Solução:**
- [ ] OpenClaw API client no backend
- [ ] Webhook receivers para heartbeats
- [ ] WebSocket bridge (OpenClaw → Frontend)
- [ ] Agent spawn/pause/restart via API

**Fluxo:**
```
Frontend (Marco OS)
  ↓ spawn agent
Backend API
  ↓ POST /api/agents/spawn
OpenClaw Gateway
  ↓ sessions_spawn
Agent executa
  ↓ heartbeat webhook
Backend
  ↓ WebSocket broadcast
Frontend atualiza Mission Control
```

**OpenClaw Integration:**
```typescript
// backend/services/openclaw.ts
import axios from 'axios';

class OpenClawService {
  private baseURL = process.env.OPENCLAW_GATEWAY_URL;
  private token = process.env.OPENCLAW_TOKEN;

  async spawnAgent(task: string, model?: string) {
    const response = await axios.post(
      `${this.baseURL}/api/sessions/spawn`,
      { task, model, cleanup: 'keep' },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.data;
  }

  async getAgentStatus(sessionKey: string) {
    const response = await axios.get(
      `${this.baseURL}/api/sessions/${sessionKey}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.data;
  }

  async killAgent(sessionKey: string) {
    await axios.delete(
      `${this.baseURL}/api/sessions/${sessionKey}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }
}

export default new OpenClawService();
```

**Webhook Handler:**
```typescript
// backend/routes/webhooks.ts
router.post('/webhooks/openclaw/heartbeat', async (req, res) => {
  const { sessionKey, status, progress, tokens } = req.body;
  
  // Update DB
  await prisma.agent.update({
    where: { openclawSessionKey: sessionKey },
    data: { status, progress, tokens, updatedAt: new Date() }
  });

  // Broadcast via WebSocket
  io.emit('agent:update', { sessionKey, status, progress, tokens });

  res.json({ ok: true });
});
```

**Deliverables:**
- ✅ OpenClaw API client funcional
- ✅ Spawn agents via Marco OS
- ✅ Heartbeat webhooks recebidos
- ✅ Mission Control atualiza em real-time
- ✅ Kill/pause/restart funcionais

**Estimativa:** 5 dias

---

### 1.3 Frontend Data Layer

**Problema:** Frontend faz fetch manual, sem cache, sem optimistic UI.

**Solução:**
- [ ] React Query (TanStack Query) para data fetching
- [ ] Zustand para estado global
- [ ] Zod para validação de schemas

**Setup:**
```typescript
// lib/api-client.ts
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  }
});
```

**Hooks:**
```typescript
// hooks/useAgents.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@/lib/api-client';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/agents');
      return data;
    }
  });
}

export function useSpawnAgent() {
  return useMutation({
    mutationFn: async (task: string) => {
      const { data } = await apiClient.post('/agents', { task });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
    }
  });
}

export function useKillAgent() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries(['agents']);
      const previous = queryClient.getQueryData(['agents']);
      queryClient.setQueryData(['agents'], (old: any) =>
        old.filter((a: any) => a.id !== id)
      );
      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback
      queryClient.setQueryData(['agents'], context?.previous);
    }
  });
}
```

**Deliverables:**
- ✅ React Query configurado
- ✅ Hooks para agents, tasks, projects
- ✅ Optimistic UI funcionando
- ✅ Cache inteligente (stale-while-revalidate)

**Estimativa:** 3 dias

---

## 📈 FASE 2 — Core Features (4-5 semanas)

**Objetivo:** Adicionar funcionalidades essenciais que tornam o sistema poderoso.

### 2.1 Search Global (Cmd+K)

**Problema:** Não tem como buscar rapidamente em todo o sistema.

**Solução:**
- [ ] Command palette (cmdk)
- [ ] Busca universal (agents, tasks, projects, contatos)
- [ ] Comandos rápidos (criar task, spawnar agent, etc)

**Stack:**
```bash
npm install cmdk
```

**Implementação:**
```typescript
// components/CommandPalette.tsx
import { Command } from 'cmdk';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input placeholder="Buscar ou executar comando..." />
      <Command.List>
        <Command.Group heading="Agentes">
          <Command.Item onSelect={() => navigate('/agents')}>
            Ver todos agentes
          </Command.Item>
          <Command.Item onSelect={() => spawnAgentModal()}>
            Criar novo agente
          </Command.Item>
        </Command.Group>
        
        <Command.Group heading="Tarefas">
          {tasks.map(task => (
            <Command.Item key={task.id} onSelect={() => navigate(`/tasks/${task.id}`)}>
              {task.title}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Ações">
          <Command.Item onSelect={() => toggleTheme()}>
            Alternar tema
          </Command.Item>
          <Command.Item onSelect={() => logout()}>
            Sair
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

**Features:**
- Cmd+K (Mac) ou Ctrl+K (Windows/Linux)
- Busca fuzzy
- Navegação por teclado
- Comandos contextuais
- Histórico de comandos

**Deliverables:**
- ✅ Command palette funcional
- ✅ Busca em agents/tasks/projects
- ✅ Comandos rápidos (10+)
- ✅ Keyboard shortcuts

**Estimativa:** 4 dias

---

### 2.2 Dashboard com Gráficos

**Problema:** Dashboard atual é estático, não mostra insights.

**Solução:**
- [ ] Gráficos de produtividade (Chart.js ou Recharts)
- [ ] Resumo semanal/mensal
- [ ] Timeline de atividades
- [ ] Quick stats animados

**Stack:**
```bash
npm install recharts
# ou
npm install chart.js react-chartjs-2
```

**Widgets:**
```typescript
// components/Dashboard/ProductivityChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function ProductivityChart({ data }: { data: ProductivityData[] }) {
  return (
    <Card>
      <h3>Produtividade (últimos 7 dias)</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="tasks" stroke="#10b981" />
        <Line type="monotone" dataKey="hours" stroke="#3b82f6" />
      </LineChart>
    </Card>
  );
}

// components/Dashboard/WeeklySummary.tsx
export function WeeklySummary() {
  const stats = useWeeklyStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Tasks Concluídas"
        value={stats.tasksCompleted}
        change={stats.tasksCompletedChange}
        icon="✅"
      />
      <StatCard
        title="Agentes Executados"
        value={stats.agentsRun}
        change={stats.agentsRunChange}
        icon="🤖"
      />
      <StatCard
        title="Horas Trabalhadas"
        value={stats.hoursWorked}
        change={stats.hoursWorkedChange}
        icon="⏱️"
      />
      <StatCard
        title="Eficiência"
        value={`${stats.efficiency}%`}
        change={stats.efficiencyChange}
        icon="📊"
      />
    </div>
  );
}
```

**Gráficos a implementar:**
1. **Produtividade** (line chart) — tasks/dia, horas/dia
2. **Agent Performance** (bar chart) — uptime, success rate
3. **Task Distribution** (pie chart) — por status, por projeto
4. **Weekly Heatmap** — atividade por dia da semana
5. **Time Tracking** (stacked bar) — tempo por projeto

**Deliverables:**
- ✅ 5 gráficos funcionais
- ✅ Weekly summary cards
- ✅ Timeline de atividades recentes
- ✅ Animações suaves (Framer Motion)

**Estimativa:** 6 dias

---

### 2.3 Sistema de Notificações

**Problema:** Não há feedback quando agents terminam ou erros acontecem.

**Solução:**
- [ ] Toast notifications (Sonner)
- [ ] Centro de notificações (inbox style)
- [ ] Priorização por urgência
- [ ] Snooze e dismiss

**Stack:**
```bash
npm install sonner
```

**Implementação:**
```typescript
// lib/notifications.ts
import { toast } from 'sonner';

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, { description, duration: 5000 });
  },
  
  agentCompleted: (agentName: string) => {
    toast.success('Agente concluído', {
      description: `${agentName} finalizou com sucesso`,
      action: {
        label: 'Ver Log',
        onClick: () => navigate(`/agents/${agentName}/log`)
      }
    });
  },
  
  agentFailed: (agentName: string, error: string) => {
    toast.error('Agente falhou', {
      description: `${agentName}: ${error}`,
      action: {
        label: 'Ver Detalhes',
        onClick: () => navigate(`/agents/${agentName}`)
      }
    });
  }
};
```

**Centro de Notificações:**
```typescript
// components/NotificationCenter.tsx
export function NotificationCenter() {
  const notifications = useNotifications();

  return (
    <Popover>
      <PopoverTrigger>
        <Badge count={notifications.unread}>
          <Icon name="notifications" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-80 max-h-96 overflow-auto">
          {notifications.items.map(notif => (
            <NotificationItem key={notif.id} {...notif} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Tipos de Notificações:**
- Agent completed/failed
- Task due soon
- New message
- System updates
- Integration alerts

**Deliverables:**
- ✅ Toast notifications funcionando
- ✅ Centro de notificações
- ✅ Badge count
- ✅ Snooze/dismiss
- ✅ Sound toggle

**Estimativa:** 4 dias

---

### 2.4 Mobile PWA

**Problema:** Não funciona bem em mobile, não pode instalar como app.

**Solução:**
- [ ] Progressive Web App setup
- [ ] Service Worker para offline
- [ ] Manifest.json
- [ ] Push notifications

**Setup:**
```json
// public/manifest.json
{
  "name": "Marco OS",
  "short_name": "MarcoOS",
  "description": "Central de Comando Pessoal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker:**
```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('marco-os-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/assets/index.js',
        '/assets/index.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Push Notifications:**
```typescript
// lib/push.ts
export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
    });
  }
}
```

**Deliverables:**
- ✅ PWA instalável (Add to Home Screen)
- ✅ Funciona offline
- ✅ Service Worker configurado
- ✅ Push notifications (opcional)
- ✅ Splash screen

**Estimativa:** 3 dias

---

## 🚀 FASE 3 — Expansão (5-6 semanas)

**Objetivo:** Melhorar seções existentes e adicionar integrações.

### 3.1 Finanças Upgrade

**Features:**
- [ ] Open Banking integration
- [ ] Gráficos de gastos por categoria
- [ ] Metas financeiras e tracking
- [ ] Alertas de despesas
- [ ] Import de extratos (CSV/OFX)

**Estimativa:** 7 dias

---

### 3.2 Saúde Upgrade

**Features:**
- [ ] Apple Health / Google Fit integration
- [ ] Tracking de treinos e peso
- [ ] Gráficos de evolução
- [ ] Lembretes de hidratação/medicamentos

**Estimativa:** 5 dias

---

### 3.3 Learning Upgrade

**Features:**
- [ ] Sistema de flashcards (Anki-style)
- [ ] Progress tracking por tópico
- [ ] Integração com Notion/Obsidian
- [ ] Pomodoro timer integrado

**Estimativa:** 6 dias

---

### 3.4 Planner Upgrade

**Features:**
- [ ] Calendar view (não só lista)
- [ ] Drag & drop de tarefas
- [ ] Recorrência de tasks
- [ ] Time blocking visual

**Estimativa:** 6 dias

---

### 3.5 Analytics Dashboard

**Features:**
- [ ] Produtividade (tasks/dia, tempo por projeto)
- [ ] Tempo (onde você gasta suas horas)
- [ ] Agentes (performance, uptime)
- [ ] Goals (progresso de metas)

**Visualizações:**
- Heatmaps de produtividade
- Tendências ao longo do tempo
- Comparativos semana/mês
- Predictions baseadas em histórico

**Estimativa:** 8 dias

---

## 🧠 FASE 4 — Inteligência (ongoing)

**Objetivo:** IA para automação e insights.

### 4.1 Auto-categorização

**Features:**
- [ ] Tasks auto-categorizadas por IA
- [ ] Emails auto-triaged
- [ ] Priorização inteligente

**Estimativa:** 5 dias

---

### 4.2 Insights & Predictions

**Features:**
- [ ] "Você está 30% mais produtivo essa semana"
- [ ] "Padrão detectado: você faz mais tasks de manhã"
- [ ] "Sugestão: agendar reunião X antes de task Y"

**Estimativa:** 6 dias

---

### 4.3 Geração de Conteúdo

**Features:**
- [ ] Draft de emails
- [ ] Resumos de reuniões
- [ ] Sugestões de próximos passos

**Estimativa:** 4 dias

---

## 🔗 FASE 5 — Integrações (3-4 semanas)

**Objetivo:** Conectar com ferramentas externas.

### Integrações Prioritárias

**Alta:**
- ✅ Gmail (já tem bridge)
- ✅ Google Calendar (já tem bridge)
- ✅ GitHub (já tem bridge)
- [ ] Notion API
- [ ] Spotify API
- [ ] Telegram Bot

**Média:**
- [ ] Todoist/Things (import tasks)
- [ ] Linear/Jira (projetos)
- [ ] Slack (notificações)

**Estimativa:** 2 dias por integração

---

## 💡 FEATURES CRIATIVAS (Backlog)

**Gamificação:**
- XP system
- Achievements
- Streaks
- Leaderboards (se multiplayer)

**Focus Mode:**
- Bloqueia distrações
- Mostra só 1 task
- Timer integrado

**Daily Brief:**
- Resumo matinal gerado por IA
- Agenda do dia
- Prioridades

**Screenshots Auto:**
- Captura tela a cada X minutos
- Memory timeline
- Busca visual

**Voice Commands:**
- "Hey Marco, add task..."
- Dictation para tasks
- Voice notes

---

## 📋 Priorização (Next Actions)

**TOP 5 IMEDIATAS:**

1. **Backend + Persistência** (10 dias)
   - Crítico: sem isso, nada funciona de verdade
   
2. **OpenClaw Integration** (5 dias)
   - Tornar Mission Control funcional
   
3. **Search Global (Cmd+K)** (4 dias)
   - Melhora drasticamente UX
   
4. **Dashboard com Gráficos** (6 dias)
   - Torna sistema visualmente interessante
   
5. **Notificações** (4 dias)
   - Feedback essencial pra agents

---

## 🎯 Métricas de Sucesso

**Fase 1:**
- ✅ Dados persistem após refresh
- ✅ Agents reais sendo spawnados
- ✅ WebSocket funcionando (latência <100ms)

**Fase 2:**
- ✅ Search global usado 10+ vezes/dia
- ✅ Dashboard carrega em <2s
- ✅ Notificações chegam em <5s

**Fase 3:**
- ✅ 5+ integrações ativas
- ✅ PWA instalado em mobile
- ✅ Offline mode funcional

**Fase 4:**
- ✅ IA categoriza 80%+ das tasks corretamente
- ✅ Insights úteis gerados diariamente

---

## 🛠️ Stack Técnico Final

**Frontend:**
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- React Query (TanStack Query)
- Zustand (state)
- Zod (validation)
- Framer Motion (animations)
- cmdk (command palette)
- Recharts (gráficos)
- Sonner (toast)

**Backend:**
- Node.js 20+
- Express 4.x ou Fastify 4.x
- PostgreSQL 15+
- Prisma ORM
- Redis 7+
- Socket.io

**Infra:**
- Railway / Render (backend)
- Vercel / Netlify (frontend)
- Supabase (alternativa all-in-one)
- GitHub Actions (CI/CD)

**Integrações:**
- OpenClaw API
- Notion API
- Spotify API
- Telegram Bot API
- Google APIs (Gmail, Calendar, Fit)

---

## 📝 Notas

- Música/Produção foi deixada de fora por enquanto (pode entrar na Fase 3)
- Features criativas (gamificação, voice) no backlog
- Priorizar features que Marco usa diariamente
- Manter simplicidade: não over-engineer

---

**Última atualização:** 16/02/2026 22:04 BRT  
**Autor:** Frank  
**Status:** Draft → Review com Marco
