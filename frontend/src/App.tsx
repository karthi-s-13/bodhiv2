import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { Clock } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        gap: '16px'
      }}>
        <div className="animate-spin" style={{ color: 'var(--color-primary)' }}>
          <Clock size={40} />
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Validating credentials...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return currentView === 'login' ? (
    <Login onToggleView={() => setCurrentView('register')} />
  ) : (
    <Register onToggleView={() => setCurrentView('login')} />
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        {/* Background Ambient glows */}
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        
        <MainApp />
      </div>
    </AuthProvider>
  );
}

export default App;
