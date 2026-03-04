import type { FieldDef } from '../components/ui/FormModal';

// ─── Finance ─────────────────────────────────────────────────────────────────

export const FINANCE_CATEGORIES = [
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentacao' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saude' },
  { value: 'educacao', label: 'Educacao' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'servicos', label: 'Servicos' },
  { value: 'receita-projeto', label: 'Receita Projeto' },
  { value: 'outros', label: 'Outros' },
];

export const financeFields: FieldDef[] = [
  { name: 'name', label: 'Descricao', type: 'text', required: true, placeholder: 'Ex: Salario, Aluguel...', span: 2 },
  { name: 'valor', label: 'Valor (R$)', type: 'number', required: true, placeholder: '0,00', span: 1 },
  { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [{ value: 'entrada', label: 'Entrada' }, { value: 'saida', label: 'Saida' }], defaultValue: 'saida', span: 1 },
  { name: 'categoria', label: 'Categoria', type: 'select', options: FINANCE_CATEGORIES, defaultValue: 'outros', span: 1 },
  { name: 'data', label: 'Data', type: 'date', defaultValue: new Date().toISOString().slice(0, 10), span: 1 },
  { name: 'recorrente', label: 'Recorrente', type: 'toggle', defaultValue: false },
];

// ─── Health ──────────────────────────────────────────────────────────────────

export const healthFields: FieldDef[] = [
  { name: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Ex: Treino Peito, Caminhada...', span: 2 },
  { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [
    { value: 'treino', label: 'Treino' },
    { value: 'peso', label: 'Peso' },
    { value: 'habito', label: 'Habito' },
    { value: 'sono', label: 'Sono' },
    { value: 'humor', label: 'Humor' },
  ], defaultValue: 'treino', span: 1 },
  { name: 'data', label: 'Data', type: 'date', defaultValue: new Date().toISOString().slice(0, 10), span: 1 },
  // Conditional: Treino
  { name: 'duracao', label: 'Duracao (min)', type: 'number', placeholder: 'Ex: 60', span: 1,
    condition: (d) => d.tipo === 'treino' },
  { name: 'intensidade', label: 'Intensidade (1-10)', type: 'range', min: 1, max: 10, step: 1, defaultValue: 5, span: 1,
    condition: (d) => d.tipo === 'treino' },
  // Conditional: Peso
  { name: 'valor', label: 'Peso (kg)', type: 'number', placeholder: 'Ex: 75.5', span: 1,
    condition: (d) => d.tipo === 'peso', required: true },
  // Conditional: Sono
  { name: 'horas_sono', label: 'Horas de sono', type: 'number', placeholder: 'Ex: 7.5', span: 1,
    condition: (d) => d.tipo === 'sono' },
  { name: 'dormiu', label: 'Dormiu as', type: 'time', span: 1,
    condition: (d) => d.tipo === 'sono' },
  { name: 'acordou', label: 'Acordou as', type: 'time', span: 1,
    condition: (d) => d.tipo === 'sono' },
  // Conditional: Humor
  { name: 'humor_nivel', label: 'Nivel de humor', type: 'icon-select', span: 2,
    icons: [
      { value: 'otimo', icon: 'sentiment_very_satisfied', label: 'Otimo' },
      { value: 'bom', icon: 'sentiment_satisfied', label: 'Bom' },
      { value: 'neutro', icon: 'sentiment_neutral', label: 'Neutro' },
      { value: 'baixo', icon: 'sentiment_dissatisfied', label: 'Baixo' },
      { value: 'pessimo', icon: 'sentiment_very_dissatisfied', label: 'Pessimo' },
    ],
    condition: (d) => d.tipo === 'humor' },
  // Conditional: Habito
  { name: 'cumprido', label: 'Habito cumprido?', type: 'toggle', defaultValue: false,
    condition: (d) => d.tipo === 'habito' },
  // Always visible
  { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Observacoes...' },
];

// ─── Reunioes ────────────────────────────────────────────────────────────────

export const reunioesFields: FieldDef[] = [
  { name: 'name', label: 'Titulo da Reuniao', type: 'text', required: true, placeholder: 'Ex: Alinhamento semanal', span: 2 },
  { name: 'date', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10), span: 1 },
  { name: 'time', label: 'Horario', type: 'text', placeholder: 'Ex: 14:00', span: 1 },
  { name: 'participants', label: 'Participantes', type: 'text', placeholder: 'Nomes separados por virgula', span: 2 },
  { name: 'objective', label: 'Objetivo', type: 'textarea', placeholder: 'Objetivo da reuniao...' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'agendada', label: 'Agendada' },
    { value: 'realizada', label: 'Realizada' },
    { value: 'cancelada', label: 'Cancelada' },
  ], defaultValue: 'agendada', span: 1 },
];

// ─── Network (Contacts) ─────────────────────────────────────────────────────

