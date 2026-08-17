import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface TopicEditorProps {
  topicId: string;
  topicName: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
}

export const TopicEditor: React.FC<TopicEditorProps> = ({
  topicId,
  topicName,
  initialContent,
  onSave,
  onBack
}) => {
  const [topicContent, setTopicContent] = useState<string>(initialContent);
  const [savingContent, setSavingContent] = useState<boolean>(false);

  const handleSave = async () => {
    setSavingContent(true);
    try {
      await onSave(topicContent);
    } finally {
      setSavingContent(false);
    }
  };

  return (
    <div className="topic-editor-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="editor-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Editing Lesson File</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{topicName}</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={savingContent}
            style={{
              width: 'auto',
              padding: '8px 16px',
              margin: 0,
              fontSize: '0.85rem'
            }}
          >
            {savingContent ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save</span>
          </button>
          <button 
            onClick={onBack}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Back
          </button>
        </div>
      </div>

      <textarea
        value={topicContent}
        onChange={(e) => setTopicContent(e.target.value)}
        style={{
          flexGrow: 1,
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontFamily: '"Fira Code", Courier, monospace',
          fontSize: '0.9rem',
          padding: '16px',
          lineHeight: '1.6',
          resize: 'none',
          outline: 'none',
          minHeight: '300px'
        }}
      />
    </div>
  );
};
