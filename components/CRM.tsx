import React, { useState } from 'react';

interface Contact {
  id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  image?: string;
  initials?: string;
  status: 'hot' | 'warm' | 'cold';
  tags: string[];
  lastContact: string;
}

const CRM: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = [
    {
      id: 1,
      name: 'Juliana Costa',
      role: 'VP de Marketing',
      company: 'Sony Music',
      email: 'juliana.costa@sonymusic.com',
      phone: '+55 11 99887-7665',
      image: 'https://i.pravatar.cc/150?u=1',
      status: 'warm',
      tags: ['Música', 'Parceiro'],
      lastContact: 'Há 45 dias'
    },
    {
      id: 2,
      name: 'Roberto Almeida',
      role: 'CTO',
      company: 'FinTech Solutions',
      email: 'roberto@fintech.io',
      phone: '+55 11 98765-4321',
      image: 'https://i.pravatar.cc/150?u=2',
      status: 'hot',
      tags: ['Tech', 'Cliente'],
      lastContact: 'Há 2 dias'
    },
    {
      id: 3,
      name: 'Marcos Pereira',
      role: 'Angel Investor',
      company: 'SeedLatam',
      email: 'marcos@seedlatam.vc',
      phone: '+55 21 99999-8888',
      initials: 'MP',
      status: 'warm',
      tags: ['Investidor'],
      lastContact: 'Há 60 dias'
    },
    {
      id: 4,
      name: 'Carla Mendez',
      role: 'Art Director',
      company: 'Freelance',
      email: 'carla.art@gmail.com',
      phone: '+55 41 91234-5678',
      image: 'https://i.pravatar.cc/150?u=5',
      status: 'cold',
      tags: ['Design', 'Prospect'],
      lastContact: 'Há 15 dias'
    }
  ];

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-6 max-w-6xl mx-auto space-y-6 flex-1 w-full overflow-y-auto">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#2A2A2A]">
          <div>
            <h1 className="text-2xl font-black text-[#0A84FF] uppercase tracking-tight">Inteligência de Rede</h1>
            <p className="text-xs text-gray-500 mt-1">Gerencie conexões estratégicas e mantenha sua rede ativa.</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-white">1.240</span>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-600">Contatos Totais</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2A2A2A] flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, empresa ou tag..." 
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-full py-2 pl-9 pr-4 text-xs text-white focus:border-[#0A84FF] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase self-center mr-2 whitespace-nowrap">Filtros:</span>
            <button className="px-3 py-1 bg-[#0A84FF] text-white text-[10px] font-bold uppercase rounded-full whitespace-nowrap">Todos</button>
            <button className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 text-[10px] font-bold uppercase rounded-full transition-colors whitespace-nowrap">Tech</button>
            <button className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 text-[10px] font-bold uppercase rounded-full transition-colors whitespace-nowrap">Design</button>
            <button className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 text-[10px] font-bold uppercase rounded-full transition-colors whitespace-nowrap">VC</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`group bg-[#1C1C1C] hover:bg-[#222] border rounded-xl p-5 transition-all cursor-pointer relative overflow-hidden ${
                  contact.status === 'warm' && contact.lastContact.includes('45') ? 'border-l-4 border-l-[#FF453A] border-y border-r border-[#2A2A2A] rounded-r-xl' : 'border border-[#2A2A2A]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="relative">
                      {contact.image ? (
                        <div className={`w-12 h-12 rounded-full p-0.5 ${
                          contact.status === 'warm' ? 'bg-gradient-to-tr from-orange-500 to-red-500' :
                          contact.status === 'hot' ? 'bg-gradient-to-tr from-blue-500 to-cyan-500' :
                          'bg-gradient-to-tr from-gray-600 to-gray-400'
                        }`}>
                          <img src={contact.image} alt="Profile" className="w-full h-full rounded-full border-2 border-[#1C1C1C] object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-500 text-sm font-bold border border-[#333]">
                          {contact.initials}
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1C1C1C] rounded-full ${
                        contact.status === 'hot' ? 'bg-[#00FF95]' :
                        contact.status === 'warm' ? 'bg-[#FF9F0A]' : 'bg-gray-500'
                      }`} title={contact.status}></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#0A84FF] transition-colors">{contact.name}</h3>
                      <p className="text-xs text-gray-400">{contact.role} @ {contact.company}</p>
                      <div className="mt-2 flex gap-2">
                        {contact.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-[#121212] border border-[#333] text-gray-300 rounded text-[9px] font-black uppercase">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Último Contato</p>
                    {contact.lastContact.includes('45') || contact.lastContact.includes('60') ? (
                      <div className="flex items-center gap-1 text-[#FF453A] bg-[#FF453A]/10 px-2 py-1 rounded">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        <span className="text-[10px] font-bold">{contact.lastContact}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 font-medium">{contact.lastContact}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Reconnect Queue */}
            <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 bg-[#121212] border-b border-[#2A2A2A] flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF95] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Fila de Reconexão
                </h3>
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
                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[10px] font-bold text-gray-400">{contact.initials}</div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-200">{contact.name}</p>
                        <p className="text-[9px] text-[#FF453A]">Inativo: {contact.time}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#0A84FF] hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                ))}
                <button className="w-full py-2 mt-2 border border-[#2A2A2A] rounded text-[10px] font-bold text-gray-500 uppercase hover:text-white hover:border-gray-500 transition-colors">
                  Ver Fila Completa
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 p-4 rounded-xl text-center">
                <h4 className="text-2xl font-black text-[#0A84FF]">84%</h4>
                <p className="text-[9px] font-bold uppercase text-gray-500 mt-1">Saúde da Rede</p>
              </div>
              <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-4 rounded-xl text-center">
                <h4 className="text-2xl font-black text-white">12</h4>
                <p className="text-[9px] font-bold uppercase text-gray-500 mt-1">Novos / Semana</p>
              </div>
            </div>

            {/* Promo */}
            <div className="bg-[#0D0D0F] border border-[#2A2A2A] rounded-xl p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0A84FF]/20 rounded-full blur-3xl"></div>
              <h4 className="relative z-10 text-sm font-bold text-white mb-2">Expanda sua rede</h4>
              <p className="relative z-10 text-xs text-gray-400 mb-4 leading-relaxed">Conecte seu LinkedIn para importar contatos automaticamente.</p>
              <button className="relative z-10 text-xs font-bold text-[#0A84FF] flex items-center gap-1 hover:text-white transition-colors">
                CONECTAR AGORA <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      {selectedContact && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#1C1C1C] shadow-2xl border-l border-[#2A2A2A] flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] bg-[#1C1C1C]/95 backdrop-blur z-10">
              <button 
                onClick={() => setSelectedContact(null)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Voltar</span>
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2A2A2A] transition-colors">
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pb-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    {selectedContact.image ? (
                        <img src={selectedContact.image} alt={selectedContact.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#2A2A2A] shadow-sm" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 text-2xl font-bold border-2 border-[#333]">{selectedContact.initials}</div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-[#1C1C1C] rounded-full ${selectedContact.status === 'hot' ? 'bg-[#00FF95]' : 'bg-[#FF9F0A]'}`}></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-bold text-white leading-tight">{selectedContact.name}</h2>
                    <p className="text-gray-400 font-medium text-sm">{selectedContact.role} @ {selectedContact.company}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedContact.tags.map(tag => (
                         <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6 bg-[#121212] rounded-xl p-4 border border-[#2A2A2A]">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-sm">email</span>
                    </div>
                    <span className="text-gray-300">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-sm">phone</span>
                    </div>
                    <span className="text-gray-300">{selectedContact.phone}</span>
                  </div>
                </div>

                <button className="w-full group relative overflow-hidden bg-gradient-to-r from-[#0A84FF] to-blue-600 hover:from-blue-600 hover:to-[#0A84FF] text-white p-4 rounded-xl shadow-lg shadow-[#0A84FF]/20 transition-all duration-300 hover:shadow-[#0A84FF]/40 transform hover:-translate-y-0.5">
                  <div className="relative flex items-center justify-center gap-3 font-semibold tracking-wide">
                    <span className="material-symbols-outlined text-yellow-300 animate-pulse">auto_awesome</span>
                    GERAR MENSAGEM DE RECONEXÃO
                  </div>
                </button>
              </div>

              <div className="w-full h-px bg-[#2A2A2A] my-2"></div>

              <div className="p-6 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notas</h3>
                  <button className="text-xs text-[#0A84FF] hover:underline">Salvar</button>
                </div>
                <textarea 
                  className="w-full bg-[#121212] border border-[#2A2A2A] text-gray-300 rounded-lg p-3 text-sm min-h-[100px] resize-none focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] placeholder-gray-500 focus:outline-none" 
                  placeholder="Digite uma nota..."
                  defaultValue="Demonstrou interesse no plano Enterprise durante a última conferência. Precisa de aprovação do CFO até o final do mês."
                ></textarea>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Histórico</h3>
                </div>
                <div className="relative pl-4 space-y-6">
                  <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-[#2A2A2A]"></div>
                  
                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-[#0A84FF] border-2 border-[#1C1C1C] z-10"></div>
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#2A2A2A]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-gray-200">Email Enviado</span>
                        <span className="text-xs text-gray-500">Hoje, 10:30</span>
                      </div>
                      <p className="text-xs text-gray-400">Envio da proposta revisada.</p>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-gray-600 border-2 border-[#1C1C1C] z-10"></div>
                    <div className="bg-[#121212] p-3 rounded-lg border border-[#2A2A2A]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-gray-200">Chamada</span>
                        <span className="text-xs text-gray-500">Ontem, 14:00</span>
                      </div>
                      <p className="text-xs text-gray-400">Alinhamento de expectativas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A] bg-[#1C1C1C] mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] text-sm font-medium transition-colors">
                  <span className="material-symbols-outlined text-sm">schedule</span> Agendar
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0A84FF] text-white hover:bg-blue-600 text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                  <span className="material-symbols-outlined text-sm">call</span> Ligar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;