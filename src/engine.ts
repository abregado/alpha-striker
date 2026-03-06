import type { AttackData, AttackResult, DiceRoll } from './types';

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function resolveAttack(data: AttackData): AttackResult {
  const targetNumber =
    data.skill + data.heat + data.amm + data.tmm + data.other + data.range;

  const rolls: DiceRoll[] = [];
  for (let i = 0; i < data.damage; i++) {
    const d1 = rollD6();
    const d2 = rollD6();
    const total = d1 + d2;
    const isCrit = total === 12;
    const isHit = isCrit || total >= targetNumber;
    rolls.push({ d1, d2, total, isHit, isCrit });
  }

  return {
    targetNumber,
    rolls,
    hits: rolls.filter(r => r.isHit).length,
    crits: rolls.filter(r => r.isCrit).length,
  };
}
