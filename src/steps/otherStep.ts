import type { StepDefinition } from '../types';
import { makeToggleOptions } from './stepHelpers';

export const otherStep: StepDefinition = {
  id: 'other',
  label: 'Other',
  title: 'Other Modifiers',
  subtitle: 'Select all that apply',
  render(container, onComplete) {
    makeToggleOptions(container, [
      { label: 'Target is Hot',          value: -1 },
      { label: 'Target is in Water',     value:  1 },
      { label: 'Target is Behind Cover', value:  1 },
    ], onComplete);
  },
};
