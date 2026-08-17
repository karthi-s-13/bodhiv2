import React, { useState } from 'react';
import { Search, Copy, Check, Download } from 'lucide-react';
import type { PDFDocument } from '../../types';

interface TextReaderProps {
  document: PDFDocument;
}

export const TextReader: React.FC<TextReaderProps> = ({ document }) => {
  const [viewerSearch, setViewerSearch] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document.extracted_text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([document.extracted_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = document.filename.replace(/\.[^/.]+$/, "") + "_extracted.txt";
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const highlightMatches = (text: string, search: string) => {
    if (!search.trim()) return text;
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
        <button 
          className={`btn-action-icon ${copySuccess ? 'accent' : ''}`}
          onClick={copyToClipboard}
          title="Copy text to clipboard"
        >
          {copySuccess ? <Check size={16} /> : <Copy size={16} />}
          <span>{copySuccess ? 'Copied' : 'Copy'}</span>
        </button>
        <button 
          className="btn-action-icon"
          onClick={downloadText}
          title="Export as plain text"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Local Text Search inside Viewer */}
      <div className="text-search-container" style={{ marginBottom: '12px' }}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Search term in extracted text..."
          className="search-input-box"
          style={{ padding: '8px 12px 8px 12px', fontSize: '0.85rem' }}
          value={viewerSearch}
          onChange={(e) => setViewerSearch(e.target.value)}
        />
      </div>

      <div className="viewer-text-scrollable" style={{ flexGrow: 1, overflowY: 'auto' }}>
        {highlightMatches(document.extracted_text, viewerSearch)}
      </div>
    </div>
  );
};
