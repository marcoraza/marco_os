# Marco OS Design System Inventory

> Referencia completa do design system. Fonte de verdade para implementacao de componentes.
> Atualizado: 2026-03-27 | Versao: 1.0

---

## Indice

1. [CSS Custom Properties (Tokens)](#1-css-custom-properties-tokens)
2. [Tailwind Config Map](#2-tailwind-config-map)
3. [Tipografia](#3-tipografia)
4. [Component Library (42 primitivos)](#4-component-library)
5. [Chart System](#5-chart-system)
6. [Patterns Compostos](#6-patterns-compostos)
7. [Status Tokens](#7-status-tokens)
8. [Divergencias CLAUDE.md vs Codigo](#8-divergencias-claudemd-vs-codigo)

---

## 1. CSS Custom Properties (Tokens)

**Arquivo fonte:** `index.css` linhas 9-89

### 1.1 Dark Theme (default)

Declarado em `:root, [data-theme="dark"]`.

| Token | CSS Variable | Hex / Valor | Uso |
|-------|-------------|-------------|-----|
| bg-base | `--color-bg-base` | `#0D0D0F` | Fundo mais profundo (body) |
| header-bg | `--color-bg-header` | `#121212` | Header da app, cards de secao |
| surface | `--color-bg-surface` | `#1C1C1C` | Cards, paineis, containers |
| surface-hover | `--color-bg-surface-hover` | `#252525` | Hover state de cards |
| border-panel | `--color-border-panel` | `#2A2A2A` | Todas as bordas padrao |
| border-card | `--color-border-card` | `#2A2A2A` | Bordas de card (identico a border-panel no dark) |
| text-primary | `--color-text-primary` | `#E1E1E1` | Texto principal, titulos |
| text-secondary | `--color-text-secondary` | `#8E8E93` | Labels, metadata, texto auxiliar |
| brand-mint | `--color-brand-mint` | `#00FF95` | Sucesso, CTAs primarios, estado ativo |
| brand-flame | `--color-brand-flame` | `#FF5500` | Streak, accent especial (uso restrito) |
| accent-blue | `--color-accent-blue` | `#0A84FF` | Informacional, links, badges neutros |
| accent-blue-dim | `--color-accent-blue-dim` | `#406B94` | Blue muted para contraste baixo |
| accent-red | `--color-accent-red` | `#FF453A` | Erros, falhas, acoes destructivas |
| accent-orange | `--color-accent-orange` | `#FF9F0A` | Warnings, saude, atencao necessaria |
| accent-purple | `--color-accent-purple` | `#BF5AF2` | XP, level, destaques especiais |
| overlay | `--color-overlay` | `rgba(0, 0, 0, 0.6)` | Backdrop de modais |
| glass-bg | `--color-glass-bg` | `rgba(28, 28, 28, 0.7)` | Paineis com glass effect |
| glass-border | `--color-glass-border` | `rgba(255, 255, 255, 0.05)` | Bordas de paineis glass |
| grid-line | `--color-grid-line` | `rgba(255, 255, 255, 0.03)` | Linhas de grid em charts |
| shadow | `--color-shadow` | `rgba(0, 0, 0, 0.5)` | Sombra base |
| shadow-sm | `--color-shadow-sm` | `rgba(0, 0, 0, 0.3)` | Sombra leve |
| card-shadow | `--color-card-shadow` | `0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)` | Sombra layered para cards interativos |
| switch-knob | `--color-switch-knob` | `#FFFFFF` | Knob do toggle switch |

### 1.2 Light Theme

Declarado em `[data-theme="light"]`. Paleta warm stone com depth layered.

| Token | Hex (Light) | Notas |
|-------|-------------|-------|
| bg-base | `#E8E6E1` | Warm stone, nunca branco puro |
| header-bg | `#F0EEE9` | Mais claro que base |
| surface | `#F5F3EF` | Cards sobem mais claras |
| surface-hover | `#E2DFDA` | Hover desce levemente |
| border-panel | `#CDC9C1` | Bordas visiveis e quentes |
| border-card | `#D5D1CA` | Diferente de border-panel no light |
| text-primary | `#1C1917` | Texto escuro, bom contraste |
| text-secondary | `#78716C` | Metadata em tom terroso |
| brand-mint | `#059669` | Verde saturado para fundo claro |
| brand-flame | `#DC4A14` | Flame ajustado pro light |
| accent-blue | `#1D4ED8` | Azul profundo |
| accent-blue-dim | `#2563EB` | Dim mais vibrante no light |
| accent-red | `#B91C1C` | Vermelho menos neon |
| accent-orange | `#B45309` | Laranja terroso |
| accent-purple | `#6D28D9` | Roxo saturado |
| overlay | `rgba(0, 0, 0, 0.35)` | Overlay mais leve |
| glass-bg | `rgba(245, 243, 239, 0.9)` | Glass com base clara |
| glass-border | `rgba(0, 0, 0, 0.08)` | Borda sutil escura |
| grid-line | `rgba(0, 0, 0, 0.05)` | Grid lines sutis |
| card-shadow | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)` | Sombra delicada |

### 1.3 Spacing Tokens

| Token | Variavel CSS | Valor | Uso |
|-------|-------------|-------|-----|
| radius-sm | `--radius-sm` | `2px` | Cards, containers base |
| radius-md | `--radius-md` | `4px` | Agent cards, inputs |
| radius-lg | `--radius-lg` | `6px` | Containers maiores |
| radius-xl | `--radius-xl` | `12px` | Elementos especiais |
| radius-full | `--radius-full` | `9999px` | StatusDot, avatares, toggles |

### 1.4 Safe Area Tokens

Para PWA e dispositivos com notch.

```css
--safe-area-top: env(safe-area-inset-top, 0px);
--safe-area-bottom: env(safe-area-inset-bottom, 0px);
--safe-area-left: env(safe-area-inset-left, 0px);
--safe-area-right: env(safe-area-inset-right, 0px);
```

---

## 2. Tailwind Config Map

**Arquivo fonte:** `tailwind.config.js`

### 2.1 Color Mapping

| Classe Tailwind | Variavel CSS | Exemplo de uso |
|-----------------|-------------|----------------|
| `bg-bg-base` | `var(--color-bg-base)` | `className="bg-bg-base"` |
| `bg-header-bg` | `var(--color-bg-header)` | `className="bg-header-bg"` |
| `bg-surface` | `var(--color-bg-surface)` | `className="bg-surface"` |
| `bg-surface-hover` | `var(--color-bg-surface-hover)` | `className="bg-surface-hover"` |
| `border-panel` | `var(--color-border-panel)` | `className="border-border-panel"` |
| `border-card` | `var(--color-border-card)` | `className="border-border-card"` |
| `text-primary` | `var(--color-text-primary)` | `className="text-text-primary"` |
| `text-secondary` | `var(--color-text-secondary)` | `className="text-text-secondary"` |
| `brand-mint` | `var(--color-brand-mint)` | `className="text-brand-mint"` |
| `brand-flame` | `var(--color-brand-flame)` | `className="text-brand-flame"` |
| `accent-blue` | `var(--color-accent-blue)` | `className="text-accent-blue"` |
| `accent-blue-dim` | `var(--color-accent-blue-dim)` | `className="text-accent-blue-dim"` |
| `accent-red` | `var(--color-accent-red)` | `className="text-accent-red"` |
| `accent-orange` | `var(--color-accent-orange)` | `className="text-accent-orange"` |
| `accent-purple` | `var(--color-accent-purple)` | `className="text-accent-purple"` |
| `accent-green` | `var(--color-brand-mint)` | **Alias** de brand-mint (nao documentado no CLAUDE.md) |

### 2.2 Configuracao Especial

| Config | Valor | Motivo |
|--------|-------|--------|
| `borderColor.DEFAULT` | `var(--color-border-panel)` | Override do Tailwind preflight que injeta `#e5e7eb` em `*` |
| `darkMode` | `['class', '[data-theme="dark"]']` | Theme switching via data attribute |
| `fontFamily.sans` | `['Inter', 'sans-serif']` | Fonte unica do projeto |
| `@tailwindcss/forms` | `strategy: 'class'` | Evita ~6KB de CSS global em form elements |
| `@tailwindcss/container-queries` | Plugin habilitado | Container queries para layout responsivo |

### 2.3 Content Scanning

```js
content: [
  './index.html',
  './components/**/*.{ts,tsx}',
  './contexts/**/*.{ts,tsx}',
  './data/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
  './*.{ts,tsx}',
]
```

---

## 3. Tipografia

**Fonte:** Inter (weights 300-900)
**Icons:** Material Symbols Outlined via Google Fonts CDN

```css
font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
```

### 3.1 Escala Tipografica (12 niveis)

| Nivel | Uso | Classes Tailwind | Componente fonte |
|-------|-----|-----------------|------------------|
| 1 | Hero number | `text-4xl font-black font-mono` | Health streak display |
| 2 | XP display | `text-xl font-black font-mono` | GamificationBar streak |
| 3 | Completion stat | `text-lg font-mono font-bold text-text-primary` | JourneyCompletionScreen |
| 4 | Card title | `text-xs font-bold text-text-primary` | Cards universais, NotionCard |
| 5 | Tab item | `text-[10px] font-black uppercase tracking-widest border-b-2` | TabNav.tsx |
| 6 | Nav item | `text-[10px] font-bold uppercase tracking-wide` | AppSidebar |
| 7 | Chart header | `text-xs font-bold text-text-secondary uppercase tracking-wider font-mono` | HealthTrendsPanel |
| 8 | Section label | `text-[9px] font-black uppercase tracking-[0.12em] text-text-secondary` | SectionLabel.tsx |
| 9 | Form label | `text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]` | FormInput, FormSelect, FormToggle |
| 10 | Metric label | `text-[8px] text-text-secondary uppercase tracking-widest` | MetricBar |
| 11 | Body text | `text-xs text-text-primary` ou `text-xs text-text-secondary` | Universal |
| 12 | Micro label | `text-[7px] font-bold uppercase tracking-widest text-text-secondary` | HeatmapGrid, SourceBadge, PipelineBadge |

### 3.2 Regras Tipograficas

- `font-mono` obrigatorio para: numeros, timestamps, IDs, scores, contadores, valores financeiros
- Nenhum `text-lg` ou maior dentro de conteudo de secao (exceto hero numbers)
- Todo texto de UI em **PT-BR**; nomes de variavel, comentarios e codigo em **English**
- Badge text sempre `font-black uppercase tracking-wider`

---

## 4. Component Library

42 primitivos em `components/ui/`. Cada componente documentado com interface, pattern visual e uso.

### 4.1 Core Display

#### Icon

**Arquivo:** `components/ui/Icon.tsx`
**Props:** `name: string, size?: 'xs' | 'sm' | 'md' | 'lg', className?: string`
**Extends:** `React.HTMLAttributes<HTMLSpanElement>`

| Size | Classe CSS | Pixels |
|------|-----------|--------|
| xs | `text-xs` | 12px |
| sm | `text-sm` | 14px |
| md (default) | `text-base` | 16px |
| lg | `text-lg` | 18px |

```tsx
<Icon name="check_circle" size="sm" className="text-brand-mint" />
```

Base: `material-symbols-outlined select-none` + size class.

---

#### StatusDot

**Arquivo:** `components/ui/StatusDot.tsx`
**Props:** `color?: 'mint' | 'red' | 'orange' | 'blue' | 'purple', pulse?: boolean, glow?: boolean, size?: 'sm' | 'md'`
**Extends:** `React.HTMLAttributes<HTMLSpanElement>`

| Size | Dimensoes |
|------|----------|
| sm (default) | `w-1.5 h-1.5` |
| md | `w-2 h-2` |

Base: `rounded-full inline-block` + color.

Glow via box-shadow:
```
mint:   shadow-[0_0_8px_rgba(0,255,149,0.5)]
red:    shadow-[0_0_8px_rgba(255,69,58,0.5)]
orange: shadow-[0_0_8px_rgba(255,159,10,0.5)]
blue:   shadow-[0_0_8px_rgba(10,132,255,0.5)]
purple: shadow-[0_0_8px_rgba(191,90,242,0.5)]
```

```tsx
<StatusDot color="mint" glow pulse />
```

---

#### SectionLabel

**Arquivo:** `components/ui/SectionLabel.tsx`
**Props:** `children: ReactNode, icon?: string, className?: string`
**Extends:** `React.HTMLAttributes<HTMLHeadingElement>`

Pattern: `text-[9px] font-black uppercase tracking-[0.12em] text-text-secondary flex items-center gap-2`

Quando `icon` presente, renderiza `<span className="material-symbols-outlined text-sm">{icon}</span>`.

```tsx
<SectionLabel icon="fitness_center">ATIVIDADES</SectionLabel>
```

---

#### Badge

**Arquivo:** `components/ui/Badge.tsx`
**Props:** `children: ReactNode, variant?: 'mint' | 'red' | 'orange' | 'blue' | 'purple' | 'neutral', size?: 'xs' | 'sm' | 'md', className?: string`

Base: `font-black uppercase tracking-wider border rounded-sm inline-flex items-center gap-1 select-none`

| Variant | Classes |
|---------|---------|
| mint | `bg-brand-mint/10 text-brand-mint border-brand-mint/20` |
| red | `bg-accent-red/10 text-accent-red border-accent-red/20` |
| orange | `bg-accent-orange/10 text-accent-orange border-accent-orange/20` |
| blue | `bg-accent-blue/10 text-accent-blue border-accent-blue/20` |
| purple | `bg-accent-purple/10 text-accent-purple border-accent-purple/20` |
| neutral (default) | `bg-surface text-text-secondary border-border-panel` |

| Size | Classes |
|------|---------|
| xs | `text-[7px] px-1 py-px` |
| sm (default) | `text-[8px] px-1.5 py-0.5` |
| md | `text-[9px] px-2 py-0.5` |

```tsx
<Badge variant="mint" size="md">ATIVO</Badge>
```

---

### 4.2 Layout & Containers

#### Card

**Arquivo:** `components/ui/Card.tsx`
**Props:** `children: ReactNode, hover?: boolean, interactive?: boolean, className?: string`
**Extends:** `React.HTMLAttributes<HTMLDivElement>`

Base: `bg-surface border border-border-card rounded-md transition-colors`

| Prop | Classe adicionada |
|------|------------------|
| hover | `hover:border-text-secondary/40` |
| interactive | `cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-transform` |

```tsx
<Card hover interactive className="p-4">
  <span className="text-xs font-bold">Titulo</span>
</Card>
```

> **Nota:** Card.tsx usa `rounded-md`, nao `rounded-sm` como CLAUDE.md especifica. Ver secao 8.

---

#### NotionCard

**Arquivo:** `components/ui/NotionCard.tsx`
**Props:** `title: string, meta?: ReactNode, actions?: ReactNode, source?: 'notion' | 'local', href?: string, children?: ReactNode, className?: string`

Base: `bg-surface border border-border-panel rounded-sm p-3 transition-all`

Estrutura:
```
[title] [open_in_new link]  |  [SourceBadge] [actions]
[meta row]
[children]
```

```tsx
<NotionCard title="Reuniao com investidor" source="notion" href="https://notion.so/...">
  <Badge variant="blue" size="xs">Agendada</Badge>
</NotionCard>
```

---

#### EmptyState

**Arquivo:** `components/ui/EmptyState.tsx`
**Props:** `icon: string, title?: string, message?: string, description?: string, action?: { label: string, onClick: () => void }, className?: string`

Pattern:
```
flex flex-col items-center justify-center py-16 px-6 text-center
  [w-10 h-10 rounded-sm bg-surface border border-border-panel] -> icon
  [text-sm font-bold text-text-primary] -> heading
  [text-[11px] text-text-secondary max-w-[280px]] -> description
  [px-4 py-2 bg-brand-mint/10 border border-brand-mint/30 rounded-sm] -> CTA
```

```tsx
<EmptyState
  icon="inbox"
  title="Sem transacoes"
  description="Inicie uma conversa para configurar suas financas"
  action={{ label: 'Configurar', onClick: handleSetup }}
/>
```

---

#### FullscreenOverlay

**Arquivo:** `components/ui/FullscreenOverlay.tsx`
**Props:** `isOpen: boolean, onClose: () => void, children: ReactNode, className?: string`

Pattern: `fixed inset-0 z-50 bg-bg-base` com Framer Motion fade (opacity 0->1, duration 0.3s).

Restaura focus no elemento anterior ao fechar. Fecha com ESC.

---

#### FormModal

**Arquivo:** `components/ui/FormModal.tsx`
**Props:** `title: string, fields: FieldDef[], onSubmit: (data) => Promise<void>, onClose: () => void, isOpen: boolean, initialValues?: Record<string, unknown>`

Overlay: `fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm`
Modal: `max-w-lg bg-surface border border-border-panel rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto`
Header: `bg-header-bg border-b border-border-panel`
Footer: `bg-header-bg border-t border-border-panel`

Field types suportados: `text`, `number`, `select`, `date`, `textarea`, `toggle`, `range`, `time`, `icon-select`, `multi-checkbox`

Fields com `section` string agrupam sob `<SectionLabel>`.
Fields com `span: 1` ocupam meia largura no grid de 2 colunas.
Fields com `condition` function sao condicionalmente renderizados.

---

### 4.3 Navigation & Filtering

#### TabNav

**Arquivo:** `components/ui/TabNav.tsx`
**Props:** `tabs: Tab[], activeTab: string, onTabChange: (id: string) => void, accentColor?: 'mint' | 'orange' | 'purple' | 'blue', completedTabs?: string[], onRedoJourney?: (tabId: string) => void, className?: string`

**Tab interface:** `{ id: string, label: string, icon?: string }`

Container: `border-b border-border-panel shrink-0`
Nav: `-mb-px flex space-x-6 px-6 overflow-x-auto no-scrollbar`
Button: `py-4 px-1 border-b-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2`

| Accent | Active | Inactive |
|--------|--------|----------|
| mint (default) | `border-brand-mint text-brand-mint` | `border-transparent text-text-secondary hover:text-text-primary` |
| orange | `border-accent-orange text-accent-orange` | `border-transparent text-text-secondary hover:text-text-primary` |
| purple | `border-accent-purple text-accent-purple` | `border-transparent text-text-secondary hover:text-text-primary` |
| blue | `border-accent-blue text-accent-blue` | `border-transparent text-text-secondary hover:text-text-primary` |

```tsx
<TabNav
  tabs={[{ id: 'diario', label: 'Registro Diario', icon: 'edit_calendar' }]}
  activeTab="diario"
  onTabChange={setTab}
  accentColor="orange"
/>
```

---

#### FilterPills

**Arquivo:** `components/ui/FilterPills.tsx`
**Props:** `options?: string[], value?: string, onChange?: (value: string) => void, pills?: { id: string, label: string }[], activeId?: string, onSelect?: (id: string) => void, className?: string`

Dual API: aceita `options/value/onChange` (simples) ou `pills/activeId/onSelect` (avancado).

Button: `text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all min-h-[44px]`
Focus: `focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none`

| State | Classes |
|-------|---------|
| Active | `bg-brand-mint/10 border-brand-mint/30 text-brand-mint` |
| Inactive | `bg-surface border-border-panel text-text-secondary hover:text-text-primary` |

---

#### SearchBar

**Arquivo:** `components/ui/SearchBar.tsx`
**Props:** `value: string, onChange: (value: string) => void, placeholder?: string, className?: string`

Input: `bg-bg-base border border-border-panel rounded-sm py-2 pl-9 pr-9 text-xs text-text-primary focus:border-brand-mint/30`
Icone search a esquerda, botao close a direita quando valor presente.

---

### 4.4 Data Display

#### MetricBar

**Arquivo:** `components/ui/MetricBar.tsx`
**Props:** `metrics: Array<{ label: string, value: string | number, unit?: string, icon?: string, color?: string }>, className?: string`

Container: `flex flex-wrap gap-x-4 gap-y-2 py-2 px-4 border-b border-border-panel bg-bg-base`

Cada metrica:
```
[Icon xs text-text-secondary] [font-mono text-xs {color}] value [text-[8px] text-text-secondary] unit
[text-[8px] text-text-secondary uppercase tracking-widest] label
```

---

#### MetricDelta

**Arquivo:** `components/ui/MetricDelta.tsx`
**Props:** `value: number, suffix?: string, label?: string, size?: 'sm' | 'md', forceColor?: 'mint' | 'red' | 'orange' | 'blue' | 'purple', className?: string`

Cor automatica: positivo = brand-mint, negativo = accent-red, zero = text-secondary.
Icone: `arrow_upward` / `arrow_downward` / `remove`.
Size sm = `text-[10px]`, md = `text-xs`.

---

#### Sparkline

**Arquivo:** `components/ui/Sparkline.tsx`
**Props:** `data: number[], width?: number, height?: number, color?: 'mint' | 'red' | 'orange' | 'blue' | 'purple', showDot?: boolean, className?: string`

SVG polyline. Default: 80x24. Stroke width: 1.5.
Cores mapeiam para CSS variables. Dot: circle r=2 no ultimo ponto.
Retorna `null` se `data.length < 2`.

---

#### Ring

**Arquivo:** `components/ui/Ring.tsx`
**Props:** `value: number (0-100), size?: number, strokeWidth?: number, color?: 'mint' | 'red' | 'orange' | 'blue' | 'purple', showValue?: boolean, label?: string, className?: string`

SVG circle progress. Default: size=64, strokeWidth=4.
Track: `stroke="var(--color-border-panel)"`. Fill: stroke animado com `transition-all duration-500 ease-out`.
Transform: `-rotate-90`. Label abaixo: `text-[7px] uppercase font-bold tracking-wider`.

---

#### HeatmapGrid

**Arquivo:** `components/ui/HeatmapGrid.tsx`
**Props:** `data: Record<string, 0 | 1 | 2 | 3 | 4>, weeks?: number, onDayClick?: (date: string, value: number) => void, streakLabel?: string`

GitHub-style contribution grid. Default: 13 semanas.
Celulas: `w-[10px] h-[10px] rounded-[1px]`.

| Intensidade | Classe |
|-------------|--------|
| 0 | `bg-border-panel/40` |
| 1 | `bg-brand-mint/10` |
| 2 | `bg-brand-mint/30` |
| 3 | `bg-brand-mint/50` |
| 4 | `bg-brand-mint` |

Footer com legenda "menos [...] mais". Labels de dia em PT-BR (Dom, Seg, Ter...).
Day labels: `text-[7px] text-text-secondary`. Month labels: `text-[7px] text-text-secondary font-mono`.

---

#### Skeleton

**Arquivo:** `components/ui/Skeleton.tsx`
**Props:** `className?: string, variant?: 'line' | 'circle' | 'card' | 'chart', count?: number`

Base: `animate-pulse bg-border-panel/60 rounded-sm`

| Variant | Pattern |
|---------|---------|
| line (default) | `h-3 w-full` (ultimo item `w-3/4`), stacked com `space-y-2` |
| circle | `rounded-full` + className para sizing |
| card | `bg-surface border border-border-panel rounded-md p-4 space-y-3` com linhas internas |
| chart | Linha de titulo `h-3 w-24` + area `h-40 w-full rounded-md` |

---

#### TimelineList

**Arquivo:** `components/ui/TimelineList.tsx`
**Props:** `children: ReactNode, className?: string`

Container simples: `flex flex-col gap-0`.

---

#### TimelineItem

**Arquivo:** `components/ui/TimelineItem.tsx`
**Props:** `timestamp: string, title: string, badge?: ReactNode, children?: ReactNode, variant?: 'default' | 'error'`

Pattern: `relative py-2 px-3 border-l-2`
Dot: `absolute -left-[5px] top-3 w-2 h-2 rounded-full border`

| Variant | Border | Dot |
|---------|--------|-----|
| default | `border-border-panel` | `bg-bg-base border-border-panel` |
| error | `border-accent-red` + `bg-accent-red/5` | `bg-accent-red border-accent-red` |

---

### 4.5 Badges & Status

#### SourceBadge

**Arquivo:** `components/ui/SourceBadge.tsx`
**Props:** `source: 'notion' | 'local', className?: string`

Base: `text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm`

| Source | Classes |
|--------|---------|
| notion | `bg-brand-mint/5 border-brand-mint/20 text-brand-mint` |
| local | `bg-accent-blue/5 border-accent-blue/20 text-accent-blue` |

---

#### PipelineBadge

**Arquivo:** `components/ui/PipelineBadge.tsx`
**Props:** `status: string, className?: string`

Base: `text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm`
Cor via `getStatusToken(status)` de `utils/statusTokens.ts`.

---

#### AlertBadge

**Arquivo:** `components/ui/AlertBadge.tsx`
**Props:** `count: number, onClick?: () => void`

Pattern: `bg-accent-red/20 border border-accent-red/40 text-accent-red text-[7px] font-bold px-1.5 py-0.5 rounded-sm`
Pulsa (`animate-pulse`) quando `count > 0`.
Focus ring: `focus-visible:ring-2 focus-visible:ring-brand-mint/50`.

---

#### DataBadge

**Arquivo:** `components/ui/DataBadge.tsx`
**Props:** `isReal: boolean, lastSync?: string | null, className?: string`

Memoized. Atualiza a cada 30s.

| Estado | Pattern |
|--------|---------|
| Mock data (`isReal=false`) | `bg-accent-orange/10 border-accent-orange/30 text-accent-orange` + dot `bg-accent-orange` + "Dados de exemplo" |
| Sem dados (`isReal=true, !lastSync`) | `bg-accent-red/10 border-accent-red/20 text-accent-red` + "Sem dados" |
| Sincronizado (fresco) | `bg-brand-mint/10 border-brand-mint/20 text-brand-mint` + "Sincronizado ha Xmin" |
| Sincronizado (stale) | `bg-accent-orange/10 border-accent-orange/20 text-accent-orange` + timestamp |

Base: `inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[8px] font-mono leading-none border`

---

#### SyncBadge

**Arquivo:** `components/ui/SyncBadge.tsx`
**Props:** `lastSync: string | null, isLoading?: boolean, className?: string`

Atualiza a cada 30s. Pattern: `text-[8px] font-mono`.

| Estado | Cor |
|--------|-----|
| Loading | `text-text-secondary animate-pulse` "Sincronizando..." |
| Sem dados | `text-accent-orange` "Sem dados" |
| Fresco (<30min) | `text-text-secondary` |
| Stale (>1h ou >1d) | `text-accent-orange` |

---

### 4.6 Alerts & Notifications

#### AlertBanner

**Arquivo:** `components/ui/AlertBanner.tsx`
**Props:** `count: number, label: string, onExpand?: () => void, expanded?: boolean, children?: ReactNode, color?: 'orange' | 'red', className?: string`

Container: `rounded-sm border`

| Color | Container | Text |
|-------|-----------|------|
| orange (default) | `bg-accent-orange/10 border-accent-orange/30` | `text-accent-orange` |
| red | `bg-accent-red/10 border-accent-red/30` | `text-accent-red` |

Estrutura: icon warning + count + label | expand/collapse button. Children renderizam abaixo quando `expanded`.

---

#### Toast

**Arquivo:** `components/ui/Toast.tsx`
**Exports:** `showToast(message, variant, action?)`, `ToastContainer`, `getToastAppearance(variant)`

API global via `showToast()`. Container: `fixed bottom-20 md:bottom-6 right-6 z-[9999]`.

| Variant | Border | Icon | Icon color |
|---------|--------|------|------------|
| success | `border-brand-mint/30` | `check_circle` | `text-brand-mint` |
| error | `border-accent-red/30` | `error` | `text-accent-red` |
| info | `border-accent-blue/30` | `info` | `text-accent-blue` |

Base: `bg-surface shadow-lg rounded-sm`. Message: `text-[11px] font-bold text-text-primary`.
Action label: `text-[10px] font-black uppercase tracking-widest text-brand-mint`.
Animacao Framer: `opacity: 0->1, x: 40->0, scale: 0.95->1`, ease padrao do design system.
Duration: 2s (normal), 5s (com action para undo).

---

### 4.7 Journey System

#### SectionJourney

**Arquivo:** `components/ui/SectionJourney.tsx`
**Props:** `config: JourneyConfig, onComplete: () => void, onSkip: () => void`

Fluxo de onboarding em 3 fases: Welcome -> Steps -> Completion.

**Welcome:** Icon em box `w-16 h-16 bg-brand-mint/10 border-brand-mint/30`, titulo, meta info (etapas + minutos), CTA "Comecar Setup", skip "Fazer depois".

**Steps:** Progress bar (`h-1 bg-border-panel` track, `bg-brand-mint` fill), step card `bg-surface border border-border-panel rounded-sm p-6`, navegacao Voltar/Proximo.

**Completion:** Delegado para `JourneyCompletionScreen`.

Step transitions: `x: +/-40 -> 0`, duration 0.25s, ease padrao.

Field types suportados: `text`, `number`, `date`, `time`, `select`, `textarea`, `toggle`, `range`, `multi-checkbox`, `icon-select`, `money`, `url`

---

#### JourneyOverlay

**Arquivo:** `components/ui/JourneyOverlay.tsx`
**Props:** `config: JourneyConfig, isOpen: boolean, onClose: () => void, onComplete: () => void`

Overlay: `fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm`. Close button no canto superior direito.
Renderiza `SectionJourney` como conteudo.

---

#### JourneyCompletionScreen

**Arquivo:** `components/ui/JourneyCompletionScreen.tsx`
**Props:** `sectionTitle: string, icon: string, stats: Array<{ label: string, value: string | number }>, onConfirm: () => void`

Tela de sucesso: icon check_circle em box `w-16 h-16 bg-brand-mint/10 border-brand-mint/30`, titulo "Tudo pronto!", stats em grid 2x2, CTA "Comecar a usar".
Animacoes staggered com delays 0.3s, 0.5s, 0.7s, 0.8s+.

---

#### JourneyTriggerButton

**Arquivo:** `components/ui/JourneyTriggerButton.tsx`
**Props:** `isConfigured: boolean, onClick: () => void, className?: string`

Pattern: `text-[9px] uppercase tracking-widest font-bold text-text-secondary hover:text-brand-mint border border-border-panel rounded-sm px-3 py-1.5 hover:border-brand-mint/50`

Label: "Reconfigurar" (com icon refresh) se configurado, "Configurar" (com icon tune) se nao.

---

### 4.8 Form Components

#### FormInput

**Arquivo:** `components/ui/FormInput.tsx`
**Props:** `label?: string, error?: string` + `React.InputHTMLAttributes`
**forwardRef:** Sim

Base: `w-full bg-header-bg border border-border-panel rounded-sm py-2 px-3 text-xs text-text-primary focus:border-brand-mint focus:outline-none transition-colors placeholder:text-text-secondary/50`

Error state: `border-accent-red focus:border-accent-red`. Error message: `text-[9px] text-accent-red`.
Label: `text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]`.

---

#### FormSelect

**Arquivo:** `components/ui/FormSelect.tsx`
**Props:** `label?: string, error?: string, options: Array<{ value: string, label: string }>, placeholder?: string` + `React.SelectHTMLAttributes`

Mesma base visual do FormInput. Suporta placeholder como `<option disabled>`.

---

#### FormTextarea

**Arquivo:** `components/ui/FormTextarea.tsx`
**Props:** `label?: string, error?: string, rows?: number` + `React.TextareaHTMLAttributes`

Mesma base + `resize-none`. Default: `rows=3`.

---

#### FormToggle

**Arquivo:** `components/ui/FormToggle.tsx`
**Props:** `label?: string, checked: boolean, onChange: (checked: boolean) => void, className?: string`

Track: `h-5 w-10 rounded-full border border-border-panel`
Active: `bg-brand-mint`. Inactive: `bg-header-bg`.
Knob: `h-3.5 w-3.5 rounded-full shadow-sm`. Active: `translate-x-[18px] bg-bg-base`. Inactive: `translate-x-[3px] bg-text-secondary`.

`role="switch"`, `aria-checked`.

---

#### FormRange

**Arquivo:** `components/ui/FormRange.tsx`
**Props:** `label?: string, value: number, onChange: (value: number) => void, min: number, max: number, step?: number, unit?: string, error?: string, hint?: string, className?: string`

Value display: `text-sm font-mono font-bold text-text-primary`.
Min/max labels: `text-[8px] text-text-secondary/60`.
CSS custom property `--range-progress` para estilizacao do thumb/track.

---

#### FormMoneyInput

**Arquivo:** `components/ui/FormMoneyInput.tsx`
**Props:** `label?: string, value: number | '', onChange: (value: number) => void, placeholder?: string, error?: string, hint?: string, currency?: string, required?: boolean, className?: string`

Prefix: "R$" (BRL) ou "$". Formatacao PT-BR com `toLocaleString`. Parsing: remove pontos, troca virgula por ponto.
Input: `pl-10 font-mono`. Mesmo base visual dos outros form components.

---

#### FormUrlInput

**Arquivo:** `components/ui/FormUrlInput.tsx`
**Props:** `label?: string, value: string, onChange: (value: string) => void, placeholder?: string, error?: string, hint?: string, required?: boolean, className?: string`

Icon link a esquerda (`pl-9`). Auto-prepend `https://` no blur. Validacao basica (deve conter ".").
Warning: `text-[9px] text-accent-orange` quando URL parece incompleta.

---

#### FormIconSelect

**Arquivo:** `components/ui/FormIconSelect.tsx`
**Props:** `label?: string, options: Array<{ value: string, icon: string, label: string }>, value: string, onChange: (value: string) => void, error?: string, hint?: string, className?: string`

Grid responsivo de botoes com icone + label. Selected: `bg-brand-mint/5 border-brand-mint/30`, icon/label `text-brand-mint`.
Unselected: `bg-header-bg border-border-panel hover:border-text-secondary`.

---

#### FormMultiCheckbox

**Arquivo:** `components/ui/FormMultiCheckbox.tsx`
**Props:** `label?: string, options: MultiCheckboxOption[], value: string[], onChange: (selected: string[]) => void, minSelected?: number, maxSelected?: number, error?: string, hint?: string, columns?: 2 | 3 | 4, className?: string`

Grid responsivo (single col mobile, configured cols desktop). Checkbox indicator: `w-4 h-4 rounded-sm border`, selected: `bg-brand-mint/20 border-brand-mint` com check icon.
Counter: `{value.length} de {maxSelected} selecionados` em `text-[9px] font-mono`.

---

### 4.9 Utility Components

#### RepeatableFieldGroup

**Arquivo:** `components/ui/RepeatableFieldGroup.tsx`
**Props:** `itemLabel: string, items: Record<string, unknown>[], renderItem, onAddItem, onRemoveItem, onItemChange, minItems: number, maxItems: number, addLabel: string, className?: string`

Accordion de items repetitivos. Cada item: `bg-header-bg border border-border-panel rounded-sm`.
Header: `text-[10px] font-bold uppercase tracking-widest text-text-secondary`.
Add button: `border border-dashed border-border-panel rounded-sm text-[9px] font-bold uppercase tracking-widest`.
Counter: `{items.length} de {maxItems}`.

---

## 5. Chart System

5 charts, todos SVG puro, zero dependencias externas.

**Arquivo fonte:** `components/ui/LightweightCharts.tsx`

### 5.1 MiniDonutChart

**Props:** `data: Array<{ name: string, value: number }>, colors: string[], centerLabel: string, centerSubLabel?: string`

SVG viewBox: `0 0 180 180`. Donut radius: 52, strokeWidth: 18.
Track: `stroke="var(--color-border-panel)"`.
Center: `text-sm font-bold font-mono text-text-primary` (label), `text-[8px] font-bold uppercase tracking-[0.1em] text-text-secondary` (sublabel).
Slices renderizados via `strokeDasharray` e `strokeDashoffset`, rotacao `-90 90 90`.

### 5.2 MiniLineAreaChart

**Props:** `data: T[], xKey: keyof T, series: Array<{ key: string, label: string, color: string, fillOpacity?: number }>, yMax?: number, showGrid?: boolean, showDots?: boolean, compact?: boolean`

SVG viewBox: `520 x 220` (normal) ou `520 x 120` (compact).
Grid: dashed lines `stroke="var(--color-border-panel)" strokeDasharray="3 3"`.
Lines: `strokeWidth="3"`, `strokeLinejoin="round" strokeLinecap="round"`.
Dots: `r="3.5"`, fill=color, `stroke="var(--color-bg-surface)" strokeWidth="2"`.
Y axis labels: `fontSize: 10, fontFamily: 'monospace'`.
X axis labels: `fontSize: 10` (normal) ou `fontSize: 8` (compact).

### 5.3 MiniBarChart

**Props:** `data: Array<{ label: string, value: number, color: string }>, maxValue?: number`

SVG viewBox: `520 x 140`. Bar width: 58% do slot. `rx="4"` nos bars.
Labels: `fontSize: 8, fontFamily: 'monospace'`.

### 5.4 MiniStackedBarChart

**Props:** `data: Array<{ label: string, [key: string]: string | number }>, keys: Array<{ key: string, color: string }>`

SVG viewBox: `520 x 180`. Bar width: 50% do slot. `rx="2"` nos segments.
Labels: `fontSize: 9, fontFamily: 'monospace'`.

### 5.5 MiniRadarChart

**Props:** `data: Array<{ label: string, value: number }>, color: string`

SVG viewBox: `220 x 220`. Center: (110, 110). Radius: 72. Max value: 10.
Circulos concentricos em 0.25, 0.5, 0.75, 1.0 do radius, `stroke="var(--color-border-panel)"`.
Polygon: `fill={color} opacity="0.18" stroke={color} strokeWidth="2.5"`.
Labels: `fontSize: 11, fill="var(--color-text-secondary)"`.

### 5.6 Cores de Series Usadas no App

| Serie | Cor | Token |
|-------|-----|-------|
| Energy / Energia | `#facc15` | Fora da paleta (yellow) |
| Sleep / Sono | `#0A84FF` | accent-blue |
| Focus / Foco | `#00FF95` | brand-mint |
| Recovery | `#BF5AF2` | accent-purple |
| Mood / Humor | `#FF9F0A` | accent-orange |

Cores de status de task:
| Status | Cor |
|--------|-----|
| Assigned | `#64748b` (fora da paleta) |
| Started | `#0A84FF` |
| In Progress | `#FF9F0A` |
| Standby | `#EAB308` (fora da paleta) |
| Done | `#00FF95` |

---

## 6. Patterns Compostos

Patterns Tailwind exatos para copiar e usar.

### 6.1 Card Patterns

**Card CLAUDE.md (especificado):**
```
bg-surface border border-border-panel rounded-sm p-3 transition-all
```

**Card.tsx (implementado):**
```
bg-surface border border-border-card rounded-md transition-colors
```

**NotionCard (implementado):**
```
bg-surface border border-border-panel rounded-sm p-3 transition-all
```

### 6.2 Button Patterns

**Primary:**
```
bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm
text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all
```

**Secondary:**
```
bg-surface border border-border-panel text-text-primary rounded-sm
text-[9px] font-bold uppercase tracking-widest
```

**Danger:**
```
bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm
text-[9px] font-bold uppercase tracking-widest
```

**Full solid (ex: Health save):**
```
bg-accent-orange text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110
```

### 6.3 Tab Bar

```
Container: flex items-center gap-1 border-b border-border-panel
Active:    text-brand-mint border-brand-mint border-b-2
Inactive:  text-text-secondary border-transparent hover:text-text-primary
```

### 6.4 Chat Panel

**User bubble:**
```
bg-brand-mint/10 border border-brand-mint/30   (right-aligned)
```

**Agent bubble:**
```
bg-bg-base border border-border-panel   (left-aligned)
```

### 6.5 Progress Bars

**Standard track:**
```
h-1 bg-border-panel rounded-full
```

**Alternative track:**
```
h-2 bg-white/10 rounded-full
```

**Fill:**
```
h-full bg-accent-orange   (com width style inline)
```

**XP bar:**
```
h-1.5 bg-gradient-to-r from-brand-mint/60 to-brand-mint rounded-full
```

### 6.6 Navigation

**Active nav item:**
```
bg-surface text-brand-mint border-l-2 border-brand-mint
```

**Inactive nav item:**
```
text-text-secondary border-l-2 border-transparent hover:text-text-primary hover:bg-surface
```

### 6.7 States & Feedback

**Loading:**
```
animate-pulse text-text-secondary text-xs font-mono
```

**Focus ring (todos os interativos):**
```
focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none
```

**Hover transition:**
```
transition-all duration-300 ease-out
```

### 6.8 Overlays & Glass

**Overlay backdrop:**
```
fixed inset-0 z-50 bg-black/40
```

**Glass panel:**
```
bg-glass-bg backdrop-blur-[12px] border border-glass-border
```

### 6.9 Animations (Framer Motion)

**Page transition:**
```js
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
```

**Toast entrance:**
```js
initial={{ opacity: 0, x: 40, scale: 0.95 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
exit={{ opacity: 0, x: 40, scale: 0.95 }}
```

**Modal entrance:**
```js
initial={{ opacity: 0, scale: 0.98, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
```

### 6.10 Custom Scrollbar

Classe CSS `.custom-scrollbar`:
- Width: 8px
- Track: `var(--color-bg-surface)`
- Thumb: `var(--color-border-panel)`, hover: `var(--color-text-secondary)`

### 6.11 Form Inputs

**Base (todos os form components):**
```
w-full bg-header-bg border border-border-panel rounded-sm py-2 px-3
text-xs text-text-primary focus:border-brand-mint focus:outline-none
transition-colors placeholder:text-text-secondary/50
```

**Form label:**
```
text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]
```

**Error message:**
```
text-[9px] text-accent-red
```

**Hint text:**
```
text-[8px] text-text-secondary/60
```

### 6.12 Toggle Switch

```
Track:  h-5 w-10 rounded-full border border-border-panel
Active: bg-brand-mint
Knob:   h-3.5 w-3.5 rounded-full shadow-sm
  ON:   translate-x-[18px] bg-bg-base
  OFF:  translate-x-[3px] bg-text-secondary
```

---

## 7. Status Tokens

**Arquivo fonte:** `utils/statusTokens.ts`

Lookup via `getStatusToken(status)` retornando `{ color: string, label: string }`.

| Status | Color classes | Label |
|--------|-------------|-------|
| Pendente | `text-text-secondary border-border-panel` | Pendente |
| Na Fila | `text-accent-orange border-accent-orange/30` | Na Fila |
| Em Execucao | `text-accent-blue border-accent-blue/30` | Em Execucao |
| Analisado | `text-brand-mint border-brand-mint/30` | Analisado |
| Ativo | `text-brand-mint border-brand-mint/30` | Ativo |
| Pausado | `text-accent-orange border-accent-orange/30` | Pausado |
| Concluido | `text-text-secondary border-border-panel` | Concluido |
| Processado | `text-brand-mint border-brand-mint/30` | Processado |
| Agendada | `text-accent-blue border-accent-blue/30` | Agendada |
| Realizada | `text-text-secondary border-border-panel` | Realizada |
| Outcome Pendente | `text-accent-orange border-accent-orange/30` | Outcome Pendente |
| Resolvida | `text-brand-mint border-brand-mint/30` | Resolvida |
| passing | `text-brand-mint border-brand-mint/30` | Passing |
| failing | `text-accent-red border-accent-red/30` | Failing |

**Fallback:** Status nao mapeado retorna `text-text-secondary border-border-panel` com o texto original como label.

Badge base para PipelineBadge e SourceBadge:
```
text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm
```

---

## 8. Divergencias CLAUDE.md vs Codigo

Divergencias documentadas entre as regras do CLAUDE.md e a implementacao real no codigo.

| # | Divergencia | CLAUDE.md diz | Codigo real | Arquivo |
|---|------------|---------------|-------------|---------|
| 1 | **Card border-radius** | `rounded-sm` para cards | `rounded-md` | `Card.tsx:15` |
| 2 | **Card border token** | `border-border-panel` | `border-border-card` | `Card.tsx:15` |
| 3 | **Card de secao background** | Implica `bg-surface` | `bg-header-bg` preferido para cards de secao (Health, Trends) | Varias views |
| 4 | **accent-green alias** | Nao documentado | `accent-green` mapeia para `var(--color-brand-mint)` | `tailwind.config.js:28` |
| 5 | **border-card token** | Nao documentado como separado | Existe como token CSS e Tailwind key, identico a border-panel no dark theme, diferente no light (`#D5D1CA` vs `#CDC9C1`) | `index.css:16,65`, `tailwind.config.js:23` |
| 6 | **#facc15 (yellow)** | Nao existe na paleta | Usado nos charts de Health para "Energy" | `components/health/` |
| 7 | **#64748b e #EAB308** | Nao existem na paleta | Usados para task status "Assigned" e "Standby" | Charts de tasks |
| 8 | **Gradient em cards** | "Do not use gradient backgrounds on cards" | `bg-gradient-to-br from-header-bg to-bg-base` usado em suggestion card do Health | Health section |
| 9 | **Skeleton variant card** | Nao especificado | Usa `rounded-md` (consistente com Card.tsx, diverge do CLAUDE.md rounded-sm) | `Skeleton.tsx:28` |
| 10 | **FormToggle knob color** | `--color-switch-knob: #FFFFFF` | Active knob: `bg-bg-base`, inactive: `bg-text-secondary` (nao usa switch-knob token) | `FormToggle.tsx:31-32` |

### Recomendacoes

1. **Card.tsx** deveria usar `rounded-sm` para conformidade com CLAUDE.md, ou CLAUDE.md deve ser atualizado para `rounded-md`
2. **accent-green** deveria ser documentado no CLAUDE.md como alias
3. **Cores fora da paleta** nos charts (yellow #facc15, slate #64748b, yellow-500 #EAB308) devem ser adicionadas formalmente ou substituidas por cores da paleta existente
4. **FormToggle** deveria usar o token `--color-switch-knob` em vez de `bg-bg-base` / `bg-text-secondary`

---

*Fonte: leitura direta de index.css, tailwind.config.js, e todos os 42 arquivos em components/ui/. Gerado em 2026-03-27.*
