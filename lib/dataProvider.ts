// lib/dataProvider.ts
// DataProvider interface — Phase 1: JSON polling, Phase 3: Supabase real-time
// All data consumption goes through this interface.

export interface DataProvider<T> {
  items: T[];
  isLoading: boolean;
  lastSync: string | null; // ISO8601
  error: string | null;
  refetch: () => Promise<void>;
}

// Empty state factory — use as default/loading state
export function emptyProvider<T>(): DataProvider<T> {
  return {
    items: [],
    isLoading: true,
    lastSync: null,
    error: null,
    refetch: async () => {},
  };
}

// Notion item types — flat properties from JSON files

export interface ResearchItem {
  id: string;
  title: string;
  url: string;
  plataforma: string;
  criador: string;
  data: string;
  qualidade: string;
  thumbnail: string;
  transcript: boolean;
  resumo: string;
  notion_url: string;
}

export interface DeepDiveItem {
  id: string;
  title: string;
  status: string;
  rating: number;
  criador: string;
  plataforma: string;
  proxima_acao: string;
  url: string;
  notion_url: string;
}

export interface CriadorItem {
  id: string;
  title: string;
  plataforma: string;
  ativo_no_radar: boolean;
  research_count: number;
  deep_dives_count: number;
  tier: string;
  notion_url: string;
}

export interface ProjetoItem {
  id: string;
  title: string;
  status: string;
  prioridade: string;
  deadline: string;
  progresso: number;
  notion_url: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  status: string;
  prioridade: string;
  responsavel: string;
  prazo: string;
  projeto: string;
  progresso: number;
  notion_url: string;
}

export interface ReuniaoItem {
  id: string;
  title: string;
  data: string;
  participantes: string;
  resumo: string;
  follow_up: string;
  notion_url: string;
}

export interface PessoaItem {
  id: string;
  title: string;
  tipo: string;
  empresa: string;
  prioridade: string;
  proxima_acao: string;
  email: string;
  telefone: string;
  notion_url: string;
}

export interface ContentItem {
  id: string;
  title: string;
  status: string;
  plataforma: string;
  data: string;
  projeto: string;
  notion_url: string;
}

export interface BrainDumpItem {
  id: string;
  title: string;
  status: string;
  destino: string;
  data: string;
  notion_url: string;
}

export interface FinancaItem {
  id: string;
  title: string;
  valor: number;
  tipo: string; // Entrada | Saida
  categoria: string;
  data: string;
  recorrente: boolean;
  projeto: string;
  descricao: string;
  notion_url: string;
}

export interface SaudeItem {
  id: string;
  title: string;
  data: string;
  tipo: string; // Treino | Peso | Habito
  valor: number;
  duracao: number;
  notas: string;
  notion_url: string;
}

export interface SkillItem {
  id: string;
  title: string;
  categoria: string;
  nivel: string;
  progresso: number;
  notas: string;
  recursos: string;
  notion_url: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  data: string;
  contexto: string;
  opcoes_consideradas: string;
  framework: string;
  decisao_tomada: string;
  outcome_esperado: string;
  outcome_real: string;
  status: string;
  impacto: string;
  tags: string[];
  projeto: string;
  notion_url: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  account: string;
  location: string;
  description: string;
  all_day: boolean;
}

export interface GitHubRepo {
  repo: string;
  last_commit: { message: string; date: string; author: string };
  open_prs: number;
  ci_status: string;
  contributors_30d: string[];
}
