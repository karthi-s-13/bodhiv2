import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Presentation, 
  FileSpreadsheet, 
  Users, 
  Calendar, 
  Clock, 
  UploadCloud, 
  Brain
} from 'lucide-react';
import type { PDFDocumentSummary } from '../../types';
import { DEMO_TEXTBOOKS } from '../../data/demoTextbooks';

interface DashboardHomeProps {
  documents: PDFDocumentSummary[];
  onNavigateToTextbooks: (tab?: 'text' | 'textbook' | 'search') => void;
  onTriggerUpload: () => void;
  onLoadViewerDoc: (id: number) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  documents,
  onNavigateToTextbooks,
  onTriggerUpload,
  onLoadViewerDoc
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderStatCard = (icon: React.ReactNode, title: string, count: number, colorClass: string) => {
    let bgIcon = '';
    let textIconColor = '';
    if (colorClass === 'purple') { bgIcon = 'rgba(142, 68, 173, 0.1)'; textIconColor = 'var(--color-primary)'; }
    else if (colorClass === 'green') { bgIcon = 'rgba(16, 185, 129, 0.1)'; textIconColor = 'var(--color-success)'; }
    else if (colorClass === 'orange') { bgIcon = 'rgba(249, 115, 22, 0.1)'; textIconColor = '#F97316'; }
    else if (colorClass === 'blue') { bgIcon = 'rgba(6, 182, 212, 0.1)'; textIconColor = 'var(--color-secondary)'; }
    else { bgIcon = 'rgba(236, 72, 153, 0.1)'; textIconColor = '#EC4899'; }

    return (
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        minWidth: '180px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: bgIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textIconColor
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, marginTop: '2px', lineHeight: 1.1 }}>{count}</h3>
          </div>
        </div>
      </div>
    );
  };

  const renderBookCover = () => (
    <div style={{
      width: '120px',
      height: '160px',
      borderRadius: 'var(--radius-sm)',
      background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      padding: '16px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', width: 'fit-content' }}>SCIENCE</div>
      <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>BIOLOGY<br/>CLASS 8</div>
      <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>BODHI Co-Teacher</div>
    </div>
  );

  const renderTodayPlanCard = () => {
    // Fall back to first demo textbook if no database textbooks are uploaded
    const docWithOutline = documents.find(d => d.textbook_data && d.textbook_data.items && d.textbook_data.items.length > 0)
                           || DEMO_TEXTBOOKS[0];
    const firstChapter = docWithOutline?.textbook_data.items[0];
    const chapterName = firstChapter ? firstChapter.name : "Chapter 2: Plant Nutrition";
    const topicName = firstChapter?.children?.[0]?.name || "Photosynthesis";
    const subtitle = docWithOutline 
      ? `Explore the core concepts and topics for chapter "${chapterName}".` 
      : "Students will learn about the process of photosynthesis, its importance and the factors affecting it.";

    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Plan</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>May 16, 2025 • Friday</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {renderBookCover()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>{chapterName}</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{topicName}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {subtitle}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} />
                40 min
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Users size={14} />
                5 Activities
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <BookOpen size={14} />
                5 MCQs
              </span>

              <button 
                onClick={() => {
                  if (docWithOutline) {
                    onLoadViewerDoc(docWithOutline.id);
                  } else if (documents.length > 0) {
                    onLoadViewerDoc(documents[0].id);
                  }
                  onNavigateToTextbooks('textbook');
                }}
                className="btn-primary" 
                style={{ width: 'auto', padding: '10px 24px', margin: 0, marginLeft: 'auto', fontSize: '0.85rem' }}
              >
                <span>Start Lesson</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickActionsGrid = () => {
    const actions = [
      {
        title: "Upload Textbook",
        desc: "Upload a new textbook (PDF)",
        bg: '#F3E8FF',
        border: 'rgba(168, 85, 247, 0.3)',
        color: '#8B5CF6',
        icon: <UploadCloud size={24} />,
        onClick: onTriggerUpload
      },
      {
        title: "Create Lesson",
        desc: "Build textbook chapter guides",
        bg: '#DCFCE7',
        border: 'rgba(34, 197, 94, 0.3)',
        color: '#22C55E',
        icon: <BookOpen size={24} />,
        onClick: () => onNavigateToTextbooks('textbook')
      },
      {
        title: "Semantic Search",
        desc: "Query textbook vectors with AI",
        bg: '#E0F2FE',
        border: 'rgba(14, 165, 233, 0.3)',
        color: '#0EA5E9',
        icon: <Brain size={24} />,
        onClick: () => {
          if (documents.length > 0) {
            onLoadViewerDoc(documents[0].id);
          }
          onNavigateToTextbooks('search');
        }
      }
    ];

    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {actions.map(action => (
            <div 
              key={action.title}
              onClick={action.onClick}
              style={{
                flex: '1 1 150px',
                padding: '20px 16px',
                background: action.bg,
                border: `1px solid ${action.border}`,
                borderRadius: 'var(--radius-md)',
                color: '#1E293B',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              className="quick-action-card"
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: action.color
              }}>
                {action.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{action.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentResourcesList = () => {
    // Display database documents if available, otherwise fall back to demo textbooks
    const displayedDocs = documents.length > 0 ? documents.slice(0, 3) : DEMO_TEXTBOOKS.slice(0, 3);
    
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Resources</h3>
          <button 
            onClick={() => onNavigateToTextbooks('textbook')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            View all resources &rarr;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedDocs.map(doc => {
            const cleanName = doc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            return (
              <div 
                key={doc.id}
                onClick={() => {
                  onLoadViewerDoc(doc.id);
                  onNavigateToTextbooks('textbook');
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
                className="resource-row-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cleanName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUpcomingLessonsList = () => (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Lessons</h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>View Calendar</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { date: "May 17", day: "Sat", title: "Respiration in Plants", desc: "Chapter 2: Plant Nutrition", time: "40 min" },
          { date: "May 20", day: "Tue", title: "Transport in Plants", desc: "Chapter 2: Plant Nutrition", time: "40 min" },
          { date: "May 22", day: "Thu", title: "Mineral Nutrition", desc: "Chapter 2: Plant Nutrition", time: "40 min" }
        ].map((les, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '10px',
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid rgba(79, 70, 229, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1.1
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{les.date}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 800 }}>{les.day}</span>
            </div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{les.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{les.desc}</div>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(0,0,0,0.03)',
              padding: '4px 8px',
              borderRadius: '12px',
              color: 'var(--text-secondary)'
            }}>{les.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClassOverviewChart = () => (
    <div className="glass-panel class-overview-card">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Class Overview</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
        <div className="donut-chart-wrapper">
          <svg width="100" height="100" viewBox="0 0 42 42" className="donut-chart">
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="4.2"></circle>
            
            {/* Needs Support: 23% (Red) */}
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#EF4444" strokeWidth="4.2" 
                    strokeDasharray="23 77" strokeDashoffset="100" className="donut-segment"></circle>
            
            {/* Average: 37% (Amber) */}
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="4.2" 
                    strokeDasharray="37 63" strokeDashoffset="77" className="donut-segment"></circle>
            
            {/* Strong: 40% (Indigo) */}
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4F46E5" strokeWidth="4.2" 
                    strokeDasharray="40 60" strokeDashoffset="40" className="donut-segment"></circle>
          </svg>
          <div className="donut-center-text">
            <div className="donut-center-num">32</div>
            <div className="donut-center-label">Students</div>
          </div>
        </div>

        <div className="legend-list" style={{ flexGrow: 1 }}>
          <div className="legend-item">
            <div className="legend-label-group">
              <span className="legend-dot" style={{ background: '#4F46E5' }} />
              <span>Strong</span>
            </div>
            <span style={{ fontWeight: 600 }}>40% (13)</span>
          </div>
          <div className="legend-item">
            <div className="legend-label-group">
              <span className="legend-dot" style={{ background: '#F59E0B' }} />
              <span>Average</span>
            </div>
            <span style={{ fontWeight: 600 }}>37% (12)</span>
          </div>
          <div className="legend-item">
            <div className="legend-label-group">
              <span className="legend-dot" style={{ background: '#EF4444' }} />
              <span>Needs Support</span>
            </div>
            <span style={{ fontWeight: 600 }}>23% (7)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentAssessmentsList = () => (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Assessments</h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>View all</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { num: "1", title: "Photosynthesis - Quiz", subtitle: "May 15, 2025 • 32 Students", score: "Avg 78%" },
          { num: "2", title: "Plant Nutrition - MCQs", subtitle: "May 10, 2025 • 32 Students", score: "Avg 72%" }
        ].map((as, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: i === 0 ? '12px' : 0,
            borderBottom: i === 0 ? '1px solid var(--border-glass)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>{as.num}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{as.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{as.subtitle}</div>
              </div>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-success)',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>{as.score}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Count chapters/topics for stats (ONLY from user-uploaded database documents)
  let dbLessons = 0;
  if (documents && documents.length > 0) {
    documents.forEach(d => {
      if (d.textbook_data && d.textbook_data.items) {
        d.textbook_data.items.forEach((chap: any) => {
          dbLessons += 1;
          if (chap.children) dbLessons += chap.children.length;
        });
      }
    });
  }

  // Initially, PPTs and Assessments start at 0 until created by the teacher
  const pptsCount = 0;
  const assessmentsCount = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      <div className="stats-grid">
        {renderStatCard(<BookOpen size={22} />, "Textbooks Created", documents.length, "purple")}
        {renderStatCard(<FileText size={22} />, "Lessons Created", dbLessons, "green")}
        {renderStatCard(<Presentation size={22} />, "PPTs Generated", pptsCount, "orange")}
        {renderStatCard(<FileSpreadsheet size={22} />, "Assessments", assessmentsCount, "blue")}
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {renderTodayPlanCard()}
          {renderQuickActionsGrid()}
          {renderRecentResourcesList()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {renderUpcomingLessonsList()}
          {renderClassOverviewChart()}
          {renderRecentAssessmentsList()}
        </div>
      </div>
    </div>
  );
};
