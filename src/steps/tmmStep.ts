import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

export const tmmStep: StepDefinition = {
  id: 'tmm',
  label: 'TMM',
  title: 'Target Movement',
  subtitle: "Target's movement modifier",
  render(container, onComplete) {
    makeOptionGrid(container, [
      { label: '−4', sublabel: 'Immobile', value: -4 },
      { label: '0',  sublabel: 'Stationary', value: 0 },
      { label: '+1', value: 1 },
      { label: '+2', value: 2 },
      { label: '+3', value: 3 },
      { label: '+4', value: 4 },
      { label: '+5', value: 5 },
    ], onComplete);
  },
};
