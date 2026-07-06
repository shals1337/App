import type { MuscleGroup } from '../types';
import { groupColor } from '../lib/muscleColors';

/** Movement-pattern pictograms — shared across exercises with the same motion. */
export type Pose =
  | 'bench'
  | 'overhead'
  | 'squat'
  | 'deadlift'
  | 'row'
  | 'pulldown'
  | 'pull-up'
  | 'curl'
  | 'triceps'
  | 'lateral'
  | 'fly'
  | 'core'
  | 'leg-machine'
  | 'lunge'
  | 'hip'
  | 'calf'
  | 'carry'
  | 'back-ext'
  | 'ab-wheel'
  | 'face-pull';

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** filled rounded plate, used at both ends of a bar */
function Plate({ x, vertical }: { x: number; vertical: boolean }) {
  return vertical ? (
    <rect x={x} y="4.6" width="2.8" height="6.4" rx="1.1" fill="currentColor" />
  ) : (
    <rect x={x} y="9.6" width="6.4" height="2.8" rx="1.1" fill="currentColor" />
  );
}

function Figure({ pose }: { pose: Pose }) {
  switch (pose) {
    case 'bench':
      return (
        <>
          <Plate x={2.4} vertical />
          <Plate x={18.8} vertical />
          <path d="M5.2 7.8h13.6" {...S} />
          <path d="M5 17.5h14M7.5 17.5v2M16.5 17.5v2" {...S} opacity="0.6" />
          <path d="M10 14 12 11 14 14" {...S} />
        </>
      );
    case 'overhead':
      return (
        <>
          <Plate x={2.4} vertical />
          <Plate x={18.8} vertical />
          <path d="M5.2 6.6h13.6" {...S} />
          <path d="M7.5 16h9" {...S} opacity="0.6" />
          <circle cx="12" cy="19.2" r="1.6" {...S} />
          <path d="M9.8 12 12 9.4 14.2 12" {...S} />
        </>
      );
    case 'squat':
      return (
        <>
          <Plate x={2.4} vertical />
          <Plate x={18.8} vertical />
          <path d="M5.2 6.6h13.6" {...S} />
          <path d="M8 8.2 12 13 16 8.2" {...S} />
          <path d="M9 13 7 19M15 13 17 19" {...S} />
        </>
      );
    case 'deadlift':
      return (
        <>
          <Plate x={2.4} vertical />
          <Plate x={18.8} vertical />
          <path d="M5.2 18.4h13.6" {...S} />
          <path d="M8 15 12 6.5 16 15" {...S} />
        </>
      );
    case 'row':
      return (
        <>
          <path d="M18.5 5v6" {...S} opacity="0.6" />
          <rect x="16.6" y="10.4" width="1.9" height="5.6" rx="0.9" fill="currentColor" />
          <path d="M16.4 13h-6.5" {...S} />
          <path d="M12.2 10.7 9.9 13l2.3 2.3" {...S} />
          <circle cx="6" cy="13" r="1.7" {...S} />
        </>
      );
    case 'pulldown':
      return (
        <>
          <path d="M5.5 4.2h13" {...S} />
          <path d="M12 4.2v5.4" {...S} opacity="0.6" />
          <path d="M8 9.6h8" {...S} />
          <path d="M9.7 13.3 12 16l2.3-2.7" {...S} />
          <circle cx="12" cy="18.6" r="1.6" {...S} />
        </>
      );
    case 'pull-up':
      return (
        <>
          <path d="M5.5 4.2h13" {...S} />
          <path d="M9.3 4.2v3.6M14.7 4.2v3.6" {...S} opacity="0.6" />
          <circle cx="12" cy="10.4" r="1.7" {...S} />
          <path d="M12 12.1v5.4" {...S} />
          <path d="M9.6 15 12 12.6 14.4 15" {...S} />
        </>
      );
    case 'curl':
      return (
        <>
          <circle cx="7.3" cy="17.3" r="1.6" fill="currentColor" />
          <circle cx="12.6" cy="14.7" r="1.6" fill="currentColor" />
          <path d="M8.5 16.4h2.4" {...S} />
          <path d="M9 15.8Q6.3 10 10.6 6.3" {...S} />
          <path d="M9.2 7.7 10.6 6.1 12.3 7.1" {...S} />
        </>
      );
    case 'triceps':
      return (
        <>
          <circle cx="12" cy="5" r="1.6" fill="currentColor" opacity="0.85" />
          <path d="M12 6.6v3.2" {...S} opacity="0.6" />
          <path d="M12 9.8v6.4" {...S} />
          <path d="M9.7 14.4 12 16.9l2.3-2.5" {...S} />
        </>
      );
    case 'lateral':
      return (
        <>
          <path d="M12 5.4v13" {...S} opacity="0.7" />
          <path d="M4 10.4h16" {...S} />
          <circle cx="4" cy="10.4" r="1.9" fill="currentColor" />
          <circle cx="20" cy="10.4" r="1.9" fill="currentColor" />
        </>
      );
    case 'fly':
      return (
        <>
          <circle cx="4.6" cy="6.6" r="1.6" fill="currentColor" />
          <circle cx="19.4" cy="6.6" r="1.6" fill="currentColor" />
          <path d="M4.6 8.3Q8.5 14.5 12 16" {...S} />
          <path d="M19.4 8.3Q15.5 14.5 12 16" {...S} />
        </>
      );
    case 'core':
      return (
        <>
          <path d="M4 18h16" {...S} opacity="0.5" />
          <circle cx="14.3" cy="8.6" r="1.7" {...S} />
          <path d="M6.3 17.3Q9 9 13 10.6" {...S} />
          <path d="M13 10.6Q16.3 12 16 15.6" {...S} />
        </>
      );
    case 'leg-machine':
      return (
        <>
          <circle cx="7.3" cy="9.3" r="1.6" {...S} />
          <path d="M7.7 10.9 9.4 16.3" {...S} />
          <path d="M5.6 16.3h9" {...S} opacity="0.6" />
          <path d="M9.4 16.3 15.6 12.6" {...S} />
          <path d="M13.6 11.4 16 12l-0.3 2.5" {...S} />
        </>
      );
    case 'lunge':
      return (
        <>
          <circle cx="11.6" cy="4.4" r="1.6" {...S} />
          <path d="M11.6 6v3.4" {...S} />
          <path d="M11.6 9.4 17.3 18.6" {...S} />
          <path d="M11.6 9.4 9 15 12 18.6" {...S} />
          <path d="M6.6 18.6h9" {...S} opacity="0.5" />
        </>
      );
    case 'hip':
      return (
        <>
          <path d="M5 15.6h7.5" {...S} opacity="0.6" />
          <path d="M12.5 15.6 17 11.4" {...S} />
          <circle cx="18.2" cy="10.2" r="1.6" {...S} />
          <path d="M6.2 15.6 9.4 19.4" {...S} />
          <path d="M8 13.4 9.3 11.6 10.6 13.4" {...S} />
        </>
      );
    case 'calf':
      return (
        <>
          <path d="M8.4 19h7.2" {...S} opacity="0.6" />
          <circle cx="12" cy="4.6" r="1.6" {...S} />
          <path d="M12 6.2v9" {...S} />
          <path d="M12 15.2 9.6 19M12 15.2 14.4 19" {...S} />
          <path d="M9.8 12.4 12 10.4 14.2 12.4" {...S} opacity="0.75" />
        </>
      );
    case 'carry':
      return (
        <>
          <circle cx="12" cy="4.4" r="1.6" {...S} />
          <path d="M12 6v6.4" {...S} />
          <path d="M12 8.4 7 11M12 8.4 17 11" {...S} opacity="0.6" />
          <rect x="4.6" y="10.4" width="2.6" height="2.6" rx="0.8" fill="currentColor" />
          <rect x="16.8" y="10.4" width="2.6" height="2.6" rx="0.8" fill="currentColor" />
          <path d="M12 12.4 9 19M12 12.4 15 19" {...S} />
          <path d="M2 10.5h1.6M2 13.5h1.6" {...S} opacity="0.4" />
        </>
      );
    case 'back-ext':
      return (
        <>
          <path d="M4.5 14.6h8" {...S} opacity="0.55" />
          <circle cx="16.6" cy="7.2" r="1.6" {...S} />
          <path d="M8.6 14.6Q11 9.6 15.2 8.3" {...S} />
          <path d="M7 12Q8.6 9.6 11 10.4" {...S} opacity="0.6" />
        </>
      );
    case 'ab-wheel':
      return (
        <>
          <circle cx="17.2" cy="17.2" r="2.2" {...S} />
          <circle cx="7" cy="8" r="1.6" {...S} />
          <path d="M7.9 9.3 15.6 16" {...S} />
          <path d="M13.6 15.8 11.6 17.4 13.6 19" {...S} opacity="0.7" />
        </>
      );
    case 'face-pull':
      return (
        <>
          <path d="M12 3.4v6" {...S} opacity="0.6" />
          <path d="M12 9.4 9.2 11.4M12 9.4 14.8 11.4" {...S} />
          <circle cx="12" cy="15" r="1.9" {...S} />
          <path d="M10.4 11.6 12 13.1l1.6-1.5" {...S} opacity="0.75" />
        </>
      );
  }
}

interface Props {
  pose: Pose;
  group: MuscleGroup;
  size?: number;
}

export function ExercisePoseIcon({ pose, group, size = 48 }: Props) {
  const color = groupColor(group);
  return (
    <div
      className="pose-tile"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(155deg, ${color}3d, ${color}16)`,
        boxShadow: `inset 0 0 0 1px ${color}33`,
        color,
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.66} height={size * 0.66}>
        <Figure pose={pose} />
      </svg>
    </div>
  );
}
