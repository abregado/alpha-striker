import './style.css';
import { initFullscreen } from './fullscreen';
import type { AttackData, AttackState, StepDefinition } from './types';
import { resolveAttack } from './engine';
import { resumeAudio } from './lib/audio';
import { damageStep } from './steps/damageStep';
import { skillStep }  from './steps/skillStep';
import { heatStep }   from './steps/heatStep';
import { ammStep }    from './steps/ammStep';
import { tmmStep }    from './steps/tmmStep';
import { otherStep }  from './steps/otherStep';
import { rangeStep }  from './steps/rangeStep';
import { showResults } from './results/results';

// ── Step pipeline (add new steps here) ───────────────────────────────────────
const STEPS: StepDefinition[] = [
  damageStep,
  skillStep,
  heatStep,
  ammStep,
  tmmStep,
  otherStep,
  rangeStep,
];

// ── State ─────────────────────────────────────────────────────────────────────
let currentStep = 0;
let state: AttackState = {};

function back() {
  if (currentStep > 0) {
    currentStep--;
    renderStep(currentStep);
  }
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const progressFill  = document.getElementById('progress-bar-fill')!;
const stepLabel     = document.getElementById('step-label')!;
const main          = document.getElementById('app-main')!;
const header        = document.getElementById('app-header')!;

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderStep(index: number) {
  const step = STEPS[index];
  const progress = ((index) / STEPS.length) * 100;

  progressFill.style.width = `${progress}%`;
  stepLabel.textContent = `${index + 1} / ${STEPS.length} — ${step.label}`;

  // Slide out current content
  main.classList.add('main--exit');

  setTimeout(() => {
    main.innerHTML = '';
    main.classList.remove('main--exit');

    // Back button (all steps except the first)
    if (index > 0) {
      const backBtn = document.createElement('button');
      backBtn.className = 'back-btn';
      backBtn.textContent = '← Back';
      backBtn.addEventListener('click', back);
      main.appendChild(backBtn);
    }

    // Title block
    const titleBlock = document.createElement('div');
    titleBlock.className = 'step-title-block';

    const h1 = document.createElement('h1');
    h1.className = 'step-title';
    h1.textContent = step.title;
    titleBlock.appendChild(h1);

    if (step.subtitle) {
      const sub = document.createElement('p');
      sub.className = 'step-subtitle';
      sub.textContent = step.subtitle;
      titleBlock.appendChild(sub);
    }

    main.appendChild(titleBlock);

    // Step content
    const content = document.createElement('div');
    content.className = 'step-content';
    main.appendChild(content);

    step.render(content, (value) => {
      resumeAudio();
      state[step.id] = value;
      advance();
    });

    main.classList.add('main--enter');
    setTimeout(() => main.classList.remove('main--enter'), 200);
  }, 120);
}

function advance() {
  currentStep++;
  if (currentStep < STEPS.length) {
    renderStep(currentStep);
  } else {
    showResultsScreen();
  }
}

function showResultsScreen() {
  progressFill.style.width = '100%';
  stepLabel.textContent = 'Results';

  main.classList.add('main--exit');

  setTimeout(() => {
    main.innerHTML = '';
    main.classList.remove('main--exit');

    const data: AttackData = {
      damage: state['damage'] ?? 1,
      skill:  state['skill']  ?? 3,
      heat:   state['heat']   ?? 0,
      amm:    state['amm']    ?? 0,
      tmm:    state['tmm']    ?? 0,
      other:  state['other']  ?? 0,
      range:  state['range']  ?? 0,
    };

    const result = resolveAttack(data);

    showResults(
      main,
      result,
      () => showResultsScreen(),   // reroll: re-resolve with same state
      () => {                       // new attack: reset everything
        currentStep = 0;
        state = {};
        header.classList.remove('header--hidden');
        renderStep(0);
      },
    );

    main.classList.add('main--enter');
    setTimeout(() => main.classList.remove('main--enter'), 200);
  }, 120);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
initFullscreen();
renderStep(0);
