import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, getToken } from './api/client.js';
import Landing from './pages/Landing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Team from './pages/Team.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Workspace from './pages/Workspace.jsx';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  const [token, setToken] = useState(getToken());

  function handleLogout() {
    api.logout();
    setToken(null);
  }

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
        <Route
          path="/app"
          element={token ? <Workspace onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
