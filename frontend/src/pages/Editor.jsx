import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import PdfViewer from '../components/PdfViewer.jsx';
import AuthenticityPanel from '../components/AuthenticityPanel.jsx';

export default function Editor() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { files, refresh, showToast, scanByFile, setScanByFile } = useOutletContext();
  const file = files.find((f) => f.fileId === fileId);
  const scan = scanByFile[fileId] || null;

  const [pdfUrl, setPdfUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load the PDF URL whenever the file changes.
  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfUrl(null);
    api.getPdfUrl(fileId)
      .then((url) => { if (!cancelled) setPdfUrl(url); })
      .catch((e) => showToast(e.message, true));
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [fileId]);

  // Open drawer automatically when a fresh scan arrives.
  useEffect(() => { if (scan) setDrawerOpen(true); }, [scan]);

  async function runCompress() {
    setBusy(true);
    try {
      const { fileId: newId } = await api.compress(fileId);
      showToast('File compressed');
      await refresh();
      navigate(`/app/doc/${newId}`);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runSplit() {
    const ans = window.prompt(`Page ranges to split (for example "1-2,3"). The document has ${file?.pageCount ?? '?'} pages.`, '1-1,2');
    if (!ans) return;
    const ranges = ans.split(',').map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    try {
      const { fileIds } = await api.split(fileId, ranges);
      showToast(`Split into ${fileIds.length} file(s)`);
      await refresh();
      navigate(`/app/doc/${fileIds[0]}`);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runScan() {
    setScanning(true);
    try {
      const result = await api.scan(fileId);
      setScanByFile((m) => ({ ...m, [fileId]: result }));
      showToast(`Scan complete · Trust ${result.trustScore} / 100`);
    } catch (e) { showToast(e.message, true); }
    finally { setScanning(false); }
  }

  function runDownload() {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = file?.filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!file) {
    return (
      <div className="lib-body">
        <header className="main-head">
          <div>
            <span className="eyebrow">Editor</span>
            <h1 className="title">File not found.</h1>
          </div>
        </header>
        <p className="muted" style={{ marginTop: 16 }}>
          That document is not in your library. <Link to="/app" className="link">Back to Library</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="editor">
      <header className="editor-top">
        <Link to="/app" className="back">← Library</Link>
        <span className="doc-title">{file.filename}</span>
        <span className="doc-meta">{file.pageCount} pages</span>

        <span style={{ flex: 1 }} />

        <div className="actions">
          <button onClick={runCompress} disabled={busy}>Compress</button>
          <button onClick={runSplit} disabled={busy}>Split</button>
          <button
            onClick={() => setHighlightMode((m) => !m)}
            style={highlightMode ? { background: 'rgba(201,169,97,0.15)', borderColor: 'var(--gold)', color: 'var(--gold-2)' } : undefined}
          >
            Highlight {highlightMode && <span className="kbd">on</span>}
          </button>
          <button onClick={runDownload} className="btn-ghost">Download</button>
          <button className="btn-primary" onClick={() => { runScan(); setDrawerOpen(true); }} disabled={scanning}>
            {scanning ? <><span className="spinner" /> Scanning…</> : (scan ? 'Re-scan' : 'Check Authenticity →')}
          </button>
          {scan && !drawerOpen && (
            <button onClick={() => setDrawerOpen(true)}>View report</button>
          )}
        </div>
      </header>

      <div className="editor-canvas-wrap">
        <PdfViewer
          pdfUrl={pdfUrl}
          scanResult={scan}
          highlightMode={highlightMode}
          onHighlightAdded={() => showToast('Highlight added')}
        />

        <div
          className={`drawer-scrim${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
          <div className="drawer-head">
            <h3>Authenticity report</h3>
            <button className="close" onClick={() => setDrawerOpen(false)} aria-label="Close">×</button>
          </div>
          <div className="drawer-body">
            <AuthenticityPanel
              activeFile={file}
              scanResult={scan}
              onScan={runScan}
              scanning={scanning}
              variant="drawer"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
