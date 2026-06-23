import { Link, NavLink } from 'react-router-dom';
import { getToken } from '../api/client.js';

export default function Nav() {
  const signedIn = !!getToken();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <div className="brand-mark">F</div>
          <span className="brand-name">FolioForge</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Overview</NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>How it works</NavLink>
          <NavLink to="/team" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Team</NavLink>
          <a className="nav-link" href="https://github.com/Syphurus/folioForge" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>

        <div className="row">
          {signedIn ? (
            <Link to="/app" className="btn btn-primary btn-sm">Open workspace →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm">Sign in</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Launch demo →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
