

import React, { useState, useEffect } from 'react';
import WorkerApp from './components/WorkerApp';
import AdminApp from './components/AdminApp';
import Login from './components/Login';
import { Language } from './translations';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [attendance, setAttendance] = useState<any[]>([]);

  // On app load, rehydrate auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  // Fetch attendance from backend when logged in
  useEffect(() => {
    if (token) {
      import('./apiClient').then(({ default: api }) => {
        api.get('/api/attendance')
          .then(res => setAttendance(res.data))
          .catch(() => setAttendance([]));
      });
    }
  }, [token]);

  const handleLogin = (user: any, token: string, role: string) => {
    setCurrentUser(user);
    setToken(token);
    setRole(role);
    // Fetch attendance after login
    import('./apiClient').then(({ default: api }) => {
      api.get('/api/attendance')
        .then(res => setAttendance(res.data))
        .catch(() => setAttendance([]));
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setRole(null);
    setAttendance([]);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  // Protect routes: if no token, show login
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // Pass attendance and setAttendance to children
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden flex flex-col">
      <button onClick={handleLogout} className="absolute top-2 right-2 bg-red-100 text-red-600 px-3 py-1 rounded">Logout</button>
      {role === 'admin' ? (
        <AdminApp user={currentUser} attendance={attendance} setAttendance={setAttendance} language={language} setLanguage={setLanguage} onLogout={handleLogout} />
      ) : (
        <WorkerApp user={currentUser} attendance={attendance} setAttendance={setAttendance} language={language} setLanguage={setLanguage} onLogout={handleLogout} />
      )}
    </div>
  );
};



export default App;
