import React from 'react';
import { Search, FileText, Trash2, Clock } from 'lucide-react';
import type { PDFDocumentSummary } from '../../types';

interface TextbookListProps {
  documents: PDFDocumentSummary[];
  selectedDocId: number | null;
  onSelectDoc: (id: number) => void;
  onDeleteDoc: (id: number) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const TextbookList: React.FC<TextbookListProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  searchTerm,
  onSearchChange
}) => {

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }} className="history-sidebar glass-panel">
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Textbooks History</h3>
        
        {/* Search documents input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search textbooks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              fontSize: '0.85rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* List items */}
      <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        {filteredDocs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No textbooks uploaded yet.
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'rgba(0,0,0,0.01)',
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className={`document-list-item ${isSelected ? 'selected' : ''}`}
              >
                <div style={{ display: 'flex', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                  <FileText size={18} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span 
                      style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={doc.filename}
                    >
                      {doc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        {formatDate(doc.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  className="btn-delete-doc"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px'
                  }}
                  title="Delete textbook"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
