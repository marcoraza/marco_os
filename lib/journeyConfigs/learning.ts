import type { JourneyConfig } from '../journeyTypes';
import { putSkill } from '../../data/repository';
import type { StoredSkill } from '../../data/models';

// ─── Learning Curriculum Journey (tabId: 'curriculum') ─────────────────────

export const learningCurriculumJourney: JourneyConfig = {
  viewId: 'learning',
  tabId: 'curriculum',
  sectionTitle: 'Aprendizado',
  icon: 'school',
  welcomeTitle: 'Mapeie suas skills',
  welcomeSubtitle: 'Registre suas habilidades atuais e nivel de proficiencia.',
  estimatedMinutes: 3,
  steps: [
    // Step 1: Suas skills atuais (repeatable)
    {
      title: 'Suas skills atuais',
      icon: 'psychology',
      fields: [
        {
          name: 'name',
          label: 'Nome da Skill',
          type: 'text',
          required: true,
          placeholder: 'Ex: React, Python...',
        },
        {
          name: 'categoria',
          label: 'Categoria',
          type: 'select',
          options: [
            { value: 'frontend', label: 'Frontend' },
            { value: 'backend', label: 'Backend' },
            { value: 'devops', label: 'DevOps' },
            { value: 'design', label: 'Design' },
            { value: 'data', label: 'Data' },
            { value: 'mobile', label: 'Mobile' },
            { value: 'ia-ml', label: 'IA/ML' },
            { value: 'gestao', label: 'Gestao' },
            { value: 'soft-skill', label: 'Soft Skill' },
            { value: 'outros', label: 'Outros' },
          ],
        },
        {
          name: 'nivel',
          label: 'Nivel',
          type: 'select',
          options: [
            { value: 'iniciante', label: 'Iniciante' },
            { value: 'intermediario', label: 'Intermediario' },
            { value: 'avancado', label: 'Avancado' },
            { value: 'expert', label: 'Expert' },
          ],
        },
        {
          name: 'progresso',
          label: 'Progresso (%)',
          type: 'number',
          placeholder: '0-100',
        },
      ],
      repeatable: {
        itemLabel: 'Skill',
        minItems: 1,
        maxItems: 6,
        addLabel: 'Adicionar outra skill',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const ts = new Date().toISOString();

        for (const item of items) {
          if (item.name) {
            const skill: StoredSkill = {
              id: crypto.randomUUID(),
              name: item.name as string,
              categoria: (item.categoria as string) || 'outros',
              nivel: (item.nivel as StoredSkill['nivel']) || 'iniciante',
              progresso: Math.min(100, Math.max(0, Number(item.progresso) || 0)),
              createdAt: ts,
              updatedAt: ts,
            };
            await putSkill(skill);
          }
        }
      },
    },
  ],

  getCompletionStats(allValues) {
    const skills = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    return [
      { label: 'Skills registradas', value: skills.filter(s => s.name).length },
    ];
  },
};

// ─── Learning Knowledge Journey (tabId: 'knowledge') ───────────────────────

export const learningKnowledgeJourney: JourneyConfig = {
  viewId: 'learning',
  tabId: 'knowledge',
  sectionTitle: 'Aprendizado',
  icon: 'school',
  welcomeTitle: 'Fontes de conhecimento',
  welcomeSubtitle: 'De onde vem seu aprendizado? Configure para insights melhores.',
  estimatedMinutes: 2,
  steps: [
    // Step 1: Fontes preferidas
    {
      title: 'Fontes preferidas',
      icon: 'menu_book',
      fields: [
        {
          name: 'fonte_principal',
          label: 'Fonte principal',
          type: 'select',
          options: [
            { value: 'cursos-online', label: 'Cursos online' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'livros', label: 'Livros' },
            { value: 'pratica', label: 'Pratica / Projetos' },
            { value: 'mentoria', label: 'Mentoria' },
            { value: 'bootcamp', label: 'Bootcamp' },
            { value: 'faculdade', label: 'Faculdade' },
            { value: 'documentacao', label: 'Documentacao oficial' },
          ],
        },
        {
          name: 'horas_semanais',
          label: 'Horas de estudo por semana',
          type: 'range',
          min: 0,
          max: 40,
          step: 1,
          unit: 'h',
          defaultValue: 5,
        },
        {
          name: 'proxima_skill',
          label: 'Proxima skill que quer aprender',
          type: 'text',
          placeholder: 'Ex: Rust, Kubernetes...',
        },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', {
          key: 'learning_fonte',
          value: {
            fonte: allValues.fonte_principal,
            horas: allValues.horas_semanais,
            proxima: allValues.proxima_skill,
          },
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    return [
      { label: 'Fonte principal', value: (allValues.fonte_principal as string) || '-' },
      { label: 'Horas/semana', value: allValues.horas_semanais ? `${allValues.horas_semanais}h` : '-' },
      { label: 'Proxima skill', value: (allValues.proxima_skill as string) || '-' },
    ];
  },
};

// ─── Learning Resources Journey (tabId: 'resources') ───────────────────────

export const learningResourcesJourney: JourneyConfig = {
  viewId: 'learning',
  tabId: 'resources',
  sectionTitle: 'Aprendizado',
  icon: 'school',
  welcomeTitle: 'Seus recursos',
  welcomeSubtitle: 'Configure plataformas e tipos de conteudo que prefere.',
  estimatedMinutes: 2,
  steps: [
    // Step 1: Plataformas e conteudo
    {
      title: 'Plataformas e conteudo',
      icon: 'devices',
      fields: [
        {
          name: 'plataformas',
          label: 'Plataformas',
          type: 'multi-checkbox',
          required: true,
          minSelected: 1,
          columns: 2,
          multiOptions: [
            { value: 'udemy', label: 'Udemy', icon: 'play_circle' },
            { value: 'coursera', label: 'Coursera', icon: 'school' },
            { value: 'youtube', label: 'YouTube', icon: 'play_circle' },
            { value: 'pluralsight', label: 'Pluralsight', icon: 'devices' },
            { value: 'alura', label: 'Alura', icon: 'school' },
            { value: 'rocketseat', label: 'Rocketseat', icon: 'rocket_launch' },
            { value: 'free-code-camp', label: 'freeCodeCamp', icon: 'code' },
            { value: 'outro', label: 'Outro', icon: 'language' },
          ],
        },
        {
          name: 'formato_preferido',
          label: 'Formato preferido',
          type: 'select',
          options: [
            { value: 'video', label: 'Video' },
            { value: 'texto', label: 'Texto' },
            { value: 'pratico', label: 'Pratico' },
            { value: 'misto', label: 'Misto' },
          ],
        },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', {
          key: 'learning_resources',
          value: {
            plataformas: allValues.plataformas,
            formato: allValues.formato_preferido,
          },
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    const plataformas = (allValues.plataformas as string[]) || [];
    return [
      { label: 'Plataformas', value: plataformas.length },
      { label: 'Formato', value: (allValues.formato_preferido as string) || '-' },
    ];
  },
};
