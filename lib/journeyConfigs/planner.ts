import type { JourneyConfig } from '../journeyTypes';

export const plannerJourneyConfig: JourneyConfig = {
  viewId: 'planner',
  sectionTitle: 'Projetos',
  icon: 'event_note',
  welcomeTitle: 'Vamos configurar seus projetos',
  welcomeSubtitle: 'Registre seus projetos ativos e seus objetivos principais.',
  estimatedMinutes: 4,
  steps: [
    {
      title: 'Seus projetos ativos',
      subtitle: 'Adicione os projetos em que esta trabalhando',
      icon: 'work',
      fields: [
        { name: 'name', label: 'Nome do projeto', type: 'text', required: true, placeholder: 'Ex: App Marco OS, Curso React...' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
          { value: 'software', label: 'Software' },
          { value: 'conteudo', label: 'Conteudo' },
          { value: 'negocio', label: 'Negocio' },
          { value: 'pessoal', label: 'Pessoal' },
          { value: 'estudo', label: 'Estudo' },
          { value: 'freelance', label: 'Freelance' },
          { value: 'outro', label: 'Outro' },
        ] },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'ativo', label: 'Ativo' },
          { value: 'planejamento', label: 'Em planejamento' },
          { value: 'pausado', label: 'Pausado' },
        ], defaultValue: 'ativo' },
        { name: 'descricao', label: 'Descricao', type: 'textarea', placeholder: 'Breve descricao do projeto...' },
        { name: 'meta_principal', label: 'Meta principal', type: 'text', placeholder: 'Ex: Lancar MVP ate Marco...' },
      ],
      repeatable: {
        itemLabel: 'Projeto',
        minItems: 1,
        maxItems: 5,
        addLabel: 'Adicionar outro projeto',
      },
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const ts = new Date().toISOString();

        for (const item of items) {
          if (item.name) {
            const id = crypto.randomUUID();
            await dbInstance.put('meta', {
              key: `planner_project_${id}`,
              value: {
                name: item.name,
                tipo: item.tipo,
                status: item.status,
                descricao: item.descricao,
                meta: item.meta_principal,
                createdAt: ts,
              },
            });
          }
        }
      },
    },
    {
      title: 'Detalhes extras',
      subtitle: 'Totalmente opcional -- pode preencher depois',
      icon: 'link',
      fields: [
        { name: 'link_drive', label: 'Link do Drive', type: 'url', placeholder: 'https://drive.google.com/...' },
        { name: 'link_notion', label: 'Link do Notion', type: 'url', placeholder: 'https://notion.so/...' },
        { name: 'link_github', label: 'Link do GitHub', type: 'url', placeholder: 'https://github.com/...' },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', {
          key: 'planner_links',
          value: {
            drive: allValues.link_drive,
            notion: allValues.link_notion,
            github: allValues.link_github,
          },
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    const projetos = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    return [
      { label: 'Projetos', value: projetos.filter(p => p.name).length },
      { label: 'Links adicionados', value: [allValues.link_drive, allValues.link_notion, allValues.link_github].filter(Boolean).length },
    ];
  },
};
