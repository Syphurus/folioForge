export default function Toolbar({
  activeFile,
  selectedCount,
  highlightMode,
  onMerge,
  onCompress,
  onSplit,
  onDownload,
  onToggleHighlight,
  busy,
}) {
  return (
    <div className="toolbar">
      <button onClick={onMerge} disabled={selectedCount < 2 || busy} title="Merge selected files (pick 2+)">
        ⊕ Merge {selectedCount > 0 && <span className="info">· {selectedCount}</span>}
      </button>
      <button onClick={onCompress} disabled={!activeFile || busy} title="Compress the open file">
        ⇊ Compress
      </button>
      <button onClick={onSplit} disabled={!activeFile || busy} title="Split the open file by page range">
        ✂ Split
      </button>

      <div className="sep" />

      <button
        onClick={onToggleHighlight}
        disabled={!activeFile}
        style={highlightMode ? { background: 'rgba(201,169,97,0.15)', borderColor: 'var(--gold)', color: 'var(--gold-2)' } : undefined}
        title="Click-drag on the page to draw a highlight"
      >
        ✎ Highlight {highlightMode && <span className="info">· on</span>}
      </button>

      <div className="spacer" />

      <button onClick={onDownload} disabled={!activeFile} className="btn-ghost" title="Download the open file">
        ⬇ Download
      </button>
    </div>
  );
}
