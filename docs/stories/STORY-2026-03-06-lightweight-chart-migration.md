# STORY-2026-03-06-lightweight-chart-migration

## Context
- `recharts` ainda dominava o custo do bundle compartilhado.
- O app precisava de leitura visual leve, não de uma stack completa de charts.

## Scope
- Substituir gráficos mais caros por SVG/components leves.
- Remover dependência do shell/build de `recharts` nas telas ativas.

## Checklist
- [x] Mapear usos ativos de `recharts`
- [x] Criar componentes SVG leves reutilizáveis
- [x] Migrar `FinanceOverview`
- [x] Migrar `HealthTrendsPanel`
- [x] Migrar `GamificationBar`
- [x] Migrar `FinancePatrimonio`
- [x] Rodar `npm run lint`
- [x] Rodar `npm run typecheck`
- [x] Rodar `npm test`
- [x] Rodar `npm run build`
- [x] Registrar impacto no bundle

## Build Impact
- `vendor-charts` foi eliminado do build ativo
- Novo chunk compartilhado: `LightweightCharts` em `~9.1 kB` (`~2.3 kB` gzip)
- `GamificationBar` caiu para `~18.7 kB`
- `HealthTrendsPanel` caiu para `~27.5 kB`
- `FinanceOverview` caiu para `~35.9 kB`

## File List
- [components/ui/LightweightCharts.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/ui/LightweightCharts.tsx)
- [components/finance/FinanceOverview.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/finance/FinanceOverview.tsx)
- [components/health/HealthTrendsPanel.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/health/HealthTrendsPanel.tsx)
- [components/dashboard/GamificationBar.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/dashboard/GamificationBar.tsx)
- [components/finance/FinancePatrimonio.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/components/finance/FinancePatrimonio.tsx)
- [vite.config.ts](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/vite.config.ts)
