import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  clampOverlayPosition,
  DEFAULT_OVERLAY_SIZE,
  getAnchoredOverlayPosition,
  getDraggedOverlayPosition,
} from './overlayPosition.js';
import { useOverlayController } from './useOverlayController.js';

function getViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function getExtensionVersion() {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return null;
  }
}

const extensionVersion = getExtensionVersion();

export function FloatingOverlay() {
  const {
    applied,
    copied,
    visible,
    loading,
    result,
    rect,
    placementId,
    accept,
    copy,
    hide,
    retry,
    undo,
  } = useOverlayController();
  const cardRef = useRef(null);
  const dragRef = useRef(null);
  const [cardSize, setCardSize] = useState(DEFAULT_OVERLAY_SIZE);
  const [draggedPlacement, setDraggedPlacement] = useState(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const updateSize = () => {
      const next = card.getBoundingClientRect();
      setCardSize({ width: next.width, height: next.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(card);
    return () => observer.disconnect();
  }, [visible, loading, applied, result]);

  const viewport = getViewport();
  const anchoredPosition = rect ? getAnchoredOverlayPosition(rect, cardSize, viewport) : null;
  const draggedPosition =
    draggedPlacement?.placementId === placementId ? draggedPlacement.position : null;
  const position = draggedPosition
    ? clampOverlayPosition(draggedPosition, cardSize, viewport)
    : anchoredPosition;

  const startDrag = useCallback(
    (event) => {
      if (event.button !== 0 || event.target.closest('button') || !position) return;
      dragRef.current = {
        pointerId: event.pointerId,
        offset: { x: event.clientX - position.left, y: event.clientY - position.top },
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [position],
  );

  const continueDrag = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      setDraggedPlacement({
        placementId,
        position: getDraggedOverlayPosition(event, drag.offset, cardSize, getViewport()),
      });
    },
    [cardSize, placementId],
  );

  const stopDrag = useCallback((event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }, []);

  const moveWithKeyboard = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || !position) return;
      const movement = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!movement) return;
      event.preventDefault();
      const distance = event.shiftKey ? 25 : 10;
      setDraggedPlacement({
        placementId,
        position: clampOverlayPosition(
          {
            left: position.left + movement[0] * distance,
            top: position.top + movement[1] * distance,
          },
          cardSize,
          getViewport(),
        ),
      });
    },
    [cardSize, placementId, position],
  );

  if (!visible || !rect || !position) return null;

  return (
    <aside
      ref={cardRef}
      className="tonebridge-card"
      style={position}
      aria-label="ToneBridge translation suggestion"
    >
      <header
        className="tonebridge-drag-handle"
        tabIndex={0}
        title="Drag to move. Double-click to return beside the editor."
        aria-label="ToneBridge suggestion window. Drag to move, or use the arrow keys."
        onPointerDown={startDrag}
        onPointerMove={continueDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => setDraggedPlacement(null)}
        onKeyDown={moveWithKeyboard}
      >
        <span className="tonebridge-grip" aria-hidden="true">
          {'\u2807'}
        </span>
        <span className="tonebridge-mark">T</span>
        <strong>ToneBridge</strong>
        {extensionVersion && <small>v{extensionVersion}</small>}
        <button type="button" aria-label="Dismiss suggestion" onClick={hide}>
          {'\u00d7'}
        </button>
      </header>

      {applied ? (
        <div className="tonebridge-applied">
          <span>English text inserted.</span>
          <button type="button" onClick={undo}>
            Undo
          </button>
        </div>
      ) : loading ? (
        <div className="tonebridge-loading" role="status" aria-live="polite">
          Preparing a faithful English version{'\u2026'}
        </div>
      ) : result?.translation ? (
        <div className="tonebridge-result">
          <p aria-live="polite">{result.translation}</p>
          {result.message && <small className="tonebridge-inline-message">{result.message}</small>}
          <div className="tonebridge-actions">
            <button className="primary" type="button" onClick={accept}>
              Replace
            </button>
            <button type="button" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="tonebridge-error" role="alert">
          <p>{result?.message}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
    </aside>
  );
}
