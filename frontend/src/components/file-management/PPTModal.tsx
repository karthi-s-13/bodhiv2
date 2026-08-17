import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  EyeOff,
  RefreshCw,
  Presentation,
  Clock,
  Layers,
  Sparkles,
  Image,
  MessageSquare,
  Download,
  CheckCircle2,
  Save,
  Cloud
} from 'lucide-react';
import pptxgen from 'pptxgenjs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PresentationSlide {
  slide_number: number;
  title: string;
  concept: string[];
  how_it_works: string[];
  example: string[];
  ai_co_teacher: string[];
  evidence_ids: (string | number)[];
}

interface PresentationData {
  title: string;
  grade: string;
  subject: string;
  topic: string;
  language: string;
  duration_minutes: number;
  learning_objectives: string[];
  slides: PresentationSlide[];
}

interface PPTGenerateResult {
  presentation: PresentationData;
  topic_name: string;
  chapter_name: string;
  used_textbook_context: boolean;
}

export interface PPTModalProps {
  docId: number;
  token: string;
  isEmbedded: boolean;
  topicName: string;
  chapterName: string;
  subtopics: string[];
  subject?: string;
  initialPresentation?: any;
  onClose: () => void;
}

// ─── Slide Thumbnail ──────────────────────────────────────────────────────────

