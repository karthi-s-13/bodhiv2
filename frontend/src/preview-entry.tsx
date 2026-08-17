import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';

// TEMP PREVIEW HARNESS — not part of the app, mocks the backend so the
// UI can be visually inspected without Postgres/FastAPI running.
const realFetch = window.fetch.bind(window);
window.fetch = async (input: any, init?: any) => {
  const url = typeof input === 'string' ? input : input.url;
  if (url.includes('/api/auth/me')) {
    return new Response(JSON.stringify({
      id: 1, email: 'preview@bodhi.app', full_name: 'Anjali Rao', created_at: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (url.includes('/api/documents')) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return realFetch(input, init);
};
localStorage.setItem('teacher_token', 'preview-token');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </StrictMode>,
);
