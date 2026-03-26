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

- `js/constants.js` — all configuration: grid dimensions (22×5), animation timing, character set, scramble/accent colors, hardcoded messages
- `js/Board.js` — grid manager; builds DOM, formats messages to grid, orchestrates staggered tile animations, cycles accent colors
- `js/Tile.js` — individual tile; handles scramble animation (stagger → random chars → color cycle → final 3D flip)
- `js/SoundEngine.js` — Web Audio API wrapper; plays one clip per message transition using base64-embedded audio from `flapAudio.js`
- `js/MessageRotator.js` — auto-rotates through messages; resets timer on manual navigation
- `js/KeyboardController.js` — keyboard shortcuts: Enter/Space (next), ←/→ (prev/next), F (fullscreen), M (mute), Escape (exit fullscreen)
- `js/main.js` — entry point; wires all modules, handles browser autoplay policy

**CSS files:** `reset.css`, `layout.css`, `board.css`, `tile.css`, `responsive.css`

## Key Patterns

- **Transition gating:** `Board.isTransitioning` prevents overlapping animations — always check before triggering a message change
- **Change detection:** `Board.displayMessage()` compares new grid against previous state; only changed tiles scramble
- **Tile scramble sequence:** stagger delay → 10–13 rapid random characters (70ms each) → color cycling → final character with 3D flip keyframe
- **Single audio clip:** one sound plays per message transition regardless of how many tiles change
- **All customization:** edit `js/constants.js` to change grid size, timing, colors, or messages
