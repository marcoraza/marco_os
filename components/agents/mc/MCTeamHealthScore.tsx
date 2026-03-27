/**
 * MCTeamHealthScore — compact 0-100 health ring for the MCMetricBar.
 *
 * Score composition (25 pts each):
 *   agentOnlineScore  — (online / total) * 25
 *   taskHealthScore   — (1 - blocked / max(active, 1)) * 25
 *   costScore         — tiered by daily spend
 *   activityScore     — tiered by recency of last activity
 *
 * Color thresholds: >=80 mint, >=50 blue, >=30 orange, <30 red.
 */
import { useMemo } from 'react';
import { Ring, type RingColor } from '../../ui/Ring';
import { useMissionControlStore } from '../../../store/missionControl';

function scoreColor(score: number): RingColor {
  if (score >= 80) return 'mint';
  if (score >= 50) return 'blue';
  if (score >= 30) return 'orange';
  return 'red';
}

export function MCTeamHealthScore() {
  const agents = useMissionControlStore((s) => s.agents);
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const activities = useMissionControlStore((s) => s.activities);

  const score = useMemo(() => {
    // -- Agent online score (max 25) --
    const visibleAgents = agents.filter((a) => !a.hidden);
    const total = visibleAgents.length;
    const online = visibleAgents.filter((a) => a.status !== 'offline').length;
    const agentOnlineScore = total > 0 ? (online / total) * 25 : 0;

    // -- Task health score (max 25) --
    const activeTasks = tasks.filter(
      (t) => t.status !== 'done' && t.status !== 'inbox',
    );
    const blockedTasks = tasks.filter(
      (t) => t.status === 'review' || t.status === 'quality_review',
    );
    const taskHealthScore =
      (1 - blockedTasks.length / Math.max(activeTasks.length, 1)) * 25;

    // -- Cost score (max 25) --
    const today = new Date().toISOString().slice(0, 10);
    const costToday = tokenUsage
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + t.cost, 0);
    let costScore = 0;
    if (costToday < 5) costScore = 25;
    else if (costToday < 10) costScore = 15;
    else if (costToday < 20) costScore = 5;

    // -- Activity score (max 25) --
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const sixHoursAgo = now - 6 * 60 * 60 * 1000;
    const hasRecentActivity = activities.some(
      (a) => a.created_at >= twoHoursAgo,
    );
    const hasSemiRecentActivity = activities.some(
      (a) => a.created_at >= sixHoursAgo,
    );
    let activityScore = 0;
    if (hasRecentActivity) activityScore = 25;
    else if (hasSemiRecentActivity) activityScore = 15;

    // -- Total (clamped 0-100) --
    const raw = agentOnlineScore + taskHealthScore + costScore + activityScore;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [agents, tasks, tokenUsage, activities]);

  return (
    <Ring
      value={score}
      size={32}
      strokeWidth={3}
      color={scoreColor(score)}
      showValue
    />
  );
}
