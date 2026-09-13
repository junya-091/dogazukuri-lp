import { createEngine } from './engine';
import { callEngine } from './api';
import { ROOM_JUMPS } from './layout';
import { STUDIO_JUMPS } from './studio';
import { useApt } from './store';

const canvas = document.querySelector('#space-canvas');
const wrap = document.querySelector('#space-wrap');
const status = document.querySelector('#space-status');
const errorPanel = document.querySelector('#space-error');
const errorText = errorPanel.querySelector('[data-error-text]');
const roomLabel = document.querySelector('#room-label');
const floorPlan = document.querySelector('#floor-plan');
const touchControls = document.querySelector('#touch-controls');
const touchDirections = new Set();
let engine;

function renderPlan(space) {
  const jumps = space === 'studio' ? STUDIO_JUMPS : ROOM_JUMPS;
  floorPlan.replaceChildren();
  for (const jump of jumps) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = jump.label;
    button.setAttribute('aria-label', `${jump.label}へ移動`);
    button.addEventListener('click', () => callEngine('teleport', jump.x, jump.z, jump.yaw));
    floorPlan.append(button);
  }
  roomLabel.textContent = space === 'studio' ? '仮想スタジオ · 10 × 7 m' : '1LDK · 8 × 6 m';
}

function renderState(state) {
  status.textContent = state.importError
    ? `空間データの読み込みに失敗: ${state.importError}`
    : !state.ready
      ? '3D空間を準備しています…'
      : state.view === 'walk'
        ? `歩行モード · ${state.floorName}`
        : state.view === 'pano'
          ? `360°モード · ${state.floorName}`
          : `俯瞰モード · ${state.floorName}`;
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === state.view));
  });
  document.querySelectorAll('[data-space]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.space === state.space));
  });
  if (state.space !== renderState.lastSpace) {
    renderState.lastSpace = state.space;
    renderPlan(state.space);
  }
}
renderState.lastSpace = null;

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => callEngine('setView', button.dataset.mode));
});
document.querySelectorAll('[data-space]').forEach((button) => {
  button.addEventListener('click', () => callEngine('enterSpace', button.dataset.space));
});
document.querySelector('#interact').addEventListener('click', () => callEngine('toggleNearby'));
document.querySelector('#touch-interact').addEventListener('click', () => callEngine('toggleNearby'));

for (const button of document.querySelectorAll('[data-move]')) {
  const direction = button.dataset.move;
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touchDirections.add(direction);
    updateTouch();
  });
  const release = () => {
    touchDirections.delete(direction);
    updateTouch();
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}

function updateTouch() {
  const x = Number(touchDirections.has('right')) - Number(touchDirections.has('left'));
  const y = Number(touchDirections.has('forward')) - Number(touchDirections.has('back'));
  callEngine('setTouch', x, y);
}

if (matchMedia('(pointer: coarse)').matches) touchControls.hidden = false;
useApt.subscribe(renderState);
renderState(useApt.getState());

function showFatalError(error) {
  status.textContent = '3D空間を表示できなかった。';
  errorText.textContent = error instanceof Error ? error.message : String(error);
  errorPanel.hidden = false;
  canvas.hidden = true;
}

async function start() {
  errorPanel.hidden = true;
  canvas.hidden = false;
  try {
    engine?.dispose();
    engine = createEngine(canvas, wrap);
  } catch (error) {
    showFatalError(error);
  }
}

document.querySelector('#retry-button').addEventListener('click', start);
window.addEventListener('pagehide', () => engine?.dispose(), { once: true });
start();
