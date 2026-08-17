import React from 'react';
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
  Lightbulb
} from 'lucide-react';
import { SEEDED_CURRICULUM_DATA, generateFallbackCurriculum } from '../../data/curriculumData';
import type { CurriculumTopicDetails } from '../../data/curriculumData';

interface CurriculumMapProps {
  topicName: string;
}

export const CurriculumMap: React.FC<CurriculumMapProps> = ({ topicName }) => {
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
    details = generateFallbackCurriculum(topicName);
  }

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
      <div className="topic-details-card">
        {/* Left Side: Topic Icon */}
        <div className="topic-details-icon">
          <Leaf size={32} />
        </div>

        {/* Center Text Details */}
        <div style={{ paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {details.title}
            </h4>
            <span className="subject-badge" style={{
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px'
            }}>
              {details.tag}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '550px' }}>
            {details.description}
          </p>
        </div>

        {/* Dynamic Metrics */}
        <div className="topic-details-metrics">
          <div className="metric-item-mini">
            <div className="metric-mini-icon">
              <Clock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated Time</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{details.estimatedTime}</div>
            </div>
          </div>

          <div className="metric-item-mini">
            <div className="metric-mini-icon" style={{ background: 'rgba(139, 92, 246, 0.05)', color: '#8B5CF6' }}>
              <FolderLock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prerequisites</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{details.prerequisites}</div>
            </div>
          </div>

          <div className="metric-item-mini">
            <div className="metric-mini-icon" style={{ background: 'rgba(249, 115, 22, 0.05)', color: '#F97316' }}>
              <Key size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Key Concepts</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{details.keyConceptsCount}</div>
            </div>
          </div>

          <div className="metric-item-mini">
            <div className="metric-mini-icon" style={{ background: 'rgba(6, 182, 212, 0.05)', color: '#06B6D4' }}>
              <Award size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Difficulty</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{details.difficulty}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Teaching Resources */}
        <div className="resources-list-box">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Teaching Resources
          </span>
          
          <div className="resource-link-item">
            <span>PPT Presentation</span>
            <span className="resource-preview-btn">
              Preview <ExternalLink size={12} />
            </span>
          </div>

          <div className="resource-link-item">
            <span>Teacher Notes</span>
            <span className="resource-preview-btn">
              Preview <ExternalLink size={12} />
            </span>
          </div>

          {details.resources.diagrams > 0 && (
            <div className="resource-link-item">
              <span>Diagrams ({details.resources.diagrams})</span>
              <span className="resource-preview-btn">
                Preview <ExternalLink size={12} />
              </span>
            </div>
          )}

          {details.resources.activities > 0 && (
            <div className="resource-link-item">
              <span>Activities ({details.resources.activities})</span>
              <span className="resource-preview-btn">
                Preview <ExternalLink size={12} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mind-Map Subtopic Tree Graph */}
      <div className="curriculum-tree-graph">
        
        {/* Parent Node */}
        <div className="tree-root-wrapper">
          <div className="tree-root-node">
            <Leaf size={18} style={{ color: 'var(--color-primary)' }} />
            <span>{details.tree.rootTitle}</span>
          </div>
        </div>

        {/* Children Cards Container */}
        <div className="tree-children-container" style={{ gridTemplateColumns: `repeat(${details.tree.children.length}, 1fr)` }}>
          {details.tree.children.map((child, idx) => (
            <div key={idx} className="tree-child-card">
              
              {/* Card Title & Icon */}
              <div className="child-card-header">
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-glass)'
                }}>
                  {renderTreeIcon(child.icon)}
                </div>
                <span>{child.title}</span>
              </div>

              {/* Concepts bubbles under card */}
              <div className="child-concepts-list">
                {child.concepts.map((concept, cIdx) => (
                  <div key={cIdx} className="concept-bubble">
                    {concept}
                  </div>
                ))}
              </div>

            </div>
          ))}
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

    </div>
  );
};
