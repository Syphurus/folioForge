import { useEffect, useRef, useState } from 'react';

export default function SplitModal({ open, pageCount, onCancel, onConfirm }) {
  const [value, setValue] = useState('1');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(`1-${Math.min(pageCount || 1, 2)}`);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open, pageCount]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  function submit() {
    const ranges = value.split(',').map((s) => s.trim()).filter(Boolean);
    if (!ranges.length) { setError('Enter at least one page range'); return; }
    for (const r of ranges) {
      if (!/^\d+(-\d+)?$/.test(r)) { setError(`"${r}" is not a valid range`); return; }
      const [a, b] = r.split('-').map(Number);
      if (a < 1 || (b && b < a)) { setError(`"${r}" is out of order`); return; }
      if (pageCount && ((b || a) > pageCount)) { setError(`"${r}" exceeds ${pageCount} pages`); return; }
    }
    onConfirm(ranges);
  }

  return (
    <div className="modal-scrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="split-title">
        <h3 id="split-title" className="modal-title">Split PDF</h3>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Comma-separated page ranges. Example: <span className="mono">1-3,5,7-9</span>
        </p>
        <label className="modal-label">
          <span>Ranges</span>
          <input
            ref={inputRef}
            className="modal-input mono"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="1-2,3"
          />
        </label>
        <div className="modal-hint">
          Document has <strong>{pageCount ?? '?'}</strong> pages.
          {error && <span className="modal-error"> · {error}</span>}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Split</button>
        </div>
      </div>
    </div>
  );
}
