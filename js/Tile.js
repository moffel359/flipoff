import { CHARSET } from './constants.js';

const HALF_FLIP = 55;     // ms per half of the flip (snappy mechanical feel)
const OVERLAP   = 0.5;    // lower flap starts at this fraction of upper duration
const MIN_FLIPS = 3;
const MAX_FLIPS = 6;

// Upper flap: accelerating fall (gravity pulling card away)
const EASE_UPPER = 'cubic-bezier(0.55, 0, 0.95, 0.35)';
// Lower flap: fast fall with subtle bounce on settle (card slaps into place)
const EASE_LOWER = 'cubic-bezier(0.22, 1.15, 0.38, 1)';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export class Tile {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.currentChar = ' ';
    this.isAnimating = false;

    this.el = document.createElement('div');
    this.el.className = 'tile';

    this._upper     = this._half('tile-upper');
    this._lower     = this._half('tile-lower');
    this._flapUpper = this._half('tile-flap-upper');
    this._flapLower = this._half('tile-flap-lower');

    // Shadow overlay — cast onto lower half when flap is mid-air
    this._shadow = document.createElement('div');
    this._shadow.className = 'tile-shadow';

    this.el.append(
      this._upper.el,
      this._lower.el,
      this._flapUpper.el,
      this._flapLower.el,
      this._shadow
    );

    this._show(' ');
  }

  _half(cls) {
    const el = document.createElement('div');
    el.className = cls;
    const span = document.createElement('span');
    el.appendChild(span);
    return { el, span };
  }

  _t(char) { return char === ' ' ? '' : char; }

  // Set all four layers + shadow to resting state
  _show(char) {
    const t = this._t(char);
    this._upper.span.textContent = t;
    this._lower.span.textContent = t;
    this._flapUpper.span.textContent = t;
    this._flapLower.span.textContent = t;
    this._flapUpper.el.style.transition = 'none';
    this._flapUpper.el.style.transform  = 'rotateX(0deg)';
    this._flapLower.el.style.transition = 'none';
    this._flapLower.el.style.transform  = 'rotateX(90deg)';
    this._shadow.style.transition = 'none';
    this._shadow.style.opacity = '0';
  }

  setChar(char) {
    this.currentChar = char;
    this._show(char);
  }

  // One mechanical split-flap flip
  async _flip(nextChar) {
    const oldT = this._t(this.currentChar);
    const newT = this._t(nextChar);

    // Prepare layers
    this._upper.span.textContent = newT;       // revealed behind upper flap
    this._flapUpper.span.textContent = oldT;    // old char folds away
    this._flapLower.span.textContent = newT;    // new char falls into place

    // Snap to start (instant)
    this._flapUpper.el.style.transition = 'none';
    this._flapUpper.el.style.transform  = 'rotateX(0deg)';
    this._flapLower.el.style.transition = 'none';
    this._flapLower.el.style.transform  = 'rotateX(90deg)';
    this._shadow.style.transition = 'none';
    this._shadow.style.opacity = '0';
    void this._flapUpper.el.offsetHeight; // force reflow

    // ── Upper flap folds backward + shadow fades in ──
    this._flapUpper.el.style.transition = `transform ${HALF_FLIP}ms ${EASE_UPPER}`;
    this._flapUpper.el.style.transform  = 'rotateX(90deg)';
    this._shadow.style.transition = `opacity ${HALF_FLIP}ms ease-in`;
    this._shadow.style.opacity = '1';

    const lowerDuration = HALF_FLIP * 1.3; // slightly longer for bounce settle

    // ── Lower flap slaps into place ──
    await sleep(HALF_FLIP * OVERLAP);
    this._lower.span.textContent = newT;
    this._flapLower.el.style.transition = `transform ${lowerDuration}ms ${EASE_LOWER}`;
    this._flapLower.el.style.transform  = 'rotateX(0deg)';

    // Shadow fades as lower flap covers it
    this._shadow.style.transition = `opacity ${lowerDuration * 0.6}ms ease-out`;
    this._shadow.style.opacity = '0';

    await sleep(lowerDuration);
    this.currentChar = nextChar;
  }

  async scrambleTo(targetChar, delay) {
    if (targetChar === this.currentChar) return;
    await sleep(delay);
    this.isAnimating = true;

    const count = MIN_FLIPS + Math.floor(Math.random() * (MAX_FLIPS - MIN_FLIPS + 1));
    const chars = Array.from({ length: count - 1 }, () =>
      CHARSET[Math.floor(Math.random() * CHARSET.length)]
    );
    chars.push(targetChar);

    for (const char of chars) {
      await this._flip(char);
      await sleep(3 + Math.random() * 8); // brief mechanical pause
    }

    this.isAnimating = false;
  }
}
