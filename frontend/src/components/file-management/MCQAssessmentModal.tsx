import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  BookOpen,
  Brain,
  RefreshCw,
  Sparkles,
  Edit3,
  Trash2,
  Plus,
  Save,
  Check
} from 'lucide-react';

interface MCQQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface MCQResult {
  questions: MCQQuestion[];
  topic_name: string;
  chapter_name: string;
  num_questions: number;
  used_textbook_context: boolean;
}

interface MCQAssessmentModalProps {
  docId: number;
  token: string;
  isEmbedded: boolean;
  topicName: string;
  chapterName: string;
  subtopics: string[];
  onClose: () => void;
}

export const MCQAssessmentModal: React.FC<MCQAssessmentModalProps> = ({
  docId,
  token,
  isEmbedded,
  topicName,
  chapterName,
  subtopics,
  onClose
}) => {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MCQResult | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MCQQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRevealedAnswers({});
    setSelectedOptions({});
    setEditingIndex(null);
    setEditForm(null);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/documents/${docId}/generate-mcq`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_name: topicName, chapter_name: chapterName, subtopics, num_questions: numQuestions })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Failed to generate MCQ.' }));
        throw new Error(errData.detail || 'Failed to generate MCQ.');
      }
      setResult(await response.json());
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating MCQs.');
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (idx: number) => setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));

  const selectOption = (qIdx: number, letter: string) => {
    setSelectedOptions(prev => ({ ...prev, [qIdx]: letter }));
    setRevealedAnswers(prev => ({ ...prev, [qIdx]: true }));
  };

  const answeredCount = Object.keys(selectedOptions).length;
  const correctCount = result ? result.questions.filter((q, i) => selectedOptions[i] === q.answer).length : 0;

  const handleDeleteQuestion = (idx: number) => {
    if (result) {
      const newQs = [...result.questions];
      newQs.splice(idx, 1);
      setResult({ ...result, questions: newQs, num_questions: newQs.length });
      if (editingIndex === idx) {
        setEditingIndex(null);
        setEditForm(null);
      }
    }
  };

  const handleAddQuestion = () => {
    if (result) {
      const newQs = [...result.questions, { question: '', options: ['', '', '', ''], answer: 'A', explanation: '' }];
      setResult({ ...result, questions: newQs, num_questions: newQs.length });
      setEditingIndex(newQs.length - 1);
      setEditForm(newQs[newQs.length - 1]);
    }
  };

  const handleSaveAssessment = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${docId}/assessments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${topicName} - Assessment`,
          topic_name: topicName,
          chapter_name: chapterName,
          questions: result.questions
        })
      });
      if (!response.ok) throw new Error('Failed to save assessment');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save assessment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 2000 }} />
      <div className="modal-container" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '780px', maxWidth: '95vw', maxHeight: '90vh',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)', border: '1px solid var(--border-glass)',
        zIndex: 2001, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#C68A3D,#E3B36B)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={22} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>MCQ Assessment Generator</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>AI-powered questions from your textbook</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-content-scrollable" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Topic Banner */}
          <div style={{ background: 'linear-gradient(135deg,rgba(198,138,61,0.06),rgba(227,179,107,0.06))', border: '1px solid rgba(198,138,61,0.15)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <BookOpen size={18} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{chapterName}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{topicName}</div>
              {subtopics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {subtopics.slice(0, 6).map((s, i) => (
                    <span key={i} style={{ background: 'rgba(198,138,61,0.08)', border: '1px solid rgba(198,138,61,0.15)', color: 'var(--color-primary)', fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>{s}</span>
                  ))}
                  {subtopics.length > 6 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 0' }}>+{subtopics.length - 6} more</span>}
                </div>
              )}
            </div>
            {isEmbedded ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', flexShrink: 0 }}>
                <Brain size={12} /> Indexed
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#D97706', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', flexShrink: 0 }}>
                <AlertCircle size={12} /> Subtopics Only
              </span>
            )}
          </div>

          {/* Config */}
          {!result && !loading && (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                How many MCQ questions to generate?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {[3, 5, 10, 15, 20].map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: numQuestions === n ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)', background: numQuestions === n ? 'rgba(198,138,61,0.1)' : 'var(--bg-card)', color: numQuestions === n ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {n}
                  </button>
                ))}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or enter:</span>
                <input type="number" min={1} max={30} value={numQuestions} onChange={e => setNumQuestions(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  style={{ width: '72px', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', outline: 'none' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>Generation Failed</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#B91C1C' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,rgba(198,138,61,0.1),rgba(227,179,107,0.1))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Generating {numQuestions} MCQ Questions...</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {isEmbedded ? 'Searching textbook vectors and crafting questions...' : 'Analysing subtopics and crafting questions...'}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              {answeredCount > 0 && (
                <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <CheckCircle2 size={22} style={{ color: '#059669' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Score: {correctCount}/{answeredCount} answered correctly {answeredCount === result.questions.length && '🎉'}
                    </div>
                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(correctCount / Math.max(answeredCount, 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#10B981,#059669)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>{Math.round((correctCount / Math.max(answeredCount, 1)) * 100)}%</div>
                </div>
              )}

              {result.used_textbook_context && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.78rem', fontWeight: 600, color: '#059669' }}>
                  <Sparkles size={14} /> Generated using real textbook content from vector search
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {result.questions.map((q, idx) => {
                  if (editingIndex === idx && editForm) {
                    return (
                      <div key={idx} style={{ background: 'var(--bg-panel)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#C68A3D,#E3B36B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                          <h4 style={{ margin: 0, fontSize: '1rem' }}>Edit Question</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Question</label>
                          <textarea value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)', width: '100%', minHeight: '60px', resize: 'vertical' }} />
                          
                          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Options</label>
                          {editForm.options.map((opt, oIdx) => (
                            <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>{optionLetters[oIdx]}</span>
                              <input value={opt} onChange={e => {
                                const newOpts = [...editForm.options];
                                newOpts[oIdx] = e.target.value;
                                setEditForm({...editForm, options: newOpts});
                              }} style={{ flexGrow: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                            </div>
                          ))}

                          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Correct Answer (A, B, C, D)</label>
                          <select value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                            {optionLetters.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>

                          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Explanation</label>
                          <textarea value={editForm.explanation} onChange={e => setEditForm({...editForm, explanation: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', color: 'var(--text-primary)', width: '100%', minHeight: '60px', resize: 'vertical' }} />
                          
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => {
                              if (result && editForm.question.trim() === '' && editForm.options.every(o => o.trim() === '')) {
                                const newQs = [...result.questions];
                                newQs.splice(idx, 1);
                                setResult({ ...result, questions: newQs, num_questions: newQs.length });
                              }
                              setEditingIndex(null); 
                              setEditForm(null); 
                            }} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => {
                              if (result) {
                                const newQs = [...result.questions];
                                newQs[idx] = editForm;
                                setResult({ ...result, questions: newQs });
                                setEditingIndex(null);
                                setEditForm(null);
                              }
                            }} style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const selected = selectedOptions[idx];
                  const revealed = revealedAnswers[idx];
                  const isCorrect = selected === q.answer;
                  return (
                    <div key={idx} style={{ background: 'var(--bg-panel)', border: `1px solid ${revealed && selected ? (isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : 'var(--border-glass)'}`, borderRadius: 'var(--radius-md)', padding: '20px', transition: 'border-color 0.2s' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#C68A3D,#E3B36B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, flexGrow: 1 }}>{q.question}</p>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button onClick={() => { setEditingIndex(idx); setEditForm(q); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Edit Question">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteQuestion(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Delete Question">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '40px', marginBottom: '12px' }}>
                        {q.options.map((opt, oIdx) => {
                          const letter = optionLetters[oIdx];
                          const isSelected = selected === letter;
                          const isCorrectOpt = q.answer === letter;
                          let bg = 'var(--bg-card)', border = 'var(--border-glass)', color = 'var(--text-primary)';
                          if (revealed) {
                            if (isCorrectOpt) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.4)'; color = '#065F46'; }
                            else if (isSelected) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; color = '#991B1B'; }
                          } else if (isSelected) { bg = 'rgba(198,138,61,0.08)'; border = 'var(--color-primary)'; color = 'var(--color-primary)'; }
                          return (
                            <button key={oIdx} onClick={() => selectOption(idx, letter)} disabled={revealed}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: bg, border: `1.5px solid ${border}`, borderRadius: 'var(--radius-sm)', cursor: revealed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', color, fontWeight: isSelected || (revealed && isCorrectOpt) ? 700 : 500, fontSize: '0.87rem' }}>
                              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: revealed && isCorrectOpt ? '#10B981' : (revealed && isSelected ? '#EF4444' : 'rgba(198,138,61,0.1)'), color: (revealed && (isCorrectOpt || isSelected)) ? 'white' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0 }}>{letter}</span>
                              {opt}
                              {revealed && isCorrectOpt && <CheckCircle2 size={16} style={{ marginLeft: 'auto', color: '#10B981' }} />}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ paddingLeft: '40px' }}>
                        {!revealed ? (
                          <button onClick={() => toggleReveal(idx)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}>
                            <ChevronDown size={14} /> Show Answer
                          </button>
                        ) : (
                          <div>
                            <button onClick={() => toggleReveal(idx)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0 0 8px 0' }}>
                              <ChevronUp size={14} /> Hide Answer
                            </button>
                            {q.explanation && (
                              <div style={{ background: 'rgba(198,138,61,0.05)', border: '1px solid rgba(198,138,61,0.12)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>✓ Answer: {q.answer} &nbsp;|&nbsp;</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button onClick={handleAddQuestion} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(198,138,61,0.08)', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                  <Plus size={18} /> Add New Question
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-glass)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)', flexShrink: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {result ? `${result.num_questions} questions · ${chapterName}` : `Topic: ${topicName}`}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {result && (
              <>
                <button onClick={handleSaveAssessment} disabled={saving || saveSuccess} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: saveSuccess ? 'rgba(16,185,129,0.1)' : 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: saveSuccess ? '#059669' : 'white', fontSize: '0.85rem', fontWeight: 600, cursor: (saving || saveSuccess) ? 'default' : 'pointer' }}>
                  {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : saveSuccess ? <Check size={15} /> : <Save size={15} />}
                  {saving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <Printer size={15} /> Print
                </button>
                <button onClick={() => { setResult(null); setError(null); setRevealedAnswers({}); setSelectedOptions({}); setEditingIndex(null); setEditForm(null); setSaveSuccess(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <RefreshCw size={15} /> Regenerate
                </button>
              </>
            )}
            {!result && !loading && (
              <button onClick={onClose} style={{ padding: '9px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
            {!result && (
              <button onClick={handleGenerate} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 22px', background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg,#C68A3D,#E3B36B)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(198,138,61,0.35)' }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={16} /> Generate {numQuestions} MCQs</>}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
};
