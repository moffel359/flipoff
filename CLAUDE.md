# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step, no npm, no dependencies. ES6 module imports require a local server — opening `index.html` directly via `file://` will not work.

**With Node.js** (no installation needed beyond Node itself):
```bash
npx serve .
# Open http://localhost:3000
```

**With Python:**
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

## Architecture

FlipOff is a split-flap display emulator — pure vanilla HTML/CSS/JS with ES6 modules. No frameworks, no build tools.

**Module responsibilities:**

- `js/constants.js` — grid dimensions (22×5), stagger/interval timing, character set, colors, default messages; `SCRAMBLE_DURATION`/`FLIP_DURATION` were removed (unused after animation rewrite)
- `js/Board.js` — grid manager; builds DOM, formats messages to grid, orchestrates staggered tile animations, cycles accent colors; accepts an `actions` object `{ next, prev, mute, fullscreen }` for the keyboard-hint overlay buttons
- `js/Tile.js` — individual tile; flip timing constants (`HALF_FLIP`, `MIN_FLIPS`, `MAX_FLIPS`) live here; if changed, update `TOTAL_TRANSITION` in `constants.js` accordingly
- `js/SoundEngine.js` — Web Audio API wrapper; plays one clip per message transition using base64-embedded audio from `flapAudio.js`
- `js/MessageRotator.js` — auto-rotates through messages; manual `next()`/`prev()` resume auto-rotation if paused and fire `_onResume` callback for UI sync
- `js/KeyboardController.js` — keyboard shortcuts: Enter/Space (next), ←/→ (prev/next), F (fullscreen), M (mute), Escape (exit fullscreen)
- `js/main.js` — entry point; wires all modules via a lazy `actions` object, handles browser autoplay policy; calls `fitBoard()` once before `rotator.start()` to avoid initial layout flash

**CSS files:** `reset.css`, `layout.css`, `board.css`, `tile.css`, `responsive.css`

## Key Patterns

- **Transition gating:** `Board.isTransitioning` prevents overlapping animations — always check before triggering a message change
- **Change detection:** `Board.displayMessage()` compares new grid against previous state; only changed tiles scramble
- **Tile flip sequence:** stagger delay → `MIN_FLIPS`–`MAX_FLIPS` rapid character flips (`HALF_FLIP` ms each) → final character settles with bounce ease
- **Single audio clip:** one sound plays per message transition regardless of how many tiles change
- **Overlay actions:** the "N" keyboard-hint button opens a shortcuts overlay whose entries are real buttons; actions are wired via a lazy `actions` object in `main.js` so `Board` is created before `MessageRotator` without circular dependencies
- **Auto-resume on navigate:** `MessageRotator.next()`/`prev()` clear `_paused` and fire `_onResume?.()` — the panel's Auto button stays in sync
- **Board sizing:** `fitBoard()` runs synchronously before `rotator.start()` to set `--tile-size` before the first message renders; `ResizeObserver` keeps it live thereafter
- **All customization:** edit `js/constants.js` for grid size, timing, colors, or messages; flip speed in `js/Tile.js`
