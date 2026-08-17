import React, { useState } from 'react';
import { FileText, Folder, Brain, RefreshCw, AlertTriangle, Map, Presentation } from 'lucide-react';
import { FileExplorer } from './FileExplorer';
import { TextReader } from './TextReader';
import { SemanticSearch } from './SemanticSearch';
import { CurriculumMap } from './CurriculumMap';
import { SavedPresentations } from './SavedPresentations';
import type { PDFDocument } from '../../types';

interface TextbookDetailProps {
  document: PDFDocument;
  token: string;
  onDocumentUpdate: (doc: PDFDocument) => void;
  onDeleteTextbook: (id: number) => void;
  activeTab: 'curriculum' | 'textbook' | 'text' | 'search' | 'presentations';
  setActiveTab: (tab: 'curriculum' | 'textbook' | 'text' | 'search' | 'presentations') => void;
  selectedTopicName: string;
  selectedTopicNumber?: string;
  selectedChapterLabel?: string;
  selectedChapter?: any;
}

export const TextbookDetail: React.FC<TextbookDetailProps> = ({
  document: doc,
  token,
  onDocumentUpdate,
  onDeleteTextbook,
  activeTab,
  setActiveTab,
  selectedTopicName,
  selectedTopicNumber,
  selectedChapterLabel,
  selectedChapter
}) => {
  const [embeddingLoading, setEmbeddingLoading] = useState<boolean>(false);
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);

  // Trigger manual embedding generation
  const handleEmbedDoc = async () => {
    setEmbeddingLoading(true);
    setEmbeddingError(null);
    try {
      const response = await fetch(`/api/documents/${doc.id}/embed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to trigger embedding.' }));
        throw new Error(errorData.detail || 'Failed to trigger embedding.');
      }

      const updatedDoc = await response.json();
      onDocumentUpdate(updatedDoc);
      alert("Embedding generation triggered successfully in the background! Please check back in a few seconds.");
    } catch (err: any) {
      setEmbeddingError(err.message || 'An error occurred during embedding trigger.');
    } finally {
      setEmbeddingLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Detail Header Info */}
      {activeTab !== 'curriculum' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {doc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!doc.is_embedded && (
              <button 
                onClick={handleEmbedDoc}
                disabled={embeddingLoading}
                className="btn-primary"
                style={{ padding: '8px 14px', margin: 0, fontSize: '0.8rem', width: 'auto', background: 'var(--color-secondary)' }}
              >
                {embeddingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
                <span>Index Vectors</span>
              </button>
            )}
            <button 
              onClick={() => onDeleteTextbook(doc.id)}
              style={{
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Delete Textbook
            </button>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      {activeTab !== 'curriculum' && (
        <div className="viewer-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`viewer-tab-btn ${(activeTab as any) === 'curriculum' ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: (activeTab as any) === 'curriculum' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: (activeTab as any) === 'curriculum' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Map size={16} style={{ color: (activeTab as any) === 'curriculum' ? 'var(--color-primary)' : 'inherit' }} />
              Curriculum Map
            </span>
          </button>
          <button
            onClick={() => setActiveTab('textbook')}
            className={`viewer-tab-btn ${activeTab === 'textbook' ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'textbook' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'textbook' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={16} style={{ color: activeTab === 'textbook' ? 'var(--color-primary)' : 'inherit' }} />
              Folder Explorer
            </span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`viewer-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'text' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'text' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} />
              Text Reader
            </span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`viewer-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'search' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={16} style={{ color: activeTab === 'search' ? 'var(--color-accent)' : 'inherit' }} />
              Semantic Search
            </span>
          </button>
          <button
            onClick={() => setActiveTab('presentations')}
            className={`viewer-tab-btn ${activeTab === 'presentations' ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'presentations' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'presentations' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Presentation size={16} style={{ color: activeTab === 'presentations' ? 'var(--color-primary)' : 'inherit' }} />
              Saved PPTs
            </span>
          </button>
        </div>
      )}

      {/* Embedding Errors */}
      {embeddingError && (
        <div className="alert alert-danger" style={{ marginBottom: '12px' }}>
          <AlertTriangle size={16} />
          <span>{embeddingError}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'curriculum' && (
          <>
            <CurriculumMap
              topicName={selectedTopicName}
              topicNumber={selectedTopicNumber}
              chapterLabel={selectedChapterLabel}
              chapterData={selectedChapter}
              docId={doc.id}
              token={token}
              isEmbedded={!!doc.is_embedded}
            />
          </>
        )}
        {activeTab === 'textbook' && (
          <FileExplorer 
            document={doc}
            token={token}
            onDocumentUpdate={onDocumentUpdate}
          />
        )}
        {activeTab === 'text' && (
          <TextReader 
            document={doc}
          />
        )}
        {activeTab === 'search' && (
          <SemanticSearch 
            docId={doc.id}
            token={token}
            extractedText={doc.extracted_text}
          />
        )}
        {activeTab === 'presentations' && (
          <SavedPresentations
            docId={doc.id}
            token={token}
          />
        )}
      </div>
    </div>
  );
};
