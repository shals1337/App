import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { MUSCLE_GROUPS, poseFor } from '../data/exercises';
import type { MuscleGroup } from '../types';
import { newId } from '../id';
import { PlusIcon, SearchIcon, XIcon } from './Icons';
import { ExercisePoseIcon } from './ExercisePoseIcon';

interface Props {
  excludeIds?: string[];
  onPick: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ excludeIds = [], onPick, onClose }: Props) {
  const { exercises, addCustomExercise } = useApp();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'Alle'>('Alle');

  const q = query.trim().toLowerCase();
  const filtered = exercises.filter(
    (e) =>
      !excludeIds.includes(e.id) &&
      (group === 'Alle' || e.muscleGroup === group) &&
      (q === '' || e.name.toLowerCase().includes(q)),
  );

  function createCustom() {
    const name = query.trim();
    if (!name) return;
    const exercise = {
      id: newId(),
      name,
      muscleGroup: group === 'Alle' ? ('Andet' as const) : group,
      custom: true,
    };
    addCustomExercise(exercise);
    onPick(exercise.id);
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Tilføj øvelse</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Luk">
            <XIcon size={20} />
          </button>
        </div>

        <div className="search-box">
          <SearchIcon size={17} />
          <input
            type="search"
            placeholder="Søg maskine eller øvelse"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="chip-row">
          {(['Alle', ...MUSCLE_GROUPS] as const).map((g) => (
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
          {filtered.map((e) => (
            <button className="list-row row-btn" key={e.id} onClick={() => onPick(e.id)}>
              <ExercisePoseIcon pose={poseFor(e)} group={e.muscleGroup} size={38} />
              <div className="list-row-main">
                <span>{e.name}</span>
                <span className="muted small">{e.muscleGroup}</span>
              </div>
              <PlusIcon size={17} />
            </button>
          ))}
          {q !== '' && (
            <button className="ghost-btn" onClick={createCustom}>
              <PlusIcon size={15} /> Opret "{query.trim()}" som ny øvelse
            </button>
          )}
          {filtered.length === 0 && q === '' && (
            <p className="empty">Ingen øvelser i denne gruppe.</p>
          )}
        </div>
      </div>
    </div>
  );
}
