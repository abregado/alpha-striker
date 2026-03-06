import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

// Bitmask: bit 0 = Laser, bit 1 = Ballistic, bit 2 = Missile
// 0 = none selected (treat as all available)
const WEAPON_LABELS = ['Laser', 'Ballistic', 'Missile'];

export const damageStep: StepDefinition = {
  id: 'damage',
  label: 'Damage',
  title: 'Damage Rating',
  subtitle: 'How many shots is the attacker firing?',
  render(container, onComplete, onExtra) {
    makeOptionGrid(container, [1, 2, 3, 4, 5, 6, 7, 8].map(v => ({
      label: String(v),
      value: v,
    })), onComplete);

    // ── Weapon type section ────────────────────────────────────────────────
    const section = document.createElement('div');
    section.className = 'weapon-type-section';

    const sectionLabel = document.createElement('p');
    sectionLabel.className = 'weapon-type-label';
    sectionLabel.textContent = 'Weapon Type (optional)';
    section.appendChild(sectionLabel);

    const row = document.createElement('div');
    row.className = 'weapon-type-row';

    let mask = 0;

    for (let i = 0; i < WEAPON_LABELS.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'weapon-type-btn';
      btn.setAttribute('type', 'button');
      btn.textContent = WEAPON_LABELS[i];
      btn.dataset.wtype = String(i);

      btn.addEventListener('click', () => {
        const bit = 1 << i;
        if (mask & bit) {
          mask &= ~bit;
          btn.classList.remove('weapon-type-btn--active');
        } else {
          mask |= bit;
          btn.classList.add('weapon-type-btn--active');
        }
        onExtra?.('weaponType', mask);
      });

      row.appendChild(btn);
    }

    section.appendChild(row);
    container.appendChild(section);
  },
};
