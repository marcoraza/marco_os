# Marco OS — PRD Atualizado

**Data:** 06/03/2026  
**Autor:** Marco + Codex  
**Status:** Documento vivo  
**Documento principal:** este arquivo  
**Histórico:** `docs/marco-os-prd-v1.md`

---

## 1. Resumo

### O que é
Marco OS é um sistema operacional pessoal em formato de SPA para centralizar operação diária, planejamento, memória, agentes, finanças, saúde e relacionamento em uma única superfície.

### Posição atual
O produto já saiu do estágio de protótipo frágil. Hoje ele opera como um sistema pessoal funcional, com qualidade mínima estável, shell mais leve, arquitetura modularizada e fluxos principais utilizáveis no dia a dia.

### Objetivo do produto
Dar ao Marco um cockpit único para:
- decidir o que exige ação hoje
- transformar plano em execução
- operar agentes como extensões de trabalho
- manter memória pessoal e relacional útil
- acompanhar finanças, saúde e projetos sem espalhar contexto

---

## 2. Usuário e Contexto

### Usuário principal
- Marco
- uso pessoal e operacional
- single-user
- foco em produtividade real, não em colaboração multiusuário neste momento

### Contexto de uso
- desktop primeiro, mobile funcional
- uso recorrente ao longo do dia
- sistema precisa ser rápido de abrir, fácil de navegar e seguro para evoluir sem quebrar

### Regra de produto atual
Sem overengineering para multi-tenant, auth complexa ou hardening pesado de SaaS enquanto o produto continuar pessoal.

---

## 3. Problema que o produto resolve

Antes do Marco OS, o contexto operacional ficava fragmentado entre notas, tarefas, Notion, dados pessoais, agentes e dashboards isolados.

O produto resolve cinco problemas principais:
- fragmentação de contexto
- distância entre planejar e executar
- pouca memória operacional dos agentes
- baixa visibilidade do que pede ação hoje
- dificuldade de manter consistência estrutural enquanto o sistema cresce

---

## 4. Princípios do Produto

- `CLI first -> observability second -> UI third`
- produto pessoal antes de produto SaaS
- fluxo real antes de feature cosmética
- fallback e continuidade antes de integrações pesadas
- architecture that can evolve without monolith regression

---

## 5. Estado Atual Entregue

### Fundação técnica
- React 19 + TypeScript + Vite + Tailwind
- quality gates reais:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- testes pragmáticos cobrindo helpers, contratos e fluxos centrais
- stories em `docs/stories/` registrando evolução real

### Arquitetura
- app shell decomposto e mais leve
- `OpenClawContext` modularizado internamente por domínio
- providers e partes pesadas com escopo melhor
- contratos de dados mais limpos
- IndexedDB como persistência local principal do app
- providers de dados convivendo com:
  - JSON/Notion-style data
  - Supabase context
  - bridge/OpenClaw para operação de agentes

### Performance
- code splitting por feature
- shell splitting
- remoção de `recharts`
- charts leves em SVG/componentes próprios
- bundle inicial fortemente reduzido em relação ao início do trabalho

### Produto funcional já entregue
- quick capture integrado ao estado real da aplicação
- planner com vínculo real entre plano e tarefas
- notes com busca, favoritos, tags derivadas e links entre notas
- CRM com fila de follow-up, timeline e inteligência relacional básica
- agents com mission control, templates, dispatch recente, detalhe operacional e fila de delegação
- finance com visão diária mais acionável
- health com check-in persistido, streak e leitura semanal
- dashboard com briefing executivo e sinais de ação do dia

---

## 6. Arquitetura Atual

### Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- Persistência local: IndexedDB via `idb`
- Dados externos: Supabase client + datasets Notion-style + bridge API + OpenClaw
- Testes: `node --test` com `tsx`
- Lint: ESLint flat config

### Camadas atuais de dados
- `App state local`: tarefas, notas, eventos, planos, contatos e outras entidades persistidas localmente
- `NotionDataContext`: datasets de leitura para áreas do produto que operam sobre dados de pesquisa/knowledge/content
- `SupabaseDataContext`: provider adicional para dados configurados nesse fluxo
- `OpenClaw`: operação de agentes, runs, kanban, memória, dispatch e status operacional

### Regra arquitetural prática
O produto hoje é local-first com integrações oportunistas, não cloud-first obrigatório.

### Qualidade estrutural já conquistada
- tipagem corrigida
- duplicação estrutural removida
- shell menos acoplado
- contexts grandes quebrados em módulos internos
- contratos e mappers menos espalhados em componentes

---

## 7. Superfícies do Produto

### 7.1 Dashboard
Função: cockpit diário.

Capacidades atuais:
- mission control bar
- briefing executivo local
- kanban operacional
- widgets de saúde e atividade
- agenda lateral
- quick actions
- quick capture de tarefa
- project switcher

Objetivo da superfície:
Responder rapidamente: o que importa hoje?

### 7.2 Agents
Função: operação de agentes como força de execução.

Capacidades atuais:
- mission control
- templates de missão
- dispatch manual
- histórico recente de dispatch
- fila de delegação
- detalhe por agente com resumo operacional
- execuções, cron jobs, memória, config, dados, chat, revisão, auditoria, pipelines e webhooks

Objetivo da superfície:
Transformar agentes em operadores utilizáveis, não só observáveis.

### 7.3 Planner
Função: ponte entre intenção e execução.

Capacidades atuais:
- geração e armazenamento de planos
- retomada do último plano
- rascunho persistido
- export para tarefas reais
- reconciliação entre plano e execução
- milestones simples derivados

