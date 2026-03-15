interface ScoreDimension {
  label: string;
  value: number; // 0-100
  weight: number; // 0-1
}

export function calculateHealthScore(dimensions: ScoreDimension[]): number {
  const activeDimensions = dimensions.filter(d => d.value >= 0);
  if (activeDimensions.length === 0) return 0;
  const totalWeight = activeDimensions.reduce((sum, d) => sum + d.weight, 0);
  const weightedSum = activeDimensions.reduce((sum, d) => sum + (d.value * d.weight), 0);
  return Math.round(weightedSum / totalWeight);
}

export function getScoreColor(score: number): string {
  if (score > 70) return 'text-brand-mint';
  if (score >= 40) return 'text-accent-orange';
  return 'text-accent-red';
}
