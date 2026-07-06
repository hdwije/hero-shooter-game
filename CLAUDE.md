# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small two-level browser shooter game: an arrow-key-controlled hero with a gun fights enemies (patrol/chaser types) across two levels of increasing difficulty, then rescues a princess. Built as plain HTML5 Canvas + vanilla JavaScript — no framework, no bundler, no package.json, no test suite.

## Running the game

Open `index.html` directly in a browser (e.g. `start index.html` on Windows) — there is no dev server, build step, or module system. Scripts are loaded as plain `<script src="...">` tags, not ES modules, specifically so the game also works when opened via `file://`.

There is no linter or test suite configured. To catch syntax errors after editing a script, run:
```
node --check js/<file>.js
```

## Script load order (must be preserved)

`index.html` loads scripts in this exact dependency order — later files reference globals defined by earlier ones, with no module imports/exports:
```
js/constants.js → js/input.js → js/entities.js → js/collision.js → js/levels.js → js/game.js
```
If you add a new script or reorder existing ones, respect this dependency chain.

## Architecture

**State machine (`js/game.js`):** a single `gameState` string (`start | playing | levelTransition | gameover | win`) drives both `update(dt)` and `render()`, each a switch statement dispatching to per-state handler functions (`updatePlaying`, `renderPlayingScene`, etc.). All game globals (`hero`, `enemies`, `bullets`, `princess`, `currentLevel`) live as module-level `let` bindings in `game.js`, reassigned wholesale (e.g. `enemies = enemies.filter(...)`) rather than mutated through any store/class abstraction.

**Game loop:** single `requestAnimationFrame` loop in `game.js` (`loop` → `update(dt)` → `render()`), with `dt` clamped to 50ms to avoid large jumps after tab-switch.

**Entities (`js/entities.js`):** plain object factories (`createHero`, `createEnemy`, `createBullet`, `createPrincess`) — no classes. All movable entities share a common shape (`x, y, w, h, facing, hp, alive, animTimer, muzzleFlashTimer, deathTimer`). `alive: false` doesn't immediately remove an entity — it starts a fade via `deathTimer` (see `DEATH_FADE_MS` in `constants.js`), and entities are filtered out of their array only once the fade completes (in `updatePlaying` in `game.js`).

**Rendering is shape-only, no image/sprite assets.** `drawCharacter` in `entities.js` composes a body from primitive canvas draws (rect torso, circle head, two leg rects with a sine-driven walk-cycle offset, a gun rect oriented via `DIRECTION_VECTORS[facing]`). Muzzle flash and death-fade are also just timers driving primitive draws/alpha — there's no animation/sprite library involved.

**Input (`js/input.js`):** a single `keys` map populated by keydown/keyup on `e.code`. Facing direction is derived from the movement axis each frame (`getFacingFromMovement`) and persists once movement stops. Firing is rate-limited via a cooldown timer (`hero.fireCooldown`) rather than key-up edge detection — holding Space just does nothing until the cooldown expires.

**Enemy difficulty is data-driven, not code-driven.** There are only two enemy AI behaviors (`chaser` moves toward the hero and fires when roughly x/y-aligned; `patrol` paces back and forth on one axis and fires on a fixed timer), both implemented once in `updateEnemyAI` (`game.js`). Level 2 is harder purely because `js/levels.js` gives its enemies higher speed, shorter fire cooldowns, more hp, and more chasers — not because of any level-specific code path.

**Collision (`js/collision.js`):** circle-distance checks (`circleHit`) using an approximate radius (`max(w, h) / 2`) for every entity; no AABB, no spatial partitioning — fine at this entity count. `clampToBounds` keeps hero/enemies on-canvas; there are no walls or obstacles.

**Levels (`js/levels.js`):** `LEVELS` is a plain array of two config objects (hero start position + list of enemy configs). `loadLevel(index, hero)` repositions the hero in place and returns fresh `{ enemies, bullets }` arrays built from that config — it does not mutate global state directly, `game.js` assigns the result.

## Git workflow

This project is tracked in git and pushed to `origin` → https://github.com/hdwije/hero-shooter-game (public).
