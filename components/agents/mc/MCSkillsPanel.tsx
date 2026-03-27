/**
 * MCSkillsPanel
 *
 * Skills catalog browser. Shows agent skills grouped by source.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

interface Skill {
  id: string;
  name: string;
  source: string;
  path: string;
  description?: string;
  registry_slug?: string | null;
  security_status?: string | null;
}

interface SkillGroup {
  source: string;
  path: string;
  skills: Skill[];
}

interface SkillsResponse {
  skills?: Skill[];
  groups?: SkillGroup[];
  total?: number;
}

function securityBadge(status?: string | null) {
  if (!status) return null;
  const color =
    status === 'verified' ? 'text-brand-mint border-brand-mint/30' :
    status === 'warning' ? 'text-accent-orange border-accent-orange/30' :
    status === 'blocked' ? 'text-accent-red border-accent-red/30' :
    'text-text-secondary border-border-panel';

  return (
    <span className={cn('text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm', color)}>
      {status}
    </span>
  );
}

export function MCSkillsPanel({ agentId }: { agentId?: string }) {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchSkills = useCallback(async () => {
    try {
      const params = agentId ? `?agent=${encodeURIComponent(agentId)}` : '';
      const res = await mcApi.get<SkillsResponse>(`/api/skills${params}`);
      const g = res?.groups || [];
      const t = res?.total ?? (res?.skills?.length || 0);
      setGroups(g);
      setTotal(t);
      if (loading) {
        setExpandedGroups(new Set(g.map(gr => gr.source)));
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [agentId, loading]);

  useMCPoll(fetchSkills, 60_000);

  const toggleGroup = (source: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source); else next.add(source);
      return next;
    });
  };

  const filteredGroups = search.trim()
    ? groups.map(g => ({
        ...g,
        skills: g.skills.filter(s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.skills.length > 0)
    : groups;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-border-panel animate-pulse rounded-sm h-16" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">psychology</span>
        <p className="text-text-secondary text-xs text-center">Nenhuma skill encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          {total} skills
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bg-base border border-border-panel rounded-sm px-2 py-1 text-[10px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/30 focus:outline-none w-48"
          placeholder="Buscar skills..."
        />
      </div>

      {/* Groups */}
      {filteredGroups.map((group) => (
        <div key={group.source} className="bg-surface border border-border-panel rounded-sm">
          <button
            onClick={() => toggleGroup(group.source)}
            className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            <div className="flex items-center gap-2">
              <Icon
                name={expandedGroups.has(group.source) ? 'expand_more' : 'chevron_right'}
                size="xs"
                className="text-text-secondary"
              />
              <span className="text-[10px] font-bold text-text-primary">{group.source}</span>
              <span className="text-[8px] font-mono text-text-secondary">{group.skills.length}</span>
            </div>
            <span className="text-[8px] font-mono text-text-secondary truncate max-w-[200px]">{group.path}</span>
          </button>

          {expandedGroups.has(group.source) && (
            <div className="border-t border-border-panel/50 divide-y divide-border-panel/30">
              {group.skills.map((skill) => (
                <div key={skill.id} className="px-3 py-2 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="psychology" size="xs" className="text-accent-purple" />
                    <span className="text-[10px] font-bold text-text-primary">{skill.name}</span>
                    {securityBadge(skill.security_status)}
                  </div>
                  {skill.description && (
                    <p className="text-[9px] text-text-secondary mt-0.5 ml-5 line-clamp-2">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
