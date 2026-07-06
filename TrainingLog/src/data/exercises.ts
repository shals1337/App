import type { Exercise, Template } from '../types';

export const BUILTIN_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: 'incline-bench-press', name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscleGroup: 'Chest' },
  { id: 'chest-fly', name: 'Chest Fly', muscleGroup: 'Chest' },
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'Chest' },
  { id: 'push-up', name: 'Push-up', muscleGroup: 'Chest' },
  { id: 'dips', name: 'Dips', muscleGroup: 'Chest' },
  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back' },
  { id: 'pull-up', name: 'Pull-up', muscleGroup: 'Back' },
  { id: 'chin-up', name: 'Chin-up', muscleGroup: 'Back' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'Back' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscleGroup: 'Back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'Back' },
  { id: 'back-extension', name: 'Back Extension', muscleGroup: 'Back' },
  // Legs
  { id: 'squat', name: 'Squat', muscleGroup: 'Legs' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'Legs' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'Legs' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { id: 'lunge', name: 'Lunge', muscleGroup: 'Legs' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'Legs' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'Legs' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Legs' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'Legs' },
  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { id: 'front-raise', name: 'Front Raise', muscleGroup: 'Shoulders' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Shoulders' },
  { id: 'upright-row', name: 'Upright Row', muscleGroup: 'Shoulders' },
  // Arms
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroup: 'Arms' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', muscleGroup: 'Arms' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'Arms' },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', muscleGroup: 'Arms' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'Arms' },
  { id: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', muscleGroup: 'Arms' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', muscleGroup: 'Arms' },
  // Core
  { id: 'plank', name: 'Plank', muscleGroup: 'Core' },
  { id: 'crunch', name: 'Crunch', muscleGroup: 'Core' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Core' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Core' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Core' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscleGroup: 'Core' },
  // Other
  { id: 'farmers-walk', name: "Farmer's Walk", muscleGroup: 'Other' },
  { id: 'kettlebell-swing', name: 'Kettlebell Swing', muscleGroup: 'Other' },
];

export const STARTER_TEMPLATES: Template[] = [
  {
    id: 'tpl-push',
    name: 'Push Day',
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4 },
      { exerciseId: 'overhead-press', targetSets: 3 },
      { exerciseId: 'incline-bench-press', targetSets: 3 },
      { exerciseId: 'lateral-raise', targetSets: 3 },
      { exerciseId: 'triceps-pushdown', targetSets: 3 },
    ],
  },
  {
    id: 'tpl-pull',
    name: 'Pull Day',
    exercises: [
      { exerciseId: 'deadlift', targetSets: 3 },
      { exerciseId: 'pull-up', targetSets: 3 },
      { exerciseId: 'barbell-row', targetSets: 3 },
      { exerciseId: 'seated-cable-row', targetSets: 3 },
      { exerciseId: 'barbell-curl', targetSets: 3 },
    ],
  },
  {
    id: 'tpl-legs',
    name: 'Leg Day',
    exercises: [
      { exerciseId: 'squat', targetSets: 4 },
      { exerciseId: 'romanian-deadlift', targetSets: 3 },
      { exerciseId: 'leg-press', targetSets: 3 },
      { exerciseId: 'leg-curl', targetSets: 3 },
      { exerciseId: 'calf-raise', targetSets: 4 },
    ],
  },
];

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Other',
] as const;
