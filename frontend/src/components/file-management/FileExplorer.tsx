import React, { useState } from 'react';
import { 
  Folder, 
  File as FileIcon, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Edit3, 
  Trash, 
  FileDown, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';
import { TopicEditor } from './TopicEditor';
import type { PDFDocument } from '../../types';

interface FileExplorerProps {
  document: PDFDocument;
  token: string;
  onDocumentUpdate: (doc: PDFDocument) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  document: doc,
  token,
  onDocumentUpdate
}) => {
  const [llmLoading, setLlmLoading] = useState<boolean>(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  // Folder Explorer State
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [topicContent, setTopicContent] = useState<string>('');

  const textbookData = doc.textbook_data;

  // Save Textbook JSON Tree to Backend
  const saveTextbookData = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/textbook`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const data = await response.json();
        onDocumentUpdate({ ...doc, textbook_data: data });
      } else {
        alert("Failed to save changes to database.");
      }
    } catch (err) {
      console.error("Error saving textbook data:", err);
    }
  };

  // Generate textbook structure via AI
  const handleGenerateTextbook = async () => {
    setLlmLoading(true);
    setLlmError(null);
    try {
      const response = await fetch(`/api/documents/${doc.id}/generate-textbook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to generate outline.' }));
        throw new Error(errorData.detail || 'Failed to generate outline.');
      }

      const updatedDoc = await response.json();
      onDocumentUpdate(updatedDoc);
      // Reset explorer
      setCurrentFolderPath([]);
      setSelectedItemId(null);
      setEditingItemId(null);
      setActiveTopicId(null);
    } catch (err: any) {
      setLlmError(err.message || 'An error occurred during outline generation.');
    } finally {
      setLlmLoading(false);
    }
  };

  // Rename a folder or file item
  const handleRenameItem = async (itemId: string, newName: string) => {
    if (!textbookData || !newName.trim()) return;
    
    let updatedItems = [...textbookData.items];
    if (currentFolderPath.length === 0) {
      updatedItems = updatedItems.map((item: any) => 
        item.id === itemId ? { ...item, name: newName } : item
      );
    } else {
      updatedItems = updatedItems.map((chap: any) => {
        if (chap.id === currentFolderPath[0]) {
          const updatedChildren = chap.children.map((child: any) => 
            child.id === itemId ? { ...child, name: newName } : child
          );
          return { ...chap, children: updatedChildren };
        }
        return chap;
      });
    }
    
    const updatedData = { ...textbookData, items: updatedItems };
    await saveTextbookData(updatedData);
  };

  // Delete a folder or file item
  const handleDeleteItem = async (itemId: string) => {
    if (!textbookData || !window.confirm("Are you sure you want to delete this item?")) return;
    
    let updatedItems = [...textbookData.items];
    if (currentFolderPath.length === 0) {
      updatedItems = updatedItems.filter((item: any) => item.id !== itemId);
    } else {
      updatedItems = updatedItems.map((chap: any) => {
        if (chap.id === currentFolderPath[0]) {
          const updatedChildren = chap.children.filter((child: any) => child.id !== itemId);
          return { ...chap, children: updatedChildren };
        }
        return chap;
      });
    }
    
    const updatedData = { ...textbookData, items: updatedItems };
    await saveTextbookData(updatedData);
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  // Add a Chapter Folder
  const handleAddChapter = async (name: string) => {
    if (!textbookData || !name.trim()) return;
    
    const newFolderId = `chap-${Date.now()}`;
    const newChapter = {
      id: newFolderId,
      type: "folder",
      name: name,
      children: []
    };
    
    const updatedData = {
      ...textbookData,
      items: [...textbookData.items, newChapter]
    };
    
    await saveTextbookData(updatedData);
  };

  // Add a Topic File inside a Chapter
  const handleAddTopic = async (name: string) => {
    if (!textbookData || currentFolderPath.length === 0 || !name.trim()) return;
    
    const newFileId = `topic-${Date.now()}`;
    const newTopic = {
      id: newFileId,
      type: "file",
      name: name,
      content: `# ${name}\n\nContent and lesson plans for ${name}.`
    };
    
    const updatedItems = textbookData.items.map((chap: any) => {
      if (chap.id === currentFolderPath[0]) {
        return {
          ...chap,
          children: [...chap.children, newTopic]
        };
      }
      return chap;
    });
    
    const updatedData = { ...textbookData, items: updatedItems };
    await saveTextbookData(updatedData);
  };

  // Save specific Topic content markdown
  const handleSaveTopicContent = async (content: string) => {
    if (!textbookData || currentFolderPath.length === 0 || !activeTopicId) return;
    
    const updatedItems = textbookData.items.map((chap: any) => {
      if (chap.id === currentFolderPath[0]) {
        const updatedChildren = chap.children.map((child: any) => 
          child.id === activeTopicId ? { ...child, content: content } : child
        );
        return { ...chap, children: updatedChildren };
      }
      return chap;
    });
    
    const updatedData = { ...textbookData, items: updatedItems };
    await saveTextbookData(updatedData);
    alert("Topic content saved successfully!");
  };

  // Export generated outline folders and files as structured ZIP blob
  const handleExportTextbookZip = async () => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/textbook/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to download ZIP file.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.filename.replace(/\.[^/.]+$/, "")}_textbook.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Error exporting ZIP archive.");
    }
  };

  // Resolve files/folders in the current explorer path
  const getCurrentFolderItems = () => {
    if (!textbookData || !textbookData.items) return [];
    if (currentFolderPath.length === 0) {
      return textbookData.items;
    }
    const parentFolder = textbookData.items.find((item: any) => item.id === currentFolderPath[0]);
    return parentFolder ? parentFolder.children : [];
  };

  if (llmLoading) {
    return (
      <div className="viewer-placeholder" style={{ flexGrow: 1 }}>
        <div className="animate-spin" style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>
          <RefreshCw size={36} />
        </div>
        <h4 style={{ fontWeight: 600 }}>Analyzing Document...</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Generating textbook outline structure using AI. This may take up to a minute.</p>
      </div>
    );
  }

  if (!textbookData || !textbookData.items || textbookData.items.length === 0) {
    return (
      <div className="ai-cta-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        flexGrow: 1,
        gap: '20px',
        background: 'rgba(255,255,255,0.01)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-glass)',
        margin: '8px 0'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(142, 68, 173, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          animation: 'pulseGlow 2s infinite'
        }}>
          <Sparkles size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Create AI Textbook Outline</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.6', margin: '0 auto' }}>
            Convert this extracted material into standard textbook chapters, topics, and hierarchical sub-sections with Unicode tree formatting.
          </p>
        </div>
        {llmError && (
          <div className="alert alert-danger" style={{ maxWidth: '420px', margin: '8px 0' }}>
            <AlertTriangle size={16} />
            <span>{llmError}</span>
          </div>
        )}
        <button className="btn-primary" onClick={handleGenerateTextbook} style={{ width: 'auto', padding: '12px 28px', marginTop: '4px' }}>
          <Sparkles size={16} />
          Generate Outline
        </button>
      </div>
    );
  }

  if (activeTopicId) {
    const parentFolder = textbookData.items.find((i: any) => i.id === currentFolderPath[0]);
    const activeFile = parentFolder?.children.find((c: any) => c.id === activeTopicId);
    return (
      <TopicEditor 
        topicId={activeTopicId}
        topicName={activeFile?.name || 'Topic Content'}
        initialContent={topicContent}
        onSave={handleSaveTopicContent}
        onBack={() => {
          setActiveTopicId(null);
          setTopicContent('');
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flexGrow: 1 }}>
      {/* File Manager Toolbar */}
      <div className="file-manager-toolbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        background: 'rgba(0,0,0,0.01)',
        border: '1px solid var(--border-glass)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)'
      }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <span 
            onClick={() => {
              setCurrentFolderPath([]);
              setSelectedItemId(null);
            }}
            style={{ cursor: 'pointer', color: currentFolderPath.length > 0 ? 'var(--color-primary)' : 'var(--text-primary)', fontWeight: currentFolderPath.length === 0 ? 600 : 400 }}
          >
            Root
          </span>
          {currentFolderPath.map((folderId) => {
            const chap = textbookData?.items?.find((i: any) => i.id === folderId);
            return (
              <React.Fragment key={folderId}>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {chap?.name || 'Chapter'}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleExportTextbookZip}
            title="Export Textbook ZIP directory"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(26, 188, 156, 0.15)',
              border: '1px solid rgba(26, 188, 156, 0.3)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'var(--color-accent)'
            }}
          >
            <FileDown size={14} />
            <span>Export ZIP</span>
          </button>
          
          <button 
            onClick={() => {
              if (currentFolderPath.length === 0) {
                setIsCreatingFolder(true);
              } else {
                setIsCreatingFile(true);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'white'
            }}
          >
            <Plus size={14} />
            <span>{currentFolderPath.length === 0 ? 'Chapter' : 'Topic'}</span>
          </button>

          {selectedItemId && (
            <>
              <button 
                onClick={() => {
                  const item = getCurrentFolderItems().find((i: any) => i.id === selectedItemId);
                  if (item) {
                    setEditingItemId(item.id);
                    setEditingItemName(item.name);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                title="Rename item"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={() => handleDeleteItem(selectedItemId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--color-danger)'
                }}
                title="Delete item"
              >
                <Trash size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card Grid view */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px',
        padding: '8px 0',
        overflowY: 'auto',
        flexGrow: 1,
        minHeight: 0
      }}>
        {/* Back Button Card */}
        {currentFolderPath.length > 0 && (
          <div
            onClick={() => {
              setCurrentFolderPath([]);
              setSelectedItemId(null);
            }}
            style={{
              background: 'rgba(0,0,0,0.01)',
              border: '1px dashed var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '12px',
              transition: 'var(--transition-smooth)'
            }}
          >
            <ChevronLeft size={36} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Back to Chapters</span>
          </div>
        )}

        {getCurrentFolderItems().map((item: any) => (
          <div
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            onDoubleClick={() => {
              if (item.type === 'folder') {
                setCurrentFolderPath([item.id]);
                setSelectedItemId(null);
              } else {
                setActiveTopicId(item.id);
                setTopicContent(item.content || '');
              }
            }}
            style={{
              background: selectedItemId === item.id ? 'rgba(198, 138, 61, 0.05)' : 'rgba(0,0,0,0.01)',
              border: selectedItemId === item.id ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '22px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              gap: '12px',
              transition: 'var(--transition-smooth)',
              userSelect: 'none'
            }}
          >
            {item.type === 'folder' ? (
              <Folder size={36} style={{ color: 'var(--color-primary)' }} />
            ) : (
              <FileIcon size={36} style={{ color: 'var(--color-accent)' }} />
            )}
            
            {editingItemId === item.id ? (
              <input
                type="text"
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameItem(item.id, editingItemName);
                    setEditingItemId(null);
                  } else if (e.key === 'Escape') {
                    setEditingItemId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  textAlign: 'center'
                }}
                autoFocus
              />
            ) : (
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: item.type === 'folder' ? 600 : 400,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: '100%',
                whiteSpace: 'nowrap'
              }}>
                {item.name}
              </span>
            )}
          </div>
        ))}

        {/* Create Folder Inline Card */}
        {isCreatingFolder && (
          <div style={{
            background: 'rgba(0,0,0,0.01)',
            border: '1px dashed var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Folder size={28} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Chapter Name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => {
                  handleAddChapter(newItemName);
                  setIsCreatingFolder(false);
                  setNewItemName('');
                }}
                style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
              >
                Add
              </button>
              <button 
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewItemName('');
                }}
                style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Create File Inline Card */}
        {isCreatingFile && (
          <div style={{
            background: 'rgba(0,0,0,0.01)',
            border: '1px dashed var(--color-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileIcon size={28} style={{ color: 'var(--color-accent)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Topic Name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => {
                  handleAddTopic(newItemName);
                  setIsCreatingFile(false);
                  setNewItemName('');
                }}
                style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
              >
                Add
              </button>
              <button 
                onClick={() => {
                  setIsCreatingFile(false);
                  setNewItemName('');
                }}
                style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
