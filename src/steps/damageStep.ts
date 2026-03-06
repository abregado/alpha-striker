import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

export const damageStep: StepDefinition = {
  id: 'damage',
  label: 'Damage',
  title: 'Damage Rating',
  subtitle: 'How many shots is the attacker firing?',
  render(container, onComplete) {
    const values = [1, 2, 3, 4, 5, 6, 7, 8];
    makeOptionGrid(container, values.map(v => ({
      label: String(v),
      value: v,
    })), onComplete, { columns: 4 });
  },
};