Objetivo da superfície:
Reduzir o gap entre pensar o trabalho e colocá-lo em movimento.

### 7.4 Notes
Função: second brain operacional.

Capacidades atuais:
- editor e lista
- busca local
- favoritos
- filtros por recentes/favoritas
- tags derivadas de conteúdo
- wiki-links e backlinks
- notas relacionadas

Objetivo da superfície:
Melhorar captura, recuperação e navegação de contexto.

### 7.5 CRM
Função: memória de relação e follow-up.

Capacidades atuais:
- contatos persistidos localmente
- segmentação relacional
- score de relação
- próximo passo sugerido
- fila de follow-up
- timeline de interação
- formulário de reunião

Objetivo da superfície:
Fazer a rede funcionar como radar operacional, não como cadastro passivo.

### 7.6 Finance
Função: cockpit financeiro diário.

Capacidades atuais:
- abas de visão geral, transações, débitos, cashflow, investimentos e cripto
- quick actions contextuais
- memória da última aba
- fechamento mensal derivado
- próximos vencimentos

Objetivo da superfície:
Ajudar decisão e atenção financeira do dia.

### 7.7 Health
Função: rotina pessoal e leitura de consistência.

Capacidades atuais:
- check-in diário persistido
- tendências
- streak de check-ins
- resumo semanal
- dica acionável básica

Objetivo da superfície:
Tornar saúde parte da operação pessoal, não um painel decorativo.

### 7.8 Learning
Função: consolidar aprendizado e decisões.

Capacidades atuais:
- revisão semanal orientada por dados
- decision journal integrado
- tópicos dominantes
- cards de conhecimento e recursos

Objetivo da superfície:
Fechar o loop entre aprender, decidir e reusar contexto.

### 7.9 Projects
Função: torre de controle por projeto.

Capacidades atuais:
- resumo operacional do projeto ativo
- contagem de abertas, críticas, concluídas, notas e agenda
- contexto do projeto ativo influencia navegação e filtros relevantes

Objetivo da superfície:
Fazer projeto ativo virar unidade real de decisão.

---

## 8. Design e UX

### Direção visual atual
- dark-first
- baixa ornamentação
- densidade informacional alta, mas controlada
- badges, labels e métricas como linguagem principal de leitura

### Regras mantidas
- `rounded-sm` como padrão
- Material Symbols via componente `Icon`
- uso consistente de badges/status dots/section labels
- sem redesign gratuito em cima da base já estabilizada

### Critério de UX
Cada tela deve responder a uma pergunta operacional clara. Quando a tela não responde isso, ela precisa ser simplificada ou reposicionada.

---

## 9. Non-Goals Atuais

Não são prioridade agora:
- multi-user real
- permissões complexas
- billing
- onboarding de produto SaaS
- automações enterprise
- segurança pesada além do razoável para uso pessoal
- migração completa obrigatória para backend antes de gerar valor de produto

---

## 10. Roadmap Atual

### Fase 1 — consolidar produto pessoal operacional
Status: em andamento avançado.

Foco:
- fechar ciclos semanais e diários
- tornar agents e planner ainda mais úteis
- aumentar valor de decisão por dashboard, CRM, finance e health

### Fase 2 — features inéditas de alto valor
Próximos blocos recomendados:

1. `Weekly Review Engine 2.0`
- salvar reviews semanais navegáveis
- gerar highlights, pendências e foco da próxima semana
- consolidar aprendizado, tarefas, saúde e finanças

2. `Agent Operations 3.0`
- histórico operacional por agente mais profundo
- capacidade/carga por agente
- padrões reutilizáveis de missão e execução

3. `Planner Execution 3.0`
- edição bidirecional plano ↔ tarefas
- reconciliação mais rica
- execução incremental por blocos

4. `Personal Executive Briefing 2.0`
- briefing diário consolidado no dashboard
- foco do dia cruzando tasks, finance, health, CRM e agents
- versão curta e versão detalhada

5. `Relationship Intelligence 2.0`
- follow-up assistido
- agrupamento melhor por contexto
- histórico relacional mais útil

### Fase 3 — preparação para template futuro
Só depois do produto pessoal estar maduro.

Foco futuro:
- onboarding guiado
- perfis/configuração inicial
- setup reproduzível
- abstração gradual do que hoje é muito pessoal

---

## 11. Métricas de Sucesso

### Produto
- abrir o sistema e identificar rapidamente o foco do dia
- transformar um plano em tarefas sem retrabalho manual excessivo
- operar agentes com menos atrito entre visão e ação
- reencontrar informação útil em notes e CRM com pouca fricção

### Engenharia
- `main` permanece verde
- novas features entram sem monolito voltar a crescer sem controle
- contexts e providers seguem moduláveis
- regressões principais são detectadas pelos gates atuais

### Uso pessoal
- o sistema reduz troca de contexto real
- o produto vira ponto de entrada da operação diária
- menos informação fica perdida fora do Marco OS

---

## 12. Decisões de Produto Já Tomadas

- o produto continua pessoal-first
- qualidade mínima é obrigatória
- stories continuam sendo a unidade de evolução
- arquitetura deve favorecer continuidade, não recomeço
- integrações são bem-vindas quando aumentam valor real, não apenas complexidade

---

## 13. Referências Internas

- PRD histórico: `docs/marco-os-prd-v1.md`
- stories de evolução: `docs/stories/`
- constitution: `.aios-core/constitution.md`
- setup técnico: `README.md`
