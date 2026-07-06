import type { MuscleGroup } from '../types';

const GROUP_HEX: Record<MuscleGroup, string> = {
  Bryst: '#ff6b8b',
  Ryg: '#4dd0e1',
  Ben: '#8b5cf6',
  Skuldre: '#ffb84d',
  Arme: '#5ce68a',
  Mave: '#ff9f4d',
  Andet: '#9ca3af',
};

export function groupColor(group: MuscleGroup): string {
  return GROUP_HEX[group];
}
