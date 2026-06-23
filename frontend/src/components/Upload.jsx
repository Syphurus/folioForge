import { useRef, useState } from 'react';
import { api } from '../api/client.js';

export default function Upload({ onUploaded, onError }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!files.length) {
      onError?.('Only PDF files are supported');
      return;
    }
    setBusy(true);
    try {
      for (const f of files) {
        const created = await api.upload([f]);
        onUploaded?.(created);
      }
    } catch (e) {
      onError?.(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`dropzone${drag ? ' drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="big">{busy ? <span className="spinner" /> : '⬆'}</div>
      <div><strong>Drop PDFs here</strong> or click to browse</div>
      <div className="hint">Multiple files OK · PDF only</div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
