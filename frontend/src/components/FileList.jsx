export default function FileList({ files, activeId, selectedIds, onSelect, onToggle }) {
  if (!files.length) {
    return <div className="dim" style={{ fontSize: 13, padding: '8px 4px' }}>No files yet. Upload one to begin.</div>;
  }
  return (
    <div className="file-list">
      {files.map((f) => (
        <div
          key={f.fileId}
          className={`file-row${f.fileId === activeId ? ' active' : ''}`}
          onClick={() => onSelect(f.fileId)}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(f.fileId)}
            onChange={(e) => { e.stopPropagation(); onToggle(f.fileId); }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="name" title={f.filename}>{f.filename}</div>
          <div className="pages">{f.pageCount}p</div>
        </div>
      ))}
    </div>
  );
}
