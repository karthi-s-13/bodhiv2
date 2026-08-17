import React, { useState, useEffect } from 'react';
import { Presentation, Clock, BookOpen, Layers, Eye, Loader2, AlertCircle } from 'lucide-react';
import { PPTModal } from './PPTModal';

interface SavedPresentationsProps {
  docId: number;
  token: string;
}

export const SavedPresentations: React.FC<SavedPresentationsProps> = ({ docId, token }) => {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<any | null>(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await fetch(`/api/documents/${docId}/presentations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch presentations');
        const data = await response.json();
        setPresentations(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching presentations.');
      } finally {
        setLoading(false);
      }
    };
    fetchPresentations();
  }, [docId, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading saved presentations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', color: '#EF4444', display: 'flex', gap: '12px' }}>
        <AlertCircle size={24} />
        <div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', 
          color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
        }}>
          <Presentation size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Saved Presentations</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          You haven't saved any lesson presentations for this textbook yet. Generate one from the Curriculum Map and click "Save to Bodhi".
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Presentation size={24} style={{ color: '#4F46E5' }} />
        Saved Presentations
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {presentations.map((pres) => (
          <div key={pres.id} style={{
            background: 'white', borderRadius: '14px', border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-premium)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.4 }}>
                {pres.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                <BookOpen size={14} style={{ color: '#4F46E5' }} />
                <span style={{ fontWeight: 600 }}>Topic:</span> {pres.topic_name || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Layers size={14} style={{ color: '#7C3AED' }} />
                <span style={{ fontWeight: 600 }}>Chapter:</span> {pres.chapter_name || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={12} />
              Saved on {new Date(pres.created_at).toLocaleDateString()}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setSelectedPresentation(pres)}
                style={{
                  flex: 1, padding: '10px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5',
                  border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Eye size={16} /> View Slides
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPresentation && (
        <PPTModal
          docId={docId}
          token={token}
          isEmbedded={true}
          topicName={selectedPresentation.topic_name || ''}
          chapterName={selectedPresentation.chapter_name || ''}
          subtopics={[]}
          initialPresentation={selectedPresentation}
          onClose={() => setSelectedPresentation(null)}
        />
      )}
    </div>
  );
};
