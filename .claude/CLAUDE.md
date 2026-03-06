## Instructions for claude
Always ask clarifying questions in planning mode if you dont know exactly what I want
Dont make decisions on your own
If necessary, update this file after implementing each feature, or having a discussion about features.
If a task is too large for your context, then break it into several steps and write the plan here before starting with the first step
Keep CLAUDE.md as small as possible, write yourself addition documentation for each feature as we go. Link back to those files here.
You never need to run the build for me, i will do that in a separate termainla window
you never need to do git commands, I will do that myself
Dont use dependencies if we can just implement the feature that we need from the library

## Overview
A mobile-first (portrait) tool for resolving shooting attacks in Battletech Alpha Strike.
Asks a series of questions, rolls dice, and reveals results with sound and animation.

## Tech Stack
- Vanilla TypeScript, HTML, CSS
- Vite (build/dev server only — no runtime dependencies)
- Web Audio API (procedural SFX)
- Canvas API (particle effects)
- requestAnimationFrame (animations)

## Documentation

- [Features & architecture](.claude/docs/features.md) — game rules, step pipeline, key files, how to add steps


