import React from 'react';
import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  tabName: string;
  onBack: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ tabName, onBack }) => {
  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      textAlign: 'center',
      gap: '24px'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(79, 70, 229, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary)'
      }}>
        <Sparkles size={36} />
      </div>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Module "{tabName}" Coming Soon</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          We are currently developing this teaching helper workspace inside Bodhi AI. Stay tuned for advanced curriculum planners and smart classroom tools!
        </p>
      </div>
      <button 
        onClick={onBack}
        className="btn-primary" 
        style={{ width: 'auto', padding: '12px 28px', margin: 0 }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};
