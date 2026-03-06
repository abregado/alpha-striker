import type { StepDefinition } from '../types';
import { makeOptionGrid } from './stepHelpers';

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

    let selectedType = -1; // -1 = random per die

    for (let i = 0; i < WEAPON_LABELS.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'weapon-type-btn';
      btn.setAttribute('type', 'button');
      btn.textContent = WEAPON_LABELS[i];
      btn.dataset.wtype = String(i);

      btn.addEventListener('click', () => {
        if (selectedType === i) {
          // Deselect → back to random
          selectedType = -1;
          btn.classList.remove('weapon-type-btn--active');
          onExtra?.('weaponType', -1);
        } else {
          selectedType = i;
          row.querySelectorAll('.weapon-type-btn').forEach(b => b.classList.remove('weapon-type-btn--active'));
          btn.classList.add('weapon-type-btn--active');
          onExtra?.('weaponType', i);
        }
      });

      row.appendChild(btn);
    }

    section.appendChild(row);
    container.appendChild(section);
  },
};
