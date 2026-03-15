import type { JourneyConfig } from '../journeyTypes';
import { putFinanceEntry } from '../../data/repository';
import type { StoredFinanceEntry } from '../../data/models';

// ─── Helper: save to IndexedDB meta store ────────────────────────────────────

async function saveMeta(key: string, value: unknown): Promise<void> {
  const db = (await import('../../data/db')).getDb();
  const dbInstance = await db;
  await dbInstance.put('meta', { key, value });
}

// ─── Helper: categoria select options (reused across multiple journeys) ──────

const categoriaOptions = [
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentacao' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saude' },
  { value: 'educacao', label: 'Educacao' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'servicos', label: 'Servicos' },
  { value: 'outros', label: 'Outros' },
];

// ─── Helper: create and persist a finance entry ─────────────────────────────

async function createFinanceEntry(
  name: string,
  valor: number,
  tipo: 'entrada' | 'saida',
  categoria: string,
  recorrente: boolean,
  data?: string,
): Promise<void> {
  const now = new Date();
  const ts = now.toISOString();
  const entryDate = data || ts.slice(0, 10);

  const entry: StoredFinanceEntry = {
    id: crypto.randomUUID(),
    name,
    valor,
    tipo,
    categoria,
    data: entryDate,
    recorrente,
    createdAt: ts,
    updatedAt: ts,
  };
  await putFinanceEntry(entry);
}

// ─── 1. Overview Journey ─────────────────────────────────────────────────────

