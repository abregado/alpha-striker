import type { AttackResult, DiceRoll } from '../types';
import { wait } from '../lib/animate';
import { playWeaponShoot, playWeaponHit, playWeaponMiss, playWeaponCrit } from '../lib/audio';
import { burstCrit } from '../lib/particles';

// Decode a weapon type bitmask into a pool of available type indices.
// 0 (or all bits set) = all three types available.
function weaponPool(mask: number): number[] {
  if (!mask || mask === 7) return [0, 1, 2];
  const pool: number[] = [];
  if (mask & 1) pool.push(0);
  if (mask & 2) pool.push(1);
  if (mask & 4) pool.push(2);
  return pool.length ? pool : [0, 1, 2];
}

const STAGGER_MS = 250;
const FILL_MS    = 500;
const PAUSE_MS   = 150;
const DRAIN_MS   = 400;
const BASE_MS    = 80;

const WEAPON_SHORT = ['L', 'B', 'M'];  // badge labels
// Badge colors per type (laser=blue, ballistic=orange, missile=purple)
const WEAPON_BADGE_COLOR = ['#60a5fa', '#fb923c', '#a78bfa'];

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

function createDieRow(index: number, dieType: number): HTMLElement {
  const row = document.createElement('div');
  row.className = 'die-row';

  const idx = document.createElement('span');
  idx.className = 'die-row__index';
  idx.textContent = String(index);

  const badge = document.createElement('span');
  badge.className = 'die-row__type';
  badge.textContent = WEAPON_SHORT[dieType];
  badge.style.color = WEAPON_BADGE_COLOR[dieType];
  badge.style.borderColor = WEAPON_BADGE_COLOR[dieType];

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

  row.append(idx, badge, pipsEl, result);
  return row;
}

function animatePips(pipsEl: HTMLElement, finalValue: number): Promise<void> {
  return new Promise(resolve => {
    const pips = Array.from(pipsEl.querySelectorAll('.die-pip')) as HTMLElement[];
    const finalIdx = finalValue - 2;

    const fillStep = FILL_MS / 11;
    for (let i = 0; i < 11; i++) {
      setTimeout(() => pips[i].classList.add('die-pip--active'), i * fillStep);
    }

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

function revealDieRow(dieEl: HTMLElement, roll: DiceRoll, dieType: number): void {
  const resultEl = dieEl.querySelector('.die-row__result') as HTMLElement;
  if (roll.isCrit) {
    dieEl.classList.add('die-row--crit');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">CRIT!</span>`;
    playWeaponCrit();
    burstCrit(dieEl);
  } else if (roll.isHit) {
    dieEl.classList.add('die-row--hit');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">HIT</span>`;
    playWeaponHit(dieType);
  } else {
    dieEl.classList.add('die-row--miss');
    resultEl.innerHTML = `<span class="die-row__value">${roll.total}</span><span class="die-row__label">miss</span>`;
    playWeaponMiss(dieType);
  }
}

async function animateDieRow(
  dieEl: HTMLElement,
  roll: DiceRoll,
  dieType: number,
  delay: number,
): Promise<void> {
  await wait(BASE_MS + delay);

  dieEl.classList.add('die-row--visible');
  playWeaponShoot(dieType);

  const pipsEl = dieEl.querySelector('.die-row__pips') as HTMLElement;
  await animatePips(pipsEl, roll.total);

  revealDieRow(dieEl, roll, dieType);
}

export async function showResults(
  container: HTMLElement,
  result: AttackResult,
  weaponType: number,        // -1 = random per die, 0=laser, 1=ballistic, 2=missile
  onReroll: () => void,
  onNewAttack: () => void,
) {
  container.innerHTML = '';
  container.className = 'results-screen';

  const tnEl = document.createElement('div');
  tnEl.className = 'results-target';
  tnEl.innerHTML = `
    <span class="results-target__label">Target Number</span>
    <span class="results-target__value">${result.targetNumber}</span>
  `;
  container.appendChild(tnEl);

  const diceList = document.createElement('div');
  diceList.className = 'dice-list';
  container.appendChild(diceList);

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

  const pool = weaponPool(weaponType);
  const promises = result.rolls.map((roll, i) => {
    const dieType = pool[Math.floor(Math.random() * pool.length)];
    const dieEl = createDieRow(i + 1, dieType);
    diceList.appendChild(dieEl);
    return animateDieRow(dieEl, roll, dieType, i * STAGGER_MS);
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
