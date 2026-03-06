import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

export const heatStep: StepDefinition = {
  id: 'heat',
  label: 'Heat',
  title: 'Attacker Heat',
  subtitle: "How hot is the firing unit running?",
  render(container, onComplete) {
    makeOptionGrid(container, [
      { label: '0', sublabel: 'Cool',     value: 0 },
      { label: '1', sublabel: 'Warm',     value: 1 },
      { label: '2', sublabel: 'Hot',      value: 2 },
      { label: '3', sublabel: 'Critical', value: 3 },
    ], onComplete, { columns: 2 });
  },
};
