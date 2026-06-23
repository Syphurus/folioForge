import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="brand" style={{ marginBottom: 16 }}>
              <div className="brand-mark">F</div>
              <span className="brand-name">FolioForge</span>
            </Link>
            <p style={{ maxWidth: '32ch', marginTop: 12 }}>
              An authenticity-first PDF workspace. Forge truth into every document.
            </p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <Link to="/">Overview</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/app">Workspace</Link>
          </div>
          <div className="footer-col">
            <h5>Team</h5>
            <Link to="/team">The team</Link>
            <a href="https://github.com/Syphurus/folioForge/blob/main/docs/BUILD_PLAN.md" target="_blank" rel="noreferrer">Build plan</a>
            <a href="https://github.com/Syphurus/folioForge/blob/main/docs/CONTRACT.md" target="_blank" rel="noreferrer">API contract</a>
          </div>
          <div className="footer-col">
            <h5>Repo</h5>
            <a href="https://github.com/Syphurus/folioForge" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://github.com/Syphurus/folioForge/blob/main/README.md" target="_blank" rel="noreferrer">README</a>
            <a href="https://github.com/Syphurus/folioForge/issues" target="_blank" rel="noreferrer">Issues</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FolioForge · Sprint v1.0</span>
          <span>Built for the prototype review</span>
        </div>
      </div>
    </footer>
  );
}
