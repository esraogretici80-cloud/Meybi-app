import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getTopic, getSubjectName } from '../data/curriculum'
import { generateLessonPlan, getFallbackLessonPlan, LessonPlan, LessonSection } from '../services/ai'
import { speak, stop, pause, resume, isTTSAvailable, initTTS, getVoicesInfo } from '../services/tts'
import DigitalBoard from '../components/DigitalBoard'
import { useProgress } from '../hooks/useProgress'

export default function Lesson() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { addEntry } = useProgress()

  const grade = Number(params.get('grade') || 6)
  const subjectId = params.get('subject') || 'matematik'
  const topicId = params.get('topic') || ''
  const mode = (params.get('mode') as 'kitapsiz' | 'kitapli') || 'kitapsiz'
  const level = (params.get('level') as 'basit' | 'orta' | 'ileri') || 'orta'

  const topic = getTopic(grade, subjectId, topicId)
  const subjectName = getSubjectName(subjectId)

  const [plan, setPlan] = useState<LessonPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [answered, setAnswered] = useState<Record<number, { selected: number | string; correct: boolean }>>({})
  const [ttsRate, setTtsRate] = useState(0.95)
  const [speaking, setSpeaking] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    initTTS()
  }, [])

  const loadPlan = useCallback(async () => {
    if (!topic) {
      setError('Konu bulunamadı.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setUsingFallback(false)

    try {
      const p = await generateLessonPlan({
        grade,
        subject: subjectName,
        topicTitle: topic.title,
        goals: topic.goals,
        mode,
        level
      })
      setPlan(p)
    } catch (e: any) {
      console.warn('AI plan hatası, fallback kullanılıyor:', e.message)
      const fb = getFallbackLessonPlan({
        grade,
        subject: subjectName,
        topicTitle: topic.title,
        goals: topic.goals
      })
      setPlan(fb)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }, [grade, subjectName, topic, mode, level])

  useEffect(() => {
    loadPlan()
    return () => stop()
  }, [loadPlan])

  const section: LessonSection | undefined = plan?.sections[stepIndex]
  const isLast = plan ? stepIndex >= plan.sections.length - 1 : false

  const handleSpeak = () => {
    if (!section) return
    const text = [
      section.title,
      section.content,
      section.question?.text
    ].filter(Boolean).join('. ')
    setSpeaking(true)
    speak(text, {
      rate: ttsRate,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    })
  }

  const handleAnswer = (selected: number | string, correct: boolean) => {
    if (answered[stepIndex]) return
    setAnswered(prev => ({ ...prev, [stepIndex]: { selected, correct } }))
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1
    }))
  }

  const next = () => {
    stop()
    setSpeaking(false)
    if (isLast) {
      // Ders bitti
      if (topic) {
        addEntry({
          grade,
          subject: subjectName,
          topicId: topic.id,
          topicTitle: topic.title,
          completedAt: new Date().toISOString(),
          score: score.correct,
          totalQuestions: score.total || undefined
        })
      }
      navigate('/progress')
    } else {
      setStepIndex(i => i + 1)
    }
  }

  const prev = () => {
    stop()
    setSpeaking(false)
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  if (!topic) {
    return (
      <div className="loading-center">
        <p>Konu bulunamadı.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Ana sayfaya dön</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Öğretmen ders planını hazırlıyor…</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="loading-center">
        <p>{error || 'Ders yüklenemedi.'}</p>
        <button className="btn btn-primary" onClick={loadPlan}>Tekrar dene</button>
        <button className="btn btn-secondary mt-1" onClick={() => navigate('/')}>Ana sayfa</button>
      </div>
    )
  }

  const ans = answered[stepIndex]
  const q = section?.question

  return (
    <div>
      {/* Üst bilgi */}
      <div className="flex-between mb-2">
        <button className="btn btn-ghost btn-sm" onClick={() => { stop(); navigate('/') }}>
          ← Çık
        </button>
        <span className="badge">
          {stepIndex + 1} / {plan.sections.length}
        </span>
      </div>

      <h2 className="mb-1">{plan.topicTitle}</h2>
      <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
        {grade}. sınıf · {subjectName}
        {usingFallback && ' · Örnek içerik (AI bağlantısı yok)'}
      </p>

      {usingFallback && (
        <div className="feedback error mb-2" style={{ fontSize: '0.85rem' }}>
          Gerçek AI yanıtı alınamadı. Aşağıdaki içerik yerel örnek anlatımdır.
          Cloudflare Worker + Gemini API anahtarı yapılandırıldığında gerçek öğretmen anlatımı üretilir.
        </div>
      )}

      {/* İlerleme çubuğu */}
      <div className="progress-bar mb-2">
        <div
          className="progress-fill"
          style={{ width: `${((stepIndex + 1) / plan.sections.length) * 100}%` }}
        />
      </div>

      {/* Bölüm */}
      {section && (
        <div className="lesson-step">
          {section.title && <h3 className="mb-1">{section.title}</h3>}

          <div className="teacher-bubble">
            {section.content.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: line ? 8 : 0 }}>
                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            ))}
          </div>

          {(section.type === 'visual' || section.visualHint) && (
            <DigitalBoard
              hint={section.visualHint}
              topicId={topicId}
              title={section.title}
            />
          )}

          {/* Soru */}
          {q && (
            <div className="question-card">
              <p style={{ fontWeight: 600, marginBottom: 12 }}>{q.text}</p>

              {q.options ? (
                q.options.map((opt, idx) => {
                  let cls = 'option-btn'
                  if (ans) {
                    if (idx === q.correctIndex) cls += ' correct'
                    else if (ans.selected === idx) cls += ' wrong'
                  }
                  return (
                    <button
                      key={idx}
                      className={cls}
                      disabled={!!ans}
                      onClick={() => handleAnswer(idx, idx === q.correctIndex)}
                    >
                      {String.fromCharCode(65 + idx)}) {opt}
                    </button>
                  )
                })
              ) : (
                <ShortAnswer
                  disabled={!!ans}
                  onSubmit={(val) => {
                    const correct =
                      val.trim().toLowerCase() === (q.correctAnswer || '').toLowerCase()
                    handleAnswer(val, correct)
                  }}
                />
              )}

              {ans && (
                <div className={`feedback ${ans.correct ? 'success' : 'error'}`}>
                  {ans.correct ? '✅ Doğru!' : '❌ Bu sefer olmadı.'}
                  <div style={{ marginTop: 6 }}>{q.explanation}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TTS kontrolleri */}
      {isTTSAvailable() && (
        <div className="card mb-2" style={{ padding: 12 }}>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            {!speaking ? (
              <button className="btn btn-secondary btn-sm" onClick={handleSpeak}>
                🔊 Sesli oku
              </button>
            ) : (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => { pause() }}>
                  ⏸ Duraklat
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { resume() }}>
                  ▶ Devam
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { stop(); setSpeaking(false) }}>
                  ⏹ Durdur
                </button>
              </>
            )}
            <select
              className="select"
              style={{ width: 'auto', minHeight: 40, padding: '6px 10px' }}
              value={ttsRate}
              onChange={e => setTtsRate(Number(e.target.value))}
            >
              <option value={0.8}>Yavaş</option>
              <option value={0.95}>Normal</option>
              <option value={1.15}>Hızlı</option>
            </select>
          </div>
          <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
            {getVoicesInfo()}
          </p>
        </div>
      )}

      {/* Navigasyon */}
      <div className="flex gap-2 mt-2">
        <button className="btn btn-secondary" onClick={prev} disabled={stepIndex === 0}>
          ← Önceki
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={next}
          disabled={!!q && !ans}
        >
          {isLast ? 'Bitir & Kaydet' : 'Sonraki →'}
        </button>
      </div>

      {plan.sourcesNote && (
        <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
          {plan.sourcesNote}
        </p>
      )}
    </div>
  )
}

function ShortAnswer({
  disabled,
  onSubmit
}: {
  disabled: boolean
  onSubmit: (v: string) => void
}) {
  const [val, setVal] = useState('')
  return (
    <div>
      <input
        className="input mb-1"
        placeholder="Cevabını yaz…"
        value={val}
        disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onSubmit(val)}
      />
      <button
        className="btn btn-primary btn-sm"
        disabled={disabled || !val.trim()}
        onClick={() => onSubmit(val)}
      >
        Gönder
      </button>
    </div>
  )
}
