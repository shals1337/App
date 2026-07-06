export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('da-DK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

export function formatWeight(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1).replace('.', ',')}`;
}

export function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local YYYY-MM-DD key for a datetime. */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
