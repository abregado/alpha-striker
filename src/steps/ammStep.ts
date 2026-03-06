import type { StepDefinition } from '../types';
import { makeCardOptions } from './stepHelpers';

export const ammStep: StepDefinition = {
  id: 'amm',
  label: 'AMM',
  title: 'Attacker Movement',
  subtitle: 'What action did the attacker take?',
  render(container, onComplete) {
    makeCardOptions(container, [
      { label: 'Standstill', sublabel: '−1 to target', value: -1 },
      { label: 'Walk',       sublabel: '+0 to target', value:  0 },
      { label: 'Jump',       sublabel: '+2 to target', value:  2 },
    ], onComplete);
  },
};
