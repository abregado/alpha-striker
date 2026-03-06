import type { AttackResult, DiceRoll } from '../types';
import { animateCounter, wait } from '../lib/animate';
import { playRoll, playHit, playCrit, playMiss } from '../lib/audio';
import { burstCrit } from '../lib/particles';

const DIE_CYCLE_MS = 900;
const DIE_GAP_MS   = 500;

export async function showResults(
  container: HTMLElement,
  result: AttackResult,
  onReroll: () => void,
  onNewAttack: () => void,
) {
  container.innerHTML = '';
  container.className = 'results-screen';

  // ── Target number breakdown ───────────────────────────────────────────────
  const tnEl = document.createElement('div');
  tnEl.className = 'results-target';
  tnEl.innerHTML = `
    <span class="results-target__label">Target Number</span>
    <span class="results-target__value">${result.targetNumber}</span>
  `;
  container.appendChild(tnEl);

  // ── Dice section ──────────────────────────────────────────────────────────
  const diceSection = document.createElement('div');
  diceSection.className = 'dice-section';
  container.appendChild(diceSection);

  const diceGrid = document.createElement('div');
  diceGrid.className = 'dice-grid';
  diceSection.appendChild(diceGrid);

  // ── Summary (rendered but hidden until end) ───────────────────────────────
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

  // ── Animate each die ──────────────────────────────────────────────────────
  for (let i = 0; i < result.rolls.length; i++) {
    const roll = result.rolls[i];
    const dieEl = createDieCard(i + 1);
    diceGrid.appendChild(dieEl);

    // Stagger appearance
    await wait(i === 0 ? 300 : DIE_GAP_MS);

    // Animate entrance
    dieEl.classList.add('die--entering');
    await wait(50); // allow layout
    dieEl.classList.remove('die--entering');
    dieEl.classList.add('die--visible');

    // Roll sound + cycling
    playRoll();
    const valueEl = dieEl.querySelector('.die__value') as HTMLElement;
    await animateCounter(valueEl, roll.total, DIE_CYCLE_MS, 2, 12);

    // Reveal result
    await wait(200);
    await revealDie(dieEl, roll);
  }

  // ── Show summary ──────────────────────────────────────────────────────────
  await wait(600);

  const hitText = result.hits === 1 ? '1 Hit' : `${result.hits} Hits`;
  const critText = result.crits > 0
    ? `<span class="summary-crits">${result.crits} Critical${result.crits > 1 ? 's' : ''}!</span>`
    : '';

  summary.innerHTML = `
    <div class="summary-hits">${hitText}</div>
    ${critText}
  `;
  summary.classList.remove('results-summary--hidden');
  summary.classList.add('results-summary--show');

  rerollBtn.classList.remove('results-summary--hidden');
  rerollBtn.classList.add('results-summary--show');

  newAttackBtn.classList.remove('results-summary--hidden');
  newAttackBtn.classList.add('results-summary--show');
}

function createDieCard(index: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 'die die--entering';
  card.innerHTML = `
    <span class="die__index">${index}</span>
    <span class="die__value">—</span>
    <span class="die__result"></span>
  `;
  return card;
}

async function revealDie(dieEl: HTMLElement, roll: DiceRoll): Promise<void> {
  const resultEl = dieEl.querySelector('.die__result') as HTMLElement;

  if (roll.isCrit) {
    dieEl.classList.add('die--crit');
    resultEl.textContent = 'CRITICAL!';
    playCrit();
    await wait(150);
    burstCrit(dieEl);
  } else if (roll.isHit) {
    dieEl.classList.add('die--hit');
    resultEl.textContent = 'HIT';
    playHit();
  } else {
    dieEl.classList.add('die--miss');
    resultEl.textContent = 'miss';
    playMiss();
  }

  await wait(400);
}
