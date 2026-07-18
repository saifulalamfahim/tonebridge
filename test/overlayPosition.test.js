import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampOverlayPosition,
  getAnchoredOverlayPosition,
  getDraggedOverlayPosition,
} from '../src/content/overlayPosition.js';

const viewport = { width: 1200, height: 800 };
const size = { width: 336, height: 190 };

test('anchors below an editor when enough room is available', () => {
  const position = getAnchoredOverlayPosition(
    { left: 100, top: 100, right: 500, bottom: 160 },
    size,
    viewport,
  );
  assert.deepEqual(position, { left: 100, top: 168 });
});

test('anchors above an editor when the lower viewport is crowded', () => {
  const position = getAnchoredOverlayPosition(
    { left: 100, top: 700, right: 500, bottom: 760 },
    size,
    viewport,
  );
  assert.deepEqual(position, { left: 100, top: 502 });
});

test('keeps dragged overlays inside every viewport edge', () => {
  assert.deepEqual(clampOverlayPosition({ left: -200, top: -100 }, size, viewport), {
    left: 12,
    top: 12,
  });
  assert.deepEqual(clampOverlayPosition({ left: 2000, top: 1200 }, size, viewport), {
    left: 852,
    top: 598,
  });
});

test('preserves the pointer offset while dragging', () => {
  const position = getDraggedOverlayPosition(
    { clientX: 525, clientY: 415 },
    { x: 25, y: 15 },
    size,
    viewport,
  );
  assert.deepEqual(position, { left: 500, top: 400 });
});
