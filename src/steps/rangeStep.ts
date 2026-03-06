import type { StepDefinition } from '../types';
import { makeCardOptions } from './stepHelpers';

export const rangeStep: StepDefinition = {
  id: 'range',
  label: 'Range',
  title: 'Range Band',
  subtitle: 'How far away is the target?',
  render(container, onComplete) {
    makeCardOptions(container, [
      { label: 'Short',  sublabel: '+0 to target', value: 0 },
      { label: 'Medium', sublabel: '+2 to target', value: 2 },
      { label: 'Long',   sublabel: '+4 to target', value: 4 },
    ], onComplete);
  },
};
