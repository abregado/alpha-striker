import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

export const skillStep: StepDefinition = {
  id: 'skill',
  label: 'Skill',
  title: 'Pilot Skill',
  subtitle: "Attacker's gunnery skill rating",
  render(container, onComplete) {
    makeOptionGrid(container, [
      { label: '0', sublabel: 'Legendary', value: 0 },
      { label: '1', sublabel: 'Elite',     value: 1 },
      { label: '2', sublabel: 'Veteran',   value: 2 },
      { label: '3', sublabel: 'Regular',   value: 3 },
      { label: '4', sublabel: 'Green',     value: 4 },
      { label: '5', sublabel: 'Recruit',   value: 5 },
    ], onComplete, { columns: 3 });
  },
};
