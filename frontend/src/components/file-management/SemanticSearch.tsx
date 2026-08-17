import React, { useState } from 'react';
import { Brain, Send, Copy, AlertTriangle, RefreshCw } from 'lucide-react';

interface SemanticSearchProps {
  docId: number;
  token: string;
  extractedText?: string;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({ docId, token, extractedText }) => {
  const [semanticQuery, setSemanticQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ chunk_index: number, text_content: string, similarity: number }>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);

    // Client-side text keyword ranking fallback for demo textbooks
    if (docId < 0 && extractedText) {
      try {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
        
        const paragraphs = extractedText.split('\n').filter(p => p.trim().length > 15);
        const queryWords = semanticQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        
        const matches = paragraphs.map((para, idx) => {
          let score = 0;
          queryWords.forEach(word => {
            if (para.toLowerCase().includes(word)) score += 1;
          });
          const similarity = score === 0 ? 0 : 0.45 + (score / (queryWords.length + 1)) * 0.45;
          return {
            chunk_index: idx,
            text_content: para.trim(),
            similarity: Math.min(similarity, 0.96)
          };
        })
        .filter(m => m.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

        setSearchResults(matches);
      } catch (err: any) {
        setSearchError('Failed to perform offline search.');
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: semanticQuery })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to search.' }));
        throw new Error(errorData.detail || 'Failed to perform semantic search.');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setSearchError(err.message || 'An error occurred during search.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flexGrow: 1 }}>
      {/* Semantic Search query bar */}
      <form onSubmit={handleSemanticSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input 
          type="text"
          value={semanticQuery}
          onChange={(e) => setSemanticQuery(e.target.value)}
          placeholder="Ask a question about this document..."
          className="search-input-box"
          style={{ flexGrow: 1, padding: '10px 14px' }}
          disabled={searchLoading}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: 'auto', padding: '0 20px', margin: 0 }}
          disabled={searchLoading || !semanticQuery.trim()}
        >
          {searchLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>

      {searchError && (
        <div className="alert alert-danger" style={{ marginBottom: 12 }}>
          <AlertTriangle size={16} />
          <span>{searchError}</span>
        </div>
      )}

      {/* Search Results */}
      <div className="viewer-text-scrollable" style={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '4px',
        minHeight: 0
      }}>
        {searchLoading ? (
          <div className="viewer-placeholder" style={{ height: '200px' }}>
            <div className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
              <RefreshCw size={32} />
            </div>
            <p>Searching vectors in PostgreSQL...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result, idx) => {
            const simPercent = Math.round(result.similarity * 100);
            const badgeColor = simPercent > 75 
              ? 'var(--color-success)' 
              : simPercent > 55 
                ? 'var(--color-primary)' 
                : 'var(--text-muted)';
                
            return (
              <div 
                key={idx} 
                className="search-result-card glass-panel" 
                style={{
                  padding: '16px',
                  background: 'rgba(0,0,0,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    color: badgeColor, 
                    background: 'rgba(0,0,0,0.02)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${badgeColor}`
                  }}>
                    Match: {simPercent}%
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result.text_content);
                      alert("Copied snippet to clipboard!");
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <p style={{ 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6', 
                  color: 'var(--text-primary)', 
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  "{result.text_content}"
                </p>
              </div>
            );
          })
        ) : (
          <div className="viewer-placeholder" style={{ height: '200px' }}>
            <Brain size={36} style={{ opacity: 0.15, marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Ask a question above to scan document text semantically.</p>
          </div>
        )}
      </div>
    </div>
  );
};
