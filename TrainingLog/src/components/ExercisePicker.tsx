import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { MUSCLE_GROUPS } from '../data/exercises';
import type { MuscleGroup } from '../types';
import { SearchIcon, XIcon } from './Icons';

interface Props {
  title?: string;
  excludeIds?: string[];
  onPick: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ title = 'Add exercise', excludeIds = [], onPick, onClose }: Props) {
  const { exercises } = useApp();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'All'>('All');

  const q = query.trim().toLowerCase();
  const filtered = exercises.filter(
    (e) =>
      !excludeIds.includes(e.id) &&
      (group === 'All' || e.muscleGroup === group) &&
      (q === '' || e.name.toLowerCase().includes(q)),
  );

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
        </div>

        <div className="search-box">
          <SearchIcon size={17} />
          <input
            type="search"
            placeholder="Search exercises"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="chip-row">
          {(['All', ...MUSCLE_GROUPS] as const).map((g) => (
            <button
              key={g}
              className={g === group ? 'chip active' : 'chip'}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="sheet-list">
          {filtered.length === 0 && <p className="empty">No exercises match.</p>}
          {filtered.map((e) => (
            <button className="list-row row-btn" key={e.id} onClick={() => onPick(e.id)}>
              <div className="list-row-main">
                <span>{e.name}</span>
                <span className="muted small">{e.muscleGroup}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
