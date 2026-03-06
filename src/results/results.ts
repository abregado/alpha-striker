import type { AttackResult, DiceRoll } from '../types';
import { wait } from '../lib/animate';
import { playRoll, playHit, playCrit, playMiss } from '../lib/audio';
import { burstCrit } from '../lib/particles';

const STAGGER_MS = 250;   // delay between each die appearing
const FILL_MS    = 500;   // time to fill all 11 pips
const PAUSE_MS   = 150;   // hold at full before draining
const DRAIN_MS   = 400;   // time to drain back to rolled value
const BASE_MS    = 80;    // initial delay to ensure DOM is painted

// pip index 0–10 maps to die value 2–12
function pipColor(index: number): string {
  const t = index / 10;
  if (t <= 0.5) {
    const s = t / 0.5;
    return `rgb(${lerp(239,234,s)},${lerp(68,179,s)},${lerp(68,8,s)})`;
  } else {
    const s = (t - 0.5) / 0.5;
    return `rgb(${lerp(234,52,s)},${lerp(179,211,s)},${lerp(8,153,s)})`;
  }
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function createDieRow(index: number): HTMLElement {
  const row = document.createElement('div');
  row.className = 'die-row';

  const idx = document.createElement('span');
  idx.className = 'die-row__index';
  idx.textContent = String(index);

  const pipsEl = document.createElement('div');
  pipsEl.className = 'die-row__pips';
  for (let i = 0; i < 11; i++) {
    const pip = document.createElement('div');
    pip.className = 'die-pip';
    pip.style.setProperty('--pip-color', pipColor(i));
    pipsEl.appendChild(pip);
  }

  const result = document.createElement('div');
  result.className = 'die-row__result';

  row.append(idx, pipsEl, result);
  return row;
}

function animatePips(pipsEl: HTMLElement, finalValue: number): Promise<void> {
  return new Promise(resolve => {
    const pips = Array.from(pipsEl.querySelectorAll('.die-pip')) as HTMLElement[];
    const finalIdx = finalValue - 2; // 0-indexed pip for the rolled value

    // Phase 1: fill all 11 pips left to right
    const fillStep = FILL_MS / 11;
    for (let i = 0; i < 11; i++) {
      setTimeout(() => pips[i].classList.add('die-pip--active'), i * fillStep);
    }

    // Phase 2: drain from right, stopping at finalIdx
    const drainCount = 10 - finalIdx;
    if (drainCount > 0) {
      const drainStep = DRAIN_MS / drainCount;
      for (let j = 0; j < drainCount; j++) {
        setTimeout(
          () => pips[10 - j].classList.remove('die-pip--active'),
          FILL_MS + PAUSE_MS + j * drainStep,
        );
      }
    }

    setTimeout(resolve, FILL_MS + PAUSE_MS + DRAIN_MS);
  });
}

function revealDieRow(dieEl: HTMLElement, roll: DiceRoll): void {
  const resultEl = dieEl.querySelector('.die-row__result') as HTMLElement;
  if (roll.isCrit) {
    dieEl.classList.add('die-row--crit');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">CRIT!</span>`;
    playCrit();
    burstCrit(dieEl);
  } else if (roll.isHit) {
    dieEl.classList.add('die-row--hit');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">HIT</span>`;
    playHit();
  } else {
    dieEl.classList.add('die-row--miss');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">miss</span>`;
    playMiss();
  }
}

async function animateDieRow(dieEl: HTMLElement, roll: DiceRoll, delay: number): Promise<void> {
  await wait(BASE_MS + delay);

  dieEl.classList.add('die-row--visible');
  playRoll();

  const pipsEl = dieEl.querySelector('.die-row__pips') as HTMLElement;
  await animatePips(pipsEl, roll.total);

  revealDieRow(dieEl, roll);
}

export async function showResults(
  container: HTMLElement,
  result: AttackResult,
  onReroll: () => void,
  onNewAttack: () => void,
) {
  container.innerHTML = '';
  container.className = 'results-screen';

  // Target number
  const tnEl = document.createElement('div');
  tnEl.className = 'results-target';
  tnEl.innerHTML = `
    <span class="results-target__label">Target Number</span>
    <span class="results-target__value">${result.targetNumber}</span>
  `;
  container.appendChild(tnEl);

  // Vertical dice list
  const diceList = document.createElement('div');
  diceList.className = 'dice-list';
  container.appendChild(diceList);

  // Summary (hidden initially)
  const summary = document.createElement('div');
  summary.className = 'results-summary results-summary--hidden';
  container.appendChild(summary);

  const rerollBtn = document.createElement('button');
  rerollBtn.className = 'reroll-btn results-summary--hidden';
  rerollBtn.textContent = 'Reroll Same Attack';
  rerollBtn.addEventListener('click', onReroll);
  container.appendChild(rerollBtn);

  const newAttackBtn = document.createElement('button');
  newAttackBtn.className = 'new-attack-btn results-summary--hidden';
  newAttackBtn.textContent = 'New Attack';
  newAttackBtn.addEventListener('click', onNewAttack);
  container.appendChild(newAttackBtn);

  // Launch all die animations in parallel with staggered start times
  const promises = result.rolls.map((roll, i) => {
    const dieEl = createDieRow(i + 1);
    diceList.appendChild(dieEl);
    return animateDieRow(dieEl, roll, i * STAGGER_MS);
  });

  await Promise.all(promises);
  await wait(400);

  const hitText = result.hits === 1 ? '1 Hit' : `${result.hits} Hits`;
  const critText = result.crits > 0
    ? `<span class="summary-crits">${result.crits} Critical${result.crits > 1 ? 's' : ''}!</span>`
    : '';

  summary.innerHTML = `<div class="summary-hits">${hitText}</div>${critText}`;
  summary.classList.remove('results-summary--hidden');
  summary.classList.add('results-summary--show');

  rerollBtn.classList.remove('results-summary--hidden');
  rerollBtn.classList.add('results-summary--show');

  newAttackBtn.classList.remove('results-summary--hidden');
  newAttackBtn.classList.add('results-summary--show');
}
