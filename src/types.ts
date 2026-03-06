export interface AttackData {
  damage: number;       // number of 2d6 rolls to make
  skill: number;        // 0–5
  heat: number;         // 0–3
  amm: number;          // -1 (standstill), 0 (walk), +2 (jump)
  tmm: number;          // -4, or 0–5
  other: number;        // sum of selected other modifiers
  range: number;        // 0 (short), +2 (medium), +4 (long)
}

export interface DiceRoll {
  d1: number;           // first die (1–6)
  d2: number;           // second die (1–6)
  total: number;        // d1 + d2
  isHit: boolean;
  isCrit: boolean;
}

export interface AttackResult {
  targetNumber: number;
  rolls: DiceRoll[];
  hits: number;
  crits: number;
}

// Step system
export interface StepDefinition<T = number> {
  id: string;
  label: string;        // short label for progress indicator
  title: string;        // heading shown to player
  subtitle?: string;
  render(container: HTMLElement, onComplete: (value: T) => void): void;
}

// Collected values keyed by step id
export type AttackState = Partial<Record<string, number>>;
