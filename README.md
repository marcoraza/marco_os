<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Marco OS

Sistema operacional pessoal em React/Vite para operacao diaria, planejamento, memoria, agentes, financas, saude e relacionamento.

## Estado Atual

O projeto hoje esta em um ponto de produto pessoal funcional:
- shell modularizado e mais leve
- quality gates reais
- quick capture integrado ao estado da app
- planner conectado a execucao
- notes com busca, favoritos e links
- CRM com follow-up e inteligencia relacional basica
- agents com mission control, templates, dispatch recente e fila de delegacao
- dashboard com briefing executivo local

Arquiteturalmente, a base esta em modo `local-first`, com persistencia local via IndexedDB e integracoes oportunistas via providers de dados, Supabase e OpenClaw.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and preencha:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - bridges locais apenas se realmente for usar
3. Run the app:
   `npm run dev`

## Quality Checks

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`

## Docs

- PRD principal: [docs/marco-os-prd-v2.md](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/docs/marco-os-prd-v2.md)
- PRD historico: [docs/marco-os-prd-v1.md](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/docs/marco-os-prd-v1.md)
- Roadmap operacional: [docs/roadmap-operacional.md](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/docs/roadmap-operacional.md)
- Stories: `docs/stories/`

## Notes

- Este frontend nao deve receber segredos injetados no bundle em tempo de build.
- Integracoes sensiveis devem passar por backend/bridge/CLI dedicado.
- O cliente Supabase nao usa mais fallback hardcoded no codigo-fonte; configure via `.env`.
- O roadmap de evolucao agora parte do estado atual do produto, nao mais do prototipo inicial.
