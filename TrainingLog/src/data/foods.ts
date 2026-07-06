export interface QuickFood {
  id: string;
  name: string;
  /** short serving hint shown under the name, e.g. "1 stk" */
  serving: string;
  kcal: number;
  protein: number;
  emoji: string;
}

/** Common single-serving estimates — tap to log instantly, delete after if off. */
export const QUICK_FOODS: QuickFood[] = [
  { id: 'egg', name: 'Æg', serving: '1 stk', kcal: 70, protein: 6, emoji: '🥚' },
  { id: 'banana', name: 'Banan', serving: '1 stk', kcal: 105, protein: 1.3, emoji: '🍌' },
  { id: 'tuna', name: 'Tun', serving: '1 dåse', kcal: 120, protein: 26, emoji: '🐟' },
  { id: 'chicken', name: 'Kylling', serving: '100 g', kcal: 165, protein: 31, emoji: '🍗' },
  { id: 'rice', name: 'Ris', serving: '100 g kogt', kcal: 130, protein: 2.7, emoji: '🍚' },
  { id: 'oats', name: 'Havregryn', serving: '50 g', kcal: 190, protein: 7, emoji: '🥣' },
  { id: 'skyr', name: 'Skyr', serving: '150 g', kcal: 90, protein: 16, emoji: '🥄' },
  { id: 'salmon', name: 'Laks', serving: '100 g', kcal: 208, protein: 20, emoji: '🍣' },
  { id: 'shake', name: 'Protein shake', serving: '1 scoop', kcal: 120, protein: 24, emoji: '🥤' },
  { id: 'peanut-butter', name: 'Peanutbutter', serving: '1 spsk', kcal: 95, protein: 4, emoji: '🥜' },
  { id: 'milk', name: 'Mælk', serving: '1 glas', kcal: 92, protein: 6.8, emoji: '🥛' },
  { id: 'apple', name: 'Æble', serving: '1 stk', kcal: 95, protein: 0.5, emoji: '🍎' },
];
