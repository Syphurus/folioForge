export default function StatusBar({
  activePage, pageCount,
  zoom, onZoomIn, onZoomOut, onZoomReset,
  scanning, scanProgress,
  history,
  highlightMode,
}) {
  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className="sb-group">
        <span className="sb-item mono">
          Page {activePage || '—'} / {pageCount || '?'}
        </span>
        <span className="sb-sep" />
        <div className="sb-zoom">
          <button className="sb-btn" onClick={onZoomOut} aria-label="Zoom out">−</button>
          <button className="sb-btn zoom-reset" onClick={onZoomReset} title="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button className="sb-btn" onClick={onZoomIn} aria-label="Zoom in">+</button>
        </div>
      </div>

      <div className="sb-group sb-center">
        {scanning ? (
          <div className="sb-scan">
            <div className="sb-progress"><span style={{ width: `${Math.round(scanProgress * 100)}%` }} /></div>
            <span className="mono dim">Scanning… {Math.round(scanProgress * 100)}%</span>
          </div>
        ) : highlightMode ? (
          <span className="mono dim">Highlight mode · <kbd>Esc</kbd> to exit</span>
        ) : (
          <span className="mono dim">Ready</span>
        )}
      </div>

      <div className="sb-group">
        <span className="sb-item mono dim">
          Undo {history.past}/{history.past + history.future} · <kbd>⌘Z</kbd>
        </span>
      </div>
    </div>
  );
}
