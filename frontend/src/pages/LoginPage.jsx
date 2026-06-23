import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { token } = await api.login(username, password);
      onLogin?.(token);
      navigate('/app');
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <aside className="login-side">
        <Link to="/" className="brand">
          <div className="brand-mark">F</div>
          <span className="brand-name">FolioForge</span>
        </Link>

        <div>
          <span className="eyebrow">Welcome to the demo</span>
          <p className="login-quote" style={{ marginTop: 20 }}>
            “The authenticity layer for trusted documents. <em>Forged</em> in five days,
            built to take forward.”
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <span className="pill pill-gold pill-dot">Stub mode</span>
          <span>Use any credentials</span>
        </div>
      </aside>

      <main className="login-form-side">
        <div className="login-card">
          <span className="eyebrow">Sign in</span>
          <h1>Open the<br /> workspace.</h1>
          <p className="sub">No real auth this sprint. Any username and password gets you in.</p>

          <form onSubmit={submit}>
            <label htmlFor="u">Username</label>
            <input id="u" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />

            <label htmlFor="p">Password</label>
            <input id="p" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

            {err && <div className="error-msg">{err}</div>}

            <div className="btn-row">
              <Link to="/" className="muted" style={{ fontSize: 13, textDecoration: 'none' }}>← Back</Link>
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? <><span className="spinner" /> Signing in…</> : 'Continue →'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
