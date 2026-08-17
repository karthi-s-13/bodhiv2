import React, { useState } from 'react';
import { 
  BookOpen, 
  FlaskConical, 
  Cog, 
  Leaf, 
  Star, 
  Target, 
  Clock, 
  FolderLock, 
  Key, 
  Award, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Maximize2,
  Minimize2,
  List
} from 'lucide-react';
import { SEEDED_CURRICULUM_DATA, generateFallbackCurriculum } from '../../data/curriculumData';
import type { CurriculumTopicDetails } from '../../data/curriculumData';
import { MCQAssessmentModal } from './MCQAssessmentModal';

interface CurriculumMapProps {
  topicName: string;
  topicNumber?: string;
  chapterLabel?: string;
  chapterData?: any;
  docId?: number;
  token?: string;
  isEmbedded?: boolean;
}

// Splits a leading dotted numeral (e.g. "3.3.1 Definition" -> { number: "3.3.1", rest: "Definition" })
const splitLeadingNumber = (text: string): { number: string | null; rest: string } => {
  const match = text.match(/^(\d+(?:\.\d+)*)\s+(.*)$/);
  if (match) {
    return { number: match[1], rest: match[2] };
  }
  return { number: null, rest: text };
};

export const CurriculumMap: React.FC<CurriculumMapProps> = ({ topicName, topicNumber, chapterLabel, chapterData, docId, token, isEmbedded }) => {
  const [showMCQ, setShowMCQ] = useState(false);
  // Try to find seeded curriculum details by topic name match (case-insensitive)
  const normalizedQuery = topicName.toLowerCase().trim();
  let details: CurriculumTopicDetails | null = null;

  // Direct matching or keyword matching
  const matchingKey = Object.keys(SEEDED_CURRICULUM_DATA).find(key =>
    normalizedQuery.includes(key) || key.includes(normalizedQuery)
  );

  if (matchingKey) {
    details = SEEDED_CURRICULUM_DATA[matchingKey];
  } else {
    // Generate beautiful dynamic fallback map for user uploaded outlines
    details = generateFallbackCurriculum(topicName, topicNumber);
  }

  // Override the tree graph dynamically using the actual textbook chapter structure if available
  if (chapterData && chapterData.children && chapterData.children.length > 0) {
    // Deep clone to avoid mutating the original seeded data or fallback data
    details = JSON.parse(JSON.stringify(details));
    
    // Set the root to the Chapter Name
    details!.tree.rootTitle = chapterLabel || chapterData.name;
    
    // Map actual sub-topics as branches
    details!.tree.children = chapterData.children.map((child: any) => ({
      title: child.name,
      icon: 'bookopen',
      concepts: []
    }));
  }

  if (!details) return null;

  const titleParts = splitLeadingNumber(details.title);
  const displayNumber = topicNumber || titleParts.number;
  const displayTitle = titleParts.number ? titleParts.rest : details.title;

  const rootParts = splitLeadingNumber(details.tree.rootTitle);
  const rootDisplayNumber = topicNumber || rootParts.number;
  const rootDisplayTitle = rootParts.number ? rootParts.rest : details.tree.rootTitle;

  // Get corresponding Lucide Icon for tree child cards
  const renderTreeIcon = (iconName: string) => {
    const name = iconName.toLowerCase();
    const style = { color: 'var(--color-primary)' };
    if (name === 'bookopen') return <BookOpen size={18} style={style} />;
    if (name === 'flask') return <FlaskConical size={18} style={{ color: '#8B5CF6' }} />;
    if (name === 'cog') return <Cog size={18} style={{ color: '#F59E0B' }} />;
    if (name === 'leaf') return <Leaf size={18} style={{ color: '#10B981' }} />;
    if (name === 'star') return <Star size={18} style={{ color: '#EC4899' }} />;
    if (name === 'target') return <Target size={18} style={{ color: '#EF4444' }} />;
    return <BookOpen size={18} style={style} />;
  };

  return (
    <div className="curriculum-map-container">
      
      {/* Selected Topic Details Header Card */}
      <div className="topic-details-card" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', padding: '24px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', marginBottom: '24px', boxShadow: 'var(--shadow-premium)' }}>
        
        {/* Left Column: Info and Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Row: Icon + Title/Tag + Description */}
          <div className="topic-header-row" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="topic-details-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Leaf size={24} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {displayNumber && (
                  <span className="topic-number-chip" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{displayNumber}</span>
                )}
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {displayTitle}
                </h4>
                <span className="subject-badge" style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                  {details.tag}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {details.description}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%' }}></div>

          {/* Metrics Row: 4 boxed metric cards */}
          <div className="topic-metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="metric-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="metric-mini-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Estimated Time</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{details.estimatedTime}</div>
              </div>
            </div>

            <div className="metric-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="metric-mini-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderLock size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Prerequisites</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{details.prerequisites}</div>
              </div>
            </div>

            <div className="metric-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="metric-mini-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Key Concepts</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{details.keyConceptsCount}</div>
              </div>
            </div>

            <div className="metric-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="metric-mini-icon" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Difficulty</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{details.difficulty}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Teaching Resources */}
        <div className="resources-list-box" style={{ paddingLeft: '24px', borderLeft: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Teaching Resources
          </span>
          
          <div className="resource-link-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-active)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <span>PPT Presentation</span>
            <span className="resource-preview-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.75rem' }}>
              Preview <ExternalLink size={12} />
            </span>
          </div>

          <div className="resource-link-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-active)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <span>Teacher Notes</span>
            <span className="resource-preview-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.75rem' }}>
              Preview <ExternalLink size={12} />
            </span>
          </div>

          {/* MCQ Assessment Button */}
          {docId && token && (
            <button
              onClick={() => setShowMCQ(true)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.08))',
                borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid rgba(79,70,229,0.2)',
                color: 'var(--color-primary)',
                width: '100%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(79,70,229,0.14),rgba(124,58,237,0.14))'; e.currentTarget.style.borderColor = 'rgba(79,70,229,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(79,70,229,0.08),rgba(124,58,237,0.08))'; e.currentTarget.style.borderColor = 'rgba(79,70,229,0.2)'; }}
            >
              <span>⚡ MCQ Assessment</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.8 }}>
                Generate <ExternalLink size={12} />
              </span>
            </button>
          )}

          {details.resources.diagrams > 0 && (
            <div className="resource-link-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-active)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span>Diagrams ({details.resources.diagrams})</span>
              <span className="resource-preview-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                Preview <ExternalLink size={12} />
              </span>
            </div>
          )}

          {details.resources.activities > 0 && (
            <div className="resource-link-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-active)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <span>Activities ({details.resources.activities})</span>
              <span className="resource-preview-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                Preview <ExternalLink size={12} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mind-Map Subtopic Tree Graph */}
      <div className="curriculum-tree-graph" style={{ position: 'relative', padding: '40px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflowX: 'auto', minHeight: '400px' }}>
        
        {/* Top Toolbar overlay inside graph */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Maximize2 size={12} /> Expand All
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Minimize2 size={12} /> Collapse All
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'white', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <List size={12} /> Legend
          </button>
        </div>

        {/* Chapter Context Pill */}
        {chapterLabel && (
          <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
            <span className="chapter-label-pill" style={{ background: '#F3E8FF', color: '#7E22CE', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{chapterLabel}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' }}>
          {/* Parent Node */}
          <div className="tree-root-wrapper" style={{ position: 'relative', marginBottom: '40px' }}>
            <div className="tree-root-node" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 24px', border: '2px solid var(--color-primary)', borderRadius: '30px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)', zIndex: 2, position: 'relative' }}>
              <Leaf size={20} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {rootDisplayNumber && <span style={{ marginRight: '6px' }}>{rootDisplayNumber}</span>}
                {rootDisplayTitle}
              </span>
            </div>
            {/* Main trunk line going down */}
            <div style={{ position: 'absolute', left: '50%', top: '100%', width: '2px', height: '40px', background: 'var(--color-primary)', transform: 'translateX(-50%)' }}></div>
          </div>

          {/* Children Container */}
          <div className="tree-children-container" style={{ display: 'grid', gridTemplateColumns: `repeat(${details.tree.children.length}, 1fr)`, gap: '24px', width: '100%', position: 'relative' }}>
            {/* Horizontal connector line across top of children */}
            <div style={{ position: 'absolute', top: '-40px', left: `calc(50% / ${details.tree.children.length})`, right: `calc(50% / ${details.tree.children.length})`, height: '2px', background: 'var(--color-primary)' }}></div>

            {details.tree.children.map((child, idx) => (
              <div key={idx} className="tree-child-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                
                {/* Vertical line connecting from horizontal trunk down to this child */}
                <div style={{ position: 'absolute', top: '-40px', left: '50%', width: '2px', height: '40px', background: 'var(--color-primary)', transform: 'translateX(-50%)' }}></div>

                {/* Card Header (Icon on Left) */}
                <div className="child-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', border: '1px solid var(--border-glass-active)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '100%', zIndex: 2, position: 'relative' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {renderTreeIcon(child.icon)}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{child.title}</span>
                </div>

                {/* Sub-concepts */}
                <div className="child-concepts-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', position: 'relative', width: '100%', padding: '0 16px' }}>
                  {/* Line down to concepts */}
                  {child.concepts.length > 0 && (
                    <div style={{ position: 'absolute', top: '-24px', bottom: '20px', left: '32px', width: '1px', borderLeft: '2px dashed var(--border-glass-active)', zIndex: 1 }}></div>
                  )}
                  {child.concepts.map((concept, cIdx) => (
                    <div key={cIdx} className="concept-bubble" style={{ position: 'relative', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, zIndex: 2, marginLeft: '32px' }}>
                      {/* Branch pointing to concept bubble */}
                      <div style={{ position: 'absolute', left: '-18px', top: '50%', width: '16px', height: '1px', borderTop: '2px dashed var(--border-glass-active)', transform: 'translateY(-50%)' }}></div>
                      {concept}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Objectives, Misconceptions & Connections Grid */}
      <div className="bottom-info-grid">
        
        {/* Objectives */}
        <div className="info-bullet-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Learning Objectives</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {details.objectives.map((obj, i) => (
              <div key={i} className="bullet-item">
                <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Misconceptions */}
        <div className="info-bullet-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Common Misconceptions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {details.misconceptions.map((mis, i) => (
              <div key={i} className="bullet-item">
                <span style={{ color: '#EF4444', fontWeight: 900 }}>•</span>
                <span>{mis}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-life Connections */}
        <div className="info-bullet-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
            <Lightbulb size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Real-life Connections</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {details.connections.map((con, i) => (
              <div key={i} className="bullet-item">
                <span style={{ color: '#F59E0B', fontWeight: 900 }}>★</span>
                <span>{con}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MCQ Assessment Modal */}
      {showMCQ && docId && token && (
        <MCQAssessmentModal
          docId={docId}
          token={token}
          isEmbedded={!!isEmbedded}
          topicName={topicName}
          chapterName={chapterLabel || details.tree.rootTitle}
          subtopics={chapterData?.children?.map((c: any) => c.name) || details.tree.children.map((c: any) => c.title)}
          onClose={() => setShowMCQ(false)}
        />
      )}
    </div>
  );
};