const SlideThumbnail: React.FC<{
  slide: PresentationSlide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ slide, index, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
        background: isActive ? 'rgba(79,70,229,0.1)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(79,70,229,0.4)' : 'transparent'}`,
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: '52px', height: '34px', borderRadius: '5px',
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.65rem', fontWeight: 900, color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        boxShadow: isActive ? '0 0 0 2px #4F46E5' : '0 1px 4px rgba(0,0,0,0.15)',
      }}>
        {index + 1}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: isActive ? '#4F46E5' : 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px',
        }}>
          {slide.title || `Slide ${index + 1}`}
        </div>
      </div>
    </div>
  );
};

// ─── Slide Canvas ─────────────────────────────────────────────────────────────

const SlideCanvas: React.FC<{
  slide: PresentationSlide;
  totalSlides: number;
}> = ({ slide, totalSlides }) => {
  const renderList = (items: string[]) => {
    if (!items || items.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No details provided.</p>;
    return (
      <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
        {items.map((pt, i) => <li key={i} style={{ marginBottom: '6px' }}>{pt}</li>)}
      </ul>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header band */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 32px',
        border: '1px solid var(--border-glass)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Slide {slide.slide_number} of {totalSlides}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1A1A1A', margin: 0, lineHeight: 1.2 }}>
          {slide.title}
        </h2>
      </div>

      {/* 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Concept */}
        <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#EEF2FF', color: '#4F46E5', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>①</span>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Concept</h3>
          </div>
          {renderList(slide.concept)}
        </div>

        {/* How It Works */}
        <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#F0F9FF', color: '#0369A1', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>②</span>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>How it Works</h3>
          </div>
          {renderList(slide.how_it_works)}
        </div>

        {/* Example */}
        <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#FFFBEB', color: '#B45309', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>③</span>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Example</h3>
          </div>
          {renderList(slide.example)}
        </div>

        {/* AI Co-Teacher */}
        <div style={{ background: '#FDF2F8', borderRadius: '12px', padding: '20px', border: '1px solid #FBCFE8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#FCE7F3', color: '#BE185D', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>④</span>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#BE185D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Co-Teacher</h3>
          </div>
          {renderList(slide.ai_co_teacher)}
        </div>
      </div>
    </div>
  );
};


// ─── Config Phase ─────────────────────────────────────────────────────────────

const ConfigPhase: React.FC<{
  topicName: string;
  selectedTopic: string;
  setSelectedTopic: (t: string) => void;
  subtopics: string[];
  chapterName: string;
  isEmbedded: boolean;
  duration: number;
  setDuration: (d: number) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
}> = ({ topicName, selectedTopic, setSelectedTopic, subtopics, chapterName, isEmbedded, duration, setDuration, onGenerate, loading, error }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '32px', padding: '48px',
    maxWidth: '560px', margin: '0 auto',
  }}>
    {/* Heading */}
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
      }}>
        <Presentation size={32} style={{ color: 'white' }} />
      </div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Generate Lesson Presentation
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
        BODHI Teacher Copilot will craft a classroom-ready presentation grounded in your textbook.
      </p>
    </div>

    {/* Topic info card */}
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.06))',
      border: '1px solid rgba(79,70,229,0.2)', borderRadius: '14px', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BookOpen size={18} style={{ color: '#4F46E5', flexShrink: 0 }} />
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topic</div>
          {subtopics && subtopics.length > 0 ? (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', marginTop: '4px',
                borderRadius: '8px', border: '1px solid var(--border-glass)',
                fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
                background: 'white', cursor: 'pointer', outline: 'none'
              }}
            >
              {!subtopics.includes(topicName) && (
                <option value={topicName}>{topicName}</option>
              )}
              {subtopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedTopic}</div>
          )}
        </div>
      </div>
      <div style={{ height: '1px', background: 'rgba(79,70,229,0.12)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Layers size={16} style={{ color: '#4F46E5', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chapter</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{chapterName}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        {isEmbedded ? (
          <>
            <CheckCircle2 size={14} style={{ color: '#10B981' }} />
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Textbook indexed — grounded evidence will be used</span>
          </>
        ) : (
          <>
            <AlertCircle size={14} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>Textbook not indexed — using raw text fallback</span>
          </>
        )}
      </div>
    </div>

    {/* Duration selector */}
    <div style={{ width: '100%' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
        <Clock size={16} style={{ color: '#4F46E5' }} />
        Lesson Duration
      </label>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[30, 45, 60].map(d => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              border: `2px solid ${duration === d ? '#4F46E5' : 'var(--border-glass)'}`,
              background: duration === d ? 'rgba(79,70,229,0.08)' : 'white',
              color: duration === d ? '#4F46E5' : 'var(--text-secondary)',
              fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {d} min
          </button>
        ))}
      </div>
    </div>

    {/* Error */}
    {error && (
      <div style={{
        width: '100%', display: 'flex', gap: '10px', alignItems: 'flex-start',
        padding: '14px 16px', background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
      }}>
        <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: '1px' }} />
        <span style={{ fontSize: '0.85rem', color: '#B91C1C', lineHeight: 1.5 }}>{error}</span>
      </div>
    )}

    {/* Generate button */}
    <button
      onClick={onGenerate}
      disabled={loading}
      style={{
        width: '100%', padding: '16px',
        background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontSize: '1rem', fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.35)',
        transition: 'all 0.2s',
      }}
    >
      {loading ? (
        <><Loader2 size={20} className="animate-spin" /> Generating Presentation…</>
      ) : (
        <><Sparkles size={20} /> Generate Presentation</>
      )}
    </button>

    {!loading && (
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '-16px 0 0' }}>
        Generation typically takes 15–45 seconds. BODHI follows strict pedagogy guidelines.
      </p>
    )}
  </div>
);

// ─── PPT Modal ────────────────────────────────────────────────────────────────

export const PPTModal: React.FC<PPTModalProps> = ({
  docId, token, isEmbedded, topicName, chapterName, subtopics, subject = 'General', initialPresentation, onClose,
}) => {
  const [phase, setPhase] = useState<'config' | 'viewer'>(initialPresentation ? 'viewer' : 'config');
  const [selectedTopic, setSelectedTopic] = useState(topicName || initialPresentation?.topic_name);
  const [duration, setDuration] = useState<number>(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert the raw initial presentation data from the DB into the format expected by the viewer
  const [result, setResult] = useState<PPTGenerateResult | null>(initialPresentation ? {
    presentation: initialPresentation.slides_data,
    topic_name: initialPresentation.topic_name,
    chapter_name: initialPresentation.chapter_name,
    used_textbook_context: true
  } : null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const slides = result?.presentation?.slides || [];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase !== 'viewer') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setCurrentSlide(prev => Math.max(prev - 1, 0));
    if (e.key === 'Escape') onClose();
  }, [phase, slides.length, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${docId}/generate-ppt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_name: selectedTopic,
          chapter_name: chapterName,
          subject,
          board: 'Tamil Nadu State Board',
          duration_minutes: duration,
          language: 'English',
          subtopics,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Request failed with status ${response.status}`);
      }
      const data: PPTGenerateResult = await response.json();
      setResult(data);
      setCurrentSlide(0);
      setPhase('viewer');
    } catch (err: any) {
      setError(err.message || 'Failed to generate presentation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.presentation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTopic.replace(/\s+/g, '_')}_presentation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPPTX = () => {
    if (!result || !result.presentation) return;
    const pptx = new pptxgen();
    pptx.author = 'BODHI Teacher Copilot';
    pptx.company = 'BODHI';
    pptx.title = result.presentation.title;

    result.presentation.slides.forEach((slide) => {
      const slidePpt = pptx.addSlide();
      // Background and Title
      slidePpt.background = { color: 'FFFFFF' };
      slidePpt.addText(slide.title || 'Slide', {
        x: 0.5, y: 0.3, w: '90%', h: 0.8, fontSize: 28, bold: true, color: '1A1A1A'
      });
      
      const formatPoints = (arr: string[] | undefined) => {
        if (!arr || arr.length === 0) return [{ text: 'None', options: { color: '888888', fontSize: 14 } }];
        return arr.map(pt => ({ text: pt, options: { bullet: true, color: '333333', fontSize: 14 } }));
      };

      // 1. CONCEPT (Top Left)
      slidePpt.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.2, w: '44%', h: '38%', fill: { color: 'F8F9FA' }, line: { color: 'E5E7EB', width: 1 } });
      slidePpt.addText('① CONCEPT', { x: 0.5, y: 1.3, w: '42%', h: 0.3, fontSize: 12, bold: true, color: '4F46E5' });
      slidePpt.addText(formatPoints(slide.concept), { x: 0.5, y: 1.7, w: '42%', h: '28%', valign: 'top' });

      // 2. HOW IT WORKS (Top Right)
      slidePpt.addShape(pptx.ShapeType.rect, { x: '50%', y: 1.2, w: '44%', h: '38%', fill: { color: 'F8F9FA' }, line: { color: 'E5E7EB', width: 1 } });
      slidePpt.addText('② HOW IT WORKS', { x: '51%', y: 1.3, w: '42%', h: 0.3, fontSize: 12, bold: true, color: '0369A1' });
      slidePpt.addText(formatPoints(slide.how_it_works), { x: '51%', y: 1.7, w: '42%', h: '28%', valign: 'top' });

      // 3. EXAMPLE (Bottom Left)
      slidePpt.addShape(pptx.ShapeType.rect, { x: 0.4, y: '54%', w: '44%', h: '38%', fill: { color: 'F8F9FA' }, line: { color: 'E5E7EB', width: 1 } });
      slidePpt.addText('③ EXAMPLE', { x: 0.5, y: '55%', w: '42%', h: 0.3, fontSize: 12, bold: true, color: 'B45309' });
      slidePpt.addText(formatPoints(slide.example), { x: 0.5, y: '59%', w: '42%', h: '28%', valign: 'top' });

      // 4. AI CO-TEACHER (Bottom Right)
      slidePpt.addShape(pptx.ShapeType.rect, { x: '50%', y: '54%', w: '44%', h: '38%', fill: { color: 'F8F9FA' }, line: { color: 'E5E7EB', width: 1 } });
      slidePpt.addText('④ AI CO-TEACHER', { x: '51%', y: '55%', w: '42%', h: 0.3, fontSize: 12, bold: true, color: 'BE185D' });
      slidePpt.addText(formatPoints(slide.ai_co_teacher), { x: '51%', y: '59%', w: '42%', h: '28%', valign: 'top' });
    });

    pptx.writeFile({ fileName: `${selectedTopic.replace(/\s+/g, '_')}.pptx` });
  };

  const handleSavePPT = async () => {
    if (!result || !result.presentation) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/documents/${docId}/presentations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.presentation.title || `${selectedTopic} Presentation`,
          topic_name: selectedTopic,
          chapter_name: chapterName,
          slides_data: result.presentation
        }),
      });
      if (!response.ok) throw new Error('Failed to save presentation');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save presentation to Bodhi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: '20px', width: '100%',
        maxWidth: phase === 'viewer' ? '1100px' : '620px',
        height: phase === 'viewer' ? '90vh' : 'auto',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)', transition: 'max-width 0.35s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border-glass)', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.03))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Presentation size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>BODHI Teacher Copilot</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {phase === 'config' ? 'Lesson Presentation Generator' : `${slides.length} Slides • ${selectedTopic}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {phase === 'viewer' && (
              <>
                <button onClick={() => { setPhase('config'); setResult(null); setError(null); }} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                  background: 'white', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  <RefreshCw size={14} /> Regenerate
                </button>
                <button onClick={handleDownloadPPTX} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                  background: 'white', border: '1px solid var(--border-glass)',
                  color: '#4F46E5', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  <Download size={14} /> Download PPTX
                </button>
                <button onClick={handleDownloadJSON} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                  background: 'white', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  <Download size={14} /> JSON
                </button>
                {!initialPresentation && (
                  <button onClick={handleSavePPT} disabled={isSaving || saveSuccess} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                    background: saveSuccess ? '#10B981' : (isSaving ? 'rgba(79,70,229,0.5)' : '#4F46E5'), 
                    border: 'none',
                    color: 'white', fontSize: '0.78rem', fontWeight: 700, 
                    cursor: (isSaving || saveSuccess) ? 'default' : 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    {saveSuccess ? <CheckCircle2 size={14} /> : (isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />)}
                    {saveSuccess ? 'Saved' : (isSaving ? 'Saving...' : 'Save to Bodhi')}
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} style={{
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              color: '#EF4444', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          {phase === 'config' ? (
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              <ConfigPhase
                topicName={topicName} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}
                subtopics={subtopics} chapterName={chapterName} isEmbedded={isEmbedded}
                duration={duration} setDuration={setDuration}
                onGenerate={handleGenerate} loading={loading} error={error}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', width: '100%', minHeight: 0 }}>
              {/* Slide navigator */}
              <div style={{
                width: '220px', flexShrink: 0, borderRight: '1px solid var(--border-glass)',
                display: 'flex', flexDirection: 'column',
                padding: '16px 12px', gap: '4px', overflowY: 'auto',
                background: 'rgba(248,248,252,0.8)',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 4px', marginBottom: '8px' }}>
                  Slides ({slides.length})
                </div>
                {slides.map((slide, idx) => (
                  <SlideThumbnail key={idx} slide={slide} index={idx} isActive={currentSlide === idx} onClick={() => setCurrentSlide(idx)} />
                ))}
              </div>

              {/* Canvas area */}
              <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Meta bar */}
                {result?.presentation && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '10px 24px', borderBottom: '1px solid var(--border-glass)',
                    flexShrink: 0, background: 'white',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <BookOpen size={13} /> {result.presentation.subject}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> {result.presentation.duration_minutes} min
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {result.presentation.grade}
                    </span>
                    {result.used_textbook_context && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Grounded with textbook
                      </span>
                    )}
                  </div>
                )}

                {/* Slide canvas */}
                <div style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '24px' }}>
                  {slides[currentSlide] && (
                    <SlideCanvas slide={slides[currentSlide]} totalSlides={slides.length} />
                  )}
                </div>

                {/* Navigation footer */}
                <div style={{
                  flexShrink: 0, borderTop: '1px solid var(--border-glass)',
                  padding: '14px 24px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', background: 'white',
                }}>
                  <button
                    onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                    disabled={currentSlide === 0}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: currentSlide === 0 ? 'rgba(0,0,0,0.04)' : 'white',
                      border: '1px solid var(--border-glass)',
                      color: currentSlide === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      fontSize: '0.85rem', fontWeight: 700,
                      cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {slides.map((_, idx) => (
                      <div key={idx} onClick={() => setCurrentSlide(idx)} style={{
                        width: currentSlide === idx ? '20px' : '8px',
                        height: '8px', borderRadius: '4px',
                        background: currentSlide === idx ? '#4F46E5' : 'var(--border-glass)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
                    disabled={currentSlide === slides.length - 1}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: currentSlide === slides.length - 1 ? 'rgba(0,0,0,0.04)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      border: 'none',
                      color: currentSlide === slides.length - 1 ? 'var(--text-muted)' : 'white',
                      fontSize: '0.85rem', fontWeight: 700,
                      cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
                      boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 2px 8px rgba(79,70,229,0.3)',
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
