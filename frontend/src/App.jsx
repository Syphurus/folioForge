import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, getToken } from './api/client.js';
import Landing from './pages/Landing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Team from './pages/Team.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppShell from './pages/AppShell.jsx';
import Library from './pages/Library.jsx';
import Editor from './pages/Editor.jsx';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [token, setToken] = useState(getToken());

  function handleLogout() {
    api.logout();
    setToken(null);
  }

  const requireAuth = (node) =>
    token ? node : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/team" element={<Team />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/app" replace /> : <LoginPage onLogin={setToken} />}
        />

        {/* Workspace */}
        <Route path="/app" element={requireAuth(<AppShell onLogout={handleLogout} />)}>
          <Route index element={<Library />} />
          <Route path="doc/:fileId" element={<Editor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