export const financeOverviewJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'overview',
  sectionTitle: 'Visao Geral',
  icon: 'payments',
  welcomeTitle: 'Vamos configurar sua visao geral financeira',
  welcomeSubtitle: 'Entender sua situacao financeira ajuda o Marco OS a exibir dashboards relevantes.',
  estimatedMinutes: 5,
  steps: [
    // Step 1: Categorias de gasto
    {
      title: 'Selecione seus gastos recorrentes',
      subtitle: 'Marque as categorias que fazem parte da sua rotina',
      icon: 'category',
      fields: [
        {
          name: 'categorias_ativas',
          label: 'Categorias',
          type: 'multi-checkbox',
          required: true,
          minSelected: 1,
          multiOptions: [
            { value: 'moradia', label: 'Moradia', icon: 'home' },
            { value: 'alimentacao', label: 'Alimentacao', icon: 'restaurant' },
            { value: 'transporte', label: 'Transporte', icon: 'directions_car' },
            { value: 'saude', label: 'Saude', icon: 'local_hospital' },
            { value: 'educacao', label: 'Educacao', icon: 'school' },
            { value: 'lazer', label: 'Lazer', icon: 'sports_esports' },
            { value: 'servicos', label: 'Servicos', icon: 'wifi' },
            { value: 'investimentos', label: 'Investimentos', icon: 'trending_up' },
            { value: 'pets', label: 'Pets', icon: 'pets' },
            { value: 'vestuario', label: 'Vestuario', icon: 'checkroom' },
          ],
          columns: 2,
        },
      ],
      async onStepComplete(allValues) {
        await saveMeta('finance_categorias_ativas', allValues.categorias_ativas);
      },
    },

    // Step 2: Baseline financeiro
    {
      title: 'Baseline financeiro',
      subtitle: 'Valores aproximados -- nao precisa ser exato',
      icon: 'account_balance',
      fields: [
        {
          name: 'renda_mensal',
          label: 'Renda mensal',
          type: 'money',
          required: true,
          placeholder: 'Ex: 8.000',
          hint: 'Valor bruto, antes dos descontos',
        },
        {
          name: 'fonte_renda',
          label: 'Fonte de renda',
          type: 'select',
          required: true,
          options: [
            { value: 'clt', label: 'CLT' },
            { value: 'pj', label: 'PJ' },
            { value: 'freelance', label: 'Freelance' },
            { value: 'misto', label: 'Misto' },
            { value: 'empresario', label: 'Empresario' },
            { value: 'aposentado', label: 'Aposentado' },
            { value: 'outro', label: 'Outro' },
          ],
        },
        {
          name: 'patrimonio_faixa',
          label: 'Patrimonio estimado',
          type: 'select',
          options: [
            { value: 'ate-10k', label: 'Ate R$ 10k' },
            { value: '10k-50k', label: 'R$ 10k - R$ 50k' },
            { value: '50k-200k', label: 'R$ 50k - R$ 200k' },
            { value: '200k-500k', label: 'R$ 200k - R$ 500k' },
            { value: '500k-1m', label: 'R$ 500k - R$ 1M' },
            { value: 'acima-1m', label: 'Acima de R$ 1M' },
            { value: 'prefiro-nao-informar', label: 'Prefiro nao informar' },
          ],
          hint: 'Essa informacao ajuda a calibrar os dashboards',
        },
        {
          name: 'tem_dividas',
          label: 'Possui dividas ativas?',
          type: 'toggle',
          defaultValue: false,
        },
        {
          name: 'valor_dividas',
          label: 'Total aproximado de dividas',
          type: 'money',
          placeholder: 'Total aproximado',
          condition: { field: 'tem_dividas', operator: 'eq', value: true },
        },
      ],
      async onStepComplete(allValues) {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        // Create income entry
        if (allValues.renda_mensal) {
          await createFinanceEntry(
            'Renda mensal',
            allValues.renda_mensal as number,
            'entrada',
            'receita-projeto',
            true,
            firstDay,
          );
        }

        // Save meta keys
        await saveMeta('finance_patrimonio_faixa', allValues.patrimonio_faixa);
        await saveMeta('finance_fonte_renda', allValues.fonte_renda);
        if (allValues.tem_dividas && allValues.valor_dividas) {
          await saveMeta('finance_valor_dividas', allValues.valor_dividas);
        }
      },
    },

    // Step 3: Meta financeira
    {
      title: 'Qual e sua meta financeira?',
      subtitle: 'Ter uma meta clara aumenta 3x a chance de alcancar',
      icon: 'flag',
      fields: [
        {
          name: 'meta_tipo',
          label: 'Tipo de meta',
          type: 'select',
          required: true,
          options: [
            { value: 'reserva', label: 'Criar reserva de emergencia' },
            { value: 'quitar', label: 'Quitar dividas' },
            { value: 'investir', label: 'Juntar para investir' },
            { value: 'economizar', label: 'Economizar X por mes' },
            { value: 'patrimonio', label: 'Atingir patrimonio de X' },
            { value: 'outra', label: 'Outra' },
          ],
        },
        {
          name: 'meta_valor',
          label: 'Valor da meta',
          type: 'money',
          placeholder: 'Valor da meta',
          condition: { field: 'meta_tipo', operator: 'neq', value: 'outra' },
        },
        {
          name: 'meta_descricao',
          label: 'Descreva sua meta',
          type: 'text',
          placeholder: 'Descreva sua meta',
          condition: { field: 'meta_tipo', operator: 'eq', value: 'outra' },
        },
        {
          name: 'meta_prazo',
          label: 'Prazo',
          type: 'select',
          options: [
            { value: '3m', label: '3 meses' },
            { value: '6m', label: '6 meses' },
            { value: '12m', label: '12 meses' },
            { value: '24m', label: '24 meses' },
          ],
          defaultValue: '12m',
        },
      ],
      async onStepComplete(allValues) {
        await saveMeta('finance_meta', {
          tipo: allValues.meta_tipo,
          valor: allValues.meta_valor,
          descricao: allValues.meta_descricao,
          prazo: allValues.meta_prazo,
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    const categorias = (allValues.categorias_ativas as string[]) || [];
    return [
      { label: 'Categorias', value: categorias.length },
      {
        label: 'Renda mensal',
        value: allValues.renda_mensal
          ? `R$ ${(allValues.renda_mensal as number).toLocaleString('pt-BR')}`
          : '-',
      },
      { label: 'Prazo da meta', value: (allValues.meta_prazo as string) || '-' },
    ];
  },
};

// ─── 2. Transactions Journey ─────────────────────────────────────────────────

export const financeTransactionsJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'transactions',
  sectionTitle: 'Lancamentos',
  icon: 'payments',
  welcomeTitle: 'Registre seus primeiros lancamentos',
  welcomeSubtitle: 'Adicione receitas e despesas para comecar a rastrear.',
  estimatedMinutes: 3,
  steps: [
    {
      title: 'Primeiro lancamento',
      subtitle: 'Registre receitas e despesas do seu dia a dia',
      icon: 'receipt_long',
      fields: [
        {
          name: 'name',
          label: 'Descricao',
          type: 'text',
          required: true,
          placeholder: 'Ex: Salario, Aluguel...',
        },
        {
          name: 'valor',
          label: 'Valor',
          type: 'money',
          required: true,
        },
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'select',
          required: true,
          options: [
            { value: 'saida', label: 'Saida (despesa)' },
            { value: 'entrada', label: 'Entrada (receita)' },
          ],
          defaultValue: 'saida',
        },
        {
          name: 'categoria',
          label: 'Categoria',
          type: 'select',
          options: [
            ...categoriaOptions,
            { value: 'receita-projeto', label: 'Receita de projeto' },
          ],
        },
        {
          name: 'data',
          label: 'Data',
          type: 'date',
          defaultValue: new Date().toISOString().slice(0, 10),
        },
        {
          name: 'recorrente',
          label: 'Lancamento recorrente?',
          type: 'toggle',
          defaultValue: false,
        },
      ],
      repeatable: {
        itemLabel: 'Lancamento',
        minItems: 1,
        maxItems: 5,
        addLabel: 'Adicionar outro lancamento',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];

        for (const item of items) {
          if (item.name && item.valor) {
            await createFinanceEntry(
              item.name as string,
              item.valor as number,
              (item.tipo as 'entrada' | 'saida') || 'saida',
              (item.categoria as string) || 'outros',
              (item.recorrente as boolean) || false,
              (item.data as string) || undefined,
            );
          }
        }
      },
    },
  ],

  getCompletionStats(allValues) {
    const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    const count = items.filter(i => i.name && i.valor).length;
    return [
      { label: 'Lancamentos', value: count },
    ];
  },
};

