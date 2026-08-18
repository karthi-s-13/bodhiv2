import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Clock, BookOpen, Layers, Eye, Loader2, AlertCircle } from 'lucide-react';
import { MCQAssessmentModal } from './MCQAssessmentModal';

interface SavedAssessmentsProps {
  docId?: number;
  token: string;
}

export const SavedAssessments: React.FC<SavedAssessmentsProps> = ({ docId, token }) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const endpoint = docId ? `/api/documents/${docId}/assessments` : `/api/assessments`;
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch assessments');
        const data = await response.json();
        setAssessments(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching assessments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [docId, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading saved Assessments...</p>
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

  if (assessments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(198, 138, 61, 0.1)', 
          color: '#C68A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
        }}>
          <FileSpreadsheet size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Saved Assessments</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          You haven't saved any lesson Assessments for this textbook yet. Generate one from the Curriculum Map and click "Save to Bodhi".
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileSpreadsheet size={24} style={{ color: '#C68A3D' }} />
        Saved Assessments
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {assessments.map((pres) => (
          <div key={pres.id} style={{
            background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-premium)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.4 }}>
                {pres.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                <BookOpen size={14} style={{ color: '#C68A3D' }} />
                <span style={{ fontWeight: 600 }}>Topic:</span> {pres.topic_name || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Layers size={14} style={{ color: '#E3B36B' }} />
                <span style={{ fontWeight: 600 }}>Chapter:</span> {pres.chapter_name || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={12} />
              Saved on {new Date(pres.created_at).toLocaleDateString()}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setSelectedAssessment(pres)}
                style={{
                  flex: 1, padding: '10px', background: 'rgba(198, 138, 61, 0.1)', color: '#C68A3D',
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

      {selectedAssessment && (
        <MCQAssessmentModal
          docId={docId || 0}
          token={token}
          isEmbedded={true}
          topicName={selectedAssessment.topic_name || ''}
          chapterName={selectedAssessment.chapter_name || ''}
          subtopics={[]}
          initialAssessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
        />
      )}
    </div>
  );
};
