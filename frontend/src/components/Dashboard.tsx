import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown, Menu } from 'lucide-react';
import { Sidebar } from './file-management/Sidebar';
import { DashboardHome } from './file-management/DashboardHome';
import { TextbookPanel } from './file-management/TextbookPanel';
import { ComingSoon } from './file-management/ComingSoon';
import type { PDFDocumentSummary, PDFDocument } from '../types';
import bodhiLogo from '../assets/image.png';

export const Dashboard: React.FC = () => {
  const { token, logout, user } = useAuth();
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('dashboard');
  const [selectedClass, setSelectedClass] = useState<string>('Class 8 - A');
  const [showClassDropdown, setShowClassDropdown] = useState<boolean>(false);
  const [showAskBodhiChat, setShowAskBodhiChat] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Ask Bodhi Chatbot States
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bodhi', text: string }>>([
    { sender: 'bodhi', text: "Hello! I am Bodhi, your AI Co-Teacher. Ask me any question about your textbooks or lessons!" }
  ]);
  
  // State for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for history & viewer
  const [documents, setDocuments] = useState<PDFDocumentSummary[]>([]);
  const [viewerDoc, setViewerDoc] = useState<PDFDocument | null>(null);
  const [viewerLoading, setViewerLoading] = useState<boolean>(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  // Tab Selection inside Textbook Details
  const [viewerTab, setViewerTab] = useState<'curriculum' | 'textbook' | 'text' | 'search' | 'presentations'>('curriculum');

  // Fetch documents list
  const fetchDocuments = async (autoSelectId?: number) => {
    if (!token) return;
    try {
      const response = await fetch('/api/documents/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upload history.');
      }

      const data = await response.json();
      setDocuments(data);
      
      // If we need to autoselect a document (e.g. just uploaded)
      if (autoSelectId) {
        loadViewerDoc(autoSelectId);
      } else if (data.length > 0 && !viewerDoc) {
        // Auto-load first document if none is selected
        loadViewerDoc(data[0].id);
      }
    } catch (err: any) {
      setDocsError(err.message || 'Could not load documents.');
    }
  };

  // Fetch document list on mount
  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const loadViewerDoc = async (id: number) => {
    if (!token) return;
    
    setViewerLoading(true);
    setDocsError(null);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not download document details.');
      }

      const data = await response.json();
      setViewerDoc(data);
      setViewerTab(data.textbook_structure ? 'curriculum' : 'text');
    } catch (err: any) {
      setDocsError(err.message || 'Error loading PDF details.');
    } finally {
      setViewerLoading(false);
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: number) => {
    if (!token || !window.confirm('Are you sure you want to delete this textbook document?')) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document.');
      }

      if (viewerDoc?.id === id) {
        setViewerDoc(null);
      }
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Could not delete document.');
    }
  };

  // Update a single document's outline state in the list and viewer
  const handleDocumentUpdate = (updatedDoc: PDFDocument) => {
    setViewerDoc(updatedDoc);
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDoc.id 
          ? { 
              ...doc, 
              textbook_structure: updatedDoc.textbook_structure, 
              textbook_data: updatedDoc.textbook_data,
              is_embedded: updatedDoc.is_embedded 
            } 
          : doc
      )
    );
  };

  // Ask Bodhi chatbot submit handler
  const handleAskBodhi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !token) return;
    
    const userMsg = chatQuery.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatQuery('');
    setChatLoading(true);
    
    try {
      if (viewerDoc && viewerDoc.is_embedded) {
        const response = await fetch(`/api/documents/${viewerDoc.id}/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: userMsg })
        });
        
        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0) {
            const bestResult = results[0];
            const answer = `Based on your textbook **${viewerDoc.filename}**, here is the most relevant section (Match: ${Math.round(bestResult.similarity * 100)}%):\n\n"${bestResult.text_content}"`;
            setChatMessages(prev => [...prev, { sender: 'bodhi', text: answer }]);
          } else {
            setChatMessages(prev => [...prev, { sender: 'bodhi', text: "I couldn't find any direct matches in the active textbook for that question. Let me know if you want me to search another document!" }]);
          }
        } else {
          setChatMessages(prev => [...prev, { sender: 'bodhi', text: "Sorry, I had trouble reading the textbook database. Please verify if the database is running." }]);
        }
      } else {
        const generalResponses = [
          "To design a lesson plan on that topic, I suggest breaking it down into: 1. Warm-up activity, 2. Direct explanation of key concepts, 3. Guided practice, and 4. Formative assessment.",
          "That sounds like a great topic! You can upload a PDF textbook or reference sheet of that material, generate an outline, and then index it. Once indexed, I will be able to answer specific questions based on it!",
          "As your Co-Teacher, I suggest checking the **My Textbooks** section. Select an uploaded document to generate its textbook chapters or search for keyword vectors.",
          "I can help you construct interactive quizzes and PPT outlines for your Class 8 science class! Try uploading your textbook PDF first."
        ];
        const randomAnswer = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        await new Promise(resolve => setTimeout(resolve, 800));
        setChatMessages(prev => [...prev, { sender: 'bodhi', text: randomAnswer }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bodhi', text: "Sorry, I ran into a connection error. Please try again in a moment." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Mobile Header (only visible on small screens via CSS) */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <img src={bodhiLogo} alt="Bodhi Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>Bodhi AI</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="white" />
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: 'var(--color-danger)', color: 'white',
            fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>3</span>
        </div>
      </header>

      {/* Sidebar Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={(tab) => {
          setActiveSidebarTab(tab);
          if (tab === 'textbooks') {
            setViewerDoc(null);
          }
        }}
        setShowAskBodhiChat={setShowAskBodhiChat}
        userName={user?.full_name}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Hidden file input for quick action uploads */}
      <input 
        type="file" 
        id="dashboard-file-input"
        ref={fileInputRef}
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setUploadProgress(0);
            setUploadError(null);
            
            // Navigate to Textbooks and display uploading
            setActiveSidebarTab('textbooks');
            
            const formData = new FormData();
            formData.append('file', file);
            setUploading(true);
            setUploadStatus('Uploading PDF textbook...');
            setUploadProgress(20);
            
            try {
              const response = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              });
              
              if (!response.ok) {
                const errData = await response.json().catch(() => ({ detail: 'Failed to upload document.' }));
                throw new Error(errData.detail || 'Failed to upload document.');
              }
              
              setUploadProgress(60);
              setUploadStatus('Extracting content pages...');
              
              const uploadedDoc = await response.json();
              setUploadProgress(100);
              setUploadStatus('Textbook processed successfully!');
              
              // Refresh document list and select the uploaded file
              await fetchDocuments(uploadedDoc.id);
            } catch (err: any) {
              setUploadError(err.message || 'Failed to complete textbook upload.');
            } finally {
              setUploading(false);
              setSelectedFile(null);
              setUploadProgress(0);
            }
          }
        }}
        accept="application/pdf"
        style={{ display: 'none' }}
      />

      {/* Main Panel View */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: '30px 40px', height: '100vh', overflowY: 'auto', flexGrow: 1 }}>
        {/* Top Header */}
        {activeSidebarTab === 'dashboard' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Good Morning, {user?.full_name?.split(' ')[0] || 'Mrs. Anjali'}! 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Here's what's happening in your classroom today.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              {/* Class Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-premium)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>{selectedClass}</span>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
                {showClassDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-premium)',
                    zIndex: 100,
                    width: '140px',
                    overflow: 'hidden'
                  }}>
                    {['Class 8 - A', 'Class 8 - B', 'Class 9 - A'].map(c => (
                      <div 
                        key={c}
                        onClick={() => {
                          setSelectedClass(c);
                          setShowClassDropdown(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          background: selectedClass === c ? 'rgba(198, 138, 61, 0.05)' : 'none',
                          color: 'var(--text-primary)'
                        }}
                        className="class-dropdown-item"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'var(--shadow-premium)',
                color: 'var(--text-primary)'
              }}>
                <Bell size={20} />
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--color-danger)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>3</span>
              </div>
            </div>
          </div>
        )}

        {/* Global doc errors or list error */}
        {docsError && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <span>{docsError}</span>
          </div>
        )}

        {/* Upload progress display */}
        {uploading && (
          <div className="progress-container glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
            <div className="progress-label-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span>{uploadStatus}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px', background: 'var(--border-glass)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--color-primary)' }}
              />
            </div>
          </div>
        )}

        {/* Upload error display */}
        {uploadError && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <span>{uploadError}</span>
          </div>
        )}

        {/* View Switch routing */}
        {activeSidebarTab === 'dashboard' && (
          <DashboardHome 
            documents={documents}
            onNavigateToTextbooks={(tab) => {
              if (tab) setViewerTab(tab);
              setActiveSidebarTab('textbooks');
            }}
            onTriggerUpload={() => fileInputRef.current?.click()}
            onLoadViewerDoc={loadViewerDoc}
          />
        )}
        
        {activeSidebarTab === 'textbooks' && (
          <TextbookPanel 
            documents={documents}
            viewerDoc={viewerDoc}
            loadViewerDoc={loadViewerDoc}
            onDeleteDoc={handleDeleteDoc}
            onDocumentUpdate={handleDocumentUpdate}
            token={token || ''}
            viewerTab={viewerTab}
            setViewerTab={setViewerTab}
          />
        )}
        
        {activeSidebarTab !== 'dashboard' && activeSidebarTab !== 'textbooks' && (
          <ComingSoon 
            tabName={
              activeSidebarTab === 'curriculum' ? 'Curriculum Map' :
              activeSidebarTab === 'lessons' ? 'Lesson Planner' :
              activeSidebarTab === 'materials' ? 'PPT & Materials' :
              activeSidebarTab === 'assessments' ? 'Assessments' :
              activeSidebarTab === 'homework' ? 'Homework' :
              activeSidebarTab === 'analytics' ? 'Class Analytics' :
              activeSidebarTab === 'students' ? 'Students' :
              activeSidebarTab === 'settings' ? 'Settings' : 'Workspace Module'
            } 
            onBack={() => setActiveSidebarTab('dashboard')}
          />
        )}
      </main>

      {/* Floating Ask Bodhi chat overlay drawer */}
      {showAskBodhiChat && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '550px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-premium)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} className="animate-fade-in">
          {/* Header */}
          <div style={{
            background: 'var(--bg-sidebar)',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Ask Bodhi Co-Teacher</h3>
            <button 
              onClick={() => setShowAskBodhiChat(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </div>

          {/* Messages list */}
          <div style={{
            flexGrow: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-panel)'
          }}>
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderTopRightRadius: msg.sender === 'user' ? '2px' : '14px',
                  borderTopLeftRadius: msg.sender === 'bodhi' ? '2px' : '14px',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                padding: '10px 14px',
                borderRadius: '14px',
                borderTopLeftRadius: '2px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="animate-spin" style={{ display: 'inline-block' }}>&#9696;</span>
                Thinking...
              </div>
            )}
          </div>

          {/* Input form */}
          <form 
            onSubmit={handleAskBodhi}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              gap: '8px',
              background: 'var(--bg-card)'
            }}
          >
            <input 
              type="text"
              placeholder="Ask a question..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '8px 12px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
              disabled={chatLoading}
            />
            <button 
              type="submit"
              className="btn-primary"
              style={{
                width: 'auto',
                padding: '0 16px',
                margin: 0,
                fontSize: '0.85rem'
              }}
              disabled={chatLoading || !chatQuery.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