// ─── 3. Debts Journey ────────────────────────────────────────────────────────

export const financeDebtsJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'debts',
  sectionTitle: 'Dividas',
  icon: 'payments',
  welcomeTitle: 'Mapeie suas dividas',
  welcomeSubtitle: 'Registre dividas ativas para acompanhar o progresso de quitacao.',
  estimatedMinutes: 3,
  steps: [
    {
      title: 'Dividas ativas',
      subtitle: 'Liste todas as dividas que quer monitorar',
      icon: 'credit_card_off',
      fields: [
        {
          name: 'name',
          label: 'Nome da divida',
          type: 'text',
          required: true,
          placeholder: 'Ex: Financiamento, Cartao...',
        },
        {
          name: 'valor_total',
          label: 'Valor total',
          type: 'money',
          required: true,
        },
        {
          name: 'juros_mensal',
          label: 'Juros mensal (%)',
          type: 'number',
          placeholder: 'Taxa % ao mes',
        },
        {
          name: 'parcelas_restantes',
          label: 'Parcelas restantes',
          type: 'number',
          placeholder: 'Quantidade',
        },
        {
          name: 'prioridade',
          label: 'Prioridade',
          type: 'select',
          options: [
            { value: 'alta', label: 'Alta' },
            { value: 'media', label: 'Media' },
            { value: 'baixa', label: 'Baixa' },
          ],
          defaultValue: 'media',
        },
      ],
      repeatable: {
        itemLabel: 'Divida',
        minItems: 1,
        maxItems: 8,
        addLabel: 'Adicionar outra divida',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const debts = items
          .filter(item => item.name && item.valor_total)
          .map(item => ({
            name: item.name as string,
            valor_total: item.valor_total as number,
            juros_mensal: (item.juros_mensal as number) || 0,
            parcelas_restantes: (item.parcelas_restantes as number) || 0,
            prioridade: (item.prioridade as string) || 'media',
          }));
        await saveMeta('finance_debts', debts);
      },
    },
  ],

  getCompletionStats(allValues) {
    const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    const valid = items.filter(i => i.name && i.valor_total);
    const total = valid.reduce((sum, i) => sum + (Number(i.valor_total) || 0), 0);
    return [
      { label: 'Dividas', value: valid.length },
      {
        label: 'Valor total',
        value: total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : '-',
      },
    ];
  },
};

// ─── 4. Cashflow Journey ─────────────────────────────────────────────────────

