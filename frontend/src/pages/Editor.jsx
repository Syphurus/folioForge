import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import PdfViewer from '../components/PdfViewer.jsx';
import AuthenticityPanel from '../components/AuthenticityPanel.jsx';
import StatusBar from '../components/StatusBar.jsx';
import SplitModal from '../components/SplitModal.jsx';

const HISTORY_LIMIT = 50; // FR-ANN-08

function historyReducer(state, action) {
  const { past, present, future } = state;
  switch (action.type) {
    case 'ADD': {
      const nextPresent = {
        ...present,
        [action.page]: [...(present[action.page] || []), action.bbox],
      };
      const nextPast = [...past, present].slice(-HISTORY_LIMIT);
      return { past: nextPast, present: nextPresent, future: [] };
    }
    case 'UNDO': {
      if (!past.length) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future].slice(0, HISTORY_LIMIT),
      };
    }
    case 'REDO': {
      if (!future.length) return state;
      return {
        past: [...past, present].slice(-HISTORY_LIMIT),
        present: future[0],
        future: future.slice(1),
      };
    }
    case 'RESET':
      return { past: [], present: {}, future: [] };
    default:
      return state;
  }
}

export default function Editor() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { files, refresh, showToast, scanByFile, setScanByFile, updatePageCount } = useOutletContext();
  const file = files.find((f) => f.fileId === fileId);
  const scan = scanByFile[fileId] || null;

  const [pdfUrl, setPdfUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [highlightMode, setHighlightMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [splitOpen, setSplitOpen] = useState(false);
  const [pageCount, setPageCount] = useState(file?.pageCount || 0);

  const [history, dispatch] = useReducer(historyReducer, { past: [], present: {}, future: [] });
  const highlights = history.present;

  const scanTimer = useRef(null);

  useEffect(() => { dispatch({ type: 'RESET' }); setActivePage(1); }, [fileId]);
  useEffect(() => { setPageCount(file?.pageCount || 0); }, [file?.pageCount]);

  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setPdfUrl(null);
    api.getPdfUrl(fileId)
      .then((url) => { if (!cancelled) setPdfUrl(url); })
      .catch((e) => showToast(e.message, true));
    return () => { cancelled = true; };
  }, [fileId]); // eslint-disable-line

  useEffect(() => { if (scan) setDrawerOpen(true); }, [scan]);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(e) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      } else if (e.key === 'Escape') {
        if (drawerOpen) setDrawerOpen(false);
        else if (highlightMode) setHighlightMode(false);
      } else if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)));
      } else if (mod && e.key === '-') {
        e.preventDefault(); setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)));
      } else if (mod && e.key === '0') {
        e.preventDefault(); setZoom(1);
      } else if (e.key.toLowerCase() === 'h' && !mod && !e.target.matches('input, textarea')) {
        setHighlightMode((m) => !m);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, highlightMode]);

  const handleHighlightAdd = useCallback(({ page, bbox }) => {
    dispatch({ type: 'ADD', page, bbox });
    showToast('Highlight added');
  }, [showToast]);

  const handleDocLoad = useCallback(({ pageCount: n }) => {
    setPageCount(n);
    if (updatePageCount) updatePageCount(fileId, n);
  }, [fileId, updatePageCount]);

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

  async function runSplit(ranges) {
    setSplitOpen(false);
    setBusy(true);
    try {
      const { fileIds } = await api.split(fileId, ranges);
      showToast(`Split into ${fileIds.length} file${fileIds.length === 1 ? '' : 's'}`);
      await refresh();
      navigate(`/app/doc/${fileIds[0]}`);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runScan() {
    setScanning(true);
    setScanProgress(0.05);
    // Fake progress ramp — 90% over ~8s, then hold until real result arrives.
    scanTimer.current = setInterval(() => {
      setScanProgress((p) => (p >= 0.9 ? 0.9 : +(p + 0.02).toFixed(3)));
    }, 180);
    try {
      const result = await api.scan(fileId);
      setScanProgress(1);
      setScanByFile((m) => ({ ...m, [fileId]: result }));
      showToast(`Scan complete · Trust ${result.trustScore} / 100`);
    } catch (e) {
      showToast(e.message, true);
    } finally {
      clearInterval(scanTimer.current);
      setTimeout(() => { setScanning(false); setScanProgress(0); }, 400);
    }
  }

  function runDownload() {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = file?.filename || 'document.pdf';
    document.body.appendChild(a); a.click(); a.remove();
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
        <span className="doc-meta">{pageCount || '?'} pages</span>

        <span style={{ flex: 1 }} />

        <div className="actions">
          <button onClick={runCompress} disabled={busy}>Compress</button>
          <button onClick={() => setSplitOpen(true)} disabled={busy}>Split</button>
          <button
            onClick={() => setHighlightMode((m) => !m)}
            style={highlightMode ? { background: 'rgba(201,169,97,0.15)', borderColor: 'var(--gold)', color: 'var(--gold-2)' } : undefined}
            title="Highlight (H)"
          >
            Highlight {highlightMode && <span className="kbd">on</span>}
          </button>
          <button onClick={() => dispatch({ type: 'UNDO' })} disabled={!history.past.length} title="Undo (⌘Z)">↶</button>
          <button onClick={() => dispatch({ type: 'REDO' })} disabled={!history.future.length} title="Redo (⌘⇧Z)">↷</button>
          <button onClick={runDownload} className="btn-ghost">Download</button>
          <button className="btn-primary" onClick={runScan} disabled={scanning}>
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
          zoom={zoom}
          highlights={highlights}
          onHighlightAdd={handleHighlightAdd}
          onDocLoad={handleDocLoad}
          onActivePageChange={setActivePage}
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

      <StatusBar
        activePage={activePage}
        pageCount={pageCount}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
        onZoomReset={() => setZoom(1)}
        scanning={scanning}
        scanProgress={scanProgress}
        history={{ past: history.past.length, future: history.future.length }}
        highlightMode={highlightMode}
      />

      <SplitModal
        open={splitOpen}
        pageCount={pageCount}
        onCancel={() => setSplitOpen(false)}
        onConfirm={runSplit}
      />
    </div>
  );
}
