import type { JourneyConfig } from '../journeyTypes';
import { putHealthEntry } from '../../data/repository';
import type { StoredHealthEntry } from '../../data/models';

// ─── Health Daily Journey (tabId: 'daily') ─────────────────────────────────

export const healthDailyJourney: JourneyConfig = {
  viewId: 'health',
  tabId: 'daily',
  sectionTitle: 'Saude',
  icon: 'monitor_heart',
  welcomeTitle: 'Configure seu registro diario',
  welcomeSubtitle: 'Defina suas medidas basicas e habitos a monitorar.',
  estimatedMinutes: 3,
  steps: [
    // Step 1: Medidas basicas
    {
      title: 'Medidas basicas',
      icon: 'straighten',
      fields: [
        {
          name: 'peso_atual',
          label: 'Peso atual',
          type: 'range',
          min: 40,
          max: 200,
          step: 0.5,
          unit: 'kg',
          defaultValue: 75,
          required: true,
        },
        {
          name: 'peso_meta',
          label: 'Peso meta',
          type: 'range',
          min: 40,
          max: 200,
          step: 0.5,
          unit: 'kg',
          defaultValue: 75,
        },
        {
          name: 'altura',
          label: 'Altura',
          type: 'range',
          min: 140,
          max: 220,
          step: 1,
          unit: 'cm',
          defaultValue: 175,
          required: true,
        },
      ],
      async onStepComplete(allValues) {
        const ts = new Date().toISOString();
        const today = ts.slice(0, 10);

        // Create weight entry
        if (allValues.peso_atual) {
          const entry: StoredHealthEntry = {
            id: crypto.randomUUID(),
            name: 'Peso inicial',
            tipo: 'peso',
            valor: allValues.peso_atual as number,
            data: today,
            createdAt: ts,
            updatedAt: ts,
          };
          await putHealthEntry(entry);
        }

        // Save meta keys
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', { key: 'health_peso_meta', value: allValues.peso_meta });
        await dbInstance.put('meta', { key: 'health_altura', value: allValues.altura });
      },
    },

    // Step 2: Habitos a monitorar
    {
      title: 'Habitos a monitorar',
      icon: 'task_alt',
      fields: [
        {
          name: 'habitos',
          label: 'Habitos',
          type: 'multi-checkbox',
          required: true,
          minSelected: 1,
          maxSelected: 8,
          columns: 2,
          multiOptions: [
            { value: 'meditacao', label: 'Meditacao', icon: 'self_improvement' },
            { value: 'hidratacao', label: 'Hidratacao', icon: 'water_drop' },
            { value: 'exercicio', label: 'Exercicio', icon: 'fitness_center' },
            { value: 'leitura', label: 'Leitura', icon: 'menu_book' },
            { value: 'zero-acucar', label: 'Zero Acucar', icon: 'no_food' },
            { value: 'sono-cedo', label: 'Sono Cedo', icon: 'bedtime' },
            { value: 'journaling', label: 'Journaling', icon: 'edit_note' },
            { value: 'breathwork', label: 'Breathwork', icon: 'air' },
            { value: 'alongamento', label: 'Alongamento', icon: 'accessibility_new' },
            { value: 'suplementos', label: 'Suplementos', icon: 'medication' },
            { value: 'skin-care', label: 'Skin Care', icon: 'face' },
            { value: 'gratidao', label: 'Gratidao', icon: 'volunteer_activism' },
          ],
        },
      ],
      async onStepComplete(allValues) {
        // Save habits to meta
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', { key: 'health_habitos', value: allValues.habitos });

        // Create one health entry per habit
        const habitos = (allValues.habitos as string[]) || [];
        const ts = new Date().toISOString();
        const today = ts.slice(0, 10);

        for (const habito of habitos) {
          const entry: StoredHealthEntry = {
            id: crypto.randomUUID(),
            name: habito,
            tipo: 'habito',
            data: today,
            createdAt: ts,
            updatedAt: ts,
          };
          await putHealthEntry(entry);
        }
      },
    },
  ],

  getCompletionStats(allValues) {
    const habitos = (allValues.habitos as string[]) || [];
    return [
      { label: 'Peso atual', value: allValues.peso_atual ? `${allValues.peso_atual} kg` : '-' },
      { label: 'Habitos', value: habitos.length },
    ];
  },
};

// ─── Health Trends Journey (tabId: 'trends') ───────────────────────────────

