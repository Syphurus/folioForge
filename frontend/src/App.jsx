import { useEffect, useState } from 'react';
import { api, getToken } from './api/client.js';
import Login from './components/Login.jsx';
import Upload from './components/Upload.jsx';
import FileList from './components/FileList.jsx';
import PdfViewer from './components/PdfViewer.jsx';
import AuthenticityPanel from './components/AuthenticityPanel.jsx';
import Toolbar from './components/Toolbar.jsx';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [token, setToken] = useState(getToken());
  if (!token) return <Login onLogin={setToken} />;
  return <Workspace onLogout={() => { api.logout(); setToken(null); }} />;
}

function Workspace({ onLogout }) {
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [selected, setSelected] = useState([]);
  const [scanByFile, setScanByFile] = useState({});
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Load file list on mount and whenever something changes it.
  async function refresh(selectIdAfter) {
    try {
      const list = await api.listFiles();
      setFiles(list);
      if (selectIdAfter) setActive(selectIdAfter);
      else if (!activeId && list[0]) setActive(list[0].fileId);
    } catch (e) {
      showToast(e.message, true);
    }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function setActive(fileId) {
    setActiveId(fileId);
    setPdfUrl(null);
    try {
      const url = await api.getPdfUrl(fileId);
      setPdfUrl(url);
    } catch (e) {
      showToast(e.message, true);
    }
  }

  function toggleSelected(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function showToast(message, error = false) {
    setToast({ message, error });
    setTimeout(() => setToast(null), 3500);
  }

  async function runMerge() {
    if (selected.length < 2) return;
    setBusy(true);
    try {
      const { fileId } = await api.merge(selected);
      showToast('Files merged');
      setSelected([]);
      await refresh(fileId);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runCompress() {
    if (!activeId) return;
    setBusy(true);
    try {
      const { fileId } = await api.compress(activeId);
      showToast('File compressed');
      await refresh(fileId);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runSplit() {
    if (!activeId) return;
    const file = files.find((f) => f.fileId === activeId);
    const ans = window.prompt(`Page ranges to split (e.g. "1-2,3")\nThe document has ${file?.pageCount ?? '?'} page(s).`, '1-1,2');
    if (!ans) return;
    const ranges = ans.split(',').map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    try {
      const { fileIds } = await api.split(activeId, ranges);
      showToast(`Split into ${fileIds.length} file(s)`);
      await refresh(fileIds[0]);
    } catch (e) { showToast(e.message, true); }
    finally { setBusy(false); }
  }

  async function runScan() {
    if (!activeId) return;
    setScanning(true);
    try {
      const result = await api.scan(activeId);
      setScanByFile((m) => ({ ...m, [activeId]: result }));
      showToast(`Scan complete — Trust ${result.trustScore}/100`);
    } catch (e) { showToast(e.message, true); }
    finally { setScanning(false); }
  }

  function runDownload() {
    if (!pdfUrl) return;
    const file = files.find((f) => f.fileId === activeId);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = file?.filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const activeFile = files.find((f) => f.fileId === activeId);
  const activeScan = activeId ? scanByFile[activeId] : null;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo">F</div>
          <span>FolioForge</span>
          {api.useStubs && <span className="badge">stub mode</span>}
        </div>
        <div className="row">
          <a className="dim" style={{ fontSize: 12 }} href="https://github.com" target="_blank" rel="noreferrer">docs</a>
          <button className="btn-ghost" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="workspace">
        {/* LEFT — files */}
        <div className="col">
          <div className="panel" style={{ flex: '0 0 auto' }}>
            <div className="panel-header"><span>Upload</span></div>
            <div className="panel-body">
              <Upload
                onUploaded={(f) => refresh(f.fileId)}
                onError={(m) => showToast(m, true)}
              />
            </div>
          </div>
          <div className="panel" style={{ marginTop: 14, flex: '1 1 auto' }}>
            <div className="panel-header">
              <span>Files</span>
              <span className="dim" style={{ fontSize: 11 }}>{files.length}</span>
            </div>
            <div className="panel-body">
              <FileList
                files={files}
                activeId={activeId}
                selectedIds={selected}
                onSelect={setActive}
                onToggle={toggleSelected}
              />
            </div>
          </div>
        </div>

        {/* CENTER — viewer */}
        <div className="col">
          <div className="panel h-100">
            <Toolbar
              activeFile={activeFile}
              selectedCount={selected.length}
              highlightMode={highlightMode}
              onMerge={runMerge}
              onCompress={runCompress}
              onSplit={runSplit}
              onDownload={runDownload}
              onToggleHighlight={() => setHighlightMode((m) => !m)}
              busy={busy}
            />
            <PdfViewer
              pdfUrl={pdfUrl}
              scanResult={activeScan}
              highlightMode={highlightMode}
              onHighlightAdded={() => showToast('Highlight added')}
            />
          </div>
        </div>

        {/* RIGHT — authenticity */}
        <div className="col">
          <AuthenticityPanel
            activeFile={activeFile}
            scanResult={activeScan}
            onScan={runScan}
            scanning={scanning}
          />
        </div>
      </div>

      {toast && (
        <div className={`toast${toast.error ? ' error' : ''}`}>{toast.message}</div>
      )}
    </div>
  );
}
