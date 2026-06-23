import { api } from '../api/client.js';

const LABELS = {
  synthetic: 'AI-generated',
  manipulated: 'Manipulated',
  authentic: 'Authentic',
  inconclusive: 'Inconclusive',
};

export default function AuthenticityPanel({ activeFile, scanResult, onScan, scanning, variant = 'panel' }) {
  const Inner = (
    <>
      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={onScan}
        disabled={!activeFile || scanning}
      >
        {scanning ? <><span className="spinner" /> Scanning…</> : 'Check Authenticity'}
      </button>

        {!scanResult && !scanning && (
          <p className="muted mt-12" style={{ fontSize: 13, lineHeight: 1.5 }}>
            Run a scan on the open document to score it 0 to 100 and outline any AI-generated
            or manipulated images directly on the page.
          </p>
        )}

        {scanResult && (
          <>
            <div className="trust-card mt-16">
              <div className="label">Trust score</div>
              <div className="trust-score">
                <ScoreNumber value={scanResult.trustScore} />
                <span className="unit">/ 100</span>
              </div>
              <div className="trust-bar">
                <span style={{ width: `${scanResult.trustScore}%` }} />
              </div>
              <div className="muted mt-12" style={{ fontSize: 12 }}>
                {scanResult.elements.length} image{scanResult.elements.length === 1 ? '' : 's'} analysed
              </div>
            </div>

            <div className="legend">
              <span className="item"><span className="dot synthetic" /> AI-generated</span>
              <span className="item"><span className="dot manipulated" /> Manipulated</span>
              <span className="item"><span className="dot authentic" /> Authentic</span>
              <span className="item"><span className="dot inconclusive" /> Inconclusive</span>
            </div>

            <div className="element-list">
              {scanResult.elements.map((el, i) => (
                <div key={i} className="elem">
                  <span className={`dot ${el.classification}`} />
                  <div>
                    <div>{LABELS[el.classification] || el.classification}</div>
                    <div className="meta">page {el.page} · {el.type}</div>
                  </div>
                  <div className="conf">{(el.confidence * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </>
        )}

      {api.useStubs && (
        <p className="dim mt-16" style={{ fontSize: 11 }}>
          Stub mode. Using the sample Scan Result from §5.3 of the build plan.
        </p>
      )}
    </>
  );

  if (variant === 'drawer') return Inner;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Authenticity</span>
        {scanResult && <span className="pill">model {scanResult.modelVersion}</span>}
      </div>
      <div className="panel-body">{Inner}</div>
    </div>
  );
}

function ScoreNumber({ value }) {
  const color =
    value >= 70 ? 'var(--good)' :
    value >= 40 ? 'var(--warn)' :
                  'var(--bad)';
  return <span style={{ color }}>{value}</span>;
}
