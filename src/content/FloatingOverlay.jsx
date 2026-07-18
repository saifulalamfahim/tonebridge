import { useOverlayController } from './useOverlayController.js';

export function FloatingOverlay() {
  const { applied, copied, visible, loading, result, rect, accept, copy, hide, retry, undo } =
    useOverlayController();
  if (!visible || !rect) return null;

  const cardHeight = 190;
  const roomBelow = rect.bottom + 8 + cardHeight <= window.innerHeight;
  const top = roomBelow ? rect.bottom + 8 : Math.max(12, rect.top - cardHeight - 8);
  const left = Math.min(Math.max(12, rect.left), window.innerWidth - 348);
  const version = chrome.runtime.getManifest().version;

  return (
    <aside className="tonebridge-card" style={{ left, top }} aria-live="polite">
      <header>
        <span className="tonebridge-mark">T</span>
        <strong>ToneBridge</strong>
        <small>v{version}</small>
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
        <div className="tonebridge-loading">Preparing a faithful English version{'\u2026'}</div>
      ) : result?.translation ? (
        <div className="tonebridge-result">
          <p>{result.translation}</p>
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
        <div className="tonebridge-error">
          <p>{result?.message}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
    </aside>
  );
}
