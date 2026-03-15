import type { JourneyConfig } from '../journeyTypes';
import { putContact } from '../../data/repository';
import type { StoredContact } from '../../data/models';

export const crmJourneyConfig: JourneyConfig = {
  viewId: 'crm',
  sectionTitle: 'Network',
  icon: 'contacts',
  welcomeTitle: 'Vamos configurar sua rede',
  welcomeSubtitle: 'Adicione seus contatos mais importantes para manter o relacionamento ativo.',
  estimatedMinutes: 3,
  steps: [
    {
      title: 'Seus contatos mais importantes',
      subtitle: 'Adicione as pessoas chave da sua rede',
      icon: 'person_add',
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Nome completo' },
        { name: 'role', label: 'Cargo / Funcao', type: 'text', placeholder: 'Ex: CTO, Designer...' },
        { name: 'company', label: 'Empresa', type: 'text', placeholder: 'Empresa' },
        { name: 'email', label: 'Email', type: 'text', placeholder: 'email@exemplo.com' },
        { name: 'phone', label: 'Telefone', type: 'text', placeholder: '+55 11 99999-9999' },
      ],
      repeatable: {
        itemLabel: 'Contato',
        minItems: 1,
        maxItems: 5,
        addLabel: 'Adicionar outro contato',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const ts = new Date().toISOString();
        const today = ts.slice(0, 10);

        for (const item of items) {
          if (item.name) {
            const contact: StoredContact = {
              id: crypto.randomUUID(),
              name: item.name as string,
              role: (item.role as string) || '',
              company: (item.company as string) || '',
              email: (item.email as string) || '',
              phone: (item.phone as string) || '',
              status: 'warm',
              tags: [],
              lastContact: today,
              createdAt: ts,
              updatedAt: ts,
            };
            await putContact(contact);
          }
        }
      },
    },
    {
      title: 'Contexto de relacionamento',
      subtitle: 'Detalhes opcionais sobre seus contatos',
      icon: 'handshake',
      fields: [
        {
          name: 'forca_relacao',
          label: 'Forca da relacao',
          type: 'icon-select',
          iconOptions: [
            { value: 'hot', icon: 'local_fire_department', label: 'Forte' },
            { value: 'warm', icon: 'wb_sunny', label: 'Morna' },
            { value: 'cold', icon: 'ac_unit', label: 'Fria' },
          ],
        },
        {
          name: 'canal_preferido',
          label: 'Canal preferido',
          type: 'select',
          options: [
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'Email' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'presencial', label: 'Presencial' },
            { value: 'outro', label: 'Outro' },
          ],
        },
        {
          name: 'como_conheceu',
          label: 'Como conheceu',
          type: 'select',
          options: [
            { value: 'trabalho', label: 'Trabalho' },
            { value: 'evento', label: 'Evento' },
            { value: 'indicacao', label: 'Indicacao' },
            { value: 'rede-social', label: 'Rede social' },
            { value: 'faculdade', label: 'Faculdade' },
            { value: 'outro', label: 'Outro' },
          ],
        },
        {
          name: 'proxima_acao',
          label: 'Proxima acao',
          type: 'text',
          placeholder: 'Ex: Marcar cafe, Enviar material...',
        },
      ],
      async onStepComplete(allValues) {
        const db = (await import('../../data/db')).getDb();
        const dbInstance = await db;
        await dbInstance.put('meta', {
          key: 'crm_context',
          value: {
            forca: allValues.forca_relacao,
            canal: allValues.canal_preferido,
            como: allValues.como_conheceu,
            acao: allValues.proxima_acao,
          },
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    const contatos = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    return [
      { label: 'Contatos', value: contatos.filter(c => c.name).length },
      { label: 'Canal preferido', value: (allValues.canal_preferido as string) || '-' },
    ];
  },
};
