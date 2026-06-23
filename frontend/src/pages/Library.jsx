import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Upload from '../components/Upload.jsx';

const LABELS = {
  synthetic: 'AI-generated',
  manipulated: 'Manipulated',
  authentic: 'Authentic',
  inconclusive: 'Inconclusive',
};

export default function Library() {
  const { files, refresh, showToast, scanByFile } = useOutletContext();
  const navigate = useNavigate();

  // Pick the most recently scanned file to feature in the hero.
  const scannedIds = Object.keys(scanByFile);
  const latestScanId = scannedIds[scannedIds.length - 1];
  const latestFile = files.find((f) => f.fileId === latestScanId);
  const latestScan = latestScanId ? scanByFile[latestScanId] : null;

  return (
    <>
      <header className="main-head">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1 className="title">Library.</h1>
        </div>
        <div className="right">
          <Link to="/how-it-works" className="btn btn-sm">Docs</Link>
        </div>
      </header>

      <div className="lib-body">
        <div className="lib-grid">
          {/* Hero column: latest scan or onboarding card */}
          {latestScan && latestFile ? (
            <FeatureScan file={latestFile} scan={latestScan} onOpen={() => navigate(`/app/doc/${latestFile.fileId}`)} />
          ) : (
            <div className="lib-empty">
              <span className="eyebrow">Get started</span>
              <div className="e-title">No scans yet.</div>
              <p className="e-sub">
                Upload a PDF, open it, then run Check Authenticity.
                A Trust Score and on-page evidence will appear right here.
              </p>
              <Link to="/how-it-works" className="btn" style={{ marginTop: 12 }}>How it works</Link>
            </div>
          )}

          {/* Upload column */}
          <div className="upload-card">
            <div>
              <h4>Upload a PDF</h4>
              <p className="upload-sub">Drop a file or click to browse. Multiple at once is fine.</p>
            </div>
            <Upload
              onUploaded={(f) => { refresh(); showToast(`Uploaded ${f.filename}`); }}
              onError={(m) => showToast(m, true)}
            />
          </div>
        </div>

        <div className="rail-section" style={{ padding: '36px 0 12px' }}>
          <span>All files</span>
          <span className="count">{files.length}</span>
        </div>

        {files.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>Your uploaded documents will appear here.</p>
        ) : (
          <div className="files-grid">
            {files.map((f) => {
              const scan = scanByFile[f.fileId];
              return (
                <Link key={f.fileId} to={`/app/doc/${f.fileId}`} className="file-card">
                  <div className="thumb-mini" />
                  <div className="fc-name" title={f.filename}>{f.filename}</div>
                  <div className="fc-meta">
                    <span>{f.pageCount} pages</span>
                    {scan && (
                      <span className="fc-score">
                        · Trust {scan.trustScore}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function FeatureScan({ file, scan, onOpen }) {
  const color =
    scan.trustScore >= 70 ? 'var(--good)' :
    scan.trustScore >= 40 ? 'var(--warn)' :
                            'var(--bad)';
  const flagged = scan.elements.filter((e) => e.classification === 'synthetic' || e.classification === 'manipulated').length;
  return (
    <div className="lib-hero">
      <span className="label">Latest scan</span>
      <h3>{file.filename}</h3>
      <div className="meta">{file.pageCount} pages · model {scan.modelVersion}</div>

      <div className="row-bottom">
        <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
          <span className="score" style={{ color }}>{scan.trustScore}</span>
          <span className="muted" style={{ fontFamily: 'var(--font-ui)' }}>/ 100</span>
        </div>
        <div className="score-meta">
          <span className="muted" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Trust score</span>
          <div className="score-bar"><span style={{ width: `${scan.trustScore}%` }} /></div>
        </div>
      </div>

      <p className="summary">
        {flagged > 0
          ? `${flagged} suspect ${flagged === 1 ? 'image' : 'images'} flagged across the document.`
          : 'No suspect content detected. The document looks clean.'}
        {' '}
        {scan.elements.length} {scan.elements.length === 1 ? 'image' : 'images'} analysed in total.
      </p>

      <div className="row" style={{ marginTop: 18, gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={onOpen}>Open document →</button>
        <button className="btn btn-sm" onClick={onOpen}>View evidence</button>
      </div>

      <div className="legend" style={{ marginTop: 22 }}>
        {Object.entries(LABELS).map(([k, label]) => (
          <span key={k} className="item">
            <span className={`dot ${k}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
