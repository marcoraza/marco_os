import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Badge, Card, SectionLabel, StatusDot, EmptyState, showToast } from './ui';
import type { StoredContact } from '../data/models';
import { loadContacts, putContact, deleteContact as deleteContactDb, bootstrapContactsIfEmpty } from '../data/repository';

/* ─── Seed data (migrated from old hardcoded array) ─────────────────────────── */
const SEED_CONTACTS: StoredContact[] = [
  {
    id: 'seed-1',
    name: 'Juliana Costa',
    role: 'VP de Marketing',
    company: 'Sony Music',
    email: 'juliana.costa@sonymusic.com',
    phone: '+55 11 99887-7665',
    image: 'https://i.pravatar.cc/150?u=1',
    status: 'warm',
    tags: ['Música', 'Parceiro'],
    lastContact: 'Há 45 dias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Roberto Almeida',
    role: 'CTO',
    company: 'FinTech Solutions',
    email: 'roberto@fintech.io',
    phone: '+55 11 98765-4321',
    image: 'https://i.pravatar.cc/150?u=2',
    status: 'hot',
    tags: ['Tech', 'Cliente'],
    lastContact: 'Há 2 dias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Marcos Pereira',
    role: 'Angel Investor',
    company: 'SeedLatam',
    email: 'marcos@seedlatam.vc',
    phone: '+55 21 99999-8888',
    initials: 'MP',
    status: 'warm',
    tags: ['Investidor'],
    lastContact: 'Há 60 dias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    name: 'Carla Mendez',
    role: 'Art Director',
    company: 'Freelance',
    email: 'carla.art@gmail.com',
    phone: '+55 41 91234-5678',
    image: 'https://i.pravatar.cc/150?u=5',
    status: 'cold',
    tags: ['Design', 'Prospect'],
    lastContact: 'Há 15 dias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ─── Empty form state ──────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '',
  role: '',
  company: '',
  email: '',
  phone: '',
  status: 'warm' as StoredContact['status'],
  tags: '',
  image: '',
  notes: '',
};

const CRM: React.FC = () => {
  const [contacts, setContacts] = useState<StoredContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<StoredContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('Todos');

  /* Modal state */
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<StoredContact | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* Confirm delete */
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ─── Load from IndexedDB on mount ──────────────────────────────────────── */
  const refresh = useCallback(async () => {
    await bootstrapContactsIfEmpty(SEED_CONTACTS);
    const all = await loadContacts();
    setContacts(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ─── Derived ───────────────────────────────────────────────────────────── */
  const allTags = ['Todos', ...Array.from(new Set(contacts.flatMap(c => c.tags)))];

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
    const matchesTag = activeTag === 'Todos' || c.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  /* ─── Helpers ───────────────────────────────────────────────────────────── */
  function generateInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /* ─── Open modal (create / edit) ────────────────────────────────────────── */
  function openCreateModal() {
    setEditingContact(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEditModal(contact: StoredContact) {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      role: contact.role,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
      tags: contact.tags.join(', '),
      image: contact.image || '',
      notes: contact.notes || '',
    });
    setShowModal(true);
  }

  /* ─── Save (create or update) ───────────────────────────────────────────── */
  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Nome é obrigatório.');
      return;
    }

    const now = new Date().toISOString();
    const tags = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingContact) {
      // Update
      const updated: StoredContact = {
        ...editingContact,
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
        tags,
        image: form.image.trim() || undefined,
        initials: form.image.trim() ? undefined : generateInitials(form.name.trim()),
        notes: form.notes.trim() || undefined,
        updatedAt: now,
      };
      await putContact(updated);
      showToast('Contato atualizado com sucesso.');
      // Update selected contact if it was the one being edited
      if (selectedContact?.id === updated.id) {
        setSelectedContact(updated);
      }
    } else {
      // Create
      const newContact: StoredContact = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
        tags,
        image: form.image.trim() || undefined,
        initials: form.image.trim() ? undefined : generateInitials(form.name.trim()),
        lastContact: 'Agora',
        notes: form.notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      await putContact(newContact);
      showToast('Contato criado com sucesso.');
    }

    setShowModal(false);
    await refresh();
  }

  /* ─── Delete ────────────────────────────────────────────────────────────── */
  async function handleDelete(id: string) {
    await deleteContactDb(id);
    showToast('Contato excluído.');
    setConfirmDeleteId(null);
    if (selectedContact?.id === id) {
      setSelectedContact(null);
    }
    await refresh();
  }

  /* ─── Form field updater ────────────────────────────────────────────────── */
  function updateField(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 flex-1 w-full overflow-y-auto">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border-panel">
          <div>
            <h1 className="text-lg font-black text-accent-blue uppercase tracking-tight">INTELIGÊNCIA DE REDE</h1>
            <p className="text-xs text-text-secondary mt-1">Gerencie conexões estratégicas e mantenha sua rede ativa.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white text-xs font-bold uppercase rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Icon name="person_add" size="sm" />
              Novo Contato
            </button>
            <div className="text-right">
              <span className="text-xl font-bold text-text-primary">{contacts.length}</span>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-secondary">Contatos Totais</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, empresa ou tag..."
              className="w-full bg-header-bg border border-border-panel rounded-md py-2 pl-9 pr-4 text-base md:text-xs text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[9px] font-bold text-text-secondary uppercase self-center mr-2 whitespace-nowrap tracking-[0.1em]">Filtros:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-sm whitespace-nowrap transition-colors ${
                  activeTag === tag ? 'bg-accent-blue text-white' : 'bg-border-panel hover:bg-surface-hover text-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">

            {filteredContacts.length === 0 && (
              <EmptyState
                icon="person_search"
                title="Nenhum contato encontrado"
                description="Tente ajustar os filtros ou o termo de busca."
              />
            )}
            {filteredContacts.map(contact => (
              <Card
                key={contact.id}
                interactive
                onClick={() => setSelectedContact(contact)}
                className={`p-4 md:p-5 relative overflow-hidden group ${
                  contact.status === 'warm' && contact.lastContact.includes('45') ? 'border-l-4 border-l-accent-red rounded-l-none' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="relative">
                      {contact.image ? (
                        <div className={`w-12 h-12 rounded-full p-0.5 ${
                          contact.status === 'warm' ? 'bg-gradient-to-tr from-accent-orange to-accent-red' :
                          contact.status === 'hot' ? 'bg-gradient-to-tr from-accent-blue to-cyan-500' :
                          'bg-gradient-to-tr from-surface-hover to-border-panel'
                        }`}>
                          <img src={contact.image} alt="Profile" className="w-full h-full rounded-full border-2 border-surface object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-border-panel flex items-center justify-center text-text-secondary text-sm font-bold border border-border-panel">
                          {contact.initials || generateInitials(contact.name)}
                        </div>
                      )}

                      <div className="absolute bottom-0 right-0">
                        {contact.status === 'hot' && <StatusDot color="mint" size="md" className="border-2 border-surface" />}
                        {contact.status === 'warm' && <StatusDot color="orange" size="md" className="border-2 border-surface" />}
                        {contact.status === 'cold' && <div className="w-3 h-3 border-2 border-surface rounded-full bg-text-secondary"></div>}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors">{contact.name}</h3>
                      <p className="text-xs text-text-secondary">{contact.role} @ {contact.company}</p>
                      <div className="mt-2 flex gap-2">
                        {contact.tags.map(tag => (
                          <Badge key={tag} variant="neutral">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-text-secondary uppercase font-black mb-1 tracking-[0.1em]">ÚLTIMO CONTATO</p>
                    {contact.lastContact.includes('45') || contact.lastContact.includes('60') ? (
                      <div className="flex items-center gap-1 text-accent-red bg-accent-red/10 px-2 py-1 rounded-sm">
                        <Icon name="warning" size="xs" />
                        <span className="text-[10px] font-bold">{contact.lastContact}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-primary font-medium">{contact.lastContact}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}

          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Reconnect Queue */}
            <Card className="overflow-hidden shadow-lg">
              <div className="p-4 bg-header-bg border-b border-border-panel flex justify-between items-center">
                <SectionLabel className="text-brand-mint" icon="bolt">
                  Fila de RECONEXÃO
                </SectionLabel>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { name: 'André Luiz', time: '3 meses', img: 'https://i.pravatar.cc/150?u=3' },
                  { name: 'Sarah Jones', time: '45 dias', img: 'https://i.pravatar.cc/150?u=4' },
                  { name: 'Ricardo M.', time: '60 dias', initials: 'RM' },
                ].map((contact, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      {contact.img ? (
                        <img src={contact.img} className="w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition-all" alt={contact.name} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-border-panel flex items-center justify-center text-[10px] font-bold text-text-secondary">{contact.initials}</div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-text-primary">{contact.name}</p>
                        <p className="text-[9px] text-accent-red">Inativo: {contact.time}</p>
                      </div>
                    </div>
                    {/* Enhanced touch target for mobile */}
                    <button className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-border-panel hover:bg-accent-blue hover:text-text-primary text-text-secondary flex items-center justify-center transition-colors">
                      <Icon name="send" size="sm" />
                    </button>
                  </div>
                ))}
                <button className="w-full py-2 mt-2 border border-border-panel rounded-sm text-[10px] font-bold text-text-secondary uppercase hover:text-text-primary hover:border-text-secondary transition-colors">
                  Ver Fila Completa
                </button>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-accent-blue/10 border border-accent-blue/20 p-4 rounded-md text-center">
                <h4 className="text-xl font-black text-accent-blue">84%</h4>
                <p className="text-[9px] font-black uppercase text-text-secondary mt-1 tracking-[0.1em]">SAÚDE DA REDE</p>
              </div>
              <Card className="p-4 text-center">
                <h4 className="text-xl font-black text-text-primary">12</h4>
                <p className="text-[9px] font-black uppercase text-text-secondary mt-1 tracking-[0.1em]">Novos / Semana</p>
              </Card>
            </div>

            {/* Promo */}
            <div className="bg-bg-base border border-border-panel rounded-md p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-blue/20 rounded-full blur-3xl"></div>
              <h4 className="relative z-10 text-sm font-bold text-text-primary mb-2">Expanda sua rede</h4>
              <p className="relative z-10 text-xs text-text-secondary mb-4 leading-relaxed">Conecte seu LinkedIn para importar contatos automaticamente.</p>
              <button className="relative z-10 text-xs font-bold text-accent-blue flex items-center gap-1 hover:text-text-primary transition-colors">
                CONECTAR AGORA <Icon name="arrow_forward" size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Overlay - Fixed on mobile, Absolute on desktop */}
      {selectedContact && (
        <div className="fixed inset-0 z-[60] md:absolute md:z-50 md:bg-black/60 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-surface shadow-2xl border-l border-border-panel flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-panel bg-surface/95 backdrop-blur z-10">
              <button
                onClick={() => setSelectedContact(null)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
              >
                <Icon name="arrow_back" size="md" />
                <span>Voltar</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedContact)}
                  className="p-2 text-text-secondary hover:text-accent-blue rounded-full hover:bg-border-panel transition-colors"
                  title="Editar contato"
                >
                  <Icon name="edit" size="lg" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(selectedContact.id)}
                  className="p-2 text-text-secondary hover:text-accent-red rounded-full hover:bg-border-panel transition-colors"
                  title="Excluir contato"
                >
                  <Icon name="delete" size="lg" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pb-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    {selectedContact.image ? (
                        <img src={selectedContact.image} alt={selectedContact.name} className="w-20 h-20 rounded-full object-cover border-2 border-border-panel shadow-sm" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-border-panel flex items-center justify-center text-text-secondary text-2xl font-bold border-2 border-border-panel">{selectedContact.initials || generateInitials(selectedContact.name)}</div>
                    )}
                    <div className="absolute bottom-0 right-0">
                        {selectedContact.status === 'hot' && <StatusDot color="mint" className="w-5 h-5 border-2 border-surface" />}
                        {selectedContact.status === 'warm' && <StatusDot color="orange" className="w-5 h-5 border-2 border-surface" />}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-lg font-bold text-text-primary leading-tight">{selectedContact.name}</h2>
                    <p className="text-text-secondary font-medium text-sm">{selectedContact.role} @ {selectedContact.company}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedContact.tags.map(tag => (
                         <Badge key={tag} variant="blue">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6 bg-header-bg rounded-md p-4 border border-border-panel">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-md bg-border-panel flex items-center justify-center text-text-secondary">
                      <Icon name="email" size="sm" />
                    </div>
                    <span className="text-text-primary">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-md bg-border-panel flex items-center justify-center text-text-secondary">
                      <Icon name="phone" size="sm" />
                    </div>
                    <span className="text-text-primary">{selectedContact.phone}</span>
                  </div>
                </div>

                <button className="w-full group relative overflow-hidden bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-600 hover:to-accent-blue text-white p-4 rounded-md shadow-lg shadow-accent-blue/20 transition-all duration-300 hover:shadow-accent-blue/40 transform hover:-translate-y-0.5">
                  <div className="relative flex items-center justify-center gap-3 font-semibold tracking-wide">
                    <Icon name="auto_awesome" className="text-yellow-300 animate-pulse" />
                    GERAR MENSAGEM DE RECONEXÃO
                  </div>
                </button>
              </div>

              <div className="w-full h-px bg-border-panel my-2"></div>

              <div className="p-6 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Notas</SectionLabel>
                  <button className="text-xs text-accent-blue hover:underline">Salvar</button>
                </div>
                <textarea
                  className="w-full bg-header-bg border border-border-panel text-text-primary rounded-md p-3 text-base md:text-sm min-h-[100px] resize-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue placeholder-text-secondary focus:outline-none"
                  placeholder="Digite uma nota..."
                  defaultValue={selectedContact.notes || 'Demonstrou interesse no plano Enterprise durante a última conferência. Precisa de aprovação do CFO até o final do mês.'}
                ></textarea>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel>HISTÓRICO</SectionLabel>
                </div>
                <div className="relative pl-4 space-y-6">
                  <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-border-panel"></div>

                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-accent-blue border-2 border-surface z-10"></div>
                    <div className="bg-header-bg p-3 rounded-md border border-border-panel">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-text-primary">Email Enviado</span>
                        <span className="text-xs text-text-secondary">Hoje, 10:30</span>
                      </div>
                      <p className="text-xs text-text-secondary">Envio da proposta revisada.</p>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-text-secondary border-2 border-surface z-10"></div>
                    <div className="bg-header-bg p-3 rounded-md border border-border-panel">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-text-primary">Chamada</span>
                        <span className="text-xs text-text-secondary">Ontem, 14:00</span>
                      </div>
                      <p className="text-xs text-text-secondary">Alinhamento de expectativas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-panel bg-surface mt-auto pb-8 md:pb-4">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-border-panel text-text-primary hover:bg-border-panel text-sm font-medium transition-colors">
                  <Icon name="schedule" size="sm" /> Agendar
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-accent-blue text-white hover:bg-blue-600 text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                  <Icon name="call" size="sm" /> Ligar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create / Edit Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg bg-surface border border-border-panel rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-border-panel">
              <h2 className="text-sm font-black uppercase tracking-tight text-text-primary">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-text-secondary hover:text-text-primary transition-colors">
                <Icon name="close" size="lg" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                />
              </div>

              {/* Role + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Cargo</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={e => updateField('role', e.target.value)}
                    placeholder="Ex: CTO"
                    className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Empresa</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => updateField('company', e.target.value)}
                    placeholder="Ex: Acme Inc."
                    className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Status</label>
                <div className="flex gap-2">
                  {(['hot', 'warm', 'cold'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => updateField('status', s)}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-md border transition-colors ${
                        form.status === s
                          ? s === 'hot'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : s === 'warm'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-gray-500/20 border-gray-500 text-gray-400'
                          : 'bg-header-bg border-border-panel text-text-secondary hover:border-text-secondary'
                      }`}
                    >
                      {s === 'hot' ? 'Hot' : s === 'warm' ? 'Warm' : 'Cold'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => updateField('tags', e.target.value)}
                  placeholder="Tech, Cliente, Parceiro"
                  className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">URL da Foto (opcional)</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => updateField('image', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1 tracking-[0.08em]">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder="Observações sobre o contato..."
                  rows={3}
                  className="w-full bg-header-bg border border-border-panel rounded-md py-2 px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-border-panel">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-text-secondary border border-border-panel rounded-md hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-xs font-bold uppercase bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
              >
                {editingContact ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Delete Dialog ──────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-sm bg-surface border border-border-panel rounded-lg shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="delete" size="lg" className="text-accent-red" />
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-2">Excluir contato?</h3>
            <p className="text-xs text-text-secondary mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-bold uppercase text-text-secondary border border-border-panel rounded-md hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-6 py-2 text-xs font-bold uppercase bg-accent-red text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
