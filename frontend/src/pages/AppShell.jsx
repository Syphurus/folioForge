import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';

// Shared workspace shell. Left rail with brand + file list + user.
// Pages plug into <Outlet /> on the right. State (files, selection, toast,
// scan results) lives here and is exposed to child routes via outlet context.

export default function AppShell({ onLogout }) {
  const navigate = useNavigate();
  const params = useParams();
  const activeFileId = params.fileId || null;

  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [scanByFile, setScanByFile] = useState({});
  const [toast, setToast] = useState(null);

  function showToast(message, error = false) {
    setToast({ message, error });
    setTimeout(() => setToast(null), 3500);
  }

  async function refresh(selectAfter) {
    try {
      const list = await api.listFiles();
      setFiles(list);
      if (selectAfter) navigate(`/app/doc/${selectAfter}`);
    } catch (e) {
      showToast(e.message, true);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  function toggleSelected(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function handleLogout() {
    onLogout?.();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="rail-head">
          <Link to="/app" className="brand">
            <div className="brand-mark">F</div>
            <span className="brand-name">FolioForge</span>
          </Link>
        </div>

        <div className="rail-section">
          <span>Library</span>
          <span className="count">{files.length}</span>
        </div>

        <div className="rail-files">
          {files.length === 0 && <div className="rail-empty">No files yet</div>}
          {files.map((f) => (
            <NavLink
              key={f.fileId}
              to={`/app/doc/${f.fileId}`}
              className={({ isActive }) => `rail-file${isActive ? ' active' : ''}`}
              onClick={(e) => { if (e.target.tagName === 'INPUT') e.preventDefault(); }}
            >
              <input
                type="checkbox"
                checked={selected.includes(f.fileId)}
                onChange={() => toggleSelected(f.fileId)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="icon">¶</span>
              <span className="name" title={f.filename}>{f.filename}</span>
              <span className="pages">{f.pageCount}p</span>
            </NavLink>
          ))}
        </div>

        <div className="rail-foot">
          {selected.length >= 2 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                try {
                  const { fileId } = await api.merge(selected);
                  showToast(`Merged ${selected.length} files`);
                  setSelected([]);
                  await refresh(fileId);
                } catch (e) { showToast(e.message, true); }
              }}
            >
              Merge {selected.length} files
            </button>
          )}
          <Link to="/" className="rail-user">
            <span className="av">S</span>
            <span className="name">Demo user</span>
            <span className="signout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sign out</span>
          </Link>
        </div>
      </aside>

      <main className="main">
        <Outlet context={{
          files,
          refresh,
          showToast,
          activeFileId,
          scanByFile,
          setScanByFile,
        }} />
      </main>

      {toast && (
        <div className={`toast${toast.error ? ' error' : ''}`}>{toast.message}</div>
      )}
    </div>
  );
}
