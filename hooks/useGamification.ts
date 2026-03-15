// hooks/useGamification.ts
// Calculates XP, level, streak and today's XP from real Supabase data.
import { useMemo } from 'react';
import { useNotionData } from '../contexts/NotionDataContext';
import { getDayKey } from '../utils/dateUtils';

// Safe extractor for raw JSON format: {_meta, items}
function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

// XP constants
const XP_TASK_DONE = 10;
const XP_HEALTH_ENTRY = 5;
const XP_DECISION = 15;
const XP_CONTENT_PUBLISHED = 20;
const XP_PER_LEVEL = 100;

export interface GamificationResult {
  xp: number;
  level: number;
  streak: number;
  todayXP: number;
  nextLevelXP: number;
  xpInLevel: number;
  isLoading: boolean;
}

export function useGamification(): GamificationResult {
  const { checklist, saude, decisions, content, isLoading } = useNotionData();

  const checklistItems = useMemo(
    () => extractItems<Record<string, unknown>>(checklist.items),
    [checklist.items],
  );

  const saudeItems = useMemo(
    () => extractItems<Record<string, unknown>>(saude.items),
    [saude.items],
  );

  const decisionItems = useMemo(
    () => extractItems<Record<string, unknown>>(decisions.items),
    [decisions.items],
  );

  const contentItems = useMemo(
    () => extractItems<Record<string, unknown>>(content.items),
    [content.items],
  );

  return useMemo(() => {
    const todayKey = getDayKey(new Date());

    // ── Tasks XP ─────────────────────────────────────────────────────────────
    const doneTasks = checklistItems.filter(t => {
      const status = (t['status'] ?? t['Status']) as string | undefined;
      return status === 'done' || status === 'Concluído' || status === 'Concluido' || status === 'Done';
    });
    const tasksXP = doneTasks.length * XP_TASK_DONE;

    // Today tasks done
    const todayTasksDone = doneTasks.filter(t => {
      const prazo = (t['prazo'] ?? t['Prazo'] ?? t['updated_at'] ?? t['data']) as string | undefined;
      return prazo && prazo.slice(0, 10) === todayKey;
    });
    const todayTasksXP = todayTasksDone.length * XP_TASK_DONE;

    // ── Health XP ─────────────────────────────────────────────────────────────
    const healthXP = saudeItems.length * XP_HEALTH_ENTRY;
    const todayHealthXP = saudeItems.filter(s => {
      const d = (s['data'] ?? s['Data']) as string | undefined;
      return d && d.slice(0, 10) === todayKey;
    }).length * XP_HEALTH_ENTRY;

    // ── Decisions XP ──────────────────────────────────────────────────────────
    const decisionsXP = decisionItems.length * XP_DECISION;
    const todayDecisionsXP = decisionItems.filter(d => {
      const dt = (d['data'] ?? d['Data']) as string | undefined;
      return dt && dt.slice(0, 10) === todayKey;
    }).length * XP_DECISION;

    // ── Content XP ────────────────────────────────────────────────────────────
    const publishedContent = contentItems.filter(c => {
      const s = (c['status'] ?? c['Status']) as string | undefined;
      return s === 'Publicado' || s === 'Publicado ✓' || s === 'Published';
    });
    const contentXP = publishedContent.length * XP_CONTENT_PUBLISHED;
    const todayContentXP = publishedContent.filter(c => {
      const d = (c['data'] ?? c['Data']) as string | undefined;
      return d && d.slice(0, 10) === todayKey;
    }).length * XP_CONTENT_PUBLISHED;

    // ── Totals ────────────────────────────────────────────────────────────────
    const xp = tasksXP + healthXP + decisionsXP + contentXP;
    const todayXP = todayTasksXP + todayHealthXP + todayDecisionsXP + todayContentXP;

    // ── Level ─────────────────────────────────────────────────────────────────
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInLevel = xp % XP_PER_LEVEL;
    const nextLevelXP = XP_PER_LEVEL;

    // ── Streak: consecutive days with at least 1 completed task ───────────────
    // Build a set of days with completed tasks
    const daysWithTasks = new Set<string>();
    for (const t of doneTasks) {
      const prazo = (t['prazo'] ?? t['Prazo'] ?? t['updated_at'] ?? t['data']) as string | undefined;
      if (prazo) daysWithTasks.add(prazo.slice(0, 10));
    }
    // Walk backwards from today
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = getDayKey(cursor);
      if (daysWithTasks.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (i === 0) {
        // Today hasn't ended yet — check yesterday's key too before breaking
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return { xp, level, streak, todayXP, nextLevelXP, xpInLevel, isLoading };
  }, [checklistItems, saudeItems, decisionItems, contentItems, isLoading]);
}
