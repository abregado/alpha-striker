export interface OptionItem {
  label: string;
  sublabel?: string;
  value: number;
}

/**
 * Renders a vertical list of tap-to-select buttons that auto-advance on selection.
 */
export function makeOptionGrid(
  container: HTMLElement,
  items: OptionItem[],
  onComplete: (value: number) => void,
) {
  const grid = document.createElement('div');
  grid.className = 'option-grid';

  for (const item of items) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('type', 'button');

    const labelEl = document.createElement('span');
    labelEl.className = 'option-btn__label';
    labelEl.textContent = item.label;
    btn.appendChild(labelEl);

    if (item.sublabel) {
      const sub = document.createElement('span');
      sub.className = 'option-btn__sublabel';
      sub.textContent = item.sublabel;
      btn.appendChild(sub);
    }

    btn.addEventListener('click', () => {
      btn.classList.add('option-btn--selected');
      // Small delay so the selection flash is visible before transition
      setTimeout(() => onComplete(item.value), 150);
    });

    grid.appendChild(btn);
  }

  container.appendChild(grid);
}

/**
 * Renders tall card-style buttons (for 2–4 options like AMM / Range).
 */
export function makeCardOptions(
  container: HTMLElement,
  items: OptionItem[],
  onComplete: (value: number) => void,
) {
  const wrap = document.createElement('div');
  wrap.className = 'card-options';

  for (const item of items) {
    const btn = document.createElement('button');
    btn.className = 'card-option-btn';
    btn.setAttribute('type', 'button');

    const labelEl = document.createElement('span');
    labelEl.className = 'card-option-btn__label';
    labelEl.textContent = item.label;
    btn.appendChild(labelEl);

    if (item.sublabel) {
      const sub = document.createElement('span');
      sub.className = 'card-option-btn__sublabel';
      sub.textContent = item.sublabel;
      btn.appendChild(sub);
    }

    btn.addEventListener('click', () => {
      btn.classList.add('card-option-btn--selected');
      setTimeout(() => onComplete(item.value), 150);
    });

    wrap.appendChild(btn);
  }

  container.appendChild(wrap);
}

/**
 * Renders toggle buttons for multi-select (Other modifiers).
 * Returns a "Confirm" button that fires onComplete with the summed value.
 */
export function makeToggleOptions(
  container: HTMLElement,
  items: OptionItem[],
  onComplete: (value: number) => void,
) {
  const wrap = document.createElement('div');
  wrap.className = 'toggle-options';

  const selected = new Set<number>();

  for (const item of items) {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.setAttribute('type', 'button');

    const labelEl = document.createElement('span');
    labelEl.className = 'toggle-btn__label';
    labelEl.textContent = item.label;

    const modEl = document.createElement('span');
    modEl.className = 'toggle-btn__mod';
    modEl.textContent = item.value > 0 ? `+${item.value}` : String(item.value);

    btn.appendChild(labelEl);
    btn.appendChild(modEl);

    btn.addEventListener('click', () => {
      if (selected.has(item.value)) {
        selected.delete(item.value);
        btn.classList.remove('toggle-btn--active');
      } else {
        selected.add(item.value);
        btn.classList.add('toggle-btn--active');
      }
    });

    wrap.appendChild(btn);
  }

  const confirm = document.createElement('button');
  confirm.className = 'confirm-btn';
  confirm.setAttribute('type', 'button');
  confirm.textContent = 'Confirm';
  confirm.addEventListener('click', () => {
    let total = 0;
    selected.forEach(v => { total += v; });
    confirm.classList.add('confirm-btn--flash');
    setTimeout(() => onComplete(total), 150);
  });

  container.appendChild(wrap);
  container.appendChild(confirm);
}
