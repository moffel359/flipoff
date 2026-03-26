import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { MessageRotator } from './MessageRotator.js';
import { KeyboardController } from './KeyboardController.js';
import { GRID_COLS, GRID_ROWS } from './constants.js';

const TILE_GAP = 4; // must match gap in board.css

// ─── Dynamic board sizing ──────────────────────────────────────

function fitBoard(boardEl, sectionEl) {
  const bs = getComputedStyle(boardEl);
  const boardPadH = parseFloat(bs.paddingLeft) + parseFloat(bs.paddingRight);
  const boardPadV = parseFloat(bs.paddingTop)  + parseFloat(bs.paddingBottom);

  const ss = getComputedStyle(sectionEl);
  const secPadH = parseFloat(ss.paddingLeft) + parseFloat(ss.paddingRight);
  const secPadV = parseFloat(ss.paddingTop)  + parseFloat(ss.paddingBottom);

  const availW = sectionEl.clientWidth  - secPadH - boardPadH;
  const availH = sectionEl.clientHeight - secPadV - boardPadV;

  const byW = Math.floor((availW - (GRID_COLS - 1) * TILE_GAP) / GRID_COLS);
  const byH = Math.floor((availH - (GRID_ROWS - 1) * TILE_GAP) / GRID_ROWS);

  const tileSize = Math.max(14, Math.min(byW, byH));
  boardEl.style.setProperty('--tile-size', tileSize + 'px');
}

// ─── Input panel with message manager ──────────────────────────

function pillLabel(lines) {
  const first = (lines || []).find(l => l && l.trim()) || '';
  const trimmed = first.trim();
  return trimmed.length > 14 ? trimmed.substring(0, 14) + '…' : trimmed || '(leer)';
}

function buildPanel(panelEl, rotator) {
  let selectedIndex = 0;

  // ── Pill selector ──
  const selectorEl = document.createElement('div');
  selectorEl.className = 'msg-selector';

  const addBtn = document.createElement('button');
  addBtn.className = 'msg-pill-add';
  addBtn.textContent = '+';
  addBtn.title = 'Neue Nachricht';

  // ── Editor area ──
  const editorEl = document.createElement('div');
  editorEl.className = 'input-editor';

  const rowsEl = document.createElement('div');
  rowsEl.className = 'input-rows';

  const inputs = [];
  const counts = [];

  for (let i = 0; i < GRID_ROWS; i++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'input-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'line-input';
    input.maxLength = GRID_COLS;
    input.placeholder = `Zeile ${i + 1}`;
    input.spellcheck = false;
    input.autocomplete = 'off';

    const count = document.createElement('span');
    count.className = 'char-count';
    count.textContent = `0 / ${GRID_COLS}`;

    input.addEventListener('input', () => {
      count.textContent = `${input.value.length} / ${GRID_COLS}`;
    });

    rowEl.append(input, count);
    rowsEl.appendChild(rowEl);
    inputs.push(input);
    counts.push(count);
  }

  // ── Action buttons ──
  const actionsEl = document.createElement('div');
  actionsEl.className = 'input-actions';

  const displayBtn = document.createElement('button');
  displayBtn.className = 'btn-action btn-display';
  displayBtn.textContent = 'Anzeigen';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-action btn-delete';
  deleteBtn.textContent = 'Löschen';

  const autoBtn = document.createElement('button');
  autoBtn.className = 'btn-action btn-auto active';
  autoBtn.textContent = 'Auto';

  actionsEl.append(displayBtn, deleteBtn, autoBtn);
  editorEl.append(rowsEl, actionsEl);
  panelEl.append(selectorEl, editorEl);

  // ── Helper functions ──

  function renderPills() {
    // Clear existing pills (keep addBtn)
    selectorEl.innerHTML = '';
    rotator.messages.forEach((msg, i) => {
      const pill = document.createElement('button');
      pill.className = 'msg-pill' + (i === selectedIndex ? ' active' : '');
      pill.textContent = pillLabel(msg);
      pill.addEventListener('click', () => selectMessage(i));
      selectorEl.appendChild(pill);
    });
    selectorEl.appendChild(addBtn);
  }

  function loadMessage(index) {
    const lines = rotator.messages[index] || [];
    inputs.forEach((inp, i) => {
      inp.value = lines[i] || '';
      counts[i].textContent = `${inp.value.length} / ${GRID_COLS}`;
    });
  }

  function saveCurrentEdits() {
    const lines = inputs.map(inp => inp.value);
    rotator.updateMessage(selectedIndex, lines);
    // Update the pill label for the edited message
    const pills = selectorEl.querySelectorAll('.msg-pill');
    if (pills[selectedIndex]) {
      pills[selectedIndex].textContent = pillLabel(lines);
    }
  }

  function selectMessage(index) {
    saveCurrentEdits();
    selectedIndex = index;
    loadMessage(index);
    // Highlight active pill
    selectorEl.querySelectorAll('.msg-pill').forEach((pill, i) => {
      pill.classList.toggle('active', i === index);
    });
  }

  // ── Event handlers ──

  addBtn.addEventListener('click', () => {
    saveCurrentEdits();
    const emptyLines = Array(GRID_ROWS).fill('');
    const newIndex = rotator.addMessage(emptyLines);
    selectedIndex = newIndex;
    renderPills();
    loadMessage(newIndex);
    inputs[0].focus();
  });

  displayBtn.addEventListener('click', () => {
    saveCurrentEdits();
    rotator.pause();
    rotator.showMessage(selectedIndex);
    autoBtn.classList.remove('active');
  });

  deleteBtn.addEventListener('click', () => {
    if (rotator.messages.length <= 1) return;
    rotator.removeMessage(selectedIndex);
    if (selectedIndex >= rotator.messages.length) {
      selectedIndex = rotator.messages.length - 1;
    }
    renderPills();
    loadMessage(selectedIndex);
  });

  autoBtn.addEventListener('click', () => {
    saveCurrentEdits();
    autoBtn.classList.add('active');
    rotator.resume();
  });

  // ── Initialize ──
  renderPills();
  loadMessage(0);

  return { displayBtn, autoBtn, saveCurrentEdits };
}

// ─── App initialization ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const rotator = new MessageRotator(board);
  new KeyboardController(rotator, soundEngine);

  // Audio: initialize on first user interaction (browser autoplay policy)
  let audioInitialized = false;
  const initAudio = async () => {
    if (audioInitialized) return;
    audioInitialized = true;
    await soundEngine.init();
    soundEngine.resume();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  rotator.start();

  // Volume button
  const volumeBtn = document.getElementById('volume-btn');
  volumeBtn?.addEventListener('click', () => {
    initAudio();
    const muted = soundEngine.toggleMute();
    volumeBtn.classList.toggle('muted', muted);
  });

  // Dynamic board sizing
  const resizeObserver = new ResizeObserver(() => {
    fitBoard(board.boardEl, boardContainer);
  });
  resizeObserver.observe(boardContainer);

  document.addEventListener('fullscreenchange', () => {
    requestAnimationFrame(() => fitBoard(board.boardEl, boardContainer));
  });

  // Message manager panel
  const panelEl = document.getElementById('input-panel');
  buildPanel(panelEl, rotator);
});