export const financeCashflowJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'cashflow',
  sectionTitle: 'Fluxo de Caixa',
  icon: 'payments',
  welcomeTitle: 'Configure seu fluxo de caixa',
  welcomeSubtitle: 'Gastos fixos e fontes de renda para projetar seu cashflow.',
  estimatedMinutes: 4,
  steps: [
    // Step 1: Gastos fixos
    {
      title: 'Gastos fixos mensais',
      subtitle: 'Adicione os gastos que se repetem todo mes',
      icon: 'receipt_long',
      fields: [
        {
          name: 'name',
          label: 'Descricao',
          type: 'text',
          required: true,
          placeholder: 'Ex: Aluguel, Netflix, Academia...',
        },
        {
          name: 'valor',
          label: 'Valor',
          type: 'money',
          required: true,
        },
        {
          name: 'categoria',
          label: 'Categoria',
          type: 'select',
          options: categoriaOptions,
        },
      ],
      repeatable: {
        itemLabel: 'Gasto fixo',
        minItems: 1,
        maxItems: 10,
        addLabel: 'Adicionar outro gasto',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        for (const item of items) {
          if (item.name && item.valor) {
            await createFinanceEntry(
              item.name as string,
              item.valor as number,
              'saida',
              (item.categoria as string) || 'outros',
              true,
              firstDay,
            );
          }
        }
      },
    },

    // Step 2: Fontes de renda
    {
      title: 'Fontes de renda',
      subtitle: 'De onde vem seu dinheiro?',
      icon: 'account_balance_wallet',
      fields: [
        {
          name: 'name',
          label: 'Descricao',
          type: 'text',
          required: true,
          placeholder: 'Ex: Salario, Freelance...',
        },
        {
          name: 'valor',
          label: 'Valor',
          type: 'money',
          required: true,
        },
        {
          name: 'frequencia',
          label: 'Frequencia',
          type: 'select',
          options: [
            { value: 'mensal', label: 'Mensal' },
            { value: 'quinzenal', label: 'Quinzenal' },
            { value: 'semanal', label: 'Semanal' },
            { value: 'avulso', label: 'Avulso' },
          ],
          defaultValue: 'mensal',
        },
      ],
      repeatable: {
        itemLabel: 'Fonte de renda',
        minItems: 1,
        maxItems: 5,
        addLabel: 'Adicionar outra fonte',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        for (const item of items) {
          if (item.name && item.valor) {
            await createFinanceEntry(
              item.name as string,
              item.valor as number,
              'entrada',
              'receita-projeto',
              true,
              firstDay,
            );
          }
        }
      },
    },
  ],

  getCompletionStats(allValues) {
    const gastos = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    const fontes = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
    return [
      { label: 'Gastos fixos', value: gastos.filter(g => g.name).length },
      { label: 'Fontes de renda', value: fontes.filter(f => f.name).length },
    ];
  },
};

// ─── 5. Investments Journey ──────────────────────────────────────────────────

export const financeInvestmentsJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'investments',
  sectionTitle: 'Investimentos',
  icon: 'payments',
  welcomeTitle: 'Configure seus investimentos',
  welcomeSubtitle: 'Defina seu perfil e registre seus ativos.',
  estimatedMinutes: 3,
  steps: [
    // Step 1: Perfil de investidor
    {
      title: 'Perfil de investidor',
      subtitle: 'Qual o seu apetite para risco?',
      icon: 'analytics',
      fields: [
        {
          name: 'perfil_risco',
          label: 'Perfil de risco',
          type: 'icon-select',
          required: true,
          iconOptions: [
            { value: 'conservador', icon: 'shield', label: 'Conservador' },
            { value: 'moderado', icon: 'balance', label: 'Moderado' },
            { value: 'arrojado', icon: 'trending_up', label: 'Arrojado' },
            { value: 'agressivo', icon: 'rocket_launch', label: 'Agressivo' },
          ],
        },
        {
          name: 'experiencia',
          label: 'Experiencia com investimentos',
          type: 'select',
          options: [
            { value: 'iniciante', label: 'Iniciante' },
            { value: 'intermediario', label: 'Intermediario' },
            { value: 'avancado', label: 'Avancado' },
          ],
          defaultValue: 'iniciante',
        },
      ],
      async onStepComplete(allValues) {
        await saveMeta('finance_perfil_investidor', {
          perfil_risco: allValues.perfil_risco,
          experiencia: allValues.experiencia,
        });
      },
    },

    // Step 2: Ativos atuais
    {
      title: 'Ativos atuais',
      subtitle: 'Registre seus investimentos -- pode pular se preferir',
      icon: 'account_balance',
      fields: [
        {
          name: 'name',
          label: 'Nome do ativo',
          type: 'text',
          required: true,
          placeholder: 'Ex: Tesouro Selic, IVVB11...',
        },
        {
          name: 'valor',
          label: 'Valor investido',
          type: 'money',
          required: true,
        },
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'select',
          options: [
            { value: 'renda-fixa', label: 'Renda Fixa' },
            { value: 'acoes', label: 'Acoes' },
            { value: 'fii', label: 'FII' },
            { value: 'etf', label: 'ETF' },
            { value: 'previdencia', label: 'Previdencia' },
            { value: 'outro', label: 'Outro' },
          ],
        },
      ],
      repeatable: {
        itemLabel: 'Ativo',
        minItems: 0,
        maxItems: 10,
        addLabel: 'Adicionar outro ativo',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
        const ativos = items
          .filter(item => item.name && item.valor)
          .map(item => ({
            name: item.name as string,
            valor: item.valor as number,
            tipo: (item.tipo as string) || 'outro',
          }));
        await saveMeta('finance_investments', ativos);
      },
    },
  ],

  getCompletionStats(allValues) {
    const items = (allValues['__repeatable_1'] as Record<string, unknown>[]) || [];
    const valid = items.filter(i => i.name && i.valor);
    const total = valid.reduce((sum, i) => sum + (Number(i.valor) || 0), 0);
    return [
      { label: 'Perfil', value: (allValues.perfil_risco as string) || '-' },
      { label: 'Ativos', value: valid.length },
      {
        label: 'Valor total',
        value: total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : '-',
      },
    ];
  },
};

