# Alpha Strike Attack Resolver — Features

## Game Rules Implemented

### Target Number
`targetNumber = Skill + Heat + AMM + TMM + Other + Range`

For each damage point, roll 2d6:
- Roll ≥ target number → **Hit**
- Roll = 12 → **Critical Hit** (always hits regardless of target number)

### Modifiers
| Step | Options | Modifier |
|---|---|---|
| AMM | Standstill | −1 |
| AMM | Walk | +0 |
| AMM | Jump | +2 |
| Other | Target is Hot | −1 |
| Other | Target is in Water | +1 |
| Other | Target is Behind Cover | +1 |
| Range | Short | +0 |
| Range | Medium | +2 |
| Range | Long | +4 |

## Step Pipeline
Steps are defined in `src/steps/` and registered in the `STEPS[]` array in `src/main.ts`.
Order in the array = order shown to the player.

| Step | File | Input type |
|---|---|---|
| Damage Rating | `damageStep.ts` | Grid (1–8) |
| Pilot Skill | `skillStep.ts` | Grid (0–5 with labels) |
| Attacker Heat | `heatStep.ts` | Grid (0–3 with labels) |
| Attacker Movement (AMM) | `ammStep.ts` | Cards (Standstill / Walk / Jump) |
| Target Movement (TMM) | `tmmStep.ts` | Grid (−4, 0–5) |
| Other Modifiers | `otherStep.ts` | Multi-select toggles + Confirm |
| Range Band | `rangeStep.ts` | Cards (Short / Medium / Long) |

### Adding a new step
1. Create `src/steps/myStep.ts` exporting a `StepDefinition`
2. Choose a helper from `src/steps/stepHelpers.ts`:
   - `makeOptionGrid` — tap-to-advance number/value grid
   - `makeCardOptions` — tall tap-to-advance cards (2–4 options)
   - `makeToggleOptions` — multi-select with Confirm button
3. Add the new step object to `STEPS[]` in `src/main.ts`
4. Add the collected value to the `AttackData` mapping in `showResultsScreen()` in `src/main.ts`
5. Include the value in the `targetNumber` calculation in `src/engine.ts`

## Results Screen
- Displays the calculated target number
- Animates each die in sequence: slot-machine number cycling → locks on result
- Per-die reveal: **HIT** (green glow), **miss** (muted), **CRITICAL!** (red pulse + canvas particle burst)
- Sound effects for each outcome via Web Audio API (no audio files — fully procedural)
- Summary shows total hits and criticals
- "Roll Again" resets to step 1

## PWA & Deployment

### GitHub Pages
- Live URL: `https://abregado.github.io/alpha-striker/`
- Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- Build output: `./dist` (Vite, base path `/alpha-striker/`)
- **One-time setup**: Repo Settings → Pages → Source → **GitHub Actions**

### PWA (installable offline app)
- `public/manifest.json` — app name, colors, icon, standalone display
- `public/icon.svg` — orange targeting reticle on dark background
- `public/sw.js` — cache-first service worker; precaches index, caches all fetched assets
- SW registered inline in `index.html` bottom of `<body>`
- Install via Chrome Android menu → "Add to Home Screen"

## Key Files
| File | Purpose |
|---|---|
| `src/main.ts` | App entry, step pipeline, navigation |
| `src/types.ts` | `AttackData`, `DiceRoll`, `AttackResult`, `StepDefinition` |
| `src/engine.ts` | `resolveAttack()` — pure dice logic |
| `src/style.css` | All styles (mobile-first, dark military theme) |
| `src/lib/animate.ts` | `tween()`, `animateCounter()`, `wait()` |
| `src/lib/audio.ts` | Procedural SFX via Web Audio API |
| `src/lib/particles.ts` | Canvas particle burst for critical hits |
| `src/results/results.ts` | Animated results reveal sequence |