export const networkFields: FieldDef[] = [
  { name: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Nome completo', span: 2 },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'email@exemplo.com', span: 1 },
  { name: 'phone', label: 'Telefone', type: 'text', placeholder: '+55 11 99999-9999', span: 1 },
  { name: 'tipo', label: 'Tipo', type: 'select', options: [
    { value: 'contato', label: 'Contato' },
    { value: 'lead', label: 'Lead' },
    { value: 'parceiro', label: 'Parceiro' },
    { value: 'mentor', label: 'Mentor' },
  ], defaultValue: 'contato', span: 1 },
  { name: 'company', label: 'Empresa', type: 'text', placeholder: 'Ex: Acme Inc.', span: 1 },
  { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Observacoes sobre o contato...' },
];

// ─── Brain Dump ──────────────────────────────────────────────────────────────

export const braindumpFields: FieldDef[] = [
  { name: 'name', label: 'Titulo', type: 'text', required: true, placeholder: 'Titulo da nota', span: 2 },
  { name: 'content', label: 'Conteudo', type: 'textarea', placeholder: 'Escreva aqui...' },
  { name: 'tipo', label: 'Tipo', type: 'select', options: [
    { value: 'ideia', label: 'Ideia' },
    { value: 'reflexao', label: 'Reflexao' },
    { value: 'tarefa', label: 'Tarefa' },
    { value: 'referencia', label: 'Referencia' },
  ], defaultValue: 'ideia', span: 1 },
];

// ─── Content ────────────────────────────────────────────────────────────────

export const contentFields: FieldDef[] = [
  { name: 'title', label: 'Titulo', type: 'text', required: true, placeholder: 'Ex: Como usar React 19', span: 2 },
  { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [
    { value: 'post', label: 'Post' },
    { value: 'video', label: 'Video' },
    { value: 'thread', label: 'Thread' },
    { value: 'artigo', label: 'Artigo' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'outro', label: 'Outro' },
  ], defaultValue: 'post', span: 1 },
  { name: 'plataforma', label: 'Plataforma', type: 'select', options: [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'blog', label: 'Blog' },
    { value: 'substack', label: 'Substack' },
    { value: 'outro', label: 'Outro' },
  ], defaultValue: 'linkedin', span: 1 },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'ideia', label: 'Ideia' },
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'producao', label: 'Producao' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'arquivado', label: 'Arquivado' },
  ], defaultValue: 'ideia', span: 1 },
  { name: 'data', label: 'Data', type: 'date', span: 1 },
  { name: 'link', label: 'Link', type: 'text', placeholder: 'https://...', span: 2 },
  { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Observacoes...' },
];

// ─── Projetos ───────────────────────────────────────────────────────────────

export const projectFields: FieldDef[] = [
  { name: 'name', label: 'Nome do Projeto', type: 'text', required: true, placeholder: 'Ex: Marco OS v2', span: 2 },
  { name: 'descricao', label: 'Descricao', type: 'textarea', placeholder: 'Breve descricao do projeto...' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'ativo', label: 'Ativo' },
    { value: 'pausado', label: 'Pausado' },
    { value: 'concluido', label: 'Concluido' },
    { value: 'arquivado', label: 'Arquivado' },
  ], defaultValue: 'ativo', span: 1 },
  { name: 'prioridade', label: 'Prioridade', type: 'select', required: true, options: [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baixa', label: 'Baixa' },
  ], defaultValue: 'media', span: 1 },
  { name: 'deadline', label: 'Deadline', type: 'date', span: 1 },
  { name: 'linkDrive', label: 'Link Drive', type: 'text', placeholder: 'https://drive.google.com/...', span: 2 },
  { name: 'linkNotion', label: 'Link Notion', type: 'text', placeholder: 'https://notion.so/...', span: 2 },
  { name: 'linkGithub', label: 'Link GitHub', type: 'text', placeholder: 'https://github.com/...', span: 2 },
  { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Observacoes...' },
];

// ─── Skills ──────────────────────────────────────────────────────────────────

export const skillsFields: FieldDef[] = [
  { name: 'name', label: 'Nome da Skill', type: 'text', required: true, placeholder: 'Ex: React, Python...', span: 2 },
  { name: 'categoria', label: 'Categoria', type: 'select', options: [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'data', label: 'Data' },
    { value: 'soft-skill', label: 'Soft Skill' },
    { value: 'outros', label: 'Outros' },
  ], defaultValue: 'frontend', span: 1 },
  { name: 'nivel', label: 'Nivel', type: 'select', options: [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediario' },
    { value: 'avancado', label: 'Avancado' },
    { value: 'expert', label: 'Expert' },
  ], defaultValue: 'iniciante', span: 1 },
  { name: 'progresso', label: 'Progresso (%)', type: 'number', placeholder: '0-100', defaultValue: '0', span: 1 },
  { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Observacoes...' },
];