// ─── 6. Crypto Journey ───────────────────────────────────────────────────────

export const financeCryptoJourney: JourneyConfig = {
  viewId: 'finance',
  tabId: 'crypto',
  sectionTitle: 'Crypto',
  icon: 'payments',
  welcomeTitle: 'Configure seu portfolio cripto',
  welcomeSubtitle: 'Registre suas posicoes e estrategia.',
  estimatedMinutes: 3,
  steps: [
    // Step 1: Moedas
    {
      title: 'Suas moedas',
      subtitle: 'Registre os tokens que voce possui',
      icon: 'currency_bitcoin',
      fields: [
        {
          name: 'token',
          label: 'Token',
          type: 'text',
          required: true,
          placeholder: 'Ex: BTC, ETH, SOL...',
        },
        {
          name: 'quantidade',
          label: 'Quantidade',
          type: 'number',
          required: true,
          placeholder: 'Quantidade',
        },
        {
          name: 'preco_medio',
          label: 'Preco medio de compra',
          type: 'money',
          placeholder: 'Preco medio de compra',
        },
      ],
      repeatable: {
        itemLabel: 'Moeda',
        minItems: 1,
        maxItems: 10,
        addLabel: 'Adicionar outra moeda',
      },
      async onStepComplete(allValues) {
        const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
        const portfolio = items
          .filter(item => item.token && item.quantidade)
          .map(item => ({
            token: item.token as string,
            quantidade: item.quantidade as number,
            preco_medio: (item.preco_medio as number) || 0,
          }));
        await saveMeta('finance_crypto_portfolio', portfolio);
      },
    },

    // Step 2: Estrategia
    {
      title: 'Estrategia',
      subtitle: 'Como voce opera no mercado cripto?',
      icon: 'strategy',
      fields: [
        {
          name: 'estrategia',
          label: 'Estrategia principal',
          type: 'icon-select',
          required: true,
          iconOptions: [
            { value: 'hodl', icon: 'lock', label: 'HODL' },
            { value: 'trading', icon: 'swap_horiz', label: 'Trading' },
            { value: 'staking', icon: 'account_balance', label: 'Staking' },
            { value: 'dca', icon: 'calendar_month', label: 'DCA' },
          ],
        },
        {
          name: 'usa_defi',
          label: 'Usa protocolos DeFi?',
          type: 'toggle',
          defaultValue: false,
        },
        {
          name: 'exchange_principal',
          label: 'Exchange principal',
          type: 'select',
          options: [
            { value: 'binance', label: 'Binance' },
            { value: 'coinbase', label: 'Coinbase' },
            { value: 'bybit', label: 'Bybit' },
            { value: 'kraken', label: 'Kraken' },
            { value: 'mercado-bitcoin', label: 'Mercado Bitcoin' },
            { value: 'outra', label: 'Outra' },
          ],
        },
      ],
      async onStepComplete(allValues) {
        await saveMeta('finance_crypto_strategy', {
          estrategia: allValues.estrategia,
          usa_defi: allValues.usa_defi,
          exchange_principal: allValues.exchange_principal,
        });
      },
    },
  ],

  getCompletionStats(allValues) {
    const items = (allValues['__repeatable_0'] as Record<string, unknown>[]) || [];
    const count = items.filter(i => i.token && i.quantidade).length;
    return [
      { label: 'Moedas', value: count },
      { label: 'Estrategia', value: (allValues.estrategia as string) || '-' },
    ];
  },
};
