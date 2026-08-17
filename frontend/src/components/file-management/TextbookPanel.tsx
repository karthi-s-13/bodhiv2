import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UploadCloud,
  Folder,
  FileText,
  Brain,
  Search,
  Grid,
  List,
  ArrowRight,
  Trash,
  Plus,
  ChevronRight,
  ChevronDown,
  Bell,
  Download
} from 'lucide-react';
import { TextbookDetail } from './TextbookDetail';
import type { PDFDocument, PDFDocumentSummary } from '../../types';

interface TextbookPanelProps {
  documents: PDFDocumentSummary[];
  viewerDoc: PDFDocument | null;
  loadViewerDoc: (id: number) => void;
  onDeleteDoc: (id: number) => void;
  onDocumentUpdate: (doc: PDFDocument) => void;
  token: string;
  viewerTab: 'curriculum' | 'textbook' | 'text' | 'search';
  setViewerTab: (tab: 'curriculum' | 'textbook' | 'text' | 'search') => void;
}

export const TextbookPanel: React.FC<TextbookPanelProps> = ({
  documents,
  viewerDoc,
  loadViewerDoc,
  onDeleteDoc,
  onDocumentUpdate,
  token,
  viewerTab,
  setViewerTab
}) => {
  // UI Layout Modes
  const [mode, setMode] = useState<'library' | 'detail'>('library');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  
  // Library Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [selectedSort, setSelectedSort] = useState<string>('Recently Added');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Table of Contents Accordion States
  const [selectedTopicName, setSelectedTopicName] = useState<string>('Photosynthesis');
  const [selectedTopicNumber, setSelectedTopicNumber] = useState<string | undefined>(undefined);
  const [selectedChapterLabel, setSelectedChapterLabel] = useState<string | undefined>(undefined);
  const [selectedChapter, setSelectedChapter] = useState<any>(undefined);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [tocSearchTerm, setTocSearchTerm] = useState<string>('');

  const tabLabels: Record<string, string> = {
    curriculum: 'Curriculum Map',
    textbook: 'Folder Explorer',
    text: 'Text Reader',
    search: 'Semantic Search'
  };

  // Toggle chapter accordion
  const toggleChapter = (chapId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapId]: !prev[chapId]
    }));
  };

  // Synchronize view mode: if a document is selected, show detail view; otherwise show library grid
  useEffect(() => {
    if (viewerDoc) {
      setMode('detail');
      if (viewerDoc.textbook_data && viewerDoc.textbook_data.items && viewerDoc.textbook_data.items.length > 0) {
        const firstChap = viewerDoc.textbook_data.items[0];
        if (firstChap.children && firstChap.children.length > 0) {
          setSelectedTopicName(firstChap.children[0].name);
          setSelectedTopicNumber('1.1');
          setSelectedChapterLabel(`Chapter 1: ${firstChap.name}`);
          setSelectedChapter(firstChap);
          setExpandedChapters({ [firstChap.id]: true });
        }
      } else {
        setSelectedTopicName('General Overview');
        setSelectedTopicNumber(undefined);
        setSelectedChapterLabel(undefined);
        setSelectedChapter(undefined);
      }
    } else {
      setMode('library');
    }
  }, [viewerDoc]);

  // Format date helper
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

  // Select a document to view
  const handleViewCurriculum = (doc: any) => {
    loadViewerDoc(doc.id);
    setMode('detail');
  };

  // Render high-fidelity SVG cover vector
  const renderBookCoverSvg = (subject: string, title: string) => {
    const cleanSubject = subject.toLowerCase().trim();
    if (cleanSubject === 'science') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="sciGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#sciGrad)" rx="6"/>
          <circle cx="20" cy="20" r="40" fill="rgba(255,255,255,0.05)" />
          <path d="M45,55 L45,40 L48,40 L48,32 L62,32 L62,40 L65,40 L65,55 L82,88 A20,20 0 0,1 65,108 L45,108 A20,20 0 0,1 28,88 Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M33,88 L77,88 A18,18 0 0,1 65,103 L45,103 A18,18 0 0,1 33,88 Z" fill="rgba(255,255,255,0.2)"/>
          <circle cx="50" cy="72" r="3" fill="white"/>
          <circle cx="60" cy="67" r="2" fill="white"/>
          <circle cx="45" cy="80" r="4" fill="white" opacity="0.6"/>
          <path d="M38,62 L42,66 L38,70" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
          <text x="55" y="125" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="1">SCIENCE</text>
          <text x="55" y="136" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontWeight="700" textAnchor="middle">STANDARD EIGHT</text>
        </svg>
      );
    } else if (cleanSubject === 'mathematics' || cleanSubject === 'math') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="mathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#mathGrad)" rx="6"/>
          <line x1="10" y1="0" x2="10" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="30" y1="0" x2="30" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="50" y1="0" x2="50" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="70" y1="0" x2="70" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="90" y1="0" x2="90" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="0" y1="20" x2="110" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="0" y1="50" x2="110" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="0" y1="80" x2="110" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="0" y1="110" x2="110" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          
          <path d="M30,78 A22,22 0 0,1 78,78 Z" fill="none" stroke="white" strokeWidth="2"/>
          <line x1="30" y1="78" x2="78" y2="78" stroke="white" strokeWidth="2"/>
          <path d="M54,78 L34,43 L44,38 L54,78" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
          <circle cx="54" cy="78" r="2" fill="white"/>
          <text x="55" y="125" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="1">MATHEMATICS</text>
          <text x="55" y="136" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontWeight="700" textAnchor="middle">STANDARD EIGHT</text>
        </svg>
      );
    } else if (cleanSubject === 'english') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="engGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="#FCE8D1" rx="6"/>
          <rect width="110" height="150" fill="url(#engGrad)" rx="6"/>
          <path d="M25,82 Q45,72 55,82 Q65,72 85,82 L85,100 Q65,90 55,100 Q45,90 25,100 Z" fill="none" stroke="#78350F" strokeWidth="2"/>
          <line x1="55" y1="82" x2="55" y2="100" stroke="#78350F" strokeWidth="2"/>
          <path d="M55,77 Q75,37 78,37 Q78,52 62,72" fill="none" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="55" y="125" fill="#78350F" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="1">ENGLISH</text>
          <text x="55" y="136" fill="#92400E" fontSize="5.5" fontWeight="700" textAnchor="middle">STANDARD EIGHT</text>
        </svg>
      );
    } else if (cleanSubject === 'tamil') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="tamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#tamGrad)" rx="6"/>
          <path d="M35,90 L75,90 L70,75 L40,75 L45,75 L45,62 L65,62 L60,48 L50,48 L50,38 L60,38 L55,25 L55,20 Z" fill="none" stroke="white" strokeWidth="1.8"/>
          <line x1="25" y1="90" x2="85" y2="90" stroke="white" strokeWidth="2"/>
          <text x="55" y="115" fill="white" fontSize="12" fontWeight="900" textAnchor="middle">தமிழ்</text>
          <text x="55" y="132" fill="rgba(255,255,255,0.8)" fontSize="6.5" fontWeight="700" textAnchor="middle">எட்டாம் வகுப்பு</text>
        </svg>
      );
    } else if (cleanSubject === 'social science' || cleanSubject === 'history' || cleanSubject === 'social') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="socGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#socGrad)" rx="6"/>
          <path d="M30,90 L30,40 L45,30 L65,30 L80,40 L80,90 Z" fill="none" stroke="white" strokeWidth="2"/>
          <path d="M45,90 L45,65 Q55,55 65,65 L65,90" fill="none" stroke="white" strokeWidth="1.5"/>
          <circle cx="55" cy="45" r="4" fill="white"/>
          <text x="55" y="118" fill="white" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="0.5">SOCIAL SCIENCE</text>
          <text x="55" y="132" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontWeight="700" textAnchor="middle">STANDARD EIGHT</text>
        </svg>
      );
    } else if (cleanSubject === 'hindi') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="hinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#hinGrad)" rx="6"/>
          <path d="M55,90 L55,75 M55,78 L45,70 M55,83 L65,75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M55,35 C42,35 38,50 45,60 C40,72 52,78 55,75 C58,78 70,72 65,60 C72,50 68,35 55,35 Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
          <text x="55" y="116" fill="white" fontSize="12" fontWeight="900" textAnchor="middle">हिंदी</text>
          <text x="55" y="132" fill="rgba(255,255,255,0.8)" fontSize="6.5" fontWeight="700" textAnchor="middle">कक्षा 8</text>
        </svg>
      );
    } else {
      // Default dynamic cover based on first letter of title
      return (
        <svg width="100%" height="100%" viewBox="0 0 110 150" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
          </defs>
          <rect width="110" height="150" fill="url(#defGrad)" rx="6"/>
          <path d="M35,45 H75 V95 H35 Z M45,45 V95 M55,45 V95 M65,45 V95" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
          <path d="M30,40 Q55,35 80,40 L80,95 Q55,90 30,95 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          <line x1="55" y1="38" x2="55" y2="92" stroke="white" strokeWidth="2"/>
          <text x="55" y="122" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.5">{title.substring(0, 15).toUpperCase()}</text>
          <text x="55" y="134" fill="rgba(255,255,255,0.7)" fontSize="5" fontWeight="700" textAnchor="middle">TEXTBOOK</text>
        </svg>
      );
    }
  };

  const getSubjectBadgeColor = (subj?: string) => {
    const cleanSub = subj?.toLowerCase() || '';
    if (cleanSub.includes('science')) return '#E0F2FE';
    if (cleanSub.includes('math')) return '#E0F2FE';
    if (cleanSub.includes('english')) return '#F3E8FF';
    if (cleanSub.includes('tamil')) return '#FEF3C7';
    if (cleanSub.includes('social')) return '#FFEDD5';
    if (cleanSub.includes('hindi')) return '#DCFCE7';
    return 'rgba(79, 70, 229, 0.08)';
  };

  const getSubjectTextColor = (subj?: string) => {
    const cleanSub = subj?.toLowerCase() || '';
    if (cleanSub.includes('science')) return '#0369A1';
    if (cleanSub.includes('math')) return '#1D4ED8';
    if (cleanSub.includes('english')) return '#7E22CE';
    if (cleanSub.includes('tamil')) return '#B45309';
    if (cleanSub.includes('social')) return '#C2410C';
    if (cleanSub.includes('hindi')) return '#15803D';
    return 'var(--color-primary)';
  };

  // Convert uploaded database summaries into full cards matching demo model
  const dbTextbooksMapped = documents.map(doc => {
    // Attempt to parse subject name from filename
    const lowerName = doc.filename.toLowerCase();
    let subj = "General";
    if (lowerName.includes("science")) subj = "Science";
    else if (lowerName.includes("math") || lowerName.includes("algebra") || lowerName.includes("geometry")) subj = "Mathematics";
    else if (lowerName.includes("english") || lowerName.includes("prose") || lowerName.includes("grammar")) subj = "English";
    else if (lowerName.includes("tamil") || lowerName.includes("தமிழ்")) subj = "Tamil";
    else if (lowerName.includes("social") || lowerName.includes("history") || lowerName.includes("civics")) subj = "Social Science";
    else if (lowerName.includes("hindi") || lowerName.includes("हिंदी")) subj = "Hindi";

    // Count folders/topics inside textbook_data
    let chaps = 0;
    let topics = 0;
    if (doc.textbook_data && doc.textbook_data.items) {
      doc.textbook_data.items.forEach((chap: any) => {
        chaps += 1;
        if (chap.children) topics += chap.children.length;
      });
    }

    return {
      id: doc.id,
      filename: doc.filename,
      subject: subj,
      title: doc.filename.replace(/\.[^/.]+$/, ""),
      grade: "Class 8",
      board: "Tamil Nadu State Board",
      uploaded_at: doc.uploaded_at,
      file_size: doc.file_size,
      is_outlined: !!doc.textbook_structure,
      is_embedded: !!doc.is_embedded,
      chapters_count: chaps,
      topics_count: topics,
      concepts_count: topics * 5, // Mock estimate
      textbook_data: doc.textbook_data,
      extracted_text: (doc as any).extracted_text || ""
    };
  });

  // Only real uploaded textbooks
  const allTextbooks = dbTextbooksMapped;

  // Filtering Logic
  const filteredTextbooks = allTextbooks.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All Subjects' || doc.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  // Sorting Logic
  const sortedTextbooks = [...filteredTextbooks].sort((a, b) => {
    if (selectedSort === 'Name A-Z') {
      return a.title.localeCompare(b.title);
    }
    if (selectedSort === 'Size') {
      return b.file_size - a.file_size;
    }
    // Recently Added (default)
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  });

  // Pagination Logic (6 items per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedTextbooks.length / itemsPerPage);
  const paginatedTextbooks = sortedTextbooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Global library totals calculation
  const totalBooksCount = allTextbooks.length;
  const totalChaptersCount = allTextbooks.reduce((acc, doc) => acc + (doc.chapters_count || 0), 0);
  const totalTopicsCount = allTextbooks.reduce((acc, doc) => acc + (doc.topics_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }} className="animate-fade-in">
      
      {mode === 'library' ? (
        <div className="textbook-library-layout">
          {/* Library Header */}
          <div className="view-header" style={{ marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>My Textbooks</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              Manage your uploaded textbooks and explore their curriculum maps.
            </p>
          </div>

          {/* Stats Row & Upload Card */}
          <div className="library-top-row">
            {/* Upload New Textbook Card */}
            <div className="textbook-upload-card" onClick={() => {
              const fileInput = document.getElementById('dashboard-file-input') as HTMLInputElement;
              if (fileInput) fileInput.click();
            }}>
              <div className="upload-card-icon">
                <UploadCloud size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Upload New Textbook</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drag & drop your PDF here or <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Browse Files</span></span>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Supports PDF (Max 100MB)</span>
            </div>

            {/* Total Textbooks */}
            <div className="library-stats-card">
              <div className="library-stats-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)' }}>
                <BookOpen size={24} />
              </div>
              <div className="stats-card-details">
                <span className="stats-card-num">{totalBooksCount}</span>
                <span className="stats-card-label">Total Textbooks</span>
                <span className="stats-card-sub">Across all subjects</span>
              </div>
            </div>

            {/* Total Chapters */}
            <div className="library-stats-card">
              <div className="library-stats-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <Folder size={24} />
              </div>
              <div className="stats-card-details">
                <span className="stats-card-num">{totalChaptersCount}</span>
                <span className="stats-card-label">Total Chapters</span>
                <span className="stats-card-sub">Ready to teach</span>
              </div>
            </div>

            {/* Total Topics */}
            <div className="library-stats-card">
              <div className="library-stats-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <FileText size={24} />
              </div>
              <div className="stats-card-details">
                <span className="stats-card-num">{totalTopicsCount}</span>
                <span className="stats-card-label">Total Topics</span>
                <span className="stats-card-sub">Extracted from books</span>
              </div>
            </div>
          </div>

          {/* Filters and Actions Toolbar */}
          <div className="library-filters-row">
            {/* Search */}
            <div className="library-search-container">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search textbooks..."
                className="library-search-input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Select Filter and Layout Toggles */}
            <div className="library-filters-actions">
              <select 
                className="library-filter-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Subjects">All Subjects</option>
              </select>

              <select 
                className="library-filter-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="Recently Added">Recently Added</option>
                <option value="Name A-Z">Name A-Z</option>
                <option value="Size">Size</option>
              </select>

              {/* Layout togglers */}
              <button 
                className={`view-toggle-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                onClick={() => setViewLayout('grid')}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button 
                className={`view-toggle-btn ${viewLayout === 'list' ? 'active' : ''}`}
                onClick={() => setViewLayout('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Grid / List Cards */}
          {paginatedTextbooks.length === 0 ? (
            <div className="viewer-placeholder" style={{ padding: '60px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)' }}>
              <BookOpen size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
              <h4 style={{ fontWeight: 600 }}>No Textbooks Found</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try adjusting your search query or filters.</p>
            </div>
          ) : viewLayout === 'grid' ? (
            <div className="textbook-cards-grid">
              {paginatedTextbooks.map((doc) => (
                <div key={doc.id} className="textbook-card-item">
                  <div className="card-top-layout">
                    {/* Illustrated SVG Book Cover */}
                    <div className="book-cover-container">
                      {renderBookCoverSvg(doc.subject, doc.title)}
                    </div>
                    {/* Content Details */}
                    <div className="card-details-pane">
                      <span className="subject-badge" style={{
                        background: getSubjectBadgeColor(doc.subject),
                        color: getSubjectTextColor(doc.subject)
                      }}>{doc.subject}</span>
                      <h4 className="card-book-title" title={doc.title}>{doc.title}</h4>
                      <h5 className="card-book-grade">{doc.grade}</h5>
                      <span className="card-book-board">{doc.board}</span>
                      <span className="card-book-date">Uploaded on {formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>

                  {/* Chapter/Topic stats */}
                  <div className="card-stats-row">
                    <div className="card-stat-mini">
                      <Folder size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>{doc.chapters_count} Chapters</span>
                    </div>
                    <div className="card-stat-mini">
                      <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                      <span>{doc.topics_count} Topics</span>
                    </div>
                    <div className="card-stat-mini">
                      <Brain size={14} style={{ color: 'var(--color-success)' }} />
                      <span>{doc.concepts_count} Concepts</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-actions-row">
                    <button 
                      onClick={() => handleViewCurriculum(doc)}
                      className="btn-curriculum-outline"
                    >
                      View Curriculum Map
                    </button>
                    <button 
                      onClick={() => handleViewCurriculum(doc)}
                      className="btn-arrow-action"
                      title="Explore details"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List Layout Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paginatedTextbooks.map((doc) => (
                <div 
                  key={doc.id} 
                  className="textbook-list-item glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-lg)',
                    gap: '20px',
                    boxShadow: 'var(--shadow-premium)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flexGrow: 1 }}>
                    <div style={{ width: '48px', height: '64px', flexShrink: 0 }}>
                      {renderBookCoverSvg(doc.subject, doc.title)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</h4>
                        <span className="subject-badge" style={{
                          background: getSubjectBadgeColor(doc.subject),
                          color: getSubjectTextColor(doc.subject),
                          fontSize: '0.65rem',
                          padding: '2px 8px'
                        }}>{doc.subject}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {doc.grade} • {doc.board} • Uploaded {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '24px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <div className="card-stat-mini">
                      <Folder size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>{doc.chapters_count} Chapters</span>
                    </div>
                    <div className="card-stat-mini">
                      <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                      <span>{doc.topics_count} Topics</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleViewCurriculum(doc)}
                      className="btn-curriculum-outline"
                      style={{ width: 'auto', padding: '8px 16px', margin: 0 }}
                    >
                      View Curriculum Map
                    </button>
                    <button 
                      onClick={() => onDeleteDoc(doc.id)}
                      className="btn-arrow-action"
                      style={{ width: '36px', height: '36px', borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                      title="Delete textbook"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination dots footer */}
          {totalPages > 1 && (
            <div className="pagination-container">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <div 
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-dot ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </div>
              ))}
              <div 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="pagination-dot"
                style={{ visibility: currentPage === totalPages ? 'hidden' : 'visible' }}
              >
                &gt;
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Split-Pane View Mode */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }} className="animate-fade-in">
          <div className="detail-breadcrumb-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div className="breadcrumb-trail" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span className="breadcrumb-link" onClick={() => setMode('library')} style={{ cursor: 'pointer' }}>My Textbooks</span>
                {viewerDoc && (
                  <>
                    <ChevronRight size={14} style={{ margin: '0 4px' }} />
                    <span>{(viewerDoc as any).title || viewerDoc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}</span>
                    <ChevronRight size={14} style={{ margin: '0 4px' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tabLabels[viewerTab]}</span>
                  </>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Curriculum Map</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Visualize the structure of your textbook. Click on any topic to view its details and teaching resources.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <button className="class-pill-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Class 8 - A</span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
              <div className="notif-bell-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
                <span className="notif-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--color-danger)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>3</span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                <Plus size={16} />
                Generate New Lesson
              </button>
            </div>
          </div>

          <div className="history-layout" style={{ flexGrow: 1, minHeight: 0 }}>
            {/* Left column: Table of Contents Accordion Pane */}
            {viewerDoc && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }} className="history-sidebar glass-panel animate-fade-in">
                {/* Mini Book Card */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-glass)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '52px', height: '70px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      {renderBookCoverSvg((viewerDoc as any).subject || 'Default', (viewerDoc as any).title || viewerDoc.filename)}
                    </div>
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={(viewerDoc as any).title || viewerDoc.filename}>
                        {(viewerDoc as any).title || viewerDoc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {(viewerDoc as any).grade || 'Class 8'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {(viewerDoc as any).board || 'Tamil Nadu State Board'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMode('library')}
                    style={{
                      width: '100%',
                      background: 'white',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '7px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Change Textbook
                  </button>
                </div>

                {/* Table of Contents Header */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Table of Contents</h3>
                  
                  {/* Search box */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      placeholder="Search chapters or topics..."
                      value={tocSearchTerm}
                      onChange={(e) => setTocSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        fontSize: '0.8rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Accordion Tree list */}
                <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: 0 }}>
                  {viewerDoc.textbook_data?.items?.map((chapter: any, chapIdx: number) => {
                    const chapterNumber = chapIdx + 1;
                    const isExpanded = !!expandedChapters[chapter.id];
                    const filteredChildren = chapter.children?.filter((topic: any) =>
                      topic.name.toLowerCase().includes(tocSearchTerm.toLowerCase())
                    ) || [];

                    if (tocSearchTerm && filteredChildren.length === 0 && !chapter.name.toLowerCase().includes(tocSearchTerm.toLowerCase())) {
                      return null;
                    }

                    return (
                      <div key={chapter.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                          onClick={() => toggleChapter(chapter.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 6px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0,0,0,0.005)'
                          }}
                          className="chapter-accordion-header"
                        >
                          <span className="chapter-header-stack">
                            <span className="chapter-header-label">Chapter {chapterNumber}</span>
                            <span className="chapter-header-title">{chapter.name}</span>
                          </span>
                          <ChevronRight
                            size={14}
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                              flexShrink: 0
                            }}
                          />
                        </div>

                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '14px', marginTop: '4px', borderLeft: '2px solid rgba(79, 70, 229, 0.15)', marginLeft: '12px' }}>
                            {filteredChildren.map((topic: any) => {
                              const isSelected = selectedTopicName === topic.name;
                              const topicIndexInChapter = (chapter.children || []).findIndex((t: any) => t.id === topic.id) + 1;
                              const topicNumber = `${chapterNumber}.${topicIndexInChapter}`;
                              return (
                                <div
                                  key={topic.id}
                                  onClick={() => {
                                    setSelectedTopicName(topic.name);
                                    setSelectedTopicNumber(topicNumber);
                                    setSelectedChapterLabel(`Chapter ${chapterNumber}: ${chapter.name}`);
                                    setSelectedChapter(chapter);
                                    setViewerTab('curriculum');
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 8px',
                                    fontSize: '0.78rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)',
                                    background: isSelected ? 'rgba(79, 70, 229, 0.06)' : 'transparent',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-smooth)',
                                    position: 'relative'
                                  }}
                                  className={`topic-tree-item ${isSelected ? 'selected' : ''}`}
                                >
                                  {/* Bullet point connecting to the left border */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '-19px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: isSelected ? 'var(--color-primary)' : 'white',
                                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'rgba(79, 70, 229, 0.3)'}`,
                                    zIndex: 2
                                  }} />
                                  <span className="topic-number-prefix" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: 700 }}>{topicNumber}</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {topic.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Download button */}
                <button 
                  onClick={() => {
                    alert("Curriculum map exported and downloaded as PDF successfully!");
                  }}
                  className="btn-curriculum-outline"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  <Download size={14} />
                  <span>Download Curriculum Map</span>
                </button>
              </div>
            )}

            {/* Right pane: Detailed explorer/viewer */}
            <div className="viewer-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {viewerDoc ? (
                <TextbookDetail 
                  document={viewerDoc}
                  token={token}
                  onDocumentUpdate={onDocumentUpdate}
                  onDeleteTextbook={(id) => {
                    if (id < 0) {
                      alert("Demo books cannot be deleted.");
                    } else {
                      onDeleteDoc(id);
                    }
                  }}
                  activeTab={viewerTab}
                  setActiveTab={setViewerTab}
                  selectedTopicName={selectedTopicName}
                  selectedTopicNumber={selectedTopicNumber}
                  selectedChapterLabel={selectedChapterLabel}
                  selectedChapter={selectedChapter}
                />
              ) : (
                <div className="viewer-placeholder" style={{ flexGrow: 1 }}>
                  <BookOpen size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
                  <h4 style={{ fontWeight: 600 }}>Select a Textbook</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Choose a textbook from the list on the left to explore its structure, read contents, or search with AI.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
