export const OVERLAY_MARGIN = 12;
export const OVERLAY_GAP = 8;
export const DEFAULT_OVERLAY_SIZE = { width: 336, height: 190 };

export function clampOverlayPosition(position, size, viewport, margin = OVERLAY_MARGIN) {
  const maxLeft = Math.max(margin, viewport.width - size.width - margin);
  const maxTop = Math.max(margin, viewport.height - size.height - margin);

  return {
    left: Math.min(Math.max(margin, position.left), maxLeft),
    top: Math.min(Math.max(margin, position.top), maxTop),
  };
}

export function getAnchoredOverlayPosition(
  editorRect,
  size,
  viewport,
  { gap = OVERLAY_GAP, margin = OVERLAY_MARGIN } = {},
) {
  const roomBelow = editorRect.bottom + gap + size.height <= viewport.height - margin;
  const top = roomBelow ? editorRect.bottom + gap : editorRect.top - size.height - gap;

  return clampOverlayPosition({ left: editorRect.left, top }, size, viewport, margin);
}

export function getDraggedOverlayPosition(pointer, offset, size, viewport) {
  return clampOverlayPosition(
    { left: pointer.clientX - offset.x, top: pointer.clientY - offset.y },
    size,
    viewport,
  );
}
