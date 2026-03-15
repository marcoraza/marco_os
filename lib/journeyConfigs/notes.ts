import type { JourneyConfig } from '../journeyTypes';

export const notesJourneyConfig: JourneyConfig = {
  viewId: 'notes',
  sectionTitle: 'Notas',
  icon: 'sticky_note_2',
  welcomeTitle: 'Vamos configurar suas notas',
  welcomeSubtitle: 'Escolha os tipos de nota que mais usa e comece com um brain dump inicial.',
  estimatedMinutes: 3,
  steps: [
    {
      title: 'Tipos de nota preferidos',
      subtitle: 'Selecione os tipos de nota que mais usa',
      icon: 'category',
      fields: [
        {
          name: 'tipos_preferidos',
          label: 'Tipos de nota',
          type: 'multi-checkbox',
          required: true,
          minSelected: 1,
          multiOptions: [
            { value: 'ideia', label: 'Ideias', icon: 'lightbulb' },
            { value: 'reflexao', label: 'Reflexoes', icon: 'psychology' },
            { value: 'tarefa', label: 'Tarefas', icon: 'task_alt' },
            { value: 'referencia', label: 'Referencias', icon: 'bookmark' },
            { value: 'rascunho', label: 'Rascunhos', icon: 'draft' },
            { value: 'diario', label: 'Diario', icon: 'edit_calendar' },
            { value: 'pesquisa', label: 'Pesquisa', icon: 'search' },
            { value: 'reuniao', label: 'Reuniao', icon: 'groups' },
          ],
          columns: 2,
        },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', {
          key: 'notes_tipos_preferidos',
          value: allValues.tipos_preferidos,
        });
      },
    },
    {
      title: 'Brain dump inicial',
      subtitle: 'Comece registrando o que esta na sua cabeca',
      icon: 'edit_note',
      fields: [
        { name: 'title', label: 'Titulo', type: 'text', required: true, placeholder: 'Titulo da nota' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
          { value: 'ideia', label: 'Ideia' },
          { value: 'reflexao', label: 'Reflexao' },
          { value: 'tarefa', label: 'Tarefa' },
          { value: 'referencia', label: 'Referencia' },
          { value: 'rascunho', label: 'Rascunho' },
        ] },
        { name: 'content', label: 'Conteudo', type: 'textarea', placeholder: 'Escreva aqui...' },
      ],
      repeatable: {
        itemLabel: 'Nota',
        minItems: 0,
        maxItems: 10,
        addLabel: 'Adicionar outra nota',
      },
      async onStepComplete(allValues) {
        const { saveNotes, loadAll } = await import('../../data/repository');
        const { notes: existingNotes } = await loadAll();
        const items = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
        const ts = new Date().toISOString();

        const newNotes = items
          .filter(item => item.title)
          .map(item => ({
            id: crypto.randomUUID(),
            title: item.title as string,
            body: (item.content as string) || '',
            createdAt: ts,
            updatedAt: ts,
          }));

        await saveNotes([...existingNotes, ...newNotes]);
      },
    },
  ],

  getCompletionStats(allValues) {
    const tipos = (allValues.tipos_preferidos as string[]) || [];
    const notas = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
    return [
      { label: 'Tipos selecionados', value: tipos.length },
      { label: 'Notas criadas', value: notas.filter(n => n.title).length },
    ];
  },
};
