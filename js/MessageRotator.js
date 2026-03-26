import { MESSAGES, MESSAGE_INTERVAL, TOTAL_TRANSITION } from './constants.js';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const DAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY'
];

export class MessageRotator {
  constructor(board) {
    this.board = board;
    this.messages = MESSAGES.map(m => [...m]); // mutable deep copy
    this.currentIndex = -1;
    this._timer = null;
    this._paused = false;
    this._stepsSinceTime = 0;
  }

  start() {
    this.next();
    this._startTimer();
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
    if (!this._timer) {
      this._startTimer();
    }
  }

  // Manual navigation — does not affect the time counter
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;
    this.board.displayMessage(this.messages[this.currentIndex]);
    this._resetAutoRotation();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.messages.length) % this.messages.length;
    this.board.displayMessage(this.messages[this.currentIndex]);
    this._resetAutoRotation();
  }

  // Show a specific message by index
  showMessage(index) {
    if (index < 0 || index >= this.messages.length) return;
    this.currentIndex = index;
    this.board.displayMessage(this.messages[index]);
  }

  updateMessage(index, lines) {
    if (index >= 0 && index < this.messages.length) {
      this.messages[index] = [...lines];
    }
  }

  addMessage(lines) {
    this.messages.push([...lines]);
    return this.messages.length - 1;
  }

  removeMessage(index) {
    if (this.messages.length <= 1) return false;
    this.messages.splice(index, 1);
    if (this.currentIndex >= this.messages.length) {
      this.currentIndex = this.messages.length - 1;
    } else if (this.currentIndex > index) {
      this.currentIndex--;
    }
    return true;
  }

  // ── Auto-rotation with clock insertion ──

  // Called by the interval timer only — inserts time after every 2 messages
  _advance() {
    if (this._stepsSinceTime >= 2) {
      this._stepsSinceTime = 0;
      this._showTime();
    } else {
      this._stepsSinceTime++;
      this.currentIndex = (this.currentIndex + 1) % this.messages.length;
      this.board.displayMessage(this.messages[this.currentIndex]);
    }
    this._resetAutoRotation();
  }

  _showTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const dayName = DAYS[now.getDay()];
    const day = now.getDate();
    const month = MONTHS[now.getMonth()];
    const year = now.getFullYear();

    this.board.displayMessage([
      '',
      `${hh} : ${mm}`,
      '',
      `${dayName}`,
      `${day} . ${month} . ${year}`
    ]);
  }

  _startTimer() {
    this.stop();
    this._timer = setInterval(() => {
      if (!this._paused && !this.board.isTransitioning) {
        this._advance();
      }
    }, MESSAGE_INTERVAL + TOTAL_TRANSITION);
  }

  _resetAutoRotation() {
    if (this._timer) {
      this._startTimer();
    }
  }
}