export const healthTrendsJourney: JourneyConfig = {
  viewId: 'health',
  tabId: 'trends',
  sectionTitle: 'Saude',
  icon: 'monitor_heart',
  welcomeTitle: 'Configure suas tendencias',
  welcomeSubtitle: 'Defina sua rotina de treino e sono para insights personalizados.',
  estimatedMinutes: 3,
  steps: [
    // Step 1: Rotina de treino
    {
      title: 'Rotina de treino',
      icon: 'fitness_center',
      fields: [
        {
          name: 'treino_frequencia',
          label: 'Frequencia semanal',
          type: 'icon-select',
          required: true,
          iconOptions: [
            { value: 'sedentario', icon: 'hotel', label: 'Sedentario' },
            { value: '1-2x', icon: 'directions_walk', label: '1-2x' },
            { value: '3-4x', icon: 'directions_run', label: '3-4x' },
            { value: '5-6x', icon: 'fitness_center', label: '5-6x' },
            { value: 'diario', icon: 'local_fire_department', label: 'Todo dia' },
          ],
        },
        {
          name: 'treino_tipos',
          label: 'Tipos de treino',
          type: 'multi-checkbox',
          minSelected: 1,
          columns: 2,
          multiOptions: [
            { value: 'musculacao', label: 'Musculacao', icon: 'fitness_center' },
            { value: 'cardio', label: 'Cardio', icon: 'directions_run' },
            { value: 'funcional', label: 'Funcional', icon: 'sports_gymnastics' },
            { value: 'yoga', label: 'Yoga', icon: 'self_improvement' },
            { value: 'luta', label: 'Luta', icon: 'sports_martial_arts' },
            { value: 'natacao', label: 'Natacao', icon: 'pool' },
            { value: 'outro', label: 'Outro', icon: 'sports' },
          ],
        },
        {
          name: 'treino_duracao',
          label: 'Duracao media',
          type: 'select',
          defaultValue: '60',
          options: [
            { value: '30', label: '30 min' },
            { value: '45', label: '45 min' },
            { value: '60', label: '1 hora' },
            { value: '90', label: '1h30' },
            { value: '120', label: '2+ horas' },
          ],
        },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', { key: 'health_treino_frequencia', value: allValues.treino_frequencia });
        await dbInstance.put('meta', { key: 'health_treino_tipos', value: allValues.treino_tipos });
        await dbInstance.put('meta', { key: 'health_treino_duracao', value: allValues.treino_duracao });
      },
    },

    // Step 2: Sono e recuperacao
    {
      title: 'Sono e recuperacao',
      icon: 'bedtime',
      fields: [
        {
          name: 'horas_sono',
          label: 'Horas de sono por noite',
          type: 'range',
          min: 3,
          max: 12,
          step: 0.5,
          unit: 'h',
          defaultValue: 7,
          required: true,
        },
        {
          name: 'sono_qualidade',
          label: 'Qualidade do sono',
          type: 'icon-select',
          iconOptions: [
            { value: 'otimo', icon: 'nights_stay', label: 'Otimo' },
            { value: 'bom', icon: 'bedtime', label: 'Bom' },
            { value: 'regular', icon: 'snooze', label: 'Regular' },
            { value: 'ruim', icon: 'running_with_errors', label: 'Ruim' },
          ],
        },
        {
          name: 'horario_dormir',
          label: 'Horario habitual de dormir',
          type: 'select',
          options: [
            { value: '21:00', label: 'Antes das 21h' },
            { value: '22:00', label: '21h - 22h' },
            { value: '23:00', label: '22h - 23h' },
            { value: '00:00', label: '23h - 00h' },
            { value: '01:00', label: 'Apos 00h' },
          ],
        },
      ],
      async onStepComplete(allValues) {
        const ts = new Date().toISOString();
        const today = ts.slice(0, 10);

        // Create sleep entry
        if (allValues.horas_sono) {
          const entry: StoredHealthEntry = {
            id: crypto.randomUUID(),
            name: 'Sono registrado',
            tipo: 'sono',
            valor: allValues.horas_sono as number,
            data: today,
            createdAt: ts,
            updatedAt: ts,
          };
          await putHealthEntry(entry);
        }

        // Save meta keys
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', { key: 'health_sono_qualidade', value: allValues.sono_qualidade });
        await dbInstance.put('meta', { key: 'health_horario_dormir', value: allValues.horario_dormir });
      },
    },
  ],

  getCompletionStats(allValues) {
    const treinos = (allValues.treino_tipos as string[]) || [];
    return [
      { label: 'Tipos de treino', value: treinos.length },
      { label: 'Sono', value: allValues.horas_sono ? `${allValues.horas_sono}h` : '-' },
      { label: 'Frequencia', value: (allValues.treino_frequencia as string) || '-' },
    ];
  },
};
