# FlipOff. (Fork)

**Turn any TV into a retro split-flap display.** The classic flip-board look, without the $3,500 hardware. And it's free.

![FlipOff Screenshot](screenshot.png)

> This is a fork of the original [FlipOff](https://github.com/nickolasburr/flipoff) project. All credit for the original concept, design, and sound goes to the original author.

## What Changed in This Fork

### Authentic flip animation
The original colorful scramble animation was replaced with a mechanical split-flap flip inspired by classic airport and train station display boards. Each tile is split into upper and lower halves — the top flap folds backward with an accelerating ease while the bottom flap falls into place with a subtle mechanical bounce. Tiles cycle through 3–6 rapid intermediate characters before landing on the target.

The visual design aims for an authentic look: warm anthracite flap surfaces with top-light gradients, off-white condensed typography (`Arial Narrow`), a 2 px dark seam gap, and a dynamic shadow overlay that appears on the lower half while the upper flap is mid-air.

### Built-in message editor
A message manager panel below the board lets you create, edit, and delete messages directly in the browser — no need to touch `constants.js`. Messages are added to the auto-rotation pool and can be displayed immediately.

- **Pill selector** — switch between stored messages by clicking their preview tab
- **Line-by-line editor** — 5 input rows (one per grid row), max 22 characters each, with live character counter
- **Add / Delete** — grow or shrink the message pool on the fly
- **Anzeigen (Display)** — show the selected message immediately and pause rotation
- **Auto** — resume cycling through all messages

### Dynamic board sizing
The board now fills the available viewport space automatically. A `ResizeObserver` recalculates the tile size whenever the window or container changes — including fullscreen transitions. The hardcoded responsive `--tile-size` breakpoints were removed in favor of this approach.

### Removed sign-up gate
The hero section with the email input and "Get Early Access" button was removed. The app starts immediately.

## Quick Start

This is a static site — no build step, no npm, no dependencies. ES6 modules require a local server (not `file://`).

```bash
# Node.js (recommended)
npx serve .
# Then open http://localhost:3000

# Python
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Next message |
| `Arrow Left` | Previous message |
| `Arrow Right` | Next message |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |
| `Escape` | Exit fullscreen |

## How It Works

Each tile consists of four layers: a static upper half, a static lower half, and two animated flaps that pivot at the horizontal midline. When a character changes, the upper flap folds backward (old character disappearing) while the lower flap falls into place (new character appearing) with a slight bounce. Only tiles whose content actually changes between messages animate — just like a real mechanical board.

A dynamic shadow overlay fades in on the lower half while the upper flap is in motion, then disappears as the lower flap settles. The sound is a single recorded audio clip of a real split-flap transition, played once per message change.

**Clock insertion:** during auto-rotation, the current time and date are shown after every two messages.

## Customization

Edit `js/constants.js` to change:
- **Grid size** — `GRID_COLS` and `GRID_ROWS`
- **Timing** — `SCRAMBLE_DURATION`, `STAGGER_DELAY`, `MESSAGE_INTERVAL`
- **Colors** — `SCRAMBLE_COLORS` and `ACCENT_COLORS`
- **Default messages** — the `MESSAGES` array (these are the initial rotation pool)

Or use the built-in message editor — no code changes required.

## License

MIT — do whatever you want with it.
