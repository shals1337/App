import { formatWeight } from '../lib/format';

export function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  if (delta === 0) return <span className="delta-chip flat">→ samme</span>;
  const up = delta > 0;
  return (
    <span className={up ? 'delta-chip up' : 'delta-chip down'}>
      {up ? '↑' : '↓'} {formatWeight(Math.abs(delta))} kg
    </span>
  );
}
