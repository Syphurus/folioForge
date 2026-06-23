import { useState } from 'react';
import { api } from '../api/client.js';

export default function Login({ onLogin }) {
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
      onLogin(token);
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div className="login-hero">
          <div className="logo">F</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>FolioForge</div>
            <div className="dim" style={{ fontSize: 12 }}>Authenticity-first PDF workspace</div>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p className="sub">
          Sign in to upload, edit, and verify documents.
          {api.useStubs && <> <span className="badge">stub mode</span></>}
        </p>

        <label htmlFor="u">Username</label>
        <input id="u" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />

        <label htmlFor="p">Password</label>
        <input id="p" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

        {err && <div className="error-msg">{err}</div>}

        <div className="btn-row">
          <span className="dim" style={{ fontSize: 12 }}>Use any creds while stubbed</span>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
