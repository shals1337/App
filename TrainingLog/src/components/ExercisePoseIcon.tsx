import type { MuscleGroup } from '../types';
import { groupColor } from '../lib/muscleColors';

/** Equipment / machine silhouettes — each exercise maps to the gear it uses. */
export type Pose =
  | 'barbell'
  | 'bench'
  | 'dumbbell'
  | 'cable'
  | 'pulldown'
  | 'row'
  | 'legpress'
  | 'legext'
  | 'legcurl'
  | 'seatedpress'
  | 'pecdeck'
  | 'abmachine'
  | 'hipmachine'
  | 'pullup'
  | 'bodyweight'
  | 'kettlebell'
  | 'rack'
  | 'treadmill'
  | 'bike'
  | 'elliptical'
  | 'rower'
  | 'stairs';

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Figure({ pose }: { pose: Pose }) {
  switch (pose) {
    case 'barbell':
      return (
        <>
          <path d="M2.5 12h19" {...S} strokeWidth={2} />
          <rect x="5" y="6.6" width="2.9" height="10.8" rx="1.3" fill="currentColor" />
          <rect x="16.1" y="6.6" width="2.9" height="10.8" rx="1.3" fill="currentColor" />
          <path d="M3.4 9.8v4.4M20.6 9.8v4.4" {...S} strokeWidth={1.6} />
        </>
      );
    case 'bench':
      return (
        <>
          {/* barbell above */}
          <path d="M3 6.5h18" {...S} strokeWidth={1.8} />
          <rect x="5.6" y="4.4" width="2.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="16.2" y="4.4" width="2.2" height="4.2" rx="1" fill="currentColor" />
          {/* flat bench */}
          <path d="M4 14h16" {...S} strokeWidth={2.2} />
          <path d="M6 14v5M18 14v5M6 16.5h12" {...S} opacity="0.7" />
        </>
      );
    case 'dumbbell':
      return (
        <>
          <path d="M8.6 12h6.8" {...S} strokeWidth={2.2} />
          <rect x="3.4" y="8" width="2.6" height="8" rx="1.2" fill="currentColor" />
          <rect x="6.2" y="9.4" width="1.8" height="5.2" rx="0.9" fill="currentColor" />
          <rect x="18" y="8" width="2.6" height="8" rx="1.2" fill="currentColor" />
          <rect x="15.8" y="9.4" width="1.8" height="5.2" rx="0.9" fill="currentColor" />
        </>
      );
    case 'cable':
      return (
        <>
          <path d="M5 3.5v17" {...S} />
          <path d="M5 4.5h9.5" {...S} />
          <circle cx="15" cy="5.4" r="1.5" {...S} />
          <path d="M15 6.9v4.3" {...S} />
          <path d="M12.6 11.2h4.8" {...S} strokeWidth={2} />
          <rect x="3.3" y="9" width="3.4" height="8.4" rx="1" {...S} />
          <path d="M3.3 12h3.4M3.3 14.6h3.4" {...S} strokeWidth={1.3} opacity="0.7" />
        </>
      );
    case 'pulldown':
      return (
        <>
          <path d="M5 3.5v17" {...S} />
          <path d="M5 4.3h11" {...S} />
          <circle cx="16.4" cy="5.2" r="1.4" {...S} />
          <path d="M16.4 6.6v2.2" {...S} />
          {/* wide bar */}
          <path d="M12.4 8.8h8" {...S} strokeWidth={2} />
          <path d="M13.2 8.8v1.6M19.6 8.8v1.6" {...S} strokeWidth={1.4} />
          {/* seat + knee pad */}
          <path d="M13 17.5h6" {...S} strokeWidth={2} />
          <path d="M14 17.5v2.6M18 17.5v2.6" {...S} opacity="0.7" />
        </>
      );
    case 'row':
      return (
        <>
          {/* seated cable row: seat, footplate, handle */}
          <path d="M3 15.5h4.5" {...S} strokeWidth={2} />
          <path d="M3.6 15.5v3.2" {...S} opacity="0.7" />
          <path d="M2.6 12.5h2.4v3" {...S} />
          <path d="M7.5 15l7-1.6" {...S} />
          <path d="M14.5 10.5v6.4" {...S} />
          <path d="M12.6 13.4h3.6" {...S} strokeWidth={2} />
          <rect x="17" y="8" width="3.4" height="10" rx="1" {...S} />
        </>
      );
    case 'legpress':
      return (
        <>
          {/* angled sled */}
          <path d="M3.5 19.5V12" {...S} />
          <path d="M3.5 19.5h4.5" {...S} strokeWidth={2} />
          <path d="M8 19.5 18.5 7.5" {...S} strokeWidth={2} />
          <path d="M15.8 5 21 8.4" {...S} strokeWidth={2.2} />
          <rect x="4.5" y="9.5" width="3" height="2.4" rx="0.6" fill="currentColor" opacity="0.85" />
        </>
      );
    case 'legext':
      return (
        <>
          {/* seated leg extension: backrest, seat, lower-leg pad up */}
          <path d="M5.5 6v8.5" {...S} strokeWidth={2} />
          <path d="M5.5 14.5h6" {...S} strokeWidth={2} />
          <path d="M11.5 14.5 16 9.5" {...S} strokeWidth={2} />
          <circle cx="17" cy="8.4" r="1.7" fill="currentColor" />
          <path d="M5.5 18.5h6" {...S} opacity="0.55" />
        </>
      );
    case 'legcurl':
      return (
        <>
          {/* seated/lying leg curl: seat, lower-leg pad down-back */}
          <path d="M6 7v7.5" {...S} strokeWidth={2} />
          <path d="M6 14.5h6" {...S} strokeWidth={2} />
          <path d="M12 14.5 16.5 19" {...S} strokeWidth={2} />
          <circle cx="17.4" cy="19.4" r="1.6" fill="currentColor" />
          <path d="M6 18.5h6" {...S} opacity="0.55" />
        </>
      );
    case 'seatedpress':
      return (
        <>
          {/* seated press machine: backrest, seat, two forward press arms */}
          <path d="M7.5 5.5v12" {...S} strokeWidth={2} />
          <path d="M7.5 17.5h5" {...S} strokeWidth={2} />
          <path d="M7.5 9h8.5" {...S} />
          <path d="M7.5 13h8.5" {...S} />
          <path d="M16 9v4" {...S} strokeWidth={2} />
          <path d="M9 17.5v2.4M12 17.5v2.4" {...S} opacity="0.6" />
        </>
      );
    case 'pecdeck':
      return (
        <>
          {/* pec deck: center seat + two swinging arm pads */}
          <path d="M12 6.5v11" {...S} strokeWidth={2} />
          <path d="M9 17.5h6" {...S} strokeWidth={2} />
          <path d="M12 8.5C7 9 6 12 6.4 15" {...S} />
          <path d="M12 8.5c5 .5 6 3.5 5.6 6.5" {...S} />
          <circle cx="6.3" cy="15.6" r="1.5" fill="currentColor" />
          <circle cx="17.7" cy="15.6" r="1.5" fill="currentColor" />
        </>
      );
    case 'abmachine':
      return (
        <>
          {/* ab crunch machine: angled backrest, chest pad, seat */}
          <path d="M6 19h6" {...S} strokeWidth={2} />
          <path d="M6.5 19 10 8.5" {...S} strokeWidth={2} />
          <path d="M10 8.5h6.5" {...S} strokeWidth={2} />
          <rect x="15.5" y="7" width="2.6" height="3" rx="0.8" fill="currentColor" />
          <path d="M7.5 19v1.8" {...S} opacity="0.6" />
        </>
      );
    case 'hipmachine':
      return (
        <>
          {/* seated hip machine: backrest, seat, two spread leg pads */}
          <path d="M12 6.5v7.5" {...S} strokeWidth={2} />
          <path d="M8.5 14h7" {...S} strokeWidth={2} />
          <path d="M11 14 7.5 20" {...S} strokeWidth={2} />
          <path d="M13 14 16.5 20" {...S} strokeWidth={2} />
          <circle cx="7.2" cy="20.2" r="1.4" fill="currentColor" />
          <circle cx="16.8" cy="20.2" r="1.4" fill="currentColor" />
        </>
      );
    case 'pullup':
      return (
        <>
          {/* pull-up frame */}
          <path d="M4 6h16" {...S} strokeWidth={2} />
          <path d="M6 6v14M18 6v14" {...S} />
          <path d="M9.5 6v2.4M14.5 6v2.4" {...S} strokeWidth={1.6} opacity="0.75" />
        </>
      );
    case 'bodyweight':
      return (
        <>
          {/* person doing a push-up / bodyweight */}
          <circle cx="18.5" cy="9" r="1.7" {...S} />
          <path d="M17 9.6 6.5 15.5" {...S} strokeWidth={2} />
          <path d="M9.5 13.9 8 19M13.5 11.7 12 19" {...S} />
          <path d="M4 19h16" {...S} opacity="0.5" />
        </>
      );
    case 'kettlebell':
      return (
        <>
          <path d="M9 8.2c0-3.4 6-3.4 6 0" {...S} />
          <path
            d="M8.6 8.4C6 10.4 6 17 12 18.6 18 17 18 10.4 15.4 8.4Z"
            {...S}
            strokeWidth={2}
          />
        </>
      );
    case 'rack':
      return (
        <>
          {/* squat rack with loaded bar */}
          <path d="M6 20V5M18 20V5" {...S} />
          <path d="M2.5 8h19" {...S} strokeWidth={2} />
          <rect x="3.4" y="5.4" width="2.4" height="5.2" rx="1" fill="currentColor" />
          <rect x="18.2" y="5.4" width="2.4" height="5.2" rx="1" fill="currentColor" />
          <path d="M6 7l1.6-1.4M18 7l-1.6-1.4" {...S} strokeWidth={1.5} opacity="0.7" />
        </>
      );
    case 'treadmill':
      return (
        <>
          {/* treadmill: deck + rear roller + console upright */}
          <path d="M3 17.5 6 16h13l1.5 1.5" {...S} strokeWidth={2} />
          <circle cx="4" cy="18.6" r="1.4" {...S} />
          <path d="M18.5 16V6h2" {...S} />
          <path d="M20.5 6h.2" {...S} strokeWidth={2.4} />
          {/* runner */}
          <circle cx="11" cy="7.4" r="1.4" {...S} />
          <path d="M11 8.8 9.8 12l-2 .6M11 8.8l1.6 1.4 1.8-.4M11 10.6 9.5 15M11 10.6 12.8 14.6" {...S} />
        </>
      );
    case 'bike':
      return (
        <>
          <circle cx="6" cy="16.5" r="3.2" {...S} />
          <circle cx="17.5" cy="16.5" r="3.2" {...S} />
          <path d="M6 16.5 9.5 8h4" {...S} />
          <path d="M9.5 16.5 12.5 8" {...S} />
          <path d="M12.5 8 17.5 16.5" {...S} />
          <path d="M8 8h3M12.5 6.4v1.6" {...S} strokeWidth={1.7} />
        </>
      );
    case 'elliptical':
      return (
        <>
          <ellipse cx="12" cy="15.5" rx="8.5" ry="2.6" {...S} />
          <circle cx="6" cy="15.5" r="1" fill="currentColor" />
          <circle cx="18" cy="15" r="1" fill="currentColor" />
          <path d="M6 15 8.5 6M18 14.5 15.5 6" {...S} />
          <path d="M8.5 6h7" {...S} strokeWidth={1.8} />
        </>
      );
    case 'rower':
      return (
        <>
          {/* rowing machine: rail, flywheel, seat, handle */}
          <path d="M3 18h17" {...S} strokeWidth={2} />
          <circle cx="5" cy="12.5" r="2.6" {...S} />
          <path d="M7.4 12.5H16" {...S} />
          <rect x="12" y="16" width="3.4" height="2" rx="0.8" fill="currentColor" />
          <path d="M18.5 8v10" {...S} opacity="0.6" />
        </>
      );
    case 'stairs':
      return (
        <>
          <path d="M4 19h4v-4h4v-4h4v-4h4" {...S} strokeWidth={2} />
          <path d="M4 19v-2" {...S} opacity="0.5" />
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
      <svg viewBox="0 0 24 24" width={size * 0.68} height={size * 0.68}>
        <Figure pose={pose} />
      </svg>
    </div>
  );
}
